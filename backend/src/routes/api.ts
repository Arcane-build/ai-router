import { Router, Request, Response } from 'express';
import { MODEL_CONFIG, getAllCategories, getModelsForCategory, getModel } from '../config/models';
import { generateContent } from '../services/falAI';
import { processWithGemini } from '../services/geminiService';
import { selectBestModel } from '../services/modelSelector';
import { selectBestModelWithAI } from '../services/aiModelSelector';
import { authenticateUser } from '../middleware/auth';
import { checkCredits, getCreditCost } from '../middleware/credits';
import { deductCredits, getUserById, createUser, getUserByEmail } from '../services/userService';
import { sendWaitlistConfirmation } from '../services/emailService';
import { addToWaitlist, markEmailSent } from '../services/waitlistService';
import { fal } from '@fal-ai/client';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

/**
 * GET /api/tools
 * Get all tool categories and their models
 */
router.get('/tools', (req: Request, res: Response) => {
  try {
    const categories = getAllCategories();
    const tools = categories.map(category => {
      const creditCost = getCreditCost(category);
      return {
        category,
        models: getModelsForCategory(category).map(model => ({
          name: model.name,
          logo: model.logo,
          pros: model.pros,
          cons: model.cons,
          credits: creditCost,
          description: model.pros[0] || "AI model for content generation"
        }))
      };
    });

    res.json({
      success: true,
      data: tools
    });
  } catch (error: any) {
    console.error("Error fetching tools:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch tools"
    });
  }
});

/**
 * GET /api/tools/:category
 * Get models for a specific category
 */
router.get('/tools/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const models = getModelsForCategory(category);

    if (models.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Category "${category}" not found`
      });
    }

    const creditCost = getCreditCost(category);

    res.json({
      success: true,
      data: {
        category,
        models: models.map(model => ({
          name: model.name,
          logo: model.logo,
          pros: model.pros,
          cons: model.cons,
          credits: creditCost,
          description: model.pros[0] || "AI model for content generation"
        }))
      }
    });
  } catch (error: any) {
    console.error("Error fetching category tools:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch category tools"
    });
  }
});

/**
 * POST /api/generate
 * Generate content using selected model
 * Body: { category: string, model: string, prompt: string, additionalParams?: object }
 * Requires: Authentication and sufficient credits
 */
router.post('/generate', authenticateUser, checkCredits, async (req: Request, res: Response) => {
  try {
    const { category, model, prompt, additionalParams } = req.body;

    // Validate required fields
    if (!category || !model || !prompt) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: category, model, and prompt are required"
      });
    }

    // Get model configuration
    const modelConfig = getModel(category, model);
    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model "${model}" not found in category "${category}"`
      });
    }

    // Get credit cost (set by checkCredits middleware)
    const creditCost = (req as any).creditCost;
    const userId = req.user!.id;

    // Generate content
    const result = await generateContent(modelConfig, prompt, additionalParams);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Generation failed"
      });
    }

    // Deduct credits after successful generation
    const creditDeduction = await deductCredits(userId, creditCost);
    if (!creditDeduction.success) {
      // This shouldn't happen since we checked credits before, but handle it anyway
      console.error('Failed to deduct credits after generation:', creditDeduction);
    }

    // Return result with updated credits
    res.json({
      success: true,
      data: result.data,
      cost: result.cost,
      requestId: result.requestId,
      model: modelConfig.name,
      category: category,
      creditsUsed: creditCost,
      remainingCredits: creditDeduction.user?.credits || 0
    });
  } catch (error: any) {
    console.error("Error generating content:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate content"
    });
  }
});

/**
 * GET /api/user/profile
 * Get current user profile with credits
 * Requires: Authentication middleware
 */
router.get('/user/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    // User is already attached by authenticateUser middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Get full user data
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: String((user as any)._id),
          email: user.email,
          credits: user.credits,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user profile',
    });
  }
});

/**
 * POST /api/process
 * Process prompt and images with Gemini or fal.ai
 * Body: { prompt: string, images?: string[] }
 * Public endpoint for demo
 */
router.post('/process', async (req: Request, res: Response) => {
  console.log('Received process request:', { 
    prompt: req.body.prompt?.substring(0, 50), 
    hasImages: !!req.body.images,
    category: req.body.category,
    model: req.body.model
  });
  try {
    const { prompt, images, category, model, additionalParams } = req.body;
    
    const startTime = Date.now();

    // If images are provided, always use Gemini (multimodal)
    if (images && Array.isArray(images) && images.length > 0) {
      const apiKey = process.env.GEMINI_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: 'GEMINI_KEY not configured in environment',
        });
      }

      console.log(`Processing with Gemini SDK (gemini-2.5-flash)`);
      const result = await processWithGemini(prompt || '', images || [], apiKey);
      return res.json({
        ...result,
        reasoning: 'Images detected - using multimodal Gemini model for image understanding',
        selectedModel: 'Gemini 2.5 Flash'
      });
    }

    // If category+model are provided, route through OpenRouter via fal, or fal-ai models
    if (category && model) {
      const modelConfig = getModel(String(category), String(model));
      if (!modelConfig) {
        return res.status(404).json({
          success: false,
          error: `Model "${model}" not found in category "${category}"`,
        });
      }

      const generation = await generateContent(modelConfig, prompt || '', additionalParams);
      if (!generation.success) {
        return res.status(500).json({
          success: false,
          error: generation.error || 'Failed to process request',
        });
      }

      const elapsedTime = (Date.now() - startTime) / 1000;

      // Check if this is an image generation result
      const data: any = generation.data;
      const isImageGeneration = data?.images && Array.isArray(data.images) && data.images.length > 0;

      // Normalize output into a string for chat rendering
      let text: string;
      if (isImageGeneration) {
        // For image generation, don't show JSON, just a simple message
        text = `Generated ${data.images.length} image${data.images.length > 1 ? 's' : ''}`;
      } else if (typeof data === 'string') {
        text = data;
      } else if (data?.output && typeof data.output === 'string') {
        text = data.output;
      } else if (data?.data?.output && typeof data.data.output === 'string') {
        text = data.data.output;
      } else if (data?.text && typeof data.text === 'string') {
        text = data.text;
      } else {
        try {
          text = JSON.stringify(data, null, 2);
        } catch {
          text = String(data);
        }
      }

      // Generate reasoning for manual selection
      const pros = modelConfig.pros.join(', ');
      const reasoning = `You selected ${modelConfig.name} from ${category}. ${pros}`;

      return res.json({
        success: true,
        text,
        data,
        elapsedTime,
        model: modelConfig.openRouterModel || modelConfig.falModelId || modelConfig.name,
        category: modelConfig ? String(category) : undefined,
        selectedModel: modelConfig.name,
        reasoning: reasoning,
        requestId: generation.requestId,
        cost: generation.cost,
        hasImages: isImageGeneration,
      });
    }

    // Auto-select best model using AI analysis
    const apiKey = process.env.GEMINI_KEY;
    const selection = apiKey 
      ? await selectBestModelWithAI(prompt || '', false, apiKey)
      : selectBestModel(prompt || '', false);
    
    console.log(`Auto-selected model: ${selection.model.name} (${selection.category})`);
    console.log(`Reasoning: ${selection.reasoning}`);
    

    const modelConfig = selection.model;
    const generation = await generateContent(modelConfig, prompt || '', additionalParams);
    
    if (!generation.success) {
      return res.status(500).json({
        success: false,
        error: generation.error || 'Failed to process request',
        reasoning: selection.reasoning || 'Failed to generate content',
      });
    }

    const elapsedTime = (Date.now() - startTime) / 1000;

    // Normalize output into a string for chat rendering
    const data: any = generation.data;
    const isImageGeneration = data?.images && Array.isArray(data.images) && data.images.length > 0;
    
    let text: string;
    if (isImageGeneration) {
      // For image generation, don't show JSON, just a simple message
      text = `Generated ${data.images.length} image${data.images.length > 1 ? 's' : ''}`;
    } else if (typeof data === 'string') {
      text = data;
    } else if (data?.output && typeof data.output === 'string') {
      text = data.output;
    } else if (data?.data?.output && typeof data.data.output === 'string') {
      text = data.data.output;
    } else if (data?.text && typeof data.text === 'string') {
      text = data.text;
    } else {
      try {
        text = JSON.stringify(data, null, 2);
      } catch {
        text = String(data);
      }
    }

    // Use AI reasoning if available, otherwise use rule-based reasoning
    const reasoning = selection.reasoning || `Selected ${modelConfig.name} from ${selection.category} category`;

    return res.json({
      success: true,
      text,
      data,
      elapsedTime,
      model: modelConfig.openRouterModel || modelConfig.falModelId || modelConfig.name,
      category: selection.category,
      selectedModel: modelConfig.name,
      reasoning: reasoning,
      confidence: selection.confidence,
      requestId: generation.requestId,
      cost: generation.cost,
      hasImages: isImageGeneration,
    });
  } catch (error: any) {
    console.error('Process endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process request',
    });
  }
});

/**
 * POST /api/waitlist
 * Join the waitlist - saves user to database
 * Body: { email: string, name?: string }
 */
router.post('/waitlist', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'Email already registered!',
        isExisting: true,
      });
    }

    // Create new user in database
    const newUser = await createUser(email);

    console.log(`✅ User registered: ${email} (ID: ${String((newUser as any)._id)}) | Credits: ${newUser.credits}`);
    
    return res.json({
      success: true,
      message: 'Successfully registered! You can now log in.',
      isExisting: false,
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
});

export default router;

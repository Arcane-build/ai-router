import { Router, Request, Response } from 'express';
import { MODEL_CONFIG, getAllCategories, getModelsForCategory, getModel } from '../config/models';
import { generateContent } from '../services/falAI';
import { authenticateUser } from '../middleware/auth';
import { checkCredits, getCreditCost } from '../middleware/credits';
import { deductCredits, getUserById, createUser, getUserByEmail } from '../services/userService';

const router = Router();

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
          id: user._id.toString(),
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

    console.log(`✅ User registered: ${email} (ID: ${newUser._id}) | Credits: ${newUser.credits}`);
    
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

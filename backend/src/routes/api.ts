import { Router, Request, Response } from 'express';
import { MODEL_CONFIG, getAllCategories, getModelsForCategory, getModel } from '../config/models';
import { generateContent } from '../services/falAI';

const router = Router();

/**
 * GET /api/tools
 * Get all tool categories and their models
 */
router.get('/tools', (req: Request, res: Response) => {
  try {
    const categories = getAllCategories();
    const tools = categories.map(category => ({
      category,
      models: getModelsForCategory(category).map(model => ({
        name: model.name,
        logo: model.logo,
        pros: model.pros,
        cons: model.cons,
        pricePerToken: model.pricePerToken,
        price: `$${model.pricePerToken.toFixed(4)}`, // Format for display
        description: model.pros[0] || "AI model for content generation"
      }))
    }));

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

    res.json({
      success: true,
      data: {
        category,
        models: models.map(model => ({
          name: model.name,
          logo: model.logo,
          pros: model.pros,
          cons: model.cons,
          pricePerToken: model.pricePerToken,
          price: `$${model.pricePerToken.toFixed(4)}`,
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
 */
router.post('/generate', async (req: Request, res: Response) => {
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

    // Generate content
    const result = await generateContent(modelConfig, prompt, additionalParams);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Generation failed"
      });
    }

    // Return result
    res.json({
      success: true,
      data: result.data,
      cost: result.cost,
      requestId: result.requestId,
      model: modelConfig.name,
      category: category
    });
  } catch (error: any) {
    console.error("Error generating content:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate content"
    });
  }
});

export default router;

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModelConfig, getAllCategories, getModelsForCategory } from '../config/models';
import { selectBestModel, ModelSelection } from './modelSelector';

export interface AIModelSelection extends ModelSelection {
  // AI reasoning is merged into reasoning field
}

/**
 * Use AI to analyze prompt and select the best model with reasoning
 */
export async function selectBestModelWithAI(
  prompt: string,
  hasImages: boolean = false,
  geminiApiKey?: string
): Promise<AIModelSelection> {

  const ruleBasedSelection = selectBestModel(prompt, hasImages);

  if (!geminiApiKey) {
    return ruleBasedSelection;
  }

  try {
    // Use Gemini to analyze the prompt and suggest the best model
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Get all available models
    const categories = getAllCategories();
    const allModels: Array<{ category: string; name: string; pros: string[] }> = [];
    categories.forEach(category => {
      const models = getModelsForCategory(category);
      models.forEach(m => {
        allModels.push({
          category,
          name: m.name,
          pros: m.pros
        });
      });
    });

    const analysisPrompt = `You are an AI model selection expert. Analyze the following user prompt and recommend the best AI model to use.

User Prompt: "${prompt}"

Available Models:
${allModels.map(m => `- ${m.name} (${m.category}): ${m.pros.join(', ')}`).join('\n')}

${hasImages ? 'Note: The user has provided images, so multimodal capability is required.' : ''}

Respond in JSON format with:
{
  "recommendedModel": "model name",
  "recommendedCategory": "category name",
  "reasoning": "brief explanation of why this model is best for this specific prompt"
}

Be concise and specific. Focus on the prompt's requirements.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    let aiRecommendation: any = null;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiRecommendation = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI recommendation:', e);
    }

    // If AI recommendation is valid and matches an available model, use it
    if (aiRecommendation?.recommendedModel && aiRecommendation?.recommendedCategory) {
      const recommendedCategory = aiRecommendation.recommendedCategory;
      const recommendedModelName = aiRecommendation.recommendedModel;
      
      const models = getModelsForCategory(recommendedCategory);
      const selectedModel = models.find(m => 
        m.name.toLowerCase() === recommendedModelName.toLowerCase() ||
        m.name.toLowerCase().includes(recommendedModelName.toLowerCase())
      );

      if (selectedModel) {
        return {
          category: recommendedCategory,
          model: selectedModel,
          reasoning: aiRecommendation.reasoning || ruleBasedSelection.reasoning,
          confidence: 0.95 // High confidence when AI recommends
        };
      }
    }

    // Fallback to rule-based selection but include AI reasoning if available
    return {
      ...ruleBasedSelection,
      reasoning: aiRecommendation?.reasoning || ruleBasedSelection.reasoning
    };
  } catch (error: any) {
    console.error('AI model selection error:', error);
    // Fallback to rule-based selection
    return ruleBasedSelection;
  }
}


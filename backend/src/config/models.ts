export interface ModelConfig {
  name: string;
  falModelId: string;
  logo: string;
  pros: string[];
  cons: string[];
  pricePerToken: number;
  // For OpenRouter models, we need the model name separately
  openRouterModel?: string;
  // Model type to determine which API endpoint to use
  modelType: 'openrouter' | 'fal-ai';
}

export interface ToolCategory {
  category: string;
  models: ModelConfig[];
}

export const MODEL_CONFIG: Record<string, ToolCategory> = {
  "Text Generation": {
    category: "Text Generation",
    models: [
      {
        name: "Claude",
        falModelId: "openrouter/router",
        openRouterModel: "anthropic/claude-sonnet-4.5",
        logo: "🤖",
        pros: ["Best for reasoning and analysis", "High quality responses"],
        cons: ["Slower response time", "Higher cost"],
        pricePerToken: 0.00015,
        modelType: 'openrouter'
      },
      {
        name: "ChatGPT",
        falModelId: "openrouter/router",
        openRouterModel: "openai/gpt-4.1",
        logo: "💬",
        pros: ["Great for conversations and creativity", "Fast responses"],
        cons: ["May lack depth in complex topics"],
        pricePerToken: 0.00010,
        modelType: 'openrouter'
      },
      {
        name: "DeepSeek",
        falModelId: "openrouter/router",
        openRouterModel: "google/gemini-2.5-flash", // Using Gemini as placeholder since DeepSeek not provided
        logo: "🔍",
        pros: ["Efficient for coding tasks", "Fast and cost-effective"],
        cons: ["Less creative than others"],
        pricePerToken: 0.00008,
        modelType: 'openrouter'
      }
    ]
  },
  "Image Creation": {
    category: "Image Creation",
    models: [
      {
        name: "Midjourney",
        falModelId: "fal-ai/stable-diffusion-v35-medium",
        logo: "🎨",
        pros: ["Artistic and creative images", "High quality output"],
        cons: ["Slower generation time"],
        pricePerToken: 0.00025,
        modelType: 'fal-ai'
      },
      {
        name: "Ideogram",
        falModelId: "fal-ai/ideogram/v3",
        logo: "🖼️",
        pros: ["Text and logo generation", "Good text rendering"],
        cons: ["Limited to specific use cases"],
        pricePerToken: 0.00020,
        modelType: 'fal-ai'
      },
      {
        name: "Nano Banana Pro",
        falModelId: "fal-ai/nano-banana-pro",
        logo: "🍌",
        pros: ["Fast and reliable generation", "Good quality"],
        cons: ["Fewer customization options"],
        pricePerToken: 0.00018,
        modelType: 'fal-ai'
      }
    ]
  },
  "Video Creation": {
    category: "Video Creation",
    models: [
      {
        name: "Pika",
        falModelId: "fal-ai/pika/v2.2/text-to-video",
        logo: "🎥",
        pros: ["Quick video clips", "Good quality"],
        cons: ["Limited duration"],
        pricePerToken: 0.00180,
        modelType: 'fal-ai'
      },
      {
        name: "Sora",
        falModelId: "fal-ai/sora-2/text-to-video",
        logo: "🌟",
        pros: ["High-quality cinematic videos", "Best quality"],
        cons: ["Higher cost", "Longer generation time"],
        pricePerToken: 0.00320,
        modelType: 'fal-ai'
      }
    ]
  },
  "Voice Synthesis": {
    category: "Voice Synthesis",
    models: [
      {
        name: "ElevenLabs",
        falModelId: "fal-ai/elevenlabs/tts/multilingual-v2",
        logo: "🎙️",
        pros: ["Natural voice cloning", "High quality audio", "Multilingual support"],
        cons: ["Limited voice options"],
        pricePerToken: 0.00030,
        modelType: 'fal-ai'
      }
    ]
  }
};

// Helper function to get all categories
export function getAllCategories(): string[] {
  return Object.keys(MODEL_CONFIG);
}

// Helper function to get models for a specific category
export function getModelsForCategory(category: string): ModelConfig[] {
  return MODEL_CONFIG[category]?.models || [];
}

// Helper function to get a specific model
export function getModel(category: string, modelName: string): ModelConfig | undefined {
  const models = getModelsForCategory(category);
  return models.find(m => m.name === modelName);
}

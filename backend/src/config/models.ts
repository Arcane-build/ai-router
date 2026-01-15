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
        name: "Flux Pro Ultra",
        falModelId: "fal-ai/flux-pro/v1.1-ultra",
        logo: "✨",
        pros: ["Ultra high quality images", "Excellent detail and realism"],
        cons: ["Slower generation", "Higher resource usage"],
        pricePerToken: 0.00025,
        modelType: 'fal-ai'
      },
      {
        name: "Flux 2",
        falModelId: "fal-ai/flux-2",
        logo: "🌊",
        pros: ["Fast generation", "Good quality", "Balanced performance"],
        cons: ["Standard quality compared to Pro"],
        pricePerToken: 0.00020,
        modelType: 'fal-ai'
      },
      {
        name: "Flux 2 Pro",
        falModelId: "fal-ai/flux-2-pro",
        logo: "🌟",
        pros: ["Professional quality", "High detail", "Excellent realism"],
        cons: ["Slower than standard Flux 2"],
        pricePerToken: 0.00022,
        modelType: 'fal-ai'
      },
      {
        name: "Imagen 4",
        falModelId: "fal-ai/imagen4/preview/fast",
        logo: "🖼️",
        pros: ["Fast generation", "Google quality", "Good for narratives"],
        cons: ["Preview version"],
        pricePerToken: 0.00020,
        modelType: 'fal-ai'
      },
      {
        name: "GPT Image 1.5",
        falModelId: "fal-ai/gpt-image-1.5",
        logo: "🤖",
        pros: ["Realistic photos", "High quality", "Good coordinates support"],
        cons: ["Limited customization"],
        pricePerToken: 0.00021,
        modelType: 'fal-ai'
      },
      {
        name: "Seedream 4.5",
        falModelId: "fal-ai/bytedance/seedream/v4.5/text-to-image",
        logo: "🌱",
        pros: ["Good text rendering", "Creative outputs", "Auto sizing"],
        cons: ["Limited control options"],
        pricePerToken: 0.00019,
        modelType: 'fal-ai'
      },
      {
        name: "Ovis Image",
        falModelId: "fal-ai/ovis-image",
        logo: "🐑",
        pros: ["Creative and artistic", "Good for abstract concepts"],
        cons: ["May be slower"],
        pricePerToken: 0.00020,
        modelType: 'fal-ai'
      },
      {
        name: "ImagineArt 1.5",
        falModelId: "imagineart/imagineart-1.5-preview/text-to-image",
        logo: "🎭",
        pros: ["Artistic style", "Good for portraits", "Fast generation"],
        cons: ["Preview version", "Limited aspect ratios"],
        pricePerToken: 0.00018,
        modelType: 'fal-ai'
      },
      {
        name: "Gemini 3 Pro Image",
        falModelId: "fal-ai/gemini-3-pro-image-preview",
        logo: "💎",
        pros: ["Google quality", "High resolution", "Good detail"],
        cons: ["Preview version"],
        pricePerToken: 0.00022,
        modelType: 'fal-ai'
      },
      {
        name: "Emu 3.5 Image",
        falModelId: "fal-ai/emu-3.5-image/text-to-image",
        logo: "🦘",
        pros: ["High quality", "Good detail", "Meta technology"],
        cons: ["May be slower"],
        pricePerToken: 0.00021,
        modelType: 'fal-ai'
      },
      {
        name: "Piflow",
        falModelId: "fal-ai/piflow",
        logo: "π",
        pros: ["Very fast generation", "Good quality", "Efficient"],
        cons: ["Fewer inference steps"],
        pricePerToken: 0.00017,
        modelType: 'fal-ai'
      },
      {
        name: "Flux Krea",
        falModelId: "fal-ai/flux/krea",
        logo: "🎨",
        pros: ["Artistic style", "Good for street photography", "Natural look"],
        cons: ["Slower with no acceleration"],
        pricePerToken: 0.00020,
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

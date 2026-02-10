import { ModelConfig, MODEL_CONFIG, getAllCategories, getModelsForCategory } from '../config/models';

export interface ModelSelection {
  category: string;
  model: ModelConfig;
  reasoning: string;
  confidence: number;
}

/**
 * Analyze prompt and select the best model
 */
export function selectBestModel(prompt: string, hasImages: boolean = false): ModelSelection {
  const lowerPrompt = prompt.toLowerCase();
  
  // If images are provided, always use Gemini (multimodal)
  if (hasImages) {
    const geminiModel = getModelsForCategory('Text Generation').find(m => 
      m.openRouterModel?.includes('gemini')
    ) || getModelsForCategory('Text Generation')[0];
    
    return {
      category: 'Text Generation',
      model: geminiModel,
      reasoning: 'Images detected - using multimodal model for image understanding',
      confidence: 1.0
    };
  }

  // Analyze prompt intent
  const intent = analyzePromptIntent(lowerPrompt);
  
  // Select category based on intent
  let selectedCategory: string;
  let reasoning: string;
  
  if (intent.isImageGeneration) {
    selectedCategory = 'Image Creation';
    reasoning = 'Prompt requests image generation';
  } else if (intent.isVideoGeneration) {
    selectedCategory = 'Video Creation';
    reasoning = 'Prompt requests video generation';
  } else if (intent.isAudioGeneration || intent.isTTS) {
    selectedCategory = 'Audio Creation';
    reasoning = 'Prompt requests audio or text-to-speech';
  } else if (intent.isCodeGeneration) {
    selectedCategory = 'Text Generation';
    reasoning = 'Prompt involves coding - selecting model optimized for code';
  } else if (intent.isAnalysis || intent.isReasoning) {
    selectedCategory = 'Text Generation';
    reasoning = 'Prompt requires deep analysis or reasoning';
  } else {
    selectedCategory = 'Text Generation';
    reasoning = 'General text generation task';
  }

  // Get models for selected category
  const models = getModelsForCategory(selectedCategory);
  if (models.length === 0) {
    // Fallback to Text Generation
    const fallbackModels = getModelsForCategory('Text Generation');
    return {
      category: 'Text Generation',
      model: fallbackModels[0],
      reasoning: 'No models found for category, using default text generation model',
      confidence: 0.5
    };
  }

  // Select best model within category
  let selectedModel: ModelConfig;
  let modelReasoning: string;
  let confidence = 0.7;

  if (selectedCategory === 'Text Generation') {
    // For code generation, prefer DeepSeek or models good at coding
    if (intent.isCodeGeneration) {
      const codeModel = models.find(m => 
        m.name.toLowerCase().includes('deepseek') || 
        m.pros.some(p => p.toLowerCase().includes('code'))
      );
      if (codeModel) {
        selectedModel = codeModel;
        modelReasoning = 'Selected model optimized for coding tasks';
        confidence = 0.9;
      } else {
        selectedModel = models[0];
        modelReasoning = 'Using available text generation model';
      }
    }
    // For analysis/reasoning, prefer Claude
    else if (intent.isAnalysis || intent.isReasoning) {
      const claudeModel = models.find(m => 
        m.name.toLowerCase().includes('claude') ||
        m.pros.some(p => p.toLowerCase().includes('reasoning') || p.toLowerCase().includes('analysis'))
      );
      if (claudeModel) {
        selectedModel = claudeModel;
        modelReasoning = 'Selected model best for reasoning and analysis';
        confidence = 0.9;
      } else {
        selectedModel = models[0];
        modelReasoning = 'Using available text generation model';
      }
    }
    // For creative/conversational, prefer ChatGPT
    else if (intent.isCreative || intent.isConversational) {
      const chatModel = models.find(m => 
        m.name.toLowerCase().includes('chatgpt') || 
        m.name.toLowerCase().includes('gpt') ||
        m.pros.some(p => p.toLowerCase().includes('creative') || p.toLowerCase().includes('conversation'))
      );
      if (chatModel) {
        selectedModel = chatModel;
        modelReasoning = 'Selected model best for creative and conversational tasks';
        confidence = 0.85;
      } else {
        selectedModel = models[0];
        modelReasoning = 'Using available text generation model';
      }
    }
    // Default to first model
    else {
      selectedModel = models[0];
      modelReasoning = 'Using default text generation model';
    }
  } else {
    // For other categories, use first available model
    selectedModel = models[0];
    modelReasoning = `Using ${selectedCategory} model`;
    confidence = 0.8;
  }

  // Ensure reasoning is never empty
  const finalReasoning = `${reasoning}. ${modelReasoning}.`.trim();
  
  return {
    category: selectedCategory,
    model: selectedModel,
    reasoning: finalReasoning || `Selected ${selectedModel.name} from ${selectedCategory} category`,
    confidence
  };
}

interface PromptIntent {
  isImageGeneration: boolean;
  isVideoGeneration: boolean;
  isAudioGeneration: boolean;
  isTTS: boolean;
  isCodeGeneration: boolean;
  isAnalysis: boolean;
  isReasoning: boolean;
  isCreative: boolean;
  isConversational: boolean;
}

function analyzePromptIntent(prompt: string): PromptIntent {
  const imageKeywords = [
    'generate image', 'create image', 'draw', 'picture', 'photo', 'illustration',
    'visual', 'image of', 'show me', 'make an image', 'design', 'artwork'
  ];
  
  const videoKeywords = [
    'generate video', 'create video', 'video of', 'animate', 'animation',
    'make a video', 'video generation'
  ];
  
  const audioKeywords = [
    'generate audio', 'create audio', 'sound', 'music', 'audio file',
    'make audio', 'audio generation'
  ];
  
  const ttsKeywords = [
    'text to speech', 'tts', 'speak', 'voice', 'narrate', 'read aloud',
    'convert text to speech', 'audio narration'
  ];
  
  const codeKeywords = [
    'code', 'function', 'program', 'script', 'algorithm', 'implement',
    'write code', 'create function', 'python', 'javascript', 'react',
    'component', 'api', 'database', 'sql', 'html', 'css'
  ];
  
  const analysisKeywords = [
    'analyze', 'analysis', 'explain', 'break down', 'evaluate', 'compare',
    'examine', 'review', 'assess', 'interpret', 'understand'
  ];
  
  const reasoningKeywords = [
    'why', 'how', 'reason', 'logic', 'think', 'reasoning', 'solve',
    'problem', 'solution', 'deduce', 'infer'
  ];
  
  const creativeKeywords = [
    'creative', 'story', 'poem', 'write', 'imagine', 'creative writing',
    'narrative', 'fiction', 'tale'
  ];
  
  const conversationalKeywords = [
    'chat', 'talk', 'conversation', 'discuss', 'tell me', 'what is',
    'help me', 'can you', 'how do i'
  ];

  return {
    isImageGeneration: imageKeywords.some(kw => prompt.includes(kw)),
    isVideoGeneration: videoKeywords.some(kw => prompt.includes(kw)),
    isAudioGeneration: audioKeywords.some(kw => prompt.includes(kw)),
    isTTS: ttsKeywords.some(kw => prompt.includes(kw)),
    isCodeGeneration: codeKeywords.some(kw => prompt.includes(kw)),
    isAnalysis: analysisKeywords.some(kw => prompt.includes(kw)),
    isReasoning: reasoningKeywords.some(kw => prompt.includes(kw)),
    isCreative: creativeKeywords.some(kw => prompt.includes(kw)),
    isConversational: conversationalKeywords.some(kw => prompt.includes(kw))
  };
}


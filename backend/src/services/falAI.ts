import { fal } from "@fal-ai/client";
import { ModelConfig } from "../config/models";

// Initialize Fal client - will be configured when first used
let falClientInitialized = false;

function initializeFalClient() {
  if (falClientInitialized) return;
  
  // Fal AI expects FAL_KEY environment variable, but we're using FAL_API_KEY
  // So we'll check both
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY || "";

  if (!falKey) {
    console.warn("⚠️  FAL_KEY or FAL_API_KEY not found in environment variables");
  } else {
    fal.config({
      credentials: falKey,
    });
    console.log("✅ Fal AI client configured");
    falClientInitialized = true;
  }
}

export interface GenerationResult {
  success: boolean;
  data?: any;
  error?: string;
  cost?: number;
  requestId?: string;
}

/**
 * Generate content using Fal AI
 */
export async function generateContent(
  modelConfig: ModelConfig,
  prompt: string,
  additionalParams?: Record<string, any>
): Promise<GenerationResult> {
  try {
    // Ensure Fal client is initialized
    initializeFalClient();
    
    let result;

    if (modelConfig.modelType === 'openrouter') {
      // Handle OpenRouter models (text generation)
      result = await generateText(modelConfig, prompt, additionalParams);
    } else {
      // Handle Fal AI models (image, video, voice)
      result = await generateFalAI(modelConfig, prompt, additionalParams);
    }

    // Calculate cost (simplified for MVP - using price per token)
    // For MVP, we'll use a simple calculation based on prompt length
    const estimatedTokens = Math.ceil(prompt.length / 4); // Rough estimate
    const cost = estimatedTokens * modelConfig.pricePerToken;

    // Handle result structure
    // For ElevenLabs TTS, result is { audio: File } where File has url property
    // For other models, result might be wrapped in result.data
    let responseData = result;
    
    // Check if result has data wrapper (for other models)
    if (result && typeof result === 'object' && 'data' in result && !('audio' in result)) {
      responseData = result.data;
    }
    // For ElevenLabs, result.audio is a File object with url property
    // The File object should serialize to { url: "..." } when sent as JSON
    else if (result && typeof result === 'object' && 'audio' in result) {
      // The audio property is a File object, which should have a url property
      // When serialized to JSON, it should become { audio: { url: "..." } }
      responseData = result;
    }

    return {
      success: true,
      data: responseData,
      cost,
      requestId: result?.requestId,
    };
  } catch (error: any) {
    console.error("Generation error:", error);
    
    // Provide more detailed error messages
    let errorMessage = error.message || "Failed to generate content";
    
    if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
      errorMessage = "Authentication failed. Please check your Fal AI API key.";
    } else if (errorMessage.includes("403")) {
      errorMessage = "Access forbidden. Please check your API key permissions.";
    } else if (errorMessage.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate text using OpenRouter
 */
async function generateText(
  modelConfig: ModelConfig,
  prompt: string,
  additionalParams?: Record<string, any>
): Promise<any> {
  try {
    console.log(`📝 Generating text with ${modelConfig.name} (${modelConfig.openRouterModel})`);
    
    // Ensure credentials are set for this request
    initializeFalClient();
    
    const result = await fal.subscribe("openrouter/router", {
      input: {
        prompt,
        model: modelConfig.openRouterModel || modelConfig.falModelId,
        temperature: additionalParams?.temperature || 1,
        ...additionalParams,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log(`✅ Text generation completed`);
    return result;
  } catch (error: any) {
    console.error("❌ Text generation error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    // Re-throw to be caught by the outer handler
    throw error;
  }
}

/**
 * Generate content using Fal AI models (image, video, voice)
 */
async function generateFalAI(
  modelConfig: ModelConfig,
  prompt: string,
  additionalParams?: Record<string, any>
): Promise<any> {
  try {
    console.log(`🎨 Generating with ${modelConfig.name} (${modelConfig.falModelId})`);
    
    // Ensure credentials are set for this request
    initializeFalClient();
    
    // Special handling for ElevenLabs TTS - uses streaming API
    if (modelConfig.falModelId === "fal-ai/elevenlabs/tts/multilingual-v2") {
      return await generateElevenLabsTTS(modelConfig, prompt, additionalParams);
    }

    // Build input based on model type
    const input = buildInputForModel(modelConfig, prompt, additionalParams);

    // For video generation, use subscribe but with better progress tracking
    // Video generation can take 2-5 minutes, so we'll wait but log progress
    const isVideoModel = modelConfig.falModelId.includes('video') || 
                         modelConfig.falModelId.includes('pika') || 
                         modelConfig.falModelId.includes('sora');
    
    let lastStatus = '';
    let progressCount = 0;
    
    const result = await fal.subscribe(modelConfig.falModelId, {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        const status = update.status || '';
        if (status !== lastStatus) {
          console.log(`📊 Status: ${status}`);
          lastStatus = status;
        }
        
        if (status === "IN_PROGRESS") {
          progressCount++;
          // Log every 10th update to avoid spam
          if (progressCount % 10 === 0 || (update.logs && update.logs.length > 0)) {
            if (update.logs && update.logs.length > 0) {
              const latestLog = update.logs[update.logs.length - 1];
              console.log(`  [${progressCount}] ${latestLog.message || 'Processing...'}`);
            } else {
              console.log(`  [${progressCount}] Still processing...`);
            }
          }
        }
      },
    });

    console.log(`✅ Generation completed for ${modelConfig.name}`);
    return result;
  } catch (error: any) {
    console.error("❌ Fal AI generation error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    // Re-throw to be caught by the outer handler
    throw error;
  }
}

/**
 * Generate text-to-speech using ElevenLabs API
 * Using fal.subscribe() instead of fal.stream() to avoid raw audio chunk issues
 */
async function generateElevenLabsTTS(
  modelConfig: ModelConfig,
  prompt: string,
  additionalParams?: Record<string, any>
): Promise<any> {
  try {
    console.log(`🎙️ Generating speech with ${modelConfig.name}`);
    
    // Build input for ElevenLabs TTS
    const input = {
      text: prompt,
      voice: additionalParams?.voice || "Aria",
      stability: additionalParams?.stability || 0.5,
      similarity_boost: additionalParams?.similarity_boost || 0.75,
      speed: additionalParams?.speed || 1,
    };

    console.log(`📝 Input: text="${prompt.substring(0, 50)}...", voice="${input.voice}"`);

    // Use subscribe API instead of stream to get the final result directly
    // This avoids the issue with raw audio chunks being returned
    const result: any = await fal.subscribe("fal-ai/elevenlabs/tts/multilingual-v2", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`📊 Status: ${update.status}`);
        }
      },
    });
    
    console.log(`✅ ElevenLabs TTS generation completed`);
    console.log(`🎵 Result keys:`, Object.keys(result || {}));
    console.log(`🎵 Result.data keys:`, result?.data ? Object.keys(result.data) : 'no data');
    
    // The result from fal.subscribe() is typically wrapped in a data property
    // So it should be result.data.audio or result.audio
    const audioData = result?.data?.audio || result?.audio;
    
    if (audioData) {
      console.log(`🎵 Audio data found`);
      console.log(`🎵 Audio data type:`, typeof audioData);
      console.log(`🎵 Audio data keys:`, Object.keys(audioData || {}));
      
      // File object should have url property
      if (audioData.url) {
        console.log(`🎵 Audio URL: ${audioData.url}`);
        return {
          audio: {
            url: audioData.url
          }
        };
      }
      
      // If it's already in the right format, return it
      return {
        audio: audioData
      };
    }
    
    // Fallback: return the full result structure
    console.log(`🎵 Returning full result structure`);
    return result.data || result;
  } catch (error: any) {
    console.error("❌ ElevenLabs TTS generation error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Build input object based on model type
 */
function buildInputForModel(
  modelConfig: ModelConfig,
  prompt: string,
  additionalParams?: Record<string, any>
): Record<string, any> {
  const baseInput: Record<string, any> = {
    prompt,
    ...additionalParams,
  };

  // Model-specific defaults based on examples provided
  switch (modelConfig.falModelId) {
    case "fal-ai/stable-diffusion-v35-medium": // Midjourney
      return {
        ...baseInput,
        negative_prompt: additionalParams?.negative_prompt || "",
        image_size: additionalParams?.image_size || "landscape_4_3",
        num_inference_steps: additionalParams?.num_inference_steps || 40,
        guidance_scale: additionalParams?.guidance_scale || 4.5,
        num_images: additionalParams?.num_images || 1,
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "jpeg",
      };

    case "fal-ai/ideogram/v3": // Ideogram
      return {
        ...baseInput,
        rendering_speed: additionalParams?.rendering_speed || "BALANCED",
        expand_prompt: additionalParams?.expand_prompt !== false,
        num_images: additionalParams?.num_images || 1,
        image_size: additionalParams?.image_size || "square_hd",
      };

    case "fal-ai/nano-banana-pro": // Nano Banana Pro
      return {
        ...baseInput,
        num_images: additionalParams?.num_images || 1,
        aspect_ratio: additionalParams?.aspect_ratio || "1:1",
        output_format: additionalParams?.output_format || "png",
        resolution: additionalParams?.resolution || "1K",
      };

    case "fal-ai/flux-pro/v1.1-ultra": // Flux Pro Ultra
      return {
        ...baseInput,
        num_images: additionalParams?.num_images || 1,
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "jpeg",
        safety_tolerance: additionalParams?.safety_tolerance || "2",
        image_prompt_strength: additionalParams?.image_prompt_strength || 0.1,
        aspect_ratio: additionalParams?.aspect_ratio || "16:9",
      };

    case "fal-ai/flux-2": // Flux 2
      return {
        ...baseInput,
        guidance_scale: additionalParams?.guidance_scale || 2.5,
        num_inference_steps: additionalParams?.num_inference_steps || 28,
        image_size: additionalParams?.image_size || "landscape_4_3",
        num_images: additionalParams?.num_images || 1,
        acceleration: additionalParams?.acceleration || "regular",
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "png",
      };

    case "fal-ai/flux-2-pro": // Flux 2 Pro
      return {
        ...baseInput,
        image_size: additionalParams?.image_size || "landscape_4_3",
        safety_tolerance: additionalParams?.safety_tolerance || "2",
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "jpeg",
      };

    case "fal-ai/imagen4/preview/fast": // Imagen 4
      return {
        ...baseInput,
        num_images: additionalParams?.num_images || 1,
        aspect_ratio: additionalParams?.aspect_ratio || "1:1",
        output_format: additionalParams?.output_format || "png",
      };

    case "fal-ai/gpt-image-1.5": // GPT Image 1.5
      return {
        ...baseInput,
        image_size: additionalParams?.image_size || "1024x1024",
        background: additionalParams?.background || "auto",
        quality: additionalParams?.quality || "high",
        num_images: additionalParams?.num_images || 1,
        output_format: additionalParams?.output_format || "png",
      };

    case "fal-ai/bytedance/seedream/v4.5/text-to-image": // Seedream 4.5
      return {
        ...baseInput,
        image_size: additionalParams?.image_size || "auto_2K",
        num_images: additionalParams?.num_images || 1,
        max_images: additionalParams?.max_images || 1,
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
      };

    case "fal-ai/ovis-image": // Ovis Image
      return {
        ...baseInput,
        image_size: additionalParams?.image_size || "landscape_4_3",
        num_inference_steps: additionalParams?.num_inference_steps || 28,
        guidance_scale: additionalParams?.guidance_scale || 5,
        num_images: additionalParams?.num_images || 1,
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "png",
        acceleration: additionalParams?.acceleration || "regular",
      };

    case "imagineart/imagineart-1.5-preview/text-to-image": // ImagineArt 1.5
      return {
        ...baseInput,
        aspect_ratio: additionalParams?.aspect_ratio || "1:1",
        seed: additionalParams?.seed !== undefined ? additionalParams.seed : 0,
      };

    case "fal-ai/gemini-3-pro-image-preview": // Gemini 3 Pro Image
      return {
        ...baseInput,
        num_images: additionalParams?.num_images || 1,
        aspect_ratio: additionalParams?.aspect_ratio || "1:1",
        output_format: additionalParams?.output_format || "png",
        resolution: additionalParams?.resolution || "1K",
      };

    case "fal-ai/emu-3.5-image/text-to-image": // Emu 3.5 Image
      return {
        ...baseInput,
        resolution: additionalParams?.resolution || "720p",
        aspect_ratio: additionalParams?.aspect_ratio || "1:1",
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "png",
      };

    case "fal-ai/piflow": // Piflow
      return {
        ...baseInput,
        image_size: additionalParams?.image_size || "square_hd",
        num_inference_steps: additionalParams?.num_inference_steps || 8,
        num_images: additionalParams?.num_images || 1,
        output_format: additionalParams?.output_format || "jpeg",
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
      };

    case "fal-ai/flux/krea": // Flux Krea
      return {
        ...baseInput,
        image_size: additionalParams?.image_size || "landscape_4_3",
        num_inference_steps: additionalParams?.num_inference_steps || 28,
        guidance_scale: additionalParams?.guidance_scale || 4.5,
        num_images: additionalParams?.num_images || 1,
        enable_safety_checker: additionalParams?.enable_safety_checker !== false,
        output_format: additionalParams?.output_format || "jpeg",
        acceleration: additionalParams?.acceleration || "none",
      };

    case "fal-ai/pika/v2.2/text-to-video": // Pika
      return {
        ...baseInput,
        negative_prompt: additionalParams?.negative_prompt || "ugly, bad, terrible",
        aspect_ratio: additionalParams?.aspect_ratio || "16:9",
        resolution: additionalParams?.resolution || "1080p",
        duration: additionalParams?.duration || 5,
      };

    case "fal-ai/sora-2/text-to-video": // Sora
      return {
        ...baseInput,
        resolution: additionalParams?.resolution || "720p",
        aspect_ratio: additionalParams?.aspect_ratio || "16:9",
        duration: additionalParams?.duration || 4,
        delete_video: additionalParams?.delete_video !== false,
      };

    case "fal-ai/elevenlabs/tts/multilingual-v2": // ElevenLabs TTS
      // This case is handled separately in generateElevenLabsTTS
      // But we'll keep a fallback structure here
      return {
        text: prompt,
        voice: additionalParams?.voice || "Aria",
        stability: additionalParams?.stability || 0.5,
        similarity_boost: additionalParams?.similarity_boost || 0.75,
        speed: additionalParams?.speed || 1,
      };

    default:
      return baseInput;
  }
}

/**
 * Stream text generation (for real-time responses)
 */
export async function streamText(
  modelConfig: ModelConfig,
  prompt: string,
  additionalParams?: Record<string, any>
): Promise<AsyncIterable<any>> {
  if (modelConfig.modelType !== 'openrouter') {
    throw new Error("Streaming only supported for OpenRouter models");
  }

  const stream = await fal.stream("openrouter/router", {
    input: {
      prompt,
      model: modelConfig.openRouterModel || modelConfig.falModelId,
      temperature: additionalParams?.temperature || 1,
      ...additionalParams,
    },
  });

  return stream;
}

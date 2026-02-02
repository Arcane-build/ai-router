import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processWithGemini(
  prompt: string,
  images: string[] = [],
  apiKey: string
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const parts: any[] = [{ text: prompt || "Analyze this." }];

    for (const base64Data of images) {
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const startTime = Date.now();
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    const elapsedTime = (Date.now() - startTime) / 1000;

    return {
      success: true,
      text,
      elapsedTime,
      model: "gemini-2.5-flash",
      hasImages: images.length > 0
    };
  } catch (error: any) {
    console.error("Gemini SDK error:", error);
    throw error;
  }
}


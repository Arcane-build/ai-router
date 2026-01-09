/**
 * Test script for video generation (Pika)
 * Run with: npx tsx test-video.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { fal } from "@fal-ai/client";

// Initialize Fal client
const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY || "";
if (falKey) {
  fal.config({
    credentials: falKey,
  });
  console.log("✅ Fal AI client configured");
} else {
  console.error("❌ FAL_KEY not found");
  process.exit(1);
}

async function testPikaVideo() {
  console.log('🧪 Testing Pika Video Generation...\n');
  
  try {
    console.log('📝 Sending request to fal-ai/pika/v2.2/text-to-video...');
    console.log('Prompt: "A cat playing piano in a jazz club"');
    
    const result = await fal.subscribe("fal-ai/pika/v2.2/text-to-video", {
      input: {
        prompt: "A cat playing piano in a jazz club",
        negative_prompt: "ugly, bad, terrible",
        aspect_ratio: "16:9",
        resolution: "1080p",
        duration: 5
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log(`📊 Queue status: ${update.status}`);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(msg => console.log(`  → ${msg}`));
        }
      },
    });

    console.log('\n✅ Video generation completed!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.data?.video?.url) {
      console.log(`\n🎥 Video URL: ${result.data.video.url}`);
    } else if (result.data?.url) {
      console.log(`\n🎥 Video URL: ${result.data.url}`);
    } else {
      console.log('\n⚠️  No video URL found in response');
    }
    
  } catch (error: any) {
    console.error('\n❌ Video generation failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

testPikaVideo();

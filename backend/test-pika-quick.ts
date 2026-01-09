/**
 * Quick test for Pika video generation with shorter duration
 * Run with: npx tsx test-pika-quick.ts
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

async function testPikaQuick() {
  console.log('🧪 Testing Pika Video Generation (Quick Test)...\n');
  
  try {
    console.log('📝 Sending request with shorter duration (3 seconds)...');
    
    const startTime = Date.now();
    
    const result = await fal.subscribe("fal-ai/pika/v2.2/text-to-video", {
      input: {
        prompt: "A simple animated logo spinning slowly",
        negative_prompt: "ugly, bad, terrible",
        aspect_ratio: "16:9",
        resolution: "720p", // Lower resolution for faster generation
        duration: 3 // Shorter duration
      },
      logs: true,
      onQueueUpdate: (update) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[${elapsed}s] Status: ${update.status}`);
        if (update.status === "IN_PROGRESS" && update.logs) {
          const latestLog = update.logs[update.logs.length - 1];
          if (latestLog) {
            console.log(`  → ${latestLog.message}`);
          }
        }
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Video generation completed in ${elapsed} seconds!`);
    
    if (result.data?.video?.url) {
      console.log(`\n🎥 Video URL: ${result.data.video.url}`);
    } else if (result.data?.url) {
      console.log(`\n🎥 Video URL: ${result.data.url}`);
    } else {
      console.log('\n⚠️  Response structure:', JSON.stringify(result, null, 2).substring(0, 500));
    }
    
  } catch (error: any) {
    console.error('\n❌ Video generation failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2).substring(0, 500));
    }
  }
}

// Set a timeout for the entire test (5 minutes)
const timeout = setTimeout(() => {
  console.log('\n⏱️  Test timed out after 5 minutes');
  process.exit(1);
}, 300000);

testPikaQuick()
  .then(() => {
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('Test failed:', error);
    process.exit(1);
  });

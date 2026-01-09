/**
 * Simple test to verify Fal AI client initialization
 * Run with: npx tsx test-simple.ts
 */

import dotenv from 'dotenv';
dotenv.config();

async function testFalAI() {
  console.log('🧪 Testing Fal AI Client Setup...\n');

  // Check environment variable
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    console.error('❌ FAL_API_KEY not found in environment variables!');
    console.log('   Make sure .env file exists with FAL_API_KEY set');
    return;
  }
  console.log('✅ FAL_API_KEY found in environment');
  console.log(`   Key preview: ${apiKey.substring(0, 20)}...\n`);

  // Test model configuration
  console.log('📋 Testing Model Configuration...');
  try {
    const { getAllCategories, getModelsForCategory, getModel } = await import('./src/config/models');
    
    const categories = getAllCategories();
    console.log(`✅ Found ${categories.length} categories:`, categories.join(', '));
    
    const textModels = getModelsForCategory('Text Generation');
    console.log(`✅ Text Generation models:`, textModels.map(m => m.name).join(', '));
    
    const claude = getModel('Text Generation', 'Claude');
    if (claude) {
      console.log(`✅ Claude config:`);
      console.log(`   - Fal Model ID: ${claude.falModelId}`);
      console.log(`   - OpenRouter Model: ${claude.openRouterModel}`);
      console.log(`   - Type: ${claude.modelType}`);
      console.log(`   - Price: $${claude.pricePerToken}/token`);
    }
  } catch (error: any) {
    console.error('❌ Model config error:', error.message);
    return;
  }
  console.log('');

  // Test Fal AI client import
  console.log('🔌 Testing Fal AI Client Import...');
  try {
    const { fal } = await import('@fal-ai/client');
    console.log('✅ Fal AI client imported successfully');
    
    // Configure client
    fal.config({
      credentials: apiKey,
    });
    console.log('✅ Fal AI client configured');
  } catch (error: any) {
    console.error('❌ Fal AI client error:', error.message);
    return;
  }
  console.log('');

  // Test service import
  console.log('⚙️  Testing Fal AI Service...');
  try {
    const { generateContent } = await import('./src/services/falAI');
    console.log('✅ Fal AI service imported successfully');
    
    // Get a model config
    const { getModel } = await import('./src/config/models');
    const claude = getModel('Text Generation', 'Claude');
    
    if (claude) {
      console.log('✅ Ready to test generation with Claude');
      console.log('   (Skipping actual API call to avoid charges)');
      console.log('   Run the full test with: npm test (after starting server)');
    }
  } catch (error: any) {
    console.error('❌ Service import error:', error.message);
    return;
  }
  console.log('');

  console.log('✨ Setup verification complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start the server: npm run dev');
  console.log('   2. In another terminal, run: npm test');
}

testFalAI().catch(console.error);

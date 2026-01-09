/**
 * Test script to verify backend API is working
 * Run with: npx tsx test-api.ts
 */

import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Simple HTTP request helper
function httpRequest(url: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 200, data: parsed });
        } catch {
          resolve({ status: res.statusCode || 200, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');
  console.log(`📍 API Base URL: ${API_BASE_URL}\n`);

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const { status, data } = await httpRequest(`${API_BASE_URL}/health`);
    if (status === 200) {
      console.log('✅ Health Check:', data);
    } else {
      console.error(`❌ Health Check Failed: Status ${status}`);
      return;
    }
  } catch (error: any) {
    console.error('❌ Health Check Failed:', error.message);
    console.error('   Make sure the server is running: npm run dev');
    return;
  }
  console.log('');

  // Test 2: Get All Tools
  console.log('2️⃣ Testing GET /api/tools...');
  try {
    const { status, data: toolsData } = await httpRequest(`${API_BASE_URL}/api/tools`);
    
    if (status === 200 && toolsData.success) {
      console.log('✅ Tools fetched successfully');
      console.log(`   Found ${toolsData.data.length} categories:`);
      toolsData.data.forEach((cat: any) => {
        console.log(`   - ${cat.category}: ${cat.models.length} models`);
      });
    } else {
      console.error('❌ Tools fetch failed:', toolsData.error || `Status ${status}`);
    }
  } catch (error: any) {
    console.error('❌ Tools fetch error:', error.message);
  }
  console.log('');

  // Test 3: Get Specific Category
  console.log('3️⃣ Testing GET /api/tools/Text Generation...');
  try {
    const { status, data: categoryData } = await httpRequest(`${API_BASE_URL}/api/tools/Text%20Generation`);
    
    if (status === 200 && categoryData.success) {
      console.log('✅ Category fetched successfully');
      console.log(`   Models in Text Generation:`);
      categoryData.data.models.forEach((model: any) => {
        console.log(`   - ${model.name} ${model.logo} (${model.price})`);
      });
    } else {
      console.error('❌ Category fetch failed:', categoryData.error || `Status ${status}`);
    }
  } catch (error: any) {
    console.error('❌ Category fetch error:', error.message);
  }
  console.log('');

  // Test 4: Generate Content (Text)
  console.log('4️⃣ Testing POST /api/generate (Text Generation)...');
  console.log('   ⚠️  This will make a real API call to Fal AI (may incur costs)');
  try {
    const { status, data: generateData } = await httpRequest(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'Text Generation',
        model: 'Claude',
        prompt: 'Write a haiku about coding.',
      }),
    });
    
    if (status === 200 && generateData.success) {
      console.log('✅ Generation successful!');
      console.log(`   Model: ${generateData.model}`);
      console.log(`   Cost: $${generateData.cost?.toFixed(6)}`);
      console.log(`   Request ID: ${generateData.requestId}`);
      const dataStr = JSON.stringify(generateData.data);
      console.log(`   Result preview: ${dataStr.substring(0, 200)}${dataStr.length > 200 ? '...' : ''}`);
    } else {
      console.error('❌ Generation failed:', generateData.error || `Status ${status}`);
      console.log('   Full response:', JSON.stringify(generateData, null, 2));
    }
  } catch (error: any) {
    console.error('❌ Generation error:', error.message);
    console.error('   Make sure the server is running and Fal AI API key is set!');
  }
  console.log('');

  // Test 5: Test Model Configuration
  console.log('5️⃣ Testing Model Configuration...');
  try {
    const { getAllCategories, getModelsForCategory, getModel } = await import('./src/config/models');
    
    const categories = getAllCategories();
    console.log(`✅ Found ${categories.length} categories`);
    
    const textModels = getModelsForCategory('Text Generation');
    console.log(`✅ Text Generation has ${textModels.length} models`);
    
    const claude = getModel('Text Generation', 'Claude');
    if (claude) {
      console.log(`✅ Claude model found: ${claude.falModelId}`);
      console.log(`   OpenRouter Model: ${claude.openRouterModel}`);
      console.log(`   Type: ${claude.modelType}`);
    }
  } catch (error: any) {
    console.error('❌ Model config error:', error.message);
  }
  console.log('');

  console.log('✨ Test completed!');
}

// Run tests
testAPI().catch(console.error);

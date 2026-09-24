/**
 * Test script to verify Character API integration
 * Uses native fetch API (no external dependencies)
 */

const DEPLOYED_API_URL = 'https://vercel-character-api.vercel.app';
const LOCAL_API_URL = 'http://localhost:8001';

async function testHealthCheck(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/character-health`);
    const data = await response.json();
    console.log(`✅ Health check successful for ${baseUrl}:`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Message: ${data.message}`);
    return true;
  } catch (error) {
    console.log(`❌ Health check failed for ${baseUrl}:`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testEndpoints(baseUrl) {
  console.log(`\n🧪 Testing endpoints for ${baseUrl}:`);
  
  // Test health
  await testHealthCheck(baseUrl);
  
  // Test root endpoint
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    console.log(`✅ Root endpoint accessible`);
    console.log(`   Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`❌ Root endpoint failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting Character API Integration Tests\n');
  
  console.log('Testing Deployed API (Vercel):');
  await testEndpoints(DEPLOYED_API_URL);
  
  console.log('\nTesting Local API (if running):');
  await testEndpoints(LOCAL_API_URL);
  
  console.log('\n✨ Integration tests completed!');
}

main().catch(console.error);
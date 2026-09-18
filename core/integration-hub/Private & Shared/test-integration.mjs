/**
 * Integration Hub Test Script
 * Tests the universal integration hub functionality
 */

import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testDataPath: join(__dirname, 'characters-cleaned.json')
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP request helper
async function makeRequest(endpoint, method = 'GET', body = null) {
  try {
    const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test suite
async function runTests() {
  log('🧪 Starting Integration Hub Tests', colors.blue);
  log('================================', colors.blue);
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Check if character data file exists
  log('\n📋 Test 1: Character data file exists', colors.yellow);
  try {
    const dataExists = fs.existsSync(TEST_CONFIG.testDataPath);
    if (dataExists) {
      log('✅ Character data file found', colors.green);
      passedTests++;
    } else {
      log('❌ Character data file not found', colors.red);
      failedTests++;
    }
  } catch (error) {
    log(`❌ Error checking data file: ${error.message}`, colors.red);
    failedTests++;
  }
  
  // Test 2: Health check endpoint
  log('\n📋 Test 2: Health check endpoint', colors.yellow);
  const healthCheck = await makeRequest('/health');
  if (healthCheck.success && healthCheck.data.status === 'healthy') {
    log('✅ Health check passed', colors.green);
    log(`   Server uptime: ${Math.floor(healthCheck.data.uptime)}s`, colors.green);
    log(`   Characters loaded: ${healthCheck.data.charactersLoaded}`, colors.green);
    passedTests++;
  } else {
    log('❌ Health check failed', colors.red);
    log(`   Error: ${healthCheck.error || 'Unknown error'}`, colors.red);
    failedTests++;
  }
  
  // Test 3: Get all characters
  log('\n📋 Test 3: Get all characters', colors.yellow);
  const allCharacters = await makeRequest('/api/characters');
  if (allCharacters.success && allCharacters.data.data && allCharacters.data.data.length > 0) {
    log('✅ Characters retrieved successfully', colors.green);
    log(`   Total characters: ${allCharacters.data.total}`, colors.green);
    passedTests++;
  } else {
    log('❌ Failed to retrieve characters', colors.red);
    failedTests++;
  }
  
  // Test 4: Get specific character by ID
  log('\n📋 Test 4: Get specific character by ID', colors.yellow);
  const specificCharacter = await makeRequest('/api/characters/1');
  if (specificCharacter.success && specificCharacter.data.data && specificCharacter.data.data.name) {
    log('✅ Specific character retrieved', colors.green);
    log(`   Character: ${specificCharacter.data.data.name}`, colors.green);
    passedTests++;
  } else {
    log('❌ Failed to retrieve specific character', colors.red);
    failedTests++;
  }
  
  // Test 5: Search characters
  log('\n📋 Test 5: Search characters', colors.yellow);
  const searchResults = await makeRequest('/api/characters/search/Mary');
  if (searchResults.success && searchResults.data.data && searchResults.data.data.length > 0) {
    log('✅ Character search working', colors.green);
    log(`   Found: ${searchResults.data.data.length} characters`, colors.green);
    passedTests++;
  } else {
    log('❌ Character search failed', colors.red);
    failedTests++;
  }
  
  // Test 6: Get random character
  log('\n📋 Test 6: Get random character', colors.yellow);
  const randomCharacter = await makeRequest('/api/characters/random');
  if (randomCharacter.success && randomCharacter.data.data && randomCharacter.data.data.name) {
    log('✅ Random character retrieved', colors.green);
    log(`   Random character: ${randomCharacter.data.data.name}`, colors.green);
    passedTests++;
  } else {
    log('❌ Failed to get random character', colors.red);
    failedTests++;
  }
  
  // Test 7: Filter by rarity
  log('\n📋 Test 7: Filter characters by rarity', colors.yellow);
  const legendaryCharacters = await makeRequest('/api/characters?rarity=Legendary');
  if (legendaryCharacters.success && legendaryCharacters.data.data && legendaryCharacters.data.data.length > 0) {
    log('✅ Rarity filter working', colors.green);
    log(`   Legendary characters: ${legendaryCharacters.data.data.length}`, colors.green);
    passedTests++;
  } else {
    log('❌ Rarity filter failed', colors.red);
    failedTests++;
  }
  
  // Test 8: Shortcuts webhook
  log('\n📋 Test 8: Shortcuts webhook', colors.yellow);
  const webhookTest = await makeRequest('/webhook/shortcuts/search', 'POST', {
    searchTerm: 'Digital',
    promptType: 'hook'
  });
  if (webhookTest.success && webhookTest.data.results && webhookTest.data.results.length > 0) {
    log('✅ Shortcuts webhook working', colors.green);
    log(`   Results: ${webhookTest.data.results.length}`, colors.green);
    passedTests++;
  } else {
    log('❌ Shortcuts webhook failed', colors.red);
    failedTests++;
  }
  
  // Test 9: Get integration commands
  log('\n📋 Test 9: Unified Remote commands', colors.yellow);
  const commandsTest = await makeRequest('/api/unified-remote/commands');
  if (commandsTest.success && commandsTest.data.commands && commandsTest.data.commands.length > 0) {
    log('✅ Remote commands retrieved', colors.green);
    log(`   Available commands: ${commandsTest.data.commands.length}`, colors.green);
    passedTests++;
  } else {
    log('❌ Failed to get remote commands', colors.red);
    failedTests++;
  }
  
  // Test 10: API documentation
  log('\n📋 Test 10: API documentation', colors.yellow);
  const docsTest = await makeRequest('/api/docs');
  if (docsTest.success && docsTest.data.endpoints) {
    log('✅ API documentation accessible', colors.green);
    passedTests++;
  } else {
    log('❌ API documentation failed', colors.red);
    failedTests++;
  }
  
  // Test results summary
  log('\n================================', colors.blue);
  log('🧪 Test Results Summary', colors.blue);
  log('================================', colors.blue);
  log(`Total tests: ${passedTests + failedTests}`, colors.reset);
  log(`✅ Passed: ${passedTests}`, colors.green);
  log(`❌ Failed: ${failedTests}`, colors.red);
  
  if (failedTests === 0) {
    log('\n🎉 All tests passed!', colors.green);
  } else {
    log('\n⚠️ Some tests failed. Check the server status.', colors.yellow);
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Check if server is running first
async function checkServer() {
  log('🔍 Checking if Integration Hub server is running...', colors.yellow);
  
  const healthCheck = await makeRequest('/health');
  
  if (!healthCheck.success) {
    log('❌ Server is not running. Please start it first:', colors.red);
    log('   npm start', colors.yellow);
    process.exit(1);
  }
  
  log('✅ Server is running', colors.green);
  await runTests();
}

// Run tests
checkServer().catch(error => {
  log(`❌ Test execution failed: ${error.message}`, colors.red);
  process.exit(1);
});
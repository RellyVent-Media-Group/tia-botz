/**
 * Discord Integration Test Script
 * 
 * Tests the Discord webhook integration with Character API
 * 
 * Run with: node tests/discord-integration.test.js
 * Or: npm test (if configured)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// We'll use this to make HTTP requests to the Character API
// For Node.js, we need to use a different approach since we can't directly import http in ESM
// This test script assumes the Character API is running locally or deployed

const API_BASE = process.env.CHARACTER_API_URL || 'http://localhost:8000';

/**
 * Simple HTTP request helper for Node.js ESM
 */
async function httpRequest(method, url, body = null, headers = {}) {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body ? Buffer.byteLength(body) : 0,
        ...headers
      }
    };
    
    const req = lib.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

/**
 * Test Results Tracking
 */
class TestResults {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.errors = [];
    this.startTime = Date.now();
  }

  pass(testName) {
    this.passed++;
    console.log(`✅ PASS: ${testName}`);
  }

  fail(testName, error) {
    this.failed++;
    this.errors.push({ testName, error: error.message || error });
    console.log(`❌ FAIL: ${testName}`);
    console.log(`   Error: ${error.message || error}`);
  }

  skip(testName, reason) {
    this.skipped++;
    console.log(`⏭️  SKIP: ${testName} (${reason})`);
  }

  summary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Discord Integration Test Results`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Total:  ${this.passed + this.failed + this.skipped}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Skipped: ${this.skipped}`);
    console.log(`Duration: ${duration}s`);
    
    if (this.errors.length > 0) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Failed Tests:`);
      console.log(`${'='.repeat(50)}`);
      this.errors.forEach(({ testName, error }) => {
        console.log(`\n${testName}:`);
        console.log(`  ${error}`);
      });
    }

    return this.failed === 0;
  }
}

const results = new TestResults();

/**
 * Run a test
 */
async function runTest(testName, testFn) {
  try {
    await testFn();
    results.pass(testName);
  } catch (error) {
    results.fail(testName, error);
  }
}

// ============================================================================
// TESTS
// ============================================================================

/**
 * Test 1: Health endpoint with Discord webhook status
 */
async function testHealthEndpoint() {
  await runTest('Health endpoint returns Discord webhook status', async () => {
    const response = await httpRequest('GET', `${API_BASE}/api/character-health`);
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    if (!response.data) {
      throw new Error('No JSON response');
    }
    
    if (response.data.status !== 'healthy') {
      throw new Error(`Expected status 'healthy', got '${response.data.status}'`);
    }
    
    if (!response.data.timestamp) {
      throw new Error('Missing timestamp field');
    }
    
    // Check if discord_webhook field exists
    if (!('discord_webhook' in response.data)) {
      throw new Error('Missing discord_webhook field');
    }
    
    console.log('   Response:', JSON.stringify(response.data, null, 2));
  });
}

/**
 * Test 2: Discord notification endpoint (without webhook configured)
 */
async function testNotificationEndpoint() {
  await runTest('Notification endpoint accepts requests', async () => {
    const testNotification = {
      content: 'Test notification from Discord Integration Test',
      embeds: [{
        title: 'Test Embed',
        description: 'This is a test embed for Discord notification',
        color: 3447003,
        timestamp: new Date().toISOString()
      }]
    };
    
    const response = await httpRequest(
      'POST',
      `${API_BASE}/api/notifications/discord`,
      JSON.stringify(testNotification)
    );
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    if (!response.data) {
      throw new Error('No JSON response');
    }
    
    if (response.data.status !== 'sent') {
      throw new Error(`Expected status 'sent', got '${response.data.status}'`);
    }
    
    console.log('   Response:', JSON.stringify(response.data, null, 2));
  });
}

/**
 * Test 3: Discord webhook receiver endpoint
 */
async function testWebhookReceiver() {
  await runTest('Webhook receiver endpoint accepts requests', async () => {
    const testEvent = {
      event: 'test_event',
      user_id: '123456789',
      user_name: 'TestUser',
      message: 'Test webhook event',
      timestamp: new Date().toISOString()
    };
    
    const response = await httpRequest(
      'POST',
      `${API_BASE}/api/webhooks/discord`,
      JSON.stringify(testEvent)
    );
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    if (!response.data) {
      throw new Error('No JSON response');
    }
    
    if (response.data.status !== 'received') {
      throw new Error(`Expected status 'received', got '${response.data.status}'`);
    }
    
    console.log('   Response:', JSON.stringify(response.data, null, 2));
  });
}

/**
 * Test 4: Invalid JSON handling
 */
async function testInvalidJson() {
  await runTest('Endpoints handle invalid JSON gracefully', async () => {
    const response = await httpRequest(
      'POST',
      `${API_BASE}/api/notifications/discord`,
      'not valid json'
    );
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}`);
    }
    
    console.log('   Response:', JSON.stringify(response.data, null, 2));
  });
}

/**
 * Test 5: Non-existent endpoint
 */
async function testNonExistentEndpoint() {
  await runTest('Non-existent endpoints return 404', async () => {
    const response = await httpRequest(
      'GET',
      `${API_BASE}/api/non-existent-endpoint`
    );
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }
  });
}

/**
 * Test 6: Health endpoint with /health path
 */
async function testHealthShortPath() {
  await runTest('Short health endpoint path works', async () => {
    const response = await httpRequest('GET', `${API_BASE}/health`);
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    if (!response.data || response.data.status !== 'healthy') {
      throw new Error('Health check failed');
    }
  });
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Discord Integration Test Suite`);
  console.log(`${'='.repeat(50)}\n`);

  console.log(`Configuration:`);
  console.log(`  API Base URL: ${API_BASE}`);
  console.log();

  // Check if API is reachable first
  try {
    const healthCheck = await httpRequest('GET', `${API_BASE}/api/character-health`);
    if (healthCheck.status !== 200) {
      console.log(`⚠️  Warning: Character API may not be running at ${API_BASE}`);
      console.log(`   All tests will be skipped. Start the API first.`);
      console.log();
      results.skip('All tests', 'API not reachable');
      results.summary();
      return false;
    }
  } catch (error) {
    console.log(`⚠️  Warning: Character API not reachable at ${API_BASE}`);
    console.log(`   Error: ${error.message}`);
    console.log();
    results.skip('All tests', 'API not reachable');
    results.summary();
    return false;
  }

  // Run all tests
  console.log(`Running Discord Integration Tests...\n`);
  
  await testHealthEndpoint();
  await testHealthShortPath();
  await testNotificationEndpoint();
  await testWebhookReceiver();
  await testInvalidJson();
  await testNonExistentEndpoint();

  // Summary
  console.log();
  const allPassed = results.summary();
  
  return allPassed;
}

// Run tests
runAllTests()
  .then(allPassed => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });

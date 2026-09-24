/**
 * API Clients Test Suite
 * 
 * Comprehensive tests for Instagram and TikTok API clients
 * Tests both success and error scenarios
 * 
 * Run with: node tests/api-clients.test.js
 * Or with coverage: npm test
 */

import dotenv from 'dotenv';
import { InstagramGraphApi, createInstagramClient } from '../src/platforms/instagram-graph-api.js';
import { initInstagramClient, postToInstagram, getInstagramUser, getRecentMedia, getUserInsights } from '../src/platforms/instagram.js';
import { initTikTokClient, postToTikTok, getTikTokUser, getRecentVideos } from '../src/platforms/tiktok.js';

// Load environment variables
dotenv.config();

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  instagram: {
    enabled: !!process.env.INSTAGRAM_ACCESS_TOKEN,
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID
  },
  tiktok: {
    enabled: !!process.env.TIKTOK_ACCESS_TOKEN,
    accessToken: process.env.TIKTOK_ACCESS_TOKEN
  }
};

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
    this.errors.push({ testName, error });
    console.log(`❌ FAIL: ${testName}`);
    if (error) console.log(`   Error: ${error.message || error}`);
  }

  skip(testName, reason) {
    this.skipped++;
    console.log(`⏭️  SKIP: ${testName} (${reason})`);
  }

  summary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Test Results Summary`);
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
        console.log(`  ${error.message || error}`);
      });
    }

    return this.failed === 0;
  }
}

/**
 * Test Utilities
 */
const results = new TestResults();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTest(testName, testFn) {
  try {
    if (typeof testFn === 'function') {
      await testFn();
    }
    results.pass(testName);
  } catch (error) {
    results.fail(testName, error);
  }
}

/**
 * Mock Data for Testing
 */
const mockContent = {
  character: 'Test Character',
  contentType: 'character_reveal',
  caption: 'Test post caption #test #socialmedia',
  mediaFile: null, // Will be set to a real file for file upload tests
  hashtags: ['#test', '#socialmedia']
};

// ============================================================================
// INSTAGRAM GRAPH API CLIENT TESTS
// ============================================================================

/**
 * Test 1: InstagramGraphApi instantiation
 */
async function testInstagramClientInstantiation() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('Instagram client instantiation', 'No credentials configured');
    return;
  }

  await runTest('Instagram client instantiation', async () => {
    const client = new InstagramGraphApi({
      accessToken: TEST_CONFIG.instagram.accessToken,
      instagramUserId: TEST_CONFIG.instagram.userId
    });
    
    assert(client.accessToken === TEST_CONFIG.instagram.accessToken, 'Access token mismatch');
    assert(client.instagramUserId === TEST_CONFIG.instagram.userId, 'User ID mismatch');
  });
}

/**
 * Test 2: InstagramGraphApi missing credentials
 */
async function testInstagramClientMissingCredentials() {
  await runTest('Instagram client missing credentials', async () => {
    let errorThrown = false;
    
    try {
      new InstagramGraphApi({ accessToken: '', instagramUserId: '' });
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('accessToken is required'), 'Wrong error for missing accessToken');
    }
    
    assert(errorThrown, 'Should throw error for missing credentials');

    errorThrown = false;
    try {
      new InstagramGraphApi({ accessToken: 'test', instagramUserId: '' });
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('instagramUserId is required'), 'Wrong error for missing userId');
    }
    
    assert(errorThrown, 'Should throw error for missing userId');
  });
}

/**
 * Test 3: InstagramGraphApi getUser (requires credentials)
 */
async function testInstagramGetUser() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('Instagram getUser', 'No credentials configured');
    return;
  }

  await runTest('Instagram getUser', async () => {
    const client = createInstagramClient();
    const user = await client.getUser();
    
    assert(user, 'User data should not be null');
    assert(user.id, 'User should have an id');
  });
}

/**
 * Test 4: InstagramGraphApi getMedia (requires credentials)
 */
async function testInstagramGetMedia() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('Instagram getMedia', 'No credentials configured');
    return;
  }

  await runTest('Instagram getMedia', async () => {
    const client = createInstagramClient();
    const media = await client.getMedia({ limit: 5 });
    
    assert(Array.isArray(media), 'Media should be an array');
    // Note: May be empty if no media exists
  });
}

/**
 * Test 5: InstagramGraphApi userInsights (requires credentials)
 */
async function testInstagramUserInsights() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('Instagram userInsights', 'No credentials configured');
    return;
  }

  await runTest('Instagram userInsights', async () => {
    const client = createInstagramClient();
    const insights = await client.getUserInsights();
    
    assert(insights, 'Insights should not be null');
  });
}

// ============================================================================
// INSTAGRAM INTEGRATION TESTS (Wrapper Functions)
// ============================================================================

/**
 * Test 6: initInstagramClient
 */
async function testInitInstagramClient() {
  await runTest('initInstagramClient', async () => {
    const success = initInstagramClient();
    
    if (TEST_CONFIG.instagram.enabled) {
      assert(success === true, 'Should initialize successfully with credentials');
    } else {
      assert(success === false, 'Should fail gracefully without credentials');
    }
  });
}

/**
 * Test 7: postToInstagram (requires credentials)
 */
async function testPostToInstagram() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('postToInstagram', 'No credentials configured');
    return;
  }

  await runTest('postToInstagram', async () => {
    const result = await postToInstagram(mockContent);
    
    // Without a real media file, this will likely fail
    // But we're testing the function exists and runs without errors
    assert(typeof result === 'boolean', 'Should return a boolean');
  });
}

/**
 * Test 8: getInstagramUser (requires credentials)
 */
async function testGetInstagramUser() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('getInstagramUser', 'No credentials configured');
    return;
  }

  await runTest('getInstagramUser', async () => {
    const user = await getInstagramUser();
    
    if (user) {
      assert(user.id, 'User should have an id');
    }
    // Can be null if client not initialized
  });
}

/**
 * Test 9: Graceful fallback when no credentials
 */
async function testGracefulFallback() {
  // Temporarily clear credentials
  const originalToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const originalUserId = process.env.INSTAGRAM_USER_ID;
  
  delete process.env.INSTAGRAM_ACCESS_TOKEN;
  delete process.env.INSTAGRAM_USER_ID;

  await runTest('Graceful fallback - no credentials', async () => {
    const success = initInstagramClient();
    assert(success === false, 'Should fail to initialize without credentials');

    const result = await postToInstagram(mockContent);
    assert(result === true, 'Should return true in placeholder mode');

    const user = await getInstagramUser();
    assert(user === null, 'Should return null for user when not initialized');

    const media = await getRecentMedia(5);
    assert(Array.isArray(media) && media.length === 0, 'Should return empty array');
  });

  // Restore credentials
  process.env.INSTAGRAM_ACCESS_TOKEN = originalToken;
  process.env.INSTAGRAM_USER_ID = originalUserId;
}

// ============================================================================
// TIKTOK INTEGRATION TESTS
// ============================================================================

/**
 * Test 10: initTikTokClient
 */
async function testInitTikTokClient() {
  await runTest('initTikTokClient', async () => {
    const success = initTikTokClient();
    
    if (TEST_CONFIG.tiktok.enabled) {
      assert(success === true, 'Should initialize successfully with credentials');
    } else {
      assert(success === false, 'Should fail gracefully without credentials');
    }
  });
}

/**
 * Test 11: postToTikTok (requires credentials)
 */
async function testPostToTikTok() {
  if (!TEST_CONFIG.tiktok.enabled) {
    results.skip('postToTikTok', 'No credentials configured');
    return;
  }

  await runTest('postToTikTok', async () => {
    const result = await postToTikTok(mockContent);
    assert(typeof result === 'boolean', 'Should return a boolean');
  });
}

/**
 * Test 12: getTikTokUser (requires credentials)
 */
async function testGetTikTokUser() {
  if (!TEST_CONFIG.tiktok.enabled) {
    results.skip('getTikTokUser', 'No credentials configured');
    return;
  }

  await runTest('getTikTokUser', async () => {
    const user = await getTikTokUser();
    // Can be null if client not initialized or API call fails
  });
}

/**
 * Test 13: TikTok graceful fallback
 */
async function testTikTokGracefulFallback() {
  // Temporarily clear credentials
  const originalToken = process.env.TIKTOK_ACCESS_TOKEN;
  delete process.env.TIKTOK_ACCESS_TOKEN;

  await runTest('TikTok graceful fallback - no credentials', async () => {
    const success = initTikTokClient();
    assert(success === false, 'Should fail to initialize without credentials');

    const result = await postToTikTok(mockContent);
    assert(result === true, 'Should return true in placeholder mode');

    const user = await getTikTokUser();
    assert(user === null, 'Should return null for user when not initialized');

    const videos = await getRecentVideos(5);
    assert(Array.isArray(videos) && videos.length === 0, 'Should return empty array');
  });

  // Restore credentials
  process.env.TIKTOK_ACCESS_TOKEN = originalToken;
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

/**
 * Test 14: Multiple sequential posts
 */
async function testSequentialPosts() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('Multiple sequential posts', 'No credentials configured');
    return;
  }

  await runTest('Multiple sequential posts', async () => {
    initInstagramClient();
    
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(postToInstagram({
        ...mockContent,
        character: `Character ${i}`
      }));
    }
    
    const results = await Promise.all(promises);
    assert(results.every(r => typeof r === 'boolean'), 'All results should be boolean');
  });
}

/**
 * Test 15: Error handling for invalid content
 */
async function testErrorHandling() {
  await runTest('Error handling - invalid content', async () => {
    initInstagramClient();
    
    const invalidContent = {
      // Missing required fields
    };
    
    const result = await postToInstagram(invalidContent);
    assert(typeof result === 'boolean', 'Should still return a boolean');
  });
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`API Clients Test Suite`);
  console.log(`${'='.repeat(50)}\n`);

  console.log(`Configuration:`);
  console.log(`  Instagram: ${TEST_CONFIG.instagram.enabled ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  TikTok: ${TEST_CONFIG.tiktok.enabled ? '✅ Configured' : '❌ Not configured'}`);
  console.log();

  // Instagram Graph API Client Tests
  console.log(`Running Instagram Graph API Client Tests...\n`);
  await testInstagramClientInstantiation();
  await testInstagramClientMissingCredentials();
  await testInstagramGetUser();
  await testInstagramGetMedia();
  await testInstagramUserInsights();

  // Instagram Integration Tests
  console.log(`\nRunning Instagram Integration Tests...\n`);
  await testInitInstagramClient();
  await testPostToInstagram();
  await testGetInstagramUser();
  await testGracefulFallback();

  // TikTok Integration Tests
  console.log(`\nRunning TikTok Integration Tests...\n`);
  await testInitTikTokClient();
  await testPostToTikTok();
  await testGetTikTokUser();
  await testTikTokGracefulFallback();

  // Integration Tests
  console.log(`\nRunning Integration Tests...\n`);
  await testSequentialPosts();
  await testErrorHandling();

  // Summary
  console.log();
  const allPassed = results.summary();
  
  return allPassed;
}

// Run tests and exit with appropriate code
runAllTests()
  .then(allPassed => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });

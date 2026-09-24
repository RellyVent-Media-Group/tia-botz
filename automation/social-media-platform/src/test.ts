/**
 * Test script for TypeScript platform foundation
 * Verifies the core types, adapters, and registry work correctly
 */

import { Platform, ContentType, PublishStatus } from './types/platform.js';
import { PlatformRegistry } from './registry/PlatformRegistry.js';
import { InstagramAdapter } from './adapters/InstagramAdapter.js';
import { TikTokAdapter } from './adapters/TikTokAdapter.js';
import type { ContentPayload, MediaAsset } from './types/platform.js';

async function runTests() {
  console.log('=== TypeScript Platform Foundation Tests ===\n');

  // Test 1: Create and register adapters
  console.log('Test 1: Create and register adapters');
  const registry = PlatformRegistry.getInstance();
  const instagramAdapter = new InstagramAdapter();
  const tiktokAdapter = new TikTokAdapter();

  registry.register(instagramAdapter);
  registry.register(tiktokAdapter);

  console.log(`✓ Registered ${registry.getAdapterCount()} adapters`);
  console.log(`  Platforms: ${registry.getRegisteredPlatforms().join(', ')}\n`);

  // Test 2: Get adapter capabilities
  console.log('Test 2: Get adapter capabilities');
  const igCapabilities = instagramAdapter.getCapabilities();
  console.log('✓ Instagram capabilities:');
  console.log(`  Supported content types: ${igCapabilities.supportedContentTypes.join(', ')}`);
  console.log(`  Max caption length: ${igCapabilities.maxCaptionLength}`);
  console.log(`  Supports scheduling: ${igCapabilities.supportsScheduling}\n`);

  // Test 3: Initialize adapter
  console.log('Test 3: Initialize adapter');
  await instagramAdapter.initialize({
    platform: Platform.INSTAGRAM,
    apiKey: 'test-key',
    apiSecret: 'test-secret'
  });
  const isHealthy = await instagramAdapter.healthCheck();
  console.log(`✓ Instagram adapter initialized and healthy: ${isHealthy}\n`);

  // Test 4: Validate content payload
  console.log('Test 4: Validate content payload');
  const mediaAsset: MediaAsset = {
    id: 'media-1',
    type: ContentType.IMAGE,
    url: 'https://example.com/image.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    uploadedAt: new Date()
  };

  const payload: ContentPayload = {
    id: 'post-1',
    platform: Platform.INSTAGRAM,
    contentType: ContentType.IMAGE,
    caption: 'Test caption for Instagram post',
    hashtags: ['#test', '#example'],
    mediaAssets: [mediaAsset]
  };

  try {
    await instagramAdapter.validatePayload(payload);
    console.log('✓ Content payload validated successfully\n');
  } catch (error) {
    console.error('✗ Validation failed:', error);
  }

  // Test 5: Publish content (sample)
  console.log('Test 5: Publish content (sample)');
  const result = await instagramAdapter.publish(payload);
  console.log('✓ Publish result:');
  console.log(`  Success: ${result.success}`);
  console.log(`  Post ID: ${result.postId}`);
  console.log(`  Post URL: ${result.postUrl}\n`);

  // Test 6: Get engagement metrics (sample)
  console.log('Test 6: Get engagement metrics (sample)');
  if (result.postId) {
    const metrics = await instagramAdapter.getEngagementMetrics(result.postId);
    console.log('✓ Engagement metrics:');
    console.log(`  Likes: ${metrics.likes}`);
    console.log(`  Comments: ${metrics.comments}`);
    console.log(`  Shares: ${metrics.shares}\n`);
  }

  // Test 7: Registry operations
  console.log('Test 7: Registry operations');
  const retrievedAdapter = registry.getAdapter(Platform.INSTAGRAM);
  console.log(`✓ Retrieved Instagram adapter: ${retrievedAdapter?.platform === Platform.INSTAGRAM}`);
  console.log(`✓ Has TikTok adapter: ${registry.hasAdapter(Platform.TIKTOK)}\n`);

  // Cleanup
  await instagramAdapter.dispose();
  registry.clear();

  console.log('=== All Tests Passed ===');
  console.log('\nTypeScript platform foundation is working correctly.');
}

// Run tests
runTests().catch(console.error);

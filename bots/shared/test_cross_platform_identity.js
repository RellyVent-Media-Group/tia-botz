#!/usr/bin/env node
/**
 * Test script for cross-platform identity system
 */

import CrossPlatformIdentity from './cross-platform-identity.js';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB = './test_cross_platform_identity.db';

// Clean up test database if it exists
if (existsSync(TEST_DB)) {
  unlinkSync(TEST_DB);
}

console.log('🧪 Testing Cross-Platform Identity System\n');

try {
  // Initialize
  const identity = new CrossPlatformIdentity(TEST_DB);
  console.log('✅ Database initialized\n');

  // Test 1: Create user
  console.log('Test 1: Create user');
  const user1 = identity.createOrGetUser('test@example.com', 'Test User', { source: 'test' });
  console.log(`User ID: ${user1.id}`);
  console.log(`Email: ${user1.primary_email}\n`);

  // Test 2: Link platform
  console.log('Test 2: Link platform identifier');
  const mapping1 = identity.linkPlatform(user1.id, 'telegram', '123456789', { username: 'testuser' });
  console.log(`Platform: ${mapping1.platform}`);
  console.log(`Identifier: ${mapping1.platform_identifier}\n`);

  // Test 3: Resolve user by platform
  console.log('Test 3: Resolve user by platform');
  const resolved = identity.getUserByPlatform('telegram', '123456789');
  console.log(`Resolved User ID: ${resolved.user.id}`);
  console.log(`Email: ${resolved.user.primary_email}\n`);

  // Test 4: Link another platform
  console.log('Test 4: Link second platform');
  const mapping2 = identity.linkPlatform(user1.id, 'whatsapp', '987654321', { phone: '+1234567890' });
  console.log(`Platform: ${mapping2.platform}\n`);

  // Test 5: Get all platforms
  console.log('Test 5: Get all platforms for user');
  const platforms = identity.getUserPlatforms(user1.id);
  console.log(`Total platforms: ${platforms.length}`);
  platforms.forEach(p => console.log(`  - ${p.platform}: ${p.identifier}\n`));

  // Test 6: Save conversation state
  console.log('Test 6: Save conversation state');
  const state = identity.saveConversationState(user1.id, 'telegram', 'conv_123', { context: 'test', step: 1 });
  console.log(`State ID: ${state.id}\n`);

  // Test 7: Get conversation state
  console.log('Test 7: Get conversation state');
  const states = identity.getConversationState(user1.id);
  console.log(`Conversation states: ${states.length}`);
  if (states.length > 0) {
    console.log(`State data: ${JSON.stringify(states[0].stateData)}\n`);
  }

  // Test 8: Initiate verification
  console.log('Test 8: Initiate verification');
  const verification = identity.initiateVerification(user1.id, 'telegram', 'code');
  console.log(`Verification code: ${verification.verificationCode}\n`);

  // Test 9: Complete verification
  console.log('Test 9: Complete verification');
  const completed = identity.completeVerification(verification.verificationId, verification.verificationCode);
  console.log(`Verification status: ${completed.status}\n`);

  // Test 10: Get identity summary
  console.log('Test 10: Get identity summary');
  const summary = identity.getIdentitySummary(user1.id);
  console.log(`Total platforms: ${summary.totalPlatforms}`);
  console.log(`Verified platforms: ${summary.verifiedPlatforms}\n`);

  // Test 11: Merge users
  console.log('Test 11: Merge users');
  const user2 = identity.createOrGetUser('merge@example.com', 'Merge User', { source: 'test' });
  identity.linkPlatform(user2.id, 'discord', 'discord_user_123', {});
  const mergeResult = identity.mergeUsers(user1.id, user2.id);
  console.log(`Merged ${mergeResult.mergedMappings} mappings\n`);

  // Final summary
  console.log('Test 12: Final identity summary after merge');
  const finalSummary = identity.getIdentitySummary(user1.id);
  console.log(`Final total platforms: ${finalSummary.totalPlatforms}\n`);

  // Cleanup
  identity.close();
  unlinkSync(TEST_DB);
  console.log('✅ All tests passed! Database cleaned up.');

} catch (error) {
  console.error('❌ Test failed:', error);
  if (existsSync(TEST_DB)) {
    unlinkSync(TEST_DB);
  }
  process.exit(1);
}

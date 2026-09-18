/**
 * Bot Functionality Test Script
 * Tests core bot functionality without requiring actual Telegram messages
 */

import dotenv from 'dotenv';
import { initializeDatabase, getOrCreateUser, getUserStats } from './database.js';
import { getAvailableServices, getAvailablePromptTypes, getAvailableStyles } from './ai-generation.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment from telegram-bot .env
dotenv.config({ path: join(__dirname, '../telegram-bot/.env') });

console.log('🧪 ChiefPilot Bot Functionality Test');
console.log('=====================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Database Initialization
  console.log('Test 1: Database Initialization');
  try {
    const db = initializeDatabase();
    console.log('✅ Database initialized successfully');
    passed++;
  } catch (error) {
    console.log('❌ Database initialization failed:', error.message);
    failed++;
  }
  console.log();

  // Test 2: User Creation
  console.log('Test 2: User Creation');
  try {
    const testUserId = 'test_user_' + Date.now();
    const user = await getOrCreateUser(testUserId, 'telegram', 'test_username');
    console.log('✅ User created/ retrieved successfully:', user.id);
    passed++;
  } catch (error) {
    console.log('❌ User creation failed:', error.message);
    failed++;
  }
  console.log();

  // Test 3: User Stats
  console.log('Test 3: User Statistics');
  try {
    const testUserId = 'test_user_' + Date.now();
    await getOrCreateUser(testUserId, 'telegram', 'test_username');
    const stats = await getUserStats(testUserId);
    console.log('✅ User stats retrieved:', JSON.stringify(stats, null, 2));
    passed++;
  } catch (error) {
    console.log('❌ User stats retrieval failed:', error.message);
    failed++;
  }
  console.log();

  // Test 4: AI Services Check
  console.log('Test 4: AI Services Availability');
  try {
    const services = getAvailableServices();
    console.log('✅ AI services check completed:');
    for (const [service, config] of Object.entries(services)) {
      console.log(`   - ${service}: ${config.available ? 'Available' : 'Not Available'}`);
    }
    passed++;
  } catch (error) {
    console.log('❌ AI services check failed:', error.message);
    failed++;
  }
  console.log();

  // Test 5: Prompt Types
  console.log('Test 5: Available Prompt Types');
  try {
    const types = getAvailablePromptTypes();
    console.log('✅ Prompt types retrieved:', types.join(', '));
    passed++;
  } catch (error) {
    console.log('❌ Prompt types retrieval failed:', error.message);
    failed++;
  }
  console.log();

  // Test 6: Style Options
  console.log('Test 6: Available Styles for Portrait');
  try {
    const styles = getAvailableStyles('portrait');
    console.log('✅ Portrait styles retrieved:', styles.join(', '));
    passed++;
  } catch (error) {
    console.log('❌ Style retrieval failed:', error.message);
    failed++;
  }
  console.log();

  // Test 7: Environment Variables
  console.log('Test 7: Environment Configuration');
  try {
    const requiredVars = ['DB_PATH', 'TELEGRAM_BOT_TOKEN', 'OLLAMA_API_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length === 0) {
      console.log('✅ All required environment variables are set');
      passed++;
    } else {
      console.log('⚠️ Missing environment variables:', missing.join(', '));
      failed++;
    }
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
    failed++;
  }
  console.log();

  // Test 8: Database File Existence
  console.log('Test 8: Database File Check');
  try {
    const fs = await import('fs');
    const dbPath = process.env.DB_PATH || './chiefpilot.db';
    const exists = fs.existsSync(dbPath);
    if (exists) {
      console.log('✅ Database file exists:', dbPath);
      passed++;
    } else {
      console.log('❌ Database file not found:', dbPath);
      failed++;
    }
  } catch (error) {
    console.log('❌ Database file check failed:', error.message);
    failed++;
  }
  console.log();

  // Summary
  console.log('=====================================');
  console.log('Test Summary');
  console.log('=====================================');
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log();

  if (failed === 0) {
    console.log('🎉 All tests passed! Bot is ready for use.');
  } else {
    console.log('⚠️ Some tests failed. Please review the errors above.');
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

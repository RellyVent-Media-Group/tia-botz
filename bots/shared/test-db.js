#!/usr/bin/env node
/**
 * Test script for SQLite database connection
 */

import { initializeDatabase, getOrCreateUser, getUserStats } from './database.js';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Initialize database
    await initializeDatabase();
    
    // Test user creation
    console.log('👤 Testing user creation...');
    const testUser = await getOrCreateUser(123456789, null, null);
    console.log('✅ User created:', testUser);
    
    // Test user stats
    console.log('📊 Testing user stats...');
    const stats = await getUserStats(testUser.id);
    console.log('✅ User stats:', stats);
    
    console.log('✅ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
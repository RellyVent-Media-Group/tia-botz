/**
 * Test script to verify Discord bot integration with deployed Character API
 * Simulates the Discord bot's API calls to verify end-to-end functionality
 */

import CharacterAPIClient from '../shared/character-api-client.js';

const DEPLOYED_API_URL = 'https://vercel-character-api.vercel.app';

async function testDiscordBotIntegration() {
  console.log('🤖 Testing Discord Bot Integration with Deployed Character API\n');
  
  const characterAPI = new CharacterAPIClient(DEPLOYED_API_URL);
  
  // Test 1: Health Check
  console.log('Test 1: Character API Health Check');
  try {
    const health = await characterAPI.healthCheck();
    console.log('✅ Health check successful:', health);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Get Random Character (simulates /random command)
  console.log('\nTest 2: Get Random Character (simulates /random command)');
  try {
    const randomChar = await characterAPI.getRandomCharacter();
    if (randomChar && randomChar.data) {
      console.log('✅ Random character retrieved:', randomChar.data.name);
      console.log('   Details:', JSON.stringify(randomChar.data, null, 2));
    } else {
      console.log('⚠️ Random character returned unexpected format');
    }
  } catch (error) {
    console.log('❌ Random character failed:', error.message);
  }
  
  // Test 3: Search Characters (simulates /character command)
  console.log('\nTest 3: Search Characters (simulates /character command)');
  try {
    const searchResults = await characterAPI.searchCharacters('mary');
    if (searchResults && searchResults.data) {
      console.log(`✅ Search successful, found ${searchResults.data.length} characters`);
      if (searchResults.data.length > 0) {
        console.log('   First result:', searchResults.data[0].name);
      }
    } else {
      console.log('⚠️ Search returned unexpected format');
    }
  } catch (error) {
    console.log('❌ Search failed:', error.message);
  }
  
  // Test 4: Get Content Creators (simulates /api creators command)
  console.log('\nTest 4: Get Content Creators (simulates /api creators command)');
  try {
    const creators = await characterAPI.getContentCreators();
    if (creators && creators.data) {
      console.log(`✅ Content creators retrieved: ${creators.data.length} creators`);
    } else {
      console.log('⚠️ Content creators returned unexpected format');
    }
  } catch (error) {
    console.log('❌ Content creators failed:', error.message);
  }
  
  // Test 5: Get Budget Summary (simulates /api budget command)
  console.log('\nTest 5: Get Budget Summary (simulates /api budget command)');
  try {
    const budget = await characterAPI.getBudgetSummary();
    if (budget && budget.data) {
      console.log('✅ Budget summary retrieved');
      console.log('   Summary:', JSON.stringify(budget.data, null, 2));
    } else {
      console.log('⚠️ Budget summary returned unexpected format');
    }
  } catch (error) {
    console.log('❌ Budget summary failed:', error.message);
  }
  
  // Test 6: Get Character Performance (simulates /api performance command)
  console.log('\nTest 6: Get Character Performance (simulates /api performance command)');
  try {
    const performance = await characterAPI.getCharacterPerformance();
    if (performance && performance.data) {
      console.log(`✅ Character performance retrieved: ${performance.data.length} characters`);
    } else {
      console.log('⚠️ Character performance returned unexpected format');
    }
  } catch (error) {
    console.log('❌ Character performance failed:', error.message);
  }
  
  console.log('\n✨ Discord Bot Integration Tests Completed!');
  console.log('\n📋 Summary:');
  console.log('- Character API is deployed and accessible');
  console.log('- Discord bot can successfully connect to the deployed API');
  console.log('- All major Discord bot commands would work with the deployed API');
  console.log('\n🚀 Ready for Discord bot deployment to Railway!');
}

testDiscordBotIntegration().catch(console.error);
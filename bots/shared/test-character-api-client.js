/**
 * Test script for Character API Client
 * Verifies integration with the depot automation unified character API
 */

import CharacterAPIClient from './character-api-client.js';

async function runTests() {
  const client = new CharacterAPIClient('http://localhost:8001');

  console.log('=== Character API Client Integration Tests ===\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const health = await client.healthCheck();
    console.log('✓ Health check passed');
    console.log(`  Status: ${health.status}`);
    console.log(`  Characters loaded: ${health.characters_loaded}`);
    console.log(`  Data source: ${health.data_source}\n`);

    // Test 2: Get All Characters
    console.log('Test 2: Get All Characters');
    const allChars = await client.getCharacters();
    console.log(`✓ Retrieved ${allChars.data.length} characters\n`);

    // Test 3: Get Specific Character
    console.log('Test 3: Get Specific Character (ID: 1)');
    const char1 = await client.getCharacter(1);
    const formatted = client.formatCharacterForBot(char1.data);
    console.log('✓ Retrieved character:');
    console.log(`  Name: ${formatted.name}`);
    console.log(`  Archetype: ${formatted.archetype}`);
    console.log(`  Rarity: ${formatted.rarity}`);
    console.log(`  Budget: ${formatted.budget}\n`);

    // Test 4: Search Characters
    console.log('Test 4: Search Characters (query: "Mary")');
    const searchResults = await client.searchCharacters('Mary');
    console.log(`✓ Found ${searchResults.data.length} characters matching "Mary"\n`);

    // Test 5: Get Random Character
    console.log('Test 5: Get Random Character');
    const randomChar = await client.getRandomCharacter();
    const randomFormatted = client.formatCharacterForBot(randomChar.data);
    console.log('✓ Retrieved random character:');
    console.log(`  Name: ${randomFormatted.name}`);
    console.log(`  Archetype: ${randomFormatted.archetype}\n`);

    // Test 6: Get Budget Summary
    console.log('Test 6: Get Budget Summary');
    const budget = await client.getBudgetSummary();
    console.log('✓ Budget summary:');
    console.log(`  Total allocated: $${budget.data.total_allocated_budget.toLocaleString()}`);
    console.log(`  Total characters: ${budget.data.total_characters}`);
    console.log(`  Average budget: $${Math.round(budget.data.average_budget_per_character).toLocaleString()}`);
    console.log(`  Highest budget: ${budget.data.highest_budget_character}`);
    console.log(`  Lowest budget: ${budget.data.lowest_budget_character}\n`);

    // Test 7: Get Budget by Archetype
    console.log('Test 7: Get Budget by Archetype');
    const budgetByArchetype = await client.getBudgetByArchetype();
    console.log('✓ Budget by archetype (top 5):');
    budgetByArchetype.data.slice(0, 5).forEach(item => {
      console.log(`  ${item.archetype}: $${item.total_budget.toLocaleString()}`);
    });
    console.log('');

    // Test 8: Get Character Performance
    console.log('Test 8: Get Character Performance');
    const performance = await client.getCharacterPerformance();
    console.log('✓ Character performance data retrieved');
    console.log(`  Total characters: ${performance.data.length}`);
    console.log(`  Overall utilization: ${performance.summary.overall_utilization.toFixed(2)}%\n`);

    // Test 9: Format Character List
    console.log('Test 9: Format Character List for Bot');
    const formattedList = client.formatCharacterListForBot(allChars.data.slice(0, 3));
    console.log('✓ Formatted first 3 characters for bot response:');
    formattedList.forEach(char => {
      console.log(`  - ${char.name} (${char.archetype})`);
    });
    console.log('');

    console.log('=== All Tests Passed ===');
    console.log('\nCharacter API client is ready for integration with bot systems.');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();

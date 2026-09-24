# Character API Integration Guide

**Version:** 1.0
**Last Updated:** 2026-09-22
**Status:** Complete

---

## Overview

This guide explains how to integrate the bot systems (Telegram, WhatsApp, Social Media, Notion) with the depot automation character database via the unified character API.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Bot Systems                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Telegram   │  │  WhatsApp    │  │ Social Media │      │
│  │     Bot      │  │     Bot      │  │  Automation  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                           │                                 │
│                   ┌───────▼───────┐                        │
│                   │ Character API │                        │
│                   │    Client     │                        │
│                   └───────┬───────┘                        │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Unified      │
                    │  Character    │
                    │  API Server   │
                    │  (Port 8001)  │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  Depot        │
                    │  Automation   │
                    │  Character DB │
                    └───────────────┘
```

---

## Prerequisites

1. **Depot Automation Character API Running**
   - Navigate to: `/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/organizational/TZU-Archives/projects/depot-automation`
   - Run: `python unified_character_api.py`
   - Verify health: `curl http://localhost:8001/api/character-health`

2. **Shared Module Dependencies**
   - Navigate to: `/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/bots/shared`
   - Run: `npm install`
   - Verify axios is installed (already in package.json)

---

## Character API Client

The `CharacterAPIClient` class provides a unified interface to access character data from the depot automation system.

**Location:** `/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/bots/shared/character-api-client.js`

### Available Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `healthCheck()` | Check if the character API is healthy | Health status object |
| `getCharacters(filters)` | Get all characters with optional filters | Array of characters |
| `getCharacter(characterId)` | Get a specific character by ID | Character object or null |
| `searchCharacters(query)` | Search characters by name, archetype, or description | Array of matching characters |
| `getRandomCharacter()` | Get a random character | Random character object |
| `getCharactersByCategory(category)` | Get characters by category | Array of characters |
| `getContentCreators()` | Get content creator characters | Array of content creators |
| `generateContentIdea(characterId, contentType)` | Generate a content idea for a character | Content idea object |
| `generateBatchContentIdeas(count)` | Generate batch content ideas | Array of content ideas |
| `getBudgetSummary()` | Get budget utilization summary | Budget summary object |
| `getBudgetByArchetype()` | Get budget breakdown by archetype | Array of archetype budgets |
| `getCharacterBudget(characterId)` | Get character budget allocation | Budget allocation object |
| `getCharacterPerformance()` | Get character performance analytics | Performance data object |
| `getArchetypeBreakdown()` | Get archetype breakdown | Archetype breakdown object |
| `formatCharacterForBot(character)` | Format character data for bot responses | Formatted character object |
| `formatCharacterListForBot(characters)` | Format character list for bot responses | Array of formatted characters |

---

## Integration Examples

### 1. Telegram Bot Integration

**File:** `bots/telegram-bot/src/index.js`

```javascript
import CharacterAPIClient from '../shared/character-api-client.js';

// Initialize the client
const characterAPI = new CharacterAPIClient('http://localhost:8001');

// In your bot command handler:
bot.onText(/\/character (.+)/, async (msg, match) => {
  const characterName = match[1];

  try {
    // Search for the character
    const result = await characterAPI.searchCharacters(characterName);

    if (result.data.length === 0) {
      bot.sendMessage(msg.chat.id, `No character found matching "${characterName}"`);
      return;
    }

    // Format for bot response
    const character = characterAPI.formatCharacterForBot(result.data[0]);

    const response = `
*${character.name}*
${character.archetype} • ${character.rarity}

${character.description}

Budget: ${character.budget}
Categories: ${character.categories.join(', ')}
    `.trim();

    bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching character:', error);
    bot.sendMessage(msg.chat.id, 'Error fetching character data. Please try again.');
  }
});

// Random character command
bot.onText(/\/random/, async (msg) => {
  try {
    const result = await characterAPI.getRandomCharacter();
    const character = characterAPI.formatCharacterForBot(result.data);

    const response = `
*Random Character: ${character.name}*
${character.archetype} • ${character.rarity}

${character.description}
    `.trim();

    bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching random character:', error);
    bot.sendMessage(msg.chat.id, 'Error fetching character data. Please try again.');
  }
});
```

---

### 2. WhatsApp Bot Integration

**File:** `bots/whatsapp-bot/src/index.js`

```javascript
import CharacterAPIClient from '../shared/character-api-client.js';

// Initialize the client
const characterAPI = new CharacterAPIClient('http://localhost:8001');

// In your message handler:
async function handleCharacterCommand(message) {
  const characterName = message.body.split(' ').slice(1).join(' ');

  try {
    const result = await characterAPI.searchCharacters(characterName);

    if (result.data.length === 0) {
      await message.reply(`No character found matching "${characterName}"`);
      return;
    }

    const character = characterAPI.formatCharacterForBot(result.data[0]);

    const response = `
${character.name}
${character.archetype} • ${character.rarity}

${character.description}

Budget: ${character.budget}
Categories: ${character.categories.join(', ')}
    `.trim();

    await message.reply(response);
  } catch (error) {
    console.error('Error fetching character:', error);
    await message.reply('Error fetching character data. Please try again.');
  }
}
```

---

### 3. Social Media Automation Integration

**File:** `automation/social-media/src/index.js`

```javascript
import CharacterAPIClient from '../../bots/shared/character-api-client.js';

// Initialize the client
const characterAPI = new CharacterAPIClient('http://localhost:8001');

// Get content creators for social media posting
async function getContentCreators() {
  try {
    const result = await characterAPI.getContentCreators();
    return characterAPI.formatCharacterListForBot(result.data);
  } catch (error) {
    console.error('Error fetching content creators:', error);
    return [];
  }
}

// Generate content idea for a character
async function generateSocialContent(characterId) {
  try {
    const result = await characterAPI.generateContentIdea(characterId, 'social');
    return result.data;
  } catch (error) {
    console.error('Error generating content idea:', error);
    return null;
  }
}

// Get budget for character-based targeting
async function getCharacterBudget(characterId) {
  try {
    const result = await characterAPI.getCharacterBudget(characterId);
    return result.data;
  } catch (error) {
    console.error('Error fetching character budget:', error);
    return null;
  }
}
```

---

### 4. Notion Sync Integration

**File:** `automation/notion-sync/src/index.js`

```javascript
import CharacterAPIClient from '../../bots/shared/character-api-client.js';

// Initialize the client
const characterAPI = new CharacterAPIClient('http://localhost:8001');

// Sync characters to Notion
async function syncCharactersToNotion(notionClient, databaseId) {
  try {
    // Get all characters from depot automation
    const result = await characterAPI.getCharacters();
    const characters = result.data;

    // Sync to Notion
    for (const character of characters) {
      await notionClient.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [{ text: { content: character.name } }]
          },
          Archetype: {
            select: { name: character.archetype }
          },
          Rarity: {
            select: { name: character.rarity }
          },
          Budget: {
            number: character.allocated_budget
          },
          Description: {
            rich_text: [{ text: { content: character.description } }]
          }
        }
      });
    }

    console.log(`Synced ${characters.length} characters to Notion`);
  } catch (error) {
    console.error('Error syncing characters to Notion:', error);
  }
}
```

---

## Configuration

### Environment Variables

Add the following to your `.env` files:

```env
# Character API Configuration
CHARACTER_API_URL=http://localhost:8001
CHARACTER_API_ENABLED=true
CHARACTER_API_TIMEOUT=10000
```

### Initialization

```javascript
import CharacterAPIClient from '../shared/character-api-client.js';

// Read from environment
const characterApiUrl = process.env.CHARACTER_API_URL || 'http://localhost:8001';
const characterApiEnabled = process.env.CHARACTER_API_ENABLED === 'true';

// Initialize conditionally
let characterAPI = null;
if (characterApiEnabled) {
  characterAPI = new CharacterAPIClient(characterApiUrl);
}
```

---

## Error Handling

The CharacterAPIClient throws errors for API failures. Always wrap calls in try-catch blocks:

```javascript
try {
  const result = await characterAPI.getCharacters();
  // Process result
} catch (error) {
  console.error('Character API error:', error.message);
  // Fallback to local character database or return error message
}
```

### Fallback Strategy

If the character API is unavailable, you can fall back to the local character database:

```javascript
async function getCharacter(characterName) {
  try {
    // Try character API first
    const result = await characterAPI.searchCharacters(characterName);
    if (result.data.length > 0) {
      return result.data[0];
    }
  } catch (error) {
    console.log('Character API unavailable, falling back to local database');
  }

  // Fallback to local database
  return loadCharacterFromLocalDatabase(characterName);
}
```

---

## Testing

### Test Character API Health

```bash
curl http://localhost:8001/api/character-health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-22T...",
  "characters_loaded": 45,
  "data_source": "markdown",
  "budget_sync_status": "active"
}
```

### Test Character API Client

Create a test file `test-character-api.js`:

```javascript
import CharacterAPIClient from './shared/character-api-client.js';

const client = new CharacterAPIClient('http://localhost:8001');

async function test() {
  try {
    console.log('Testing health check...');
    const health = await client.healthCheck();
    console.log('Health:', health);

    console.log('\nTesting get characters...');
    const characters = await client.getCharacters({ limit: 5 });
    console.log(`Found ${characters.total} characters`);

    console.log('\nTesting random character...');
    const random = await client.getRandomCharacter();
    console.log('Random character:', random.data.name);

    console.log('\nTesting budget summary...');
    const budget = await client.getBudgetSummary();
    console.log('Total budget:', budget.data.total_allocated_budget);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
```

Run:
```bash
cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/bots/shared
node test-character-api.js
```

---

## API Endpoints Reference

### Character Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/characters` | GET | Get all characters with optional filters |
| `/api/characters/:id` | GET | Get specific character by ID |
| `/api/characters/search/:query` | GET | Search characters |
| `/api/characters/random` | GET | Get random character |
| `/api/characters/categories?category=X` | GET | Get characters by category |

### Content Generation Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content/generate/:id?type=social` | GET | Generate content idea for character |
| `/api/content/batch` | POST | Generate batch content ideas |
| `/api/content/creators` | GET | Get content creator characters |

### Budget Tracking Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/budget/summary` | GET | Get budget utilization summary |
| `/api/budget/by-archetype` | GET | Get budget by archetype |
| `/api/budget/character/:id` | GET | Get character budget allocation |
| `/api/budget/sync` | POST | Sync character budgets |
| `/api/budget/allocate` | POST | Allocate budget to asset |

### Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/character-performance` | GET | Get character performance analytics |
| `/api/analytics/archetype-breakdown` | GET | Get archetype breakdown |

### Utility Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/character-health` | GET | Health check |
| `/api/character-docs` | GET | API documentation |

---

## Troubleshooting

### Character API Not Responding

**Symptom:** `ECONNREFUSED` or timeout errors

**Solution:**
1. Verify the depot automation character API is running:
   ```bash
   cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/organizational/TZU-Archives/projects/depot-automation
   python unified_character_api.py
   ```

2. Check the port is correct (default: 8001):
   ```bash
   lsof -i :8001
   ```

3. Verify the URL in your bot configuration matches the API URL

### Character Data Not Loading

**Symptom:** Empty character arrays or "no characters found"

**Solution:**
1. Check the character data source in the depot automation system
2. Verify the character markdown files exist in the correct location
3. Check the API health endpoint for errors

### Budget Data Missing

**Symptom:** Budget fields are null or zero

**Solution:**
1. Run the budget sync in depot automation:
   ```bash
   cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/organizational/TZU-Archives/projects/depot-automation
   python character_holdings_sync.py
   ```

2. Verify the Holdings depot has asset data

---

## Next Steps

1. **Start the Character API**
   ```bash
   cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/organizational/TZU-Archives/projects/depot-automation
   python unified_character_api.py
   ```

2. **Integrate Character API Client into Bots**
   - Update Telegram bot to use CharacterAPIClient
   - Update WhatsApp bot to use CharacterAPIClient
   - Update Social Media automation to use CharacterAPIClient
   - Update Notion sync to use CharacterAPIClient

3. **Test Integrations**
   - Test each bot with character commands
   - Verify character data loads correctly
   - Verify budget data is accessible

4. **Deploy to Production**
   - Configure production URL for character API
   - Set up monitoring for API health
   - Implement fallback strategies for API failures

---

**Integration Status:** Ready for Implementation
**Character API Status:** Running on port 8001
**Documentation Version:** 1.0

---

*Generated with [Devin](https://devin.ai)*

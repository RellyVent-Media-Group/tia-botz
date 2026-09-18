# Notion Database Sync Configuration

## Overview

The integration hub provides endpoints to sync character data with Notion databases and retrieve schema templates for database setup.

## Notion Integration Endpoints

### 1. Sync Character Data to Notion
**Endpoint**: `POST http://localhost:3000/api/notion/sync`

**Request Body**:
```json
{
  "apiKey": "your_notion_api_key",
  "databaseId": "your_database_id",
  "syncMode": "full"
}
```

**Response**:
```json
{
  "success": true,
  "synced": 45,
  "errors": 0,
  "timestamp": "2026-09-17T20:30:10.216Z"
}
```

### 2. Get Notion Database Schema Template
**Endpoint**: `GET http://localhost:3000/api/notion/schema`

**Response**:
```json
{
  "databaseName": "Character Database",
  "properties": {
    "Name": {
      "type": "title",
      "title": {}
    },
    "Archetype": {
      "type": "select",
      "select": {
        "options": [
          {"name": "Digital Storyteller"},
          {"name": "Shadow Work Specialist"},
          {"name": "Wisdom Keeper"}
        ]
      }
    },
    "Rarity": {
      "type": "select",
      "select": {
        "options": [
          {"name": "Common"},
          {"name": "Rare"},
          {"name": "Legendary"}
        ]
      }
    },
    "Budget": {
      "type": "number",
      "number": {
        "format": "number"
      }
    },
    "Description": {
      "type": "rich_text",
      "rich_text": {}
    },
    "Hook Prompt": {
      "type": "rich_text",
      "rich_text": {}
    },
    "Branding Prompt": {
      "type": "rich_text",
      "rich_text": {}
    },
    "Trust Prompt": {
      "type": "rich_text",
      "rich_text": {}
    },
    "Status": {
      "type": "select",
      "select": {
        "options": [
          {"name": "Active"},
          {"name": "Inactive"},
          {"name": "Archived"}
        ]
      }
    }
  }
}
```

## Notion Setup Instructions

### Step 1: Create Notion Integration

1. **Go to Notion Developers**: https://www.notion.so/my-integrations
2. **Create New Integration**:
   - Name: "Character Database Hub"
   - Associated workspace: Select your workspace
   - Type: Internal
   - Capabilities: Read content, Update content, Insert content

3. **Get API Key**:
   - Copy the "Internal Integration Token"
   - Store securely (environment variable recommended)

### Step 2: Create Notion Database

**Option A: Manual Database Creation**

1. **Create New Database** in Notion
2. **Add Properties**:
   - Name (Title)
   - Archetype (Select)
   - Rarity (Select)
   - Budget (Number)
   - Description (Text)
   - Hook Prompt (Text)
   - Branding Prompt (Text)
   - Trust Prompt (Text)
   - Status (Select)
   - Last Synced (Date)

3. **Get Database ID**:
   - Open database in Notion
   - Copy ID from URL: `https://www.notion.so/your-workspace/{DATABASE_ID}?v=...`

**Option B: Use Schema Template**

1. **Fetch Schema**:
   ```bash
   curl http://localhost:3000/api/notion/schema > notion-schema.json
   ```

2. **Create Database Programmatically**:
   ```javascript
   const { Client } = require('@notionhq/client');
   const notion = new Client({ auth: 'your_api_key' });
   
   const schema = require('./notion-schema.json');
   
   await notion.databases.create({
     parent: { type: 'page_id', page_id: 'your_page_id' },
     title: [{ type: 'text', text: { content: 'Character Database' } }],
     properties: schema.properties
   });
   ```

### Step 3: Share Database with Integration

1. **Open Database Settings**
2. **Add Integration**:
   - Click "Add connections"
   - Select "Character Database Hub"
   - Click "Confirm"

### Step 4: Configure Environment Variables

```bash
# Set Notion credentials
export NOTION_API_KEY="your_notion_api_key"
export NOTION_DATABASE_ID="your_database_id"

# Or add to .env file
echo "NOTION_API_KEY=your_notion_api_key" >> .env
echo "NOTION_DATABASE_ID=your_database_id" >> .env
```

## Sync Operations

### Full Sync

Sync all characters from the hub to Notion:

```bash
curl -X POST http://localhost:3000/api/notion/sync \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key",
    "databaseId": "your_database_id",
    "syncMode": "full"
  }'
```

### Incremental Sync

Sync only changed characters:

```bash
curl -X POST http://localhost:3000/api/notion/sync \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key",
    "databaseId": "your_database_id",
    "syncMode": "incremental",
    "since": "2026-09-17T00:00:00Z"
  }'
```

### Single Character Sync

Sync a specific character:

```bash
curl -X POST http://localhost:3000/api/notion/sync \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key",
    "databaseId": "your_database_id",
    "syncMode": "single",
    "characterId": 1
  }'
```

## Automated Sync Setup

### Using Cron Jobs

```bash
# Add to crontab for daily sync
0 2 * * * cd /path/to/hub && node sync-notion.mjs

# Or sync every hour
0 * * * * cd /path/to/hub && node sync-notion.mjs
```

### Using Node.js Script

Create `sync-notion.mjs`:

```javascript
import fetch from 'node-fetch';

const HUB_URL = 'http://localhost:3000';
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function syncToNotion() {
  try {
    const response = await fetch(`${HUB_URL}/api/notion/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NOTION_API_KEY,
        databaseId: NOTION_DATABASE_ID,
        syncMode: 'full'
      })
    });

    const result = await response.json();
    console.log(`Sync completed: ${result.synced} characters synced`);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

syncToNotion();
```

### Using Webhook Triggers

Configure Notion to trigger sync on changes:

```javascript
// Notion webhook handler
app.post('/webhook/notion/sync', async (req, res) => {
  const { databaseId, eventType } = req.body;
  
  if (eventType === 'updated') {
    await syncToNotion();
  }
  
  res.json({ success: true });
});
```

## Data Mapping

### Character to Notion Property Mapping

| Character Field | Notion Property | Type |
|----------------|-----------------|------|
| name | Name | Title |
| archetype | Archetype | Select |
| rarity | Rarity | Select |
| allocatedBudget | Budget | Number |
| description | Description | Rich Text |
| prompts.hook | Hook Prompt | Rich Text |
| prompts.branding | Branding Prompt | Rich Text |
| prompts.trust | Trust Prompt | Rich Text |
| status | Status | Select |
| entityType | Entity Type | Select |
| gender | Gender | Select |
| keyToolCategory | Tool Categories | Multi-select |

### Custom Property Mapping

Configure custom mappings in the sync request:

```json
{
  "apiKey": "your_api_key",
  "databaseId": "your_database_id",
  "syncMode": "full",
  "mappings": {
    "name": "Character Name",
    "archetype": "Character Type",
    "rarity": "Tier",
    "allocatedBudget": "Funding"
  }
}
```

## Error Handling

### Common Errors

**Authentication Error**:
```json
{
  "error": "Invalid API key",
  "solution": "Verify NOTION_API_KEY is correct"
}
```

**Database Not Found**:
```json
{
  "error": "Database not found or not shared",
  "solution": "Share database with integration"
}
```

**Rate Limit Exceeded**:
```json
{
  "error": "Rate limit exceeded",
  "solution": "Implement retry with exponential backoff"
}
```

### Retry Strategy

```javascript
async function syncWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await syncToNotion();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Advanced Features

### Two-Way Sync

Implement bidirectional sync:

```javascript
async function twoWaySync() {
  // Sync hub → Notion
  await syncToNotion();
  
  // Sync Notion → Hub
  const notionData = await fetchFromNotion();
  await updateHubWithNotionData(notionData);
}
```

### Conflict Resolution

Handle conflicts between hub and Notion:

```javascript
function resolveConflict(hubData, notionData) {
  // Strategy: Last modified wins
  if (hubData.updated > notionData.updated) {
    return hubData;
  }
  return notionData;
  
  // Or: Hub wins
  // return hubData;
  
  // Or: Manual review
  // return flagForManualReview(hubData, notionData);
}
```

### Data Validation

Validate data before sync:

```javascript
function validateCharacter(character) {
  const required = ['name', 'archetype', 'rarity'];
  const missing = required.filter(field => !character[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
}
```

## Security Best Practices

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Use separate keys for dev/prod

2. **Access Control**:
   - Limit integration permissions
   - Use role-based access
   - Audit access logs
   - Revoke unused integrations

3. **Data Privacy**:
   - Encrypt sensitive data
   - Comply with data regulations
   - Implement data retention policies
   - Anonymize when possible

## Monitoring and Logging

### Sync Status Tracking

```javascript
async function trackSyncStatus() {
  const status = {
    lastSync: new Date(),
    charactersSynced: 45,
    errors: 0,
    duration: 2340
  };
  
  await saveSyncStatus(status);
  console.log('Sync status logged');
}
```

### Error Logging

```javascript
function logSyncError(error, character) {
  console.error({
    timestamp: new Date(),
    error: error.message,
    character: character.name,
    stack: error.stack
  });
}
```

## Troubleshooting

### Sync Fails Immediately

**Check**:
- API key is valid
- Database ID is correct
- Database is shared with integration
- Network connectivity to Notion

### Partial Sync Success

**Check**:
- Character data validation
- Property type matching
- Rate limiting
- Character-specific errors

### Slow Performance

**Optimize**:
- Batch requests
- Use incremental sync
- Reduce property count
- Cache frequently accessed data

## Quick Start Script

```bash
#!/bin/bash
# quick-notion-sync.sh

echo "Starting Notion sync..."

# Check environment variables
if [ -z "$NOTION_API_KEY" ] || [ -z "$NOTION_DATABASE_ID" ]; then
  echo "Error: NOTION_API_KEY and NOTION_DATABASE_ID must be set"
  exit 1
fi

# Perform sync
curl -X POST http://localhost:3000/api/notion/sync \
  -H "Content-Type: application/json" \
  -d "{
    \"apiKey\": \"$NOTION_API_KEY\",
    \"databaseId\": \"$NOTION_DATABASE_ID\",
    \"syncMode\": \"full\"
  }"

echo "Sync completed!"
```

## Usage Examples

### Manual Sync
```bash
export NOTION_API_KEY="secret_..."
export NOTION_DATABASE_ID="..."
./quick-notion-sync.sh
```

### Automated Daily Sync
```bash
# Add to crontab
0 2 * * * /path/to/quick-notion-sync.sh >> /var/log/notion-sync.log 2>&1
```

### Webhook Triggered Sync
```bash
# Call from external system
curl -X POST http://localhost:3000/api/notion/sync \
  -H "Content-Type: application/json" \
  -d @sync-config.json
```

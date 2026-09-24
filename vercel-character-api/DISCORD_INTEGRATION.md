# Discord Integration Guide

## 🎯 Overview

This guide explains how to integrate Discord webhooks and notifications with the Character API.

### Features Added

1. **Discord Webhook Receiver** (`POST /api/webhooks/discord`) - Receive events from Discord
2. **Discord Notification Sender** (`POST /api/notifications/discord`) - Send notifications to Discord
3. **Enhanced Health Endpoint** - Now shows Discord webhook configuration status

---

## 📥 Option C: Discord Notifications from Character API

The Character API can now send notifications to Discord via webhooks.

### Configuration

Add the Discord webhook URL to the Character API environment variables:

**Vercel**: Go to Project Settings → Environment Variables
```
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

**Local Development**: Add to `.env` file
```bash
DISCORD_WEBHOOK=https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO
```

### Usage Examples

#### Example 1: Send Simple Message
```bash
curl -X POST https://vercel-character-api.vercel.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{"content": "Character API is online! 🎉"}'
```

**Response**:
```json
{
  "status": "sent",
  "timestamp": "2026-09-24T12:34:56.789Z",
  "message": "Notification sent to Discord"
}
```

#### Example 2: Send Rich Embed
```bash
curl -X POST https://vercel-character-api.vercel.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{
    "content": "New character added!",
    "embeds": [{
      "title": "Character Created",
      "description": "A new character has been added to the database",
      "color": 3447003,
      "fields": [
        {"name": "Name", "value": "Mary Magnumbytes", "inline": true},
        {"name": "Archetype", "value": "Digital Storyteller", "inline": true}
      ],
      "timestamp": "2026-09-24T12:34:56.789Z"
    }]
  }'
```

#### Example 3: Custom Username and Avatar
```bash
curl -X POST https://vercel-character-api.vercel.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{
    "content": "System alert",
    "username": "ChiefPilot Bot",
    "avatar_url": "https://example.com/bot-avatar.png",
    "embeds": [{
      "title": "Alert",
      "description": "High memory usage detected",
      "color": 16711680
    }]
  }'
```

#### Example 4: From Discord Bot
In your Discord bot code (`bots/discord-bot/src/index.js`):

```javascript
import axios from 'axios';

async function sendCharacterNotification(character) {
  try {
    await axios.post(
      'https://vercel-character-api.vercel.app/api/notifications/discord',
      {
        content: `New character: ${character.name}`,
        embeds: [{
          title: character.name,
          description: character.bio || 'No description available',
          color: 0x0099ff,
          fields: [
            { name: 'Archetype', value: character.archetype, inline: true },
            { name: 'Rarity', value: character.rarity, inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log('Notification sent to Discord');
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  }
}
```

### Response Format

**Success** (200):
```json
{
  "status": "sent",
  "timestamp": "2026-09-24T12:34:56.789Z",
  "message": "Notification sent to Discord"
}
```

**Error** (400):
```json
{
  "error": "Invalid JSON",
  "details": "Expecting value: line 1 column 1 (char 0)"
}
```

---

## 📤 Option D: Discord Webhook Receiver

The Character API can now receive webhook events from Discord.

### Configuration

No additional configuration needed. The endpoint is always available at:
```
POST /api/webhooks/discord
```

### Usage Examples

#### Example 1: Configure Discord to Send Webhooks

1. In your Discord server, create a webhook:
   - Server Settings → Integrations → Webhooks → New Webhook
   - Copy the webhook URL
   
2. Configure your Discord bot to send events to the Character API:

```javascript
// In bots/discord-bot/src/index.js
import axios from 'axios';

// Send event to Character API when a message is received
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  try {
    await axios.post(
      'https://vercel-character-api.vercel.app/api/webhooks/discord',
      {
        event: 'message',
        guild_id: message.guildId,
        channel_id: message.channelId,
        user_id: message.author.id,
        user_name: message.author.username,
        content: message.content,
        timestamp: message.createdAt.toISOString()
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Failed to send webhook:', error.message);
  }
});
```

#### Example 2: Send Character Request Events

```javascript
// When a character is requested via slash command
case 'character':
  const charName = interaction.options.getString('name');
  
  // Send event to Character API
  await axios.post(
    'https://vercel-character-api.vercel.app/api/webhooks/discord',
    {
      event: 'character_request',
      user_id: interaction.user.id,
      user_name: interaction.user.username,
      character_name: charName,
      timestamp: new Date().toISOString()
    }
  );
  
  // Then get the character
  const character = await characterAPI.searchCharacters(charName);
  // ... rest of the command
```

### Response Format

**Success** (200):
```json
{
  "status": "received",
  "timestamp": "2026-09-24T12:34:56.789Z",
  "event": "message",
  "message": "Webhook event logged"
}
```

**Error** (400):
```json
{
  "error": "Invalid JSON",
  "details": "Expecting value: line 1 column 1 (char 0)"
}
```

---

## 🎯 Use Cases

### Use Case 1: Character Creation Notifications
When a new character is created via the API, notify Discord:

```javascript
// After creating a character
const newCharacter = { name: 'New Hero', archetype: 'Warrior' };

await axios.post('https://vercel-character-api.vercel.app/api/notifications/discord', {
  content: '🆕 New Character Created',
  embeds: [{
    title: newCharacter.name,
    description: `A new ${newCharacter.archetype} has been added`,
    color: 0x00ff00
  }]
});
```

### Use Case 2: Error Alerts
When an error occurs in the API, alert Discord:

```python
# In Character API code
try:
    # Some operation
    pass
except Exception as e:
    import requests
    import json
    
    requests.post(
        'https://vercel-character-api.vercel.app/api/notifications/discord',
        json={
            'content': '@here API Error Alert',
            'embeds': [{
                'title': 'Error Alert',
                'description': str(e),
                'color': 0xff0000,
                'timestamp': datetime.datetime.now().isoformat()
            }]
        }
    )
```

### Use Case 3: Daily Summary Reports
Send a daily summary to Discord:

```bash
# Cron job or scheduled task
curl -X POST https://vercel-character-api.vercel.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{
    "content": "📊 Daily Summary Report",
    "embeds": [{
      "title": "Today\'s Statistics",
      "description": "Character API usage for today",
      "color": 0x0099ff,
      "fields": [
        {"name": "Total Requests", "value": "1,234", "inline": true},
        {"name": "Characters Viewed", "value": "456", "inline": true},
        {"name": "New Characters", "value": "7", "inline": true}
      ],
      "timestamp": "2026-09-24T00:00:00.000Z"
    }]
  }'
```

### Use Case 4: Two-Way Sync
Discord events trigger Character API actions, and vice versa:

1. **Discord → Character API**: When a user requests a character in Discord, log it in the Character API
2. **Character API → Discord**: When a character is updated, notify Discord

---

## 📊 Endpoints Summary

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| GET | `/api/character-health` | Health check with Discord status | application/json |
| GET | `/health` | Health check with Discord status | application/json |
| POST | `/api/webhooks/discord` | Receive Discord webhook events | application/json |
| POST | `/api/notifications/discord` | Send notifications to Discord | application/json |

---

## 🔧 Testing

### Test Health Endpoint
```bash
curl https://vercel-character-api.vercel.app/api/character-health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-24T12:34:56.789Z",
  "message": "Character API is running on Vercel",
  "discord_webhook": "configured"
}
```

### Test Notification Endpoint
```bash
curl -X POST https://vercel-character-api.vercel.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{"content": "Test notification"}'
```

### Test Webhook Receiver
```bash
curl -X POST https://vercel-character-api.vercel.app/api/webhooks/discord \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "message": "Webhook test"}'
```

---

## 🛠️ Integration with Discord Bot

The Discord bot (`bots/discord-bot/`) is already configured to work with the Character API. To enable Discord notifications:

### Step 1: Update Discord Bot Configuration

In `bots/discord-bot/.env` or Railway environment variables:
```
CHARACTER_API_URL=https://vercel-character-api.vercel.app
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK
```

### Step 2: Add Notification Function

In `bots/discord-bot/src/index.js`, add:

```javascript
// Notification helper
async function notifyDiscord(message, embed = null) {
  if (!process.env.CHARACTER_API_URL) return;
  
  try {
    const payload = { content: message };
    if (embed) payload.embeds = [embed];
    
    await axios.post(
      `${process.env.CHARACTER_API_URL}/api/notifications/discord`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Discord notification failed:', error.message);
  }
}
```

### Step 3: Use Notifications in Commands

```javascript
// Example: Notify when character is requested
case 'character':
  const charName = interaction.options.getString('name');
  
  // Notify Discord about the request
  await notifyDiscord(`Character requested: ${charName}`, {
    title: 'Character Request',
    description: `${interaction.user.username} requested ${charName}`,
    color: 0x0099ff,
    timestamp: new Date().toISOString()
  });
  
  // Get character from API
  const character = await characterAPI.searchCharacters(charName);
  // ... rest of the command
```

---

## 📝 Field Reference

### Notification Endpoint (`/api/notifications/discord`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ❌ | Plain text message content |
| `embeds` | array | ❌ | Array of embed objects |
| `username` | string | ❌ | Override bot username |
| `avatar_url` | string | ❌ | Override bot avatar |

### Webhook Receiver (`/api/webhooks/discord`)

Accepts any JSON payload. Common fields:

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Type of event (message, character_request, etc.) |
| `guild_id` | string | Discord server ID |
| `channel_id` | string | Discord channel ID |
| `user_id` | string | Discord user ID |
| `user_name` | string | Discord username |
| `timestamp` | string | ISO timestamp |

---

## 🚨 Troubleshooting

### Notifications Not Sending

1. **Check DISCORD_WEBHOOK**:
   ```bash
   echo $DISCORD_WEBHOOK
   ```

2. **Test webhook manually**:
   ```bash
   curl -X POST YOUR_DISCORD_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

3. **Check Character API logs**:
   ```bash
   # If running locally
   python api/index.py
   ```

### Webhook Events Not Received

1. **Verify endpoint URL**:
   ```
   https://vercel-character-api.vercel.app/api/webhooks/discord
   ```

2. **Check Vercel logs**:
   - Go to Vercel dashboard
   - Select the Character API project
   - View "Functions" tab for logs

3. **Test with curl**:
   ```bash
   curl -X POST https://vercel-character-api.vercel.app/api/webhooks/discord \
     -H "Content-Type: application/json" \
     -d '{"event": "test"}'
   ```

---

## 📚 Additional Resources

- [Discord Webhooks Documentation](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)
- [Discord API Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Character API Documentation](../README.md)
- [Discord Bot Documentation](../../bots/discord-bot/RAILWAY_DEPLOYMENT.md)

---

*Document Version*: 1.0.0
*Last Updated*: 2026-09-24
*Author*: Mistral Vibe

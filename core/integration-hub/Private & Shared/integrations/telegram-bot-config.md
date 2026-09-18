# Telegram Bot Integration Guide

## Overview

The Telegram bot has been integrated with the character database hub to provide character search, retrieval, and prompt access via Telegram commands.

## Configuration

### Environment Variables

Set the following environment variables to configure the Telegram bot:

```bash
# Required: Telegram Bot Token
export TELEGRAM_BOT_TOKEN="your_telegram_bot_token"

# Optional: Hub URL (defaults to http://localhost:3000)
export HUB_URL="http://localhost:3000"

# Optional: Stripe Payment Link (defaults to test link)
export STRIPE_PAYMENT_LINK="https://buy.stripe.com/test"
```

### Getting Telegram Bot Token

1. **Start a conversation with @BotFather** on Telegram
2. **Send `/newbot`** command
3. **Follow the instructions** to create your bot
4. **Copy the API token** provided by BotFather
5. **Set the token** as `TELEGRAM_BOT_TOKEN` environment variable

## Integration Changes

### API Endpoint Updates

The bot now uses the integration hub's API endpoints:

- **Character Search**: `GET /api/characters/search/{name}`
- **All Characters**: `GET /api/characters`
- **Random Character**: `GET /api/characters/random`

### Data Structure Updates

The bot now expects the hub's response format:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mary Magnumbytes",
      "archetype": "Digital Storyteller",
      "rarity": "Legendary",
      "description": "...",
      "prompts": {
        "hook": "...",
        "branding": "...",
        "trust": "..."
      }
    }
  ]
}
```

## Available Commands

### `/start`
Initializes the bot and shows welcome message.

**Response**:
```
🎭 Welcome to AI Character Prompts!

Get creative AI character prompts for your stories, games, and creative projects.

📖 Available Commands:
/search <name> - Search for a character
/list - List all available characters
/random - Get a random character prompt
/status - Check your usage and subscription
/upgrade - Upgrade to premium for unlimited access
/help - Show this help message

✨ Free tier: 5 prompts per day
🔥 Premium: Unlimited access
```

### `/search <name>`
Search for a specific character by name.

**Example**: `/search Mary Magnumbytes`

**Response**:
```
🎭 Mary Magnumbytes
⭐ Legendary

📝 Description:
Age 36, Caucasian/German-American heritage. AI-powered content creator...

🎯 Archetype: Digital Storyteller
🔧 Tool Category: Content Creation, Technology, Visual Arts

💬 Hook Prompt:
Cinematic epic portrait of Mary Magnumbytes, sharp dark bob hair glowing with circuit light...
```

### `/list`
List all available characters (sent in chunks of 20).

**Response**:
```
📜 Characters (1-20):

1. Mary Magnumbytes
2. Mac Nazarene
3. Tony Lerome
...
```

### `/random`
Get a random character prompt.

**Response**:
```
🎲 Random Character: Aaron Starhunter
⭐ Rare

📝 Description:
...

🎯 Archetype: ...
🔧 Tool Category: ...

💬 Hook Prompt:
...
```

### `/status`
Check your daily usage and subscription tier.

**Response**:
```
📊 Your Account Status

🎯 Tier: ✨ Free

📈 Usage Today:
  2 / 5 prompts used
  3 prompts remaining

🔗 Upgrade for unlimited access:
[🔥 Upgrade to Premium]
```

### `/upgrade`
Show upgrade information and payment link.

**Response**:
```
🔥 Upgrade to Premium

Benefits:
✅ Unlimited character prompts
✅ Advanced search filters
✅ Priority support
✅ Early access to new characters

💰 Price: $9.99/month

Click below to upgrade:
[💳 Upgrade Now]
```

### `/help`
Show help message with all commands.

## Usage Limits

### Free Tier
- **Daily Limit**: 5 prompts per day
- **Features**: Basic search and retrieval
- **Reset**: Midnight local time

### Premium Tier
- **Daily Limit**: Unlimited
- **Features**: All features + priority support
- **Activation**: Via Stripe payment link

## Running the Bot

### Start the Hub First
```bash
# Ensure the integration hub is running
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared"
node universal-integration-hub.mjs
```

### Start the Telegram Bot
```bash
# Set environment variables
export TELEGRAM_BOT_TOKEN="your_token"
export HUB_URL="http://localhost:3000"

# Start the bot
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots"
node telegram-bot.mjs
```

### Using npm Script (if configured)
```bash
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared"
npm run telegram-bot
```

## Testing the Bot

### Manual Testing
1. **Start the bot** with your token
2. **Open Telegram** and find your bot
3. **Send `/start`** to initialize
4. **Test commands**:
   - `/search Mary`
   - `/list`
   - `/random`
   - `/status`

### Using curl to Test Hub Endpoints
```bash
# Test hub is running
curl http://localhost:3000/health

# Test character search
curl http://localhost:3000/api/characters/search/Mary

# Test random character
curl http://localhost:3000/api/characters/random
```

## Troubleshooting

### Bot Not Responding

**Check Hub Status**:
```bash
curl http://localhost:3000/health
```

**Check Bot Logs**:
- Bot should output "Telegram bot started..."
- Check for polling errors in console

**Verify Token**:
- Ensure `TELEGRAM_BOT_TOKEN` is set correctly
- Test token with Telegram's API

### Character Not Found

**Check Hub Data**:
```bash
curl http://localhost:3000/api/characters
```

**Verify Search Term**:
- Check spelling of character name
- Use `/list` to see available characters

### API Connection Errors

**Check HUB_URL**:
- Ensure `HUB_URL` points to correct endpoint
- Default: `http://localhost:3000`
- Verify hub is running on that port

**Network Issues**:
- Check firewall settings
- Ensure localhost connections are allowed
- Test with curl: `curl http://localhost:3000/api/characters`

### Usage Limit Errors

**Check User Data**:
- User data is stored in memory (Map)
- Resets daily at midnight
- Check `/status` command for current usage

**Reset Limits**:
- Restart bot to clear in-memory data
- Wait for midnight reset
- Upgrade to premium for unlimited access

## Advanced Configuration

### Custom Message Templates

Modify the message templates in `telegram-bot.mjs`:

```javascript
const characterMessage = `
🎭 ${character.name}
${character.rarity ? `⭐ ${character.rarity}` : ''}

📝 Description:
${character.description || 'No description available'}

// Add custom fields here
`;
```

### Additional Commands

Add new commands to the bot:

```javascript
// Command: /filter
bot.onText(/\/filter (.+)/, async (msg, match) => {
  const filter = match[1];
  // Implement filter logic
  const response = await fetch(`${HUB_URL}/api/characters?rarity=${filter}`);
  // Send response
});
```

### Persistent User Data

Replace in-memory Map with database:

```javascript
// Replace with database integration
import { getUserData, saveUserData } from './database';

async function getUserUsage(userId) {
  return await getUserData(userId);
}

async function saveUserUsage(userId, data) {
  await saveUserData(userId, data);
}
```

## Integration with Webhooks

Use Telegram webhooks instead of polling:

```javascript
// Set webhook
bot.setWebHook('https://your-domain.com/telegram-webhook');

// Or use the hub's webhook endpoint
bot.setWebHook('http://localhost:3000/webhook/telegram');
```

## Security Considerations

1. **Token Security**:
   - Never commit `TELEGRAM_BOT_TOKEN` to version control
   - Use environment variables
   - Rotate tokens periodically

2. **Rate Limiting**:
   - Bot implements daily limits for free users
   - Consider adding rate limiting per user
   - Monitor for abuse

3. **Input Validation**:
   - Sanitize user input
   - Validate character names
   - Handle special characters

4. **Error Handling**:
   - Never expose stack traces to users
   - Log errors server-side
   - Provide user-friendly error messages

## Monitoring and Logging

### Enable Logging

```javascript
// Add logging to bot
bot.on('message', (msg) => {
  console.log(`User ${msg.from.id}: ${msg.text}`);
});
```

### Track Usage

```javascript
// Track command usage
const commandUsage = new Map();

bot.onText(/\/(.+)/, (msg, match) => {
  const command = match[1];
  commandUsage.set(command, (commandUsage.get(command) || 0) + 1);
});
```

## Deployment

### Production Deployment

1. **Use Environment Variables**:
   ```bash
   export TELEGRAM_BOT_TOKEN="production_token"
   export HUB_URL="https://your-production-url.com"
   ```

2. **Use Process Manager**:
   ```bash
   # Using PM2
   pm2 start telegram-bot.mjs --name "character-bot"
   pm2 save
   ```

3. **Set Up Monitoring**:
   - Monitor bot uptime
   - Track error rates
   - Monitor user growth

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY bots/telegram-bot.mjs .
COPY package*.json .
RUN npm install
CMD ["node", "telegram-bot.mjs"]
```

## Quick Start Commands

```bash
# Set environment variables
export TELEGRAM_BOT_TOKEN="your_token"
export HUB_URL="http://localhost:3000"

# Start hub (in one terminal)
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared"
node universal-integration-hub.mjs

# Start bot (in another terminal)
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots"
node telegram-bot.mjs

# Test hub endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/characters/random
```

## Integration Complete

The Telegram bot is now fully integrated with the character database hub and can:
- Search characters via `/search`
- List all characters via `/list`
- Get random characters via `/random`
- Track usage limits for free/premium tiers
- Display character prompts and descriptions
- Upgrade users to premium via Stripe

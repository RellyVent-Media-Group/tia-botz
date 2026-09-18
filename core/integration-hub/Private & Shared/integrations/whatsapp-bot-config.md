# WhatsApp Bot Integration Guide

## Overview

The WhatsApp bot has been integrated with the character database hub to provide character search, retrieval, and prompt access via WhatsApp messages.

## Configuration

### Environment Variables

Set the following environment variables to configure the WhatsApp bot:

```bash
# Optional: Hub URL (defaults to http://localhost:3000)
export HUB_URL="http://localhost:3000"

# Optional: Stripe Payment Link (defaults to test link)
export STRIPE_PAYMENT_LINK="https://buy.stripe.com/test"
```

### Prerequisites

1. **Node.js**: Install Node.js (v14 or higher)
2. **whatsapp-web.js**: Install via npm
3. **qrcode-terminal**: Install via npm

```bash
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots"
npm install whatsapp-web.js qrcode-terminal
```

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

### `/start` or `start`
Initializes the bot and shows welcome message.

**Response**:
```
🎭 Welcome to AI Character Prompts!

Get creative AI character prompts for your stories, games, and creative projects.

📖 Available Commands:
/search <name> - Search for a character
/random - Get a random character
/batch <count> - Get multiple character prompts
/products - View available products
/workflow - Get workflow guidance
/status - Check your usage and subscription
/upgrade - Upgrade to premium
/help - Show this help message

✨ Free tier: 5 prompts per day
🔥 Premium: Unlimited access
```

### `/search <name>` or `search <name>`
Search for a specific character by name.

**Example**: `search Mary Magnumbytes`

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

### `/random` or `random`
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

### `/batch <count>` or `batch <count>` (Premium Only)
Get multiple random characters at once (1-10).

**Example**: `batch 5`

**Response**:
```
📦 Batch of 5 Characters:

1. Mary Magnumbytes
   ⭐ Legendary
   Age 36, Caucasian/German-American heritage...

2. Mac Nazarene
   ⭐ Legendary
   Age 33, Afro-American/Ameri-Indian heritage...

...
```

### `/products` or `products`
View available products and pricing.

**Response**:
```
📦 Available Products

1. Single Character Prompt - $2.99
   Perfect for testing out our prompts

2. 10 Character Pack - $19.99
   Great for small projects

3. All 45 Characters - $49.99
   Complete character database

4. Premium Subscription - $9.99/month
   Unlimited access to all features:
   ✅ Unlimited character prompts
   ✅ Batch requests (up to 10 at once)
   ✅ Advanced search filters
   ✅ Priority support
   ✅ Early access to new characters

5. Starter Kit - $29.99
   Complete package including:
   ✅ All character prompts
   ✅ Marketing templates
   ✅ Workflow guides
   ✅ Launch checklist
```

### `/workflow` or `workflow`
Get workflow guidance for using prompts.

**Response**:
```
📋 Workflow Guidance

Getting Started with AI Character Prompts:

1️⃣ CHARACTER SELECTION
   - Use /search to find specific characters
   - Use /batch (premium) to get multiple options
   - Review descriptions and archetypes

2️⃣ PROMPT INTEGRATION
   - Copy the hook prompt for your AI tool
   - Use the backstory for context
   - Apply attributes to shape responses

3️⃣ CUSTOMIZATION
   - Modify prompts to fit your needs
   - Combine multiple characters
   - Adjust tone and style

4️⃣ CONTENT CREATION
   - Generate stories, dialogues, or scenarios
   - Use character attributes consistently
   - Maintain archetype integrity

5️⃣ ITERATION
   - Refine prompts based on output
   - Track what works best
   - Build your prompt library
```

### `/status` or `status`
Check your daily usage and subscription tier.

**Response**:
```
📊 Your Account Status

🎯 Tier: ✨ Free

📈 Usage Today:
  2 / 5 prompts used
  3 prompts remaining

🔗 Upgrade for unlimited access:
https://buy.stripe.com/test
```

### `/upgrade` or `upgrade`
Show upgrade information and payment link.

**Response**:
```
🔥 Upgrade to Premium

Benefits:
✅ Unlimited character prompts
✅ Batch requests (up to 10 at once)
✅ Advanced search filters
✅ Priority support
✅ Early access to new characters

💰 Price: $9.99/month

🔗 Upgrade: https://buy.stripe.com/test
```

### `/help` or `help`
Show help message with all commands.

## Usage Limits

### Free Tier
- **Daily Limit**: 5 prompts per day
- **Features**: Basic search and retrieval
- **Reset**: Midnight local time
- **No Access**: Batch requests (premium only)

### Premium Tier
- **Daily Limit**: Unlimited
- **Features**: All features + priority support
- **Batch Requests**: Up to 10 characters at once
- **Activation**: Via Stripe payment link

## Running the Bot

### Start the Hub First
```bash
# Ensure the integration hub is running
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared"
node universal-integration-hub.mjs
```

### Start the WhatsApp Bot
```bash
# Set environment variables
export HUB_URL="http://localhost:3000"

# Start the bot
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots"
node whatsapp-bot.mjs
```

### First-Time Setup (QR Code)

1. **Start the bot**: Run the command above
2. **Scan QR Code**: The bot will display a QR code in the terminal
3. **Open WhatsApp**: On your phone, open WhatsApp
4. **Link Device**: Go to Settings → Linked Devices → Link a Device
5. **Scan QR**: Scan the QR code displayed in the terminal
6. **Ready**: Bot will confirm "WhatsApp bot is ready!"

### Using npm Script (if configured)
```bash
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared"
npm run whatsapp-bot
```

## Testing the Bot

### Manual Testing
1. **Start the bot** and scan QR code
2. **Open WhatsApp** and message your own number
3. **Send `/start`** to initialize
4. **Test commands**:
   - `search Mary`
   - `random`
   - `status`

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

### QR Code Not Displaying

**Check Dependencies**:
```bash
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots"
npm install whatsapp-web.js qrcode-terminal
```

**Check Terminal**: Ensure terminal supports QR code display

### Bot Not Responding

**Check Hub Status**:
```bash
curl http://localhost:3000/health
```

**Check Bot Logs**:
- Bot should output "Starting WhatsApp bot..."
- Check for error messages in console
- Verify QR code was scanned successfully

**Verify Connection**:
- Ensure WhatsApp is linked
- Check internet connection
- Verify WhatsApp Web is not logged out

### Character Not Found

**Check Hub Data**:
```bash
curl http://localhost:3000/api/characters
```

**Verify Search Term**:
- Check spelling of character name
- Use `/help` to see available commands

### API Connection Errors

**Check HUB_URL**:
- Ensure `HUB_URL` points to correct endpoint
- Default: `http://localhost:3000`
- Verify hub is running on that port

**Network Issues**:
- Check firewall settings
- Ensure localhost connections are allowed
- Test with curl: `curl http://localhost:3000/api/characters`

### WhatsApp Session Issues

**Clear Session**:
```bash
# Delete the .wwebjs_auth folder
rm -rf "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots/.wwebjs_auth"
```

**Re-scan QR**: Restart bot and scan QR code again

### Usage Limit Errors

**Check User Data**:
- User data is stored in memory (Map)
- Resets daily at midnight
- Check `status` command for current usage

**Reset Limits**:
- Restart bot to clear in-memory data
- Wait for midnight reset
- Upgrade to premium for unlimited access

## Advanced Configuration

### Custom Message Templates

Modify the message templates in `whatsapp-bot.mjs`:

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
if (body.startsWith('/filter ') || body.startsWith('filter ')) {
  const filter = body.replace(/^\/?filter\s+/, '').trim();
  // Implement filter logic
  const response = await fetch(`${HUB_URL}/api/characters?rarity=${filter}`);
  // Send response
}
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

### Custom Webhook Integration

Use webhooks for external integrations:

```javascript
// Send data to external webhook
async function sendToWebhook(data) {
  await fetch('https://your-webhook.com/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
```

## Security Considerations

1. **Session Security**:
   - WhatsApp sessions are stored locally
   - Use secure file permissions for `.wwebjs_auth`
   - Don't share session files

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
client.on('message', (message) => {
  console.log(`User ${message.from}: ${message.body}`);
});
```

### Track Usage

```javascript
// Track command usage
const commandUsage = new Map();

client.on('message', (message) => {
  const command = message.body.split(' ')[0];
  commandUsage.set(command, (commandUsage.get(command) || 0) + 1);
});
```

## Deployment

### Production Deployment

1. **Use Environment Variables**:
   ```bash
   export HUB_URL="https://your-production-url.com"
   ```

2. **Use Process Manager**:
   ```bash
   # Using PM2
   pm2 start whatsapp-bot.mjs --name "whatsapp-character-bot"
   pm2 save
   ```

3. **Set Up Monitoring**:
   - Monitor bot uptime
   - Track error rates
   - Monitor user growth

4. **Session Persistence**:
   - Use persistent storage for sessions
   - Backup session files
   - Implement session recovery

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY bots/whatsapp-bot.mjs .
COPY package*.json .
RUN npm install
CMD ["node", "whatsapp-bot.mjs"]
```

## Multi-Device Support

WhatsApp Web API supports multi-device:

```javascript
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'character-bot' // Unique ID for this bot
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});
```

## Quick Start Commands

```bash
# Set environment variables
export HUB_URL="http://localhost:3000"

# Start hub (in one terminal)
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared"
node universal-integration-hub.mjs

# Start bot (in another terminal)
cd "/Users/jypsee72/Desktop/Eternity_Calls/Private & Shared/bots"
node whatsapp-bot.mjs

# Scan QR code when prompted
# Test hub endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/characters/random
```

## Integration Complete

The WhatsApp bot is now fully integrated with the character database hub and can:
- Search characters via `search`
- Get random characters via `random`
- Batch requests via `batch` (premium only)
- Display product information via `products`
- Provide workflow guidance via `workflow`
- Track usage limits for free/premium tiers
- Display character prompts and descriptions
- Upgrade users to premium via Stripe
- Support multi-device WhatsApp sessions

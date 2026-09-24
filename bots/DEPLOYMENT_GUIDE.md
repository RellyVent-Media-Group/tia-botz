# Bot Deployment Guide

## 🎯 Overview

This guide provides step-by-step instructions for deploying all ChiefPilot bots (Discord, Telegram, WhatsApp) to Railway.

**Current Status**: 
- ✅ Discord bot code is ready with health endpoint
- ✅ Deployment configuration files exist
- ⚠️  Bot is not yet deployed (placeholder URL responding)

---

## 🤖 Discord Bot Deployment

### ✅ What's Already Configured

The Discord bot (`bots/discord-bot/`) already has:

1. **Health Endpoint** (`src/index.js` lines 328-346):
   ```javascript
   const server = http.createServer((req, res) => {
     if (req.url === '/health') {
       res.writeHead(200, { 'Content-Type': 'application/json' });
       res.end(JSON.stringify({
         status: 'healthy',
         timestamp: new Date().toISOString(),
         discord: client.isReady() ? 'connected' : 'disconnected'
       }));
     } else {
       res.writeHead(404);
       res.end('Not found');
     }
   });
   ```

2. **Railway Configuration**:
   - `Procfile`: `web: node src/index.js`
   - `railway.json`: Build and deploy settings
   - `.env.example`: Environment variable template
   - `railway.env.example`: Railway-specific variables

3. **Deployment Guide**: `RAILWAY_DEPLOYMENT.md`

### 🚀 Deployment Steps

#### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name: `ChiefPilot Bot`
4. Go to **Bot** tab
5. Click "Add Bot"
6. Copy **Bot Token** (keep this secret!)
7. Copy **Application ID** (this is your Client ID)

#### Step 2: Deploy to Railway

**Option A: Manual Deployment (Recommended)**

1. Go to [Railway.app](https://railway.app)
2. Sign in to your account
3. Click "New Project"
4. Click "Deploy from GitHub repo"
5. Connect your GitHub account
6. Select `24-Tak-14/tia-botz` repository
7. Set **Root Directory** to: `bots/discord-bot`
8. Click "Deploy"

**Option B: Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to bot directory
cd bots/discord-bot

# Initialize Railway project
railway init

# Create new project
railway create

# Set environment variables
railway variables set DISCORD_BOT_TOKEN=your_actual_token
railway variables set DISCORD_CLIENT_ID=your_actual_client_id
railway variables set CHARACTER_API_URL=https://vercel-character-api.vercel.app
railway variables set NODE_ENV=production

# Deploy
railway up
```

#### Step 3: Configure Environment Variables

In Railway project dashboard, go to **Variables** tab and add:

| Variable | Value | Required |
|----------|-------|----------|
| `DISCORD_BOT_TOKEN` | Your Discord bot token | ✅ Yes |
| `DISCORD_CLIENT_ID` | Your Discord application ID | ✅ Yes |
| `CHARACTER_API_URL` | `https://vercel-character-api.vercel.app` | ✅ Yes |
| `DATABASE_PATH` | `/tmp/chiefpilot.db` | ❌ No (default) |
| `NODE_ENV` | `production` | ❌ No (default) |
| `PORT` | `3000` | ❌ No (default) |

#### Step 4: Verify Deployment

Once deployed:

1. **Check health endpoint**:
   ```bash
   curl https://your-bot-url.railway.app/health
   ```

   **Expected Response**:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-09-24T12:34:56.789Z",
     "discord": "connected"
   }
   ```

2. **Check Railway logs** for any errors
3. **Invite bot to your server** (see Step 5)

#### Step 5: Add Bot to Discord Server

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** → **URL Generator**
4. Select scopes:
   - `bot`
   - `applications.commands`
5. Select permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Use Slash Commands
6. Copy the generated URL
7. Open in browser and select your server
8. Bot should appear in your server

#### Step 6: Test Bot Commands

In Discord, test these commands:

```
/help                    - Show available commands
/character [name]        - Get character information
/random                  - Get a random character
/prompt [topic]          - Generate a creative prompt
/api search [query]      - Search characters
/api random              - Get random character
/api creators            - Get content creators
/api budget              - Get budget summary
/api performance         - Get character performance
/status                  - Check subscription status
/subscribe              - Subscribe to premium
/health                  - Check bot health
```

---

## 📱 Telegram Bot Deployment

### ⚠️ Status: Not Yet Created

The Telegram bot needs to be created. Here's the structure:

### Step 1: Create Bot Files

```bash
mkdir -p bots/telegram-bot/src
```

### Step 2: Create `bots/telegram-bot/package.json`

```json
{
  "name": "chiefpilot-telegram-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "telegraf": "^4.16.3",
    "dotenv": "^16.0.3",
    "express": "^4.18.2"
  }
}
```

### Step 3: Create `bots/telegram-bot/src/index.js`

```javascript
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Start command
bot.start((ctx) => ctx.reply('Welcome to ChiefPilot!'));

// Help command
bot.help((ctx) => ctx.reply('/start - Start\n/help - Help\n/character - Character info'));

// Character command
bot.command('character', async (ctx) => {
  await ctx.reply('Character feature coming soon!');
});

// Health endpoint
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      telegram: bot.isPolling ? 'connected' : 'disconnected'
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

// Start bot
bot.launch();
console.log('Telegram bot started');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

### Step 4: Create Railway Configuration

**`bots/telegram-bot/Procfile`**:
```
web: node src/index.js
```

**`bots/telegram-bot/railway.json`**:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

**`bots/telegram-bot/.env.example`**:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=production
PORT=3000
```

### Step 5: Create Telegram Bot

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Follow instructions to get bot token
4. Save the token

### Step 6: Deploy to Railway

Same process as Discord bot:
1. Go to Railway.app
2. Create new project from GitHub
3. Set root directory to `bots/telegram-bot`
4. Add environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `NODE_ENV=production`
5. Deploy

### Step 7: Test

```bash
curl https://your-telegram-bot-url.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-24T12:34:56.789Z",
  "telegram": "connected"
}
```

---

## 💬 WhatsApp Bot Deployment

### ⚠️ Status: Not Yet Created

WhatsApp requires either:
- **Official API** (requires Facebook Business verification)
- **Unofficial libraries** (may violate ToS)

**Recommended**: Use **Twilio WhatsApp API** (official partnership)

### Step 1: Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for account
3. Enable WhatsApp Sandbox
4. Follow verification process

### Step 2: Create Bot Files

```bash
mkdir -p bots/whatsapp-bot/src
```

### Step 3: Create `bots/whatsapp-bot/package.json`

```json
{
  "name": "chiefpilot-whatsapp-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "twilio": "^4.21.0",
    "dotenv": "^16.0.3",
    "express": "^4.18.2"
  }
}
```

### Step 4: Create `bots/whatsapp-bot/src/index.js`

```javascript
import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    twilio: accountSid && authToken ? 'configured' : 'not_configured'
  });
});

// WhatsApp webhook
app.post('/whatsapp', async (req, res) => {
  const { Body, From } = req.body;
  
  // Simple echo for now
  await twilioClient.messages.create({
    body: `You said: ${Body}`,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: From
  });
  
  res.status(200).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

### Step 5: Railway Configuration

**`bots/whatsapp-bot/Procfile`**:
```
web: node src/index.js
```

**`bots/whatsapp-bot/railway.json`**:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### Step 6: Deploy to Railway

Same process as Discord bot with these variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER` (e.g., `whatsapp:+14155238886`)
- `NODE_ENV=production`

---

## 📊 Deployment Checklist

### For Each Bot

- [ ] Create bot application (Discord/Telegram/Twilio)
- [ ] Get API credentials/tokens
- [ ] Create bot directory and files
- [ ] Create package.json with dependencies
- [ ] Create index.js with bot logic
- [ ] Add health endpoint
- [ ] Create Procfile
- [ ] Create railway.json
- [ ] Create .env.example
- [ ] Deploy to Railway
- [ ] Configure environment variables
- [ ] Test health endpoint
- [ ] Test bot commands

### Discord Bot
- [x] Create bot application
- [x] Get API credentials
- [x] Create bot directory and files
- [x] Create package.json
- [x] Create index.js with health endpoint
- [x] Create Procfile
- [x] Create railway.json
- [x] Create .env.example
- [ ] Deploy to Railway
- [ ] Configure environment variables
- [ ] Test health endpoint
- [ ] Test bot commands

### Telegram Bot
- [ ] Create bot application
- [ ] Get API credentials
- [ ] Create bot directory and files
- [ ] Create package.json
- [ ] Create index.js with health endpoint
- [ ] Create Procfile
- [ ] Create railway.json
- [ ] Create .env.example
- [ ] Deploy to Railway
- [ ] Configure environment variables
- [ ] Test health endpoint
- [ ] Test bot commands

### WhatsApp Bot
- [ ] Create Twilio account
- [ ] Get API credentials
- [ ] Create bot directory and files
- [ ] Create package.json
- [ ] Create index.js with health endpoint
- [ ] Create Procfile
- [ ] Create railway.json
- [ ] Create .env.example
- [ ] Deploy to Railway
- [ ] Configure environment variables
- [ ] Test health endpoint
- [ ] Test bot commands

---

## 🔗 Quick Reference

### Discord Bot
```bash
# Health check
curl https://discord-bot-url.railway.app/health

# Deploy via Railway web
https://railway.app

# Deploy via CLI
railway up
```

### Telegram Bot
```bash
# Health check
curl https://telegram-bot-url.railway.app/health

# Create bot
@BotFather /newbot
```

### WhatsApp Bot
```bash
# Health check
curl https://whatsapp-bot-url.railway.app/health

# Twilio
https://www.twilio.com/
```

---

## 🚨 Troubleshooting

### Discord Bot Issues

| Issue | Solution |
|-------|----------|
| Bot doesn't connect | Check DISCORD_BOT_TOKEN |
| Commands not registered | Check DISCORD_CLIENT_ID |
| Health endpoint returns 404 | Bot not running, check logs |
| Health returns "OK" instead of JSON | Wrong service responding, check deployment |

### Railway Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version >= 18 |
| Deployment hangs | Check railway.json config |
| Can't access health endpoint | Check PORT variable |
| Bot crashes on startup | Check Railway logs |

### General Issues

| Issue | Solution |
|-------|----------|
| Environment variables not loading | Check .env file and railway.env |
| Dependencies missing | Run `npm install` |
| Port conflicts | Change PORT variable |
| SSL errors | Railway provides HTTPS automatically |

---

## 📞 Support

- **Railway Documentation**: https://docs.railway.app/
- **Discord.js Guide**: https://discord.js.org/#/docs/discord.js/main/general/welcome
- **Telegraf (Telegram)**: https://telegraf.js.org/
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp

---

*Document Version*: 1.0.0
*Last Updated*: 2026-09-24
*Status*: Discord bot ready for deployment

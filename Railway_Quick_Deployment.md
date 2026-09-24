# Railway Quick Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the ChiefPilot bots to Railway using the web interface. Since Railway CLI authentication requires browser interaction, the web interface approach is often more straightforward.

## Prerequisites
- Railway account (free tier available at railway.app)
- GitHub repository access
- Bot tokens and credentials ready

## Step-by-Step Deployment

### 1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Verify your email if required

### 2. Deploy Discord Bot

#### Option A: From GitHub Repository
1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Click "Add Variables" and set these environment variables:
   ```
   DISCORD_BOT_TOKEN=your_actual_discord_bot_token
   DISCORD_CLIENT_ID=your_actual_discord_client_id
   CHARACTER_API_URL=https://vercel-character-api.vercel.app
   NODE_ENV=production
   DATABASE_PATH=/tmp/chiefpilot.db
   PORT=3000
   ```
5. Set the root directory to: `bots/discord-bot`
6. Set build command: `npm install`
7. Set start command: `npm start`
8. Click "Deploy"

#### Option B: From Local Directory
1. Click "New Project" → "Deploy from CLI"
2. Follow the CLI instructions (requires `railway login`)
3. Navigate to `bots/discord-bot`
4. Run `railway up`
5. Set environment variables in Railway dashboard

### 3. Deploy Telegram Bot

Repeat the same process for Telegram:
1. Create new project or add service to existing project
2. Set root directory: `bots/telegram-bot`
3. Set environment variables:
   ```
   TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token
   CHARACTER_API_URL=https://vercel-character-api.vercel.app
   NODE_ENV=production
   DATABASE_PATH=/tmp/chiefpilot.db
   PORT=3001
   ```
4. Build command: `npm install`
5. Start command: `npm start`

### 4. Deploy WhatsApp Bot

Repeat for WhatsApp:
1. Create new project or add service
2. Set root directory: `bots/whatsapp-bot`
3. Set environment variables:
   ```
   WHATSAPP_PHONE_NUMBER=your_actual_whatsapp_phone_number
   CHARACTER_API_URL=https://vercel-character-api.vercel.app
   NODE_ENV=production
   DATABASE_PATH=/tmp/chiefpilot.db
   PORT=3002
   ```
4. Build command: `npm install`
5. Start command: `npm start`

## Verification

### Check Deployment Status
1. Go to your Railway project dashboard
2. Click on each service
3. Check the "Logs" tab for startup logs
4. Look for "Health server running on port X" message

### Test Health Endpoints
Each bot exposes a health endpoint at:
- Discord: `https://your-discord-bot-url.railway.app/health`
- Telegram: `https://your-telegram-bot-url.railway.app/health`
- WhatsApp: `https://your-whatsapp-bot-url.railway.app/health`

Example curl command:
```bash
curl https://your-discord-bot-url.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "discord": "connected"
}
```

## Troubleshooting

### Bot Won't Start
- Check logs in Railway dashboard
- Verify environment variables are set correctly
- Ensure tokens are valid and not expired
- Check that the Character API is accessible

### Database Issues
- Railway filesystem is ephemeral; consider using Railway PostgreSQL for production
- For testing, the current `/tmp/chiefpilot.db` will work but data won't persist across restarts

### Discord Commands Not Working
- Verify bot token and client ID
- Check that slash commands are registered: `DISCORD_CLIENT_ID` must be correct
- Ensure bot has proper permissions in your Discord server

## Next Steps

1. **Test Live Commands**: Add the bot to a Discord server and test commands
2. **Monitor Performance**: Use Railway's built-in metrics
3. **Set Up Persistent Database**: Consider migrating to Railway PostgreSQL for production
4. **Configure Domains**: Add custom domains through Railway dashboard if desired

## Automated Deployment Script

If you prefer CLI automation after manual authentication:
```bash
# Authenticate first
railway login

# Then run the deployment script
./deploy-bots-to-railway.sh
```

## Support

For more detailed information:
- See `bots/discord-bot/RAILWAY_DEPLOYMENT.md`
- See `DEPLOYMENT_GUIDE.md`
- Railway documentation: https://docs.railway.app

# Railway Deployment Guide for Discord Bot

Since Railway CLI is not installed, you can deploy via the Railway web interface:

## Manual Railway Deployment

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up/login to your account

### Step 2: Create New Project
1. Click "New Project" 
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account if needed
4. Select the Tiapmaatzu-OS-Toolkit repository
5. Select the `bots/discord-bot` directory as the root directory
6. Click "Deploy"

### Step 3: Configure Environment Variables
1. In your Railway project, go to "Variables" tab
2. Add the following environment variables:

```env
DISCORD_BOT_TOKEN=your_actual_discord_bot_token_here
DISCORD_CLIENT_ID=your_actual_discord_client_id_here
CHARACTER_API_URL=https://vercel-character-api.vercel.app
DATABASE_PATH=/tmp/chiefpilot.db
NODE_ENV=production
```

### Step 4: Configure Build Settings
1. Go to "Settings" tab
2. Under "Build Config", set:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `bots/discord-bot`

### Step 5: Deploy
1. Click "Deploy" button
2. Wait for the build to complete
3. Monitor logs in the "Logs" tab

### Step 6: Get Bot URL
1. Railway will provide a public URL for your bot
2. Use this URL for health checks: `https://your-bot-url.railway.app/health`

## Alternative: Using Railway CLI

If you prefer to use the CLI, install it first:

```bash
npm install -g @railway/cli
```

Then follow these commands:

```bash
# Login to Railway
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

# Monitor logs
railway logs
```

## Testing the Deployment

Once deployed, test the bot:

1. **Health Check**
```bash
curl https://your-bot-url.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-23T...",
  "discord": "connected"
}
```

2. **Discord Bot Connection**
- The bot should automatically appear online in Discord
- Test with `/help` command in your Discord server

## Troubleshooting

### Build Fails
- Check that Node.js version is >= 18.0.0
- Verify all dependencies are in package.json
- Check build logs in Railway dashboard

### Bot Doesn't Connect to Discord
- Verify DISCORD_BOT_TOKEN is correct
- Check DISCORD_CLIENT_ID matches your Discord application
- Review Railway logs for connection errors

### Character API Connection Fails
- Verify CHARACTER_API_URL is set to: `https://vercel-character-api.vercel.app`
- Test the Character API health endpoint separately
- Check Railway logs for API connection errors

## Next Steps

After successful deployment:
1. Test all Discord bot commands
2. Verify Character API integration
3. Set up monitoring and alerts in Railway
4. Consider adding a database service for persistent storage
5. Create additional bot implementations (Telegram, WhatsApp, etc.)
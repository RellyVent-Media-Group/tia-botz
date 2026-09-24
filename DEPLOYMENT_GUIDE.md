# Deployment Guide - ChiefPilot Bots

## Overview

This guide covers deploying the ChiefPilot Discord bot and Character API to production using:
- **Vercel** for the Character API (serverless functions)
- **Railway** for the Discord bot (persistent Node.js service)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Environment                    │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Discord Bot     │         │  Character API   │         │
│  │   (Railway)       │────────▶│   (Vercel)        │         │
│  │   Node.js Service │         │  Serverless      │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                           │                      │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Discord Platform │         │  Character Data  │         │
│  │  (WebSocket)      │         │  (Static Files)  │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Part 1: Deploy Character API to Vercel

### Status: ✅ COMPLETED

The Character API has been successfully deployed to Vercel at:
**https://vercel-character-api.vercel.app**

### Testing the Deployment

```bash
curl https://vercel-character-api.vercel.app/api/character-health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-23T...",
  "message": "Character API is running on Vercel"
}
```

## Part 2: Deploy Discord Bot to Railway

### Status: ⏳ PENDING MANUAL DEPLOYMENT

Since Railway CLI is not installed, you can deploy via the Railway web interface. See `bots/discord-bot/RAILWAY_DEPLOYMENT.md` for detailed instructions.

### Quick Steps:

1. Go to [railway.app](https://railway.app) and create a new project
2. Deploy from GitHub repo, selecting the `bots/discord-bot` directory
3. Set environment variables:
   - `DISCORD_BOT_TOKEN=your_actual_token`
   - `DISCORD_CLIENT_ID=your_actual_client_id`
   - `CHARACTER_API_URL=https://vercel-character-api.vercel.app`
   - `NODE_ENV=production`
4. Configure build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `bots/discord-bot`
5. Deploy and monitor logs

## Environment Variables

### Discord Bot (Railway)
```env
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_client_id
CHARACTER_API_URL=https://your-vercel-app.vercel.app
DATABASE_PATH=/tmp/chiefpilot.db
NODE_ENV=production
```

### Character API (Vercel)
- No additional environment variables needed for basic functionality
- For advanced features, you can add variables in Vercel dashboard

## Verification

### Test Character API
```bash
# Health check
curl https://your-vercel-url.vercel.app/api/character-health

# Get characters
curl https://your-vercel-url.vercel.app/api/characters
```

### Test Discord Bot
1. Invite the bot to your Discord server using the OAuth2 URL
2. Use `/help` command to see available commands
3. Test `/health` command to verify API connectivity
4. Test `/character` and `/random` commands

## Troubleshooting

### Character API Issues

**Problem**: API returns 503 errors
- **Solution**: Check Vercel deployment logs, ensure all Python files are included

**Problem**: Character data not loading
- **Solution**: Ensure character data files are accessible to the serverless function

### Discord Bot Issues

**Problem**: Bot fails to start
- **Solution**: Check Railway logs, verify environment variables are set correctly

**Problem**: Character API connection fails
- **Solution**: Verify CHARACTER_API_URL is correct and Character API is deployed

**Problem**: Database errors
- **Solution**: Railway uses ephemeral storage by default. Consider adding a Railway PostgreSQL service for persistent storage

## Scaling Considerations

### Character API (Vercel)
- Automatically scales with traffic
- Serverless functions have execution time limits
- Consider caching for frequently accessed data

### Discord Bot (Railway)
- Railway automatically scales based on resource usage
- Consider upgrading to paid tier for better performance
- Multiple instances can be run for high-traffic bots

## Cost Estimates

### Vercel (Character API)
- Free tier: 100GB bandwidth, 6,000 minutes execution
- Paid tier: $20/month for more resources

### Railway (Discord Bot)
- Free tier: $5 free credit, then pay-as-you-go
- Estimated cost: $5-10/month for typical Discord bot usage

## Next Steps

1. Deploy Character API to Vercel
2. Update Discord bot environment variables with Vercel URL
3. Deploy Discord bot to Railway
4. Test end-to-end functionality
5. Set up monitoring and alerts
6. Consider adding additional bot implementations

## Additional Bot Implementations

After successful deployment, consider:
- Telegram bot deployment
- WhatsApp bot deployment
- Social media automation deployment
- Notion sync deployment

Each can follow similar patterns using the shared Character API.
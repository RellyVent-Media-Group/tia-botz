# Vercel One-Click Deployment

## Deploy Character API with Mary & Mac Profiles

### One-Click Deploy

Click this link to deploy immediately to Vercel:

**🔗 [DEPLOY TO VERCEL](https://vercel.com/new/git/external?repository-url=https://github.com/24-Tak-14/tia-botz&project-name=chiefpilot-character-api&repository-root=vercel-character-api)**

---

### Manual Steps

1. **Click the link above** - It will open Vercel and pre-fill all settings
2. **Click "Import"** - Vercel will clone your repository
3. **Click "Deploy"** - Wait for build to complete (under 2 minutes)

---

### Post-Deployment Setup

After deployment completes:

#### Step 1: Configure Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Click **"Add Environment Variable"**
4. Enter these exact values:
   ```
   Name: DISCORD_WEBHOOK
   Value: https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO
   ```
5. Click **"Add"**
6. Click **"Redeploy"**

#### Step 2: Verify Deployment

Open a terminal and test your API:

```bash
# Health check
curl https://YOUR-PROJECT-NAME.vercel.app/api/character-health

# Get Mary Magnumbytes (ID: 1)
curl https://YOUR-PROJECT-NAME.vercel.app/api/characters/1

# Get Mac Nazarene (ID: 2)
curl https://YOUR-PROJECT-NAME.vercel.app/api/characters/2

# Get all characters
curl https://YOUR-PROJECT-NAME.vercel.app/api/characters
```

Expected health response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-24T00:00:00.000Z",
  "message": "Character API is running on Vercel",
  "discord_webhook": "configured",
  "characters_loaded": 8
}
```

---

### What Gets Deployed

✅ **Character API Server** - Python HTTP server with 12 endpoints
✅ **Mary Magnumbytes** - ID: 1, Digital Forensic Analyst, Legendary
✅ **Mac Nazarene** - ID: 2, Crisis Counselor, Legendary
✅ **6 Additional Characters** - Shadow Runner, Data Weaver, Code Sage, Pixel Artist, System Guardian, Logic Oracle
✅ **Discord Integration** - Webhook receiver and notification sender
✅ **All Data Files** - Character profiles, portfolios, prompt packs

---

### Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/character-health` | Full health with Discord status |
| GET | `/health` | Short health check |
| GET | `/api/characters` | All 8 characters |
| GET | `/api/characters/1` | Mary Magnumbytes |
| GET | `/api/characters/2` | Mac Nazarene |
| GET | `/api/characters/search/:query` | Search characters |
| GET | `/api/characters/random` | Random character |
| GET | `/api/content/creators` | Content creator characters |
| GET | `/api/budget/summary` | Budget analytics |
| GET | `/api/analytics/character-performance` | Performance data |
| POST | `/api/webhooks/discord` | Receive Discord events |
| POST | `/api/notifications/discord` | Send to Discord |

---

### Deployment Configuration

| Setting | Value |
|---------|-------|
| Repository | 24-Tak-14/tia-botz |
| Root Directory | vercel-character-api |
| Project Name | chiefpilot-character-api |
| Framework | Other / Python |
| Required Env Var | DISCORD_WEBHOOK |

---

### Need Help?

- Vercel Docs: https://vercel.com/docs
- Discord Webhooks: https://support.discord.com/hc/en-us/articles/228383668
- This API: See VERCEL_DEPLOYMENT.md for detailed instructions

# Vercel Deployment Guide for Character API

## 🎯 Quick Start

Deploy the Character API with Discord webhook integration to Vercel in under 5 minutes.

---

## 🚀 Step-by-Step Deployment

### Step 1: Push Code to GitHub

Your code is already in the repository at `vercel-character-api/`:
```bash
# Verify the files are committed
cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit
git status
git push origin main
```

✅ **Already Done**: All changes are committed and pushed

---

### Step 2: Import Project to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Click **"Import"** next to your `tia-botz` repository
4. Configure project:
   - **Project Name**: `chiefpilot-character-api`
   - **Root Directory**: `vercel-character-api`
   - **Framework Preset**: `Other`
5. Click **"Import"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to Character API directory
cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/vercel-character-api

# Deploy
vercel
```

---

### Step 3: Configure Environment Variables

After importing, go to **Project Settings** → **Environment Variables** and add:

| Variable | Value | Required | Description |
|----------|-------|----------|-------------|
| `DISCORD_WEBHOOK` | `https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO` | ✅ Yes | Your Discord webhook URL |

**Note**: The default webhook URL from your configuration is already set as the fallback. You can override it here if needed.

---

### Step 4: Configure Build & Development Settings

In **Project Settings**:

1. **Build & Development Settings**:
   - **Build Command**: (leave empty or use `echo "No build needed"`)
   - **Install Command**: (leave empty)
   - **Development Command**: `python api/index.py`
   
2. **Serverless Function Region**: Select closest to your users

3. **Python Version**: Use `3.9` or higher

---

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (should take < 1 minute)
3. Once deployed, you'll get a URL like: `https://chiefpilot-character-api.vercel.app`

---

### Step 6: Verify Deployment

#### Test Health Endpoint
```bash
curl https://chiefpilot-character-api.vercel.app/api/character-health
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

#### Test Discord Notification
```bash
curl -X POST https://chiefpilot-character-api.vercel.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{"content": "API deployed successfully! 🎉"}'
```

**Expected**: Message should appear in your Discord channel via the webhook

#### Test Webhook Receiver
```bash
curl -X POST https://chiefpilot-character-api.vercel.app/api/webhooks/discord \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "message": "Webhook test"}'
```

**Expected Response**:
```json
{
  "status": "received",
  "timestamp": "2026-09-24T12:34:56.789Z",
  "event": "test",
  "message": "Webhook event logged"
}
```

---

## 📋 Deployment Checklist

- [x] Code committed to GitHub
- [x] Code pushed to main branch
- [ ] Import project to Vercel
- [ ] Configure environment variables (DISCORD_WEBHOOK)
- [ ] Configure build settings
- [ ] Deploy project
- [ ] Verify health endpoint
- [ ] Test Discord notification
- [ ] Test webhook receiver

---

## 🔧 Project Configuration

### vercel.json

Your project has a minimal `vercel.json`:
```json
{
  "version": 2
}
```

This is sufficient for Python projects. Vercel will automatically:
- Detect it's a Python project
- Use the appropriate runtime
- Handle HTTP requests correctly

### Directory Structure

```
vercel-character-api/
├── api/
│   ├── index.py          # Main API server with Discord integration
│   └── character-health.py # Flask-based health endpoint
├── DISCORD_INTEGRATION.md # Integration guide
├── VERCEL_DEPLOYMENT.md   # This file
├── tests/
│   └── discord-integration.test.js # Test suite
└── vercel.json           # Vercel configuration
```

---

## 💡 Optimization Tips

### 1. Cold Start Reduction

To reduce cold starts (common with Python on Vercel):

1. **Enable Serverless Functions**: Already enabled by default
2. **Set Minimum Instances**: In Pro plan, set to 1 to keep warm
3. **Use Edge Functions**: For faster response (requires Python 3.9+)

### 2. Monitoring

Set up monitoring in Vercel:
1. Go to **Project** → **Monitoring**
2. Set up alerts for:
   - High latency
   - Error rate
   - Failed deployments

### 3. Custom Domains (Optional)

1. Go to **Project Settings** → **Domains**
2. Add custom domain (e.g., `api.chiefpilot.com`)
3. Configure DNS with your provider

---

## 🚨 Troubleshooting

### Build Fails

**Error**: `ModuleNotFoundError: No module named '...'`

**Solution**: 
```bash
# Make sure all dependencies are in requirements.txt
# In vercel-character-api/ directory:
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Add requirements.txt"
git push
```

### API Returns 500 Error

**Solution**:
1. Check Vercel function logs
2. Look for Python errors
3. Verify environment variables are set
4. Test locally first: `python api/index.py`

### Discord Webhook Not Sending

**Solution**:
1. Verify DISCORD_WEBHOOK is correct in Vercel settings
2. Test webhook directly:
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"content": "Test"}'
   ```
3. Check Discord channel permissions
4. Verify webhook is still active (not deleted)

### Health Endpoint Returns 502

**Solution**:
1. Check if the server is running
2. Verify the PORT is correct (default: 8000 for local, automatic on Vercel)
3. Check Vercel logs for errors

---

## 📊 Performance Expectations

| Metric | Expected |
|--------|----------|
| Cold Start | < 500ms |
| Warm Start | < 100ms |
| Memory Usage | ~50-100MB |
| Request Timeout | 10s (default) |

---

## 🔗 Integration with Discord Bot

Once the Character API is deployed, update your Discord bot:

In `bots/discord-bot/.env` or Railway variables:
```
CHARACTER_API_URL=https://chiefpilot-character-api.vercel.app
```

Then use the notification endpoint:
```javascript
// In bots/discord-bot/src/index.js
import axios from 'axios';

async function sendToCharacterAPI(event) {
  await axios.post(
    `${process.env.CHARACTER_API_URL}/api/webhooks/discord`,
    event,
    { headers: { 'Content-Type': 'application/json' } }
  );
}
```

---

## 📝 Environment Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `DISCORD_WEBHOOK` | `https://discord.com/api/webhooks/123/abc` | Discord webhook URL for notifications |

---

## 🎯 Next Steps After Deployment

1. **Test all endpoints** (see Step 6 above)
2. **Integrate with Discord bot** (update CHARACTER_API_URL)
3. **Set up monitoring** in Vercel dashboard
4. **Consider adding**:
   - Rate limiting
   - Authentication
   - Database integration
   - Caching

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Python**: https://vercel.com/guides/using-python-with-vercel
- **Discord Webhooks**: https://support.discord.com/hc/en-us/articles/228383668

---

## 🏷️ Version Information

| Item | Version |
|------|---------|
| Python | 3.9+ |
| Vercel | v2 |
| Discord API | v10 |

---

*Document Version*: 1.0.0
*Last Updated*: 2026-09-24
*Deployment Status*: Ready to deploy

# Quick Start Guide - ChiefPilot Systems

**Get all 4 systems running in under 30 minutes**

---

## Prerequisites

- Node.js 18+ installed
- Character database at `/Users/jypsee72/Desktop/Private & Shared/Character Database`
- Visual assets at `/Users/jypsee72/Desktop/T.Zi.zu/visual-assets`

---

## 1. Telegram Bot (5 minutes)

### Setup
```bash
cd /Users/jypsee72/Desktop/T.Zi.zu/bots/telegram-bot
npm install
cp .env.example .env
```

### Configure `.env`
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
CHARACTER_DATABASE_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/Character Database
```

### Start
```bash
npm start
```

### Test
Open Telegram, find your bot, send `/start`

---

## 2. WhatsApp Bot (5 minutes)

### Setup
```bash
cd /Users/jypsee72/Desktop/T.Zi.zu/bots/whatsapp-bot
npm install
cp .env.example .env
```

### Configure `.env`
```
CHARACTER_DATABASE_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/Character Database
```

### Start
```bash
npm start
# Scan QR code with WhatsApp Business app
```

### Test
Send a message to your business number

---

## 3. Social Media Automation (10 minutes)

### Setup
```bash
cd /Users/jypsee72/Desktop/T.Zi.zu/automation/social-media
npm install
cp .env.example .env
```

### Configure `.env`
```
CHARACTER_DATABASE_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/Character Database
VISUAL_ASSETS_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/content/visual-assets
POST_FREQUENCY_INSTAGRAM=3
POST_FREQUENCY_TIKTOK=2
```

### Start
```bash
npm start
```

### Test
```bash
node src/index.js report
```

---

## 4. Notion Integration (10 minutes)

### Setup
```bash
cd /Users/jypsee72/Desktop/T.Zi.zu/automation/notion-sync
npm install
cp .env.example .env
```

### Configure Notion
1. Go to notion.so/my-integrations
2. Create integration, copy token
3. Create 3 databases (Character, Calendar, Tasks)
4. Share databases with integration
5. Copy database IDs from URLs

### Configure `.env`
```
NOTION_API_KEY=your_integration_token
NOTION_CHARACTER_DATABASE_ID=your_character_db_id
NOTION_CONTENT_CALENDAR_ID=your_calendar_db_id
NOTION_TASK_DATABASE_ID=your_task_db_id
CHARACTER_DATABASE_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/Character Database
```

### Start
```bash
npm start
```

### Test
Check your Notion workspace for synced data

---

## Running All Systems

### Development Mode (4 terminals)
```bash
# Terminal 1
cd bots/telegram-bot && npm run dev

# Terminal 2
cd bots/whatsapp-bot && npm run dev

# Terminal 3
cd automation/social-media && npm run dev

# Terminal 4
cd automation/notion-sync && npm run dev
```

### Production Mode (with PM2)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: './bots/telegram-bot/src/index.js',
      cwd: '/Users/jypsee72/Desktop/T.Zi.zu',
    },
    {
      name: 'whatsapp-bot',
      script: './bots/whatsapp-bot/src/index.js',
      cwd: '/Users/jypsee72/Desktop/T.Zi.zu',
    },
    {
      name: 'social-media',
      script: './automation/social-media/src/index.js',
      cwd: '/Users/jypsee72/Desktop/T.Zi.zu',
    },
    {
      name: 'notion-sync',
      script: './automation/notion-sync/src/index.js',
      cwd: '/Users/jypsee72/Desktop/T.Zi.zu',
    },
  ],
};
EOF

# Start all
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Stop all
pm2 stop all
```

---

## Verification Checklist

- [ ] Telegram bot responds to `/start`
- [ ] WhatsApp bot receives messages
- [ ] Social media scheduler is running
- [ ] Notion databases are syncing
- [ ] Character database is accessible
- [ ] All `.env` files configured
- [ ] No errors in console logs

---

## Common Issues

**Module not found errors:**
```bash
cd [system-directory]
npm install
```

**Permission denied:**
```bash
chmod +x src/index.js
```

**Character database not found:**
Check path in `.env` matches actual location

**Notion sync fails:**
- Verify integration token
- Check database is shared with integration
- Confirm database IDs are correct

---

## Next Steps

1. Configure actual API credentials for production
2. Set up monitoring and logging
3. Configure production databases
4. Implement persistent storage
5. Set up CI/CD pipeline

---

## Documentation

- Full guide: `SYSTEMS_IMPLEMENTATION_GUIDE.md`
- SOPs: `SOP-INDEX.md`
- Visual assets: `visual-assets/README.md`
- Web app: `TZI-/README.md`

---

**Estimated Setup Time:** 30 minutes
**Systems Running:** 4
**Status:** Ready for testing

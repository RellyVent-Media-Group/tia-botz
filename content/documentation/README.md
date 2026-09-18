# ChiefPilot / Gilded Mirrors Universe

**Autonomous AI Studio & Stop-Motion Workshop**

---

## Overview

ChiefPilot is a comprehensive content production system for the Gilded Mirrors Universe, featuring character generation, visual asset creation, automated bots, and multi-platform publishing.

---

## Project Structure

```
T.Zi.zu/
├── bots/                      # Messaging Bots
│   ├── telegram-bot/         # Telegram prompt delivery bot
│   └── whatsapp-bot/         # WhatsApp Business integration
├── automation/               # Automation Systems
│   ├── social-media/         # Instagram/TikTok automation
│   └── notion-sync/          # Notion database sync
├── visual-assets/            # Visual Asset Generator
│   ├── generate-assets.py    # Multi-AI generation scripts
│   ├── config.json          # AI service configuration
│   └── prompts-organized.json # Prompt database
├── TZI-/                     # ChiefPilot Web App
│   ├── server.ts             # Express + Gemini API server
│   ├── src/                  # React frontend components
│   └── package.json          # Web app dependencies
├── SOP-*.md                  # Standard Operating Procedures
├── SYSTEMS_IMPLEMENTATION_GUIDE.md  # Full systems documentation
├── QUICK_START_SYSTEMS.md    # Quick setup guide
└── README.md                 # This file
```

---

## Core Systems

### 1. Visual Assets Generator ✅
**Location:** `visual-assets/`

Multi-AI image generation system supporting:
- DALL-E (OpenAI)
- Stable Diffusion
- Midjourney
- Pollinations AI

**Status:** Production-ready
- 33 character images generated (11 Legendary characters)
- 32 platform-specific promotional assets ready to generate
- Multi-AI fallback system implemented

**Quick Start:**
```bash
cd visual-assets
./generate-assets-multi.sh --setup-env
./generate-assets-multi.sh --test-services
./generate-assets-multi.sh
```

**Documentation:** `visual-assets/README.md`

---

### 2. ChiefPilot Web App ✅
**Location:** `TZI-/`

React + Express web application with Google Gemini AI integration:
- 10 workstream views (Universe Bible, Character Bible, Pilot Production, etc.)
- AI text generation, TTS, image generation
- Shadow Engine dialogue system
- Character database management

**Status:** Production-ready
- Frontend built with React 19
- Express server with Gemini 3.1 integration
- TypeScript types and data structures

**Quick Start:**
```bash
cd TZI-
npm install
npm run dev
```

**Access:** http://localhost:3000

---

### 3. Telegram Bot ✅
**Location:** `bots/telegram-bot/`

Telegram bot for AI prompt delivery and character database access.

**Features:**
- `/prompt` - Generate custom character prompts
- `/random` - Get random character prompts
- `/batch` - Generate multiple prompts
- `/character` - View character details
- `/subscribe` - Subscription management

**Status:** Implemented, requires Telegram bot token

**Quick Start:**
```bash
cd bots/telegram-bot
npm install
cp .env.example .env
# Edit .env with your Telegram bot token
npm start
```

**Documentation:** `SYSTEMS_IMPLEMENTATION_GUIDE.md#1-telegram-bot`

---

### 4. WhatsApp Business Bot ✅
**Location:** `bots/whatsapp-bot/`

WhatsApp Business API integration for template messaging and engagement tracking.

**Features:**
- Template message system
- Engagement data tracking
- Character database access
- Prompt generation

**Status:** Implemented, requires WhatsApp Business API credentials

**Quick Start:**
```bash
cd bots/whatsapp-bot
npm install
cp .env.example .env
# Edit .env with your WhatsApp credentials
npm start
```

**Documentation:** `SYSTEMS_IMPLEMENTATION_GUIDE.md#2-whatsapp-business-bot`

---

### 5. Social Media Automation ✅
**Location:** `automation/social-media/`

Automated posting and scheduling for Instagram and TikTok.

**Features:**
- Automated posting to Instagram and TikTok
- Content scheduling with optimal times
- Engagement tracking and reporting
- Character-based content generation

**Status:** Implemented, requires Instagram/TikTok API credentials

**Quick Start:**
```bash
cd automation/social-media
npm install
cp .env.example .env
# Edit .env with your social media credentials
npm start
```

**Documentation:** `SYSTEMS_IMPLEMENTATION_GUIDE.md#3-social-media-automation`

---

### 6. Notion Integration ✅
**Location:** `automation/notion-sync/`

Syncs character database, content calendar, and tasks with Notion.

**Features:**
- Character database sync
- Content calendar generation
- Task database management
- Automated scheduling

**Status:** Implemented, requires Notion integration setup

**Quick Start:**
```bash
cd automation/notion-sync
npm install
cp .env.example .env
# Edit .env with your Notion credentials
npm start
```

**Documentation:** `SYSTEMS_IMPLEMENTATION_GUIDE.md#4-notion-integration`

---

## Standard Operating Procedures

### Available SOPs
- **SOP-Content-Production.md** - 90-minute content production batch
- **SOP-Character-Development.md** - Custom character development for Fiverr
- **SOP-Notion-Workflow-Management.md** - Notion database and calendar management
- **SOP-Gumroad-Product-Management.md** - Gumroad product launch and maintenance

**Index:** `SOP-INDEX.md`

---

## Character Database

**Location:** `/Users/jypsee72/Desktop/Private & Shared/Character Database`

Contains:
- 11 Legendary characters with complete profiles
- 33 generated images (portrait, poster, avatar for each character)
- Markdown records with metadata and asset references

**Characters:**
1. Mary Magnumbytes
2. Mac Nazarene
3. Mrs. Cox-Turner
4. Latti Pleddespo
5. Cracoria Masters
6. Dezi Asete
7. Zupa Novaclutch
8. Brad Turdet
9. Dikinya Myles
10. Mr. Turner
11. Ronda Villasea

---

## Getting Started

### Quick Setup (30 minutes)

1. **Set up Telegram Bot** (5 min)
   ```bash
   cd bots/telegram-bot && npm install && cp .env.example .env
   # Configure with your Telegram bot token
   npm start
   ```

2. **Set up WhatsApp Bot** (5 min)
   ```bash
   cd bots/whatsapp-bot && npm install && cp .env.example .env
   # Configure with your WhatsApp credentials
   npm start
   ```

3. **Set up Social Media Automation** (10 min)
   ```bash
   cd automation/social-media && npm install && cp .env.example .env
   # Configure with your social media credentials
   npm start
   ```

4. **Set up Notion Integration** (10 min)
   ```bash
   cd automation/notion-sync && npm install && cp .env.example .env
   # Configure with your Notion credentials
   npm start
   ```

**Full Quick Start Guide:** `QUICK_START_SYSTEMS.md`

---

## System Status

| System | Status | Dependencies |
|--------|--------|--------------|
| Visual Assets Generator | ✅ Production-ready | Python 3, AI API keys |
| ChiefPilot Web App | ✅ Production-ready | Node.js, Gemini API key |
| Telegram Bot | ✅ Implemented | Telegram bot token |
| WhatsApp Bot | ✅ Implemented | WhatsApp Business API |
| Social Media Automation | ✅ Implemented | Instagram/TikTok APIs |
| Notion Integration | ✅ Implemented | Notion integration token |

---

## Documentation

### Core Documentation
- **SYSTEMS_IMPLEMENTATION_GUIDE.md** - Complete systems implementation guide
- **QUICK_START_SYSTEMS.md** - Quick setup guide for all systems
- **SOP-INDEX.md** - Index of all Standard Operating Procedures

### System-Specific Documentation
- **visual-assets/README.md** - Visual assets generator guide
- **visual-assets/MULTI_AI_GUIDE.md** - Multi-AI setup guide
- **visual-assets/ASSET_PRODUCTION_CHECKLIST.md** - Production checklist
- **visual-assets/PROMPT_CUSTOMIZATION.md** - Prompt customization guide

### Web App Documentation
- **TZI-/src/components/** - Component documentation in code
- **TZI-/src/types.ts** - TypeScript type definitions

---

## Development

### Prerequisites
- Node.js 18+
- Python 3.6+
- Character database at `/Users/jypsee72/Desktop/Private & Shared/Character Database`

### Running All Systems (Development)

```bash
# Terminal 1 - Telegram Bot
cd bots/telegram-bot && npm run dev

# Terminal 2 - WhatsApp Bot
cd bots/whatsapp-bot && npm run dev

# Terminal 3 - Social Media Automation
cd automation/social-media && npm run dev

# Terminal 4 - Notion Integration
cd automation/notion-sync && npm run dev

# Terminal 5 - ChiefPilot Web App
cd TZI- && npm run dev

# Terminal 6 - Visual Assets (as needed)
cd visual-assets && ./generate-assets-multi.sh
```

### Running All Systems (Production with PM2)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 monit
```

---

## Configuration

### Environment Variables

Each system requires its own `.env` file:

**Telegram Bot:**
- `TELEGRAM_BOT_TOKEN` - Telegram bot API token
- `CHARACTER_DATABASE_PATH` - Path to character database

**WhatsApp Bot:**
- `WHATSAPP_BUSINESS_PHONE` - Business phone number
- `WHATSAPP_API_KEY` - WhatsApp API key
- `CHARACTER_DATABASE_PATH` - Path to character database

**Social Media Automation:**
- `INSTAGRAM_USERNAME` - Instagram username
- `INSTAGRAM_PASSWORD` - Instagram password
- `TIKTOK_USERNAME` - TikTok username
- `TIKTOK_PASSWORD` - TikTok password
- `CHARACTER_DATABASE_PATH` - Path to character database
- `VISUAL_ASSETS_PATH` - Path to visual assets

**Notion Integration:**
- `NOTION_API_KEY` - Notion integration token
- `NOTION_CHARACTER_DATABASE_ID` - Character database ID
- `NOTION_CONTENT_CALENDAR_ID` - Content calendar ID
- `NOTION_TASK_DATABASE_ID` - Task database ID
- `CHARACTER_DATABASE_PATH` - Path to character database

**ChiefPilot Web App:**
- `GEMINI_API_KEY` - Google Gemini API key
- `NODE_ENV` - Environment (development/production)

**Visual Assets:**
- `OPENAI_API_KEY` - OpenAI API key (for DALL-E)
- `STABLE_DIFFUSION_URL` - Stable Diffusion WebUI URL
- `MIDJOURNEY_API_KEY` - Midjourney API key

---

## Security

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use different keys for development and production
- Implement access controls for databases

---

## Troubleshooting

### Common Issues

**Module not found:**
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

**API authentication failed:**
Verify API keys and credentials are correct

**Notion sync fails:**
- Verify integration token
- Check database is shared with integration
- Confirm database IDs are correct

For detailed troubleshooting, see `SYSTEMS_IMPLEMENTATION_GUIDE.md`

---

## Support

### Documentation
- Full implementation guide: `SYSTEMS_IMPLEMENTATION_GUIDE.md`
- Quick start: `QUICK_START_SYSTEMS.md`
- SOPs: `SOP-INDEX.md`

### External Resources
- Telegram Bot API: https://core.telegram.org/bots/api
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Instagram Graph API: https://developers.facebook.com/docs/instagram
- TikTok API: https://developers.tiktok.com
- Notion API: https://developers.notion.com
- Google Gemini API: https://ai.google.dev

---

## Roadmap

### Completed ✅
- Visual assets generator with multi-AI support
- ChiefPilot web app with Gemini integration
- Telegram bot implementation
- WhatsApp bot implementation
- Social media automation
- Notion integration
- Character database with 11 Legendary characters
- 33 generated character images

### In Progress 🚧
- Production deployment
- Monitoring and logging setup
- Persistent storage for subscriptions
- Advanced error handling

### Planned 📋
- Web dashboard for monitoring
- Analytics and reporting
- Expanded platform support
- Advanced AI features
- CI/CD pipeline
- Performance optimization

---

## License

ChiefPilot / Gilded Mirrors Universe

**501(c)(8) Zu Fraternal System**

---

**Version:** 1.0
**Last Updated:** 2026-09-11
**Status:** Production-ready

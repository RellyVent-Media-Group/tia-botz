# Tiapmaatzu OS Toolkit

A unified project consolidating the ChiefPilot/Gilded Mirrors Universe ecosystem, including bot systems, automation tools, character databases, and organizational workflows.

## Project Structure

```
Tiapmaatzu-OS-Toolkit/
├── core/                          # Core systems
│   ├── character-database/        # Unified character database
│   ├── integration-hub/          # Central API and webhook system
│   └── shared-config/            # Shared configuration and utilities
├── bots/                         # Messaging platforms
│   ├── telegram-bot/            # Telegram integration
│   ├── whatsapp-bot/            # WhatsApp Business integration
│   └── shared/                  # Shared bot utilities
├── automation/                   # Automation systems
│   ├── social-media/            # Instagram/TikTok automation
│   ├── notion-sync/             # Notion integration
│   └── content-generation/      # AI content generation
├── organizational/              # TZU organizational system
│   ├── TZU-Archives/            # Organizational automation
│   ├── depot-automation/        # Depot-specific automation
│   ├── stakeholder-tracking/    # Sentiment tracking
│   ├── heart-calendar/          # Custom calendar system
│   └── daily-automation/        # Daily workflows
├── content/                     # Content assets
│   ├── mac-mary-vault/          # Mac & Mary prompt vault
│   ├── visual-assets/           # Generated visual assets
│   ├── documentation/           # Guides and SOPs
│   ├── organized-content/       # Organized content libraries
│   └── marketing/               # Fiverr/Gumroad content
├── web-apps/                    # Web interfaces
│   ├── chiefpilot/              # Main web application
│   └── admin-dashboard/         # Administrative interface
├── scripts/                     # Utility scripts
│   ├── setup/                   # Installation scripts
│   ├── deployment/              # Deployment scripts
│   └── maintenance/             # Maintenance utilities
├── config/                      # Configuration files
│   ├── environments/            # Environment templates
│   ├── docker/                  # Docker configurations
│   └── monitoring/              # Monitoring setup
└── docs/                        # Documentation
    ├── README.md                # Main documentation
    ├── ARCHITECTURE.md          # System architecture
    ├── API.md                   # API documentation
    └── DEPLOYMENT.md            # Deployment guide
```

## Quick Start

### Prerequisites

- Node.js v22.23.1 (recommended)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd /Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit
   ```

2. **Install dependencies for each system:**

   **Telegram Bot:**
   ```bash
   cd bots/telegram-bot
   npm install
   cp .env.example .env
   # Edit .env with your Telegram bot token
   npm start
   ```

   **WhatsApp Bot:**
   ```bash
   cd bots/whatsapp-bot
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm start
   ```

   **Social Media Automation:**
   ```bash
   cd automation/social-media
   npm install
   cp .env.example .env
   # Edit .env with your platform credentials
   npm start
   ```

   **Notion Sync:**
   ```bash
   cd automation/notion-sync
   npm install
   cp .env.example .env
   # Edit .env with your Notion API key and database IDs
   npm start
   ```

   **Integration Hub:**
   ```bash
   cd core/integration-hub
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

   **ChiefPilot Web App:**
   ```bash
   cd web-apps/chiefpilot
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Configure Environment Variables:**

   Each system has its own `.env.example` file. Copy it to `.env` and fill in your credentials. Key variables include:

   - `TELEGRAM_BOT_TOKEN` - Telegram bot API token
   - `WHATSAPP_*` - WhatsApp Business credentials
   - `INSTAGRAM_*` - Instagram API credentials
   - `TIKTOK_*` - TikTok API credentials
   - `NOTION_API_KEY` - Notion integration API key
   - `NOTION_*_DATABASE_ID` - Notion database IDs
   - `CHARACTER_DATABASE_PATH` - Path to character database (now standardized)
   - `VISUAL_ASSETS_PATH` - Path to visual assets (now standardized)

## Systems Overview

### Bot Systems

**Telegram Bot** (`bots/telegram-bot/`)
- Commands: `/prompt`, `/random`, `/batch`, `/character`, `/subscribe`, `/status`, `/generate`, `/analytics`, `/link`, `/workspace`, `/sync`, `/admin`
- Character database integration
- Subscription tracking
- AI image generation queue

**WhatsApp Bot** (`bots/whatsapp-bot/`)
- Template message system
- Engagement tracking
- Character database access
- Prompt generation
- QR-code pairing for authentication

### Automation Systems

**Social Media Automation** (`automation/social-media/`)
- Instagram and TikTok posting automation
- Scheduling with optimal times
- Engagement tracking/reporting
- Character-based content generation
- Four content types: Character Reveal, Poster Showcase, Avatar Spotlight, Story Preview
- 30-day content calendar generation

**Notion Sync** (`automation/notion-sync/`)
- Character database synchronization
- Content-calendar generation
- Task-database management
- Configurable automatic scheduling interval
- CLI commands for selective syncing

### Core Systems

**Character Database** (`core/character-database/`)
- Unified character database from REL-ePhone integration hub
- Content calendar integration
- Task database
- `characters-cleaned.json` with full character metadata

**Integration Hub** (`core/integration-hub/`)
- Central API and webhook system
- Character database endpoints
- Notion sync endpoints
- Health monitoring
- Full-stack web application with React frontend

### Organizational Systems

**TZU Archives** (`organizational/TZU-Archives/`)
- Heart Calendar integration
- Stakeholder sentiment tracking
- Daily checklist automation
- Depot automation
- Gnostic Auto-Didactico
- Behavioral science
- PAATS voice-cloning

### Web Applications

**ChiefPilot** (`web-apps/chiefpilot/`)
- Main web application (TZI-)
- React frontend with TanStack Start
- Character Database and Content Calendar integration
- Visual asset management

## Configuration

### Path Standardization

All systems now use standardized paths for shared resources:

- **Character Database:** `core/character-database/Character Database/`
- **Visual Assets:** `content/visual-assets/`
- **Content Calendar:** `core/character-database/Content Calendar/`
- **Task List:** `core/character-database/Task List/`

Update your `.env` files to use these paths:

```env
CHARACTER_DATABASE_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/Character Database
VISUAL_ASSETS_PATH=/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/content/visual-assets
```

### Environment Templates

Each system includes an `.env.example` file with all required variables. Never commit actual `.env` files with secrets.

## Documentation

- **Main README** - This file
- **SYSTEMS_IMPLEMENTATION_GUIDE.md** - Detailed implementation guide
- **QUICK_START_SYSTEMS.md** - Quick start for individual systems
- **SOP-INDEX.md** - Standard Operating Procedures index
- **ARCHITECTURE.md** - System architecture (to be created)
- **API.md** - API documentation (to be created)
- **DEPLOYMENT.md** - Deployment guide (to be created)

## Runtime Requirements

- **Node.js:** v22.23.1 (recommended)
- **Alternative:** v26.5.0 may work but has known compatibility issues on some systems

## Security Notes

- Never commit `.env` files or secrets to version control
- WhatsApp authentication data in `auth_info_baileys/` should be secured
- API keys, tokens, and credentials are sensitive
- Review `SECURITY_NOTES.md` in organizational/TZU-Archives/ for additional security considerations

## Development

### Running All Systems

To run all systems locally, navigate to each directory and run `npm start` or `npm run dev` as appropriate.

### Docker Deployment

Docker configurations are available in `config/docker/` for containerized deployment.

### Monitoring

Monitoring setup is available in `config/monitoring/` for production deployments.

## Support

For issues or questions, refer to the documentation in `content/documentation/` or the system-specific guides in each directory.

## License

This project is part of the ChiefPilot / Gilded Mirrors Universe ecosystem.

---

**ChiefPilot v3 // Gilded Mirrors OS**
# tia-botz

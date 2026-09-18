#!/bin/bash
# Tiapma'atzu OS Toolkit - Setup Script
# This script helps install dependencies and configure the environment

set -e

echo "========================================"
echo "Tiapma'atzu OS Toolkit - Setup"
echo "========================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Current Node.js version: $NODE_VERSION"

# Recommend Node.js v22.23.1
if [[ ! "$NODE_VERSION" =~ v22\. ]]; then
    echo "⚠️  WARNING: Node.js v22.23.1 is recommended"
    echo "Current version: $NODE_VERSION"
    echo "You may encounter compatibility issues with other versions"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "Installing dependencies..."
echo "========================================"
echo ""

# Install bot dependencies
echo "Installing Telegram Bot dependencies..."
cd bots/telegram-bot
npm install
cd ../..

echo "Installing WhatsApp Bot dependencies..."
cd bots/whatsapp-bot
npm install
cd ../..

echo "Installing Social Media Automation dependencies..."
cd automation/social-media
npm install
cd ../..

echo "Installing Notion Sync dependencies..."
cd automation/notion-sync
npm install
cd ../..

echo "Installing Shared Bot dependencies..."
cd bots/shared
npm install
cd ../..

echo "Installing Integration Hub dependencies..."
cd core/integration-hub
npm install
cd ../..

echo "Installing ChiefPilot Web App dependencies..."
cd web-apps/chiefpilot
npm install
cd ../..

echo ""
echo "========================================"
echo "Configuration"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your actual credentials before running any services"
    echo "   Required variables:"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo "   - WHATSAPP_* credentials"
    echo "   - NOTION_API_KEY and database IDs"
    echo "   - Character database and visual assets paths are pre-configured"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Start individual services:"
echo "   - Telegram Bot: cd bots/telegram-bot && npm start"
echo "   - WhatsApp Bot: cd bots/whatsapp-bot && npm start"
echo "   - Social Media: cd automation/social-media && npm start"
echo "   - Notion Sync: cd automation/notion-sync && npm start"
echo "   - Integration Hub: cd core/integration-hub && npm run dev"
echo "   - ChiefPilot Web App: cd web-apps/chiefpilot && npm run dev"
echo ""
echo "For more information, see README.md"

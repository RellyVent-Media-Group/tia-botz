#!/bin/bash

# Configure All Integrations Script
# This script validates and sets up all integration configurations

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Character Database Integration Hub Configuration ===${NC}"
echo ""

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    if [ -n "$2" ]; then
        echo -e "${GREEN}✓${NC} $1 is set"
        return 0
    else
        echo -e "${YELLOW}○${NC} $1 not set (optional)"
        return 1
    fi
}

echo -e "${YELLOW}Checking core files...${NC}"
check_file "characters-cleaned.json"
check_file "universal-integration-hub.mjs"
check_file "integration-hub-package.json"
check_file ".env"
check_file ".env.example"
echo ""

echo -e "${YELLOW}Checking integration configuration files...${NC}"
check_dir "integrations"
check_file "integrations/shortcuts-guide.md"
check_file "integrations/ihosts-config.md"
check_file "integrations/unified-remote-config.md"
check_file "integrations/requestly-config.md"
check_file "integrations/network-toolbox-config.md"
check_file "integrations/notion-config.md"
check_file "integrations/telegram-bot-config.md"
check_file "integrations/whatsapp-bot-config.md"
check_file "integrations/resend-config.md"
check_file "integrations/INTEGRATION-SUMMARY.md"
echo ""

echo -e "${YELLOW}Checking bot files...${NC}"
check_dir "bots"
check_file "bots/telegram-bot.mjs"
check_file "bots/whatsapp-bot.mjs"
echo ""

echo -e "${YELLOW}Checking startup scripts...${NC}"
check_file "startup.sh"
check_file "startup-integration-hub.sh"
echo ""

echo -e "${YELLOW}Checking environment variables...${NC}"
if [ -f ".env" ]; then
    source .env
    check_env_var "HUB_URL" "$HUB_URL"
    check_env_var "INTEGRATION_PORT" "$INTEGRATION_PORT"
    check_env_var "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN"
    check_env_var "NOTION_API_KEY" "$NOTION_API_KEY"
    check_env_var "NOTION_DATABASE_ID" "$NOTION_DATABASE_ID"
    check_env_var "RESEND_API_KEY" "$RESEND_API_KEY"
    check_env_var "STRIPE_PAYMENT_LINK" "$STRIPE_PAYMENT_LINK"
    check_env_var "DATABASE_URL" "$DATABASE_URL"
    check_env_var "BETTER_AUTH_SECRET" "$BETTER_AUTH_SECRET"
else
    echo -e "${RED}✗${NC} .env file not found"
fi
echo ""

echo -e "${YELLOW}Integration Summary:${NC}"
echo "Total Integrations: 9"
echo "1. Apple Shortcuts/Automator"
echo "2. iHosts (Local Host Configuration)"
echo "3. Unified Remote (Voice Commands)"
echo "4. Requestly (HTTP Interception)"
echo "5. Network Toolbox (Diagnostics)"
echo "6. Notion (Database Sync)"
echo "7. Telegram Bot"
echo "8. WhatsApp Bot"
echo "9. Resend Email"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Fill in actual values in .env file"
echo "2. Run: ./startup-integration-hub.sh"
echo "3. Test endpoints: curl http://localhost:3000/health"
echo "4. Configure specific platforms using integration guides"
echo ""

echo -e "${BLUE}=== Configuration Check Complete ===${NC}"

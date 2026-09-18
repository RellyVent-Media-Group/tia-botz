#!/bin/bash

# Character Database Integration Hub Startup Script
# This script starts the integration hub server for character database access

# Configuration
INTEGRATION_PORT="${INTEGRATION_PORT:-3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Character Database Integration Hub...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if package.json exists
if [ ! -f "integration-hub-package.json" ]; then
    echo -e "${RED}Error: integration-hub-package.json not found${NC}"
    exit 1
fi

# Check if character data exists
if [ ! -f "characters-cleaned.json" ]; then
    echo -e "${RED}Error: characters-cleaned.json not found${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --package-lock-file=false
fi

# Check if server is already running
if curl -s "http://localhost:${INTEGRATION_PORT}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}Integration Hub is already running on port ${INTEGRATION_PORT}${NC}"
    echo "API Documentation: http://localhost:${INTEGRATION_PORT}/api/docs"
    exit 0
fi

# Start the server
echo -e "${YELLOW}Starting server on port ${INTEGRATION_PORT}...${NC}"
export INTEGRATION_PORT="$INTEGRATION_PORT"

# Start in background
nohup node universal-integration-hub.mjs > integration-hub.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 3

# Check if server started successfully
if curl -s "http://localhost:${INTEGRATION_PORT}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Integration Hub started successfully${NC}"
    echo -e "${GREEN}✓ Server running on port ${INTEGRATION_PORT}${NC}"
    echo -e "${GREEN}✓ API Documentation: http://localhost:${INTEGRATION_PORT}/api/docs${NC}"
    echo -e "${GREEN}✓ Health Check: http://localhost:${INTEGRATION_PORT}/health${NC}"
    echo ""
    echo "Available endpoints:"
    echo "  - Character API: http://localhost:${INTEGRATION_PORT}/api/characters"
    echo "  - Random Character: http://localhost:${INTEGRATION_PORT}/api/characters/random"
    echo "  - Shortcuts Webhook: http://localhost:${INTEGRATION_PORT}/webhook/shortcuts/search"
    echo "  - Notion Integration: http://localhost:${INTEGRATION_PORT}/api/notion/sync"
    echo "  - Resend Email: http://localhost:${INTEGRATION_PORT}/api/resend/send-character"
    echo ""
    echo "Server PID: $SERVER_PID"
    echo "Logs: integration-hub.log"
else
    echo -e "${RED}✗ Failed to start server${NC}"
    echo "Check integration-hub.log for details"
    exit 1
fi
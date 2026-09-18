#!/bin/bash
# Startup script for REL-ePhone dev server

# Check if server is already running
if curl -s http://127.0.0.1:8080/ > /dev/null 2>&1; then
  echo "Server is already running on port 8080"
  exit 0
fi

# Load NVM and use Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# Start the dev server in background
cd "/Users/jypsee72/Desktop/REL-ePhone/Private & Shared"
npm run dev &

#!/bin/bash

# Startup script for Character API
# Usage: ./start.sh [port]

PORT=${1:-8000}

# Check if DISCORD_WEBHOOK is set
if [ -z "$DISCORD_WEBHOOK" ]; then
    echo "Warning: DISCORD_WEBHOOK not set, using default"
    export DISCORD_WEBHOOK="https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO"
fi

echo "Starting Character API on port $PORT"
echo "DISCORD_WEBHOOK: $DISCORD_WEBHOOK"
echo "Press Ctrl+C to stop"
echo

# Start the server
python -m http.server "$PORT" --directory .

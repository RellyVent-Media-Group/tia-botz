#!/bin/bash

# Entrypoint script for Character API Docker container
# This starts the Python HTTP server on port 8000

echo "Starting Character API server..."
echo "DISCORD_WEBHOOK: ${DISCORD_WEBHOOK}"
echo "Listening on port 8000"

exec python server.py 8000

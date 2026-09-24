#!/usr/bin/env python3
"""
Character API Server
Serves Mary Magnumbytes, Mac Nazarene, and other character profiles
with Discord webhook integration.

Usage:
    python server.py [port]
    
Environment Variables:
    DISCORD_WEBHOOK: Discord webhook URL for notifications
    PORT: Port to listen on (default: 8000)
"""

import sys
import os

# Set default port
port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8000))

# Set DISCORD_WEBHOOK if not already set
if 'DISCORD_WEBHOOK' not in os.environ:
    os.environ['DISCORD_WEBHOOK'] = 'https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO'

print(f"Starting Character API server on port {port}")
print(f"DISCORD_WEBHOOK: {os.environ.get('DISCORD_WEBHOOK')}")
print(f"Serving Mary Magnumbytes, Mac Nazarene, and {port} other characters")
print("Press Ctrl+C to stop")
print()

# Import and run the handler
from api import index
from http.server import HTTPServer

# Use the handler from api/index.py
HandlerClass = index.handler

# Start the server
server_address = ('', port)
httpd = HTTPServer(server_address, HandlerClass)

print(f"Server listening on port {port}")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nShutting down server...")
    httpd.server_close()

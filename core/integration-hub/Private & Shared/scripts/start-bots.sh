#!/bin/bash

# Bot Development Startup Script
# Starts ngrok tunnel, API server, and bots

set -e

echo "🚀 Starting Bot Development Environment..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it from https://ngrok.com/download"
    exit 1
fi

# Check if TELEGRAM_BOT_TOKEN is set
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️  TELEGRAM_BOT_TOKEN environment variable not set"
    echo "   Set it with: export TELEGRAM_BOT_TOKEN=your_token"
fi

# Check if STRIPE_PAYMENT_LINK is set
if [ -z "$STRIPE_PAYMENT_LINK" ]; then
    echo "⚠️  STRIPE_PAYMENT_LINK environment variable not set"
    echo "   Set it with: export STRIPE_PAYMENT_LINK=your_payment_link"
fi

# Start ngrok in background
echo "🌐 Starting ngrok tunnel on port 8080..."
ngrok http 8080 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app' | head -n 1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $NGROK_PID
    exit 1
fi

echo "✅ ngrok tunnel running at: $NGROK_URL"
export NGROK_URL="$NGROK_URL"

# Start API server in background
echo "🔧 Starting API server..."
npm run api > /tmp/api-server.log 2>&1 &
API_PID=$!

# Wait for API server to be ready
sleep 3

# Check if API server is running
if ! curl -s http://localhost:8080 > /dev/null; then
    echo "❌ API server failed to start"
    kill $NGROK_PID $API_PID
    exit 1
fi

echo "✅ API server running at http://localhost:8080"

# Start Telegram bot if token is provided
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "🤖 Starting Telegram bot..."
    node bots/telegram-bot.mjs > /tmp/telegram-bot.log 2>&1 &
    TELEGRAM_PID=$!
    echo "✅ Telegram bot started (PID: $TELEGRAM_PID)"
else
    echo "⏭️  Skipping Telegram bot (no token)"
    TELEGRAM_PID=""
fi

# Start WhatsApp bot (requires manual QR scan)
echo "📱 Starting WhatsApp bot..."
echo "   Note: WhatsApp bot requires QR code scanning for first-time setup"
node bots/whatsapp-bot.mjs > /tmp/whatsapp-bot.log 2>&1 &
WHATSAPP_PID=$!
echo "✅ WhatsApp bot started (PID: $WHATSAPP_PID)"

# Print status
echo ""
echo "=========================================="
echo "🎉 Bot Development Environment Started!"
echo "=========================================="
echo ""
echo "🌐 ngrok URL: $NGROK_URL"
echo "🔧 API Server: http://localhost:8080"
echo "🤖 Telegram Bot: ${TELEGRAM_PID:-Not running}"
echo "📱 WhatsApp Bot: Running (check logs for QR code)"
echo ""
echo "📋 Logs:"
echo "   ngrok: /tmp/ngrok.log"
echo "   API: /tmp/api-server.log"
echo "   Telegram: /tmp/telegram-bot.log"
echo "   WhatsApp: /tmp/whatsapp-bot.log"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo "=========================================="

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $NGROK_PID 2>/dev/null || true
    kill $API_PID 2>/dev/null || true
    [ -n "$TELEGRAM_PID" ] && kill $TELEGRAM_PID 2>/dev/null || true
    kill $WHATSAPP_PID 2>/dev/null || true
    echo "✅ All services stopped"
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait

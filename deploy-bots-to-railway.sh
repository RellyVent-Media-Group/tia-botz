#!/bin/bash

# ChiefPilot Bot Deployment Script for Railway
# This script deploys Discord, Telegram, and WhatsApp bots to Railway
# Prerequisites: Railway CLI installed and authenticated

set -e

echo "🚀 ChiefPilot Bot Deployment to Railway"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is authenticated
echo "🔐 Checking Railway authentication..."
if ! railway status &> /dev/null; then
    echo "❌ Not authenticated with Railway. Please run: railway login"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Authenticated with Railway"
echo ""

# Function to deploy a bot
deploy_bot() {
    local bot_name=$1
    local bot_dir=$2
    local env_file=$3
    
    echo "📦 Deploying $bot_name..."
    echo "   Directory: $bot_dir"
    echo "   Environment: $env_file"
    
    # Create a new project for this bot
    echo "   Creating Railway project..."
    railway project init --name "chiefpilot-$bot-name"
    
    # Navigate to bot directory
    cd "$bot_dir"
    
    # Add service
    echo "   Adding service..."
    railway up
    
    # Set environment variables
    echo "   Setting environment variables..."
    if [ -f "$env_file" ]; then
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue
            
            # Remove quotes if present
            value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            echo "     Setting $key..."
            railway variables set "$key=$value"
        done < "$env_file"
    fi
    
    # Deploy
    echo "   Deploying..."
    railway up
    
    cd - > /dev/null
    
    echo "✅ $bot_name deployed successfully"
    echo ""
}

# Main deployment
echo "Starting deployment process..."
echo ""

# Deploy Discord bot
if [ -d "bots/discord-bot" ]; then
    deploy_bot "discord" "bots/discord-bot" "railway.env.example"
else
    echo "⚠️  Discord bot directory not found, skipping..."
fi

# Deploy Telegram bot
if [ -d "bots/telegram-bot" ]; then
    deploy_bot "telegram" "bots/telegram-bot" "railway.env.example"
else
    echo "⚠️  Telegram bot directory not found, skipping..."
fi

# Deploy WhatsApp bot
if [ -d "bots/whatsapp-bot" ]; then
    deploy_bot "whatsapp" "bots/whatsapp-bot" "railway.env.example"
else
    echo "⚠️  WhatsApp bot directory not found, skipping..."
fi

echo "=========================================="
echo "🎉 Deployment process completed!"
echo ""
echo "Next steps:"
echo "1. Update the actual environment variables in Railway dashboard"
echo "2. Replace placeholder values with real tokens and credentials"
echo "3. Monitor deployment logs in Railway dashboard"
echo "4. Test bot health endpoints"
echo ""
echo "For detailed instructions, see:"
echo "- bots/discord-bot/RAILWAY_DEPLOYMENT.md"
echo "- DEPLOYMENT_GUIDE.md"

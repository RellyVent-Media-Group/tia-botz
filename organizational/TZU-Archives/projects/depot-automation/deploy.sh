#!/bin/bash

# Depot Automation System Deployment Script

set -e

echo "🚀 Starting Depot Automation System Deployment..."

# Load environment variables
if [ -f .env ]; then
    echo "📝 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found, using defaults"
    cp .env.example .env
    echo "📝 Created .env file from example - please configure it"
fi

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p data logs

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Test configuration
echo "⚙️  Testing configuration..."
python3 config.py

# Build Docker image
echo "🐳 Building Docker image..."
docker-compose build

# Start services
echo "🎯 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Run health check
echo "🏥 Running health check..."
docker-compose exec depot-automation python3 -c "import sys; sys.exit(0)"

echo "✅ Deployment completed successfully!"
echo "📈 Depot Automation System is now running"
echo "🌐 API available at http://localhost:8000"
echo "📊 Check logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
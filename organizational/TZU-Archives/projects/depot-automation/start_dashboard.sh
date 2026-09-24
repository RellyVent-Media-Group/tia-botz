#!/bin/bash

# Start the web dashboard in background

echo "🚀 Starting Tiapmaatzu Depot Automation Dashboard..."
cd "$(dirname "$0")"

# Check if Flask is installed
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing Flask dependencies..."
    pip install flask flask-cors
fi

# Create templates directory
mkdir -p templates

# Start the dashboard
echo "📊 Dashboard will be available at http://localhost:8000"
echo "🔧 Press Ctrl+C to stop the server"
python3 web_dashboard.py
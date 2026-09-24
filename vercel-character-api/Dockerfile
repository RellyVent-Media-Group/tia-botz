# Dockerfile for Character API - Local Testing
# Use this for local development and testing of the Character API
# Run with: docker build -t character-api . && docker run -p 8000:8000 -e DISCORD_WEBHOOK=your_webhook_url character-api

# Use Python 3.11 as the base image (Vercel uses this version)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Install system dependencies required for Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first for better caching
COPY requirements.txt .

# Install Python dependencies (currently empty, but available for future use)
RUN pip install --no-cache-dir -r requirements.txt || true

# Copy the entire application
COPY . .

# Copy vercel.json if it exists
COPY vercel.json .

# Create the api directory if it doesn't exist
RUN mkdir -p /app/api

# Expose port 8000 for local testing
EXPOSE 8000

# Set the default Discord webhook URL (can be overridden with -e DISCORD_WEBHOOK)
ENV DISCORD_WEBHOOK=https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/character-health || exit 1

# Start the Character API server
# Note: For Vercel deployment, use `vercel` command
# For local testing, we'll start the Python HTTP server
CMD ["python", "-m", "http.server", "8000"]

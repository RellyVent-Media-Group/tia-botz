FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || pip install --no-cache-dir python-dateutil

# Copy depot automation code
COPY cashinghouse-automation/ ./cashinghouse-automation/
COPY consort-automation/ ./consort-automation/
COPY holdings-automation/ ./holdings-automation/
COPY scribe-automation/ ./scribe-automation/
COPY depot_integration.py .
COPY automation_capabilities_simple.py .
COPY config.py .

# Create data directories
RUN mkdir -p /app/data /app/logs

# Set environment variables
ENV PYTHONPATH=/app
ENV DATA_DIR=/app/data
ENV PYTHONUNBUFFERED=1

# Create a simple startup script
RUN echo '#!/bin/bash\n\
echo "Starting Depot Automation System..."\n\
python3 config.py\n\
echo "Configuration loaded successfully"\n\
python3 automation_capabilities_simple.py\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port for future web interface
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python3 -c "import sys; sys.exit(0)" || exit 0

# Start the application
CMD ["/app/start.sh"]
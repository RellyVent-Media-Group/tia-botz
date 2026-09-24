# Dockerfile for Social Media Automation - Local Testing
# Use this for local development and testing of the social media automation
# Run with: docker build -t social-media-automation . && docker run -it social-media-automation npm start

# Use Node.js 20 LTS as the base image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=development \
    NODE_WITHOUT_CRT_FORMATS=1 \
    PUPPETEER_SKIP_DOWNLOAD=true

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package.json and package-lock.json first for better caching
COPY package.json package-lock.json ./

# Install dependencies as non-root user
USER nextjs
RUN npm ci --only=production && \
    npm cache clean --force

# Copy the rest of the application
COPY --chown=nextjs:nodejs . .

# Install dev dependencies for testing
RUN npm install --only=dev || true

# Expose port 3000 (default for social media automation)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))" || exit 1

# Start the social media automation
CMD ["npm", "start"]

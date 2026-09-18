# Multi-AI Integration Guide

Complete guide for integrating DALL-E, Stable Diffusion, and Midjourney with intelligent fallback for visual asset generation.

## 🚀 Quick Start

### 1. Initial Setup
```bash
cd visual-assets
./generate-assets-multi.sh --setup-env
```

### 2. Test Services
```bash
./generate-assets-multi.sh --test-services
```

### 3. Generate Assets
```bash
# Auto mode with intelligent fallback
./generate-assets-multi.sh

# Specific platform
./generate-assets-multi.sh -p instagram

# Specific AI service
./generate-assets-multi.sh -m dalle
```

## 🤖 AI Services Overview

### DALL-E (OpenAI)
- **Quality**: High, professional results
- **Cost**: ~$0.04 per image (DALL-E 3)
- **Speed**: Fast (10-30 seconds)
- **Setup**: Requires OpenAI API key
- **Best for**: Professional promotional content, consistent branding

### Stable Diffusion
- **Quality**: Good to excellent (depends on model)
- **Cost**: Free (after initial setup)
- **Speed**: Medium (20-60 seconds)
- **Setup**: Requires local Stable Diffusion WebUI
- **Best for**: Cost-effective generation, custom models, high volume

### Midjourney
- **Quality**: Artistic, highly creative
- **Cost**: Subscription-based ($10-60/month)
- **Speed**: Medium (30-90 seconds)
- **Setup**: Requires Discord bot integration
- **Best for**: Social media content, creative assets, viral content

## 🔧 Setup Instructions

### DALL-E Setup

#### 1. Get OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API keys section
4. Create new API key
5. Copy the key (starts with `sk-`)

#### 2. Install Dependencies
```bash
pip install openai requests
```

#### 3. Configure Environment
```bash
# Using the interactive setup
./generate-assets-multi.sh --setup-env

# Or manually edit .env file
OPENAI_API_KEY=sk-your-actual-key-here
```

#### 4. Test Configuration
```bash
./generate-assets-multi.sh --test-services
```

### Stable Diffusion Setup

#### 1. Install Stable Diffusion WebUI
```bash
# Clone the repository
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Install dependencies (Windows)
webui.bat

# Install dependencies (Linux/Mac)
./webui.sh
```

#### 2. Enable API
1. Launch Stable Diffusion WebUI
2. Go to Settings → User Interface
3. Enable "API" option
4. Restart WebUI with `--api` flag:
   ```bash
   ./webui.sh --api
   ```

#### 3. Configure URL
```bash
# Using interactive setup
./generate-assets-multi.sh --setup-env

# Or manually edit .env file
STABLE_DIFFUSION_URL=http://127.0.0.1:7860
```

#### 4. Test Configuration
```bash
./generate-assets-multi.sh --test-services
```

### Midjourney Setup

#### 1. Get Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to Bot section
4. Create bot and copy token

#### 2. Get Channel ID
1. Enable Developer Mode in Discord
2. Right-click your channel
3. Copy ID

#### 3. Configure Environment
```bash
# Using interactive setup
./generate-assets-multi.sh --setup-env

# Or manually edit .env file
MIDJOURNEY_DISCORD_BOT_TOKEN=your_bot_token_here
MIDJOURNEY_CHANNEL_ID=your_channel_id_here
```

#### 4. Test Configuration
```bash
./generate-assets-multi.sh --test-services
```

## 📋 Configuration Files

### config.json
Main configuration file for AI services and generation settings.

```json
{
  "ai_services": {
    "dalle": {
      "enabled": true,
      "priority": 1,
      "model": "dall-e-3",
      "quality": "standard"
    },
    "stable_diffusion": {
      "enabled": true,
      "priority": 2,
      "api_url": "http://127.0.0.1:7860/sdapi/v1/txt2img"
    },
    "midjourney": {
      "enabled": true,
      "priority": 3
    }
  },
  "generation_settings": {
    "fallback_enabled": true,
    "fallback_order": ["dalle", "stable-diffusion", "midjourney"]
  }
}
```

### .env
Environment variables for API keys and sensitive data.

```bash
OPENAI_API_KEY=sk-your-key-here
STABLE_DIFFUSION_URL=http://127.0.0.1:7860
MIDJOURNEY_DISCORD_BOT_TOKEN=your_token_here
MIDJOURNEY_CHANNEL_ID=your_channel_id_here
```

## 🎯 Usage Examples

### Auto Mode (Intelligent Fallback)
```bash
# Automatically tries available services in priority order
./generate-assets-multi.sh

# For specific platform
./generate-assets-multi.sh -p instagram
```

### Specific AI Service
```bash
# Use only DALL-E
./generate-assets-multi.sh -m dalle

# Use only Stable Diffusion
./generate-assets-multi.sh -m stable-diffusion

# Use only Midjourney
./generate-assets-multi.sh -m midjourney
```

### Platform-Specific Preferences
The system uses platform-specific preferences defined in `config.json`:

```json
"platform_defaults": {
  "instagram": {
    "preferred_service": "midjourney",
    "quality": "high"
  },
  "telegram": {
    "preferred_service": "stable-diffusion",
    "quality": "medium"
  }
}
```

### Advanced Usage
```bash
# Specific image with specific service
./generate-assets-multi.sh -p crackrevenue -i 1 -m dalle

# Skip health check for faster execution
./generate-assets-multi.sh --no-health-check

# Custom output directory
./generate-assets-multi.sh --output-dir ../my-assets
```

## 🔍 Service Health Checking

The system automatically checks service health before generation:

```bash
# Run health check manually
./generate-assets-multi.sh --test-services
```

### Health Check Results
- ✓ **Available**: Service is ready for generation
- ✗ **Unavailable**: Service has configuration or connectivity issues
- ⚠ **Warning**: Service is partially available (Midjourney)

### Troubleshooting Health Issues

#### DALL-E Issues
- **API Key not found**: Set `OPENAI_API_KEY` in `.env`
- **Package not installed**: Run `pip install openai`
- **API connection failed**: Check internet connection and API key validity

#### Stable Diffusion Issues
- **Connection refused**: Ensure WebUI is running with `--api` flag
- **API error**: Check WebUI is accessible at configured URL
- **Timeout**: Increase timeout in `config.json`

#### Midjourney Issues
- **API connectivity**: Midjourney API access varies
- **Configuration**: Ensure Discord bot token and channel ID are set
- **Manual setup**: Consider using Discord directly for Midjourney

## 🎨 Intelligent Fallback System

### How It Works
1. Check service availability
2. Try preferred service for platform
3. If failed, try next service in fallback order
4. If all fail, create placeholder

### Fallback Order
Default order: DALL-E → Stable Diffusion → Midjourney → Placeholder

### Customizing Fallback
Edit `config.json`:

```json
"generation_settings": {
  "fallback_enabled": true,
  "fallback_order": ["stable-diffusion", "dalle", "midjourney"]
}
```

### Disabling Fallback
```json
"generation_settings": {
  "fallback_enabled": false
}
```

## 📊 Platform-Specific Recommendations

### CRAKREVENUE
- **Preferred**: DALL-E
- **Reason**: Professional quality, brand consistency
- **Quality**: High

### TELEGRAM
- **Preferred**: Stable Diffusion
- **Reason**: Cost-effective for high volume
- **Quality**: Medium

### WHATSAPP
- **Preferred**: DALL-E
- **Reason**: Professional business appearance
- **Quality**: High

### GOOGLE
- **Preferred**: DALL-E
- **Reason**: Ad quality and consistency
- **Quality**: High

### ADMOB
- **Preferred**: Stable Diffusion
- **Reason**: Mobile optimization, cost efficiency
- **Quality**: Medium

### INSTAGRAM
- **Preferred**: Midjourney
- **Reason**: Artistic quality, viral potential
- **Quality**: High

### TIKTOK
- **Preferred**: Midjourney
- **Reason**: Trending aesthetics, creative content
- **Quality**: High

### MULTI-PLATFORM
- **Preferred**: DALL-E
- **Reason**: Consistency across platforms
- **Quality**: High

## 🛠️ Advanced Configuration

### Performance Tuning

#### DALL-E Settings
```json
"dalle": {
  "model": "dall-e-3",
  "quality": "hd",  // "standard" or "hd"
  "max_retries": 3,
  "timeout": 60
}
```

#### Stable Diffusion Settings
```json
"stable_diffusion": {
  "default_steps": 30,  // Higher = better quality, slower
  "default_cfg_scale": 7,  // Guidance scale
  "default_sampler": "DPM++ 2M Karras"  // Sampler name
}
```

#### Batch Processing
```json
"generation_settings": {
  "parallel_generation": false,
  "batch_size": 5,
  "auto_retry": true
}
```

### Output Settings
```json
"output_settings": {
  "default_format": "jpg",
  "jpeg_quality": 95,
  "create_thumbnails": true,
  "add_metadata": true
}
```

## 🧪 Testing and Validation

### Comprehensive Service Test
```bash
python3 test-ai-services.py
```

### Test Results Interpretation
- **PASS**: Service fully operational
- **FAIL**: Service has critical issues
- **WARN**: Service partially available
- **SKIP**: Service disabled in config

### Integration Testing
```bash
# Test single image generation
./generate-assets-multi.sh -p crackrevenue -i 1 -m dalle

# Test fallback system
./generate-assets-multi.sh -p instagram -m auto
```

## 💰 Cost Optimization

### DALL-E Cost Management
- DALL-E 3: ~$0.04 per image
- For 32 images: ~$1.28 total
- Use for high-priority platforms only

### Stable Diffusion Cost Optimization
- Free after initial setup
- Hardware requirements: GPU with 8GB+ VRAM
- Ideal for high-volume generation

### Midjourney Cost Management
- Basic plan: $10/month (200 images)
- Standard plan: $30/month (unlimited)
- Best for social media and creative content

### Cost-Saving Strategy
1. Use Stable Diffusion for bulk generation
2. Use DALL-E for key promotional assets
3. Use Midjourney for social media content
4. Enable intelligent fallback to optimize costs

## 🔒 Security Best Practices

### API Key Security
- Never commit `.env` file to version control
- Use `.env.example` as template
- Rotate API keys regularly
- Use environment-specific keys

### File Permissions
```bash
# Restrict .env file permissions
chmod 600 .env

# Add to .gitignore
echo ".env" >> .gitignore
```

### Rate Limiting
- Monitor API usage to avoid rate limits
- Implement retry logic with exponential backoff
- Use caching for repeated prompts

## 📈 Performance Monitoring

### Service Usage Tracking
The system tracks which service generated each image:

```
Service Usage:
  dalle: 12 images
  stable-diffusion: 15 images
  midjourney: 5 images
```

### Performance Metrics
- Generation time per service
- Success/failure rates
- Cost tracking
- Quality assessment

## 🆘 Troubleshooting

### Common Issues

#### All Services Failing
1. Check internet connection
2. Verify API keys in `.env`
3. Run `--test-services` to diagnose
4. Check configuration files syntax

#### DALL-E Only Failing
1. Verify API key is valid
2. Check OpenAI account credits
3. Ensure `openai` package is installed
4. Test API key with OpenAI dashboard

#### Stable Diffusion Only Failing
1. Ensure WebUI is running with `--api`
2. Check URL in configuration
3. Verify WebUI is accessible in browser
4. Check firewall settings

#### Midjourney Only Failing
1. Verify Discord bot permissions
2. Check channel ID is correct
3. Ensure bot is in the server
4. Consider manual Discord usage

#### Generation Quality Issues
1. Adjust prompt specificity
2. Try different AI services
3. Modify quality settings in config
4. Use platform-specific preferred services

## 📚 Additional Resources

### Documentation
- [OpenAI DALL-E API Docs](https://platform.openai.com/docs/guides/images)
- [Stable Diffusion WebUI Docs](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki)
- [Midjourney Documentation](https://docs.midjourney.com/)

### Community
- OpenAI Discord
- Stable Diffusion Reddit
- Midjourney Discord

### Tools
- [OpenAI API Dashboard](https://platform.openai.com/)
- [Stable Diffusion Models](https://civitai.com/)
- [Midjourney Gallery](https://midjourney.com/)

## 🎯 Best Practices

### Production Workflow
1. Test all services before production
2. Use intelligent fallback for reliability
3. Monitor costs and performance
4. Regular health checks
5. Backup configuration files

### Prompt Optimization
- Be specific and detailed
- Include style references
- Specify technical requirements
- Test prompts with each service
- Use platform-specific prompts

### Quality Assurance
- Review generated images
- Check character consistency
- Verify platform specifications
- Test upload to target platforms
- Maintain asset inventory

---

**Need Help?** Run `./generate-assets-multi.sh --help` or check the main README.md
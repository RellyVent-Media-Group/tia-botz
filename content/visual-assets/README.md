# Visual Assets Generator

This directory contains the organized folder structure and generation scripts for multi-platform visual assets based on the specifications in `multi-platform-visual-assets.md`.

## 📁 Folder Structure

```
visual-assets/
├── crackrevenue/
│   ├── gallery-images/
│   ├── thumbnails/
│   └── social-media/
├── telegram/
│   ├── bot-interface/
│   ├── command-system/
│   └── revenue-model/
├── whatsapp/
│   ├── business-interface/
│   ├── template-messages/
│   └── engagement-data/
├── google/
│   ├── ads-coverage/
│   ├── performance-data/
│   └── campaign-strategy/
├── admob/
│   ├── format-coverage/
│   ├── engagement-impact/
│   └── revenue-projection/
├── instagram/
│   ├── format-coverage/
│   ├── growth-strategy/
│   └── production-workflow/
├── tiktok/
│   ├── format-coverage/
│   ├── viral-probability/
│   └── trend-adaptation/
├── multi-platform/
│   ├── platform-coverage/
│   ├── unified-identity/
│   └── growth-projection/
├── prompts-organized.json       # Organized prompts data
├── prompts-organized.txt        # Human-readable prompts
├── config.json                 # Multi-AI configuration
├── .env.example                # Environment variables template
├── generate-assets.py          # Basic Python generation script
├── generate-assets.sh          # Basic bash wrapper
├── generate-assets-enhanced.py # Enhanced multi-AI script
├── generate-assets-multi.sh    # Enhanced multi-AI wrapper
├── test-ai-services.py        # AI services testing script
├── MULTI_AI_GUIDE.md          # Comprehensive multi-AI guide
├── ASSET_PRODUCTION_CHECKLIST.md # Production checklist
├── QUICK_START.md             # Quick start guide
└── README.md                  # This file
```

## 🚀 Quick Start

### Multi-AI System (Recommended)
The enhanced system supports DALL-E, Stable Diffusion, and Midjourney with intelligent fallback:

```bash
# Interactive setup
./generate-assets-multi.sh --setup-env

# Test AI services
./generate-assets-multi.sh --test-services

# Generate with intelligent fallback
./generate-assets-multi.sh

# Specific platform with auto-fallback
./generate-assets-multi.sh -p instagram
```

### Basic System (Single AI)
```bash
# Generate all assets (placeholders)
./generate-assets.sh

# Generate specific platform
./generate-assets.sh -p instagram

# Generate specific image
./generate-assets.sh -p telegram -i 1
```

### Using Specific AI Services
```bash
# Multi-AI system with specific service
./generate-assets-multi.sh -m dalle              # DALL-E only
./generate-assets-multi.sh -m stable-diffusion   # Stable Diffusion only
./generate-assets-multi.sh -m midjourney         # Midjourney only

# Basic system with AI
./generate-assets.sh -m dalle                    # DALL-E
./generate-assets.sh -m stable-diffusion         # Stable Diffusion
```

## 📋 Available Platforms

| Platform | Images | Folder | Preferred AI Service |
|----------|--------|--------|---------------------|
| CRAKREVENUE | 4 | crackrevenue/ | DALL-E |
| TELEGRAM | 4 | telegram/ | Stable Diffusion |
| WHATSAPP | 4 | whatsapp/ | DALL-E |
| GOOGLE | 4 | google/ | DALL-E |
| ADMOB | 4 | admob/ | Stable Diffusion |
| INSTAGRAM | 4 | instagram/ | Midjourney |
| TIKTOK | 4 | tiktok/ | Midjourney |
| MULTI-PLATFORM | 4 | multi-platform/ | DALL-E |

**Total: 32 images across 8 platforms**

## 🔧 AI Generation Methods

### Multi-AI System (Enhanced)
The enhanced system (`generate-assets-multi.sh`) supports all three AI services with intelligent fallback:

#### DALL-E (OpenAI)
- **Quality**: High, professional results
- **Cost**: ~$0.04 per image
- **Speed**: Fast (10-30 seconds)
- **Setup**: OpenAI API key required
- **Best for**: Professional promotional content

#### Stable Diffusion
- **Quality**: Good to excellent
- **Cost**: Free (after initial setup)
- **Speed**: Medium (20-60 seconds)
- **Setup**: Local Stable Diffusion WebUI required
- **Best for**: Cost-effective high-volume generation

#### Midjourney
- **Quality**: Artistic, highly creative
- **Cost**: Subscription-based ($10-60/month)
- **Speed**: Medium (30-90 seconds)
- **Setup**: Discord bot integration required
- **Best for**: Social media and creative content

#### Intelligent Fallback
- Automatically tries services in priority order
- Platform-specific preferred services
- Graceful degradation to placeholders
- Health checking and retry logic

### Basic System (Single AI)
The basic system (`generate-assets.sh`) supports single AI service selection:

#### Placeholder (Default)
- Creates simple placeholder images with prompt text
- No API keys required
- Good for testing and layout planning

#### Individual AI Services
- DALL-E, Stable Diffusion, or Midjourney
- One service at a time
- Manual service selection required

## 📝 File Naming Convention

```
[platform]_[product]_[type]_[number].jpg
```

Examples:
- `crackrevenue_mac-mary_promo-showcase_01.jpg`
- `telegram_bot-interface_preview_01.jpg`
- `instagram_growth-strategy_timeline_01.jpg`

## 🛠️ Requirements

### Basic Requirements
- Python 3.6+
- For placeholder generation: `pip install Pillow`

### Multi-AI System Requirements
- `pip install openai requests Pillow`
- Configuration file: `config.json`
- Environment file: `.env` (copy from `.env.example`)

### DALL-E Setup
- `pip install openai`
- OpenAI API key (set in `.env`)
- OpenAI account with credits

### Stable Diffusion Setup
- Stable Diffusion WebUI (Automatic1111)
- WebUI running with `--api` flag
- Sufficient GPU hardware (8GB+ VRAM recommended)

### Midjourney Setup
- Discord bot token
- Discord channel ID
- Midjourney subscription (optional for API access)

## 📖 Usage Examples

### Multi-AI System Examples
```bash
# Interactive environment setup
./generate-assets-multi.sh --setup-env

# Test all AI services
./generate-assets-multi.sh --test-services

# Generate with intelligent fallback (recommended)
./generate-assets-multi.sh

# Specific platform with auto service selection
./generate-assets-multi.sh -p instagram

# Force specific AI service
./generate-assets-multi.sh -p crackrevenue -m dalle
./generate-assets-multi.sh -p telegram -m stable-diffusion
./generate-assets-multi.sh -p tiktok -m midjourney

# Skip health check for faster execution
./generate-assets-multi.sh --no-health-check
```

### Basic System Examples
```bash
# View all prompts
cat prompts-organized.txt

# Generate single platform with DALL-E
./generate-assets.sh -p instagram -m dalle

# Generate specific image
./generate-assets.sh -p crackrevenue -i 2 -m stable-diffusion

# Custom output directory
./generate-assets.sh --output-dir ../my-assets
```

## 🔍 Troubleshooting

### Python Not Found
```bash
# Install Python 3 on macOS
brew install python3

# On Ubuntu/Debian
sudo apt-get install python3
```

### Missing Dependencies
```bash
pip install Pillow openai requests
```

### AI Service Issues
```bash
# Test all AI services connectivity
./generate-assets-multi.sh --test-services

# Re-run environment setup
./generate-assets-multi.sh --setup-env

# Check configuration files
cat config.json
cat .env
```

### File Already Exists
The script will ask if you want to overwrite existing files.

### API Errors
- Check your API key is set correctly in `.env`
- Verify you have sufficient credits/quota
- Check your internet connection
- Run health check: `./generate-assets-multi.sh --test-services`

### Stable Diffusion Connection Issues
- Ensure WebUI is running with `--api` flag
- Check URL in `config.json` matches WebUI address
- Verify WebUI is accessible in browser
- Check firewall settings

### Generation Quality Issues
- Try different AI services for comparison
- Adjust prompt specificity
- Modify quality settings in `config.json`
- Use platform-specific preferred services

## 📊 Asset Specifications

### Platform-Specific Sizes
- **Fiverr**: 1280x769px
- **Gumroad**: 1200x630px (featured), 1280x720px (gallery)
- **Instagram**: 1080x1080px (square), 1080x1350px (portrait)
- **TikTok**: 1080x1920px (vertical), 1080x1080px (square)
- **Google/AdMob**: Various sizes

### Color Palettes
Each platform has specific color requirements defined in the main guide.

## 📞 Support

### Documentation
- **Multi-AI Guide**: See `MULTI_AI_GUIDE.md` for comprehensive multi-AI setup
- **Production Checklist**: See `ASSET_PRODUCTION_CHECKLIST.md` for production workflow
- **Quick Start**: See `QUICK_START.md` for immediate next steps
- **Main Guide**: Check `multi-platform-visual-assets.md` for detailed specifications

### Troubleshooting
1. Run `./generate-assets-multi.sh --test-services` to diagnose AI service issues
2. Review prompts: `prompts-organized.txt`
3. Check configuration: `config.json`
4. Verify environment variables: `.env`

### Getting Help
- Run `./generate-assets-multi.sh --help` for command options
- Check the Multi-AI Guide for detailed setup instructions
- Review the Production Checklist for workflow guidance

## 📄 License

These assets are generated based on the specifications in the multi-platform visual assets guide.
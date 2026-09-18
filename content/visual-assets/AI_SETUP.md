# AI Generation Setup Guide

This guide walks you through setting up various AI generation options for your visual assets.

## Quick Setup Status

✅ **Python Environment**: Virtual environment created and dependencies installed
✅ **Script Updated**: Enhanced with multiple AI generation methods
✅ **Configuration Template**: `.env.example` file created
✅ **Free Option Working**: Pollinations AI - completely free, unlimited, no GPU required

## Recommended: Pollinations AI (Free & Unlimited)

**Why Pollinations AI?**
- ✅ **Completely Free**: No API costs, no subscriptions, no credits needed
- ✅ **Unlimited**: Generate as many images as you want
- ✅ **No GPU Required**: Works on any computer including MacBooks
- ✅ **No Setup**: Uses simple URL-based API, no installation needed
- ✅ **High Quality**: Stable Diffusion-based generation
- ✅ **Multiple Formats**: Supports various aspect ratios and sizes

### Quick Start with Pollinations AI

```bash
# Activate virtual environment
source venv/bin/activate

# Generate a single test image
./generate-assets.sh -p crackrevenue -i 1 -m pollinations

# Generate all assets with Pollinations AI
./generate-assets.sh -m pollinations
```

### Examples of Generated Assets

We've successfully generated sample assets using Pollinations AI:
- ✅ CrackRevenue promotional character showcase
- ✅ Instagram format coverage grid
- ✅ TikTok vertical format showcase
- ✅ Multi-platform coverage visualization

### Generate All 32 Assets

```bash
# Generate all platforms with Pollinations AI (free)
source venv/bin/activate
./generate-assets.sh -m pollinations
```

**Cost**: $0 (completely free)
**Time**: ~30-60 seconds per image
**Quality**: High-quality Stable Diffusion results

## DALL-E Setup

### 1. Get OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure API Key
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file and add your API key
# OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Test DALL-E Generation
```bash
# Activate virtual environment
source venv/bin/activate

# Generate a single test image with DALL-E
./generate-assets.sh -p crackrevenue -i 1 -m dalle
```

### 4. Generate All Assets with DALL-E
```bash
./generate-assets.sh -m dalle
```

**Note**: DALL-E 3 costs ~$0.04 per image. Generating all 32 images would cost approximately $1.28.

## Stable Diffusion Setup

### Option A: Automatic1111 WebUI (Recommended)

#### 1. Install Stable Diffusion WebUI
```bash
# Clone the repository
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Run the web UI (this will install dependencies automatically)
./webui.sh --api
```

#### 2. Enable API Access
The `--api` flag enables the API interface. The API will be available at `http://127.0.0.1:7860`

#### 3. Configure URL (if different from default)
```bash
# Edit .env file if your Stable Diffusion runs on a different port
# STABLE_DIFFUSION_URL=http://127.0.0.1:7860
```

#### 4. Test Stable Diffusion Generation
```bash
# Make sure Stable Diffusion WebUI is running
# Then test generation
source venv/bin/activate
./generate-assets.sh -p crackrevenue -i 1 -m stable-diffusion
```

### Option B: ComfyUI (Alternative)

#### 1. Install ComfyUI
```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
```

#### 2. Run ComfyUI with API
```bash
python main.py --listen 127.0.0.1 --port 8188
```

#### 3. Configure URL
```bash
# Edit .env file
# STABLE_DIFFUSION_URL=http://127.0.0.1:8188
```

## Usage Examples

### Generate Specific Platform with DALL-E
```bash
source venv/bin/activate
./generate-assets.sh -p instagram -m dalle
```

### Generate Specific Image with Stable Diffusion
```bash
source venv/bin/activate
./generate-assets.sh -p telegram -i 2 -m stable-diffusion
```

### Generate All Assets (Mixed Methods)
```bash
# First generate some with DALL-E
source venv/bin/activate
./generate-assets.sh -p crackrevenue -m dalle

# Then generate others with Stable Diffusion
./generate-assets.sh -p instagram -m stable-diffusion
```

## Environment Variables

Create a `.env` file in the visual-assets directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stable Diffusion Configuration
STABLE_DIFFUSION_URL=http://127.0.0.1:7860
```

## Troubleshooting

### DALL-E Issues
**Error: OPENAI_API_KEY not found**
- Make sure you created the `.env` file
- Check that the API key is correctly formatted
- Ensure the virtual environment is activated

**Error: Insufficient quota**
- Check your OpenAI account credits
- Add credits to your OpenAI account

### Stable Diffusion Issues
**Error: Connection refused**
- Make sure Stable Diffusion WebUI is running
- Check that the API is enabled (use `--api` flag)
- Verify the URL in `.env` matches the running instance

**Error: CUDA out of memory**
- Reduce image size in prompts
- Close other GPU-intensive applications
- Use a smaller model in Stable Diffusion

### Virtual Environment Issues
**Error: Module not found**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

## Cost Comparison

| Service | Cost per Image | Cost for 32 Images | Speed | Quality | Setup |
|---------|---------------|-------------------|-------|---------|-------|
| **Pollinations AI** | **$0** | **$0** | **Medium** | **High** | **None** |
| DALL-E 3 | ~$0.04 | ~$1.28 | Fast | High | API Key |
| Stable Diffusion | Free (local) | $0 | Medium | High | GPU Setup |
| Midjourney | ~$0.03 | ~$0.96 | Slow | Very High | Discord |

**Recommendation**: Use Pollinations AI for free, unlimited generation with no setup required.

## Best Practices

1. **Test First**: Always test with a single image before batch generation
2. **Monitor Credits**: Keep track of OpenAI API usage
3. **Backup Assets**: Keep your generated assets backed up
4. **Version Control**: Commit successful prompts to version control
5. **Quality Check**: Review generated images before using in production

## Next Steps

Once AI generation is set up:

1. **Review Generated Assets**: Check quality and consistency
2. **Adjust Prompts**: Modify prompts if results need improvement
3. **Batch Generate**: Generate all 32 assets with your preferred method
4. **Platform Integration**: Upload assets to respective platforms
5. **Performance Tracking**: Monitor which assets perform best

## Support

For issues with:
- **OpenAI API**: https://platform.openai.com/docs
- **Stable Diffusion**: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- **This Script**: Check the generate-assets.py file or contact support
#!/bin/bash
# Enhanced Multi-Platform Visual Asset Generator with Multi-AI Support
# This script provides a unified interface for DALL-E, Stable Diffusion, and Midjourney

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default values
PLATFORM=""
IMAGE_ID=""
METHOD="auto"
CONFIG_FILE="config.json"
PROMPTS_FILE="prompts-organized.json"
OUTPUT_DIR="visual-assets"
CHECK_HEALTH=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo "Multi-Platform Visual Asset Generator - Multi-AI Edition"
    echo ""
    echo "Usage: ./generate-assets-multi.sh [OPTIONS]"
    echo ""
    echo "AI Generation Methods:"
    echo "  -m, --method METHOD    AI generation method"
    echo "                         auto: Intelligent fallback (default)"
    echo "                         dalle: Use DALL-E only"
    echo "                         stable-diffusion: Use Stable Diffusion only"
    echo "                         midjourney: Use Midjourney only"
    echo "                         placeholder: Create placeholders only"
    echo ""
    echo "Target Selection:"
    echo "  -p, --platform PLATFORM    Specific platform to generate"
    echo "  -i, --image-id ID          Specific image ID to generate (1-4)"
    echo ""
    echo "Configuration:"
    echo "  --config-file FILE        Path to config file (default: config.json)"
    echo "  --prompts-file FILE        Path to prompts JSON file"
    echo "  --output-dir DIR           Output directory for generated assets"
    echo "  --no-health-check         Skip AI service health check"
    echo ""
    echo "Utilities:"
    echo "  --test-services           Test all AI services connectivity"
    echo "  --setup-env               Interactive environment setup"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./generate-assets-multi.sh                              # Auto mode with all services"
    echo "  ./generate-assets-multi.sh -p instagram                 # Instagram with auto fallback"
    echo "  ./generate-assets-multi.sh -m dalle                     # DALL-E only"
    echo "  ./generate-assets-multi.sh --test-services              # Test service connectivity"
    echo "  ./generate-assets-multi.sh --setup-env                  # Interactive setup"
    echo ""
    echo "Available Platforms:"
    echo "  - crackrevenue (4 images) - Preferred: DALL-E"
    echo "  - telegram (4 images) - Preferred: Stable Diffusion"
    echo "  - whatsapp (4 images) - Preferred: DALL-E"
    echo "  - google (4 images) - Preferred: DALL-E"
    echo "  - admob (4 images) - Preferred: Stable Diffusion"
    echo "  - instagram (4 images) - Preferred: Midjourney"
    echo "  - tiktok (4 images) - Preferred: Midjourney"
    echo "  - multi-platform (4 images) - Preferred: DALL-E"
    echo ""
    echo "AI Services Integration:"
    echo "  ✓ DALL-E (OpenAI) - High quality, ~$0.04/image"
    echo "  ✓ Stable Diffusion - Free local generation"
    echo "  ✓ Midjourney - Artistic quality, subscription-based"
    echo "  ✓ Intelligent fallback between services"
    echo "  ✓ Automatic health checking"
}

# Test services function
test_services() {
    echo -e "${BLUE}Testing AI Services...${NC}"
    if [ -f "test-ai-services.py" ]; then
        python3 test-ai-services.py --config-file "$CONFIG_FILE"
    else
        echo -e "${RED}Error: test-ai-services.py not found${NC}"
        exit 1
    fi
}

# Setup environment function
setup_env() {
    echo -e "${BLUE}Interactive Environment Setup${NC}"
    echo ""
    
    # Check if .env exists
    if [ -f ".env" ]; then
        echo -e "${YELLOW}.env file already exists. Overwrite? (y/n)${NC}"
        read -r response
        if [ "$response" != "y" ]; then
            echo "Setup cancelled."
            return
        fi
    fi
    
    # Copy example file
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}Created .env file from template${NC}"
    else
        echo -e "${RED}Error: .env.example not found${NC}"
        exit 1
    fi
    
    echo ""
    echo "Enter your API keys (press Enter to skip):"
    
    # DALL-E API Key
    echo -n "OpenAI API Key for DALL-E: "
    read -r dalle_key
    if [ -n "$dalle_key" ]; then
        sed -i.bak "s/your_openai_api_key_here/$dalle_key/" .env
        echo -e "${GREEN}✓ DALL-E API key configured${NC}"
    fi
    
    # Stable Diffusion URL
    echo -n "Stable Diffusion URL (default: http://127.0.0.1:7860): "
    read -r sd_url
    sd_url=${sd_url:-http://127.0.0.1:7860}
    sed -i.bak "s|http://127.0.0.1:7860|$sd_url|" .env
    echo -e "${GREEN}✓ Stable Diffusion URL configured${NC}"
    
    # Midjourney credentials
    echo -n "Midjourney Discord Bot Token (optional): "
    read -r mj_token
    if [ -n "$mj_token" ]; then
        sed -i.bak "s/your_discord_bot_token_here/$mj_token/" .env
        echo -e "${GREEN}✓ Midjourney bot token configured${NC}"
    fi
    
    echo -n "Midjourney Channel ID (optional): "
    read -r mj_channel
    if [ -n "$mj_channel" ]; then
        sed -i.bak "s/your_discord_channel_id_here/$mj_channel/" .env
        echo -e "${GREEN}✓ Midjourney channel ID configured${NC}"
    fi
    
    # Clean up backup
    rm -f .env.bak
    
    echo ""
    echo -e "${GREEN}Environment setup complete!${NC}"
    echo "Run './generate-assets-multi.sh --test-services' to verify configuration."
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -i|--image-id)
            IMAGE_ID="$2"
            shift 2
            ;;
        -m|--method)
            METHOD="$2"
            shift 2
            ;;
        --config-file)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --prompts-file)
            PROMPTS_FILE="$2"
            shift 2
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --no-health-check)
            CHECK_HEALTH=false
            shift
            ;;
        --test-services)
            test_services
            exit 0
            ;;
        --setup-env)
            setup_env
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

# Check if the enhanced script exists
if [ ! -f "generate-assets-enhanced.py" ]; then
    echo -e "${RED}Error: generate-assets-enhanced.py not found in current directory.${NC}"
    exit 1
fi

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}Loaded environment variables from .env${NC}"
fi

# Build command
CMD="python3 generate-assets-enhanced.py"

if [ -n "$PLATFORM" ]; then
    CMD="$CMD --platform $PLATFORM"
fi

if [ -n "$IMAGE_ID" ]; then
    CMD="$CMD --image-id $IMAGE_ID"
fi

CMD="$CMD --method $METHOD"
CMD="$CMD --config-file $CONFIG_FILE"
CMD="$CMD --prompts-file $PROMPTS_FILE"
CMD="$CMD --output-dir $OUTPUT_DIR"

if [ "$CHECK_HEALTH" = false ]; then
    CMD="$CMD --no-health-check"
fi

# Execute
echo -e "${BLUE}Executing: $CMD${NC}"
echo ""
$CMD
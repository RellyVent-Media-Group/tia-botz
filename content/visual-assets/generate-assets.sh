#!/bin/bash
# Multi-Platform Visual Asset Generator (Bash Version)
# This script provides a simple interface to generate assets using the Python script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default values
PLATFORM=""
IMAGE_ID=""
METHOD="placeholder"
PROMPTS_FILE="prompts-organized.json"
OUTPUT_DIR="visual-assets"

# Help function
show_help() {
    echo "Multi-Platform Visual Asset Generator"
    echo ""
    echo "Usage: ./generate-assets.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --platform PLATFORM    Specific platform to generate"
    echo "                             (crackrevenue, telegram, whatsapp, google, admob, instagram, tiktok, multi-platform)"
    echo "  -i, --image-id ID          Specific image ID to generate (1-4)"
    echo "  -m, --method METHOD        AI generation method"
    echo "                             (dalle, stable-diffusion, midjourney, pollinations, placeholder)"
    echo "                             Default: placeholder"
    echo "  --prompts-file FILE        Path to prompts JSON file"
    echo "                             Default: prompts-organized.json"
    echo "  --output-dir DIR           Output directory for generated assets"
    echo "                             Default: visual-assets"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./generate-assets.sh                                    # Generate all assets (placeholders)"
    echo "  ./generate-assets.sh -p instagram                      # Generate Instagram assets only"
    echo "  ./generate-assets.sh -p telegram -i 1                  # Generate Telegram image 1 only"
    echo "  ./generate-assets.sh -m dalle                         # Generate all using DALL-E"
    echo "  ./generate-assets.sh -m pollinations                  # Generate all using free Pollinations AI"
    echo "  ./generate-assets.sh -p crackrevenue -m stable-diffusion"
    echo ""
    echo "Available Platforms:"
    echo "  - crackrevenue (4 images)"
    echo "  - telegram (4 images)"
    echo "  - whatsapp (4 images)"
    echo "  - google (4 images)"
    echo "  - admob (4 images)"
    echo "  - instagram (4 images)"
    echo "  - tiktok (4 images)"
    echo "  - multi-platform (4 images)"
    echo ""
    echo "Total: 32 images across 8 platforms"
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
        --prompts-file)
            PROMPTS_FILE="$2"
            shift 2
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check if the Python script exists
if [ ! -f "generate-assets.py" ]; then
    echo "Error: generate-assets.py not found in current directory."
    exit 1
fi

# Build command
CMD="python3 generate-assets.py"

if [ -n "$PLATFORM" ]; then
    CMD="$CMD --platform $PLATFORM"
fi

if [ -n "$IMAGE_ID" ]; then
    CMD="$CMD --image-id $IMAGE_ID"
fi

CMD="$CMD --method $METHOD"
CMD="$CMD --prompts-file $PROMPTS_FILE"
CMD="$CMD --output-dir $OUTPUT_DIR"

# Execute
echo "Executing: $CMD"
echo ""
$CMD
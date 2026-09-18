#!/usr/bin/env python3
"""
Multi-Platform Visual Asset Generator
This script generates visual assets using AI image generation based on the organized prompts.
"""

import json
import os
import subprocess
from pathlib import Path
import argparse
import sys
from dotenv import load_dotenv

class AssetGenerator:
    def __init__(self, prompts_file="prompts-organized.json", output_dir="visual-assets"):
        # Load environment variables
        load_dotenv()
        
        self.prompts_file = prompts_file
        self.output_dir = output_dir
        self.prompts_data = self.load_prompts()
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.stable_diffusion_url = os.getenv('STABLE_DIFFUSION_URL', 'http://127.0.0.1:7860')
        
    def load_prompts(self):
        """Load the organized prompts from JSON file."""
        try:
            with open(self.prompts_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: Prompts file '{self.prompts_file}' not found.")
            sys.exit(1)
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in '{self.prompts_file}'.")
            sys.exit(1)
    
    def generate_with_dalle(self, prompt, output_path, size="1024x1024"):
        """
        Generate image using DALL-E API (OpenAI).
        Requires: openai package and API key set in environment variable OPENAI_API_KEY
        """
        try:
            from openai import OpenAI
            
            if not self.openai_api_key:
                print("✗ OPENAI_API_KEY not found in environment variables")
                print("  Please set it in .env file or export OPENAI_API_KEY=your_key")
                return False
            
            client = OpenAI(api_key=self.openai_api_key)
            
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            
            # Download the image
            import requests
            img_response = requests.get(image_url)
            if img_response.status_code == 200:
                with open(output_path, 'wb') as f:
                    f.write(img_response.content)
                print(f"✓ Generated: {output_path}")
                return True
            else:
                print(f"✗ Failed to download image for {output_path}")
                return False
                
        except ImportError:
            print("✗ OpenAI package not installed. Install with: pip install openai")
            return False
        except Exception as e:
            print(f"✗ DALL-E generation failed: {e}")
            return False
    
    def generate_with_stable_diffusion(self, prompt, output_path, width=1024, height=1024):
        """
        Generate image using Stable Diffusion (Automatic1111 or similar).
        Requires: Stable Diffusion WebUI running with API enabled
        """
        try:
            import requests
            
            # Stable Diffusion WebUI API endpoint (configurable via env)
            url = f"{self.stable_diffusion_url}/sdapi/v1/txt2img"
            
            payload = {
                "prompt": prompt,
                "width": width,
                "height": height,
                "steps": 20,
                "cfg_scale": 7,
                "sampler_name": "Euler a"
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                import base64
                result = response.json()
                image_data = base64.b64decode(result["images"][0])
                
                with open(output_path, 'wb') as f:
                    f.write(image_data)
                print(f"✓ Generated: {output_path}")
                return True
            else:
                print(f"✗ Stable Diffusion API error: {response.status_code}")
                print(f"  Make sure Stable Diffusion WebUI is running at {self.stable_diffusion_url}")
                return False
                
        except ImportError:
            print("✗ Requests package not installed. Install with: pip install requests")
            return False
        except Exception as e:
            print(f"✗ Stable Diffusion generation failed: {e}")
            return False
    
    def generate_with_pollinations(self, prompt, output_path, width=1024, height=1024):
        """
        Generate image using Pollinations AI (free, no GPU required).
        Uses simple URL-based API - completely free and unlimited.
        """
        try:
            import requests
            from urllib.parse import quote
            import time
            
            # Pollinations AI URL-based API
            encoded_prompt = quote(prompt)
            url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true"
            
            # Retry mechanism for rate limiting
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    # Add delay between requests to avoid rate limiting
                    if attempt > 0:
                        print(f"  Retry {attempt + 1}/{max_retries} after 5 seconds...")
                        time.sleep(5)
                    
                    # Download the image
                    response = requests.get(url, timeout=90)
                    
                    if response.status_code == 200:
                        with open(output_path, 'wb') as f:
                            f.write(response.content)
                        print(f"✓ Generated: {output_path}")
                        return True
                    elif response.status_code == 429:
                        print(f"  Rate limited, waiting 10 seconds...")
                        time.sleep(10)
                        continue
                    else:
                        print(f"✗ Pollinations AI error: {response.status_code}")
                        return False
                        
                except requests.exceptions.Timeout:
                    print(f"  Timeout on attempt {attempt + 1}, retrying...")
                    continue
                    
            print(f"✗ Pollinations AI failed after {max_retries} attempts")
            return False
                
        except ImportError:
            print("✗ Requests package not installed. Install with: pip install requests")
            return False
        except Exception as e:
            print(f"✗ Pollinations AI generation failed: {e}")
            return False
    
    def generate_placeholder(self, prompt, output_path, size):
        """
        Generate a placeholder image with prompt text overlay.
        Uses ImageMagick or PIL to create a basic placeholder.
        """
        try:
            from PIL import Image, ImageDraw, ImageFont
            import textwrap
            
            # Parse size
            width, height = map(int, size.replace('px', '').split('x'))
            
            # Create image with platform-specific background color
            img = Image.new('RGB', (width, height), color='#E5E7EB')
            draw = ImageDraw.Draw(img)
            
            # Try to use a nice font, fallback to default
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
                title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            except:
                font = ImageFont.load_default()
                title_font = ImageFont.load_default()
            
            # Draw title
            title = "AI GENERATED ASSET"
            bbox = draw.textbbox((0, 0), title, font=title_font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) // 2
            draw.text((x, 40), title, fill='#1F2937', font=title_font)
            
            # Draw wrapped prompt text
            wrapped_prompt = textwrap.fill(prompt, width=60)
            y_position = 120
            for line in wrapped_prompt.split('\n'):
                bbox = draw.textbbox((0, 0), line, font=font)
                text_width = bbox[2] - bbox[0]
                x = (width - text_width) // 2
                draw.text((x, y_position), line, fill='#4B5563', font=font)
                y_position += 30
            
            # Draw size info
            size_text = f"Size: {size}"
            bbox = draw.textbbox((0, 0), size_text, font=font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) // 2
            draw.text((x, height - 60), size_text, fill='#6B7280', font=font)
            
            # Save image
            img.save(output_path)
            print(f"✓ Placeholder created: {output_path}")
            return True
            
        except ImportError:
            print("✗ PIL package not installed. Install with: pip install Pillow")
            return False
        except Exception as e:
            print(f"✗ Placeholder generation failed: {e}")
            return False
    
    def parse_size(self, size_string):
        """Parse size string like '1280x769px' to width and height."""
        size_string = size_string.replace('px', '')
        width, height = map(int, size_string.split('x'))
        return width, height
    
    def generate_assets(self, platform=None, image_id=None, method="placeholder"):
        """
        Generate assets based on parameters.
        
        Args:
            platform: Specific platform to generate (None for all)
            image_id: Specific image ID to generate (None for all)
            method: Generation method ('dalle', 'stable-diffusion', 'midjourney', 'pollinations', 'placeholder')
        """
        total_generated = 0
        total_failed = 0
        
        platforms_to_process = []
        if platform:
            if platform in self.prompts_data["platforms"]:
                platforms_to_process = [platform]
            else:
                print(f"Error: Platform '{platform}' not found.")
                print(f"Available platforms: {list(self.prompts_data['platforms'].keys())}")
                return
        else:
            platforms_to_process = self.prompts_data["platforms"].keys()
        
        for platform_key in platforms_to_process:
            platform_data = self.prompts_data["platforms"][platform_key]
            print(f"\n{'='*60}")
            print(f"Processing Platform: {platform_data['name']}")
            print(f"{'='*60}")
            
            images_to_process = []
            if image_id:
                images_to_process = [img for img in platform_data["images"] if img["id"] == image_id]
                if not images_to_process:
                    print(f"Error: Image ID {image_id} not found in {platform_key}")
                    continue
            else:
                images_to_process = platform_data["images"]
            
            for image_data in images_to_process:
                print(f"\nGenerating: {image_data['title']}")
                print(f"File: {image_data['filename']}")
                print(f"Size: {image_data['size']}")
                
                # Create output path
                folder_path = Path(self.output_dir) / platform_key / image_data["folder"]
                folder_path.mkdir(parents=True, exist_ok=True)
                output_path = folder_path / image_data["filename"]
                
                # Check if file already exists and skip
                if output_path.exists():
                    print(f"⚠ File already exists: {output_path}")
                    print("  Skipping...")
                    continue
                
                # Generate based on method
                prompt = image_data["prompt"]
                width, height = self.parse_size(image_data["size"])
                
                success = False
                if method == "dalle":
                    # DALL-E specific size handling
                    dalle_size = "1024x1024"  # DALL-E 3 supports 1024x1024
                    success = self.generate_with_dalle(prompt, str(output_path), dalle_size)
                elif method == "stable-diffusion":
                    success = self.generate_with_stable_diffusion(prompt, str(output_path), width, height)
                elif method == "midjourney":
                    success = self.generate_with_midjourney(prompt, str(output_path))
                elif method == "pollinations":
                    success = self.generate_with_pollinations(prompt, str(output_path), width, height)
                else:  # placeholder
                    success = self.generate_placeholder(prompt, str(output_path), image_data["size"])
                
                if success:
                    total_generated += 1
                else:
                    total_failed += 1
        
        print(f"\n{'='*60}")
        print(f"Generation Complete")
        print(f"{'='*60}")
        print(f"Total Generated: {total_generated}")
        print(f"Total Failed: {total_failed}")
        print(f"Total Processed: {total_generated + total_failed}")

def main():
    parser = argparse.ArgumentParser(
        description="Generate multi-platform visual assets using AI"
    )
    parser.add_argument(
        "--platform", "-p",
        help="Specific platform to generate (e.g., crackrevenue, telegram, instagram)"
    )
    parser.add_argument(
        "--image-id", "-i",
        type=int,
        help="Specific image ID to generate (1-4)"
    )
    parser.add_argument(
        "--method", "-m",
        choices=["dalle", "stable-diffusion", "midjourney", "pollinations", "placeholder"],
        default="placeholder",
        help="AI generation method (default: placeholder)"
    )
    parser.add_argument(
        "--prompts-file",
        default="prompts-organized.json",
        help="Path to prompts JSON file (default: prompts-organized.json)"
    )
    parser.add_argument(
        "--output-dir",
        default="visual-assets",
        help="Output directory for generated assets (default: visual-assets)"
    )
    
    args = parser.parse_args()
    
    # Change to the script's directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    generator = AssetGenerator(
        prompts_file=args.prompts_file,
        output_dir=args.output_dir
    )
    
    generator.generate_assets(
        platform=args.platform,
        image_id=args.image_id,
        method=args.method
    )

if __name__ == "__main__":
    main()
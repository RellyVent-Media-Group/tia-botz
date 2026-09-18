#!/usr/bin/env python3
"""
Enhanced Multi-Platform Visual Asset Generator
Supports DALL-E, Stable Diffusion, and Midjourney with intelligent fallback
"""

import json
import os
import requests
import base64
import time
from pathlib import Path
import argparse
import sys
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class AIService(Enum):
    DALLE = "dalle"
    STABLE_DIFFUSION = "stable-diffusion"
    MIDJOURNEY = "midjourney"
    PLACEHOLDER = "placeholder"

@dataclass
class ServiceStatus:
    service: AIService
    available: bool
    response_time: float
    error_message: Optional[str] = None

class EnhancedAssetGenerator:
    def __init__(self, prompts_file="prompts-organized.json", config_file="config.json", output_dir="visual-assets"):
        self.prompts_file = prompts_file
        self.config_file = config_file
        self.output_dir = output_dir
        self.prompts_data = self.load_prompts()
        self.config = self.load_config()
        self.service_status = {}
        
    def load_prompts(self) -> dict:
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
    
    def load_config(self) -> dict:
        """Load configuration from JSON file."""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Config file '{self.config_file}' not found. Using defaults.")
            return self.get_default_config()
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON in '{self.config_file}'. Using defaults.")
            return self.get_default_config()
    
    def get_default_config(self) -> dict:
        """Return default configuration."""
        return {
            "ai_services": {
                "dalle": {
                    "enabled": True,
                    "priority": 1,
                    "api_key_env": "OPENAI_API_KEY",
                    "model": "dall-e-3",
                    "quality": "standard",
                    "max_retries": 3,
                    "timeout": 60
                },
                "stable_diffusion": {
                    "enabled": True,
                    "priority": 2,
                    "api_url": "http://127.0.0.1:7860/sdapi/v1/txt2img",
                    "max_retries": 3,
                    "timeout": 120
                },
                "midjourney": {
                    "enabled": True,
                    "priority": 3,
                    "api_url": "https://api.midjourney.com/v2",
                    "max_retries": 3,
                    "timeout": 180
                }
            },
            "generation_settings": {
                "fallback_enabled": True,
                "fallback_order": ["dalle", "stable-diffusion", "midjourney"],
                "auto_retry": True
            },
            "output_settings": {
                "default_format": "jpg",
                "jpeg_quality": 95
            }
        }
    
    def check_service_health(self) -> Dict[AIService, ServiceStatus]:
        """Check health of all AI services."""
        print("Checking AI service health...")
        status = {}
        
        # Check DALL-E
        dalle_status = self.check_dalle_health()
        status[AIService.DALLE] = dalle_status
        
        # Check Stable Diffusion
        sd_status = self.check_stable_diffusion_health()
        status[AIService.STABLE_DIFFUSION] = sd_status
        
        # Check Midjourney
        mj_status = self.check_midjourney_health()
        status[AIService.MIDJOURNEY] = mj_status
        
        self.service_status = status
        return status
    
    def check_dalle_health(self) -> ServiceStatus:
        """Check DALL-E service health."""
        config = self.config["ai_services"]["dalle"]
        if not config.get("enabled", True):
            return ServiceStatus(AIService.DALLE, False, 0, "Service disabled in config")
        
        api_key = os.environ.get(config["api_key_env"])
        if not api_key:
            return ServiceStatus(AIService.DALLE, False, 0, f"API key not found in {config['api_key_env']}")
        
        try:
            from openai import OpenAI
            start_time = time.time()
            client = OpenAI()
            
            # Simple test call
            response = client.models.list()
            response_time = time.time() - start_time
            
            return ServiceStatus(AIService.DALLE, True, response_time)
        except ImportError:
            return ServiceStatus(AIService.DALLE, False, 0, "OpenAI package not installed")
        except Exception as e:
            return ServiceStatus(AIService.DALLE, False, 0, str(e))
    
    def check_stable_diffusion_health(self) -> ServiceStatus:
        """Check Stable Diffusion service health."""
        config = self.config["ai_services"]["stable_diffusion"]
        if not config.get("enabled", True):
            return ServiceStatus(AIService.STABLE_DIFFUSION, False, 0, "Service disabled in config")
        
        try:
            start_time = time.time()
            response = requests.get(config["api_url"].replace("/txt2img", "/sdapi/v1/sd-models"), timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return ServiceStatus(AIService.STABLE_DIFFUSION, True, response_time)
            else:
                return ServiceStatus(AIService.STABLE_DIFFUSION, False, response_time, f"HTTP {response.status_code}")
        except requests.exceptions.RequestException as e:
            return ServiceStatus(AIService.STABLE_DIFFUSION, False, 0, str(e))
    
    def check_midjourney_health(self) -> ServiceStatus:
        """Check Midjourney service health."""
        config = self.config["ai_services"]["midjourney"]
        if not config.get("enabled", True):
            return ServiceStatus(AIService.MIDJOURNEY, False, 0, "Service disabled in config")
        
        # Midjourney health check is complex - basic API check
        try:
            start_time = time.time()
            response = requests.get(config["api_url"], timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 401, 403]:  # API is responding
                return ServiceStatus(AIService.MIDJOURNEY, True, response_time)
            else:
                return ServiceStatus(AIService.MIDJOURNEY, False, response_time, f"HTTP {response.status_code}")
        except requests.exceptions.RequestException as e:
            return ServiceStatus(AIService.MIDJOURNEY, False, 0, str(e))
    
    def print_health_status(self):
        """Print health status of all services."""
        print("\n" + "="*60)
        print("AI Service Health Status")
        print("="*60)
        
        for service, status in self.service_status.items():
            status_symbol = "✓" if status.available else "✗"
            service_name = service.value.replace("-", " ").title()
            
            print(f"{status_symbol} {service_name}: ", end="")
            if status.available:
                print(f"Available ({status.response_time:.2f}s)")
            else:
                print(f"Unavailable - {status.error_message}")
        
        print("="*60)
    
    def get_available_services(self) -> List[AIService]:
        """Get list of available AI services."""
        return [service for service, status in self.service_status.items() if status.available]
    
    def generate_with_dalle(self, prompt: str, output_path: str, size: str = "1024x1024") -> bool:
        """Generate image using DALL-E API."""
        config = self.config["ai_services"]["dalle"]
        max_retries = config.get("max_retries", 3)
        timeout = config.get("timeout", 60)
        
        for attempt in range(max_retries):
            try:
                from openai import OpenAI
                client = OpenAI()
                
                # Adjust size for DALL-E 3 compatibility
                dalle_size = self.get_dalle_compatible_size(size)
                
                response = client.images.generate(
                    model=config["model"],
                    prompt=prompt,
                    size=dalle_size,
                    quality=config["quality"],
                    n=1,
                    timeout=timeout
                )
                
                image_url = response.data[0].url
                
                # Download the image
                img_response = requests.get(image_url, timeout=timeout)
                if img_response.status_code == 200:
                    with open(output_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"✓ DALL-E generated: {output_path}")
                    return True
                else:
                    print(f"✗ DALL-E download failed: HTTP {img_response.status_code}")
                    
            except Exception as e:
                print(f"✗ DALL-E attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
        
        return False
    
    def get_dalle_compatible_size(self, requested_size: str) -> str:
        """Convert requested size to DALL-E compatible size."""
        width, height = map(int, requested_size.replace('px', '').split('x'))
        
        # DALL-E 3 supports: 1024x1024, 1024x1792, 1792x1024
        if width == height:
            return "1024x1024"
        elif height > width:
            return "1024x1792"
        else:
            return "1792x1024"
    
    def generate_with_stable_diffusion(self, prompt: str, output_path: str, width: int = 1024, height: int = 1024) -> bool:
        """Generate image using Stable Diffusion."""
        config = self.config["ai_services"]["stable_diffusion"]
        max_retries = config.get("max_retries", 3)
        timeout = config.get("timeout", 120)
        
        for attempt in range(max_retries):
            try:
                payload = {
                    "prompt": prompt,
                    "width": width,
                    "height": height,
                    "steps": config.get("default_steps", 20),
                    "cfg_scale": config.get("default_cfg_scale", 7),
                    "sampler_name": config.get("default_sampler", "Euler a")
                }
                
                response = requests.post(config["api_url"], json=payload, timeout=timeout)
                
                if response.status_code == 200:
                    result = response.json()
                    image_data = base64.b64decode(result["images"][0])
                    
                    with open(output_path, 'wb') as f:
                        f.write(image_data)
                    print(f"✓ Stable Diffusion generated: {output_path}")
                    return True
                else:
                    print(f"✗ Stable Diffusion API error: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"✗ Stable Diffusion attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
        
        return False
    
    def generate_with_midjourney(self, prompt: str, output_path: str) -> bool:
        """Generate image using Midjourney API."""
        config = self.config["ai_services"]["midjourney"]
        max_retries = config.get("max_retries", 3)
        timeout = config.get("timeout", 180)
        
        for attempt in range(max_retries):
            try:
                # Midjourney API implementation
                # This is a placeholder - actual implementation depends on specific API access
                payload = {
                    "prompt": prompt,
                    "bot_token": config.get("discord_bot_token", ""),
                    "channel_id": config.get("discord_channel_id", "")
                }
                
                response = requests.post(config["api_url"], json=payload, timeout=timeout)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Download the image (implementation varies by API)
                    if "image_url" in result:
                        img_response = requests.get(result["image_url"], timeout=timeout)
                        if img_response.status_code == 200:
                            with open(output_path, 'wb') as f:
                                f.write(img_response.content)
                            print(f"✓ Midjourney generated: {output_path}")
                            return True
                
                print(f"✗ Midjourney API error: HTTP {response.status_code}")
                
            except Exception as e:
                print(f"✗ Midjourney attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)  # Midjourney needs longer delays
        
        print("⚠ Midjourney generation requires proper API setup")
        print("  Consider using Discord bot integration or manual generation")
        return False
    
    def generate_with_fallback(self, prompt: str, output_path: str, size: str, preferred_service: Optional[AIService] = None) -> Tuple[bool, AIService]:
        """Generate image with intelligent fallback."""
        available_services = self.get_available_services()
        
        if not available_services:
            print("✗ No AI services available")
            return False, AIService.PLACEHOLDER
        
        # Determine service order
        fallback_order = self.config["generation_settings"]["fallback_order"]
        service_order = [AIService(s) for s in fallback_order if AIService(s) in available_services]
        
        # If preferred service is specified and available, try it first
        if preferred_service and preferred_service in available_services:
            service_order = [s for s in service_order if s != preferred_service]
            service_order.insert(0, preferred_service)
        
        for service in service_order:
            print(f"Attempting generation with {service.value}...")
            
            width, height = map(int, size.replace('px', '').split('x'))
            success = False
            
            if service == AIService.DALLE:
                success = self.generate_with_dalle(prompt, output_path, size)
            elif service == AIService.STABLE_DIFFUSION:
                success = self.generate_with_stable_diffusion(prompt, output_path, width, height)
            elif service == AIService.MIDJOURNEY:
                success = self.generate_with_midjourney(prompt, output_path)
            
            if success:
                return True, service
            
            if not self.config["generation_settings"]["fallback_enabled"]:
                break
        
        return False, AIService.PLACEHOLDER
    
    def generate_placeholder(self, prompt: str, output_path: str, size: str) -> bool:
        """Generate placeholder image."""
        try:
            from PIL import Image, ImageDraw, ImageFont
            import textwrap
            
            width, height = map(int, size.replace('px', '').split('x'))
            
            # Create image with gradient background
            img = Image.new('RGB', (width, height), color='#E5E7EB')
            draw = ImageDraw.Draw(img)
            
            # Try to use system fonts
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
                title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            except:
                font = ImageFont.load_default()
                title_font = ImageFont.load_default()
            
            # Draw title
            title = "AI GENERATED ASSET - PLACEHOLDER"
            bbox = draw.textbbox((0, 0), title, font=title_font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) // 2
            draw.text((x, 40), title, fill='#1F2937', font=title_font)
            
            # Draw wrapped prompt
            wrapped_prompt = textwrap.fill(prompt, width=70)
            y_position = 120
            for line in wrapped_prompt.split('\n'):
                bbox = draw.textbbox((0, 0), line, font=font)
                text_width = bbox[2] - bbox[0]
                x = (width - text_width) // 2
                draw.text((x, y_position), line, fill='#4B5563', font=font)
                y_position += 30
            
            # Draw size info
            size_text = f"Size: {size} | Configure AI service for real generation"
            bbox = draw.textbbox((0, 0), size_text, font=font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) // 2
            draw.text((x, height - 60), size_text, fill='#6B7280', font=font)
            
            img.save(output_path, quality=self.config["output_settings"]["jpeg_quality"])
            print(f"✓ Placeholder created: {output_path}")
            return True
            
        except ImportError:
            print("✗ PIL package not installed. Install with: pip install Pillow")
            return False
        except Exception as e:
            print(f"✗ Placeholder generation failed: {e}")
            return False
    
    def parse_size(self, size_string: str) -> Tuple[int, int]:
        """Parse size string like '1280x769px' to width and height."""
        size_string = size_string.replace('px', '')
        width, height = map(int, size_string.split('x'))
        return width, height
    
    def get_preferred_service_for_platform(self, platform: str) -> Optional[AIService]:
        """Get preferred AI service for a specific platform."""
        platform_defaults = self.config.get("platform_defaults", {})
        if platform in platform_defaults:
            preferred = platform_defaults[platform].get("preferred_service")
            if preferred:
                return AIService(preferred)
        return None
    
    def generate_assets(self, platform: Optional[str] = None, image_id: Optional[int] = None, 
                       method: Optional[str] = None, check_health: bool = True):
        """Generate assets with multi-AI support."""
        
        if check_health:
            self.check_service_health()
            self.print_health_status()
        
        total_generated = 0
        total_failed = 0
        service_usage = {}
        
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
                
                # Check if file already exists
                if output_path.exists():
                    print(f"⚠ File already exists: {output_path}")
                    response = input("Overwrite? (y/n): ").lower()
                    if response != 'y':
                        print("  Skipping...")
                        continue
                
                # Determine generation method
                prompt = image_data["prompt"]
                size = image_data["size"]
                
                success = False
                used_service = AIService.PLACEHOLDER
                
                if method:
                    # Specific method requested
                    if method == "dalle":
                        success = self.generate_with_dalle(prompt, str(output_path), size)
                        used_service = AIService.DALLE
                    elif method == "stable-diffusion":
                        width, height = self.parse_size(size)
                        success = self.generate_with_stable_diffusion(prompt, str(output_path), width, height)
                        used_service = AIService.STABLE_DIFFUSION
                    elif method == "midjourney":
                        success = self.generate_with_midjourney(prompt, str(output_path))
                        used_service = AIService.MIDJOURNEY
                    else:  # placeholder
                        success = self.generate_placeholder(prompt, str(output_path), size)
                else:
                    # Use intelligent fallback
                    preferred_service = self.get_preferred_service_for_platform(platform_key)
                    success, used_service = self.generate_with_fallback(prompt, str(output_path), size, preferred_service)
                    
                    if not success:
                        print("Falling back to placeholder...")
                        success = self.generate_placeholder(prompt, str(output_path), size)
                
                # Track service usage
                if used_service not in service_usage:
                    service_usage[used_service] = 0
                service_usage[used_service] += 1
                
                if success:
                    total_generated += 1
                else:
                    total_failed += 1
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"Generation Complete")
        print(f"{'='*60}")
        print(f"Total Generated: {total_generated}")
        print(f"Total Failed: {total_failed}")
        print(f"Total Processed: {total_generated + total_failed}")
        
        if service_usage:
            print(f"\nService Usage:")
            for service, count in service_usage.items():
                print(f"  {service.value}: {count} images")

def main():
    parser = argparse.ArgumentParser(
        description="Enhanced multi-platform visual asset generator with AI service integration"
    )
    parser.add_argument(
        "--platform", "-p",
        help="Specific platform to generate"
    )
    parser.add_argument(
        "--image-id", "-i",
        type=int,
        help="Specific image ID to generate (1-4)"
    )
    parser.add_argument(
        "--method", "-m",
        choices=["dalle", "stable-diffusion", "midjourney", "placeholder", "auto"],
        default="auto",
        help="AI generation method (default: auto with intelligent fallback)"
    )
    parser.add_argument(
        "--no-health-check",
        action="store_true",
        help="Skip AI service health check"
    )
    parser.add_argument(
        "--config-file",
        default="config.json",
        help="Path to config file (default: config.json)"
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
    
    generator = EnhancedAssetGenerator(
        prompts_file=args.prompts_file,
        config_file=args.config_file,
        output_dir=args.output_dir
    )
    
    method = None if args.method == "auto" else args.method
    generator.generate_assets(
        platform=args.platform,
        image_id=args.image_id,
        method=method,
        check_health=not args.no_health_check
    )

if __name__ == "__main__":
    main()
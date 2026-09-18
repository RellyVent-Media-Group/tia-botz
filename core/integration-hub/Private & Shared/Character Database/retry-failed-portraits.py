#!/usr/bin/env python3
"""
Retry failed portrait generations for Brad Turdet and Dikinya Myles.
"""

import requests
from pathlib import Path
from urllib.parse import quote
import time

FAILED_PORTRAITS = {
    "brad-turdet-portrait": {
        "prompt": "Dynamic portrait of Brad Turdet, strategic energy visible, crimson and gold background, master strategist aesthetic. Confident strategist commanding complex operations, strategic brilliance visible in expression, powerful presence with approachable confidence.",
        "width": 1024,
        "height": 1024
    },
    "brad-turdet-avatar": {
        "prompt": "Warm portrait of Brad Turdet, confident smile, strategic command center background, approachable yet powerful. Confident strategist with approachable presence, clean composition suitable for avatar.",
        "width": 512,
        "height": 512
    },
    "dikinya-myles-portrait": {
        "prompt": "Professional portrait of Dikinya Myles, structured industrial background, confident steady gaze, operations management aesthetic. Reliable operations specialist, industrial precision visible, steady trustworthy presence, foundational strength.",
        "width": 1024,
        "height": 1024
    }
}

def generate_with_pollinations(prompt, width, height, output_path, max_retries=3):
    """Generate an image using Pollinations AI with retry logic."""
    encoded_prompt = quote(prompt)
    url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}"
        f"?width={width}&height={height}&nologo=true"
    )
    
    for attempt in range(max_retries):
        try:
            print(f"    Attempt {attempt + 1}/{max_retries}...")
            response = requests.get(url, timeout=90)
            
            if response.status_code == 200:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"    ✓ Generated: {output_path.name}")
                return True
            elif response.status_code == 429:
                print(f"    ✗ Rate limited (429), waiting...")
                time.sleep(5)
            else:
                print(f"    ✗ Error: HTTP {response.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(3)
                
        except requests.exceptions.Timeout:
            print(f"    ✗ Timeout, retrying...")
            time.sleep(3)
        except Exception as e:
            print(f"    ✗ Error: {e}")
            return False
    
    print(f"    ✗ Failed after {max_retries} attempts")
    return False

def main():
    output_dir = Path("images")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("Retrying failed portrait generations...")
    print("=" * 60)
    
    for image_id, config in FAILED_PORTRAITS.items():
        # Convert to proper filename format
        if "brad-turdet" in image_id:
            if "portrait" in image_id:
                output_path = output_dir / "Brad Turdet - portrait.png"
            else:
                output_path = output_dir / "Brad Turdet - avatar.png"
        elif "dikinya-myles" in image_id:
            output_path = output_dir / "Dikinya Myles - portrait.png"
        
        print(f"\nGenerating {image_id}...")
        
        success = generate_with_pollinations(
            config["prompt"],
            config["width"],
            config["height"],
            output_path
        )
        
        if not success:
            print(f"  ✗ Failed to generate {image_id}")
        
        # Brief pause between requests
        time.sleep(2)
    
    print("\n" + "=" * 60)
    print("Retry complete!")

if __name__ == "__main__":
    main()
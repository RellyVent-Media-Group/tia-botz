#!/usr/bin/env python3
"""
Generate character images for the remaining Legendary characters using Pollinations AI.
"""

import requests
from pathlib import Path
from urllib.parse import quote
import time

# Remaining legendary character prompts
REMAINING_LEGENDARY = {
    "brad-turdet-portrait": {
        "prompt": "Dynamic portrait of Brad Turdet, strategic energy visible, crimson and gold background, master strategist aesthetic. Confident strategist commanding complex operations, strategic brilliance visible in expression, powerful presence with approachable confidence.",
        "width": 1024,
        "height": 1024
    },
    "brad-turdet-poster": {
        "prompt": "Monumental hero shot of Brad Turdet as master strategist, executing complex strategy, commanding presence with strategic brilliance. Cinematic composition, strategic energy visible, crimson and gold aesthetic, powerful commanding presence, strategic mastery.",
        "width": 1024,
        "height": 1280
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
    },
    "dikinya-myles-poster": {
        "prompt": "Commanding hero shot of Dikinya Myles overseeing complex operations network, industrial precision, foundational strength. Cinematic composition, structured industrial background, operations mastery visible, commanding reliable presence.",
        "width": 1024,
        "height": 1280
    },
    "dikinya-myles-avatar": {
        "prompt": "Approachable portrait of Dikinya Myles, warm smile, logistics hub background, reliable and trustworthy presence. Steady operations specialist with approachable warmth, clean composition suitable for avatar.",
        "width": 512,
        "height": 512
    },
    "mr-turner-portrait": {
        "prompt": "Powerful portrait of Mr. Turner, raw strength visible, primal energy background, execution and power aesthetic. Powerful execution specialist, raw strength visible, primal commanding presence, direct approach to challenges.",
        "width": 1024,
        "height": 1024
    },
    "mr-turner-poster": {
        "prompt": "Monumental hero shot of Mr. Turner as primal force, executing with raw power, commanding physical and strategic presence. Cinematic composition, primal energy background, raw power mastery, commanding presence.",
        "width": 1024,
        "height": 1280
    },
    "mr-turner-avatar": {
        "prompt": "Warm portrait of Mr. Turner, confident smile, operational strength background, powerful yet approachable. Powerful execution specialist with approachable warmth, clean composition suitable for avatar.",
        "width": 512,
        "height": 512
    },
    "ronda-villasea-portrait": {
        "prompt": "Mystical portrait of Ronda Villasea, mirror reflections showing multiple strategic possibilities, deep purple background, analytical yet intuitive. Strategic specialist with reflective analytical presence, intuitive insights visible, commanding strategic presence.",
        "width": 1024,
        "height": 1024
    },
    "ronda-villasea-poster": {
        "prompt": "Powerful hero shot of Ronda Villasea as strategic center, mirrors reflecting future possibilities, commanding strategic presence. Cinematic composition, mystical strategic aesthetic, mirrors reflecting possibilities, commanding strategic mastery.",
        "width": 1024,
        "height": 1280
    },
    "ronda-villasea-avatar": {
        "prompt": "Warm portrait of Ronda Villasea, gentle reflective smile, strategy room background, wise and approachable strategist. Strategic specialist with approachable wisdom, clean composition suitable for avatar.",
        "width": 512,
        "height": 512
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
                return False
                
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
    
    print("Generating remaining Legendary character images using Pollinations AI...")
    print("=" * 60)
    
    # Group by character for better progress tracking
    characters = {
        "Brad Turdet": ["brad-turdet-portrait", "brad-turdet-poster", "brad-turdet-avatar"],
        "Dikinya Myles": ["dikinya-myles-portrait", "dikinya-myles-poster", "dikinya-myles-avatar"],
        "Mr. Turner": ["mr-turner-portrait", "mr-turner-poster", "mr-turner-avatar"],
        "Ronda Villasea": ["ronda-villasea-portrait", "ronda-villasea-poster", "ronda-villasea-avatar"]
    }
    
    for char_name, image_ids in characters.items():
        print(f"\nGenerating assets for: {char_name}")
        print("-" * 60)
        
        for image_id in image_ids:
            output_path = output_dir / f"{image_id}.png"
            
            if output_path.exists():
                print(f"  ⚠ File already exists: {output_path.name}")
                print(f"  Skipping...")
                continue
            
            config = REMAINING_LEGENDARY[image_id]
            print(f"  Generating {image_id}...")
            
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
    print("Remaining Legendary character image generation complete!")

if __name__ == "__main__":
    main()
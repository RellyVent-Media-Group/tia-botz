#!/usr/bin/env python3
"""
Generate Mary Magnumbytes and Mac Nazarene character images using Pollinations AI.
"""

import requests
from pathlib import Path
from urllib.parse import quote
import time

# Character prompts for Pollinations AI
CHARACTER_IMAGES = {
    "mac-portrait": {
        "prompt": "A cinematic character portrait of Mac Nazarene, a calm and magnetic figure with thoughtful eyes, grounded posture, and a quiet sense of purpose. Visual motifs: warm natural light, textured everyday setting, subtle signs of travel or service, realistic detail, humane atmosphere, editorial portrait photography, no text, no logo. Weathered leather jacket, worn boots, calm eyes that have seen everything, carrying a small notebook and pen. Contemporary urban setting with warm natural light.",
        "width": 1024,
        "height": 1024
    },
    "mary-portrait": {
        "prompt": "A cinematic character portrait of Mary Magnumbytes, a confident digital-age problem solver with a sharp expressive face, intelligent eyes, and a polished but practical style. Visual motifs: subtle circuit-like reflections, modern work light, high-detail textures, grounded realism, bold personality, editorial portrait photography, natural skin texture, expressive posture, clean composition, no text, no logo. Sharp bob haircut, practical layered clothing with hidden tech accessories, holding a rugged tablet. Contemporary urban tech hub setting with blue screen light glow.",
        "width": 1024,
        "height": 1024
    },
    "mac-poster": {
        "prompt": "Poster art of Mac Nazarene as a steady, reflective protagonist standing at the edge of a crossroads between shadow and morning light. Human, grounded, quietly dramatic, sophisticated cinematic composition, rich natural textures, strong silhouette, no words, no watermark.",
        "width": 1024,
        "height": 1280
    },
    "mary-poster": {
        "prompt": "Poster art of Mary Magnumbytes as a clever cyber-era heroine, standing in a command-center glow with abstract data streams and warm human details around her. Sophisticated color palette, strong silhouette, dramatic but not dystopian, modern cinematic poster style, crisp details, balanced negative space, no words, no watermark.",
        "width": 1024,
        "height": 1280
    },
    "mac-avatar": {
        "prompt": "Square avatar portrait of Mac Nazarene, calm confident expression, warm light, clean background, recognizable silhouette, polished digital illustration, readable at small size, no text. Weathered but caring appearance, thoughtful eyes.",
        "width": 512,
        "height": 512
    },
    "mary-avatar": {
        "prompt": "Square avatar portrait of Mary Magnumbytes, instantly recognizable, confident expression, modern tech-inspired styling, clean background, readable at small size, high contrast, polished digital illustration, no text. Sharp bob haircut, intelligent eyes, practical but stylish.",
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
            print(f"  Attempt {attempt + 1}/{max_retries}...")
            response = requests.get(url, timeout=90)
            
            if response.status_code == 200:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"  ✓ Generated: {output_path.name}")
                return True
            elif response.status_code == 429:
                print(f"  ✗ Rate limited (429), waiting...")
                time.sleep(5)
            else:
                print(f"  ✗ Error: HTTP {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            print(f"  ✗ Timeout, retrying...")
            time.sleep(3)
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return False
    
    print(f"  ✗ Failed after {max_retries} attempts")
    return False

def main():
    output_dir = Path("visual-assets/characters")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("Generating Mary + Mac character images using Pollinations AI...")
    print("=" * 60)
    
    for image_id, config in CHARACTER_IMAGES.items():
        print(f"\nGenerating {image_id}...")
        output_path = output_dir / f"{image_id}.png"
        
        if output_path.exists():
            print(f"  ⚠ File already exists: {output_path.name}")
            print(f"  Skipping...")
            continue
        
        success = generate_with_pollinations(
            config["prompt"],
            config["width"],
            config["height"],
            output_path
        )
        
        if not success:
            print(f"  ✗ Failed to generate {image_id}")
        
        # Brief pause between requests to avoid rate limiting
        time.sleep(2)
    
    print("\n" + "=" * 60)
    print("Character image generation complete!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Generate character images for Legendary characters using Pollinations AI.
"""

import requests
from pathlib import Path
from urllib.parse import quote
import time

# Legendary character prompts (excluding Mary and Mac which are already done)
LEGENDARY_CHARACTERS = {
    "mrs-cox-turner-portrait": {
        "prompt": "Regal portrait of Mrs. Cox-Turner, matriarchal presence, elegant estate background, governance and authority aesthetic. Mature elegant woman with commanding yet nurturing presence, sophisticated estate setting, authoritative wisdom visible in expression, warm light filtering through grand windows, timeless beauty with depth of experience.",
        "width": 1024,
        "height": 1024
    },
    "mrs-cox-turner-poster": {
        "prompt": "Commanding hero shot of Mrs. Cox-Turner as matriarch of the system, overseeing governance, authoritative yet nurturing presence. Monumental composition, elegant estate backdrop, matriarchal wisdom visible, sophisticated governance aesthetic, warm golden light, timeless grandeur.",
        "width": 1024,
        "height": 1280
    },
    "mrs-cox-turner-avatar": {
        "prompt": "Warm portrait of Mrs. Cox-Turner, maternal smile, family estate background, wise and nurturing governance. Approachable matriarch, gentle wisdom, elegant yet warm presence, clean background suitable for avatar use.",
        "width": 512,
        "height": 512
    },
    "latti-pleddespo-portrait": {
        "prompt": "Dynamic portrait of Latti Pleddespo, golden financial flows, luxury capital background, hyper-capitalist aesthetic. Confident sophisticated woman commanding wealth, financial empire visible in background, luxury capital aesthetic, powerful presence with approachable wealth mastery.",
        "width": 1024,
        "height": 1024
    },
    "latti-pleddespo-poster": {
        "prompt": "Monumental hero shot of Latti Pleddespo as hyper-capitalist, financial empire backdrop, commanding wealth and capital. Cinematic composition, golden financial flows, luxury capital aesthetic, powerful commanding presence, sophisticated wealth mastery.",
        "width": 1024,
        "height": 1280
    },
    "latti-pleddespo-avatar": {
        "prompt": "Warm portrait of Latti Pleddespo, confident wealth presence, financial empire background, approachable wealth mastery. Sophisticated yet approachable, clean composition suitable for avatar, luxury aesthetic with warmth.",
        "width": 512,
        "height": 512
    },
    "cracoria-masters-portrait": {
        "prompt": "Mystical portrait of Cracoria Masters, time flows visible around them, clockwork and temporal background, temporal architect aesthetic. Androgynous figure with temporal mastery, clockwork mechanisms visible, time manipulation effects, mystical ethereal presence, sophisticated temporal aesthetic.",
        "width": 1024,
        "height": 1024
    },
    "cracoria-masters-poster": {
        "prompt": "Monumental hero shot of Cracoria Masters as master of time, temporal vortex backdrop, commanding temporal control. Cinematic composition, time flows visible, clockwork temporal aesthetic, commanding presence, mystical temporal mastery.",
        "width": 1024,
        "height": 1280
    },
    "cracoria-masters-avatar": {
        "prompt": "Warm portrait of Cracoria Masters, gentle time manipulation glow, timeless sanctuary background, wise temporal presence. Approachable temporal wisdom, mystical yet warm, clean composition suitable for avatar.",
        "width": 512,
        "height": 512
    },
    "dezi-asete-portrait": {
        "prompt": "Ethereal portrait of Dezi Asete, ghostly digital form, cyberspace background, ephemeral phantom aesthetic. Ethereal digital phantom, ghostly presence navigating cyberspace, digital invisibility effects, mysterious yet approachable, sophisticated digital aesthetic.",
        "width": 1024,
        "height": 1024
    },
    "dezi-asete-poster": {
        "prompt": "Monumental hero shot of Dezi Asete as digital phantom, cyberspace mastery backdrop, commanding digital invisibility. Cinematic composition, ghostly digital form, cyberspace aesthetic, commanding presence, digital mastery visible.",
        "width": 1024,
        "height": 1280
    },
    "dezi-asete-avatar": {
        "prompt": "Warm portrait of Dezi Asete, gentle ghostly smile, digital sanctuary background, mysterious yet approachable. Ethereal digital presence, mysterious yet warm, clean composition suitable for avatar.",
        "width": 512,
        "height": 512
    },
    "zupa-novaclutch-portrait": {
        "prompt": "Industrial portrait of Zupa Novaclutch, machine spirit visible, industrial complex background, machine spirit aesthetic. Figure with deep connection to industrial systems, mechanical optimization visible, industrial complex backdrop, machine spirit aesthetic, commanding mechanical presence.",
        "width": 1024,
        "height": 1024
    },
    "zupa-novaclutch-poster": {
        "prompt": "Monumental hero shot of Zupa Novaclutch as machine spirit, industrial mastery backdrop, commanding mechanical optimization. Cinematic composition, industrial complex, machine spirit aesthetic, commanding presence, mechanical mastery visible.",
        "width": 1024,
        "height": 1280
    },
    "zupa-novaclutch-avatar": {
        "prompt": "Warm portrait of Zupa Novaclutch, mechanical warmth, industrial sanctuary background, approachable machine wisdom. Industrial aesthetic with warmth, approachable mechanical presence, clean composition suitable for avatar.",
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
    
    print("Generating Legendary character images using Pollinations AI...")
    print("=" * 60)
    
    # Group by character for better progress tracking
    characters = {
        "Mrs. Cox-Turner": ["mrs-cox-turner-portrait", "mrs-cox-turner-poster", "mrs-cox-turner-avatar"],
        "Latti Pleddespo": ["latti-pleddespo-portrait", "latti-pleddespo-poster", "latti-pleddespo-avatar"],
        "Cracoria Masters": ["cracoria-masters-portrait", "cracoria-masters-poster", "cracoria-masters-avatar"],
        "Dezi Asete": ["dezi-asete-portrait", "dezi-asete-poster", "dezi-asete-avatar"],
        "Zupa Novaclutch": ["zupa-novaclutch-portrait", "zupa-novaclutch-poster", "zupa-novaclutch-avatar"]
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
            
            config = LEGENDARY_CHARACTERS[image_id]
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
    print("Legendary character image generation complete!")

if __name__ == "__main__":
    main()

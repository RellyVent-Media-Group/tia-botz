#!/usr/bin/env python3
"""
Generate character images for the Character Database using Pollinations AI.
Reads character data from the CSV and generates portrait, poster, and avatar images.
"""

import csv
import requests
from pathlib import Path
from urllib.parse import quote
import time
import sys

# Configuration
CSV_FILE = "Character Database 3d313c140e1c819292fee0b0a6dbaa1b.csv"
IMAGES_DIR = "images"
MAX_RETRIES = 3

def load_character_data(csv_path):
    """Load character data from CSV file."""
    characters = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['Name'] and row['Status'] == 'Active':
                characters.append(row)
    return characters

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

def generate_character_assets(character):
    """Generate portrait, poster, and avatar for a character."""
    name = character['Name']
    print(f"\nGenerating assets for: {name}")
    print("=" * 60)
    
    # Portrait using Classic Hook Prompt
    portrait_prompt = character['Classic Hook Prompt (#1)']
    portrait_path = Path(IMAGES_DIR) / f"{name} - portrait.png"
    
    if not portrait_path.exists():
        print("  Portrait:")
        generate_with_pollinations(portrait_prompt, 1024, 1024, portrait_path)
        time.sleep(2)
    else:
        print(f"  ⚠ Portrait already exists, skipping")
    
    # Poster using Hero Branding Prompt
    poster_prompt = character['Hero Branding Prompt (#15)']
    poster_path = Path(IMAGES_DIR) / f"{name} - poster.png"
    
    if not poster_path.exists():
        print("  Poster:")
        generate_with_pollinations(poster_prompt, 1024, 1280, poster_path)
        time.sleep(2)
    else:
        print(f"  ⚠ Poster already exists, skipping")
    
    # Avatar using Trust Warmth Prompt
    avatar_prompt = character['Trust Warmth Prompt (#5)']
    avatar_path = Path(IMAGES_DIR) / f"{name} - avatar.png"
    
    if not avatar_path.exists():
        print("  Avatar:")
        generate_with_pollinations(avatar_prompt, 512, 512, avatar_path)
        time.sleep(2)
    else:
        print(f"  ⚠ Avatar already exists, skipping")

def update_character_md(character):
    """Update character markdown file with asset references."""
    name = character['Name']
    md_file = Path(f"{name} 3d313c140e1c812cb190dcc80e46fb78.md")
    
    if md_file.exists():
        with open(md_file, 'r') as f:
            content = f.read()
        
        # Check if assets section already exists
        if "## Generated Assets" not in content:
            assets_section = f"\n## Generated Assets\n- Portrait: `images/{name} - portrait.png`\n- Poster: `images/{name} - poster.png`\n- Avatar: `images/{name} - avatar.png`\n"
            with open(md_file, 'a') as f:
                f.write(assets_section)
            print(f"  ✓ Updated {md_file.name}")
        else:
            print(f"  ⚠ {md_file.name} already has assets section")

def main():
    # Check if CSV file exists
    csv_path = Path(CSV_FILE)
    if not csv_path.exists():
        print(f"Error: CSV file not found: {CSV_FILE}")
        sys.exit(1)
    
    # Load character data
    print("Loading character data...")
    characters = load_character_data(csv_path)
    print(f"Found {len(characters)} active characters")
    
    # Filter by command line arguments if provided
    if len(sys.argv) > 1:
        target_names = sys.argv[1:]
        characters = [c for c in characters if c['Name'] in target_names]
        print(f"Filtering to: {', '.join(target_names)}")
    
    # Generate assets for each character
    for character in characters:
        generate_character_assets(character)
        update_character_md(character)
    
    print("\n" + "=" * 60)
    print("Character asset generation complete!")

if __name__ == "__main__":
    main()

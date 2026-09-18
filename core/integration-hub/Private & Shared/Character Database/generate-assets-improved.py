#!/usr/bin/env python3
"""
Improved character asset generation for the Character Database.
Reads character data from the CSV and generates portrait, poster, and avatar images.
Updates CSV with asset tracking information after successful generation.
"""

import csv
import requests
from pathlib import Path
from urllib.parse import quote
import time
import sys
from datetime import datetime
import re

# Configuration
CSV_FILE = "../Character Database 3d313c140e1c819292fee0b0a6dbaa1b.csv"
IMAGES_DIR = "images"
MAX_RETRIES = 3
DEFAULT_DELAY = 2

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
    """Generate an image using Pollinations AI with improved retry logic."""
    encoded_prompt = quote(prompt)
    url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}"
        f"?width={width}&height={height}&nologo=true&model=flux"
    )
    
    for attempt in range(max_retries):
        try:
            print(f"    Attempt {attempt + 1}/{max_retries}...")
            response = requests.get(url, timeout=120)
            
            if response.status_code == 200:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"    ✓ Generated: {output_path.name}")
                return True
            elif response.status_code == 429:
                wait_time = 5 + (attempt * 5)  # Exponential backoff
                print(f"    ✗ Rate limited (429), waiting {wait_time}s...")
                time.sleep(wait_time)
            elif response.status_code == 500:
                print(f"    ✗ Server error (500), retrying...")
                time.sleep(3)
            else:
                print(f"    ✗ Error: HTTP {response.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(3)
                
        except requests.exceptions.Timeout:
            print(f"    ✗ Timeout, retrying...")
            time.sleep(3)
        except Exception as e:
            print(f"    ✗ Error: {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
    
    print(f"    ✗ Failed after {max_retries} attempts")
    return False

def update_csv_asset_status(csv_path, character_name, asset_type, success, current_date):
    """Update CSV file with asset generation status."""
    temp_path = csv_path + '.tmp'
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames
    
    updated = False
    for row in rows:
        if row['Name'] == character_name:
            if success:
                if asset_type == 'portrait':
                    row['Portrait Generated'] = 'Yes'
                elif asset_type == 'poster':
                    row['Poster Generated'] = 'Yes'
                elif asset_type == 'avatar':
                    row['Avatar Generated'] = 'Yes'
                row['Asset Last Updated'] = current_date
            updated = True
            break
    
    if updated:
        with open(temp_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        # Replace original file
        Path(temp_path).replace(csv_path)
        print(f"  ✓ Updated CSV for {character_name}")
    
    return updated

def generate_character_assets(character, force_regenerate=False):
    """Generate portrait, poster, and avatar for a character."""
    name = character['Name']
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    print(f"\nGenerating assets for: {name}")
    print("=" * 60)
    
    # Check current asset status
    has_portrait = character.get('Portrait Generated', 'No') == 'Yes'
    has_poster = character.get('Poster Generated', 'No') == 'Yes'
    has_avatar = character.get('Avatar Generated', 'No') == 'Yes'
    
    if not force_regenerate and has_portrait and has_poster and has_avatar:
        print(f"  ⚠ All assets already exist, skipping (use --force to regenerate)")
        return True
    
    # Portrait using Classic Hook Prompt
    portrait_prompt = character['Classic Hook Prompt (#1)']
    portrait_path = Path(IMAGES_DIR) / f"{name} - portrait.png"
    
    if force_regenerate or not has_portrait:
        print("  Portrait:")
        success = generate_with_pollinations(portrait_prompt, 1024, 1024, portrait_path)
        update_csv_asset_status(CSV_FILE, name, 'portrait', success, current_date)
        time.sleep(DEFAULT_DELAY)
    else:
        print(f"  ⚠ Portrait already exists, skipping")
    
    # Poster using Hero Branding Prompt
    poster_prompt = character['Hero Branding Prompt (#15)']
    poster_path = Path(IMAGES_DIR) / f"{name} - poster.png"
    
    if force_regenerate or not has_poster:
        print("  Poster:")
        success = generate_with_pollinations(poster_prompt, 1024, 1280, poster_path)
        update_csv_asset_status(CSV_FILE, name, 'poster', success, current_date)
        time.sleep(DEFAULT_DELAY)
    else:
        print(f"  ⚠ Poster already exists, skipping")
    
    # Avatar using Trust Warmth Prompt
    avatar_prompt = character['Trust Warmth Prompt (#5)']
    avatar_path = Path(IMAGES_DIR) / f"{name} - avatar.png"
    
    if force_regenerate or not has_avatar:
        print("  Avatar:")
        success = generate_with_pollinations(avatar_prompt, 512, 512, avatar_path)
        update_csv_asset_status(CSV_FILE, name, 'avatar', success, current_date)
        time.sleep(DEFAULT_DELAY)
    else:
        print(f"  ⚠ Avatar already exists, skipping")
    
    return True

def update_character_md(character):
    """Update character markdown file with asset references."""
    name = character['Name']
    # Find the matching markdown file
    md_files = list(Path('.').glob(f'{name} *.md'))
    
    if not md_files:
        print(f"  ⚠ No markdown file found for {name}")
        return
    
    md_file = md_files[0]
    
    if md_file.exists():
        with open(md_file, 'r') as f:
            content = f.read()
        
        # Check if assets section already exists
        if "## Generated Assets" not in content:
            has_portrait = character.get('Portrait Generated', 'No') == 'Yes'
            has_poster = character.get('Poster Generated', 'No') == 'Yes'
            has_avatar = character.get('Avatar Generated', 'No') == 'Yes'
            last_updated = character.get('Asset Last Updated', 'Not generated')
            
            assets_section = f"""

## Generated Assets

- **Portrait Generated**: {'Yes' if has_portrait else 'No'}
- **Poster Generated**: {'Yes' if has_poster else 'No'}
- **Avatar Generated**: {'Yes' if has_avatar else 'No'}
- **Asset Last Updated**: {last_updated}
"""
            with open(md_file, 'a') as f:
                f.write(assets_section)
            print(f"  ✓ Updated {md_file.name}")
        else:
            # Update existing assets section
            lines = content.split('\n')
            new_lines = []
            in_assets_section = False
            
            for line in lines:
                if '## Generated Assets' in line:
                    in_assets_section = True
                    new_lines.append(line)
                elif in_assets_section and line.strip().startswith('- **Portrait Generated**:'):
                    has_portrait = character.get('Portrait Generated', 'No') == 'Yes'
                    new_lines.append(f"- **Portrait Generated**: {'Yes' if has_portrait else 'No'}")
                elif in_assets_section and line.strip().startswith('- **Poster Generated**:'):
                    has_poster = character.get('Poster Generated', 'No') == 'Yes'
                    new_lines.append(f"- **Poster Generated**: {'Yes' if has_poster else 'No'}")
                elif in_assets_section and line.strip().startswith('- **Avatar Generated**:'):
                    has_avatar = character.get('Avatar Generated', 'No') == 'Yes'
                    new_lines.append(f"- **Avatar Generated**: {'Yes' if has_avatar else 'No'}")
                elif in_assets_section and line.strip().startswith('- **Asset Last Updated**:'):
                    last_updated = character.get('Asset Last Updated', 'Not generated')
                    new_lines.append(f"- **Asset Last Updated**: {last_updated}")
                else:
                    new_lines.append(line)
            
            with open(md_file, 'w') as f:
                f.write('\n'.join(new_lines))
            print(f"  ✓ Updated {md_file.name}")

def filter_characters_by_criteria(characters, criteria):
    """Filter characters based on various criteria."""
    filtered = characters
    
    if criteria.get('rarity'):
        filtered = [c for c in filtered if c['Rarity'] == criteria['rarity']]
    
    if criteria.get('asset_status'):
        if criteria['asset_status'] == 'none':
            filtered = [c for c in filtered if 
                      c.get('Portrait Generated', 'No') == 'No' and 
                      c.get('Poster Generated', 'No') == 'No' and 
                      c.get('Avatar Generated', 'No') == 'No']
        elif criteria['asset_status'] == 'partial':
            filtered = [c for c in filtered if 
                      (c.get('Portrait Generated', 'No') == 'Yes' or 
                       c.get('Poster Generated', 'No') == 'Yes' or 
                       c.get('Avatar Generated', 'No') == 'Yes') and
                      not (c.get('Portrait Generated', 'No') == 'Yes' and 
                           c.get('Poster Generated', 'No') == 'Yes' and 
                           c.get('Avatar Generated', 'No') == 'Yes')]
        elif criteria['asset_status'] == 'complete':
            filtered = [c for c in filtered if 
                      c.get('Portrait Generated', 'No') == 'Yes' and 
                      c.get('Poster Generated', 'No') == 'Yes' and 
                      c.get('Avatar Generated', 'No') == 'Yes']
    
    return filtered

def main():
    force_regenerate = '--force' in sys.argv
    target_rarity = None
    target_asset_status = None
    
    # Parse command line arguments
    for arg in sys.argv[1:]:
        if arg.startswith('--rarity='):
            target_rarity = arg.split('=')[1]
        elif arg.startswith('--asset-status='):
            target_asset_status = arg.split('=')[1]
    
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
    if target_rarity or target_asset_status:
        criteria = {}
        if target_rarity:
            criteria['rarity'] = target_rarity
        if target_asset_status:
            criteria['asset_status'] = target_asset_status
        
        characters = filter_characters_by_criteria(characters, criteria)
        print(f"Filtering to: {len(characters)} characters")
    
    # Generate assets for each character
    success_count = 0
    for character in characters:
        if generate_character_assets(character, force_regenerate):
            update_character_md(character)
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"Character asset generation complete!")
    print(f"Successfully processed: {success_count}/{len(characters)} characters")

if __name__ == "__main__":
    main()
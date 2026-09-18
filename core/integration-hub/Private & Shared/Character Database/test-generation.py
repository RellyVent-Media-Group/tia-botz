#!/usr/bin/env python3
"""
Test script for generating assets for a few sample characters.
This demonstrates the improved asset generation pipeline.
"""

import subprocess
import sys

def test_generation():
    """Test asset generation for a few sample characters."""
    
    # Test with a few rare characters that need assets
    test_characters = [
        "Dixon Uhbuts",
        "Airiol Uhbuts", 
        "Ovaihge Whitmeiners"
    ]
    
    print("Testing improved asset generation pipeline")
    print("=" * 60)
    print(f"Test characters: {', '.join(test_characters)}")
    print()
    
    # Run the improved generation script
    cmd = [
        sys.executable,
        "generate-assets-improved.py",
        "--asset-status=none"
    ] + test_characters
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        print("\n✓ Test generation completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Generation failed: {e}")
        print("Output:", e.stdout)
        print("Errors:", e.stderr)

if __name__ == "__main__":
    test_generation()
#!/usr/bin/env python3
"""
Cleanup Script - Deletes temporary files, old backups, and aged files.
Run with --dry-run to preview changes without deleting.
"""

import os
import sys
import time
import argparse
from pathlib import Path
from datetime import datetime, timedelta


def get_file_age_days(filepath):
    """Get the age of a file in days."""
    modified_time = os.path.getmtime(filepath)
    age = time.time() - modified_time
    return age / (24 * 60 * 60)


def delete_file(filepath, dry_run=False):
    """Delete a file or directory."""
    if dry_run:
        return f"[DRY RUN] Would delete: {filepath}"
    
    try:
        if os.path.isfile(filepath):
            os.remove(filepath)
            return f"Deleted: {filepath}"
        elif os.path.isdir(filepath):
            import shutil
            shutil.rmtree(filepath)
            return f"Deleted directory: {filepath}"
    except Exception as e:
        return f"Error deleting {filepath}: {e}"


def cleanup_temp_files(paths, dry_run=False):
    """Clean up temporary files, cache, and logs from specified paths."""
    print("\n=== Cleaning Temporary Files ===")
    
    temp_patterns = [
        "*.tmp", "*.temp", "*.cache", "*.log", "*.swp", "*~",
        ".DS_Store", "Thumbs.db", "__pycache__", "*.pyc"
    ]
    
    results = []
    for base_path in paths:
        if not os.path.exists(base_path):
            results.append(f"Path not found: {base_path}")
            continue
        
        for root, dirs, files in os.walk(base_path):
            # Remove common temp directories
            dirs_to_remove = [d for d in dirs if d in ['__pycache__', '.pytest_cache', 'node_modules', '.cache']]
            for d in dirs_to_remove:
                dir_path = os.path.join(root, d)
                result = delete_file(dir_path, dry_run)
                results.append(result)
                if d in dirs:
                    dirs.remove(d)
            
            # Remove temp files
            for file in files:
                for pattern in temp_patterns:
                    if file.endswith(pattern.replace('*', '')) or file == pattern:
                        filepath = os.path.join(root, file)
                        result = delete_file(filepath, dry_run)
                        results.append(result)
                        break
    
    return results


def cleanup_old_backups(backup_dir, pattern="*.bak", days=30, dry_run=False):
    """Remove backup files older than specified days."""
    print(f"\n=== Cleaning Old Backups (older than {days} days) ===")
    
    if not os.path.exists(backup_dir):
        return [f"Backup directory not found: {backup_dir}"]
    
    results = []
    for root, dirs, files in os.walk(backup_dir):
        for file in files:
            if file.endswith('.bak') or file.endswith('.backup') or file.endswith('.old'):
                filepath = os.path.join(root, file)
                age_days = get_file_age_days(filepath)
                
                if age_days > days:
                    result = delete_file(filepath, dry_run)
                    results.append(f"{result} (age: {age_days:.1f} days)")
    
    return results


def cleanup_directory(directory, patterns=None, dry_run=False):
    """Clean up specific directory based on file patterns."""
    print(f"\n=== Cleaning Directory: {directory} ===")
    
    if not os.path.exists(directory):
        return [f"Directory not found: {directory}"]
    
    if patterns is None:
        patterns = ["*.tmp", "*.log", "*.cache"]
    
    results = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            for pattern in patterns:
                if file.endswith(pattern.replace('*', '')):
                    filepath = os.path.join(root, file)
                    result = delete_file(filepath, dry_run)
                    results.append(result)
                    break
    
    return results


def cleanup_files_by_age(directory, days=7, extensions=None, dry_run=False):
    """Remove files older than specified days from directory."""
    print(f"\n=== Removing Files Older Than {days} Days ===")
    
    if not os.path.exists(directory):
        return [f"Directory not found: {directory}"]
    
    results = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if extensions and not any(file.endswith(ext) for ext in extensions):
                continue
            
            filepath = os.path.join(root, file)
            age_days = get_file_age_days(filepath)
            
            if age_days > days:
                result = delete_file(filepath, dry_run)
                results.append(f"{result} (age: {age_days:.1f} days)")
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Cleanup script for temporary files, old backups, and aged files")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without deleting")
    parser.add_argument("--temp-paths", nargs="+", default=["/tmp", "~/Library/Logs", "~/Library/Caches"],
                        help="Paths to clean for temp files")
    parser.add_argument("--backup-dir", default="~/backups",
                        help="Directory containing backup files")
    parser.add_argument("--backup-days", type=int, default=30,
                        help="Age in days for backup files to remove")
    parser.add_argument("--clean-dir", 
                        help="Specific directory to clean")
    parser.add_argument("--clean-patterns", nargs="+", default=["*.tmp", "*.log"],
                        help="File patterns to match in clean-dir")
    parser.add_argument("--age-dir", 
                        help="Directory to clean by file age")
    parser.add_argument("--age-days", type=int, default=7,
                        help="Age in days for files to remove")
    parser.add_argument("--age-extensions", nargs="+", default=[".log", ".tmp"],
                        help="File extensions to consider for age-based cleanup")
    
    args = parser.parse_args()
    
    # Expand ~ to home directory
    args.temp_paths = [os.path.expanduser(p) for p in args.temp_paths]
    args.backup_dir = os.path.expanduser(args.backup_dir)
    if args.clean_dir:
        args.clean_dir = os.path.expanduser(args.clean_dir)
    if args.age_dir:
        args.age_dir = os.path.expanduser(args.age_dir)
    
    if args.dry_run:
        print("=== DRY RUN MODE - No files will be deleted ===")
    
    all_results = []
    
    # Clean temp files
    all_results.extend(cleanup_temp_files(args.temp_paths, args.dry_run))
    
    # Clean old backups
    all_results.extend(cleanup_old_backups(args.backup_dir, days=args.backup_days, dry_run=args.dry_run))
    
    # Clean specific directory
    if args.clean_dir:
        all_results.extend(cleanup_directory(args.clean_dir, args.clean_patterns, args.dry_run))
    
    # Clean files by age
    if args.age_dir:
        all_results.extend(cleanup_files_by_age(args.age_dir, args.age_days, args.age_extensions, args.dry_run))
    
    # Print results
    print("\n=== Results ===")
    for result in all_results:
        print(result)
    
    deleted_count = sum(1 for r in all_results if not r.startswith("[DRY RUN]") and not r.startswith("Error") and not r.startswith("Path not found") and not r.startswith("Directory not found"))
    print(f"\nTotal actions: {len(all_results)}")
    if not args.dry_run:
        print(f"Files/directories deleted: {deleted_count}")


if __name__ == "__main__":
    main()
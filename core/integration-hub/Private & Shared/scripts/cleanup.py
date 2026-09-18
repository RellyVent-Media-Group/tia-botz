#!/usr/bin/env python3
"""
Directory Cleanup Script Template
A flexible script for cleaning up directories by removing unnecessary, unneeded, 
duplicate files, and build artifacts.

Enhanced with Claude API integration for intelligent cleanup decisions and streaming output.
"""

import os
import sys
import json
import hashlib
import shutil
import fnmatch
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional, AsyncGenerator
from dataclasses import dataclass, asdict
from enum import Enum
import asyncio

# Optional Claude API integration
try:
    from anthropic import AsyncAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class CleanupAction(Enum):
    """Types of cleanup actions"""
    DELETE = "delete"
    ARCHIVE = "archive"
    REPORT_ONLY = "report_only"


@dataclass
class CleanupResult:
    """Results of cleanup operation"""
    directory: str
    files_deleted: int
    files_archived: int
    space_freed: int  # in bytes
    duplicates_found: int
    errors: List[str]
    skipped_files: List[str]


@dataclass
class FileMetadata:
    """Metadata for a file"""
    path: str
    size: int
    hash: str
    modified_time: float
    file_type: str


class DirectoryCleanup:
    """Main cleanup class with Claude API integration"""
    
    def __init__(self, config_path: str = None, claude_api_key: str = None):
        """
        Initialize cleanup with configuration
        
        Args:
            config_path: Path to configuration file (JSON)
            claude_api_key: Optional Claude API key for intelligent cleanup
        """
        self.config = self._load_config(config_path) if config_path else self._default_config()
        self.results: List[CleanupResult] = []
        self.duplicate_map: Dict[str, List[str]] = {}
        self.claude_client = None
        self.use_claude = False
        
        claude_api_key = claude_api_key or self.config.get("claude_api_key") or os.environ.get("ANTHROPIC_API_KEY")
        if claude_api_key:
            if not ANTHROPIC_AVAILABLE:
                print("⚠ Anthropic package not installed. Install with: pip install anthropic")
                self.use_claude = False
            else:
                try:
                    self.claude_client = AsyncAnthropic(api_key=claude_api_key)
                    self.use_claude = True
                    print("✓ Claude API integration enabled")
                except Exception as e:
                    print(f"⚠ Failed to initialize Claude API: {e}")
                    self.use_claude = False
        
    def _default_config(self) -> dict:
        """Default configuration"""
        return {
            "build_artifacts": [
                "node_modules", ".next", "dist", "build", "target", 
                "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache",
                "*.pyc", "*.pyo", ".eggs", "*.egg-info",
                ".gradle", "build", "out", ".idea", ".vscode",
                "tsconfig.tsbuildinfo", ".vercel"
            ],
            "temp_files": [
                "*.tmp", "*.temp", "*.swp", "*.swo", "*~", ".DS_Store",
                "Thumbs.db", ".DS_Store?", "._*", ".Spotlight-V100",
                ".Trashes", ".fseventsd"
            ],
            "log_files": [
                "*.log", "*.log.*", "logs/", "*.out", "*.err",
                "hs_err_pid*.log", "system.log", "crush.log"
            ],
            "duplicate_threshold_mb": 10,  # Only check files larger than this
            "max_age_days": 365,  # Delete files older than this
            "protected_patterns": [
                ".git", ".env", "*.env", "credentials*", "*secret*",
                "*.key", "*.pem", "*.p12", "*.pfx", "*.cert",
                "cacert.pem", "roots.pem", "firebaseConfig.ts",
                "google-services.json", "GoogleService-Info.plist"
            ],
            "archive_dir": "cleanup_archive",
            "dry_run": True,
            "verbose": True,
            "claude_model": "claude-3-5-sonnet-20241022",
            "use_intelligent_cleanup": False,
            "project_specific": {
                "excludes": [],
                "aggressive_cleanup": []
            }
        }
    
    def _load_config(self, config_path: str) -> dict:
        """Load configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                # Merge with default config to ensure all required fields exist
                default_config = self._default_config()
                merged_config = {**default_config, **config}
                merged_config["project_specific"] = {
                    **default_config["project_specific"],
                    **config.get("project_specific", {}),
                }
                return merged_config
        except FileNotFoundError:
            print(f"Config file not found: {config_path}, using default config")
            return self._default_config()
        except json.JSONDecodeError as e:
            print(f"Error parsing config file: {e}, using default config")
            return self._default_config()
        except Exception as e:
            print(f"Error loading config: {e}, using default config")
            return self._default_config()
    
    def _calculate_hash(self, filepath: str) -> str:
        """Calculate MD5 hash of a file"""
        hash_md5 = hashlib.md5()
        try:
            with open(filepath, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):  # Increased chunk size for better performance
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except (IOError, OSError, PermissionError):
            return ""
    
    def _get_file_size(self, filepath: str) -> int:
        """Get file size in bytes"""
        try:
            return os.path.getsize(filepath)
        except (IOError, OSError, PermissionError):
            return 0
    
    def _should_skip_file(self, filepath: str) -> bool:
        """Check if file should be skipped based on protected patterns"""
        return self._matches_pattern(filepath, self.config["protected_patterns"])

    def _matches_pattern(self, filepath: str, patterns: List[str]) -> bool:
        """Match a file or directory name/path against shell-style patterns."""
        path = os.path.normpath(filepath).lower()
        filename = os.path.basename(path)
        parts = path.split(os.sep)
        for pattern in patterns:
            pattern = str(pattern).lower().rstrip("/")
            if fnmatch.fnmatch(filename, pattern) or fnmatch.fnmatch(path, pattern):
                return True
            if "/" not in pattern and pattern in parts:
                return True
        return False
    
    def _is_build_artifact(self, filepath: str) -> bool:
        """Check if file/directory is a build artifact"""
        return self._matches_pattern(filepath, self.config["build_artifacts"])
    
    def _is_temp_file(self, filepath: str) -> bool:
        """Check if file is a temporary file"""
        return self._matches_pattern(filepath, self.config["temp_files"])
    
    def _is_log_file(self, filepath: str) -> bool:
        """Check if file is a log file"""
        return self._matches_pattern(filepath, self.config["log_files"])
    
    def _is_old_file(self, filepath: str) -> bool:
        """Check if file is older than max_age_days"""
        try:
            modified_time = os.path.getmtime(filepath)
            age_days = (datetime.now().timestamp() - modified_time) / (24 * 3600)
            return age_days > self.config["max_age_days"]
        except (IOError, OSError, PermissionError):
            return False
    
    def _find_duplicates(self, directory: str) -> Dict[str, List[str]]:
        """Find duplicate files in directory"""
        duplicates = {}
        threshold_bytes = self.config["duplicate_threshold_mb"] * 1024 * 1024
        
        # Get project-specific excludes if available
        project_excludes = self.config.get("project_specific", {}).get("excludes", [])
        archive_dir_name = os.path.basename(os.path.normpath(self.config.get("archive_dir", "cleanup_archive")))
        
        for root, dirs, files in os.walk(directory):
            # Skip protected directories and project-specific excludes
            dirs[:] = [d for d in dirs if d != archive_dir_name
                      and not self._should_skip_file(os.path.join(root, d)) 
                      and not any(exclude in os.path.join(root, d) for exclude in project_excludes)]
            
            for file in files:
                filepath = os.path.join(root, file)
                
                if self._should_skip_file(filepath):
                    continue
                
                file_size = self._get_file_size(filepath)
                if file_size < threshold_bytes:
                    continue
                
                file_hash = self._calculate_hash(filepath)
                if file_hash:
                    if file_hash not in duplicates:
                        duplicates[file_hash] = []
                    duplicates[file_hash].append(filepath)
        
        # Filter to only actual duplicates
        return {h: files for h, files in duplicates.items() if len(files) > 1}
    
    def _delete_file(self, filepath: str) -> bool:
        """Delete a file safely"""
        try:
            if os.path.isfile(filepath):
                os.remove(filepath)
                return True
            elif os.path.isdir(filepath):
                shutil.rmtree(filepath)
                return True
            return False
        except (IOError, OSError, PermissionError, shutil.Error) as e:
            print(f"Error deleting {filepath}: {e}")
            return False
    
    def _archive_file(self, filepath: str, archive_dir: str, source_root: str) -> bool:
        """Archive a file to archive directory"""
        try:
            relative_path = os.path.relpath(filepath, source_root)
            archive_path = os.path.abspath(os.path.join(archive_dir, relative_path))
            archive_root = os.path.abspath(archive_dir)
            if os.path.commonpath([archive_root, archive_path]) != archive_root:
                raise ValueError(f"Archive path escapes archive directory: {filepath}")
            os.makedirs(os.path.dirname(archive_path), exist_ok=True)

            # Handle name conflicts without flattening the source directory tree.
            counter = 1
            original_archive_path = archive_path
            while os.path.exists(archive_path):
                stem, ext = os.path.splitext(original_archive_path)
                archive_path = f"{stem}_{counter}{ext}"
                counter += 1

            shutil.move(filepath, archive_path)
            return True
        except (IOError, OSError, PermissionError, shutil.Error) as e:
            print(f"Error archiving {filepath}: {e}")
            return False
    
    def _scan_directory(self, directory: str) -> Tuple[List[str], List[str], List[str]]:
        """
        Scan directory and categorize files
        
        Returns:
            Tuple of (files_to_delete, files_to_archive, skipped_files)
        """
        files_to_delete = []
        files_to_archive = []
        skipped_files = []
        
        # Get project-specific excludes if available
        project_excludes = self.config.get("project_specific", {}).get("excludes", [])
        archive_dir_name = os.path.basename(os.path.normpath(self.config.get("archive_dir", "cleanup_archive")))
        
        for root, dirs, files in os.walk(directory):
            # Skip protected directories and project-specific excludes
            dirs[:] = [
                d for d in dirs
                if d != archive_dir_name
                and not self._should_skip_file(os.path.join(root, d))
                and not any(fnmatch.fnmatch(os.path.join(root, d), exclude) for exclude in project_excludes)
            ]
            
            for file in files:
                filepath = os.path.join(root, file)
                
                if self._should_skip_file(filepath):
                    skipped_files.append(filepath)
                    continue
                
                if self._is_build_artifact(filepath) or self._is_temp_file(filepath):
                    files_to_delete.append(filepath)
                elif self._is_log_file(filepath):
                    files_to_archive.append(filepath)
                elif self._is_old_file(filepath):
                    files_to_archive.append(filepath)
        
        return files_to_delete, files_to_archive, skipped_files
    
    async def cleanup_directory_async(self, directory: str, action: CleanupAction = CleanupAction.REPORT_ONLY) -> CleanupResult:
        """
        Clean up a directory with optional intelligent cleanup
        
        Args:
            directory: Path to directory to clean
            action: What action to take (delete, archive, or report only)
        
        Returns:
            CleanupResult with statistics
        """
        print(f"\n{'='*60}")
        print(f"Cleaning directory: {directory}")
        print(f"Action: {action.value}")
        print(f"{'='*60}")
        
        result = CleanupResult(
            directory=directory,
            files_deleted=0,
            files_archived=0,
            space_freed=0,
            duplicates_found=0,
            errors=[],
            skipped_files=[]
        )
        
        try:
            # Stream progress message
            self._stream_progress("Scanning directory...")
            
            directory = os.path.abspath(os.path.expanduser(directory))
            if not os.path.isdir(directory):
                result.errors.append(f"Not a directory: {directory}")
                self.results.append(result)
                return result

            # Scan directory
            files_to_delete, files_to_archive, skipped = self._scan_directory(directory)
            result.skipped_files = skipped
            
            self._clear_progress()
            
            self._stream_progress("Finding duplicates...")
            
            # Find duplicates
            duplicates = self._find_duplicates(directory)
            result.duplicates_found = sum(len(files) - 1 for files in duplicates.values())
            
            self._clear_progress()
            
            # Calculate space to be freed
            space_before = sum(self._get_file_size(f) for f in files_to_delete + files_to_archive)
            
            print(f"\nFiles to delete: {len(files_to_delete)}")
            print(f"Files to archive: {len(files_to_archive)}")
            print(f"Duplicates found: {result.duplicates_found}")
            print(f"Space to free: {self._format_size(space_before)}")
            
            # Intelligent cleanup with Claude
            if self.config.get("use_intelligent_cleanup", False) and self.use_claude:
                print("\n🤖 Getting intelligent cleanup advice from Claude...")
                
                # Stream Claude's analysis
                all_files = files_to_delete + files_to_archive
                async for chunk in self._stream_claude_response(
                    f"Analyzing {len(all_files)} files in {directory} for intelligent cleanup..."
                ):
                    print(chunk, end='', flush=True)
                self._clear_progress()
                print()
                
                # Get intelligent advice
                advice = await self._get_intelligent_cleanup_advice(all_files, directory)
                
                if advice:
                    print("\n📋 Intelligent cleanup suggestions:")
                    safe_to_delete = [f for f, cat in advice.items() if cat == "SAFE_TO_DELETE"]
                    review_needed = [f for f, cat in advice.items() if cat == "REVIEW_NEEDED"]
                    keep = [f for f, cat in advice.items() if cat == "KEEP"]
                    
                    print(f"  ✓ Safe to delete: {len(safe_to_delete)} files")
                    print(f"  ⚠ Review needed: {len(review_needed)} files")
                    print(f"  🔒 Keep: {len(keep)} files")
                    
                    # Only files explicitly classified as safe are eligible for deletion.
                    # Files needing review remain untouched rather than being deleted as a
                    # side effect of the DELETE action.
                    if action != CleanupAction.REPORT_ONLY:
                        safe_paths = set(safe_to_delete)
                        files_to_delete = [f for f in files_to_delete if f in safe_paths]
                        files_to_archive = [f for f in files_to_archive if f in safe_paths]
            
            if self.config["verbose"]:
                if files_to_delete:
                    print("\nFiles marked for deletion:")
                    for f in files_to_delete[:10]:  # Show first 10
                        print(f"  - {f}")
                    if len(files_to_delete) > 10:
                        print(f"  ... and {len(files_to_delete) - 10} more")
                
                if files_to_archive:
                    print("\nFiles marked for archiving:")
                    for f in files_to_archive[:10]:
                        print(f"  - {f}")
                    if len(files_to_archive) > 10:
                        print(f"  ... and {len(files_to_archive) - 10} more")
            
            # Perform cleanup based on action
            should_execute = action != CleanupAction.REPORT_ONLY and not self.config.get("dry_run", True)
            if action != CleanupAction.REPORT_ONLY and not should_execute:
                print("\nDry run enabled; no files were changed.")

            if should_execute:
                print("\n🔄 Performing cleanup...")
                archive_path = os.path.join(directory, self.config["archive_dir"])
                
                total_files = len(files_to_delete) + len(files_to_archive)
                processed = 0
                
                if action == CleanupAction.DELETE:
                    for filepath in files_to_delete:
                        self._stream_progress(f"Deleting... {processed}/{total_files}")
                        if self._delete_file(filepath):
                            result.files_deleted += 1
                        else:
                            result.errors.append(f"Failed to delete: {filepath}")
                        processed += 1
                    
                    for filepath in files_to_archive:
                        self._stream_progress(f"Deleting... {processed}/{total_files}")
                        if self._delete_file(filepath):
                            result.files_deleted += 1
                        else:
                            result.errors.append(f"Failed to delete: {filepath}")
                        processed += 1
                
                elif action == CleanupAction.ARCHIVE:
                    for filepath in files_to_delete:
                        self._stream_progress(f"Archiving... {processed}/{total_files}")
                        if self._archive_file(filepath, archive_path, directory):
                            result.files_archived += 1
                        else:
                            result.errors.append(f"Failed to archive: {filepath}")
                        processed += 1
                    
                    for filepath in files_to_archive:
                        self._stream_progress(f"Archiving... {processed}/{total_files}")
                        if self._archive_file(filepath, archive_path, directory):
                            result.files_archived += 1
                        else:
                            result.errors.append(f"Failed to archive: {filepath}")
                        processed += 1
                
                self._clear_progress()
                
                # Calculate space freed
                space_after = sum(self._get_file_size(f) for f in files_to_delete + files_to_archive if os.path.exists(f))
                result.space_freed = space_before - space_after
                
                print(f"\n✓ Cleanup complete!")
                print(f"  Files deleted: {result.files_deleted}")
                print(f"  Files archived: {result.files_archived}")
                print(f"  Space freed: {self._format_size(result.space_freed)}")
                
                if result.errors:
                    print(f"\n⚠ Errors encountered: {len(result.errors)}")
                    for error in result.errors[:5]:
                        print(f"  - {error}")
        
        except Exception as e:
            result.errors.append(f"Directory scan error: {str(e)}")
            print(f"Error: {e}")
        
        self.results.append(result)
        return result
    
    def cleanup_directory(self, directory: str, action: CleanupAction = CleanupAction.REPORT_ONLY) -> CleanupResult:
        """Synchronous wrapper for cleanup_directory_async"""
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(self.cleanup_directory_async(directory, action))
        raise RuntimeError(
            "cleanup_directory() cannot be called from a running event loop; "
            "use await cleanup_directory_async() instead"
        )
    
    def _format_size(self, size_bytes: int) -> str:
        """Format size in human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} PB"
    
    async def _stream_claude_response(self, message: str) -> AsyncGenerator[str, None]:
        """Stream Claude API response for real-time feedback"""
        if not self.use_claude or not self.claude_client:
            return
        
        try:
            async with self.claude_client.messages.stream(
                model=self.config.get("claude_model", "claude-3-5-sonnet-20241022"),
                max_tokens=1024,
                messages=[{"role": "user", "content": message}]
            ) as stream:
                async for text in stream.text_stream:
                    yield text
                    
        except Exception as e:
            print(f"Error streaming Claude response: {e}")
    
    async def _get_intelligent_cleanup_advice(self, file_list: List[str], directory: str) -> Dict[str, str]:
        """Get intelligent cleanup advice from Claude"""
        if not self.use_claude or not self.claude_client:
            return {}
        
        try:
            # Sample files to avoid overwhelming the API
            sample_size = min(20, len(file_list))
            sample_files = file_list[:sample_size]
            
            prompt = f"""I'm cleaning up the directory: {directory}
            
I found {len(file_list)} files that could be cleaned up. Here are {sample_size} examples:
{chr(10).join(f"- {f}" for f in sample_files)}

Please analyze these files and categorize them into:
1. SAFE_TO_DELETE - Clearly safe to remove (build artifacts, temp files, etc.)
2. REVIEW_NEEDED - Needs human review before deletion
3. KEEP - Should be preserved

Return your analysis as a JSON object with file paths as keys and categories as values.
Only respond with the JSON, no other text."""

            message = await self.claude_client.messages.create(
                model=self.config.get("claude_model", "claude-3-5-sonnet-20241022"),
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Parse the JSON response
            content = "".join(
                block.text for block in message.content
                if getattr(block, "type", None) == "text"
            )
            try:
                # Extract JSON from the response
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    if isinstance(parsed, dict):
                        valid_categories = {"SAFE_TO_DELETE", "REVIEW_NEEDED", "KEEP"}
                        return {
                            str(path): category
                            for path, category in parsed.items()
                            if category in valid_categories and os.path.isfile(path)
                        }
            except json.JSONDecodeError:
                pass
                
        except Exception as e:
            print(f"Error getting intelligent cleanup advice: {e}")
        
        return {}
    
    def _stream_progress(self, message: str):
        """Stream progress message to stdout"""
        print(f"\r{message}", end='', flush=True)
    
    def _clear_progress(self):
        """Clear the progress line"""
        print("\r" + " " * 80 + "\r", end='', flush=True)
    
    def generate_summary_report(self, output_path: str = None) -> dict:
        """Generate summary report of all cleanup operations"""
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_directories": len(self.results),
            "total_files_deleted": sum(r.files_deleted for r in self.results),
            "total_files_archived": sum(r.files_archived for r in self.results),
            "total_space_freed": sum(r.space_freed for r in self.results),
            "total_duplicates_found": sum(r.duplicates_found for r in self.results),
            "total_errors": sum(len(r.errors) for r in self.results),
            "results": [asdict(r) for r in self.results]
        }
        
        print(f"\n{'='*60}")
        print("SUMMARY REPORT")
        print(f"{'='*60}")
        print(f"Total directories processed: {summary['total_directories']}")
        print(f"Total files deleted: {summary['total_files_deleted']}")
        print(f"Total files archived: {summary['total_files_archived']}")
        print(f"Total space freed: {self._format_size(summary['total_space_freed'])}")
        print(f"Total duplicates found: {summary['total_duplicates_found']}")
        print(f"Total errors: {summary['total_errors']}")
        
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(summary, f, indent=2)
            print(f"\nReport saved to: {output_path}")
        
        return summary


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Directory Cleanup Tool with Claude AI Integration")
    parser.add_argument("directories", nargs="+", help="Directories to clean")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--action", choices=["delete", "archive", "report"], 
                       default="report", help="Action to take")
    parser.add_argument("--output", help="Path for summary report")
    parser.add_argument("--no-dry-run", action="store_true", 
                       help="Actually perform cleanup (not dry run)")
    parser.add_argument("--claude-api-key", help="Claude API key for intelligent cleanup")
    parser.add_argument("--intelligent", action="store_true",
                       help="Use Claude AI for intelligent cleanup decisions")
    parser.add_argument("--claude-model",
                       help="Claude model to use for intelligent cleanup")
    
    args = parser.parse_args()
    
    # Map action string to enum
    action_map = {
        "delete": CleanupAction.DELETE,
        "archive": CleanupAction.ARCHIVE,
        "report": CleanupAction.REPORT_ONLY
    }
    
    # Initialize cleanup with Claude API
    cleanup = DirectoryCleanup(args.config, args.claude_api_key)
    
    # Override dry_run based on command line
    if args.no_dry_run:
        cleanup.config["dry_run"] = False
    
    # Enable intelligent cleanup if requested
    if args.intelligent:
        cleanup.config["use_intelligent_cleanup"] = True
        if not cleanup.use_claude:
            print("Warning: Intelligent cleanup requested, but Claude API integration is unavailable.")
    
    # Set Claude model if specified
    if args.claude_model:
        cleanup.config["claude_model"] = args.claude_model
    
    # Process each directory
    for directory in args.directories:
        if not os.path.exists(directory):
            print(f"Warning: Directory does not exist: {directory}")
            continue
        
        cleanup.cleanup_directory(directory, action_map[args.action])
    
    # Generate summary report
    cleanup.generate_summary_report(args.output)


if __name__ == "__main__":
    main()

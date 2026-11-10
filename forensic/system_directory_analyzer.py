#!/usr/bin/env python3
"""
macOS System Directory Analyzer - Enhanced
Analyzes /System/Volumes/Preboot/, /Library/, /Users/, /System/Volumes/Data/boot/, /System/Volumes/Data/System/
"""

import os
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import hashlib

DEFAULT_REPORT_DIR = Path.home() / "Desktop" / "Forensic_Reports"


class SystemDirectoryAnalyzer:
    """Comprehensive macOS system directory forensic analyzer"""

    def __init__(self, output_path: str = None, max_depth: int = 5,
                 max_files_per_dir: int = 100):
        self.output_path = Path(output_path) if output_path else DEFAULT_REPORT_DIR
        self.output_path.mkdir(parents=True, exist_ok=True)
        self.max_depth = max_depth
        self.max_files_per_dir = max_files_per_dir
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'directories': {},
            'total_artifacts': 0,
            'security_relevance': {},
            'users': [],
            'artifacts': []
        }

        # Critical directories to analyze
        self.directories = [
            {
                'path': '/System/Volumes/Preboot/',
                'name': 'Preboot',
                'relevance': 'HIGH',
                'description': 'Boot-level tampering detection'
            },
            {
                'path': '/Library/',
                'name': 'Library',
                'relevance': 'HIGH',
                'description': 'System-level configuration'
            },
            {
                'path': '/Users/',
                'name': 'Users',
                'relevance': 'HIGH',
                'description': 'User credentials and behavior analysis'
            },
            {
                'path': '/System/Volumes/Data/boot/',
                'name': 'Data_boot',
                'relevance': 'HIGH',
                'description': 'Boot configuration integrity'
            },
            {
                'path': '/System/Volumes/Data/System/',
                'name': 'Data_System',
                'relevance': 'HIGH',
                'description': 'System integrity verification'
            }
        ]

        # Security-relevant file patterns
        self.security_patterns = [
            '*.plist',
            '*.sqlite',
            '*.db',
            '*.log',
            '*.keychain',
            '*.crt',
            '*.pem',
            '*.key',
            '*.cert',
            'config',
            'preferences',
            'launchd',
            'daemon',
            'agent'
        ]

    def analyze_directory(self, dir_config: Dict) -> Dict:
        """Analyze a single directory for artifacts"""
        path = Path(dir_config['path'])
        name = dir_config['name']

        result = {
            'name': name,
            'path': str(path),
            'exists': path.exists(),
            'artifacts': [],
            'artifact_count': 0,
            'security_relevance': dir_config['relevance'],
            'description': dir_config.get('description', '')
        }

        if not path.exists():
            print(f"⚠️  Directory {path} does not exist")
            return result

        # Walk directory
        for root, dirs, files in os.walk(path):
            # Limit depth to avoid excessive scanning
            depth = Path(root).relative_to(path).parts
            if len(depth) > self.max_depth:
                dirs[:] = []
                continue

            for file in files[:self.max_files_per_dir]:
                file_path = Path(root) / file
                try:
                    # Check if file matches security patterns
                    is_security_relevant = any(
                        file_path.match(pattern)
                        for pattern in self.security_patterns
                    )

                    # Get file info
                    stat = file_path.stat()
                    artifact = {
                        'path': str(file_path),
                        'name': file,
                        'size': stat.st_size,
                        'modified': datetime.fromtimestamp(
                            stat.st_mtime).isoformat(),
                        'created': datetime.fromtimestamp(
                            stat.st_ctime).isoformat(),
                        'security_relevant': is_security_relevant,
                        'hash': None
                    }

                    # Hash the first 1KB for quick fingerprinting
                    try:
                        with open(file_path, 'rb') as f:
                            data = f.read(1024)
                            artifact['hash'] = hashlib.md5(
                                data).hexdigest()
                    except Exception:
                        artifact['hash'] = None

                    result['artifacts'].append(artifact)
                    self.results['artifacts'].append(artifact)

                except Exception:
                    # Permission errors are common
                    pass

        result['artifact_count'] = len(result['artifacts'])
        return result

    def discover_users(self) -> List[str]:
        """Discover users on the system"""
        users_path = Path('/Users/')
        if not users_path.exists():
            return []

        # Get all user directories except shared and .localized
        users = []
        for user_dir in users_path.iterdir():
            if user_dir.is_dir() and not user_dir.name.startswith('.'):
                if user_dir.name not in ['Shared', 'Guest']:
                    users.append(user_dir.name)

        self.results['users'] = users
        return users

    def run_complete_analysis(self) -> Dict:
        """Run complete system analysis"""
        print("🔍 Analyzing macOS system directories...")
        print("=" * 60)

        # 1. Discover users
        print("\n👤 Discovering users...")
        users = self.discover_users()
        print(f"  Found {len(users)} users: {', '.join(users)}")

        # 2. Analyze each directory
        for dir_config in self.directories:
            print(f"\n📂 Analyzing {dir_config['name']}...")
            result = self.analyze_directory(dir_config)
            self.results['directories'][dir_config['name']] = result
            print(f"  Found {result['artifact_count']} artifacts")
            self.results['total_artifacts'] += result['artifact_count']

        # 3. Generate summary
        self.results['summary'] = {
            'total_directories': len(self.directories),
            'total_artifacts': self.results['total_artifacts'],
            'users_found': users,
            'security_level': 'HIGH',
            'analysis_complete': True
        }

        # 4. Save results
        output_file = self.output_path / 'system_directory_analysis_complete.json'
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        # 5. Generate report
        self.generate_report()

        print("\n" + "=" * 60)
        print("✅ System directory analysis complete!")
        print(f"📁 Report saved to: {self.output_path}")

        return self.results

    def generate_report(self):
        """Generate human-readable report"""
        report_path = self.output_path / 'system_directory_analysis_report.md'

        with open(report_path, 'w') as f:
            f.write(f"# macOS System Directory Analysis Report\n\n")
            f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
            f.write(f"## Summary\n\n")
            f.write(f"- Total Directories Analyzed: {len(self.directories)}\n")
            f.write(f"- Total Artifacts Found: {self.results['total_artifacts']}\n")
            f.write(f"- Users Discovered: {len(self.results['users'])}\n\n")

            f.write("## Directory Breakdown\n\n")
            for name, result in self.results['directories'].items():
                f.write(f"### {name}\n")
                f.write(f"- Path: {result['path']}\n")
                f.write(f"- Artifacts: {result['artifact_count']}\n")
                f.write(f"- Security Relevance: {result['security_relevance']}\n")
                f.write(f"- Description: {result.get('description', '')}\n\n")

            f.write("## Security Recommendations\n\n")
            f.write("1. Review all security-relevant artifacts found in /Library/ and /Users/\n")
            f.write("2. Check boot configurations in /System/Volumes/Preboot/ for tampering\n")
            f.write("3. Examine user-specific security data (keychains, preferences, logs)\n")
            f.write("4. Verify system integrity of /System/Volumes/Data/System/\n")
            f.write("5. Consider using MetaGPT Rell.io for automated analysis\n")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=str(DEFAULT_REPORT_DIR),
                        help="Report output directory")
    parser.add_argument("--max-depth", type=int, default=5,
                        help="Max directory walk depth")
    parser.add_argument("--max-files", type=int, default=100,
                        help="Max files to inspect per directory")
    args = parser.parse_args()

    analyzer = SystemDirectoryAnalyzer(
        output_path=args.output,
        max_depth=args.max_depth,
        max_files_per_dir=args.max_files,
    )
    results = analyzer.run_complete_analysis()

    # Print summary to console
    print("\n📊 Summary:")
    print(f"  Total Artifacts: {results['total_artifacts']}")
    print(f"  Directories Analyzed: {len(results['directories'])}")
    print(f"  Users Found: {len(results['users'])}")


if __name__ == "__main__":
    main()

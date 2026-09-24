#!/usr/bin/env python3
"""
Consort Depot - Content Scheduling Automation
Manages content scheduling across multiple platforms (TikTok, Instagram, YouTube, X)
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/content_scheduling.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ContentScheduling')

class ContentScheduler:
    def __init__(self, config_file: str = 'config/schedule_config.json'):
        self.config = self.load_config(config_file)
        self.dry_run = self.config.get('dry_run', True)
        logger.info(f"Content Scheduler initialized (dry_run={self.dry_run})")

    def load_config(self, config_file: str) -> Dict[str, Any]:
        """Load configuration from JSON file"""
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            logger.info(f"Configuration loaded from {config_file}")
            return config
        except FileNotFoundError:
            logger.warning(f"Config file {config_file} not found, using defaults")
            return {
                'dry_run': True,
                'platforms': ['tiktok', 'instagram', 'youtube', 'x'],
                'default_timezone': 'UTC',
                'content_types': ['video', 'image', 'text', 'story'],
                'approval_required': True
            }

    def load_content_queue(self, data_file: str = 'data/content_queue.json') -> List[Dict[str, Any]]:
        """Load content queue data"""
        try:
            with open(data_file, 'r') as f:
                data = json.load(f)
            logger.info(f"Content queue loaded from {data_file}")
            return data
        except FileNotFoundError:
            logger.warning(f"Data file {data_file} not found, using sample data")
            return [
                {'id': 'CNT001', 'title': 'Mac Morning Routine', 'platform': 'tiktok', 'scheduled_time': '2026-09-22T09:00:00Z', 'status': 'pending'},
                {'id': 'CNT002', 'title': 'Mary Fitness Tips', 'platform': 'instagram', 'scheduled_time': '2026-09-22T10:00:00Z', 'status': 'pending'},
                {'id': 'CNT003', 'title': 'Q&A Session', 'platform': 'youtube', 'scheduled_time': '2026-09-22T14:00:00Z', 'status': 'pending'},
                {'id': 'CNT004', 'title': 'Daily Wisdom', 'platform': 'x', 'scheduled_time': '2026-09-22T16:00:00Z', 'status': 'pending'}
            ]

    def schedule_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule a single piece of content"""
        content_id = content['id']
        platform = content['platform']
        scheduled_time = content['scheduled_time']

        # Validate content
        if not content.get('title'):
            return {
                'content_id': content_id,
                'status': 'failed',
                'reason': 'Missing content title'
            }

        if platform not in self.config.get('platforms', []):
            return {
                'content_id': content_id,
                'status': 'failed',
                'reason': f'Platform {platform} not supported'
            }

        # Simulate content scheduling
        if self.dry_run:
            logger.info(f"[DRY RUN] Scheduling content {content_id}: '{content['title']}' on {platform} at {scheduled_time}")
            return {
                'content_id': content_id,
                'status': 'scheduled',
                'platform': platform,
                'scheduled_time': scheduled_time,
                'scheduled_at': datetime.now().isoformat(),
                'dry_run': True
            }
        else:
            # In production, integrate with actual platform APIs
            logger.info(f"Scheduling content {content_id}: '{content['title']}' on {platform} at {scheduled_time}")
            return {
                'content_id': content_id,
                'status': 'scheduled',
                'platform': platform,
                'scheduled_time': scheduled_time,
                'scheduled_at': datetime.now().isoformat(),
                'dry_run': False
            }

    def process_content_queue(self, content_queue: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process all content in the queue"""
        results = {
            'total_content': len(content_queue),
            'scheduled': 0,
            'failed': 0,
            'by_platform': {},
            'scheduling_details': []
        }

        for content in content_queue:
            if content['status'] == 'pending':
                result = self.schedule_content(content)
                results['scheduling_details'].append(result)

                platform = result.get('platform', 'unknown')
                if platform not in results['by_platform']:
                    results['by_platform'][platform] = 0

                if result['status'] == 'scheduled':
                    results['scheduled'] += 1
                    results['by_platform'][platform] += 1
                else:
                    results['failed'] += 1

        logger.info(f"Content queue processed: {results['scheduled']} scheduled, {results['failed']} failed")
        return results

    def generate_report(self, results: Dict[str, Any], content_queue: List[Dict[str, Any]]) -> str:
        """Generate human-readable report"""
        report_lines = [
            "=" * 60,
            "CONTENT SCHEDULING REPORT",
            "=" * 60,
            f"Date: {datetime.now().isoformat()}",
            f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}",
            "",
            "SUMMARY",
            "-" * 60,
            f"Total Content: {results['total_content']}",
            f"Scheduled: {results['scheduled']}",
            f"Failed: {results['failed']}",
            "",
            "BY PLATFORM",
            "-" * 60
        ]

        for platform, count in results['by_platform'].items():
            report_lines.append(f"{platform.title()}: {count} pieces scheduled")

        report_lines.append("")
        report_lines.append("SCHEDULING DETAILS")
        report_lines.append("-" * 60)

        for detail in results['scheduling_details']:
            status_emoji = "✓" if detail['status'] == 'scheduled' else "✗"
            # Find original content title from queue
            original_content = next((c for c in content_queue if c['id'] == detail['content_id']), {})
            title = original_content.get('title', 'N/A')
            report_lines.append(
                f"{status_emoji} {detail['content_id']}: '{title}' "
                f"on {detail.get('platform', 'N/A')} - {detail['status'].upper()}"
            )
            if detail['status'] == 'failed':
                report_lines.append(f"  Reason: {detail.get('reason', 'Unknown')}")

        report_lines.append("=" * 60)

        return "\n".join(report_lines)

    def save_results(self, results: Dict[str, Any]) -> str:
        """Save results to JSON file"""
        output_file = f"results/content_scheduling_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"Results saved to {output_file}")
        return output_file

    def run(self) -> Dict[str, Any]:
        """Execute content scheduling process"""
        logger.info("Starting content scheduling process")

        # Load content queue
        content_queue = self.load_content_queue()

        # Process content queue
        results = self.process_content_queue(content_queue)

        # Generate report
        report = self.generate_report(results, content_queue)
        print(report)

        # Save results
        output_file = self.save_results(results)

        logger.info("Content scheduling process completed")
        return {
            'success': True,
            'results': results,
            'output_file': output_file
        }

def main():
    scheduler = ContentScheduler()
    result = scheduler.run()
    return result

if __name__ == "__main__":
    main()

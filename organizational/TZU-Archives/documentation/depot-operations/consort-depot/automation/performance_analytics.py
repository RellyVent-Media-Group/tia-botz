#!/usr/bin/env python3
"""
Consort Depot - Performance Analytics Automation
Analyzes content performance across platforms and generates insights
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Any
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/performance_analytics.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('PerformanceAnalytics')

class PerformanceAnalyzer:
    def __init__(self, config_file: str = 'config/performance_config.json'):
        self.config = self.load_config(config_file)
        self.dry_run = self.config.get('dry_run', True)
        logger.info(f"Performance Analyzer initialized (dry_run={self.dry_run})")

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
                'metrics': ['views', 'likes', 'shares', 'comments', 'followers'],
                'benchmark_engagement_rate': 0.05
            }

    def load_performance_data(self, data_file: str = 'data/performance_data.json') -> List[Dict[str, Any]]:
        """Load performance data"""
        try:
            with open(data_file, 'r') as f:
                data = json.load(f)
            logger.info(f"Performance data loaded from {data_file}")
            return data
        except FileNotFoundError:
            logger.warning(f"Data file {data_file} not found, using sample data")
            return [
                {'id': 'PERF001', 'content_id': 'CNT001', 'platform': 'tiktok', 'views': 50000, 'likes': 3500, 'shares': 500, 'comments': 200, 'date': '2026-09-22'},
                {'id': 'PERF002', 'content_id': 'CNT002', 'platform': 'instagram', 'views': 30000, 'likes': 2500, 'shares': 300, 'comments': 150, 'date': '2026-09-22'},
                {'id': 'PERF003', 'content_id': 'CNT003', 'platform': 'youtube', 'views': 15000, 'likes': 800, 'shares': 100, 'comments': 50, 'date': '2026-09-22'},
                {'id': 'PERF004', 'content_id': 'CNT004', 'platform': 'x', 'views': 8000, 'likes': 400, 'shares': 50, 'comments': 25, 'date': '2026-09-22'}
            ]

    def calculate_engagement_rate(self, performance: Dict[str, Any]) -> float:
        """Calculate engagement rate for a piece of content"""
        views = performance.get('views', 0)
        likes = performance.get('likes', 0)
        shares = performance.get('shares', 0)
        comments = performance.get('comments', 0)

        if views == 0:
            return 0.0

        total_engagement = likes + shares + comments
        return total_engagement / views

    def analyze_performance(self, performance: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance of a single piece of content"""
        content_id = performance['content_id']
        platform = performance['platform']
        views = performance['views']
        likes = performance['likes']
        shares = performance['shares']
        comments = performance['comments']

        # Calculate metrics
        engagement_rate = self.calculate_engagement_rate(performance)
        like_rate = likes / views if views > 0 else 0
        share_rate = shares / views if views > 0 else 0
        comment_rate = comments / views if views > 0 else 0

        # Compare to benchmark
        benchmark = self.config.get('benchmark_engagement_rate', 0.05)
        if engagement_rate >= benchmark * 1.5:
            performance_rating = 'excellent'
        elif engagement_rate >= benchmark:
            performance_rating = 'good'
        elif engagement_rate >= benchmark * 0.5:
            performance_rating = 'average'
        else:
            performance_rating = 'below_average'

        return {
            'content_id': content_id,
            'platform': platform,
            'views': views,
            'likes': likes,
            'shares': shares,
            'comments': comments,
            'engagement_rate': engagement_rate,
            'like_rate': like_rate,
            'share_rate': share_rate,
            'comment_rate': comment_rate,
            'performance_rating': performance_rating,
            'analyzed_at': datetime.now().isoformat()
        }

    def analyze_all_performance(self, performance_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze all performance data"""
        analyzed_data = []
        total_views = 0
        total_likes = 0
        total_shares = 0
        total_comments = 0
        by_platform = {}
        by_rating = {'excellent': 0, 'good': 0, 'average': 0, 'below_average': 0}

        for performance in performance_data:
            analysis = self.analyze_performance(performance)
            analyzed_data.append(analysis)

            # Aggregate totals
            total_views += analysis['views']
            total_likes += analysis['likes']
            total_shares += analysis['shares']
            total_comments += analysis['comments']

            # Count by platform
            platform = analysis['platform']
            if platform not in by_platform:
                by_platform[platform] = {'count': 0, 'views': 0, 'engagement_rate': 0}
            by_platform[platform]['count'] += 1
            by_platform[platform]['views'] += analysis['views']
            by_platform[platform]['engagement_rate'] += analysis['engagement_rate']

            # Count by rating
            by_rating[analysis['performance_rating']] += 1

        # Calculate platform averages
        for platform in by_platform:
            count = by_platform[platform]['count']
            by_platform[platform]['avg_views'] = by_platform[platform]['views'] / count
            by_platform[platform]['avg_engagement_rate'] = by_platform[platform]['engagement_rate'] / count

        # Calculate overall averages
        overall_engagement_rate = (total_likes + total_shares + total_comments) / total_views if total_views > 0 else 0

        result = {
            'total_content': len(performance_data),
            'analyzed_data': analyzed_data,
            'aggregates': {
                'total_views': total_views,
                'total_likes': total_likes,
                'total_shares': total_shares,
                'total_comments': total_comments,
                'overall_engagement_rate': overall_engagement_rate
            },
            'by_platform': by_platform,
            'by_rating': by_rating,
            'analysis_date': datetime.now().isoformat()
        }

        logger.info(f"Performance analysis complete: {by_rating['excellent']} excellent, {by_rating['good']} good")
        return result

    def generate_report(self, result: Dict[str, Any]) -> str:
        """Generate human-readable report"""
        report_lines = [
            "=" * 60,
            "PERFORMANCE ANALYTICS REPORT",
            "=" * 60,
            f"Date: {result['analysis_date']}",
            f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}",
            "",
            "OVERALL PERFORMANCE",
            "-" * 60,
            f"Total Content Analyzed: {result['total_content']}",
            f"Total Views: {result['aggregates']['total_views']:,}",
            f"Total Likes: {result['aggregates']['total_likes']:,}",
            f"Total Shares: {result['aggregates']['total_shares']:,}",
            f"Total Comments: {result['aggregates']['total_comments']:,}",
            f"Overall Engagement Rate: {result['aggregates']['overall_engagement_rate']:.2%}",
            "",
            "PERFORMANCE RATING DISTRIBUTION",
            "-" * 60,
            f"Excellent: {result['by_rating']['excellent']}",
            f"Good: {result['by_rating']['good']}",
            f"Average: {result['by_rating']['average']}",
            f"Below Average: {result['by_rating']['below_average']}",
            "",
            "BY PLATFORM",
            "-" * 60
        ]

        for platform, data in result['by_platform'].items():
            report_lines.append(
                f"{platform.title()}: {data['count']} pieces, "
                f"{data['avg_views']:,.0f} avg views, "
                f"{data['avg_engagement_rate']:.2%} avg engagement"
            )

        report_lines.append("")
        report_lines.append("CONTENT PERFORMANCE DETAILS")
        report_lines.append("-" * 60)

        for analysis in result['analyzed_data']:
            rating_emoji = {
                'excellent': '🌟',
                'good': '✅',
                'average': '📊',
                'below_average': '⚠️'
            }.get(analysis['performance_rating'], '❓')

            report_lines.append(
                f"{rating_emoji} {analysis['content_id']} ({analysis['platform'].title()}) - "
                f"{analysis['views']:,} views, {analysis['engagement_rate']:.2%} engagement"
            )
            report_lines.append(f"  Rating: {analysis['performance_rating'].replace('_', ' ').title()}")
            report_lines.append("")

        report_lines.append("=" * 60)

        return "\n".join(report_lines)

    def save_results(self, result: Dict[str, Any]) -> str:
        """Save results to JSON file"""
        output_file = f"results/performance_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)

        logger.info(f"Results saved to {output_file}")
        return output_file

    def run(self) -> Dict[str, Any]:
        """Execute performance analytics process"""
        logger.info("Starting performance analytics process")

        # Load performance data
        performance_data = self.load_performance_data()

        # Analyze performance
        result = self.analyze_all_performance(performance_data)

        # Generate report
        report = self.generate_report(result)
        print(report)

        # Save results
        output_file = self.save_results(result)

        logger.info("Performance analytics process completed")
        return {
            'success': True,
            'result': result,
            'output_file': output_file
        }

def main():
    analyzer = PerformanceAnalyzer()
    result = analyzer.run()
    return result

if __name__ == "__main__":
    main()

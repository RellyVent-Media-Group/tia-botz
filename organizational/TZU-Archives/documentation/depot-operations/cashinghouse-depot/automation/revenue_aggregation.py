#!/usr/bin/env python3
"""
CashingHouse Depot - Revenue Aggregation Automation
Aggregates revenue from multiple platforms (Gumroad, Fiverr, CrakRevenue, AdMob, Linktree)
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
        logging.FileHandler('logs/revenue_aggregation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('RevenueAggregation')

class RevenueAggregator:
    def __init__(self, config_file: str = 'config/revenue_config.json'):
        self.config = self.load_config(config_file)
        self.dry_run = self.config.get('dry_run', True)
        logger.info(f"Revenue Aggregator initialized (dry_run={self.dry_run})")

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
                'platforms': ['gumroad', 'fiverr', 'crakrevenue', 'admob', 'linktree'],
                'currency': 'USD',
                'aggregation_interval': 'daily'
            }

    def load_platform_data(self, data_file: str = 'data/platform_revenue.json') -> Dict[str, Any]:
        """Load platform revenue data"""
        try:
            with open(data_file, 'r') as f:
                data = json.load(f)
            logger.info(f"Platform data loaded from {data_file}")
            return data
        except FileNotFoundError:
            logger.warning(f"Data file {data_file} not found, using sample data")
            return {
                'gumroad': {'revenue': 5000.00, 'transactions': 120, 'date': '2026-09-22'},
                'fiverr': {'revenue': 3500.00, 'transactions': 45, 'date': '2026-09-22'},
                'crakrevenue': {'revenue': 2800.00, 'transactions': 890, 'date': '2026-09-22'},
                'admob': {'revenue': 1200.00, 'transactions': 50000, 'date': '2026-09-22'},
                'linktree': {'revenue': 450.00, 'transactions': 230, 'date': '2026-09-22'}
            }

    def aggregate_revenue(self, platform_data: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate revenue from all platforms"""
        total_revenue = 0.0
        total_transactions = 0
        platform_breakdown = []

        for platform, data in platform_data.items():
            revenue = data.get('revenue', 0.0)
            transactions = data.get('transactions', 0)
            total_revenue += revenue
            total_transactions += transactions

            platform_breakdown.append({
                'platform': platform,
                'revenue': revenue,
                'transactions': transactions,
                'percentage': 0.0  # Will calculate after total
            })

        # Calculate percentages
        for platform in platform_breakdown:
            if total_revenue > 0:
                platform['percentage'] = (platform['revenue'] / total_revenue) * 100

        aggregation_result = {
            'total_revenue': total_revenue,
            'total_transactions': total_transactions,
            'platform_breakdown': platform_breakdown,
            'currency': self.config.get('currency', 'USD'),
            'aggregation_date': datetime.now().isoformat(),
            'interval': self.config.get('aggregation_interval', 'daily')
        }

        logger.info(f"Revenue aggregated: ${total_revenue:.2f} from {total_transactions} transactions")
        return aggregation_result

    def detect_anomalies(self, aggregation_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect revenue anomalies"""
        anomalies = []
        thresholds = self.config.get('anomaly_thresholds', {
            'min_daily_revenue': 1000.0,
            'max_single_platform_percentage': 70.0,
            'min_transaction_count': 10
        })

        total_revenue = aggregation_result['total_revenue']

        # Check minimum revenue threshold
        if total_revenue < thresholds['min_daily_revenue']:
            anomalies.append({
                'type': 'low_revenue',
                'severity': 'warning',
                'message': f"Total revenue ${total_revenue:.2f} below minimum threshold ${thresholds['min_daily_revenue']:.2f}"
            })

        # Check platform concentration
        for platform in aggregation_result['platform_breakdown']:
            if platform['percentage'] > thresholds['max_single_platform_percentage']:
                anomalies.append({
                    'type': 'high_concentration',
                    'severity': 'warning',
                    'message': f"{platform['platform']} accounts for {platform['percentage']:.1f}% of total revenue"
                })

        # Check transaction counts
        for platform in aggregation_result['platform_breakdown']:
            if platform['transactions'] < thresholds['min_transaction_count'] and platform['revenue'] > 0:
                anomalies.append({
                    'type': 'low_transactions',
                    'severity': 'info',
                    'message': f"{platform['platform']} has low transaction count: {platform['transactions']}"
                })

        if anomalies:
            logger.warning(f"Detected {len(anomalies)} anomalies")
        else:
            logger.info("No anomalies detected")

        return anomalies

    def generate_report(self, aggregation_result: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> str:
        """Generate human-readable report"""
        report_lines = [
            "=" * 60,
            "REVENUE AGGREGATION REPORT",
            "=" * 60,
            f"Date: {aggregation_result['aggregation_date']}",
            f"Interval: {aggregation_result['interval']}",
            f"Currency: {aggregation_result['currency']}",
            "",
            "TOTAL REVENUE SUMMARY",
            "-" * 60,
            f"Total Revenue: ${aggregation_result['total_revenue']:.2f}",
            f"Total Transactions: {aggregation_result['total_transactions']}",
            "",
            "PLATFORM BREAKDOWN",
            "-" * 60
        ]

        for platform in aggregation_result['platform_breakdown']:
            report_lines.append(
                f"{platform['platform'].title()}: ${platform['revenue']:.2f} "
                f"({platform['percentage']:.1f}%) - {platform['transactions']} transactions"
            )

        if anomalies:
            report_lines.append("")
            report_lines.append("ANOMALIES DETECTED")
            report_lines.append("-" * 60)
            for anomaly in anomalies:
                report_lines.append(f"[{anomaly['severity'].upper()}] {anomaly['message']}")
        else:
            report_lines.append("")
            report_lines.append("No anomalies detected")

        report_lines.append("=" * 60)

        return "\n".join(report_lines)

    def save_results(self, aggregation_result: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> str:
        """Save results to JSON file"""
        results = {
            'aggregation_result': aggregation_result,
            'anomalies': anomalies,
            'generated_at': datetime.now().isoformat()
        }

        output_file = f"results/revenue_aggregation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"Results saved to {output_file}")
        return output_file

    def run(self) -> Dict[str, Any]:
        """Execute revenue aggregation process"""
        logger.info("Starting revenue aggregation process")

        # Load platform data
        platform_data = self.load_platform_data()

        # Aggregate revenue
        aggregation_result = self.aggregate_revenue(platform_data)

        # Detect anomalies
        anomalies = self.detect_anomalies(aggregation_result)

        # Generate report
        report = self.generate_report(aggregation_result, anomalies)
        print(report)

        # Save results
        output_file = self.save_results(aggregation_result, anomalies)

        logger.info("Revenue aggregation process completed")
        return {
            'success': True,
            'aggregation_result': aggregation_result,
            'anomalies': anomalies,
            'output_file': output_file
        }

def main():
    aggregator = RevenueAggregator()
    result = aggregator.run()
    return result

if __name__ == "__main__":
    main()

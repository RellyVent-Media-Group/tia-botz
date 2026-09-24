#!/usr/bin/env python3
"""
CashingHouse Depot - Fraud Detection Automation
Monitors transactions for fraudulent activity and generates alerts
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
        logging.FileHandler('logs/fraud_detection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('FraudDetection')

class FraudDetector:
    def __init__(self, config_file: str = 'config/fraud_config.json'):
        self.config = self.load_config(config_file)
        self.dry_run = self.config.get('dry_run', True)
        logger.info(f"Fraud Detector initialized (dry_run={self.dry_run})")

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
                'max_single_transaction': 10000.00,
                'max_daily_transactions_per_user': 10,
                'max_daily_amount_per_user': 5000.00,
                'suspicious_countries': ['XX', 'YY'],
                'velocity_check_window_minutes': 30
            }

    def load_transactions(self, data_file: str = 'data/transactions.json') -> List[Dict[str, Any]]:
        """Load transaction data"""
        try:
            with open(data_file, 'r') as f:
                data = json.load(f)
            logger.info(f"Transactions loaded from {data_file}")
            return data
        except FileNotFoundError:
            logger.warning(f"Data file {data_file} not found, using sample data")
            return [
                {'id': 'TXN001', 'user_id': 'USR001', 'amount': 49.99, 'country': 'US', 'timestamp': '2026-09-22T10:00:00Z'},
                {'id': 'TXN002', 'user_id': 'USR001', 'amount': 125.00, 'country': 'US', 'timestamp': '2026-09-22T10:15:00Z'},
                {'id': 'TXN003', 'user_id': 'USR002', 'amount': 8500.00, 'country': 'US', 'timestamp': '2026-09-22T11:00:00Z'},
                {'id': 'TXN004', 'user_id': 'USR003', 'amount': 250.00, 'country': 'XX', 'timestamp': '2026-09-22T12:00:00Z'},
                {'id': 'TXN005', 'user_id': 'USR001', 'amount': 75.00, 'country': 'US', 'timestamp': '2026-09-22T12:30:00Z'}
            ]

    def check_transaction_amount(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Check if transaction amount exceeds threshold"""
        max_amount = self.config.get('max_single_transaction', 10000.00)
        amount = transaction['amount']

        if amount > max_amount:
            return {
                'type': 'high_amount',
                'severity': 'high',
                'transaction_id': transaction['id'],
                'message': f"Transaction amount ${amount:.2f} exceeds threshold ${max_amount:.2f}"
            }
        return None

    def check_geographic_risk(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Check if transaction originates from suspicious country"""
        suspicious_countries = self.config.get('suspicious_countries', [])
        country = transaction.get('country', 'N/A')

        if country in suspicious_countries:
            return {
                'type': 'geographic_risk',
                'severity': 'medium',
                'transaction_id': transaction['id'],
                'message': f"Transaction from suspicious country: {country}"
            }
        return None

    def check_velocity(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Check for rapid successive transactions from same user"""
        alerts = []
        window_minutes = self.config.get('velocity_check_window_minutes', 30)
        max_txns = self.config.get('max_daily_transactions_per_user', 10)

        # Group transactions by user
        user_transactions = {}
        for txn in transactions:
            user_id = txn['user_id']
            if user_id not in user_transactions:
                user_transactions[user_id] = []
            user_transactions[user_id].append(txn)

        # Check velocity for each user
        for user_id, user_txns in user_transactions.items():
            if len(user_txns) > max_txns:
                alerts.append({
                    'type': 'high_velocity',
                    'severity': 'medium',
                    'user_id': user_id,
                    'message': f"User {user_id} has {len(user_txns)} transactions (limit: {max_txns})"
                })

        return alerts

    def check_daily_amount(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Check if daily amount per user exceeds threshold"""
        alerts = []
        max_daily_amount = self.config.get('max_daily_amount_per_user', 5000.00)

        # Group transactions by user
        user_amounts = {}
        for txn in transactions:
            user_id = txn['user_id']
            amount = txn['amount']
            if user_id not in user_amounts:
                user_amounts[user_id] = 0.0
            user_amounts[user_id] += amount

        # Check daily amounts
        for user_id, total_amount in user_amounts.items():
            if total_amount > max_daily_amount:
                alerts.append({
                    'type': 'high_daily_amount',
                    'severity': 'high',
                    'user_id': user_id,
                    'message': f"User {user_id} daily total ${total_amount:.2f} exceeds threshold ${max_daily_amount:.2f}"
                })

        return alerts

    def analyze_transactions(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze transactions for fraud indicators"""
        alerts = []

        # Individual transaction checks
        for transaction in transactions:
            # Check amount
            amount_alert = self.check_transaction_amount(transaction)
            if amount_alert:
                alerts.append(amount_alert)

            # Check geographic risk
            geo_alert = self.check_geographic_risk(transaction)
            if geo_alert:
                alerts.append(geo_alert)

        # Aggregate checks
        velocity_alerts = self.check_velocity(transactions)
        alerts.extend(velocity_alerts)

        daily_amount_alerts = self.check_daily_amount(transactions)
        alerts.extend(daily_amount_alerts)

        analysis_result = {
            'total_transactions': len(transactions),
            'alerts_detected': len(alerts),
            'alerts': alerts,
            'analysis_date': datetime.now().isoformat()
        }

        logger.info(f"Transaction analysis complete: {len(alerts)} alerts detected")
        return analysis_result

    def generate_report(self, analysis_result: Dict[str, Any]) -> str:
        """Generate human-readable report"""
        report_lines = [
            "=" * 60,
            "FRAUD DETECTION REPORT",
            "=" * 60,
            f"Date: {analysis_result['analysis_date']}",
            f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}",
            "",
            "SUMMARY",
            "-" * 60,
            f"Total Transactions Analyzed: {analysis_result['total_transactions']}",
            f"Alerts Detected: {analysis_result['alerts_detected']}",
            ""
        ]

        if analysis_result['alerts']:
            report_lines.append("ALERTS")
            report_lines.append("-" * 60)

            # Group by severity
            high_severity = [a for a in analysis_result['alerts'] if a['severity'] == 'high']
            medium_severity = [a for a in analysis_result['alerts'] if a['severity'] == 'medium']
            low_severity = [a for a in analysis_result['alerts'] if a['severity'] == 'low']

            if high_severity:
                report_lines.append("\n[HIGH SEVERITY]")
                for alert in high_severity:
                    report_lines.append(f"  • {alert['message']}")

            if medium_severity:
                report_lines.append("\n[MEDIUM SEVERITY]")
                for alert in medium_severity:
                    report_lines.append(f"  • {alert['message']}")

            if low_severity:
                report_lines.append("\n[LOW SEVERITY]")
                for alert in low_severity:
                    report_lines.append(f"  • {alert['message']}")
        else:
            report_lines.append("No fraud alerts detected")

        report_lines.append("=" * 60)

        return "\n".join(report_lines)

    def save_results(self, analysis_result: Dict[str, Any]) -> str:
        """Save results to JSON file"""
        output_file = f"results/fraud_detection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(analysis_result, f, indent=2)

        logger.info(f"Results saved to {output_file}")
        return output_file

    def run(self) -> Dict[str, Any]:
        """Execute fraud detection process"""
        logger.info("Starting fraud detection process")

        # Load transactions
        transactions = self.load_transactions()

        # Analyze transactions
        analysis_result = self.analyze_transactions(transactions)

        # Generate report
        report = self.generate_report(analysis_result)
        print(report)

        # Save results
        output_file = self.save_results(analysis_result)

        logger.info("Fraud detection process completed")
        return {
            'success': True,
            'analysis_result': analysis_result,
            'output_file': output_file
        }

def main():
    detector = FraudDetector()
    result = detector.run()
    return result

if __name__ == "__main__":
    main()

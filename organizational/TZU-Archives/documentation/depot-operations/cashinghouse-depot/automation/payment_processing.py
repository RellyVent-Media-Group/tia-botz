#!/usr/bin/env python3
"""
CashingHouse Depot - Payment Processing Automation
Handles payment processing, routing, and refund management
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
        logging.FileHandler('logs/payment_processing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('PaymentProcessing')

class PaymentProcessor:
    def __init__(self, config_file: str = 'config/payment_config.json'):
        self.config = self.load_config(config_file)
        self.dry_run = self.config.get('dry_run', True)
        logger.info(f"Payment Processor initialized (dry_run={self.dry_run})")

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
                'payment_gateways': ['stripe', 'paypal', 'braintree'],
                'retry_attempts': 3,
                'retry_delay_seconds': 60,
                'min_payment_amount': 1.00,
                'max_payment_amount': 100000.00
            }

    def load_payment_queue(self, data_file: str = 'data/payment_queue.json') -> List[Dict[str, Any]]:
        """Load payment queue data"""
        try:
            with open(data_file, 'r') as f:
                data = json.load(f)
            logger.info(f"Payment queue loaded from {data_file}")
            return data
        except FileNotFoundError:
            logger.warning(f"Data file {data_file} not found, using sample data")
            return [
                {'id': 'PAY001', 'amount': 49.99, 'currency': 'USD', 'gateway': 'stripe', 'status': 'pending'},
                {'id': 'PAY002', 'amount': 125.00, 'currency': 'USD', 'gateway': 'paypal', 'status': 'pending'},
                {'id': 'PAY003', 'amount': 299.99, 'currency': 'USD', 'gateway': 'stripe', 'status': 'pending'},
                {'id': 'PAY004', 'amount': 15.00, 'currency': 'USD', 'gateway': 'braintree', 'status': 'pending'}
            ]

    def process_payment(self, payment: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single payment"""
        payment_id = payment['id']
        amount = payment['amount']
        gateway = payment['gateway']

        # Validate payment amount
        min_amount = self.config.get('min_payment_amount', 1.00)
        max_amount = self.config.get('max_payment_amount', 100000.00)

        if amount < min_amount:
            return {
                'payment_id': payment_id,
                'status': 'failed',
                'reason': f'Amount ${amount:.2f} below minimum ${min_amount:.2f}'
            }

        if amount > max_amount:
            return {
                'payment_id': payment_id,
                'status': 'failed',
                'reason': f'Amount ${amount:.2f} exceeds maximum ${max_amount:.2f}'
            }

        # Simulate payment processing
        if self.dry_run:
            logger.info(f"[DRY RUN] Processing payment {payment_id}: ${amount:.2f} via {gateway}")
            return {
                'payment_id': payment_id,
                'status': 'success',
                'amount': amount,
                'gateway': gateway,
                'processed_at': datetime.now().isoformat(),
                'dry_run': True
            }
        else:
            # In production, integrate with actual payment gateway APIs
            logger.info(f"Processing payment {payment_id}: ${amount:.2f} via {gateway}")
            return {
                'payment_id': payment_id,
                'status': 'success',
                'amount': amount,
                'gateway': gateway,
                'processed_at': datetime.now().isoformat(),
                'dry_run': False
            }

    def process_refund(self, refund: Dict[str, Any]) -> Dict[str, Any]:
        """Process a refund request"""
        refund_id = refund['id']
        amount = refund['amount']
        original_payment_id = refund.get('original_payment_id', 'N/A')

        if self.dry_run:
            logger.info(f"[DRY RUN] Processing refund {refund_id}: ${amount:.2f} for payment {original_payment_id}")
            return {
                'refund_id': refund_id,
                'status': 'success',
                'amount': amount,
                'original_payment_id': original_payment_id,
                'processed_at': datetime.now().isoformat(),
                'dry_run': True
            }
        else:
            logger.info(f"Processing refund {refund_id}: ${amount:.2f} for payment {original_payment_id}")
            return {
                'refund_id': refund_id,
                'status': 'success',
                'amount': amount,
                'original_payment_id': original_payment_id,
                'processed_at': datetime.now().isoformat(),
                'dry_run': False
            }

    def process_payment_queue(self, payment_queue: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process all payments in the queue"""
        results = {
            'total_payments': len(payment_queue),
            'successful': 0,
            'failed': 0,
            'total_amount_processed': 0.0,
            'processing_details': []
        }

        for payment in payment_queue:
            if payment['status'] == 'pending':
                result = self.process_payment(payment)
                results['processing_details'].append(result)

                if result['status'] == 'success':
                    results['successful'] += 1
                    results['total_amount_processed'] += result['amount']
                else:
                    results['failed'] += 1

        logger.info(f"Payment queue processed: {results['successful']} successful, {results['failed']} failed")
        return results

    def generate_report(self, results: Dict[str, Any]) -> str:
        """Generate human-readable report"""
        report_lines = [
            "=" * 60,
            "PAYMENT PROCESSING REPORT",
            "=" * 60,
            f"Date: {datetime.now().isoformat()}",
            f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}",
            "",
            "SUMMARY",
            "-" * 60,
            f"Total Payments: {results['total_payments']}",
            f"Successful: {results['successful']}",
            f"Failed: {results['failed']}",
            f"Total Amount Processed: ${results['total_amount_processed']:.2f}",
            "",
            "PROCESSING DETAILS",
            "-" * 60
        ]

        for detail in results['processing_details']:
            status_emoji = "✓" if detail['status'] == 'success' else "✗"
            report_lines.append(
                f"{status_emoji} {detail['payment_id']}: ${detail.get('amount', 0):.2f} "
                f"via {detail.get('gateway', 'N/A')} - {detail['status'].upper()}"
            )
            if detail['status'] == 'failed':
                report_lines.append(f"  Reason: {detail.get('reason', 'Unknown')}")

        report_lines.append("=" * 60)

        return "\n".join(report_lines)

    def save_results(self, results: Dict[str, Any]) -> str:
        """Save results to JSON file"""
        output_file = f"results/payment_processing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"Results saved to {output_file}")
        return output_file

    def run(self) -> Dict[str, Any]:
        """Execute payment processing process"""
        logger.info("Starting payment processing process")

        # Load payment queue
        payment_queue = self.load_payment_queue()

        # Process payments
        results = self.process_payment_queue(payment_queue)

        # Generate report
        report = self.generate_report(results)
        print(report)

        # Save results
        output_file = self.save_results(results)

        logger.info("Payment processing process completed")
        return {
            'success': True,
            'results': results,
            'output_file': output_file
        }

def main():
    processor = PaymentProcessor()
    result = processor.run()
    return result

if __name__ == "__main__":
    main()

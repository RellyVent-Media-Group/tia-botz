#!/usr/bin/env python3
"""
CashingHouse Depot - Financial Tracker Automation
Multi-platform revenue tracking with commission calculation and financial reporting
"""

import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass


class Platform(Enum):
    """Revenue platforms for CashingHouse Depot"""
    GUMROAD = "gumroad"
    FIVERR = "fiverr"
    CRAKREVENUE = "crakrevenue"
    ADMOB = "admob"
    LINKTREE = "linktree"


class TransactionType(Enum):
    """Types of financial transactions"""
    SALE = "sale"
    COMMISSION = "commission"
    REFUND = "refund"
    PAYOUT = "payout"
    FEE = "fee"


class TransactionStatus(Enum):
    """Status of transactions"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


@dataclass
class Transaction:
    """Represents a financial transaction"""
    id: str
    platform: Platform
    transaction_type: TransactionType
    amount: float
    currency: str = "USD"
    status: TransactionStatus = TransactionStatus.PENDING
    description: str = ""
    customer_id: str = ""
    product_id: str = ""
    commission_rate: float = 0.0
    commission_amount: float = 0.0
    transaction_date: str = ""
    processed_date: Optional[str] = None
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if not self.transaction_date:
            self.transaction_date = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "platform": self.platform.value,
            "transaction_type": self.transaction_type.value,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status.value,
            "description": self.description,
            "customer_id": self.customer_id,
            "product_id": self.product_id,
            "commission_rate": self.commission_rate,
            "commission_amount": self.commission_amount,
            "transaction_date": self.transaction_date,
            "processed_date": self.processed_date,
            "metadata": self.metadata
        }


@dataclass
class RevenueMetrics:
    """Revenue metrics for a specific period"""
    period_start: str
    period_end: str
    total_revenue: float
    total_commissions: float
    net_revenue: float
    transaction_count: int
    platform_breakdown: Dict
    average_transaction_value: float
    top_performing_platform: str
    
    def to_dict(self):
        return {
            "period_start": self.period_start,
            "period_end": self.period_end,
            "total_revenue": self.total_revenue,
            "total_commissions": self.total_commissions,
            "net_revenue": self.net_revenue,
            "transaction_count": self.transaction_count,
            "platform_breakdown": self.platform_breakdown,
            "average_transaction_value": self.average_transaction_value,
            "top_performing_platform": self.top_performing_platform
        }


class FinancialTracker:
    """Main financial tracking system for CashingHouse Depot"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the Financial Tracker system"""
        if data_dir is None:
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.transactions_file = os.path.join(self.data_dir, "transactions.json")
        self.metrics_file = os.path.join(self.data_dir, "revenue_metrics.json")
        self.platform_configs_file = os.path.join(self.data_dir, "platform_configs.json")
        
        self.transactions: Dict[str, Transaction] = {}
        self.revenue_metrics: Dict[str, RevenueMetrics] = {}
        self.platform_configs: Dict[str, Dict] = {}
        
        self._load_data()
        self._init_platform_configs()
    
    def _load_data(self):
        """Load transactions and metrics from JSON files"""
        # Load transactions
        if os.path.exists(self.transactions_file):
            try:
                with open(self.transactions_file, 'r') as f:
                    data = json.load(f)
                    for trans_data in data:
                        transaction = Transaction(
                            id=trans_data["id"],
                            platform=Platform(trans_data["platform"]),
                            transaction_type=TransactionType(trans_data["transaction_type"]),
                            amount=trans_data["amount"],
                            currency=trans_data.get("currency", "USD"),
                            status=TransactionStatus(trans_data["status"]),
                            description=trans_data.get("description", ""),
                            customer_id=trans_data.get("customer_id", ""),
                            product_id=trans_data.get("product_id", ""),
                            commission_rate=trans_data.get("commission_rate", 0.0),
                            commission_amount=trans_data.get("commission_amount", 0.0),
                            transaction_date=trans_data.get("transaction_date", ""),
                            processed_date=trans_data.get("processed_date"),
                            metadata=trans_data.get("metadata", {})
                        )
                        self.transactions[transaction.id] = transaction
            except Exception as e:
                print(f"Error loading transactions: {e}")
        
        # Load revenue metrics
        if os.path.exists(self.metrics_file):
            try:
                with open(self.metrics_file, 'r') as f:
                    data = json.load(f)
                    for period_key, metrics_data in data.items():
                        self.revenue_metrics[period_key] = RevenueMetrics(**metrics_data)
            except Exception as e:
                print(f"Error loading revenue metrics: {e}")
        
        # Load platform configs
        if os.path.exists(self.platform_configs_file):
            try:
                with open(self.platform_configs_file, 'r') as f:
                    self.platform_configs = json.load(f)
            except Exception as e:
                print(f"Error loading platform configs: {e}")
    
    def _save_data(self):
        """Save transactions and metrics to JSON files"""
        try:
            # Save transactions
            transactions_data = [trans.to_dict() for trans in self.transactions.values()]
            with open(self.transactions_file, 'w') as f:
                json.dump(transactions_data, f, indent=2)
            
            # Save revenue metrics
            metrics_data = {
                key: metrics.to_dict() 
                for key, metrics in self.revenue_metrics.items()
            }
            with open(self.metrics_file, 'w') as f:
                json.dump(metrics_data, f, indent=2)
            
            # Save platform configs
            with open(self.platform_configs_file, 'w') as f:
                json.dump(self.platform_configs, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def _init_platform_configs(self):
        """Initialize default platform configurations"""
        if not self.platform_configs:
            self.platform_configs = {
                "gumroad": {
                    "commission_rate": 0.10,  # 10% commission
                    "processing_fee": 0.029,   # 2.9% + $0.30
                    "fixed_fee": 0.30,
                    "payout_threshold": 10.0,
                    "payout_frequency": "monthly"
                },
                "fiverr": {
                    "commission_rate": 0.20,  # 20% commission
                    "processing_fee": 0.0,
                    "fixed_fee": 0.0,
                    "payout_threshold": 5.0,
                    "payout_frequency": "available_immediately"
                },
                "crakrevenue": {
                    "commission_rate": 0.05,  # 5% commission
                    "processing_fee": 0.0,
                    "fixed_fee": 0.0,
                    "payout_threshold": 50.0,
                    "payout_frequency": "bi_weekly"
                },
                "admob": {
                    "commission_rate": 0.0,   # No commission, revenue share
                    "processing_fee": 0.0,
                    "fixed_fee": 0.0,
                    "payout_threshold": 100.0,
                    "payout_frequency": "monthly"
                },
                "linktree": {
                    "commission_rate": 0.0,   # No commission
                    "processing_fee": 0.0,
                    "fixed_fee": 0.0,
                    "payout_threshold": 0.0,
                    "payout_frequency": "n/a"
                }
            }
            self._save_data()
    
    def add_transaction(self, transaction: Transaction) -> bool:
        """Add a new transaction to the system"""
        if transaction.id in self.transactions:
            return False
        
        # Calculate commission if not provided
        if transaction.commission_rate == 0.0:
            config = self.platform_configs.get(transaction.platform.value, {})
            transaction.commission_rate = config.get("commission_rate", 0.0)
        
        if transaction.commission_amount == 0.0:
            transaction.commission_amount = transaction.amount * transaction.commission_rate
        
        self.transactions[transaction.id] = transaction
        self._save_data()
        return True
    
    def update_transaction_status(self, transaction_id: str, new_status: TransactionStatus) -> bool:
        """Update the status of a transaction"""
        if transaction_id not in self.transactions:
            return False
        
        self.transactions[transaction_id].status = new_status
        if new_status == TransactionStatus.COMPLETED:
            self.transactions[transaction_id].processed_date = datetime.now().isoformat()
        
        self._save_data()
        return True
    
    def calculate_commission(self, platform: Platform, amount: float) -> float:
        """Calculate commission for a specific platform and amount"""
        config = self.platform_configs.get(platform.value, {})
        commission_rate = config.get("commission_rate", 0.0)
        return amount * commission_rate
    
    def get_transactions_by_platform(self, platform: Platform) -> List[Transaction]:
        """Get all transactions for a specific platform"""
        return [t for t in self.transactions.values() if t.platform == platform]
    
    def get_transactions_by_status(self, status: TransactionStatus) -> List[Transaction]:
        """Get all transactions with a specific status"""
        return [t for t in self.transactions.values() if t.status == status]
    
    def get_transactions_by_period(self, start_date: str, end_date: str) -> List[Transaction]:
        """Get all transactions within a specific period"""
        return [
            t for t in self.transactions.values()
            if start_date <= t.transaction_date <= end_date
        ]
    
    def calculate_revenue_metrics(self, start_date: str, end_date: str) -> RevenueMetrics:
        """Calculate revenue metrics for a specific period"""
        period_transactions = self.get_transactions_by_period(start_date, end_date)
        completed_transactions = [t for t in period_transactions if t.status == TransactionStatus.COMPLETED]
        
        total_revenue = sum(t.amount for t in completed_transactions)
        total_commissions = sum(t.commission_amount for t in completed_transactions)
        net_revenue = total_revenue - total_commissions
        transaction_count = len(completed_transactions)
        
        # Platform breakdown
        platform_breakdown = {}
        for platform in Platform:
            platform_transactions = [t for t in completed_transactions if t.platform == platform]
            if platform_transactions:
                platform_revenue = sum(t.amount for t in platform_transactions)
                platform_commissions = sum(t.commission_amount for t in platform_transactions)
                platform_breakdown[platform.value] = {
                    "revenue": platform_revenue,
                    "commissions": platform_commissions,
                    "net_revenue": platform_revenue - platform_commissions,
                    "transaction_count": len(platform_transactions)
                }
        
        # Average transaction value
        avg_transaction_value = total_revenue / transaction_count if transaction_count > 0 else 0.0
        
        # Top performing platform
        top_platform = max(platform_breakdown.keys(), 
                          key=lambda p: platform_breakdown[p]["revenue"]) if platform_breakdown else "none"
        
        metrics = RevenueMetrics(
            period_start=start_date,
            period_end=end_date,
            total_revenue=total_revenue,
            total_commissions=total_commissions,
            net_revenue=net_revenue,
            transaction_count=transaction_count,
            platform_breakdown=platform_breakdown,
            average_transaction_value=avg_transaction_value,
            top_performing_platform=top_platform
        )
        
        # Store metrics
        period_key = f"{start_date}_{end_date}"
        self.revenue_metrics[period_key] = metrics
        self._save_data()
        
        return metrics
    
    def generate_financial_report(self, days: int = 30) -> Dict:
        """Generate a comprehensive financial report for the past N days"""
        end_date = date.today().isoformat()
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        metrics = self.calculate_revenue_metrics(start_date, end_date)
        
        # Get pending transactions
        pending_transactions = self.get_transactions_by_status(TransactionStatus.PENDING)
        
        # Get failed transactions
        failed_transactions = self.get_transactions_by_status(TransactionStatus.FAILED)
        
        # Calculate trends (compare with previous period)
        previous_start = (date.today() - timedelta(days=days*2)).isoformat()
        previous_end = start_date
        previous_metrics = self.calculate_revenue_metrics(previous_start, previous_end)
        
        revenue_growth = 0.0
        if previous_metrics.total_revenue > 0:
            revenue_growth = ((metrics.total_revenue - previous_metrics.total_revenue) / previous_metrics.total_revenue) * 100
        
        return {
            "report_date": datetime.now().isoformat(),
            "period_days": days,
            "period_start": start_date,
            "period_end": end_date,
            "revenue_metrics": metrics.to_dict(),
            "pending_transactions": len(pending_transactions),
            "failed_transactions": len(failed_transactions),
            "revenue_growth_percentage": round(revenue_growth, 2),
            "trend": "increasing" if revenue_growth > 0 else "decreasing" if revenue_growth < 0 else "stable",
            "platform_performance": self._analyze_platform_performance(days),
            "recommendations": self._generate_pricing_recommendations(metrics)
        }
    
    def _analyze_platform_performance(self, days: int) -> Dict:
        """Analyze performance of each platform"""
        end_date = date.today().isoformat()
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        performance = {}
        for platform in Platform:
            platform_transactions = self.get_transactions_by_platform(platform)
            period_transactions = [t for t in platform_transactions if start_date <= t.transaction_date <= end_date]
            completed = [t for t in period_transactions if t.status == TransactionStatus.COMPLETED]
            
            if completed:
                revenue = sum(t.amount for t in completed)
                performance[platform.value] = {
                    "transaction_count": len(completed),
                    "total_revenue": revenue,
                    "average_transaction": revenue / len(completed),
                    "commission_rate": self.platform_configs[platform.value]["commission_rate"]
                }
        
        return performance
    
    def _generate_pricing_recommendations(self, metrics: RevenueMetrics) -> List[str]:
        """Generate pricing optimization recommendations"""
        recommendations = []
        
        # Analyze platform performance
        if metrics.platform_breakdown:
            best_platform = max(metrics.platform_breakdown.keys(), 
                              key=lambda p: metrics.platform_breakdown[p]["revenue"])
            worst_platform = min(metrics.platform_breakdown.keys(), 
                               key=lambda p: metrics.platform_breakdown[p]["revenue"])
            
            recommendations.append(f"Best performing platform: {best_platform.upper()}")
            recommendations.append(f"Consider optimizing {worst_platform.upper()} performance")
        
        # Transaction value analysis
        if metrics.average_transaction_value < 10:
            recommendations.append("Average transaction value is low - consider bundle pricing")
        elif metrics.average_transaction_value > 100:
            recommendations.append("High average transaction value - consider tiered pricing")
        
        # Commission analysis
        commission_ratio = (metrics.total_commissions / metrics.total_revenue * 100) if metrics.total_revenue > 0 else 0
        if commission_ratio > 15:
            recommendations.append("High commission ratio - review platform fee structures")
        
        return recommendations
    
    def get_payout_summary(self) -> Dict:
        """Get payout summary for all platforms"""
        summary = {}
        
        for platform in Platform:
            config = self.platform_configs[platform.value]
            platform_transactions = self.get_transactions_by_platform(platform)
            completed = [t for t in platform_transactions if t.status == TransactionStatus.COMPLETED]
            
            # Calculate available balance (excluding recent transactions that might be in hold period)
            recent_cutoff = (date.today() - timedelta(days=7)).isoformat()
            available_transactions = [t for t in completed if t.processed_date and t.processed_date < recent_cutoff]
            
            available_balance = sum(t.amount - t.commission_amount for t in available_transactions)
            threshold = config["payout_threshold"]
            
            summary[platform.value] = {
                "available_balance": round(available_balance, 2),
                "payout_threshold": threshold,
                "ready_for_payout": available_balance >= threshold,
                "payout_frequency": config["payout_frequency"],
                "pending_transactions": len(completed) - len(available_transactions)
            }
        
        return summary


def main():
    """Example usage of the CashingHouse Financial Tracker system"""
    tracker = FinancialTracker()
    
    print("=== CashingHouse Depot - Financial Tracker ===")
    print()
    
    # Example: Add a transaction
    sample_transaction = Transaction(
        id=f"trans_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        platform=Platform.GUMROAD,
        transaction_type=TransactionType.SALE,
        amount=29.99,
        currency="USD",
        status=TransactionStatus.COMPLETED,
        description="Digital product sale",
        customer_id="cust_001",
        product_id="prod_001"
    )
    
    if tracker.add_transaction(sample_transaction):
        print(f"Added transaction: {sample_transaction.description} - ${sample_transaction.amount}")
    print()
    
    # Generate financial report
    report = tracker.generate_financial_report(30)
    print("=== Financial Report ===")
    print(json.dumps(report, indent=2))
    print()
    
    # Payout summary
    payout_summary = tracker.get_payout_summary()
    print("=== Payout Summary ===")
    print(json.dumps(payout_summary, indent=2))


# Export main classes for module import
__all__ = [
    'FinancialTracker',
    'Transaction',
    'RevenueMetrics',
    'Platform',
    'TransactionType',
    'TransactionStatus'
]


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
CashingHouse Depot Financial Tracking Automation
Automates financial tracking, revenue optimization, and payment processing
"""

import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class PlatformType(Enum):
    GUMROAD = "gumroad"
    FIVERR = "fiverr"
    CRAKREVENUE = "crakrevenue"
    ADMOB = "admob"
    LINKTREE = "linktree"


class TransactionStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


@dataclass
class RevenueSource:
    """Revenue source tracking"""
    platform: PlatformType
    source_id: str
    source_name: str
    total_revenue: float
    transaction_count: int
    average_transaction: float
    last_transaction: str
    commission_rate: float
    net_revenue: float


@dataclass
class Transaction:
    """Individual transaction record"""
    transaction_id: str
    platform: PlatformType
    amount: float
    commission: float
    net_amount: float
    status: TransactionStatus
    customer_id: str
    product_id: str
    transaction_date: str
    metadata: Dict


class FinancialTracker:
    """Main financial tracking system"""
    
    def __init__(self, data_path: str = "cashinghouse_financial_data.json"):
        self.data_path = data_path
        self.revenue_sources: Dict[str, RevenueSource] = {}
        self.transactions: Dict[str, Transaction] = {}
        self.platform_configs = {
            PlatformType.GUMROAD: {"commission_rate": 0.10, "processing_time": "2-3 days"},
            PlatformType.FIVERR: {"commission_rate": 0.20, "processing_time": "14 days"},
            PlatformType.CRAKREVENUE: {"commission_rate": 0.15, "processing_time": "7 days"},
            PlatformType.ADMOB: {"commission_rate": 0.30, "processing_time": "monthly"},
            PlatformType.LINKTREE: {"commission_rate": 0.05, "processing_time": "30 days"}
        }
        self.load_data()
    
    def load_data(self):
        """Load financial data from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                
                # Load revenue sources
                for source_id, source_data in data.get("revenue_sources", {}).items():
                    self.revenue_sources[source_id] = RevenueSource(
                        platform=PlatformType(source_data["platform"]),
                        source_id=source_data["source_id"],
                        source_name=source_data["source_name"],
                        total_revenue=source_data["total_revenue"],
                        transaction_count=source_data["transaction_count"],
                        average_transaction=source_data["average_transaction"],
                        last_transaction=source_data["last_transaction"],
                        commission_rate=source_data["commission_rate"],
                        net_revenue=source_data["net_revenue"]
                    )
                
                # Load transactions
                for trans_id, trans_data in data.get("transactions", {}).items():
                    self.transactions[trans_id] = Transaction(
                        transaction_id=trans_data["transaction_id"],
                        platform=PlatformType(trans_data["platform"]),
                        amount=trans_data["amount"],
                        commission=trans_data["commission"],
                        net_amount=trans_data["net_amount"],
                        status=TransactionStatus(trans_data["status"]),
                        customer_id=trans_data["customer_id"],
                        product_id=trans_data["product_id"],
                        transaction_date=trans_data["transaction_date"],
                        metadata=trans_data.get("metadata", {})
                    )
        except FileNotFoundError:
            self._initialize_default_sources()
    
    def save_data(self):
        """Save financial data to file"""
        data = {
            "revenue_sources": {},
            "transactions": {}
        }
        
        for source_id, source in self.revenue_sources.items():
            data["revenue_sources"][source_id] = {
                "platform": source.platform.value,
                "source_id": source.source_id,
                "source_name": source.source_name,
                "total_revenue": source.total_revenue,
                "transaction_count": source.transaction_count,
                "average_transaction": source.average_transaction,
                "last_transaction": source.last_transaction,
                "commission_rate": source.commission_rate,
                "net_revenue": source.net_revenue
            }
        
        for trans_id, trans in self.transactions.items():
            data["transactions"][trans_id] = {
                "transaction_id": trans.transaction_id,
                "platform": trans.platform.value,
                "amount": trans.amount,
                "commission": trans.commission,
                "net_amount": trans.net_amount,
                "status": trans.status.value,
                "customer_id": trans.customer_id,
                "product_id": trans.product_id,
                "transaction_date": trans.transaction_date,
                "metadata": trans.metadata
            }
        
        with open(self.data_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def _initialize_default_sources(self):
        """Initialize default revenue sources"""
        default_sources = [
            {
                "platform": PlatformType.GUMROAD,
                "source_id": "GUM_MAIN",
                "source_name": "Gumroad Main Store"
            },
            {
                "platform": PlatformType.FIVERR,
                "source_id": "FIV_AI_SERVICES",
                "source_name": "Fiverr AI Services"
            },
            {
                "platform": PlatformType.CRAKREVENUE,
                "source_id": "CRK_CONTENT",
                "source_name": "CrakRevenue Content"
            },
            {
                "platform": PlatformType.ADMOB,
                "source_id": "ADM_MONETIZATION",
                "source_name": "AdMob Monetization"
            },
            {
                "platform": PlatformType.LINKTREE,
                "source_id": "LNK_AFFILIATES",
                "source_name": "Linktree Affiliates"
            }
        ]
        
        for source_config in default_sources:
            platform = source_config["platform"]
            commission_rate = self.platform_configs[platform]["commission_rate"]
            
            source = RevenueSource(
                platform=platform,
                source_id=source_config["source_id"],
                source_name=source_config["source_name"],
                total_revenue=0.0,
                transaction_count=0,
                average_transaction=0.0,
                last_transaction="",
                commission_rate=commission_rate,
                net_revenue=0.0
            )
            
            self.revenue_sources[source.source_id] = source
        
        self.save_data()
    
    def add_transaction(self, platform: PlatformType, amount: float, 
                      customer_id: str, product_id: str, metadata: Dict = None) -> str:
        """Add a new transaction"""
        transaction_id = f"{platform.value}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        # Calculate commission and net amount
        commission_rate = self.platform_configs[platform]["commission_rate"]
        commission = amount * commission_rate
        net_amount = amount - commission
        
        transaction = Transaction(
            transaction_id=transaction_id,
            platform=platform,
            amount=amount,
            commission=commission,
            net_amount=net_amount,
            status=TransactionStatus.PENDING,
            customer_id=customer_id,
            product_id=product_id,
            transaction_date=datetime.datetime.now().isoformat(),
            metadata=metadata or {}
        )
        
        self.transactions[transaction_id] = transaction
        
        # Update revenue source
        source_id = f"{platform.value}_MAIN"
        if source_id not in self.revenue_sources:
            source_id = list(self.revenue_sources.keys())[0]
        
        source = self.revenue_sources[source_id]
        source.total_revenue += amount
        source.transaction_count += 1
        source.average_transaction = source.total_revenue / source.transaction_count
        source.last_transaction = transaction.transaction_date
        source.net_revenue += net_amount
        
        self.save_data()
        return transaction_id
    
    def update_transaction_status(self, transaction_id: str, status: TransactionStatus) -> bool:
        """Update transaction status"""
        if transaction_id not in self.transactions:
            return False
        
        self.transactions[transaction_id].status = status
        self.save_data()
        return True
    
    def get_revenue_by_platform(self, platform: PlatformType) -> Dict:
        """Get revenue summary for a specific platform"""
        platform_sources = [s for s in self.revenue_sources.values() if s.platform == platform]
        
        total_revenue = sum(s.total_revenue for s in platform_sources)
        total_net = sum(s.net_revenue for s in platform_sources)
        total_transactions = sum(s.transaction_count for s in platform_sources)
        
        return {
            "platform": platform.value,
            "total_revenue": total_revenue,
            "total_net_revenue": total_net,
            "total_transactions": total_transactions,
            "average_transaction": total_revenue / total_transactions if total_transactions > 0 else 0,
            "commission_rate": self.platform_configs[platform]["commission_rate"]
        }
    
    def get_total_revenue(self) -> Dict:
        """Get total revenue across all platforms"""
        total_revenue = sum(s.total_revenue for s in self.revenue_sources.values())
        total_net = sum(s.net_revenue for s in self.revenue_sources.values())
        total_transactions = sum(s.transaction_count for s in self.revenue_sources.values())
        
        return {
            "total_revenue": total_revenue,
            "total_net_revenue": total_net,
            "total_commission": total_revenue - total_net,
            "total_transactions": total_transactions,
            "average_transaction": total_revenue / total_transactions if total_transactions > 0 else 0
        }
    
    def get_pending_transactions(self) -> List[Transaction]:
        """Get all pending transactions"""
        return [t for t in self.transactions.values() if t.status == TransactionStatus.PENDING]
    
    def generate_financial_report(self) -> str:
        """Generate comprehensive financial report"""
        report = []
        report.append("=" * 80)
        report.append("CASHINGHOUSE DEPOT FINANCIAL REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        # Total revenue summary
        total_revenue = self.get_total_revenue()
        report.append("TOTAL REVENUE SUMMARY:")
        report.append(f"  Gross Revenue: ${total_revenue['total_revenue']:,.2f}")
        report.append(f"  Net Revenue: ${total_revenue['total_net_revenue']:,.2f}")
        report.append(f"  Total Commission: ${total_revenue['total_commission']:,.2f}")
        report.append(f"  Total Transactions: {total_revenue['total_transactions']}")
        report.append(f"  Average Transaction: ${total_revenue['average_transaction']:,.2f}")
        report.append("")
        
        # Platform breakdown
        report.append("REVENUE BY PLATFORM:")
        for platform in PlatformType:
            platform_revenue = self.get_revenue_by_platform(platform)
            if platform_revenue['total_transactions'] > 0:
                report.append(f"  {platform.value.upper()}:")
                report.append(f"    Gross Revenue: ${platform_revenue['total_revenue']:,.2f}")
                report.append(f"    Net Revenue: ${platform_revenue['total_net_revenue']:,.2f}")
                report.append(f"    Transactions: {platform_revenue['total_transactions']}")
                report.append(f"    Commission Rate: {platform_revenue['commission_rate']*100:.1f}%")
                report.append("")
        
        # Pending transactions
        pending = self.get_pending_transactions()
        if pending:
            report.append(f"PENDING TRANSACTIONS ({len(pending)}):")
            for trans in pending[:10]:  # Show first 10
                report.append(f"  {trans.transaction_id}: ${trans.amount:.2f} ({trans.platform.value})")
            if len(pending) > 10:
                report.append(f"  ... and {len(pending) - 10} more")
            report.append("")
        
        # Revenue sources performance
        report.append("REVENUE SOURCE PERFORMANCE:")
        for source_id, source in sorted(self.revenue_sources.items(), 
                                        key=lambda x: x[1].total_revenue, reverse=True):
            if source.total_revenue > 0:
                report.append(f"  {source.source_name} ({source.platform.value}):")
                report.append(f"    Total Revenue: ${source.total_revenue:,.2f}")
                report.append(f"    Net Revenue: ${source.net_revenue:,.2f}")
                report.append(f"    Transactions: {source.transaction_count}")
                report.append(f"    Average: ${source.average_transaction:.2f}")
                report.append("")
        
        return "\n".join(report)
    
    def optimize_pricing_strategy(self, platform: PlatformType) -> Dict:
        """Generate pricing optimization recommendations"""
        platform_revenue = self.get_revenue_by_platform(platform)
        
        recommendations = {
            "platform": platform.value,
            "current_performance": platform_revenue,
            "recommendations": []
        }
        
        # Analyze transaction patterns
        if platform_revenue['total_transactions'] > 0:
            avg_transaction = platform_revenue['average_transaction']
            
            if avg_transaction < 50:
                recommendations["recommendations"].append({
                    "type": "price_increase",
                    "suggestion": "Consider increasing prices by 10-15% to improve margins",
                    "reasoning": "Current average transaction is below optimal range"
                })
            elif avg_transaction > 200:
                recommendations["recommendations"].append({
                    "type": "volume_strategy",
                    "suggestion": "Consider offering tiered pricing to increase volume",
                    "reasoning": "High average transaction may benefit from volume-based pricing"
                })
            
            # Commission optimization
            commission_rate = platform_revenue['commission_rate']
            if commission_rate > 0.20:
                recommendations["recommendations"].append({
                    "type": "platform_negotiation",
                    "suggestion": "Consider negotiating lower commission rates based on volume",
                    "reasoning": f"Current commission rate of {commission_rate*100:.1f}% is relatively high"
                })
        
        return recommendations


def main():
    """Main function for testing and demonstration"""
    tracker = FinancialTracker()
    
    # Add sample transactions
    sample_transactions = [
        {
            "platform": PlatformType.GUMROAD,
            "amount": 47.00,
            "customer_id": "CUST001",
            "product_id": "PROD001",
            "metadata": {"product": "Mac & Mary Prompt Pack"}
        },
        {
            "platform": PlatformType.FIVERR,
            "amount": 150.00,
            "customer_id": "CUST002",
            "product_id": "PROD002",
            "metadata": {"service": "AI Scriptwriter Pro"}
        },
        {
            "platform": PlatformType.CRAKREVENUE,
            "amount": 97.00,
            "customer_id": "CUST003",
            "product_id": "PROD003",
            "metadata": {"content": "Character Prompts"}
        }
    ]
    
    for trans_config in sample_transactions:
        trans_id = tracker.add_transaction(**trans_config)
        tracker.update_transaction_status(trans_id, TransactionStatus.COMPLETED)
    
    # Generate financial report
    print(tracker.generate_financial_report())
    
    # Generate pricing optimization recommendations
    print("\nPRICING OPTIMIZATION RECOMMENDATIONS:")
    for platform in PlatformType:
        recommendations = tracker.optimize_pricing_strategy(platform)
        if recommendations["recommendations"]:
            print(f"\n{platform.value.upper()}:")
            for rec in recommendations["recommendations"]:
                print(f"  • {rec['suggestion']}")
                print(f"    Reason: {rec['reasoning']}")


if __name__ == "__main__":
    main()
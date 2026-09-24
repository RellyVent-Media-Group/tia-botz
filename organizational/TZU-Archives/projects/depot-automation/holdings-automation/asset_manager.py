#!/usr/bin/env python3
"""
Holdings Depot Asset Management Automation
Automates asset management, portfolio tracking, and investment automation
"""

import json
import datetime
import statistics
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class AssetType(Enum):
    REAL_ESTATE = "real_estate"
    INVESTMENT = "investment"
    TECHNOLOGY = "technology"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    CASH = "cash"


class AssetStatus(Enum):
    ACTIVE = "active"
    UNDER_REVIEW = "under_review"
    SOLD = "sold"
    DEPRECATED = "deprecated"


@dataclass
class Asset:
    """Asset record"""
    asset_id: str
    asset_type: AssetType
    name: str
    description: str
    current_value: float
    purchase_value: float
    purchase_date: str
    status: AssetStatus
    location: str
    manager: str
    performance_metrics: Dict
    metadata: Dict
    last_updated: str


@dataclass
class Investment:
    """Investment record"""
    investment_id: str
    asset_id: str
    investment_type: str
    amount: float
    current_value: float
    roi: float
    risk_level: str
    start_date: str
    end_date: str
    status: str
    auto_rebalance: bool


class AssetManager:
    """Main asset management system"""
    
    def __init__(self, data_path: str = "holdings_asset_data.json"):
        self.data_path = data_path
        self.assets: Dict[str, Asset] = {}
        self.investments: Dict[str, Investment] = {}
        self.allocation_rules = {
            "emergency_fund": 0.15,
            "growth_investment": 0.40,
            "operational": 0.30,
            "reserve": 0.15
        }
        self.load_data()
    
    def load_data(self):
        """Load asset data from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                
                # Load assets
                for asset_id, asset_data in data.get("assets", {}).items():
                    self.assets[asset_id] = Asset(
                        asset_id=asset_data["asset_id"],
                        asset_type=AssetType(asset_data["asset_type"]),
                        name=asset_data["name"],
                        description=asset_data["description"],
                        current_value=asset_data["current_value"],
                        purchase_value=asset_data["purchase_value"],
                        purchase_date=asset_data["purchase_date"],
                        status=AssetStatus(asset_data["status"]),
                        location=asset_data["location"],
                        manager=asset_data["manager"],
                        performance_metrics=asset_data["performance_metrics"],
                        metadata=asset_data.get("metadata", {}),
                        last_updated=asset_data["last_updated"]
                    )
                
                # Load investments
                for inv_id, inv_data in data.get("investments", {}).items():
                    self.investments[inv_id] = Investment(
                        investment_id=inv_data["investment_id"],
                        asset_id=inv_data["asset_id"],
                        investment_type=inv_data["investment_type"],
                        amount=inv_data["amount"],
                        current_value=inv_data["current_value"],
                        roi=inv_data["roi"],
                        risk_level=inv_data["risk_level"],
                        start_date=inv_data["start_date"],
                        end_date=inv_data["end_date"],
                        status=inv_data["status"],
                        auto_rebalance=inv_data["auto_rebalance"]
                    )
        except FileNotFoundError:
            self._initialize_default_assets()
    
    def save_data(self):
        """Save asset data to file"""
        data = {
            "assets": {},
            "investments": {}
        }
        
        for asset_id, asset in self.assets.items():
            data["assets"][asset_id] = {
                "asset_id": asset.asset_id,
                "asset_type": asset.asset_type.value,
                "name": asset.name,
                "description": asset.description,
                "current_value": asset.current_value,
                "purchase_value": asset.purchase_value,
                "purchase_date": asset.purchase_date,
                "status": asset.status.value,
                "location": asset.location,
                "manager": asset.manager,
                "performance_metrics": asset.performance_metrics,
                "metadata": asset.metadata,
                "last_updated": asset.last_updated
            }
        
        for inv_id, investment in self.investments.items():
            data["investments"][inv_id] = {
                "investment_id": investment.investment_id,
                "asset_id": investment.asset_id,
                "investment_type": investment.investment_type,
                "amount": investment.amount,
                "current_value": investment.current_value,
                "roi": investment.roi,
                "risk_level": investment.risk_level,
                "start_date": investment.start_date,
                "end_date": investment.end_date,
                "status": investment.status,
                "auto_rebalance": investment.auto_rebalance
            }
        
        with open(self.data_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def _initialize_default_assets(self):
        """Initialize default assets"""
        default_assets = [
            {
                "asset_type": AssetType.REAL_ESTATE,
                "name": "Zu Hall",
                "description": "Primary property for operations",
                "purchase_value": 500000.00,
                "location": "Main Campus",
                "manager": "Holdings Depot"
            },
            {
                "asset_type": AssetType.TECHNOLOGY,
                "name": "Production Equipment",
                "description": "Media production and content creation equipment",
                "purchase_value": 75000.00,
                "location": "Studio Complex",
                "manager": "Consort Depot"
            },
            {
                "asset_type": AssetType.CASH,
                "name": "Operating Reserve",
                "description": "Cash reserves for operations",
                "purchase_value": 100000.00,
                "location": "Financial Institution",
                "manager": "CashingHouse Depot"
            }
        ]
        
        for asset_config in default_assets:
            asset_id = f"{asset_config['asset_type'].value}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            asset = Asset(
                asset_id=asset_id,
                asset_type=asset_config["asset_type"],
                name=asset_config["name"],
                description=asset_config["description"],
                current_value=asset_config["purchase_value"],
                purchase_value=asset_config["purchase_value"],
                purchase_date=datetime.datetime.now().strftime("%Y-%m-%d"),
                status=AssetStatus.ACTIVE,
                location=asset_config["location"],
                manager=asset_config["manager"],
                performance_metrics={},
                metadata={},
                last_updated=datetime.datetime.now().isoformat()
            )
            
            self.assets[asset_id] = asset
        
        self.save_data()
    
    def add_asset(self, asset_type: AssetType, name: str, description: str,
                  purchase_value: float, location: str, manager: str) -> str:
        """Add a new asset"""
        asset_id = f"{asset_type.value}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        asset = Asset(
            asset_id=asset_id,
            asset_type=asset_type,
            name=name,
            description=description,
            current_value=purchase_value,
            purchase_value=purchase_value,
            purchase_date=datetime.datetime.now().strftime("%Y-%m-%d"),
            status=AssetStatus.ACTIVE,
            location=location,
            manager=manager,
            performance_metrics={},
            metadata={},
            last_updated=datetime.datetime.now().isoformat()
        )
        
        self.assets[asset_id] = asset
        self.save_data()
        return asset_id
    
    def update_asset_value(self, asset_id: str, new_value: float) -> bool:
        """Update current value of an asset"""
        if asset_id not in self.assets:
            return False
        
        old_value = self.assets[asset_id].current_value
        self.assets[asset_id].current_value = new_value
        self.assets[asset_id].last_updated = datetime.datetime.now().isoformat()
        
        # Calculate ROI
        roi = ((new_value - self.assets[asset_id].purchase_value) / 
               self.assets[asset_id].purchase_value) * 100
        self.assets[asset_id].performance_metrics["roi"] = roi
        
        self.save_data()
        return True
    
    def create_investment(self, asset_id: str, investment_type: str, 
                        amount: float, risk_level: str, start_date: str,
                        end_date: str = None) -> str:
        """Create a new investment"""
        investment_id = f"INV_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        investment = Investment(
            investment_id=investment_id,
            asset_id=asset_id,
            investment_type=investment_type,
            amount=amount,
            current_value=amount,
            roi=0.0,
            risk_level=risk_level,
            start_date=start_date,
            end_date=end_date or "",
            status="active",
            auto_rebalance=False
        )
        
        self.investments[investment_id] = investment
        self.save_data()
        return investment_id
    
    def update_investment_value(self, investment_id: str, new_value: float) -> bool:
        """Update current value of an investment"""
        if investment_id not in self.investments:
            return False
        
        investment = self.investments[investment_id]
        old_value = investment.current_value
        investment.current_value = new_value
        investment.roi = ((new_value - investment.amount) / investment.amount) * 100
        
        self.save_data()
        return True
    
    def get_assets_by_type(self, asset_type: AssetType) -> List[Asset]:
        """Get all assets of a specific type"""
        return [asset for asset in self.assets.values() if asset.asset_type == asset_type]
    
    def get_assets_by_manager(self, manager: str) -> List[Asset]:
        """Get all assets managed by a specific depot"""
        return [asset for asset in self.assets.values() if asset.manager == manager]
    
    def get_total_portfolio_value(self) -> Dict:
        """Get total portfolio value and breakdown"""
        total_value = sum(asset.current_value for asset in self.assets.values() 
                        if asset.status == AssetStatus.ACTIVE)
        
        breakdown = {}
        for asset_type in AssetType:
            type_assets = self.get_assets_by_type(asset_type)
            type_value = sum(asset.current_value for asset in type_assets 
                           if asset.status == AssetStatus.ACTIVE)
            breakdown[asset_type.value] = type_value
        
        return {
            "total_value": total_value,
            "breakdown": breakdown,
            "total_assets": len([a for a in self.assets.values() if a.status == AssetStatus.ACTIVE])
        }
    
    def get_investment_summary(self) -> Dict:
        """Get investment performance summary"""
        active_investments = [inv for inv in self.investments.values() if inv.status == "active"]
        
        if not active_investments:
            return {"total_investments": 0, "total_value": 0, "average_roi": 0}
        
        total_value = sum(inv.current_value for inv in active_investments)
        total_invested = sum(inv.amount for inv in active_investments)
        average_roi = sum(inv.roi for inv in active_investments) / len(active_investments)
        
        return {
            "total_investments": len(active_investments),
            "total_value": total_value,
            "total_invested": total_invested,
            "average_roi": average_roi,
            "total_profit": total_value - total_invested
        }
    
    def rebalance_portfolio(self) -> Dict:
        """Calculate portfolio rebalancing recommendations"""
        portfolio = self.get_total_portfolio_value()
        total_value = portfolio["total_value"]
        
        recommendations = {
            "current_allocation": portfolio["breakdown"],
            "target_allocation": self.allocation_rules,
            "rebalancing_actions": []
        }
        
        # Calculate current allocation percentages
        current_percentages = {}
        for asset_type, value in portfolio["breakdown"].items():
            current_percentages[asset_type] = (value / total_value) * 100 if total_value > 0 else 0
        
        # Generate rebalancing actions
        target_categories = {
            "emergency_fund": AssetType.CASH,
            "growth_investment": AssetType.INVESTMENT,
            "operational": AssetType.TECHNOLOGY,
            "reserve": AssetType.CASH
        }
        
        for category, target_percent in self.allocation_rules.items():
            target_value = total_value * target_percent
            target_asset_type = target_categories.get(category)
            
            if target_asset_type:
                current_value = portfolio["breakdown"].get(target_asset_type.value, 0)
                difference = target_value - current_value
                
                if abs(difference) > (total_value * 0.05):  # More than 5% difference
                    action = "buy" if difference > 0 else "sell"
                    recommendations["rebalancing_actions"].append({
                        "category": category,
                        "asset_type": target_asset_type.value,
                        "action": action,
                        "amount": abs(difference),
                        "current_value": current_value,
                        "target_value": target_value
                    })
        
        return recommendations
    
    def generate_asset_report(self) -> str:
        """Generate comprehensive asset management report"""
        report = []
        report.append("=" * 80)
        report.append("HOLDINGS DEPOT ASSET MANAGEMENT REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        # Portfolio summary
        portfolio = self.get_total_portfolio_value()
        report.append("PORTFOLIO SUMMARY:")
        report.append(f"  Total Portfolio Value: ${portfolio['total_value']:,.2f}")
        report.append(f"  Total Active Assets: {portfolio['total_assets']}")
        report.append("")
        
        report.append("ASSET BREAKDOWN BY TYPE:")
        for asset_type, value in portfolio["breakdown"].items():
            if value > 0:
                percentage = (value / portfolio["total_value"]) * 100 if portfolio["total_value"] > 0 else 0
                report.append(f"  {asset_type.replace('_', ' ').title()}: ${value:,.2f} ({percentage:.1f}%)")
        report.append("")
        
        # Investment summary
        investment_summary = self.get_investment_summary()
        report.append("INVESTMENT SUMMARY:")
        report.append(f"  Total Investments: {investment_summary['total_investments']}")
        report.append(f"  Total Investment Value: ${investment_summary['total_value']:,.2f}")
        report.append(f"  Total Invested: ${investment_summary['total_invested']:,.2f}")
        report.append(f"  Total Profit: ${investment_summary['total_profit']:,.2f}")
        report.append(f"  Average ROI: {investment_summary['average_roi']:.2f}%")
        report.append("")
        
        # Top performing assets
        report.append("TOP PERFORMING ASSETS:")
        active_assets = [a for a in self.assets.values() if a.status == AssetStatus.ACTIVE]
        sorted_assets = sorted(active_assets, 
                           key=lambda x: x.performance_metrics.get("roi", 0), 
                           reverse=True)
        
        for i, asset in enumerate(sorted_assets[:5], 1):
            roi = asset.performance_metrics.get("roi", 0)
            report.append(f"  {i}. {asset.name} ({asset.asset_type.value})")
            report.append(f"     Current Value: ${asset.current_value:,.2f}")
            report.append(f"     ROI: {roi:.2f}%")
            report.append(f"     Manager: {asset.manager}")
            report.append("")
        
        # Rebalancing recommendations
        rebalancing = self.rebalance_portfolio()
        if rebalancing["rebalancing_actions"]:
            report.append("PORTFOLIO REBALANCING RECOMMENDATIONS:")
            for action in rebalancing["rebalancing_actions"]:
                report.append(f"  {action['category'].replace('_', ' ').title()}:")
                report.append(f"    Action: {action['action'].upper()} ${action['amount']:,.2f}")
                report.append(f"    Asset Type: {action['asset_type']}")
                report.append(f"    Current: ${action['current_value']:,.2f} → Target: ${action['target_value']:,.2f}")
            report.append("")
        
        return "\n".join(report)
    
    def get_portfolio_performance_analytics(self, days: int = 30) -> Dict:
        """Analyze portfolio performance over specified period"""
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
        
        active_assets = [a for a in self.assets.values() if a.status == AssetStatus.ACTIVE]
        recent_updates = [a for a in active_assets 
                         if datetime.datetime.fromisoformat(a.last_updated) >= cutoff_date]
        
        if not recent_updates:
            return {"period_days": days, "analyzed_assets": 0, "analytics": {}}
        
        asset_type_analytics = {}
        for asset_type in AssetType:
            type_assets = [a for a in recent_updates if a.asset_type == asset_type]
            if type_assets:
                values = [a.current_value for a in type_assets]
                rois = [a.performance_metrics.get('roi', 0) for a in type_assets]
                
                asset_type_analytics[asset_type.value] = {
                    "asset_count": len(type_assets),
                    "total_value": sum(values),
                    "avg_value": statistics.mean(values),
                    "total_roi": sum(rois),
                    "avg_roi": statistics.mean(rois) if rois else 0,
                    "value_change_pct": ((sum(values) - sum(a.purchase_value for a in type_assets)) / 
                                      sum(a.purchase_value for a in type_assets) * 100) if type_assets else 0
                }
        
        return {
            "period_days": days,
            "analyzed_assets": len(recent_updates),
            "total_portfolio_value": sum(a.current_value for a in recent_updates),
            "asset_type_analytics": asset_type_analytics
        }
    
    def get_automation_triggers(self) -> List[Dict]:
        """Generate automation triggers based on asset management data"""
        triggers = []
        
        # Low performance alert
        portfolio = self.get_total_portfolio_value()
        investment_summary = self.get_investment_summary()
        
        if investment_summary['average_roi'] < 5:
            triggers.append({
                "type": "low_investment_performance",
                "severity": "warning",
                "message": f"Average investment ROI {investment_summary['average_roi']:.2f}% is below target",
                "action": "Review investment strategy and consider rebalancing"
            })
        
        # Portfolio allocation alerts
        rebalancing = self.rebalance_portfolio()
        if len(rebalancing['rebalancing_actions']) > 2:
            triggers.append({
                "type": "portfolio_rebalancing_needed",
                "severity": "warning",
                "message": f"{len(rebalancing['rebalancing_actions'])} portfolio rebalancing actions needed",
                "action": "Execute portfolio rebalancing recommendations"
            })
        
        # Asset performance alerts
        active_assets = [a for a in self.assets.values() if a.status == AssetStatus.ACTIVE]
        for asset in active_assets:
            roi = asset.performance_metrics.get('roi', 0)
            if roi < -10:  # More than 10% loss
                triggers.append({
                    "type": "underperforming_asset",
                    "severity": "warning",
                    "message": f"{asset.name} has declined {roi:.1f}% since purchase",
                    "action": f"Review {asset.name} performance and consider divestment"
                })
            elif roi > 25:  # More than 25% gain
                triggers.append({
                    "type": "high_performing_asset",
                    "severity": "info",
                    "message": f"{asset.name} has gained {roi:.1f}% - consider profit taking",
                    "action": f"Evaluate {asset.name} for partial profit realization"
                })
        
        # Cash reserve alert
        cash_assets = self.get_assets_by_type(AssetType.CASH)
        if cash_assets:
            total_cash = sum(a.current_value for a in cash_assets)
            cash_ratio = total_cash / portfolio['total_value'] if portfolio['total_value'] > 0 else 0
            if cash_ratio < 0.10:  # Less than 10% cash
                triggers.append({
                    "type": "low_cash_reserve",
                    "severity": "warning",
                    "message": f"Cash reserves {cash_ratio*100:.1f}% are below minimum target",
                    "action": "Increase cash reserves for operational flexibility"
                })
        
        return triggers
    
    def generate_enhanced_report(self) -> str:
        """Generate enhanced asset management report with analytics and triggers"""
        report = []
        report.append("=" * 80)
        report.append("HOLDINGS DEPOT ENHANCED ASSET MANAGEMENT REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        # Standard report
        report.append(self.generate_asset_report())
        report.append("")
        
        # Performance analytics
        analytics = self.get_portfolio_performance_analytics(30)
        report.append("30-DAY PORTFOLIO PERFORMANCE ANALYTICS:")
        report.append(f"  Analyzed Assets: {analytics['analyzed_assets']}")
        report.append(f"  Total Portfolio Value: ${analytics['total_portfolio_value']:,.2f}")
        for asset_type, data in analytics.get("asset_type_analytics", {}).items():
            report.append(f"  {asset_type.replace('_', ' ').title()}:")
            report.append(f"    Assets: {data['asset_count']}")
            report.append(f"    Total Value: ${data['total_value']:,.2f}")
            report.append(f"    Avg Value: ${data['avg_value']:,.2f}")
            report.append(f"    Avg ROI: {data['avg_roi']:.2f}%")
            report.append(f"    Value Change: {data['value_change_pct']:.2f}%")
        report.append("")
        
        # Automation triggers
        triggers = self.get_automation_triggers()
        if triggers:
            report.append("AUTOMATION TRIGGERS:")
            for trigger in triggers:
                severity_icon = "⚠️" if trigger['severity'] == 'warning' else "ℹ️"
                report.append(f"  {severity_icon} {trigger['type'].replace('_', ' ').title()}")
                report.append(f"    {trigger['message']}")
                report.append(f"    Action: {trigger['action']}")
            report.append("")
        
        return "\n".join(report)


def main():
    """Main function for testing and demonstration"""
    manager = AssetManager()
    
    # Add sample assets
    asset_id = manager.add_asset(
        asset_type=AssetType.INVESTMENT,
        name="Growth Stock Portfolio",
        description="Diversified stock portfolio for growth",
        purchase_value=25000.00,
        location="Brokerage Account",
        manager="Holdings Depot"
    )
    
    # Update asset value (simulate growth)
    manager.update_asset_value(asset_id, 28750.00)
    
    # Create investment
    inv_id = manager.create_investment(
        asset_id=asset_id,
        investment_type="stock_purchase",
        amount=10000.00,
        risk_level="medium",
        start_date="2024-09-01"
    )
    
    # Update investment value
    manager.update_investment_value(inv_id, 11500.00)
    
    # Generate enhanced report
    print(manager.generate_enhanced_report())


if __name__ == "__main__":
    main()
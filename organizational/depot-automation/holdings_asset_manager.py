#!/usr/bin/env python3
"""
Holdings Depot - Asset Manager Automation
Portfolio management with investment tracking, ROI calculation, and portfolio rebalancing
"""

import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass


class AssetType(Enum):
    """Types of assets in the portfolio"""
    CRYPTOCURRENCY = "cryptocurrency"
    STOCKS = "stocks"
    REAL_ESTATE = "real_estate"
    DIGITAL_ASSETS = "digital_assets"
    CASH = "cash"
    INTELLECTUAL_PROPERTY = "intellectual_property"


class AssetStatus(Enum):
    """Status of assets"""
    ACTIVE = "active"
    HOLDING = "holding"
    SELLING = "selling"
    SOLD = "sold"
    FROZEN = "frozen"


class RiskLevel(Enum):
    """Risk levels for assets"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SPECULATIVE = "speculative"


@dataclass
class Asset:
    """Represents an asset in the portfolio"""
    id: str
    name: str
    asset_type: AssetType
    status: AssetStatus
    current_value: float
    purchase_value: float
    quantity: float = 1.0
    currency: str = "USD"
    purchase_date: str = ""
    last_updated: str = ""
    risk_level: RiskLevel = RiskLevel.MEDIUM
    description: str = ""
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if not self.purchase_date:
            self.purchase_date = datetime.now().isoformat()
        if not self.last_updated:
            self.last_updated = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "asset_type": self.asset_type.value,
            "status": self.status.value,
            "current_value": self.current_value,
            "purchase_value": self.purchase_value,
            "quantity": self.quantity,
            "currency": self.currency,
            "purchase_date": self.purchase_date,
            "last_updated": self.last_updated,
            "risk_level": self.risk_level.value,
            "description": self.description,
            "metadata": self.metadata
        }
    
    @property
    def total_value(self) -> float:
        """Calculate total value of the asset"""
        return self.current_value * self.quantity
    
    @property
    def roi_percentage(self) -> float:
        """Calculate ROI percentage"""
        if self.purchase_value == 0:
            return 0.0
        return ((self.current_value - self.purchase_value) / self.purchase_value) * 100


@dataclass
class PortfolioAllocation:
    """Target allocation for portfolio rebalancing"""
    asset_type: AssetType
    target_percentage: float
    current_percentage: float = 0.0
    difference: float = 0.0
    
    def to_dict(self):
        return {
            "asset_type": self.asset_type.value,
            "target_percentage": self.target_percentage,
            "current_percentage": self.current_percentage,
            "difference": self.difference
        }


class AssetManager:
    """Main asset management system for Holdings Depot"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the Asset Manager system"""
        if data_dir is None:
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.assets_file = os.path.join(self.data_dir, "assets.json")
        self.allocations_file = os.path.join(self.data_dir, "portfolio_allocations.json")
        self.performance_file = os.path.join(self.data_dir, "asset_performance.json")
        
        self.assets: Dict[str, Asset] = {}
        self.target_allocations: Dict[AssetType, float] = {}
        self.performance_history: Dict[str, List[Dict]] = {}
        
        self._load_data()
        self._init_default_allocations()
    
    def _load_data(self):
        """Load assets, allocations, and performance from JSON files"""
        # Load assets
        if os.path.exists(self.assets_file):
            try:
                with open(self.assets_file, 'r') as f:
                    data = json.load(f)
                    for asset_data in data:
                        asset = Asset(
                            id=asset_data["id"],
                            name=asset_data["name"],
                            asset_type=AssetType(asset_data["asset_type"]),
                            status=AssetStatus(asset_data["status"]),
                            current_value=asset_data["current_value"],
                            purchase_value=asset_data["purchase_value"],
                            quantity=asset_data.get("quantity", 1.0),
                            currency=asset_data.get("currency", "USD"),
                            purchase_date=asset_data.get("purchase_date", ""),
                            last_updated=asset_data.get("last_updated", ""),
                            risk_level=RiskLevel(asset_data.get("risk_level", "medium")),
                            description=asset_data.get("description", ""),
                            metadata=asset_data.get("metadata", {})
                        )
                        self.assets[asset.id] = asset
            except Exception as e:
                print(f"Error loading assets: {e}")
        
        # Load target allocations
        if os.path.exists(self.allocations_file):
            try:
                with open(self.allocations_file, 'r') as f:
                    data = json.load(f)
                    self.target_allocations = {
                        AssetType(key): value 
                        for key, value in data.items()
                    }
            except Exception as e:
                print(f"Error loading allocations: {e}")
        
        # Load performance history
        if os.path.exists(self.performance_file):
            try:
                with open(self.performance_file, 'r') as f:
                    self.performance_history = json.load(f)
            except Exception as e:
                print(f"Error loading performance history: {e}")
    
    def _save_data(self):
        """Save assets, allocations, and performance to JSON files"""
        try:
            # Save assets
            assets_data = [asset.to_dict() for asset in self.assets.values()]
            with open(self.assets_file, 'w') as f:
                json.dump(assets_data, f, indent=2)
            
            # Save target allocations
            allocations_data = {
                asset_type.value: percentage 
                for asset_type, percentage in self.target_allocations.items()
            }
            with open(self.allocations_file, 'w') as f:
                json.dump(allocations_data, f, indent=2)
            
            # Save performance history
            with open(self.performance_file, 'w') as f:
                json.dump(self.performance_history, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def _init_default_allocations(self):
        """Initialize default portfolio allocations"""
        if not self.target_allocations:
            self.target_allocations = {
                AssetType.CRYPTOCURRENCY: 20.0,  # 20% crypto
                AssetType.STOCKS: 30.0,        # 30% stocks
                AssetType.REAL_ESTATE: 25.0,   # 25% real estate
                AssetType.DIGITAL_ASSETS: 15.0, # 15% digital assets
                AssetType.CASH: 5.0,           # 5% cash
                AssetType.INTELLECTUAL_PROPERTY: 5.0  # 5% IP
            }
            self._save_data()
    
    def add_asset(self, asset: Asset) -> bool:
        """Add a new asset to the portfolio"""
        if asset.id in self.assets:
            return False
        
        self.assets[asset.id] = asset
        
        # Initialize performance history
        self.performance_history[asset.id] = [{
            "date": asset.purchase_date,
            "value": asset.current_value,
            "roi": asset.roi_percentage
        }]
        
        self._save_data()
        return True
    
    def update_asset_value(self, asset_id: str, new_value: float) -> bool:
        """Update the current value of an asset"""
        if asset_id not in self.assets:
            return False
        
        self.assets[asset_id].current_value = new_value
        self.assets[asset_id].last_updated = datetime.now().isoformat()
        
        # Add to performance history
        self.performance_history[asset_id].append({
            "date": datetime.now().isoformat(),
            "value": new_value,
            "roi": self.assets[asset_id].roi_percentage
        })
        
        self._save_data()
        return True
    
    def update_asset_status(self, asset_id: str, new_status: AssetStatus) -> bool:
        """Update the status of an asset"""
        if asset_id not in self.assets:
            return False
        
        self.assets[asset_id].status = new_status
        self.assets[asset_id].last_updated = datetime.now().isoformat()
        self._save_data()
        return True
    
    def get_assets_by_type(self, asset_type: AssetType) -> List[Asset]:
        """Get all assets of a specific type"""
        return [asset for asset in self.assets.values() if asset.asset_type == asset_type]
    
    def get_assets_by_status(self, status: AssetStatus) -> List[Asset]:
        """Get all assets with a specific status"""
        return [asset for asset in self.assets.values() if asset.status == status]
    
    def get_assets_by_risk(self, risk_level: RiskLevel) -> List[Asset]:
        """Get all assets with a specific risk level"""
        return [asset for asset in self.assets.values() if asset.risk_level == risk_level]
    
    def calculate_portfolio_value(self) -> float:
        """Calculate total portfolio value"""
        return sum(asset.total_value for asset in self.assets.values() if asset.status == AssetStatus.ACTIVE)
    
    def calculate_portfolio_roi(self) -> float:
        """Calculate overall portfolio ROI"""
        active_assets = [asset for asset in self.assets.values() if asset.status == AssetStatus.ACTIVE]
        if not active_assets:
            return 0.0
        
        total_current_value = sum(asset.total_value for asset in active_assets)
        total_purchase_value = sum(asset.purchase_value * asset.quantity for asset in active_assets)
        
        if total_purchase_value == 0:
            return 0.0
        
        return ((total_current_value - total_purchase_value) / total_purchase_value) * 100
    
    def calculate_current_allocations(self) -> Dict[AssetType, float]:
        """Calculate current portfolio allocations by asset type"""
        total_value = self.calculate_portfolio_value()
        if total_value == 0:
            return {}
        
        allocations = {}
        for asset_type in AssetType:
            type_assets = self.get_assets_by_type(asset_type)
            type_value = sum(asset.total_value for asset in type_assets if asset.status == AssetStatus.ACTIVE)
            allocations[asset_type] = (type_value / total_value) * 100 if total_value > 0 else 0.0
        
        return allocations
    
    def generate_rebalancing_recommendations(self) -> List[PortfolioAllocation]:
        """Generate portfolio rebalancing recommendations"""
        current_allocations = self.calculate_current_allocations()
        recommendations = []
        
        for asset_type in AssetType:
            target = self.target_allocations.get(asset_type, 0.0)
            current = current_allocations.get(asset_type, 0.0)
            difference = current - target
            
            recommendations.append(PortfolioAllocation(
                asset_type=asset_type,
                target_percentage=target,
                current_percentage=current,
                difference=difference
            ))
        
        return sorted(recommendations, key=lambda x: abs(x.difference), reverse=True)
    
    def analyze_asset_performance(self, days: int = 30) -> Dict:
        """Analyze asset performance over the past N days"""
        cutoff_date = (date.today() - timedelta(days=days)).isoformat()
        performance_data = {}
        
        for asset_id, history in self.performance_history.items():
            if asset_id not in self.assets:
                continue
            
            recent_history = [record for record in history if record["date"] >= cutoff_date]
            if len(recent_history) < 2:
                continue
            
            asset = self.assets[asset_id]
            oldest_value = recent_history[0]["value"]
            newest_value = recent_history[-1]["value"]
            
            performance_data[asset_id] = {
                "name": asset.name,
                "asset_type": asset.asset_type.value,
                "start_value": oldest_value,
                "end_value": newest_value,
                "value_change": newest_value - oldest_value,
                "percentage_change": ((newest_value - oldest_value) / oldest_value * 100) if oldest_value > 0 else 0,
                "current_roi": asset.roi_percentage,
                "risk_level": asset.risk_level.value
            }
        
        return performance_data
    
    def get_top_performers(self, limit: int = 5) -> List[Dict]:
        """Get top performing assets"""
        performance = self.analyze_asset_performance(30)
        sorted_performance = sorted(
            performance.values(),
            key=lambda x: x["percentage_change"],
            reverse=True
        )
        return sorted_performance[:limit]
    
    def get_underperformers(self, limit: int = 5) -> List[Dict]:
        """Get underperforming assets"""
        performance = self.analyze_asset_performance(30)
        sorted_performance = sorted(
            performance.values(),
            key=lambda x: x["percentage_change"]
        )
        return sorted_performance[:limit]
    
    def generate_portfolio_report(self) -> Dict:
        """Generate a comprehensive portfolio report"""
        total_value = self.calculate_portfolio_value()
        total_roi = self.calculate_portfolio_roi()
        current_allocations = self.calculate_current_allocations()
        rebalancing_recommendations = self.generate_rebalancing_recommendations()
        
        # Asset type breakdown
        asset_type_breakdown = {}
        for asset_type in AssetType:
            type_assets = self.get_assets_by_type(asset_type)
            active_type_assets = [a for a in type_assets if a.status == AssetStatus.ACTIVE]
            if active_type_assets:
                type_value = sum(asset.total_value for asset in active_type_assets)
                asset_type_breakdown[asset_type.value] = {
                    "count": len(active_type_assets),
                    "total_value": type_value,
                    "percentage": (type_value / total_value * 100) if total_value > 0 else 0,
                    "average_roi": sum(asset.roi_percentage for asset in active_type_assets) / len(active_type_assets)
                }
        
        # Risk analysis
        risk_breakdown = {}
        for risk_level in RiskLevel:
            risk_assets = self.get_assets_by_risk(risk_level)
            active_risk_assets = [a for a in risk_assets if a.status == AssetStatus.ACTIVE]
            if active_risk_assets:
                risk_value = sum(asset.total_value for asset in active_risk_assets)
                risk_breakdown[risk_level.value] = {
                    "count": len(active_risk_assets),
                    "total_value": risk_value,
                    "percentage": (risk_value / total_value * 100) if total_value > 0 else 0
                }
        
        return {
            "report_date": datetime.now().isoformat(),
            "portfolio_summary": {
                "total_value": round(total_value, 2),
                "total_roi_percentage": round(total_roi, 2),
                "total_assets": len([a for a in self.assets.values() if a.status == AssetStatus.ACTIVE]),
                "asset_types": len(asset_type_breakdown)
            },
            "asset_type_breakdown": asset_type_breakdown,
            "risk_analysis": risk_breakdown,
            "current_allocations": {k.value: v for k, v in current_allocations.items()},
            "target_allocations": {k.value: v for k, v in self.target_allocations.items()},
            "rebalancing_recommendations": [rec.to_dict() for rec in rebalancing_recommendations],
            "top_performers": self.get_top_performers(3),
            "underperformers": self.get_underperformers(3),
            "performance_analysis": self.analyze_asset_performance(30)
        }
    
    def generate_risk_assessment(self) -> Dict:
        """Generate risk assessment for the portfolio"""
        active_assets = [asset for asset in self.assets.values() if asset.status == AssetStatus.ACTIVE]
        
        if not active_assets:
            return {"message": "No active assets in portfolio"}
        
        # Calculate risk metrics
        high_risk_value = sum(asset.total_value for asset in active_assets if asset.risk_level == RiskLevel.HIGH)
        speculative_value = sum(asset.total_value for asset in active_assets if asset.risk_level == RiskLevel.SPECULATIVE)
        total_value = sum(asset.total_value for asset in active_assets)
        
        high_risk_percentage = (high_risk_value / total_value * 100) if total_value > 0 else 0
        speculative_percentage = (speculative_value / total_value * 100) if total_value > 0 else 0
        
        # Risk assessment
        risk_score = 0
        if high_risk_percentage > 30:
            risk_score += 2
        elif high_risk_percentage > 15:
            risk_score += 1
        
        if speculative_percentage > 20:
            risk_score += 2
        elif speculative_percentage > 10:
            risk_score += 1
        
        risk_level = "LOW"
        if risk_score >= 3:
            risk_level = "HIGH"
        elif risk_score >= 1:
            risk_level = "MEDIUM"
        
        # Recommendations
        recommendations = []
        if high_risk_percentage > 30:
            recommendations.append("Consider reducing high-risk asset allocation")
        if speculative_percentage > 20:
            recommendations.append("Consider reducing speculative asset allocation")
        if risk_level == "HIGH":
            recommendations.append("Portfolio risk is elevated - review diversification")
        
        return {
            "assessment_date": datetime.now().isoformat(),
            "overall_risk_level": risk_level,
            "risk_score": risk_score,
            "high_risk_percentage": round(high_risk_percentage, 2),
            "speculative_percentage": round(speculative_percentage, 2),
            "risk_breakdown": {
                "low": len([a for a in active_assets if a.risk_level == RiskLevel.LOW]),
                "medium": len([a for a in active_assets if a.risk_level == RiskLevel.MEDIUM]),
                "high": len([a for a in active_assets if a.risk_level == RiskLevel.HIGH]),
                "speculative": len([a for a in active_assets if a.risk_level == RiskLevel.SPECULATIVE])
            },
            "recommendations": recommendations
        }


def main():
    """Example usage of the Holdings Asset Manager system"""
    manager = AssetManager()
    
    print("=== Holdings Depot - Asset Manager ===")
    print()
    
    # Example: Add an asset
    sample_asset = Asset(
        id=f"asset_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        name="Bitcoin Holdings",
        asset_type=AssetType.CRYPTOCURRENCY,
        status=AssetStatus.ACTIVE,
        current_value=45000.0,
        purchase_value=40000.0,
        quantity=1.0,
        currency="USD",
        risk_level=RiskLevel.HIGH,
        description="Primary cryptocurrency holdings"
    )
    
    if manager.add_asset(sample_asset):
        print(f"Added asset: {sample_asset.name} - ${sample_asset.current_value}")
    print()
    
    # Generate portfolio report
    report = manager.generate_portfolio_report()
    print("=== Portfolio Report ===")
    print(json.dumps(report, indent=2))
    print()
    
    # Risk assessment
    risk_assessment = manager.generate_risk_assessment()
    print("=== Risk Assessment ===")
    print(json.dumps(risk_assessment, indent=2))


# Export main classes for module import
__all__ = [
    'AssetManager',
    'Asset',
    'PortfolioAllocation',
    'AssetType',
    'AssetStatus',
    'RiskLevel'
]


if __name__ == "__main__":
    main()
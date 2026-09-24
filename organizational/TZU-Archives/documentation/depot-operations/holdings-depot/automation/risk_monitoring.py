#!/usr/bin/env python3
"""
Risk Monitoring Automation Script
Automates risk assessment, monitoring, and alert generation for portfolio assets.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import statistics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/risk_monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class RiskLevel(Enum):
    """Risk severity levels."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class RiskType(Enum):
    """Types of risks to monitor."""
    MARKET = "market"
    CREDIT = "credit"
    LIQUIDITY = "liquidity"
    OPERATIONAL = "operational"
    CONCENTRATION = "concentration"
    VOLATILITY = "volatility"


@dataclass
class RiskAlert:
    """Represents a risk alert."""
    asset_symbol: str
    risk_type: RiskType
    risk_level: RiskLevel
    current_value: float
    threshold_value: float
    message: str
    timestamp: datetime
    recommended_action: str


@dataclass
class AssetRiskProfile:
    """Risk profile for a single asset."""
    symbol: str
    volatility: float
    beta: float
    max_drawdown: float
    concentration_risk: float
    liquidity_score: float
    overall_risk_score: float


class RiskMonitor:
    """Automated risk monitoring system."""
    
    def __init__(self, config_file: str = 'risk_config.json'):
        """Initialize the risk monitor with configuration."""
        self.config = self._load_config(config_file)
        self.risk_profiles: Dict[str, AssetRiskProfile] = {}
        self.alerts: List[RiskAlert] = []
        
        # Risk thresholds from operations manual
        self.risk_thresholds = {
            RiskLevel.LOW: 0.3,
            RiskLevel.MEDIUM: 0.5,
            RiskLevel.HIGH: 0.7,
            RiskLevel.CRITICAL: 0.9
        }
        
    def _load_config(self, config_file: str) -> Dict:
        """Load risk configuration from JSON file."""
        try:
            config_path = f"config/{config_file}"
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {config_file} not found, using defaults")
            return {
                'max_volatility': 0.4,
                'max_beta': 2.0,
                'max_drawdown': 0.3,
                'max_concentration': 0.25,
                'min_liquidity': 0.7
            }
    
    def calculate_volatility(self, returns: List[float]) -> float:
        """Calculate volatility (standard deviation of returns)."""
        if len(returns) < 2:
            return 0.0
        return statistics.stdev(returns)
    
    def calculate_beta(self, asset_returns: List[float], market_returns: List[float]) -> float:
        """Calculate beta (covariance with market divided by market variance)."""
        if len(asset_returns) != len(market_returns) or len(asset_returns) < 2:
            return 1.0  # Default to market beta
        
        covariance = statistics.covariance(asset_returns, market_returns)
        market_variance = statistics.variance(market_returns)
        
        return covariance / market_variance if market_variance > 0 else 1.0
    
    def calculate_max_drawdown(self, prices: List[float]) -> float:
        """Calculate maximum drawdown from peak."""
        if not prices:
            return 0.0
        
        peak = prices[0]
        max_drawdown = 0.0
        
        for price in prices:
            if price > peak:
                peak = price
            drawdown = (peak - price) / peak if peak > 0 else 0.0
            max_drawdown = max(max_drawdown, drawdown)
        
        return max_drawdown
    
    def assess_concentration_risk(self, asset_value: float, total_portfolio_value: float) -> float:
        """Calculate concentration risk as percentage of total portfolio."""
        if total_portfolio_value == 0:
            return 0.0
        return asset_value / total_portfolio_value
    
    def calculate_liquidity_score(self, daily_volume: float, position_size: float) -> float:
        """Calculate liquidity score based on volume relative to position."""
        if daily_volume == 0:
            return 0.0
        return min(1.0, (daily_volume / position_size) * 0.1)  # Simplified calculation
    
    def generate_risk_profile(self, asset_data: Dict) -> AssetRiskProfile:
        """Generate comprehensive risk profile for an asset."""
        symbol = asset_data['symbol']
        
        # Calculate individual risk metrics
        volatility = self.calculate_volatility(asset_data.get('returns', [0.0]))
        beta = self.calculate_beta(
            asset_data.get('returns', [0.0]),
            asset_data.get('market_returns', [0.0])
        )
        max_drawdown = self.calculate_max_drawdown(asset_data.get('prices', [0.0]))
        concentration_risk = self.assess_concentration_risk(
            asset_data['value'],
            asset_data['total_portfolio_value']
        )
        liquidity_score = self.calculate_liquidity_score(
            asset_data.get('daily_volume', 0.0),
            asset_data['value']
        )
        
        # Calculate overall risk score (weighted average)
        overall_risk_score = (
            volatility * 0.3 +
            (beta / 2.0) * 0.2 +  # Normalize beta
            max_drawdown * 0.2 +
            concentration_risk * 0.2 +
            (1 - liquidity_score) * 0.1
        )
        
        return AssetRiskProfile(
            symbol=symbol,
            volatility=volatility,
            beta=beta,
            max_drawdown=max_drawdown,
            concentration_risk=concentration_risk,
            liquidity_score=liquidity_score,
            overall_risk_score=overall_risk_score
        )
    
    def check_risk_thresholds(self, profile: AssetRiskProfile) -> List[RiskAlert]:
        """Check if risk metrics exceed thresholds and generate alerts."""
        alerts = []
        
        # Volatility check
        if profile.volatility > self.config.get('max_volatility', 0.4):
            risk_level = self._determine_risk_level(profile.volatility, 0.4)
            alerts.append(RiskAlert(
                asset_symbol=profile.symbol,
                risk_type=RiskType.VOLATILITY,
                risk_level=risk_level,
                current_value=profile.volatility,
                threshold_value=self.config.get('max_volatility', 0.4),
                message=f"Volatility exceeds threshold: {profile.volatility:.2%}",
                timestamp=datetime.now(),
                recommended_action="Consider reducing position or adding hedges"
            ))
        
        # Beta check
        if abs(profile.beta) > self.config.get('max_beta', 2.0):
            risk_level = self._determine_risk_level(abs(profile.beta), 2.0)
            alerts.append(RiskAlert(
                asset_symbol=profile.symbol,
                risk_type=RiskType.MARKET,
                risk_level=risk_level,
                current_value=abs(profile.beta),
                threshold_value=self.config.get('max_beta', 2.0),
                message=f"Beta exceeds threshold: {profile.beta:.2f}",
                timestamp=datetime.now(),
                recommended_action="Review market exposure and correlation"
            ))
        
        # Drawdown check
        if profile.max_drawdown > self.config.get('max_drawdown', 0.3):
            risk_level = self._determine_risk_level(profile.max_drawdown, 0.3)
            alerts.append(RiskAlert(
                asset_symbol=profile.symbol,
                risk_type=RiskType.MARKET,
                risk_level=risk_level,
                current_value=profile.max_drawdown,
                threshold_value=self.config.get('max_drawdown', 0.3),
                message=f"Maximum drawdown exceeds threshold: {profile.max_drawdown:.2%}",
                timestamp=datetime.now(),
                recommended_action="Review stop-loss levels and position sizing"
            ))
        
        # Concentration check
        if profile.concentration_risk > self.config.get('max_concentration', 0.25):
            risk_level = self._determine_risk_level(profile.concentration_risk, 0.25)
            alerts.append(RiskAlert(
                asset_symbol=profile.symbol,
                risk_type=RiskType.CONCENTRATION,
                risk_level=risk_level,
                current_value=profile.concentration_risk,
                threshold_value=self.config.get('max_concentration', 0.25),
                message=f"Concentration risk exceeds threshold: {profile.concentration_risk:.2%}",
                timestamp=datetime.now(),
                recommended_action="Consider diversifying or reducing position size"
            ))
        
        # Liquidity check
        if profile.liquidity_score < self.config.get('min_liquidity', 0.7):
            risk_level = self._determine_risk_level(1 - profile.liquidity_score, 0.3)
            alerts.append(RiskAlert(
                asset_symbol=profile.symbol,
                risk_type=RiskType.LIQUIDITY,
                risk_level=risk_level,
                current_value=profile.liquidity_score,
                threshold_value=self.config.get('min_liquidity', 0.7),
                message=f"Liquidity score below threshold: {profile.liquidity_score:.2%}",
                timestamp=datetime.now(),
                recommended_action="Review exit strategy and position sizing"
            ))
        
        return alerts
    
    def _determine_risk_level(self, current_value: float, threshold: float) -> RiskLevel:
        """Determine risk level based on how much value exceeds threshold."""
        ratio = current_value / threshold if threshold > 0 else 1.0
        
        if ratio < 1.2:
            return RiskLevel.LOW
        elif ratio < 1.5:
            return RiskLevel.MEDIUM
        elif ratio < 2.0:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL
    
    def monitor_portfolio(self, portfolio_data: Dict) -> Dict:
        """Monitor entire portfolio for risks."""
        logger.info("Starting portfolio risk monitoring")
        
        results = {
            'timestamp': datetime.now().isoformat(),
            'total_assets_monitored': 0,
            'risk_profiles': {},
            'alerts': [],
            'summary': {}
        }
        
        for asset_data in portfolio_data['assets']:
            # Generate risk profile
            profile = self.generate_risk_profile(asset_data)
            self.risk_profiles[profile.symbol] = profile
            results['risk_profiles'][profile.symbol] = {
                'volatility': profile.volatility,
                'beta': profile.beta,
                'max_drawdown': profile.max_drawdown,
                'concentration_risk': profile.concentration_risk,
                'liquidity_score': profile.liquidity_score,
                'overall_risk_score': profile.overall_risk_score
            }
            
            # Check for risk alerts
            alerts = self.check_risk_thresholds(profile)
            self.alerts.extend(alerts)
            
            for alert in alerts:
                results['alerts'].append({
                    'asset_symbol': alert.asset_symbol,
                    'risk_type': alert.risk_type.value,
                    'risk_level': alert.risk_level.name,
                    'current_value': alert.current_value,
                    'threshold_value': alert.threshold_value,
                    'message': alert.message,
                    'timestamp': alert.timestamp.isoformat(),
                    'recommended_action': alert.recommended_action
                })
            
            results['total_assets_monitored'] += 1
        
        # Generate summary
        results['summary'] = self._generate_summary()
        
        logger.info(f"Risk monitoring complete. {len(self.alerts)} alerts generated")
        return results
    
    def _generate_summary(self) -> Dict:
        """Generate summary of risk monitoring results."""
        if not self.risk_profiles:
            return {}
        
        avg_risk_score = statistics.mean(p.overall_risk_score for p in self.risk_profiles.values())
        
        alert_counts = {level.name: 0 for level in RiskLevel}
        for alert in self.alerts:
            alert_counts[alert.risk_level.name] += 1
        
        return {
            'average_risk_score': avg_risk_score,
            'total_alerts': len(self.alerts),
            'alert_breakdown': alert_counts,
            'highest_risk_asset': max(self.risk_profiles.values(), key=lambda p: p.overall_risk_score).symbol if self.risk_profiles else None
        }
    
    def generate_report(self, results: Dict) -> str:
        """Generate human-readable risk monitoring report."""
        report = []
        report.append("=" * 70)
        report.append("RISK MONITORING REPORT")
        report.append("=" * 70)
        report.append(f"Timestamp: {results['timestamp']}")
        report.append(f"Total Assets Monitored: {results['total_assets_monitored']}")
        report.append("")
        
        # Summary
        summary = results['summary']
        report.append("SUMMARY:")
        report.append("-" * 70)
        report.append(f"Average Risk Score: {summary['average_risk_score']:.2%}")
        report.append(f"Total Alerts: {summary['total_alerts']}")
        report.append(f"Highest Risk Asset: {summary['highest_risk_asset']}")
        report.append("")
        
        # Alert breakdown
        report.append("ALERT BREAKDOWN:")
        report.append("-" * 70)
        for level, count in summary['alert_breakdown'].items():
            if count > 0:
                report.append(f"{level}: {count}")
        report.append("")
        
        # Risk alerts
        if results['alerts']:
            report.append("RISK ALERTS:")
            report.append("-" * 70)
            for alert in results['alerts']:
                risk_symbol = "!" if alert['risk_level'] == 'CRITICAL' else ("⚠" if alert['risk_level'] == 'HIGH' else "•")
                report.append(f"{risk_symbol} {alert['asset_symbol']:<10} {alert['risk_type'].upper():<15} {alert['risk_level']}")
                report.append(f"   {alert['message']}")
                report.append(f"   Recommended: {alert['recommended_action']}")
                report.append("")
        else:
            report.append("No risk alerts generated.")
        
        report.append("=" * 70)
        return "\n".join(report)


def main():
    """Main execution function."""
    # Initialize risk monitor
    monitor = RiskMonitor()
    
    # Create sample portfolio data
    sample_portfolio = {
        "assets": [
            {
                "symbol": "AAPL",
                "value": 50000,
                "total_portfolio_value": 200000,
                "returns": [0.02, -0.01, 0.03, -0.02, 0.01, 0.04, -0.03],
                "market_returns": [0.01, 0.00, 0.02, -0.01, 0.01, 0.02, -0.01],
                "prices": [150, 152, 149, 155, 153, 158, 156],
                "daily_volume": 50000000
            },
            {
                "symbol": "BTC",
                "value": 80000,
                "total_portfolio_value": 200000,
                "returns": [0.05, -0.08, 0.10, -0.05, 0.07, -0.03, 0.12],
                "market_returns": [0.01, 0.00, 0.02, -0.01, 0.01, 0.02, -0.01],
                "prices": [45000, 48000, 44000, 52000, 49000, 53000, 51000],
                "daily_volume": 1000000000
            },
            {
                "symbol": "EMERGING",
                "value": 30000,
                "total_portfolio_value": 200000,
                "returns": [0.08, -0.12, 0.15, -0.10, 0.12, -0.08, 0.18],
                "market_returns": [0.01, 0.00, 0.02, -0.01, 0.01, 0.02, -0.01],
                "prices": [100, 108, 95, 115, 103, 120, 110],
                "daily_volume": 5000000
            }
        ]
    }
    
    # Monitor portfolio
    results = monitor.monitor_portfolio(sample_portfolio)
    
    # Generate and display report
    report = monitor.generate_report(results)
    print(report)
    
    # Save results
    with open('results/risk_monitoring_results.json', 'w') as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    main()
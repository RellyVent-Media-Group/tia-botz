#!/usr/bin/env python3
"""
Portfolio Rebalancing Automation Script
Automates portfolio rebalancing based on target allocations and current market conditions.
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/portfolio_rebalancing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class Asset:
    """Represents a single asset in the portfolio."""
    symbol: str
    current_value: float
    target_allocation: float  # Percentage (0-100)
    current_allocation: float  # Percentage (0-100)
    asset_class: str


@dataclass
class RebalanceAction:
    """Represents a rebalancing action to be taken."""
    symbol: str
    action: str  # 'buy' or 'sell'
    amount: float
    reason: str


class PortfolioRebalancer:
    """Automated portfolio rebalancing system."""
    
    def __init__(self, config_file: str = 'portfolio_config.json'):
        """Initialize the rebalancer with configuration."""
        self.config = self._load_config(config_file)
        self.portfolio: Dict[str, Asset] = {}
        self.rebalance_threshold = self.config.get('rebalance_threshold', 5.0)  # 5% deviation
        self.min_trade_size = self.config.get('min_trade_size', 1000.0)  # Minimum trade size
        
    def _load_config(self, config_file: str) -> Dict:
        """Load portfolio configuration from JSON file."""
        try:
            config_path = f"config/{config_file}"
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {config_file} not found, using defaults")
            return {
                'rebalance_threshold': 5.0,
                'min_trade_size': 1000.0,
                'max_position_size': 100000.0
            }
    
    def load_portfolio_data(self, portfolio_file: str) -> None:
        """Load current portfolio data from file."""
        try:
            data_path = f"data/{portfolio_file}"
            with open(data_path, 'r') as f:
                data = json.load(f)
                
            total_value = sum(asset['current_value'] for asset in data['assets'])
            
            for asset_data in data['assets']:
                symbol = asset_data['symbol']
                current_value = asset_data['current_value']
                target_allocation = asset_data['target_allocation']
                current_allocation = (current_value / total_value) * 100
                asset_class = asset_data.get('asset_class', 'unknown')
                
                self.portfolio[symbol] = Asset(
                    symbol=symbol,
                    current_value=current_value,
                    target_allocation=target_allocation,
                    current_allocation=current_allocation,
                    asset_class=asset_class
                )
            
            logger.info(f"Loaded {len(self.portfolio)} assets from portfolio")
            
        except Exception as e:
            logger.error(f"Error loading portfolio data: {e}")
            raise
    
    def calculate_rebalance_actions(self) -> List[RebalanceAction]:
        """Calculate required rebalancing actions."""
        actions = []
        total_value = sum(asset.current_value for asset in self.portfolio.values())
        
        for asset in self.portfolio.values():
            deviation = asset.current_allocation - asset.target_allocation
            
            # Check if rebalancing is needed
            if abs(deviation) > self.rebalance_threshold:
                target_value = (asset.target_allocation / 100) * total_value
                adjustment = target_value - asset.current_value
                
                # Check if adjustment meets minimum trade size
                if abs(adjustment) >= self.min_trade_size:
                    action = 'buy' if adjustment > 0 else 'sell'
                    reason = f"Deviation of {deviation:.2f}% from target {asset.target_allocation}%"
                    
                    actions.append(RebalanceAction(
                        symbol=asset.symbol,
                        action=action,
                        amount=abs(adjustment),
                        reason=reason
                    ))
        
        logger.info(f"Calculated {len(actions)} rebalancing actions")
        return actions
    
    def validate_actions(self, actions: List[RebalanceAction]) -> List[RebalanceAction]:
        """Validate rebalancing actions against constraints."""
        valid_actions = []
        
        for action in actions:
            # Check maximum position size
            if action.amount > self.config.get('max_position_size', 100000.0):
                logger.warning(f"Action {action.symbol} exceeds max position size, skipping")
                continue
            
            # Check for sufficient liquidity (simplified)
            if action.action == 'sell' and action.amount > self.portfolio[action.symbol].current_value:
                logger.warning(f"Cannot sell more than current position for {action.symbol}")
                continue
            
            valid_actions.append(action)
        
        return valid_actions
    
    def execute_rebalancing(self, dry_run: bool = True) -> Dict:
        """Execute the rebalancing process."""
        logger.info("Starting portfolio rebalancing process")
        
        try:
            # Calculate actions
            actions = self.calculate_rebalance_actions()
            
            # Validate actions
            valid_actions = self.validate_actions(actions)
            
            # Prepare results
            results = {
                'timestamp': datetime.now().isoformat(),
                'total_actions': len(valid_actions),
                'actions': [],
                'dry_run': dry_run
            }
            
            for action in valid_actions:
                action_data = {
                    'symbol': action.symbol,
                    'action': action.action,
                    'amount': action.amount,
                    'reason': action.reason
                }
                
                if not dry_run:
                    # Here you would integrate with your trading platform
                    logger.info(f"Executing {action.action} ${action.amount:.2f} of {action.symbol}")
                    # execute_trade(action.symbol, action.action, action.amount)
                else:
                    logger.info(f"[DRY RUN] Would {action.action} ${action.amount:.2f} of {action.symbol}")
                
                results['actions'].append(action_data)
            
            logger.info(f"Rebalancing complete. {len(valid_actions)} actions processed")
            return results
            
        except Exception as e:
            logger.error(f"Error during rebalancing: {e}")
            raise
    
    def generate_report(self, results: Dict) -> str:
        """Generate a human-readable rebalancing report."""
        report = []
        report.append("=" * 60)
        report.append("PORTFOLIO REBALANCING REPORT")
        report.append("=" * 60)
        report.append(f"Timestamp: {results['timestamp']}")
        report.append(f"Total Actions: {results['total_actions']}")
        report.append(f"Mode: {'DRY RUN' if results['dry_run'] else 'LIVE'}")
        report.append("")
        
        if results['actions']:
            report.append("REBALANCING ACTIONS:")
            report.append("-" * 60)
            for action in results['actions']:
                report.append(f"{action['action'].upper():<6} ${action['amount']:>10.2f} {action['symbol']:<10} - {action['reason']}")
        else:
            report.append("No rebalancing actions required.")
        
        report.append("=" * 60)
        return "\n".join(report)


def main():
    """Main execution function."""
    # Initialize rebalancer
    rebalancer = PortfolioRebalancer()
    
    # Load portfolio data (you would create this file with your actual data)
    # rebalancer.load_portfolio_data('portfolio_data.json')
    
    # For demonstration, create sample portfolio
    sample_portfolio = {
        "assets": [
            {"symbol": "AAPL", "current_value": 50000, "target_allocation": 25, "asset_class": "equity"},
            {"symbol": "GOOGL", "current_value": 30000, "target_allocation": 20, "asset_class": "equity"},
            {"symbol": "MSFT", "current_value": 40000, "target_allocation": 25, "asset_class": "equity"},
            {"symbol": "BND", "current_value": 20000, "target_allocation": 15, "asset_class": "fixed_income"},
            {"symbol": "GLD", "current_value": 10000, "target_allocation": 15, "asset_class": "commodities"}
        ]
    }
    
    # Save sample data for demonstration
    with open('data/portfolio_data.json', 'w') as f:
        json.dump(sample_portfolio, f, indent=2)
    
    # Load and process
    rebalancer.load_portfolio_data('portfolio_data.json')
    
    # Execute rebalancing (dry run by default)
    results = rebalancer.execute_rebalancing(dry_run=True)
    
    # Generate and display report
    report = rebalancer.generate_report(results)
    print(report)
    
    # Save results
    with open('results/rebalancing_results.json', 'w') as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    main()
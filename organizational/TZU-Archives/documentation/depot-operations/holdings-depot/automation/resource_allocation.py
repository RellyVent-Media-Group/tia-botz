#!/usr/bin/env python3
"""
Resource Allocation Automation Script
Automates capital distribution across depots based on priorities and budget rules.
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/resource_allocation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class AllocationPriority(Enum):
    """Priority levels for resource allocation."""
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4


@dataclass
class Depot:
    """Represents a depot that receives resources."""
    depot_id: str
    name: str
    current_allocation: float
    requested_amount: float
    priority: AllocationPriority
    justification: str
    category: str


@dataclass
class AllocationDecision:
    """Represents an allocation decision."""
    depot_id: str
    depot_name: str
    allocated_amount: float
    decision: str  # 'approved', 'partial', 'denied'
    reason: str


class ResourceAllocator:
    """Automated resource allocation system."""
    
    def __init__(self, config_file: str = 'allocation_config.json'):
        """Initialize the allocator with configuration."""
        self.config = self._load_config(config_file)
        self.depots: Dict[str, Depot] = {}
        self.total_budget = self.config.get('total_budget', 1000000.0)
        
        # Capital distribution rules from operations manual
        self.allocation_rules = {
            'emergency_fund': 0.15,  # 15%
            'growth_investment': 0.40,  # 40%
            'operational': 0.30,  # 30%
            'reserve': 0.15  # 15%
        }
        
    def _load_config(self, config_file: str) -> Dict:
        """Load allocation configuration from JSON file."""
        try:
            config_path = f"config/{config_file}"
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {config_file} not found, using defaults")
            return {
                'total_budget': 1000000.0,
                'min_allocation': 10000.0,
                'max_single_allocation': 200000.0
            }
    
    def load_depot_requests(self, requests_file: str) -> None:
        """Load depot resource requests from file."""
        try:
            data_path = f"data/{requests_file}"
            with open(data_path, 'r') as f:
                data = json.load(f)
                
            for request in data['requests']:
                depot_id = request['depot_id']
                self.depots[depot_id] = Depot(
                    depot_id=depot_id,
                    name=request['name'],
                    current_allocation=request.get('current_allocation', 0.0),
                    requested_amount=request['requested_amount'],
                    priority=AllocationPriority[request['priority'].upper()],
                    justification=request['justification'],
                    category=request.get('category', 'general')
                )
            
            logger.info(f"Loaded {len(self.depots)} depot requests")
            
        except Exception as e:
            logger.error(f"Error loading depot requests: {e}")
            raise
    
    def calculate_capital_distribution(self) -> Dict[str, float]:
        """Calculate capital distribution based on rules."""
        distribution = {}
        
        for category, percentage in self.allocation_rules.items():
            amount = self.total_budget * percentage
            distribution[category] = amount
        
        logger.info(f"Capital distribution calculated: {distribution}")
        return distribution
    
    def prioritize_requests(self) -> List[Depot]:
        """Prioritize depot requests based on priority and justification."""
        # Sort by priority (lower number = higher priority)
        prioritized = sorted(
            self.depots.values(),
            key=lambda d: (d.priority.value, -d.requested_amount)
        )
        
        logger.info(f"Prioritized {len(prioritized)} depot requests")
        return prioritized
    
    def evaluate_allocations(self, prioritized_requests: List[Depot]) -> List[AllocationDecision]:
        """Evaluate and make allocation decisions."""
        decisions = []
        available_budget = self.total_budget
        distribution = self.calculate_capital_distribution()
        
        # Track allocations by category
        category_allocations = {cat: 0.0 for cat in self.allocation_rules.keys()}
        
        for depot in prioritized_requests:
            requested = depot.requested_amount
            min_allocation = self.config.get('min_allocation', 10000.0)
            max_single = self.config.get('max_single_allocation', 200000.0)
            
            # Check if category has budget available
            category_budget = distribution.get(depot.category, 0.0)
            category_used = category_allocations.get(depot.category, 0.0)
            category_available = category_budget - category_used
            
            # Determine allocation amount
            if requested <= category_available and requested <= available_budget:
                if requested >= min_allocation:
                    allocated = min(requested, max_single)
                    decision = 'approved'
                    reason = "Full allocation approved within budget"
                else:
                    allocated = 0.0
                    decision = 'denied'
                    reason = "Request below minimum allocation threshold"
            elif category_available > 0 and category_available >= min_allocation:
                allocated = min(category_available, max_single)
                decision = 'partial'
                reason = "Partial allocation due to category budget constraints"
            else:
                allocated = 0.0
                decision = 'denied'
                reason = "No budget available in category"
            
            # Update tracking
            if allocated > 0:
                available_budget -= allocated
                category_allocations[depot.category] = category_allocations.get(depot.category, 0.0) + allocated
            
            decisions.append(AllocationDecision(
                depot_id=depot.depot_id,
                depot_name=depot.name,
                allocated_amount=allocated,
                decision=decision,
                reason=reason
            ))
        
        logger.info(f"Evaluated {len(decisions)} allocation decisions")
        return decisions
    
    def execute_allocations(self, dry_run: bool = True) -> Dict:
        """Execute the allocation process."""
        logger.info("Starting resource allocation process")
        
        try:
            # Prioritize requests
            prioritized = self.prioritize_requests()
            
            # Evaluate allocations
            decisions = self.evaluate_allocations(prioritized)
            
            # Prepare results
            results = {
                'timestamp': datetime.now().isoformat(),
                'total_budget': self.total_budget,
                'total_requests': len(self.depots),
                'decisions': [],
                'dry_run': dry_run,
                'summary': self._calculate_summary(decisions)
            }
            
            for decision in decisions:
                decision_data = {
                    'depot_id': decision.depot_id,
                    'depot_name': decision.depot_name,
                    'allocated_amount': decision.allocated_amount,
                    'decision': decision.decision,
                    'reason': decision.reason
                }
                
                if not dry_run and decision.allocated_amount > 0:
                    # Here you would integrate with your financial systems
                    logger.info(f"Executing allocation of ${decision.allocated_amount:.2f} to {decision.depot_name}")
                    # execute_transfer(decision.depot_id, decision.allocated_amount)
                else:
                    logger.info(f"[DRY RUN] Would allocate ${decision.allocated_amount:.2f} to {decision.depot_name}")
                
                results['decisions'].append(decision_data)
            
            logger.info(f"Allocation complete. {len(decisions)} decisions processed")
            return results
            
        except Exception as e:
            logger.error(f"Error during allocation: {e}")
            raise
    
    def _calculate_summary(self, decisions: List[AllocationDecision]) -> Dict:
        """Calculate summary statistics."""
        approved = sum(d.allocated_amount for d in decisions if d.decision == 'approved')
        partial = sum(d.allocated_amount for d in decisions if d.decision == 'partial')
        total_allocated = approved + partial
        
        return {
            'total_allocated': total_allocated,
            'approved_count': sum(1 for d in decisions if d.decision == 'approved'),
            'partial_count': sum(1 for d in decisions if d.decision == 'partial'),
            'denied_count': sum(1 for d in decisions if d.decision == 'denied'),
            'allocation_rate': (total_allocated / self.total_budget) * 100 if self.total_budget > 0 else 0
        }
    
    def generate_report(self, results: Dict) -> str:
        """Generate a human-readable allocation report."""
        report = []
        report.append("=" * 70)
        report.append("RESOURCE ALLOCATION REPORT")
        report.append("=" * 70)
        report.append(f"Timestamp: {results['timestamp']}")
        report.append(f"Total Budget: ${results['total_budget']:,.2f}")
        report.append(f"Total Requests: {results['total_requests']}")
        report.append(f"Mode: {'DRY RUN' if results['dry_run'] else 'LIVE'}")
        report.append("")
        
        # Summary
        summary = results['summary']
        report.append("SUMMARY:")
        report.append("-" * 70)
        report.append(f"Total Allocated: ${summary['total_allocated']:,.2f}")
        report.append(f"Approved Requests: {summary['approved_count']}")
        report.append(f"Partial Allocations: {summary['partial_count']}")
        report.append(f"Denied Requests: {summary['denied_count']}")
        report.append(f"Allocation Rate: {summary['allocation_rate']:.1f}%")
        report.append("")
        
        # Decisions
        report.append("ALLOCATION DECISIONS:")
        report.append("-" * 70)
        for decision in results['decisions']:
            status_symbol = "✓" if decision['decision'] == 'approved' else ("~" if decision['decision'] == 'partial' else "✗")
            report.append(f"{status_symbol} {decision['depot_name']:<30} {decision['decision'].upper():<10} ${decision['allocated_amount']:>10,.2f}")
            report.append(f"   Reason: {decision['reason']}")
            report.append("")
        
        report.append("=" * 70)
        return "\n".join(report)


def main():
    """Main execution function."""
    # Initialize allocator
    allocator = ResourceAllocator()
    
    # Create sample depot requests
    sample_requests = {
        "requests": [
            {
                "depot_id": "TZI.CNS.DEP.CONSORT",
                "name": "Consort Depot",
                "current_allocation": 150000,
                "requested_amount": 200000,
                "priority": "HIGH",
                "justification": "Content production equipment upgrade",
                "category": "growth_investment"
            },
            {
                "depot_id": "TZI.SCR.DEP.SCRIBE",
                "name": "Scribe Depot",
                "current_allocation": 100000,
                "requested_amount": 50000,
                "priority": "MEDIUM",
                "justification": "Documentation system maintenance",
                "category": "operational"
            },
            {
                "depot_id": "TZI.CSH.DEP.CASHING",
                "name": "CashingHouse Depot",
                "current_allocation": 200000,
                "requested_amount": 300000,
                "priority": "CRITICAL",
                "justification": "Financial system security upgrade",
                "category": "operational"
            },
            {
                "depot_id": "TZI.GRD.DEP.GRID",
                "name": "Grid Depot",
                "current_allocation": 80000,
                "requested_amount": 150000,
                "priority": "HIGH",
                "justification": "Cybersecurity infrastructure expansion",
                "category": "growth_investment"
            }
        ]
    }
    
    # Save sample data for demonstration
    with open('data/depot_requests.json', 'w') as f:
        json.dump(sample_requests, f, indent=2)
    
    # Load and process
    allocator.load_depot_requests('depot_requests.json')
    
    # Execute allocation (dry run by default)
    results = allocator.execute_allocations(dry_run=True)
    
    # Generate and display report
    report = allocator.generate_report(results)
    print(report)
    
    # Save results
    with open('results/allocation_results.json', 'w') as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    main()
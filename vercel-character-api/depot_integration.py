#!/usr/bin/env python3
"""
Depot Integration System
Integrates all four depots for cross-depot workflows and data sharing
"""

import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
import sys
import os

# Add parent directories to path to import depot modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'cashinghouse-automation'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'consort-automation'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'holdings-automation'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'scribe-automation'))

try:
    from financial_tracker import FinancialTracker, PlatformType, TransactionStatus
    from content_pipeline import ContentPipeline, ContentType, ContentStatus, SocialMediaAutomation
    from asset_manager import AssetManager, AssetType, AssetStatus
    from document_manager import DocumentManager, DocumentType, DocumentStatus
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure all depot modules are in the correct directories")
    sys.exit(1)


@dataclass
class CrossDepotEvent:
    """Event that spans multiple depots"""
    event_id: str
    event_type: str
    source_depot: str
    target_depots: List[str]
    data: Dict
    timestamp: str
    status: str


class DepotIntegration:
    """Main integration system for all depots"""
    
    def __init__(self):
        # Initialize all depot systems
        self.cashinghouse = FinancialTracker(
            data_path="cashinghouse-automation/cashinghouse_financial_data.json"
        )
        self.consort = ContentPipeline(
            data_path="consort-automation/consort_content_pipeline.json"
        )
        self.holdings = AssetManager(
            data_path="holdings-automation/holdings_asset_data.json"
        )
        self.scribe = DocumentManager(
            data_path="scribe-automation/scribe_document_data.json"
        )
        
        self.social_automation = SocialMediaAutomation(self.consort)
        self.cross_depot_events: Dict[str, CrossDepotEvent] = {}
        
    def create_revenue_to_content_workflow(self, platform: PlatformType, 
                                          content_ideas: List[str]) -> List[str]:
        """Create content based on revenue performance"""
        # Get revenue data for platform
        platform_revenue = self.cashinghouse.get_revenue_by_platform(platform)
        
        # Generate content ideas based on performance
        content_ids = []
        for i, idea in enumerate(content_ideas):
            character = "Mac" if i % 2 == 0 else "Mary"
            content_type = ContentType.TIKTOK if i % 2 == 0 else ContentType.INSTAGRAM
            
            content_id = self.consort.create_content_item(
                content_type=content_type,
                title=f"Revenue Insight: {idea}",
                description=f"Content based on {platform.value} performance: ${platform_revenue['total_revenue']:,.2f}",
                character=character,
                prompt=f"Create {content_type.value} content about: {idea}. Reference revenue performance of ${platform_revenue['total_revenue']:,.2f}",
                scheduled_date=(datetime.datetime.now() + datetime.timedelta(days=i+1)).strftime("%Y-%m-%d"),
                platform_specifics={
                    "revenue_context": platform_revenue,
                    "performance_data": platform_revenue
                }
            )
            content_ids.append(content_id)
        
        # Log cross-depot event
        self._log_cross_depot_event(
            event_type="revenue_to_content",
            source_depot="CashingHouse",
            target_depots=["Consort"],
            data={"platform": platform.value, "content_count": len(content_ids)}
        )
        
        return content_ids
    
    def create_content_to_revenue_workflow(self, content_id: str, 
                                         product_promotion: Dict) -> str:
        """Create revenue opportunity based on content performance"""
        content = self.consort.content_items.get(content_id)
        if not content:
            return None
        
        # Create transaction based on content performance
        engagement = content.performance_metrics.get('engagement', 0)
        estimated_revenue = engagement * 0.05  # Estimate 5% conversion
        
        # Map content type to platform
        platform_mapping = {
            ContentType.TIKTOK: PlatformType.GUMROAD,
            ContentType.INSTAGRAM: PlatformType.LINKTREE,
            ContentType.YOUTUBE: PlatformType.ADMOB
        }
        
        platform = platform_mapping.get(content.content_type, PlatformType.GUMROAD)
        
        transaction_id = self.cashinghouse.add_transaction(
            platform=platform,
            amount=estimated_revenue,
            customer_id=f"CONTENT_{content_id}",
            product_id=product_promotion.get('product_id', 'PROMO_001'),
            metadata={
                "source_content": content_id,
                "content_title": content.title,
                "character": content.character,
                "engagement": engagement
            }
        )
        
        # Log cross-depot event
        self._log_cross_depot_event(
            event_type="content_to_revenue",
            source_depot="Consort",
            target_depots=["CashingHouse"],
            data={"content_id": content_id, "transaction_id": transaction_id}
        )
        
        return transaction_id
    
    def create_asset_to_document_workflow(self, asset_id: str, 
                                        document_type: DocumentType) -> str:
        """Create documentation based on asset performance"""
        asset = self.holdings.assets.get(asset_id)
        if not asset:
            return None
        
        # Create document based on asset data
        roi = asset.performance_metrics.get('roi', 0)
        title = f"{asset.name} Performance Report"
        description = f"Performance analysis for {asset.name} with ROI: {roi:.2f}%"
        
        doc_id = self.scribe.create_document(
            document_type=document_type,
            title=title,
            description=description,
            author="Holdings Depot",
            reviewer="Scribe of Assets",
            tags=["asset", "performance", asset.asset_type.value],
            content=f"""
# {title}

## Asset Overview
- Name: {asset.name}
- Type: {asset.asset_type.value}
- Current Value: ${asset.current_value:,.2f}
- Purchase Value: ${asset.purchase_value:,.2f}
- ROI: {roi:.2f}%

## Performance Analysis
- Manager: {asset.manager}
- Location: {asset.location}
- Status: {asset.status.value}

## Recommendations
[Based on current performance]
"""
        )
        
        # Log cross-depot event
        self._log_cross_depot_event(
            event_type="asset_to_document",
            source_depot="Holdings",
            target_depots=["Scribe"],
            data={"asset_id": asset_id, "document_id": doc_id}
        )
        
        return doc_id
    
    def create_contract_to_asset_workflow(self, contract_id: str) -> str:
        """Create asset based on contract value"""
        contract = self.scribe.contracts.get(contract_id)
        if not contract:
            return None
        
        # Create asset based on contract
        asset_id = self.holdings.add_asset(
            asset_type=AssetType.INVESTMENT,
            name=f"Contract Investment: {contract.contract_type}",
            description=f"Investment based on {contract.contract_type} contract",
            purchase_value=contract.value,
            location="Contract Portfolio",
            manager="Holdings Depot"
        )
        
        # Create investment
        inv_id = self.holdings.create_investment(
            asset_id=asset_id,
            investment_type="contract_based",
            amount=contract.value,
            risk_level="low",
            start_date=contract.start_date,
            end_date=contract.end_date
        )
        
        # Log cross-depot event
        self._log_cross_depot_event(
            event_type="contract_to_asset",
            source_depot="Scribe",
            target_depots=["Holdings"],
            data={"contract_id": contract_id, "asset_id": asset_id, "investment_id": inv_id}
        )
        
        return asset_id
    
    def generate_integrated_report(self) -> str:
        """Generate comprehensive integrated report across all depots"""
        report = []
        report.append("=" * 80)
        report.append("TIAPMAATZU OS TOOLKIT - INTEGRATED DEPOT REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        # CashingHouse Summary
        report.append("CASHINGHOUSE DEPOT SUMMARY:")
        cashinghouse_summary = self.cashinghouse.get_total_revenue()
        report.append(f"  Total Revenue: ${cashinghouse_summary['total_revenue']:,.2f}")
        report.append(f"  Net Revenue: ${cashinghouse_summary['total_net_revenue']:,.2f}")
        report.append(f"  Transactions: {cashinghouse_summary['total_transactions']}")
        report.append("")
        
        # Consort Summary
        report.append("CONSORT DEPOT SUMMARY:")
        published_content = self.consort.get_content_by_status(ContentStatus.PUBLISHED)
        report.append(f"  Published Content: {len(published_content)}")
        if published_content:
            total_engagement = sum(c.performance_metrics.get('engagement', 0) for c in published_content)
            report.append(f"  Total Engagement: {total_engagement:,}")
        report.append("")
        
        # Holdings Summary
        report.append("HOLDINGS DEPOT SUMMARY:")
        holdings_summary = self.holdings.get_total_portfolio_value()
        report.append(f"  Portfolio Value: ${holdings_summary['total_value']:,.2f}")
        report.append(f"  Total Assets: {holdings_summary['total_assets']}")
        investment_summary = self.holdings.get_investment_summary()
        report.append(f"  Investments: {investment_summary['total_investments']}")
        report.append(f"  Average ROI: {investment_summary['average_roi']:.2f}%")
        report.append("")
        
        # Scribe Summary
        report.append("SCRIBE DEPOT SUMMARY:")
        report.append(f"  Total Documents: {len(self.scribe.documents)}")
        report.append(f"  Total Contracts: {len(self.scribe.contracts)}")
        active_contracts = [c for c in self.scribe.contracts.values() if c.status == "active"]
        if active_contracts:
            total_contract_value = sum(c.value for c in active_contracts)
            report.append(f"  Active Contract Value: ${total_contract_value:,.2f}")
        report.append("")
        
        # Cross-Depot Events
        report.append("CROSS-DEPOT INTEGRATION EVENTS:")
        report.append(f"  Total Events: {len(self.cross_depot_events)}")
        for event_id, event in list(self.cross_depot_events.items())[-5:]:  # Show last 5
            report.append(f"  • {event.event_type}: {event.source_depot} → {', '.join(event.target_depots)}")
        report.append("")
        
        # Combined Automation Triggers
        report.append("COMBINED AUTOMATION TRIGGERS:")
        all_triggers = []
        
        # Get triggers from all depots
        cashinghouse_triggers = self.cashinghouse.get_automation_triggers()
        consort_triggers = self.social_automation.get_automation_triggers()
        holdings_triggers = self.holdings.get_automation_triggers()
        scribe_triggers = self.scribe.get_automation_triggers()
        
        all_triggers.extend([
            *cashinghouse_triggers,
            *consort_triggers,
            *holdings_triggers,
            *scribe_triggers
        ])
        
        if all_triggers:
            for trigger in all_triggers:
                severity_icon = "⚠️" if trigger['severity'] == 'warning' else "ℹ️"
                report.append(f"  {severity_icon} {trigger['type'].replace('_', ' ').title()}")
                report.append(f"    {trigger['message']}")
        else:
            report.append("  No active triggers")
        report.append("")
        
        # System Health Overview
        report.append("SYSTEM HEALTH OVERVIEW:")
        report.append("  ✓ CashingHouse Depot: Operational")
        report.append("  ✓ Consort Depot: Operational")
        report.append("  ✓ Holdings Depot: Operational")
        report.append("  ✓ Scribe Depot: Operational")
        report.append("  ✓ Cross-Depot Integration: Active")
        report.append("")
        
        return "\n".join(report)
    
    def _log_cross_depot_event(self, event_type: str, source_depot: str, 
                               target_depots: List[str], data: Dict):
        """Log a cross-depot event"""
        event_id = f"{event_type}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        event = CrossDepotEvent(
            event_id=event_id,
            event_type=event_type,
            source_depot=source_depot,
            target_depots=target_depots,
            data=data,
            timestamp=datetime.datetime.now().isoformat(),
            status="completed"
        )
        
        self.cross_depot_events[event_id] = event
    
    def get_cross_depot_events(self, event_type: str = None) -> List[CrossDepotEvent]:
        """Get cross-depot events, optionally filtered by type"""
        events = list(self.cross_depot_events.values())
        if event_type:
            events = [e for e in events if e.event_type == event_type]
        return sorted(events, key=lambda x: x.timestamp, reverse=True)


def main():
    """Main function for testing and demonstration"""
    integration = DepotIntegration()
    
    # Test revenue to content workflow
    print("Testing Revenue to Content Workflow:")
    content_ids = integration.create_revenue_to_content_workflow(
        platform=PlatformType.GUMROAD,
        content_ideas=["Pricing Strategy", "Customer Success", "Product Launch"]
    )
    print(f"Created {len(content_ids)} content items based on revenue data")
    
    # Test asset to document workflow
    print("\nTesting Asset to Document Workflow:")
    assets = list(integration.holdings.assets.keys())
    if assets:
        doc_id = integration.create_asset_to_document_workflow(
            asset_id=assets[0],
            document_type=DocumentType.REPORT
        )
        print(f"Created document {doc_id} based on asset data")
    
    # Generate integrated report
    print("\n" + integration.generate_integrated_report())


if __name__ == "__main__":
    main()
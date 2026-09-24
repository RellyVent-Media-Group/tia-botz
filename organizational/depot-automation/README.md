# Depot Automation Systems

Comprehensive automation scripts for each depot in the TZU organizational hierarchy: Consort, Scribe, CashingHouse, and Holdings. Each system is tailored to the specific operational needs of its respective depot.

## Available Systems

### 1. Consort Depot - Content Pipeline Automation
**File**: `consort_content_pipeline.py`

Content creation pipeline management with social media automation and character consistency tracking.

**Features**:
- Content pipeline management (idea → posted → archived)
- Multi-platform support (TikTok, Instagram, YouTube, Twitter)
- Character consistency tracking (Mac & Mary)
- 30-day content calendar generation
- Performance tracking and analytics
- Optimal posting time recommendations
- Platform-specific optimization

**Content Types**:
- Character Reveal
- Poster Showcase
- Avatar Spotlight
- Story Preview

**Usage**:
```python
from consort_content_pipeline import ContentPipeline, ContentItem, ContentType, Platform, ContentStatus

pipeline = ContentPipeline()

# Add content item
content = ContentItem(
    id="content_001",
    title="Mac Character Reveal - Episode 1",
    content_type=ContentType.CHARACTER_REVEAL,
    platform=Platform.TIKTOK,
    character="Mac",
    status=ContentStatus.IDEA
)
pipeline.add_content_item(content)

# Generate 30-day calendar
calendar = pipeline.generate_30_day_calendar()

# Check character consistency
consistency = pipeline.check_character_consistency()
```

### 2. Scribe Depot - Document Manager Automation
**File**: `scribe_document_manager.py`

Document lifecycle management with contract automation and version control.

**Features**:
- Document lifecycle management (draft → approved → archived)
- Contract management with expiry tracking
- Version control and history tracking
- Document search and organization
- Expiring contract alerts
- Document queue management
- Comprehensive reporting

**Document Types**:
- Contract
- Agreement
- Proposal
- Report
- Documentation
- Template

**Contract Types**:
- Service
- Partnership
- Employment
- License
- NDA

**Usage**:
```python
from scribe_document_manager import DocumentManager, Document, Contract, DocumentType, ContractType

manager = DocumentManager()

# Add document
document = Document(
    id="doc_001",
    title="Partnership Agreement Template",
    document_type=DocumentType.TEMPLATE,
    status=DocumentStatus.APPROVED,
    file_path="/documents/templates/partnership_agreement.docx"
)
manager.add_document(document)

# Get expiring contracts
expiring = manager.get_expiring_contracts(days=30)

# Generate contract alerts
alerts = manager.generate_contract_alerts()
```

### 3. CashingHouse Depot - Financial Tracker Automation
**File**: `cashinghouse_financial_tracker.py`

Multi-platform revenue tracking with commission calculation and financial reporting.

**Features**:
- Multi-platform transaction tracking
- Commission calculation and tracking
- Revenue metrics and analytics
- Financial reporting and trend analysis
- Payout management and summaries
- Platform performance analysis
- Pricing optimization recommendations

**Supported Platforms**:
- Gumroad (10% commission, 2.9% + $0.30 processing)
- Fiverr (20% commission)
- CrakRevenue (5% commission)
- AdMob (revenue share)
- Linktree (no commission)

**Usage**:
```python
from cashinghouse_financial_tracker import FinancialTracker, Transaction, Platform, TransactionType

tracker = FinancialTracker()

# Add transaction
transaction = Transaction(
    id="trans_001",
    platform=Platform.GUMROAD,
    transaction_type=TransactionType.SALE,
    amount=29.99,
    status=TransactionStatus.COMPLETED
)
tracker.add_transaction(transaction)

# Generate financial report
report = tracker.generate_financial_report(days=30)

# Get payout summary
payouts = tracker.get_payout_summary()
```

### 4. Holdings Depot - Asset Manager Automation
**File**: `holdings_asset_manager.py`

Portfolio management with investment tracking, ROI calculation, and portfolio rebalancing.

**Features**:
- Portfolio management and tracking
- Investment performance analysis
- ROI calculation and tracking
- Portfolio rebalancing recommendations
- Risk assessment and analysis
- Asset allocation management
- Performance history tracking

**Asset Types**:
- Cryptocurrency
- Stocks
- Real Estate
- Digital Assets
- Cash
- Intellectual Property

**Risk Levels**:
- Low
- Medium
- High
- Speculative

**Usage**:
```python
from holdings_asset_manager import AssetManager, Asset, AssetType, AssetStatus, RiskLevel

manager = AssetManager()

# Add asset
asset = Asset(
    id="asset_001",
    name="Bitcoin Holdings",
    asset_type=AssetType.CRYPTOCURRENCY,
    status=AssetStatus.ACTIVE,
    current_value=45000.0,
    purchase_value=40000.0,
    risk_level=RiskLevel.HIGH
)
manager.add_asset(asset)

# Generate portfolio report
report = manager.generate_portfolio_report()

# Generate risk assessment
risk = manager.generate_risk_assessment()
```

## Installation

No external dependencies required. All systems use only Python standard library.

```bash
# Navigate to the depot-automation directory
cd organizational/depot-automation

# Run individual systems
python consort_content_pipeline.py
python scribe_document_manager.py
python cashinghouse_financial_tracker.py
python holdings_asset_manager.py
```

## Data Files

Each system creates and manages its own data files:

### Consort Depot
- `content_pipeline.json` - Content items and pipeline status
- `content_calendar.json` - Content scheduling calendar

### Scribe Depot
- `documents.json` - Document records and metadata
- `contracts.json` - Contract records and terms
- `document_versions.json` - Version history for documents

### CashingHouse Depot
- `transactions.json` - Financial transaction records
- `revenue_metrics.json` - Calculated revenue metrics
- `platform_configs.json` - Platform-specific configurations

### Holdings Depot
- `assets.json` - Asset portfolio records
- `portfolio_allocations.json` - Target allocation settings
- `asset_performance.json` - Historical performance data

## Integration

The depot automation systems integrate with other organizational systems:

- **Heart Calendar**: Aligns depot operations with calendar events
- **Daily Automation**: Includes depot-specific tasks in daily checklists
- **Stakeholder Tracking**: Provides depot context for stakeholder interactions

## Configuration

Depot automation settings can be configured in the `config.json` file:

```json
{
  "depot_automation": {
    "consort": {
      "platforms": ["tiktok", "instagram", "youtube", "twitter"],
      "content_types": ["character_reveal", "poster_showcase", "avatar_spotlight", "story_preview"],
      "characters": ["Mac", "Mary"]
    },
    "scribe": {
      "document_types": ["contract", "agreement", "proposal", "report", "documentation", "template"],
      "contract_types": ["service", "partnership", "employment", "license", "nda"]
    },
    "cashinghouse": {
      "platforms": ["gumroad", "fiverr", "crakrevenue", "admob", "linktree"]
    },
    "holdings": {
      "asset_types": ["cryptocurrency", "stocks", "real_estate", "digital_assets", "cash", "intellectual_property"],
      "risk_levels": ["low", "medium", "high", "speculative"]
    }
  }
}
```

## Platform Implementation Assignments

Based on the TZU organizational structure, each depot has specific platform responsibilities:

### Consort Depot
- TikTok
- Instagram
- YouTube/YouTube Shorts
- X (Twitter)
- Content creation pipelines

### CashingHouse Depot
- Gumroad
- Fiverr
- CrakRevenue
- AdMob
- Linktree
- Financial analytics

### Scribe Depot
- Blog implementation
- Documentation
- Contract automation
- SEO implementation

### Holdings Depot
- Adult content website
- WhatsApp
- Telegram
- Asset management
- Resource allocation

## Best Practices

1. **Regular Updates**: Keep transaction, document, and asset data current
2. **Version Control**: Maintain proper version history for documents
3. **Performance Monitoring**: Regularly review performance metrics
4. **Risk Management**: Monitor risk levels and take appropriate action
5. **Contract Management**: Proactively manage contract expirations
6. **Portfolio Rebalancing**: Regularly review and rebalance portfolio allocations

## Future Enhancements

- API integrations with external platforms
- Automated data synchronization
- Advanced analytics and machine learning
- Real-time notifications and alerts
- Mobile dashboard interfaces
- Cross-depot workflow automation

## Support

For issues or questions, refer to the main Tiapmaatzu OS Toolkit documentation or contact the system administrator.

---

*Depot Automation Systems v1.0*  
*Part of Tiapmaatzu OS Toolkit - Organizational Systems*
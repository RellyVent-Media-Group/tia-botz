# Tiapmaatzu OS Toolkit - Organizational Systems

Complete organizational automation system for the TZU organizational hierarchy, integrating Heart Calendar, daily workflows, stakeholder management, and depot-specific operations.

## Overview

The organizational systems provide comprehensive automation for managing the TZU.[---].ZI Organizational Hierarchy with four main depots:

1. **Consort Depot** - Content pipeline and social media automation
2. **Scribe Depot** - Document management and contract automation
3. **CashingHouse Depot** - Financial tracking and revenue management
4. **Holdings Depot** - Asset management and portfolio tracking

## System Components

### Core Systems

#### 1. Heart Calendar Integration
**Location**: `heart-calendar/`

A custom 12-month calendar system with 28.0 days per month, starting March 21 (Gregorian).

- Custom calendar with 12 unique months
- Gregorian ↔ Heart date conversion
- Event scheduling and tracking
- Depot-specific daily schedule generation
- Monthly views and upcoming events

#### 2. Daily Checklist Automation
**Location**: `daily-automation/`

3x daily checklists (morning, mid-day, evening) with Heart Calendar integration.

- Depot-specific task templates
- Task status tracking and completion
- Auto-completion from calendar events
- Daily and weekly reporting
- Progress tracking and analytics

#### 3. Stakeholder Tracking
**Location**: `stakeholder-tracking/`

Depot-level stakeholder management with sentiment scoring and trend analysis.

- Sentiment scoring (-1.0 to +1.0)
- Trend analysis (improving/stable/declining)
- Influence level tracking
- Interaction history logging
- High-risk stakeholder alerts
- Comprehensive reporting

### Depot Automation Systems

#### 4. Consort Depot - Content Pipeline
**Location**: `depot-automation/consort_content_pipeline.py`

Content creation pipeline management with social media automation.

- Multi-platform support (TikTok, Instagram, YouTube, Twitter)
- Character consistency tracking (Mac & Mary)
- 30-day content calendar generation
- Performance tracking and analytics
- Optimal posting time recommendations

#### 5. Scribe Depot - Document Manager
**Location**: `depot-automation/scribe_document_manager.py`

Document lifecycle management with contract automation.

- Document lifecycle management
- Contract expiry tracking
- Version control and history
- Document search and organization
- Expiring contract alerts

#### 6. CashingHouse Depot - Financial Tracker
**Location**: `depot-automation/cashinghouse_financial_tracker.py`

Multi-platform revenue tracking with commission calculation.

- Multi-platform transaction tracking
- Commission calculation and tracking
- Revenue metrics and analytics
- Payout management
- Platform performance analysis

#### 7. Holdings Depot - Asset Manager
**Location**: `depot-automation/holdings_asset_manager.py`

Portfolio management with investment tracking and ROI calculation.

- Portfolio management and tracking
- Investment performance analysis
- ROI calculation and tracking
- Portfolio rebalancing recommendations
- Risk assessment and analysis

## TZU Organizational Hierarchy

```
Executive Level (TZI.ZI.0.SPIRIT)
       ↓
Consort Depot (TZI.TR.CON) - Shadow/MEDIA
       ↓
Scribe Depot (TZI.EST.SCR) - HueMan-i-Terry (Estate Fiduciary)
       ↓
CashingHouse Depot (TZI.EST.CSH) - Tiapma'atzu x2
       ↓
Holdings Depot (TZI.TR.HLD) - + Oracle x2
```

## Installation

### Prerequisites
- Python 3.8 or higher
- No external dependencies required (uses only standard library)

### Setup

```bash
# Navigate to the organizational directory
cd organizational

# Install dependencies (optional - no external packages required)
pip install -r requirements.txt

# Systems will automatically create data files on first run
```

## Quick Start

### Heart Calendar

```python
from heart_calendar.heart_calendar import HeartCalendar

calendar = HeartCalendar()
current_date = calendar.get_current_heart_date()
print(f"Current Heart Date: {current_date}")
```

### Daily Checklist Automation

```python
from daily_automation.daily_checklist_automation import DailyChecklistAutomation

automation = DailyChecklistAutomation()
todays_checklists = automation.get_todays_checklists()
report = automation.generate_daily_report()
```

### Stakeholder Tracking

```python
from stakeholder_tracking.stakeholder_tracker import StakeholderTracker

tracker = StakeholderTracker()
report = tracker.generate_sentiment_report()
alerts = tracker.generate_stakeholder_alerts()
```

### Depot Automation

```python
# Consort Depot
from depot_automation.consort_content_pipeline import ContentPipeline
pipeline = ContentPipeline()
calendar = pipeline.generate_30_day_calendar()

# Scribe Depot
from depot_automation.scribe_document_manager import DocumentManager
manager = DocumentManager()
alerts = manager.generate_contract_alerts()

# CashingHouse Depot
from depot_automation.cashinghouse_financial_tracker import FinancialTracker
tracker = FinancialTracker()
report = tracker.generate_financial_report(days=30)

# Holdings Depot
from depot_automation.holdings_asset_manager import AssetManager
manager = AssetManager()
report = manager.generate_portfolio_report()
```

## Configuration

All systems can be configured through the central `config.json` file:

```json
{
  "heart_calendar": {
    "data_directory": "./heart-calendar",
    "days_per_month": 28.0,
    "gregorian_start_month": 3,
    "gregorian_start_day": 21
  },
  "daily_automation": {
    "data_directory": "./daily-automation",
    "auto_complete_from_calendar": true
  },
  "stakeholder_tracking": {
    "data_directory": "./stakeholder-tracking",
    "sentiment_threshold": -0.3,
    "trend_analysis_days": 30
  },
  "depot_automation": {
    "consort": { "platforms": ["tiktok", "instagram", "youtube", "twitter"] },
    "scribe": { "document_types": ["contract", "agreement", "proposal"] },
    "cashinghouse": { "platforms": ["gumroad", "fiverr", "crakrevenue", "admob"] },
    "holdings": { "asset_types": ["cryptocurrency", "stocks", "real_estate"] }
  }
}
```

## Integration Points

### Calendar → Daily Automation
- Strategic events trigger automatic task completion
- Quarterly reviews align with Heart Calendar cycles
- Performance tracking follows calendar periods

### Stakeholder Tracking → Depot Operations
- Sentiment changes trigger operational adjustments
- High-risk stakeholders receive priority attention
- Depot performance affects stakeholder sentiment

### Daily Automation → Depot Systems
- Completed checklists trigger depot workflows
- Task completion updates system states
- Performance data feeds into reporting

## Reporting

Each system generates comprehensive reports:

- **Heart Calendar**: Monthly views, upcoming events, depot schedules
- **Daily Checklists**: Completion rates, pending tasks, priority alerts
- **Stakeholder Tracking**: Sentiment analysis, risk alerts, trend reports
- **Depot Systems**: Performance metrics, operational reports, optimization recommendations

### Reporting Schedule
- **Daily**: Daily checklist completion, stakeholder sentiment updates
- **Weekly**: Performance summaries, risk assessments
- **Monthly**: Comprehensive reports, strategic reviews
- **Quarterly**: Strategic planning, portfolio rebalancing

## Data Management

### Data Files
Each system creates and manages its own JSON data files:

- `heart-calendar/events.json`
- `daily-automation/checklists.json`
- `daily-automation/checklist_templates.json`
- `stakeholder-tracking/stakeholders.json`
- `stakeholder-tracking/sentiment_history.json`
- `depot-automation/content_pipeline.json`
- `depot-automation/documents.json`
- `depot-automation/contracts.json`
- `depot-automation/transactions.json`
- `depot-automation/assets.json`

### Backup Recommendations
- Daily JSON file backups recommended
- Monthly data integrity checks
- Quarterly system reviews and improvements

## Architecture

The organizational systems follow a modular architecture:

```
organizational/
├── heart-calendar/          # Custom calendar system
│   ├── heart_calendar.py
│   ├── README.md
│   └── events.json
├── daily-automation/        # Daily task management
│   ├── daily_checklist_automation.py
│   ├── README.md
│   ├── checklists.json
│   └── checklist_templates.json
├── stakeholder-tracking/    # Stakeholder management
│   ├── stakeholder_tracker.py
│   ├── README.md
│   ├── stakeholders.json
│   └── sentiment_history.json
├── depot-automation/        # Depot-specific systems
│   ├── consort_content_pipeline.py
│   ├── scribe_document_manager.py
│   ├── cashinghouse_financial_tracker.py
│   ├── holdings_asset_manager.py
│   └── README.md
├── requirements.txt
├── config.json
└── README.md
```

## Platform Responsibilities

### Consort Depot
- TikTok, Instagram, YouTube, X (Twitter)
- Content creation pipelines
- Social media automation

### CashingHouse Depot
- Gumroad, Fiverr, CrakRevenue, AdMob, Linktree
- Financial analytics
- Revenue tracking

### Scribe Depot
- Blog implementation, Documentation
- Contract automation
- SEO implementation

### Holdings Depot
- Adult content website, WhatsApp, Telegram
- Asset management
- Resource allocation

## Future Development

### Planned Enhancements
- Gnostic Auto-Didactico self-learning system
- PAATS voice cloning integration
- Behavioral science email templates
- Advanced AI integration for content generation
- Real-time stakeholder communication automation

### Integration Roadmap
1. **Phase 1**: Core automation systems (current)
2. **Phase 2**: AI integration and advanced analytics
3. **Phase 3**: Full autonomous operation
4. **Phase 4**: Predictive analytics and strategic planning

## Troubleshooting

### Common Issues
- **Calendar conversion errors**: Verify system timezone settings
- **Stakeholder data not loading**: Check file permissions and paths
- **Checklist automation failures**: Verify Heart Calendar integration
- **Depot system errors**: Check data file integrity

### Support
- Check system logs for error messages
- Verify JSON file integrity
- Review configuration settings
- Contact system administrator for persistent issues

## Maintenance

### Regular Tasks
- **Daily**: Complete checklists, update stakeholder sentiment
- **Weekly**: Review system performance, update automation rules
- **Monthly**: Generate comprehensive reports, update templates
- **Quarterly**: Strategic planning, system optimization

## License

This project is part of the ChiefPilot / Gilded Mirrors Universe ecosystem.

---

*Tiapmaatzu OS Toolkit - Organizational Systems v1.0*  
*Last Updated: 2024-09-23*  
*Maintained by: TZI Systems Team*
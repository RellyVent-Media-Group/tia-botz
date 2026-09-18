# Stakeholder Sentiment Tracking System

## Overview
The TZU Stakeholder Sentiment Tracking System monitors sentiment across all depots with a 2x positive to 1x negative stakeholder ratio structure, providing real-time insights into stakeholder relationships and organizational health.

## System Architecture

### Data Structure
- **Depot-level tracking**: Each depot maintains its own stakeholder database
- **Sentiment scoring**: -1.0 (highly negative) to +1.0 (highly positive)
- **Trend analysis**: Tracks sentiment changes over time
- **Risk assessment**: Identifies high-risk stakeholders requiring attention

### Depot Coverage
- **Consort Depot (TZI.TR.CON)**: Media partners, creative talent, platform relationships
- **Scribe Depot (TZI.SCR.DEP.BODY)**: Legal counsel, infrastructure partners, documentation stakeholders
- **CashingHouse Depot (TZI.CSH.DEP.SOUL)**: Financial partners, investors, payment processors
- **Holdings Depot (TZI.HLD.DNOSIS)**: Asset managers, property stakeholders, investment partners

## Features

### Core Functionality
- **Stakeholder Management**: Add, update, and remove stakeholders
- **Sentiment Tracking**: Monitor sentiment scores and trends
- **Risk Assessment**: Identify high-risk stakeholders automatically
- **Reporting**: Generate comprehensive sentiment reports
- **Data Persistence**: JSON-based storage for easy backup and migration

### Sentiment Analysis
- **Overall depot sentiment**: Average score across all stakeholders
- **Trend detection**: Improving, stable, declining, or volatile
- **Categorization**: Positive (>0.3), Neutral (-0.3 to 0.3), Negative (<-0.3)
- **High-risk alerts**: Stakeholders with sentiment below -0.7

## Usage

### Basic Operations

```python
from stakeholder_tracker import StakeholderTracker, Stakeholder, DepotType

# Initialize tracker
tracker = StakeholderTracker()

# Add stakeholder
stakeholder = Stakeholder(
    id="SH001",
    name="Alex Johnson",
    role="Media Partner",
    contact_info="alex@example.com",
    sentiment_score=0.8,
    influence_level="high",
    last_interaction="2024-09-02T10:00:00",
    notes="Key partner for media operations"
)

tracker.add_stakeholder(DepotType.CONSORT.value, stakeholder)

# Update sentiment
tracker.update_stakeholder_sentiment(
    depot_id=DepotType.CONSORT.value,
    stakeholder_id="SH001",
    new_score=0.9,
    notes="Excellent collaboration on recent project"
)

# Generate report
print(tracker.generate_sentiment_report())
```

### Risk Monitoring

```python
# Get high-risk stakeholders
high_risk = tracker.get_high_risk_stakeholders(threshold=-0.7)

for depot_id, stakeholder_id, stakeholder in high_risk:
    print(f"ALERT: {stakeholder.name} at {depot_id} - Score: {stakeholder.sentiment_score}")
```

### Depot-Specific Analysis

```python
# Get sentiment for specific depot
consort_sentiment = tracker.get_depot_sentiment(DepotType.CONSORT.value)
print(f"Consort Depot Overall Sentiment: {consort_sentiment.overall_sentiment:.2f}")
print(f"Trend: {consort_sentiment.sentiment_trend.value}")
```

## Integration Points

### with Daily Automation
- Automatic sentiment updates based on daily interactions
- Integration with daily checklist completion
- Trigger alerts for negative sentiment trends

### with Calendar System
- Quarterly sentiment reviews aligned with Heart Calendar
- Strategic planning based on sentiment cycles
- Performance tracking across calendar periods

### with Depot Operations
- Real-time sentiment monitoring during operations
- Stakeholder communication automation
- Crisis response based on sentiment data

## Data Management

### Storage Format
- **File**: `stakeholder_data.json`
- **Format**: JSON with depot-level organization
- **Backup**: Recommended daily backups

### Data Structure
```json
{
  "TZI.TR.CON": {
    "depot_id": "TZI.TR.CON",
    "depot_name": "Consort Depot",
    "stakeholders": {
      "SH001": {
        "id": "SH001",
        "name": "Alex Johnson",
        "role": "Media Partner",
        "contact_info": "alex@example.com",
        "sentiment_score": 0.8,
        "influence_level": "high",
        "last_interaction": "2024-09-02T10:00:00",
        "notes": "Key partner for media operations"
      }
    },
    "last_updated": "2024-09-02T10:00:00",
    "sentiment_trend": "improving",
    "overall_sentiment": 0.75,
    "positive_count": 2,
    "negative_count": 1,
    "neutral_count": 0
  }
}
```

## Best Practices

### Sentiment Scoring Guidelines
- **1.0 to 0.7**: Exceptional relationship, highly collaborative
- **0.7 to 0.3**: Good relationship, regular positive interactions
- **0.3 to -0.3**: Neutral relationship, transactional interactions
- **-0.3 to -0.7**: Concerning relationship, requires attention
- **-0.7 to -1.0**: Critical relationship, immediate intervention needed

### Update Frequency
- **Daily**: Update scores after significant interactions
- **Weekly**: Review trends and identify patterns
- **Monthly**: Comprehensive sentiment analysis
- **Quarterly**: Strategic sentiment planning

### Risk Management
- **Proactive monitoring**: Regular sentiment check-ins
- **Early intervention**: Address declining sentiment before crisis
- **Stakeholder communication**: Regular feedback collection
- **Documentation**: Maintain detailed interaction notes

## Maintenance

### Regular Tasks
- **Daily**: Update sentiment scores based on interactions
- **Weekly**: Review high-risk stakeholders
- **Monthly**: Generate comprehensive reports
- **Quarterly**: Strategic sentiment planning sessions

### System Maintenance
- **Backup**: Daily JSON file backups
- **Validation**: Monthly data integrity checks
- **Updates**: Quarterly system reviews and improvements
- **Training**: Bi-annual user training sessions

## Troubleshooting

### Common Issues
- **Data not loading**: Check file permissions and path
- **Incorrect sentiment calculations**: Verify scoring guidelines
- **Missing stakeholders**: Check depot assignments
- **Trend inaccuracies**: Ensure regular updates

### Support
- Check logs for error messages
- Verify JSON file integrity
- Review stakeholder data completeness
- Contact system administrator for persistent issues

---

*System Version: 1.0*
*Last Updated: 2024-09-02*
*Maintained by: TZI Systems Team*
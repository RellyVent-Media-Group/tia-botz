# Stakeholder Tracking System

A comprehensive stakeholder management system with sentiment scoring, trend analysis, and depot-level categorization for the TZU organizational hierarchy.

## Features

- **Depot-Level Management**: Organize stakeholders by depot (Consort, Scribe, CashingHouse, Holdings)
- **Sentiment Scoring**: Track stakeholder sentiment with scores from -1.0 to +1.0
- **Trend Analysis**: Analyze sentiment trends over time (improving, stable, declining)
- **Influence Tracking**: Categorize stakeholders by influence level (low, medium, high, critical)
- **Interaction History**: Track all stakeholder interactions with timestamps and notes
- **High-Risk Alerts**: Automatic alerts for stakeholders with low sentiment scores
- **Comprehensive Reporting**: Generate detailed sentiment analysis reports
- **Risk Assessment**: Identify high-risk and high-value stakeholders

## Installation

No external dependencies required. Uses only Python standard library.

```bash
# Navigate to the stakeholder-tracking directory
cd organizational/stakeholder-tracking

# Run the system
python stakeholder_tracker.py
```

## Usage

### Basic Usage

```python
from stakeholder_tracker import StakeholderTracker, Stakeholder, DepotType, InfluenceLevel

# Initialize the tracker
tracker = StakeholderTracker()

# Create a stakeholder
stakeholder = Stakeholder(
    id="SH001",
    name="Alex Johnson",
    role="Media Partner",
    contact_info="alex@example.com",
    depot=DepotType.CONSORT,
    sentiment_score=0.8,
    influence_level=InfluenceLevel.HIGH,
    last_interaction="2024-09-23T10:00:00",
    notes="Key media contact for content distribution"
)

# Add stakeholder to system
tracker.add_stakeholder(stakeholder)
```

### Sentiment Management

```python
# Update stakeholder sentiment
tracker.update_sentiment(
    stakeholder_id="SH001",
    new_score=0.9,
    notes="Positive interaction after content collaboration"
)

# Analyze sentiment trend
trend = tracker.analyze_sentiment_trend("SH001", days=30)
print(f"Sentiment trend: {trend.value}")
```

### Interaction Tracking

```python
# Record an interaction
tracker.record_interaction(
    stakeholder_id="SH001",
    interaction_type="meeting",
    notes="Discussed content partnership opportunities"
)
```

### Reporting and Analysis

```python
# Generate sentiment report
report = tracker.generate_sentiment_report()
print(f"Average sentiment: {report['average_sentiment']}")

# Generate depot-specific report
consort_report = tracker.generate_sentiment_report(depot=DepotType.CONSORT)

# Get high-risk stakeholders
high_risk = tracker.get_high_risk_stakeholders(threshold=-0.3)

# Get high-value stakeholders
high_value = tracker.get_high_value_stakeholders()

# Generate stakeholder alerts
alerts = tracker.generate_stakeholder_alerts()
```

## Data Files

The system creates and manages the following data files:

- `stakeholders.json` - Stores all stakeholder information
- `sentiment_history.json` - Stores historical sentiment records for trend analysis
- Files are automatically created on first run

## Stakeholder Categories

### Depot Types
- **Consort**: Media partners, content collaborators, platform contacts
- **Scribe**: Legal contacts, document partners, contract stakeholders
- **CashingHouse**: Financial partners, revenue platform contacts, payment processors
- **Holdings**: Investment partners, asset managers, financial advisors

### Influence Levels
- **Low**: Limited influence on operations
- **Medium**: Moderate influence, regular interactions
- **High**: Significant influence, strategic importance
- **Critical**: Critical to operations, requires immediate attention

### Sentiment Scoring
- **+1.0 to +0.5**: Very positive sentiment
- **+0.5 to +0.3**: Positive sentiment
- **+0.3 to -0.3**: Neutral sentiment
- **-0.3 to -0.5**: Negative sentiment
- **-0.5 to -1.0**: Very negative sentiment

### Trend Analysis
- **Improving**: Sentiment score improving over time
- **Stable**: Sentiment score relatively stable
- **Declining**: Sentiment score declining over time
- **Unknown**: Insufficient data for trend analysis

## Alert Types

The system generates the following types of alerts:

1. **High Risk**: Stakeholders with sentiment scores below threshold
2. **Declining Trend**: Stakeholders with declining sentiment trends
3. **No Recent Contact**: High-influence stakeholders with no recent interaction (30+ days)

## Integration

The Stakeholder Tracking integrates with other organizational systems:

- **Heart Calendar**: Aligns stakeholder interactions with calendar events
- **Daily Automation**: Includes stakeholder management in daily tasks
- **Depot Systems**: Provides depot-specific stakeholder context

## API Reference

### StakeholderTracker Class

#### Methods

- `add_stakeholder(stakeholder)` - Add a new stakeholder
- `update_stakeholder(stakeholder_id, **kwargs)` - Update stakeholder information
- `update_sentiment(stakeholder_id, new_score, notes)` - Update sentiment score
- `record_interaction(stakeholder_id, interaction_type, notes)` - Record interaction
- `get_stakeholder(stakeholder_id)` - Get specific stakeholder
- `get_stakeholders_by_depot(depot)` - Get stakeholders by depot
- `analyze_sentiment_trend(stakeholder_id, days)` - Analyze sentiment trend
- `get_high_risk_stakeholders(threshold)` - Get high-risk stakeholders
- `get_high_value_stakeholders()` - Get high-value stakeholders
- `generate_sentiment_report(depot)` - Generate comprehensive report
- `generate_stakeholder_alerts()` - Generate stakeholder alerts

### Data Classes

- `Stakeholder` - Represents a stakeholder in the system
- `SentimentRecord` - Historical sentiment record for trend analysis
- `DepotType` - Enum of depot types
- `InfluenceLevel` - Enum of influence levels
- `SentimentTrend` - Enum of sentiment trends

## Example Output

```
=== Stakeholder Tracking System ===

Added stakeholder: Alex Johnson

=== Sentiment Report ===
{
  "report_date": "2024-09-23T10:00:00",
  "depot_filter": "All Depots",
  "total_stakeholders": 1,
  "average_sentiment": 0.8,
  "sentiment_distribution": {
    "positive": 1,
    "neutral": 0,
    "negative": 0
  },
  "influence_analysis": {
    "high_influence_count": 1,
    "high_influence_avg_sentiment": 0.8
  },
  "trend_analysis": {
    "improving": 0,
    "stable": 1,
    "declining": 0
  },
  "high_risk_stakeholders": 0,
  "high_value_stakeholders": 1
}

=== Stakeholder Alerts ===
No alerts generated
```

## Configuration

Stakeholder tracking settings can be configured in the `config.json` file:

```json
{
  "stakeholder_tracking": {
    "data_directory": "./stakeholder-tracking",
    "stakeholders_file": "stakeholders.json",
    "sentiment_history_file": "sentiment_history.json",
    "sentiment_threshold": -0.3,
    "high_influence_levels": ["high", "critical"],
    "trend_analysis_days": 30
  }
}
```

## Best Practices

1. **Regular Updates**: Update stakeholder sentiment after significant interactions
2. **Interaction Logging**: Record all interactions for comprehensive history
3. **Trend Monitoring**: Regularly review sentiment trends for early warning signs
4. **Alert Response**: Respond promptly to high-risk and declining trend alerts
5. **Depot Alignment**: Ensure stakeholders are properly categorized by depot

## Future Enhancements

- Automated sentiment analysis from communication data
- Stakeholder network mapping and relationship visualization
- Integration with CRM systems
- Predictive sentiment modeling
- Stakeholder segmentation and clustering
- Communication campaign management

## Support

For issues or questions, refer to the main Tiapmaatzu OS Toolkit documentation or contact the system administrator.

---

*Stakeholder Tracking System v1.0*  
*Part of Tiapmaatzu OS Toolkit - Organizational Systems*
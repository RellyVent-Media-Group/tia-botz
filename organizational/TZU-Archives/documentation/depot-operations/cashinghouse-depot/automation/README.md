# CashingHouse Depot - Financial Operations Automation

**Depot ID**: TZI.CSH.DEP.SOUL
**Specialization**: Financial Operations & Revenue Management

## Overview

This automation system manages financial operations for CashingHouse Depot, including revenue aggregation from multiple platforms, payment processing, and fraud detection.

## Automation Scripts

### 1. Revenue Aggregation (`revenue_aggregation.py`)
Aggregates revenue from multiple platforms (Gumroad, Fiverr, CrakRevenue, AdMob, Linktree) and detects anomalies.

**Features**:
- Multi-platform revenue aggregation
- Anomaly detection and alerting
- Platform performance breakdown
- Currency conversion support
- Comprehensive reporting

**Usage**:
```bash
python3 revenue_aggregation.py
```

**Configuration**: `config/revenue_config.json`
**Input Data**: `data/platform_revenue.json`
**Output**: `results/revenue_aggregation_*.json`

### 2. Payment Processing (`payment_processing.py`)
Handles payment processing, routing, and refund management across multiple payment gateways.

**Features**:
- Multi-gateway payment processing (Stripe, PayPal, Braintree)
- Payment routing optimization
- Refund processing
- Transaction validation
- Comprehensive reporting

**Usage**:
```bash
python3 payment_processing.py
```

**Configuration**: `config/payment_config.json`
**Input Data**: `data/payment_queue.json`
**Output**: `results/payment_processing_*.json`

### 3. Fraud Detection (`fraud_detection.py`)
Monitors transactions for fraudulent activity and generates alerts.

**Features**:
- Transaction amount monitoring
- Geographic risk assessment
- Velocity checking
- Daily amount limits
- Severity-based alerting

**Usage**:
```bash
python3 fraud_detection.py
```

**Configuration**: `config/fraud_config.json`
**Input Data**: `data/transactions.json`
**Output**: `results/fraud_detection_*.json`

## Directory Structure

```
automation/
├── config/                  # Configuration files
│   ├── revenue_config.json
│   ├── payment_config.json
│   └── fraud_config.json
├── data/                    # Sample input data
│   ├── platform_revenue.json
│   ├── payment_queue.json
│   └── transactions.json
├── logs/                    # Log files
│   ├── revenue_aggregation.log
│   ├── payment_processing.log
│   └── fraud_detection.log
├── results/                 # Output results
│   ├── revenue_aggregation_*.json
│   ├── payment_processing_*.json
│   └── fraud_detection_*.json
├── revenue_aggregation.py   # Revenue aggregation script
├── payment_processing.py    # Payment processing script
├── fraud_detection.py       # Fraud detection script
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Steps

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Test Scripts**
```bash
python3 revenue_aggregation.py
python3 payment_processing.py
python3 fraud_detection.py
```

## Configuration

### Revenue Aggregation Configuration
- `platforms`: List of platforms to aggregate
- `currency`: Base currency for aggregation
- `aggregation_interval`: Time interval for aggregation
- `anomaly_thresholds`: Thresholds for anomaly detection

### Payment Processing Configuration
- `payment_gateways`: Available payment gateways
- `retry_attempts`: Number of retry attempts
- `min_payment_amount`: Minimum payment amount
- `max_payment_amount`: Maximum payment amount

### Fraud Detection Configuration
- `max_single_transaction`: Maximum single transaction amount
- `max_daily_transactions_per_user`: Maximum daily transactions per user
- `max_daily_amount_per_user`: Maximum daily amount per user
- `suspicious_countries`: List of suspicious country codes

## Scheduling

### Recommended Schedule

**Revenue Aggregation**: Daily at 6 AM UTC
```bash
0 6 * * * cd /path/to/automation && python3 revenue_aggregation.py
```

**Payment Processing**: Every hour
```bash
0 * * * * cd /path/to/automation && python3 payment_processing.py
```

**Fraud Detection**: Every 5 minutes
```bash
*/5 * * * * cd /path/to/automation && python3 fraud_detection.py
```

## Security

### Important Security Notes
- Never commit `.env` file to version control
- Rotate API keys regularly
- Use HTTPS for all API calls
- Implement proper access controls
- Monitor for unauthorized access

### Credential Management
- Use environment variables for sensitive data
- Implement key rotation policies
- Use secure credential storage
- Monitor API key usage

## Monitoring

### Log Files
Monitor log files for errors and issues:
```bash
tail -f logs/revenue_aggregation.log
tail -f logs/payment_processing.log
tail -f logs/fraud_detection.log
```

### Key Metrics
- Revenue aggregation success rate
- Payment processing success rate
- Fraud detection accuracy
- Alert response time
- System uptime

## Troubleshooting

### Common Issues

**Script won't run**: Check Python version and dependencies
**API connection failures**: Verify credentials and network connectivity
**Configuration errors**: Check JSON syntax and file paths
**Permission errors**: Verify file and directory permissions

## Platform Integrations

### Supported Platforms
- **Gumroad**: Digital product sales, subscriptions
- **Fiverr**: Service revenue, gig performance
- **CrakRevenue**: Adult industry monetization
- **AdMob**: App monetization, ad revenue
- **Linktree**: Affiliate revenue, link performance

### Payment Gateways
- **Stripe**: Primary payment processing
- **PayPal**: Alternative payment method
- **Braintree**: Backup payment gateway

## Cross-Depot Integration

### Consort Depot
- Content monetization tracking
- Creator payment processing
- ROI analysis for content investments

### Scribe Depot
- Contract payment management
- Revenue sharing agreements
- Tax documentation

### Holdings Depot
- Investment tracking
- Revenue reinvestment coordination
- Cross-depot budget management

## Testing

### Dry-Run Mode
All scripts support dry-run mode for testing:
- Set `dry_run: true` in configuration files
- Scripts will simulate operations without executing
- Review output before enabling live mode

### Sample Data
Sample data files are provided in the `data/` directory for testing.

## Support

For issues or questions:
1. Check the logs directory for error messages
2. Review configuration files
3. Consult the operations manual
4. Contact the depot operations team

## Version History

- **v1.0** (2026-09-22): Initial deployment
  - Revenue aggregation automation
  - Payment processing automation
  - Fraud detection automation
  - Comprehensive documentation

---

**Last Updated**: 2026-09-22
**Depot**: TZI.CSH.DEP.SOUL (Tiapma'atzu'/ORACLE)

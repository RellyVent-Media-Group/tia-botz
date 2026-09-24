# CashingHouse Depot - Automation Setup Guide

## Environment Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git (for version control)
- Access to payment gateway APIs
- Access to platform APIs (Gumroad, Fiverr, CrakRevenue, AdMob, Linktree)

### System Requirements
- Minimum 2GB RAM
- 10GB disk space
- Stable internet connection
- Secure environment for credentials

## Installation

### Step 1: Clone or Copy Automation Directory
```bash
cd /path/to/cashinghouse-depot
cd automation
```

### Step 2: Create Virtual Environment (Recommended)
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

If requirements.txt doesn't exist, install core dependencies:
```bash
pip install requests python-dotenv pyyaml
```

### Step 4: Create Configuration Files
```bash
cp .env.example .env
```

## Configuration

### Environment Variables (.env)
Create `.env` file with the following variables:

```env
# Payment Gateway Credentials
STRIPE_API_KEY=your_stripe_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
BRAINTREE_MERCHANT_ID=your_braintree_merchant_id
BRAINTREE_PUBLIC_KEY=your_braintree_public_key
BRAINTREE_PRIVATE_KEY=your_braintree_private_key

# Platform API Credentials
GUMROAD_ACCESS_TOKEN=your_gumroad_token
FIVERR_ACCESS_TOKEN=your_fiverr_token
CRAKREVENUE_API_KEY=your_crakrevenue_key
ADMOB_APP_ID=your_admob_app_id
LINKTREE_API_KEY=your_linktree_key

# Database Configuration (if using database)
DATABASE_URL=your_database_url

# Notification Settings
SLACK_WEBHOOK_URL=your_slack_webhook
EMAIL_NOTIFICATIONS_ENABLED=true
EMAIL_RECIPIENTS=recipient1@example.com,recipient2@example.com

# Automation Settings
DRY_RUN=true
LOG_LEVEL=INFO
```

### Configuration Files

#### revenue_config.json
Configure revenue aggregation settings:
```json
{
  "dry_run": true,
  "platforms": ["gumroad", "fiverr", "crakrevenue", "admob", "linktree"],
  "currency": "USD",
  "aggregation_interval": "daily",
  "anomaly_thresholds": {
    "min_daily_revenue": 1000.0,
    "max_single_platform_percentage": 70.0,
    "min_transaction_count": 10
  }
}
```

#### payment_config.json
Configure payment processing settings:
```json
{
  "dry_run": true,
  "payment_gateways": ["stripe", "paypal", "braintree"],
  "retry_attempts": 3,
  "retry_delay_seconds": 60,
  "min_payment_amount": 1.00,
  "max_payment_amount": 100000.00
}
```

#### fraud_config.json
Configure fraud detection settings:
```json
{
  "dry_run": true,
  "max_single_transaction": 10000.00,
  "max_daily_transactions_per_user": 10,
  "max_daily_amount_per_user": 5000.00,
  "suspicious_countries": ["XX", "YY"],
  "velocity_check_window_minutes": 30
}
```

## Script Configuration

### Revenue Aggregation Script
**File**: `revenue_aggregation.py`

**Key Settings**:
- `config_file`: Path to revenue_config.json
- `data_file`: Path to platform_revenue.json
- `dry_run`: Enable/disable dry-run mode

**Usage**:
```bash
python3 revenue_aggregation.py
```

**Output**:
- Console report
- JSON results in `results/` directory
- Log file in `logs/` directory

### Payment Processing Script
**File**: `payment_processing.py`

**Key Settings**:
- `config_file`: Path to payment_config.json
- `data_file`: Path to payment_queue.json
- `dry_run`: Enable/disable dry-run mode

**Usage**:
```bash
python3 payment_processing.py
```

**Output**:
- Console report
- JSON results in `results/` directory
- Log file in `logs/` directory

### Fraud Detection Script
**File**: `fraud_detection.py`

**Key Settings**:
- `config_file`: Path to fraud_config.json
- `data_file`: Path to transactions.json
- `dry_run`: Enable/disable dry-run mode

**Usage**:
```bash
python3 fraud_detection.py
```

**Output**:
- Console report
- JSON results in `results/` directory
- Log file in `logs/` directory

## Scheduling

### Using Cron (Linux/Mac)

#### Revenue Aggregation (Daily)
```bash
# Run daily at 6 AM UTC
0 6 * * * cd /path/to/cashinghouse-depot/automation && /usr/bin/python3 revenue_aggregation.py >> logs/cron.log 2>&1
```

#### Payment Processing (Every Hour)
```bash
# Run every hour
0 * * * * cd /path/to/cashinghouse-depot/automation && /usr/bin/python3 payment_processing.py >> logs/cron.log 2>&1
```

#### Fraud Detection (Every 5 Minutes)
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/cashinghouse-depot/automation && /usr/bin/python3 fraud_detection.py >> logs/cron.log 2>&1
```

### Using Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily, hourly, etc.)
4. Set action: Start a program
5. Program: `python3.exe`
6. Arguments: `path\to\revenue_aggregation.py`
7. Start in: `path\to\automation\`

### Using systemd (Linux)

Create service files for each script:

#### revenue-aggregation.service
```ini
[Unit]
Description=CashingHouse Revenue Aggregation
After=network.target

[Service]
Type=oneshot
User=your_user
WorkingDirectory=/path/to/cashinghouse-depot/automation
ExecStart=/usr/bin/python3 revenue_aggregation.py

[Install]
WantedBy=multi-user.target
```

#### revenue-aggregation.timer
```ini
[Unit]
Description=Run Revenue Aggregation Daily

[Timer]
OnCalendar=*-*-* 06:00:00
Unit=revenue-aggregation.service

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable revenue-aggregation.timer
sudo systemctl start revenue-aggregation.timer
```

## Monitoring

### Log Monitoring
Monitor log files for errors and warnings:
```bash
tail -f logs/revenue_aggregation.log
tail -f logs/payment_processing.log
tail -f logs/fraud_detection.log
```

### Performance Monitoring
Monitor script execution time and resource usage:
```bash
time python3 revenue_aggregation.py
```

### Alert Setup
Configure alerts for:
- Script failures
- Payment processing errors
- Fraud detection alerts
- Revenue anomalies

### Dashboard Integration
Integrate with monitoring tools:
- Grafana for visualization
- Prometheus for metrics collection
- Slack for notifications
- Email for critical alerts

## Security

### Credential Management
- Never commit `.env` file to version control
- Use environment variables for sensitive data
- Rotate API keys regularly
- Use key management services for production

### File Permissions
```bash
chmod 600 .env
chmod 644 config/*.json
chmod 644 data/*.json
chmod 755 *.py
```

### API Security
- Use HTTPS for all API calls
- Implement rate limiting
- Validate all incoming data
- Use API key rotation
- Monitor for unauthorized access

### Data Protection
- Encrypt sensitive data at rest
- Use secure tokenization for payment data
- Implement data retention policies
- Regular security audits
- Compliance with PCI DSS

## Testing

### Dry-Run Testing
Test all scripts in dry-run mode first:
```bash
# Verify dry_run is set to true in config files
python3 revenue_aggregation.py
python3 payment_processing.py
python3 fraud_detection.py
```

### Sample Data Testing
Use sample data files in `data/` directory:
- `platform_revenue.json`
- `payment_queue.json`
- `transactions.json`

### Integration Testing
Test with actual API connections:
1. Set `dry_run=false` in config
2. Use small test amounts
3. Monitor results closely
4. Verify data accuracy
5. Check for errors

### Production Testing
Before full production deployment:
1. Test with real data in small batches
2. Monitor for 24-48 hours
3. Verify all integrations work
4. Check alert systems
5. Document any issues

## Maintenance

### Regular Maintenance Tasks
- Review and rotate API keys monthly
- Check disk space for logs and results
- Archive old log files
- Update dependencies regularly
- Review and update configuration

### Log Rotation
Configure log rotation to prevent disk space issues:
```bash
# Add to logrotate configuration
/path/to/cashinghouse-depot/automation/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

### Dependency Updates
Update dependencies regularly:
```bash
pip list --outdated
pip install --upgrade package_name
```

### Configuration Reviews
Review and update configuration:
- Adjust anomaly thresholds based on patterns
- Update fraud detection rules
- Modify payment routing based on performance
- Update platform API connections

## Troubleshooting

### Common Issues

#### Script Won't Run
**Problem**: Script fails to start
**Solution**:
1. Check Python version: `python3 --version`
2. Verify dependencies: `pip list`
3. Check file permissions: `ls -la *.py`
4. Review error logs

#### API Connection Failures
**Problem**: Can't connect to platform APIs
**Solution**:
1. Verify API credentials in `.env`
2. Check network connectivity
3. Review API rate limits
4. Check API status pages

#### Configuration Errors
**Problem**: Configuration not loading
**Solution**:
1. Verify config file paths
2. Check JSON syntax
3. Review error logs
4. Test with default config

#### Permission Errors
**Problem**: Can't write to files
**Solution**:
1. Check directory permissions
2. Verify user ownership
3. Create directories if missing
4. Check disk space

## Performance Optimization

### Script Optimization
- Use efficient data structures
- Implement caching where appropriate
- Batch API calls when possible
- Optimize database queries
- Use async I/O for network operations

### Resource Management
- Monitor memory usage
- Optimize file I/O
- Clean up temporary files
- Implement connection pooling
- Use appropriate data types

### API Optimization
- Implement request batching
- Use API pagination efficiently
- Cache API responses
- Implement retry logic with exponential backoff
- Monitor API rate limits

## Backup and Recovery

### Configuration Backup
Backup configuration files regularly:
```bash
tar -czf config_backup_$(date +%Y%m%d).tar.gz config/ .env
```

### Data Backup
Backup data files:
```bash
tar -czf data_backup_$(date +%Y%m%d).tar.gz data/
```

### Results Backup
Archive old results:
```bash
tar -czf results_archive_$(date +%Y%m%d).tar.gz results/
```

### Recovery Procedures
1. Restore configuration from backup
2. Restore data files
3. Verify API connections
4. Test script execution
5. Monitor for errors

---

**Last Updated**: 2026-09-22
**Next Review**: 2026-12-22

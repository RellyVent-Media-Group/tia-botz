# Holdings Depot Automation

Automated portfolio management, resource allocation, and risk monitoring for TZI.HLD.DEP.GNOSIS (Oracle/TIAPMAATZU).

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Run Automation Scripts

```bash
# Portfolio Rebalancing (dry run)
python portfolio_rebalancing.py

# Resource Allocation (dry run)
python resource_allocation.py

# Risk Monitoring
python risk_monitoring.py
```

## Directory Structure

```
automation/
├── portfolio_rebalancing.py    # Portfolio rebalancing automation
├── resource_allocation.py      # Resource allocation automation
├── risk_monitoring.py          # Risk monitoring automation
├── test_integrations.py        # API integration testing
├── health_check.py             # System health monitoring
├── crontab.conf                # Cron job configuration
├── config/                     # Configuration files
│   ├── portfolio_config.json
│   ├── allocation_config.json
│   └── risk_config.json
├── data/                       # Input data files
│   ├── portfolio_data.json
│   ├── depot_requests.json
│   └── market_data.json
├── logs/                       # Log files
│   ├── portfolio_rebalancing.log
│   ├── resource_allocation.log
│   └── risk_monitoring.log
├── results/                    # Output results
│   ├── rebalancing_results.json
│   ├── allocation_results.json
│   └── risk_monitoring_results.json
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Configuration

### Portfolio Rebalancing

Edit `config/portfolio_config.json` to set:
- Rebalancing threshold (percentage deviation)
- Minimum/maximum trade sizes
- Risk limits
- Allowed asset classes
- Schedule parameters

### Resource Allocation

Edit `config/allocation_config.json` to set:
- Total budget
- Allocation limits
- Approval hierarchy
- Distribution rules (15/40/30/15)

### Risk Monitoring

Edit `config/risk_config.json` to set:
- Risk thresholds (volatility, beta, drawdown)
- Concentration limits
- Liquidity requirements
- Monitoring schedule

## Scheduling

### Cron Jobs (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add these lines:
# Portfolio rebalancing - Weekly on Friday at 4 PM UTC
0 16 * * 5 cd /path/to/automation && /path/to/venv/bin/python portfolio_rebalancing.py >> logs/cron.log 2>&1

# Resource allocation - Daily at 9 AM UTC
0 9 * * * cd /path/to/automation && /path/to/venv/bin/python resource_allocation.py >> logs/cron.log 2>&1

# Risk monitoring - Every 5 minutes
*/5 * * * * cd /path/to/automation && /path/to/venv/bin/python risk_monitoring.py >> logs/cron.log 2>&1
```

## Testing

### Integration Testing

Test all API integrations with partner depots:

```bash
# Run comprehensive integration tests
python test_integrations.py
```

This will test:
- Consort Depot API
- CashingHouse Depot API
- Scribe Depot API
- Portfolio API
- Trading API
- Market Data API

### Script Testing

Each script includes sample data for testing:

```bash
# Test portfolio rebalancing
python portfolio_rebalancing.py

# Test resource allocation
python resource_allocation.py

# Test risk monitoring
python risk_monitoring.py
```

## Health Monitoring

Run system health checks:

```bash
# Run health check
python health_check.py
```

This will check:
- System resource usage (CPU, memory, disk)
- Automation script availability
- Configuration file integrity
- Log file health
- Environment variable configuration

Alerts will be sent via configured notification channels if issues are detected.

## Deployment

### Cron Job Setup

Install automated scheduling:

```bash
# Edit crontab configuration to update paths
nano crontab.conf

# Install cron jobs
crontab crontab.conf

# Verify installation
crontab -l
```

### Deployment Checklist

Follow the comprehensive deployment checklist:

```bash
# View deployment checklist
# See: ../guides/deployment-checklist.md
```

The checklist covers:
- Pre-deployment preparation
- API credential configuration
- Environment setup
- Integration testing
- Dry-run validation
- Live trading enablement
- Scheduling configuration
- Monitoring setup
- Go-live verification
- Post-deployment monitoring

## Live Trading

To enable live trading:

1. Set `DRY_RUN=false` in `.env`
2. Configure API credentials for your trading platform
3. Test with small amounts first
4. Monitor initial executions closely

## Monitoring

Check logs for activity:

```bash
# View latest logs
tail -f logs/portfolio_rebalancing.log
tail -f logs/resource_allocation.log
tail -f logs/risk_monitoring.log
```

## Troubleshooting

See the full Automation Setup Guide in `../guides/automation-setup-guide.md` for detailed troubleshooting steps.

## Security

- Never commit `.env` file to version control
- Use strong, unique API keys
- Rotate credentials regularly
- Enable two-factor authentication where available
- Monitor for unauthorized access

## Support

For issues or questions, refer to:
- Operations Manual: `../operations-manual.md`
- Quick Start Guide: `../guides/quick-start-guide.md`
- Integration Guide: `../guides/integration-guide.md`
- Automation Setup Guide: `../guides/automation-setup-guide.md`

## Version

1.0 - Initial deployment
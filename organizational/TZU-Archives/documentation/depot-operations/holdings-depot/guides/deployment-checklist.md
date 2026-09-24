# Holdings Depot Live Deployment Checklist

**Depot ID:** TZI.HLD.DEP.GNOSIS
**Public Facing:** Oracle/TIAPMAATZU
**Version:** 1.0
**Last Updated:** 2026-09-22

---

## Overview

This checklist provides a step-by-step guide for deploying the Holdings Depot automation system to live production. Follow each section in order to ensure a safe and successful deployment.

## Table of Contents

1. [Pre-Deployment Preparation](#pre-deployment-preparation)
2. [API Credential Configuration](#api-credential-configuration)
3. [Environment Setup](#environment-setup)
4. [Integration Testing](#integration-testing)
5. [Dry-Run Validation](#dry-run-validation)
6. [Live Trading Enablement](#live-trading-enablement)
7. [Scheduling Configuration](#scheduling-configuration)
8. [Monitoring Setup](#monitoring-setup)
9. [Go-Live Verification](#go-live-verification)
10. [Post-Deployment Monitoring](#post-deployment-monitoring)

---

## Pre-Deployment Preparation

### 1. System Requirements Verification

- [ ] Python 3.8 or higher installed
- [ ] pip package manager available
- [ ] 8GB RAM minimum (16GB recommended)
- [ ] 50GB available storage
- [ ] Stable internet connection
- [ ] Cron or Task Scheduler available
- [ ] Git installed (for version control)

### 2. Directory Structure Verification

- [ ] Automation directory exists and contains all scripts
- [ ] Config directory exists with all configuration files
- [ ] Data directory exists with sample data
- [ ] Logs directory exists and is writable
- [ ] Results directory exists and is writable

### 3. Backup Current State

- [ ] Backup current `.env` file (if exists)
- [ ] Backup configuration files
- [ ] Backup any existing data files
- [ ] Document current system state

### 4. Review Documentation

- [ ] Read Operations Manual
- [ ] Read Automation Setup Guide
- [ ] Read Partner Depot Integration Guide
- [ ] Review security best practices
- [ ] Understand risk management procedures

---

## API Credential Configuration

### 5. Obtain API Credentials

#### Core APIs
- [ ] Portfolio Management System API key and secret
- [ ] Trading Platform API key and secret
- [ ] Market Data Provider API key

#### Partner Depot APIs
- [ ] Consort Depot API key and URL
- [ ] CashingHouse Depot API key and URL
- [ ] Scribe Depot API key and URL

#### Notification Services
- [ ] Email SMTP credentials (if using email notifications)
- [ ] Slack webhook URL (if using Slack)
- [ ] Telegram bot token and chat ID (if using Telegram)
- [ ] SMS API credentials (if using SMS)

### 6. Configure Environment Variables

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all API credentials
- [ ] Set API URLs for all services
- [ ] Configure database connection (if using database)
- [ ] Set notification service credentials
- [ ] Configure automation settings
- [ ] Set timezone to UTC
- [ ] Set log level to INFO
- [ ] Keep `DRY_RUN=true` for now

### 7. Verify Environment Configuration

- [ ] Check that `.env` file exists
- [ ] Verify no placeholder values remain
- [ ] Test that environment variables load correctly
- [ ] Validate all API URLs are accessible
- [ ] Confirm notification settings are correct

---

## Environment Setup

### 8. Install Dependencies

- [ ] Create Python virtual environment
- [ ] Activate virtual environment
- [ ] Install required packages from `requirements.txt`
- [ ] Verify all packages installed successfully
- [ ] Test import of all required modules

### 9. Validate Configuration Files

- [ ] `portfolio_config.json` exists and is valid JSON
- [ ] `allocation_config.json` exists and is valid JSON
- [ ] `risk_config.json` exists and is valid JSON
- [ ] All configuration values are appropriate
- [ ] Risk thresholds are set correctly
- [ ] Budget allocations sum to 100%

### 10. Prepare Data Files

- [ ] `portfolio_data.json` contains current portfolio data
- [ ] `depot_requests.json` contains current requests
- [ ] Market data files are up to date
- [ ] All data files are valid JSON
- [ ] Data values are within expected ranges

---

## Integration Testing

### 11. Run Integration Tests

- [ ] Navigate to automation directory
- [ ] Run `python test_integrations.py`
- [ ] Verify all tests pass
- [ ] Review test results in `results/integration_test_results.json`
- [ ] Fix any failing tests before proceeding

### 12. Test Individual APIs

#### Portfolio API
- [ ] Test connection to Portfolio API
- [ ] Verify authentication works
- [ ] Test portfolio data retrieval
- [ ] Validate data format

#### Trading API
- [ ] Test connection to Trading API
- [ ] Verify authentication works
- [ ] Test account endpoint (read-only)
- [ ] Validate response format

#### Market Data API
- [ ] Test connection to Market Data API
- [ ] Verify authentication works
- [ ] Test quote retrieval
- [ ] Validate data accuracy

#### Consort Depot API
- [ ] Test connection to Consort Depot
- [ ] Verify authentication works
- [ ] Test budget utilization endpoint
- [ ] Validate response format

#### CashingHouse Depot API
- [ ] Test connection to CashingHouse Depot
- [ ] Verify authentication works
- [ ] Test financial data endpoint
- [ ] Validate response format

#### Scribe Depot API
- [ ] Test connection to Scribe Depot
- [ ] Verify authentication works
- [ ] Test documentation endpoint
- [ ] Validate response format

### 13. Test Notification Systems

- [ ] Send test email notification
- [ ] Send test Slack notification
- [ ] Send test Telegram notification
- [ ] Verify all notifications are received
- [ ] Configure notification preferences

---

## Dry-Run Validation

### 14. Test Portfolio Rebalancing (Dry Run)

- [ ] Run `python portfolio_rebalancing.py`
- [ ] Verify script executes without errors
- [ ] Review calculated rebalancing actions
- [ ] Validate actions are reasonable
- [ ] Check log file for any warnings
- [ ] Review results in `results/rebalancing_results.json`

### 15. Test Resource Allocation (Dry Run)

- [ ] Run `python resource_allocation.py`
- [ ] Verify script executes without errors
- [ ] Review allocation decisions
- [ ] Validate budget distribution
- [ ] Check approval hierarchy works correctly
- [ ] Review results in `results/allocation_results.json`

### 16. Test Risk Monitoring (Dry Run)

- [ ] Run `python risk_monitoring.py`
- [ ] Verify script executes without errors
- [ ] Review risk profiles for all assets
- [ ] Validate risk calculations
- [ ] Check alert generation works
- [ ] Review results in `results/risk_monitoring_results.json`

### 17. Test Health Check

- [ ] Run `python health_check.py`
- [ ] Verify all system checks pass
- [ ] Review resource usage
- [ ] Validate all files exist
- [ ] Check for any alerts
- [ ] Review results in `results/health_check_report.json`

### 18. Validate Complete Workflow

- [ ] Run all three automation scripts in sequence
- [ ] Verify no conflicts between scripts
- [ ] Check all results files are generated
- [ ] Validate data consistency
- [ ] Review combined output

---

## Live Trading Enablement

### 19. Pre-Live Trading Safety Checks

- [ ] Confirm all dry-run tests passed
- [ ] Verify all API integrations are working
- [ ] Ensure notification systems are configured
- [ ] Confirm emergency stop procedures are documented
- [ ] Verify team is available for monitoring
- [ ] Have rollback plan ready

### 20. Start with Small Positions

- [ ] Set maximum position size to conservative limit (e.g., $1,000)
- [ ] Set maximum daily trades to low number (e.g., 5)
- [ ] Enable daily loss limit (e.g., $500)
- [ ] Configure emergency stop to trigger on loss limit

### 21. Enable Live Trading (Phase 1)

- [ ] Set `DRY_RUN=false` in `.env`
- [ ] Set `DRY_RUN_CONFIRMATION=true` in `.env`
- [ ] Restart any running services
- [ ] Monitor first execution closely
- [ ] Verify trades execute correctly
- [ ] Confirm trade notifications are received

### 22. Monitor Initial Executions

- [ ] Watch first portfolio rebalancing execution
- [ ] Verify trades match calculated actions
- [ ] Confirm position sizes are correct
- [ ] Check for any errors or warnings
- [ ] Validate results in results files
- [ ] Review log files for issues

### 23. Gradual Increase

- [ ] After 3 successful executions, increase position size limit
- [ ] After 1 week of successful operation, increase daily trade limit
- [ ] After 2 weeks of successful operation, increase loss limit
- [ ] Monitor system performance at each stage
- [ ] Continue until full production limits are reached

---

## Scheduling Configuration

### 24. Configure Cron Jobs

- [ ] Update paths in `crontab.conf` to match your system
- [ ] Update Python virtual environment path
- [ ] Update working directory path
- [ ] Review all scheduled tasks
- [ ] Adjust schedules as needed for your timezone
- [ ] Test cron job syntax with `crontab -l` (after installation)

### 25. Install Cron Jobs

- [ ] Backup current crontab: `crontab -l > crontab.backup`
- [ ] Install new crontab: `crontab crontab.conf`
- [ ] Verify installation: `crontab -l`
- [ ] Test first scheduled execution
- [ ] Monitor log files for cron execution
- [ ] Verify all jobs run at expected times

### 26. Configure Schedule-Specific Settings

- [ ] Set `REBALANCE_ENABLED=true` in `.env`
- [ ] Set `ALLOCATION_ENABLED=true` in `.env`
- [ ] Set `RISK_MONITORING_ENABLED=true` in `.env`
- [ ] Set `REPORT_ENABLED=true` in `.env`
- [ ] Configure individual schedules in `.env`
- [ ] Verify schedules match cron configuration

---

## Monitoring Setup

### 27. Configure Health Monitoring

- [ ] Set `HEALTH_CHECK_ENABLED=true` in `.env`
- [ ] Set health check port (default: 8080)
- [ ] Configure performance thresholds
- [ ] Enable critical alert notifications
- [ ] Test health check endpoint
- [ ] Verify alerts are sent when thresholds exceeded

### 28. Configure Log Monitoring

- [ ] Set `LOG_LEVEL=INFO` in `.env`
- [ ] Configure log file rotation
- [ ] Set log retention period
- [ ] Enable log rotation cron job
- [ ] Test log file creation
- [ ] Verify log rotation works

### 29. Configure Performance Monitoring

- [ ] Set `PERFORMANCE_MONITORING_ENABLED=true` in `.env`
- [ ] Configure CPU threshold
- [ ] Configure memory threshold
- [ ] Configure disk threshold
- [ ] Test performance alerts
- [ ] Verify alert notifications

### 30. Set Up Dashboard

- [ ] Configure monitoring dashboard (if available)
- [ ] Add system resource monitors
- [ ] Add automation script status monitors
- [ ] Add API integration health monitors
- [ ] Configure alert displays
- [ ] Test dashboard functionality

---

## Go-Live Verification

### 31. Final Pre-Live Checklist

- [ ] All dry-run tests passed
- [ ] All API integrations tested and working
- [ ] All notification systems configured and tested
- [ ] All cron jobs installed and tested
- [ ] Health monitoring configured and tested
- [ ] Team briefed on procedures
- [ ] Emergency procedures documented
- [ ] Rollback plan ready

### 32. Enable Full Production Mode

- [ ] Set `DRY_RUN=false` in `.env`
- [ ] Set `DRY_RUN_CONFIRMATION=false` in `.env`
- [ ] Set all production limits to final values
- [ ] Restart all services
- [ ] Verify all systems start correctly
- [ ] Monitor initial executions

### 33. Verify System Operation

- [ ] Portfolio rebalancing runs successfully
- [ ] Resource allocation runs successfully
- [ ] Risk monitoring runs successfully
- [ ] Health checks pass
- [ ] Notifications are received
- [ ] Reports are generated

### 34. Team Communication

- [ ] Notify team of go-live
- [ ] Share monitoring dashboard access
- [ ] Distribute emergency contact information
- [ ] Confirm on-call schedule
- [ ] Document go-live time

---

## Post-Deployment Monitoring

### 35. First 24 Hours

- [ ] Monitor all scheduled executions
- [ ] Review all log files for errors
- [ ] Check all result files for accuracy
- [ ] Verify all notifications are received
- [ ] Monitor system resource usage
- [ ] Respond to any alerts immediately

### 36. First Week

- [ ] Daily review of system performance
- [ ] Weekly review of trading results
- [ ] Check all API integrations remain healthy
- [ ] Review risk monitoring alerts
- [ ] Validate resource allocation decisions
- [ ] Update documentation with any changes

### 37. First Month

- [ ] Comprehensive performance review
- [ ] Analyze trading results vs expectations
- [ ] Review risk management effectiveness
- [ ] Evaluate notification frequency
- [ ] Assess system resource needs
- [ ] Plan any necessary adjustments

### 38. Ongoing Monitoring

- [ ] Daily health check reviews
- [ ] Weekly performance reports
- [ ] Monthly comprehensive reviews
- [ ] Quarterly strategy reviews
- [ ] Annual system audits
- [ ] Continuous improvement

---

## Emergency Procedures

### 39. Emergency Stop

If critical issues arise:

1. **Immediate Actions**
   - [ ] Set `DRY_RUN=true` in `.env`
   - [ ] Stop all cron jobs: `crontab -r` (or comment out jobs)
   - [ ] Kill any running automation processes
   - [ ] Notify team immediately

2. **Investigation**
   - [ ] Review log files for errors
   - [ ] Check API integration status
   - [ ] Review system resources
   - [ ] Identify root cause

3. **Recovery**
   - [ ] Fix identified issues
   - [ ] Test fixes in dry-run mode
   - [ ] Gradually re-enable automation
   - [ ] Monitor closely

### 40. Rollback Procedure

If rollback is necessary:

1. **Data Rollback**
   - [ ] Restore from backup
   - [ ] Verify data integrity
   - [ ] Reconcile any discrepancies

2. **Configuration Rollback**
   - [ ] Restore previous `.env` file
   - [ ] Restore previous configuration files
   - [ ] Verify settings are correct

3. **System Rollback**
   - [ ] Restore previous cron configuration
   - [ ] Restart services
   - [ ] Verify system operation

---

## Maintenance Schedule

### 41. Daily Tasks

- [ ] Review health check reports
- [ ] Check log files for errors
- [ ] Monitor system resources
- [ ] Review critical alerts

### 42. Weekly Tasks

- [ ] Review automation results
- [ ] Check API integration health
- [ ] Review risk monitoring alerts
- [ ] Validate data consistency

### 43. Monthly Tasks

- [ ] Comprehensive performance review
- [ ] Review and update documentation
- [ ] Test backup and recovery procedures
- [ ] Review security settings

### 44. Quarterly Tasks

- [ ] Comprehensive system audit
- [ ] Review and update risk thresholds
- [ ] Evaluate automation effectiveness
- [ ] Plan system improvements

---

## Completion

### 45. Final Verification

- [ ] All checklist items completed
- [ ] System operating normally
- [ ] Team trained on procedures
- [ ] Documentation updated
- [ ] Monitoring established
- [ ] Emergency procedures tested

### 46. Sign-Off

**Deployed By**: _______________________  **Date**: _____________

**Reviewed By**: _______________________  **Date**: _____________

**Approved By**: _______________________  **Date**: _____________

---

## Additional Resources

- **Operations Manual**: `../operations-manual.md`
- **Automation Setup Guide**: `../guides/automation-setup-guide.md`
- **Partner Depot Integration Guide**: `../guides/partner-depot-integration-guide.md`
- **Troubleshooting Guide**: `../guides/troubleshooting-guide.md`
- **Support Contacts**: [Add your support contacts here]

---

**Checklist Version**: 1.0
**Last Updated**: 2026-09-22
**Next Review**: 2026-12-22

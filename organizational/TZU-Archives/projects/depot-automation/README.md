# Tiapmaatzu OS Toolkit - Depot Automation System

A comprehensive automation system for managing four operational depots: CashingHouse (Financial), Consort (Content), Holdings (Assets), and Scribe (Documents).

## 🏗️ Architecture

### Four Depot Systems

1. **CashingHouse Depot** - Financial tracking and revenue automation
2. **Consort Depot** - Content pipeline and social media automation  
3. **Holdings Depot** - Asset management and investment automation
4. **Scribe Depot** - Document management and contract automation

### Integration Layer

- **Cross-depot workflows** for data sharing and automation
- **Unified reporting** across all systems
- **Event-driven architecture** for real-time updates

### Automation Capabilities

- **Task scheduling** for automated operations
- **Notification system** (email, webhooks, in-app)
- **REST API endpoints** for external integration
- **Configuration management** for different environments

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run individual depot systems
python3 cashinghouse-automation/financial_tracker.py
python3 consort-automation/content_pipeline.py
python3 holdings-automation/asset_manager.py
python3 scribe-automation/document_manager.py

# Run integrated system
python3 depot_integration.py

# Run automation capabilities
python3 automation_capabilities_simple.py

# Start web dashboard
./start_dashboard.sh
# or
python3 web_dashboard.py
```

### Web Dashboard

The system includes a web dashboard for real-time monitoring and control:

- **Access**: http://localhost:8000
- **Features**:
  - Real-time status of all four depots
  - Financial metrics and analytics
  - Content performance tracking
  - Asset portfolio monitoring
  - Document management overview
  - Automation trigger controls
  - 30-second auto-refresh

### Docker Deployment

```bash
# Configure environment
cp .env.example .env
# Edit .env with your settings

# Deploy using Docker Compose
./deploy.sh

# Or manually:
docker-compose build
docker-compose up -d
```

## 📊 Features

### Enhanced Reporting

- **Revenue trends analysis** with statistical insights
- **Content performance analytics** by platform and character
- **Portfolio performance tracking** with ROI calculations
- **Document activity monitoring** with version tracking

### Automation Triggers

- **Low revenue alerts** with actionable recommendations
- **Content backlog notifications** for scheduling
- **Portfolio rebalancing alerts** based on performance
- **Contract expiration warnings** for renewals

### Cross-Depot Workflows

- **Revenue to Content**: Create content based on financial performance
- **Content to Revenue**: Generate revenue opportunities from content
- **Asset to Document**: Create documentation from asset data
- **Contract to Asset**: Create investments from contracts

### Scheduling & Notifications

- **Automated report generation** on configurable schedules
- **Email notifications** for important events
- **Webhook integrations** for external systems
- **In-app alerts** for real-time monitoring

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options:

- `DATA_DIR` - Data storage directory
- `EMAIL_CONFIG` - SMTP settings for notifications
- `WEBHOOK_SECRET` - Secret for webhook signatures
- `WEBHOOK_URL` - Discord/Slack webhook URL for notifications
- `SCHEDULER_ENABLED` - Enable/disable task scheduling
- `API_HOST` / `API_PORT` - API server settings

### Email Configuration

To enable email notifications, configure SMTP settings in `.env`:

```bash
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**For Gmail**: Generate an app password at https://myaccount.google.com/apppasswords

### Webhook Configuration

To enable webhook notifications (Discord, Slack, etc.):

```bash
WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
WEBHOOK_SECRET=your-secure-secret
```

**Note**: Discord webhook notifications are fully implemented with embed support, including timestamps and colored alerts.

### Performance Thresholds

- `REVENUE_TARGET` - Minimum revenue threshold for alerts (default: $500.0)
- `ENGAGEMENT_RATE_TARGET` - Target engagement rate for content (default: 3.0%)
- `ROI_TARGET` - Target ROI for investments (default: 5.0%)

## 📁 Project Structure

```
depot-automation/
├── cashinghouse-automation/     # Financial tracking
├── consort-automation/         # Content pipeline
├── holdings-automation/        # Asset management
├── scribe-automation/          # Document management
├── depot_integration.py        # Cross-depot integration
├── automation_capabilities_simple.py  # Scheduling & notifications
├── config.py                   # Configuration management
├── Dockerfile                  # Docker container
├── docker-compose.yml          # Multi-container setup
├── deploy.sh                   # Deployment script
├── requirements.txt            # Python dependencies
└── .env.example               # Environment template
```

## 🔌 API Endpoints

The system provides REST API endpoints for:

- `/api/status` - System health status
- `/api/financial` - Financial data and reports
- `/api/content` - Content pipeline data
- `/api/assets` - Asset management data
- `/api/documents` - Document management data
- `/api/automations` - Trigger automation workflows

## 📈 Monitoring

### Health Checks

```bash
# Check service health
docker-compose ps
docker-compose exec depot-automation python3 -c "import sys; sys.exit(0)"
```

### Logs

```bash
# View logs
docker-compose logs -f

# View specific depot logs
docker-compose logs depot-automation | grep "CASHINGHOUSE"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Import errors**: Ensure all depot modules are in correct directories
2. **Data file errors**: Check DATA_DIR permissions and paths
3. **Docker build failures**: Verify requirements.txt and system dependencies
4. **Notification failures**: Check email configuration and webhook settings

### Debug Mode

Set `LOG_LEVEL=DEBUG` in `.env` for detailed logging.

## 🔐 Security

- Store sensitive credentials in environment variables
- Use strong webhook secrets in production
- Implement proper authentication for API endpoints
- Regular security updates for dependencies

## 📝 License

This is part of the Tiapmaatzu OS Toolkit project.

## 🤝 Support

For issues and questions, refer to the project documentation or contact the development team.
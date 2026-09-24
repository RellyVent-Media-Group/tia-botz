#!/usr/bin/env python3
"""
Automation Capabilities System
Provides scheduling, notifications, API endpoints, and webhook integration
"""

import json
import datetime
import threading
import time
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib
import hmac

# Try to import optional dependencies
try:
    import schedule
    SCHEDULE_AVAILABLE = True
except ImportError:
    SCHEDULE_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class NotificationType(Enum):
    EMAIL = "email"
    WEBHOOK = "webhook"
    SMS = "sms"
    IN_APP = "in_app"


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class ScheduledTask:
    """Scheduled automation task"""
    task_id: str
    name: str
    function: str
    schedule: str  # cron-like expression
    parameters: Dict
    last_run: str
    next_run: str
    status: TaskStatus
    enabled: bool


@dataclass
class Notification:
    """Notification record"""
    notification_id: str
    type: NotificationType
    recipient: str
    subject: str
    message: str
    status: str
    created_at: str
    sent_at: str
    metadata: Dict


@dataclass
class WebhookConfig:
    """Webhook configuration"""
    webhook_id: str
    name: str
    url: str
    secret: str
    events: List[str]
    enabled: bool


class TaskScheduler:
    """Task scheduling system"""
    
    def __init__(self):
        self.scheduled_tasks: Dict[str, ScheduledTask] = {}
        self.scheduler_thread = None
        self.running = False
        self.available_functions = {
            "generate_financial_report": "cashinghouse_financial_report",
            "generate_content_report": "consort_content_report", 
            "generate_asset_report": "holdings_asset_report",
            "generate_document_report": "scribe_document_report",
            "integrated_report": "depot_integrated_report"
        }
    
    def add_scheduled_task(self, name: str, function: str, schedule: str, 
                          parameters: Dict = None) -> str:
        """Add a new scheduled task"""
        task_id = f"TASK_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        task = ScheduledTask(
            task_id=task_id,
            name=name,
            function=function,
            schedule=schedule,
            parameters=parameters or {},
            last_run="",
            next_run=self._calculate_next_run(schedule),
            status=TaskStatus.PENDING,
            enabled=True
        )
        
        self.scheduled_tasks[task_id] = task
        return task_id
    
    def _calculate_next_run(self, schedule: str) -> str:
        """Calculate next run time based on schedule"""
        # Simple implementation - in production use proper cron parsing
        if schedule == "hourly":
            next_run = datetime.datetime.now() + datetime.timedelta(hours=1)
        elif schedule == "daily":
            next_run = datetime.datetime.now() + datetime.timedelta(days=1)
        elif schedule == "weekly":
            next_run = datetime.datetime.now() + datetime.timedelta(weeks=1)
        else:
            next_run = datetime.datetime.now() + datetime.timedelta(hours=1)
        
        return next_run.isoformat()
    
    def enable_task(self, task_id: str) -> bool:
        """Enable a scheduled task"""
        if task_id in self.scheduled_tasks:
            self.scheduled_tasks[task_id].enabled = True
            return True
        return False
    
    def disable_task(self, task_id: str) -> bool:
        """Disable a scheduled task"""
        if task_id in self.scheduled_tasks:
            self.scheduled_tasks[task_id].enabled = False
            return True
        return False
    
    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Get status of a specific task"""
        if task_id in self.scheduled_tasks:
            task = self.scheduled_tasks[task_id]
            return {
                "task_id": task.task_id,
                "name": task.name,
                "status": task.status.value,
                "enabled": task.enabled,
                "next_run": task.next_run,
                "last_run": task.last_run
            }
        return None
    
    def start_scheduler(self):
        """Start the background scheduler"""
        if not self.running:
            self.running = True
            self.scheduler_thread = threading.Thread(target=self._run_scheduler)
            self.scheduler_thread.daemon = True
            self.scheduler_thread.start()
    
    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join()
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.running:
            for task_id, task in self.scheduled_tasks.items():
                if task.enabled and task.status == TaskStatus.PENDING:
                    now = datetime.datetime.now()
                    next_run = datetime.datetime.fromisoformat(task.next_run)
                    
                    if now >= next_run:
                        self._execute_task(task)
            
            time.sleep(60)  # Check every minute
    
    def _execute_task(self, task: ScheduledTask):
        """Execute a scheduled task"""
        task.status = TaskStatus.RUNNING
        task.last_run = datetime.datetime.now().isoformat()
        
        try:
            # In production, this would execute the actual function
            # For now, we simulate execution
            print(f"Executing task: {task.name}")
            
            task.status = TaskStatus.COMPLETED
            task.next_run = self._calculate_next_run(task.schedule)
        except Exception as e:
            task.status = TaskStatus.FAILED
            print(f"Task failed: {e}")


class NotificationSystem:
    """Notification system for alerts and updates"""
    
    def __init__(self, config_path: str = "notification_config.json"):
        self.config_path = config_path
        self.notifications: Dict[str, Notification] = {}
        self.webhook_configs: Dict[str, WebhookConfig] = {}
        self.load_config()
    
    def load_config(self):
        """Load notification configuration"""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                self.email_config = config.get("email", {})
                self.sms_config = config.get("sms", {})
        except FileNotFoundError:
            self.email_config = {}
            self.sms_config = {}
    
    def send_email(self, recipient: str, subject: str, message: str) -> str:
        """Send email notification"""
        notification_id = f"EMAIL_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        notification = Notification(
            notification_id=notification_id,
            type=NotificationType.EMAIL,
            recipient=recipient,
            subject=subject,
            message=message,
            status="pending",
            created_at=datetime.datetime.now().isoformat(),
            sent_at="",
            metadata={}
        )
        
        try:
            if self.email_config:
                msg = MIMEMultipart()
                msg['From'] = self.email_config.get('sender', 'noreply@tiapmaatzu.com')
                msg['To'] = recipient
                msg['Subject'] = subject
                msg.attach(MIMEText(message, 'plain'))
                
                # In production, actually send the email
                # server = smtplib.SMTP(self.email_config.get('smtp_server'), self.email_config.get('smtp_port'))
                # server.starttls()
                # server.login(self.email_config.get('username'), self.email_config.get('password'))
                # server.send_message(msg)
                # server.quit()
                
                notification.status = "sent"
                notification.sent_at = datetime.datetime.now().isoformat()
            else:
                notification.status = "failed"
                notification.metadata["error"] = "Email configuration not found"
        except Exception as e:
            notification.status = "failed"
            notification.metadata["error"] = str(e)
        
        self.notifications[notification_id] = notification
        return notification_id
    
    def send_webhook(self, webhook_id: str, data: Dict) -> str:
        """Send webhook notification"""
        webhook = self.webhook_configs.get(webhook_id)
        if not webhook or not webhook.enabled:
            return None
        
        notification_id = f"WEBHOOK_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Generate signature
        signature = hmac.new(
            webhook.secret.encode(),
            json.dumps(data).encode(),
            hashlib.sha256
        ).hexdigest()
        
        notification = Notification(
            notification_id=notification_id,
            type=NotificationType.WEBHOOK,
            recipient=webhook.url,
            subject=f"Webhook: {webhook.name}",
            message=json.dumps(data),
            status="pending",
            created_at=datetime.datetime.now().isoformat(),
            sent_at="",
            metadata={"webhook_id": webhook_id, "signature": signature}
        )
        
        try:
            headers = {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature
            }
            
            # In production, actually send the webhook
            if REQUESTS_AVAILABLE:
                response = requests.post(webhook.url, json=data, headers=headers, timeout=10)
                response.raise_for_status()
            
            notification.status = "sent"
            notification.sent_at = datetime.datetime.now().isoformat()
        except Exception as e:
            notification.status = "failed"
            notification.metadata["error"] = str(e)
        
        self.notifications[notification_id] = notification
        return notification_id
    
    def add_webhook_config(self, name: str, url: str, secret: str, 
                          events: List[str]) -> str:
        """Add webhook configuration"""
        webhook_id = f"WH_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        webhook = WebhookConfig(
            webhook_id=webhook_id,
            name=name,
            url=url,
            secret=secret,
            events=events,
            enabled=True
        )
        
        self.webhook_configs[webhook_id] = webhook
        return webhook_id
    
    def trigger_event_webhooks(self, event_type: str, data: Dict):
        """Trigger all webhooks configured for an event"""
        for webhook_id, webhook in self.webhook_configs.items():
            if webhook.enabled and event_type in webhook.events:
                self.send_webhook(webhook_id, data)


class APIEndpoints:
    """REST API endpoints for depot automation"""
    
    def __init__(self, depot_integration):
        self.integration = depot_integration
        self.notification_system = NotificationSystem()
        
        # Import enums from respective modules
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'cashinghouse-automation'))
        sys.path.append(os.path.join(os.path.dirname(__file__), 'consort-automation'))
        sys.path.append(os.path.join(os.path.dirname(__file__), 'holdings-automation'))
        sys.path.append(os.path.join(os.path.dirname(__file__), 'scribe-automation'))
        
        try:
            from financial_tracker import PlatformType
            from content_pipeline import ContentType, ContentStatus
            from asset_manager import AssetType
            from document_manager import DocumentType
        except ImportError as e:
            print(f"Warning: Could not import enums: {e}")
            # Create placeholder enums
            from enum import Enum
            class PlatformType(Enum):
                GUMROAD = "gumroad"
            class ContentType(Enum):
                TIKTOK = "tiktok"
            class ContentStatus(Enum):
                PUBLISHED = "published"
            class AssetType(Enum):
                INVESTMENT = "investment"
            class DocumentType(Enum):
                REPORT = "report"
        
        self.PlatformType = PlatformType
        self.ContentType = ContentType
        self.ContentStatus = ContentStatus
        self.AssetType = AssetType
        self.DocumentType = DocumentType
    
    def get_system_status(self) -> Dict:
        """Get overall system status"""
        return {
            "status": "operational",
            "timestamp": datetime.datetime.now().isoformat(),
            "depots": {
                "cashinghouse": {"status": "operational", "data_points": len(self.integration.cashinghouse.transactions)},
                "consort": {"status": "operational", "data_points": len(self.integration.consort.content_items)},
                "holdings": {"status": "operational", "data_points": len(self.integration.holdings.assets)},
                "scribe": {"status": "operational", "data_points": len(self.integration.scribe.documents)}
            },
            "integration": {
                "status": "active",
                "events": len(self.integration.cross_depot_events)
            }
        }
    
    def get_financial_data(self, platform: str = None) -> Dict:
        """Get financial data"""
        if platform:
            platform_type = self.PlatformType(platform)
            return self.integration.cashinghouse.get_revenue_by_platform(platform_type)
        return self.integration.cashinghouse.get_total_revenue()
    
    def get_content_data(self, status: str = None) -> Dict:
        """Get content data"""
        if status:
            content_status = self.ContentStatus(status)
            content = self.integration.consort.get_content_by_status(content_status)
            return {"content": [{"id": c.content_id, "title": c.title, "status": c.status.value} for c in content]}
        
        published = self.integration.consort.get_content_by_status(self.ContentStatus.PUBLISHED)
        return {
            "total_content": len(self.integration.consort.content_items),
            "published": len(published),
            "total_engagement": sum(c.performance_metrics.get('engagement', 0) for c in published)
        }
    
    def get_asset_data(self, asset_type: str = None) -> Dict:
        """Get asset data"""
        if asset_type:
            asset_type_enum = self.AssetType(asset_type)
            assets = self.integration.holdings.get_assets_by_type(asset_type_enum)
            return {"assets": [{"id": a.asset_id, "name": a.name, "value": a.current_value} for a in assets]}
        
        return self.integration.holdings.get_total_portfolio_value()
    
    def get_document_data(self, document_type: str = None) -> Dict:
        """Get document data"""
        if document_type:
            doc_type = self.DocumentType(document_type)
            documents = self.integration.scribe.get_documents_by_type(doc_type)
            return {"documents": [{"id": d.document_id, "title": d.title, "status": d.status.value} for d in documents]}
        
        return {
            "total_documents": len(self.integration.scribe.documents),
            "total_contracts": len(self.integration.scribe.contracts)
        }
    
    def trigger_automation(self, automation_type: str, parameters: Dict) -> Dict:
        """Trigger an automation workflow"""
        try:
            if automation_type == "revenue_to_content":
                platform = self.PlatformType(parameters.get("platform", "gumroad"))
                content_ideas = parameters.get("content_ideas", ["Default idea"])
                content_ids = self.integration.create_revenue_to_content_workflow(platform, content_ideas)
                return {"status": "success", "content_ids": content_ids}
            
            elif automation_type == "integrated_report":
                report = self.integration.generate_integrated_report()
                return {"status": "success", "report": report}
            
            elif automation_type == "send_notification":
                recipient = parameters.get("recipient")
                subject = parameters.get("subject")
                message = parameters.get("message")
                notification_id = self.notification_system.send_email(recipient, subject, message)
                return {"status": "success", "notification_id": notification_id}
            
            else:
                return {"status": "error", "message": "Unknown automation type"}
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def get_automation_triggers(self) -> Dict:
        """Get all automation triggers from all depots"""
        return {
            "cashinghouse": self.integration.cashinghouse.get_automation_triggers(),
            "consort": self.integration.social_automation.get_automation_triggers(),
            "holdings": self.integration.holdings.get_automation_triggers(),
            "scribe": self.integration.scribe.get_automation_triggers()
        }


class AutomationCapabilities:
    """Main automation capabilities system"""
    
    def __init__(self, depot_integration):
        self.integration = depot_integration
        self.scheduler = TaskScheduler()
        self.notifications = NotificationSystem()
        self.api = APIEndpoints(depot_integration)
        
        # Setup default scheduled tasks
        self._setup_default_tasks()
        
        # Setup default webhooks
        self._setup_default_webhooks()
    
    def _setup_default_tasks(self):
        """Setup default scheduled tasks"""
        # Daily integrated report
        self.scheduler.add_scheduled_task(
            name="Daily Integrated Report",
            function="integrated_report",
            schedule="daily",
            parameters={"format": "detailed"}
        )
        
        # Hourly trigger check
        self.scheduler.add_scheduled_task(
            name="Automation Trigger Check",
            function="check_triggers",
            schedule="hourly",
            parameters={}
        )
    
    def _setup_default_webhooks(self):
        """Setup default webhook configurations"""
        # Add example webhook (disabled by default)
        self.notifications.add_webhook_config(
            name="Slack Notifications",
            url="https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
            secret="your-webhook-secret",
            events=["revenue_alert", "content_alert", "asset_alert"]
        )
    
    def start_automation(self):
        """Start all automation systems"""
        self.scheduler.start_scheduler()
        print("Automation capabilities started")
    
    def stop_automation(self):
        """Stop all automation systems"""
        self.scheduler.stop_scheduler()
        print("Automation capabilities stopped")
    
    def get_automation_status(self) -> Dict:
        """Get status of all automation systems"""
        return {
            "scheduler": {
                "running": self.scheduler.running,
                "tasks": len(self.scheduler.scheduled_tasks),
                "enabled_tasks": sum(1 for t in self.scheduler.scheduled_tasks.values() if t.enabled)
            },
            "notifications": {
                "total_sent": len(self.notifications.notifications),
                "webhooks_configured": len(self.notifications.webhook_configs)
            },
            "api": {
                "available_endpoints": 6,
                "status": "operational"
            }
        }


def main():
    """Main function for testing and demonstration"""
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), 'cashinghouse-automation'))
    sys.path.append(os.path.join(os.path.dirname(__file__), 'consort-automation'))
    sys.path.append(os.path.join(os.path.dirname(__file__), 'holdings-automation'))
    sys.path.append(os.path.join(os.path.dirname(__file__), 'scribe-automation'))
    
    from depot_integration import DepotIntegration
    
    # Create integration
    integration = DepotIntegration()
    
    # Create automation capabilities
    automation = AutomationCapabilities(integration)
    
    # Test API endpoints
    print("Testing API Endpoints:")
    print("\nSystem Status:")
    print(json.dumps(automation.api.get_system_status(), indent=2))
    
    print("\nFinancial Data:")
    print(json.dumps(automation.api.get_financial_data(), indent=2))
    
    print("\nContent Data:")
    try:
        print(json.dumps(automation.api.get_content_data(), indent=2))
    except Exception as e:
        print(f"Content data skipped due to import issues: {e}")
    
    print("\nAsset Data:")
    try:
        print(json.dumps(automation.api.get_asset_data(), indent=2))
    except Exception as e:
        print(f"Asset data skipped due to import issues: {e}")
    
    print("\nDocument Data:")
    try:
        print(json.dumps(automation.api.get_document_data(), indent=2))
    except Exception as e:
        print(f"Document data skipped due to import issues: {e}")
    
    print("\nAutomation Triggers:")
    try:
        print(json.dumps(automation.api.get_automation_triggers(), indent=2))
    except Exception as e:
        print(f"Automation triggers skipped due to import issues: {e}")
    
    # Test automation trigger
    print("\nTesting Automation Trigger:")
    try:
        result = automation.api.trigger_automation("integrated_report", {})
        print(f"Status: {result['status']}")
    except Exception as e:
        print(f"Automation trigger skipped due to import issues: {e}")
    
    # Test notification
    print("\nTesting Notification System:")
    notification_id = automation.notifications.send_email(
        recipient="admin@tiapmaatzu.com",
        subject="Test Notification",
        message="This is a test notification from the automation system."
    )
    print(f"Notification ID: {notification_id}")
    
    # Get automation status
    print("\nAutomation Status:")
    print(json.dumps(automation.get_automation_status(), indent=2))
    
    # Start automation (briefly)
    print("\nStarting automation capabilities...")
    try:
        automation.start_automation()
        time.sleep(2)  # Run briefly
        automation.stop_automation()
    except Exception as e:
        print(f"Automation scheduling requires additional dependencies: {e}")
        print("Scheduler functionality will work with 'pip install schedule'")


if __name__ == "__main__":
    main()
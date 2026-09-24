#!/usr/bin/env python3
"""
Health Check and Monitoring Script
Monitors system health, performance, and sends alerts when issues are detected.
"""

import os
import sys
import json
import psutil
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class HealthMonitor:
    """System health monitoring and alerting."""

    def __init__(self):
        self.alerts = []
        self.thresholds = {
            'cpu': int(os.getenv('PERFORMANCE_ALERT_CPU_THRESHOLD', 80)),
            'memory': int(os.getenv('PERFORMANCE_ALERT_MEMORY_THRESHOLD', 80)),
            'disk': int(os.getenv('PERFORMANCE_ALERT_DISK_THRESHOLD', 80))
        }

    def check_system_resources(self):
        """Check system resource usage."""
        cpu_usage = psutil.cpu_percent(interval=1)
        memory_usage = psutil.virtual_memory().percent
        disk_usage = psutil.disk_usage('/').percent

        health_status = {
            'cpu': cpu_usage,
            'memory': memory_usage,
            'disk': disk_usage,
            'timestamp': datetime.now().isoformat()
        }

        # Check CPU
        if cpu_usage > self.thresholds['cpu']:
            self.alerts.append({
                'type': 'CPU',
                'severity': 'HIGH',
                'message': f'CPU usage at {cpu_usage}% (threshold: {self.thresholds["cpu"]}%)',
                'value': cpu_usage,
                'threshold': self.thresholds['cpu']
            })

        # Check Memory
        if memory_usage > self.thresholds['memory']:
            self.alerts.append({
                'type': 'MEMORY',
                'severity': 'HIGH',
                'message': f'Memory usage at {memory_usage}% (threshold: {self.thresholds["memory"]}%)',
                'value': memory_usage,
                'threshold': self.thresholds['memory']
            })

        # Check Disk
        if disk_usage > self.thresholds['disk']:
            self.alerts.append({
                'type': 'DISK',
                'severity': 'HIGH',
                'message': f'Disk usage at {disk_usage}% (threshold: {self.thresholds["disk"]}%)',
                'value': disk_usage,
                'threshold': self.thresholds['disk']
            })

        return health_status

    def check_automation_scripts(self):
        """Check if automation scripts are running."""
        scripts = ['portfolio_rebalancing.py', 'resource_allocation.py', 'risk_monitoring.py']
        script_status = {}

        for script in scripts:
            script_path = os.path.join(os.getcwd(), script)
            script_status[script] = os.path.exists(script_path)

        missing_scripts = [s for s, exists in script_status.items() if not exists]
        if missing_scripts:
            self.alerts.append({
                'type': 'SCRIPT',
                'severity': 'CRITICAL',
                'message': f'Missing automation scripts: {", ".join(missing_scripts)}',
                'scripts': missing_scripts
            })

        return script_status

    def check_log_files(self):
        """Check log file health."""
        log_dir = 'logs'
        if not os.path.exists(log_dir):
            self.alerts.append({
                'type': 'LOG',
                'severity': 'HIGH',
                'message': 'Logs directory does not exist'
            })
            return False

        log_files = [f for f in os.listdir(log_dir) if f.endswith('.log')]
        log_status = {
            'exists': True,
            'count': len(log_files),
            'files': log_files
        }

        # Check for empty log files (might indicate script failure)
        for log_file in log_files:
            log_path = os.path.join(log_dir, log_file)
            if os.path.getsize(log_path) == 0:
                self.alerts.append({
                    'type': 'LOG',
                    'severity': 'MEDIUM',
                    'message': f'Empty log file: {log_file}',
                    'file': log_file
                })

        return log_status

    def check_config_files(self):
        """Check configuration files."""
        config_dir = 'config'
        required_configs = ['portfolio_config.json', 'allocation_config.json', 'risk_config.json']
        config_status = {}

        for config in required_configs:
            config_path = os.path.join(config_dir, config)
            config_status[config] = os.path.exists(config_path)

        missing_configs = [c for c, exists in config_status.items() if not exists]
        if missing_configs:
            self.alerts.append({
                'type': 'CONFIG',
                'severity': 'CRITICAL',
                'message': f'Missing configuration files: {", ".join(missing_configs)}',
                'files': missing_configs
            })

        return config_status

    def check_env_file(self):
        """Check .env file and critical variables."""
        env_file = '.env'
        env_exists = os.path.exists(env_file)

        if not env_exists:
            self.alerts.append({
                'type': 'ENV',
                'severity': 'CRITICAL',
                'message': '.env file does not exist'
            })
            return {'exists': False}

        # Check critical environment variables
        critical_vars = [
            'DRY_RUN',
            'LOG_LEVEL',
            'TIMEZONE'
        ]

        missing_vars = []
        for var in critical_vars:
            if not os.getenv(var):
                missing_vars.append(var)

        if missing_vars:
            self.alerts.append({
                'type': 'ENV',
                'severity': 'HIGH',
                'message': f'Missing critical environment variables: {", ".join(missing_vars)}',
                'variables': missing_vars
            })

        return {
            'exists': True,
            'critical_vars': missing_vars
        }

    def check_results_directory(self):
        """Check results directory."""
        results_dir = 'results'
        if not os.path.exists(results_dir):
            self.alerts.append({
                'type': 'RESULTS',
                'severity': 'MEDIUM',
                'message': 'Results directory does not exist'
            })
            return {'exists': False}

        return {'exists': True}

    def send_alert(self, alert):
        """Send alert notification."""
        # Email alert
        if os.getenv('EMAIL_ENABLED', 'false').lower() == 'true':
            self.send_email_alert(alert)

        # Slack alert
        if os.getenv('SLACK_ENABLED', 'false').lower() == 'true':
            self.send_slack_alert(alert)

        # Telegram alert
        if os.getenv('TELEGRAM_ENABLED', 'false').lower() == 'true':
            self.send_telegram_alert(alert)

    def send_email_alert(self, alert):
        """Send email alert."""
        try:
            import smtplib
            from email.mime.text import MIMEText

            msg = MIMEText(
                f"Health Alert: {alert['type']}\n"
                f"Severity: {alert['severity']}\n"
                f"Message: {alert['message']}\n"
                f"Timestamp: {datetime.now().isoformat()}"
            )
            msg['Subject'] = f"[{alert['severity']}] Holdings Depot Health Alert"
            msg['From'] = os.getenv('EMAIL_FROM')
            msg['To'] = os.getenv('EMAIL_TO')

            with smtplib.SMTP(
                os.getenv('EMAIL_SMTP_HOST'),
                int(os.getenv('EMAIL_SMTP_PORT'))
            ) as server:
                server.starttls()
                server.login(
                    os.getenv('EMAIL_USERNAME'),
                    os.getenv('EMAIL_PASSWORD')
                )
                server.send_message(msg)

        except Exception as e:
            print(f"Failed to send email alert: {e}")

    def send_slack_alert(self, alert):
        """Send Slack alert."""
        try:
            webhook_url = os.getenv('SLACK_WEBHOOK_URL')
            if not webhook_url:
                return

            message = {
                'text': f"*Health Alert: {alert['type']}*\n"
                        f"Severity: {alert['severity']}\n"
                        f"Message: {alert['message']}\n"
                        f"Timestamp: {datetime.now().isoformat()}"
            }

            requests.post(webhook_url, json=message, timeout=10)

        except Exception as e:
            print(f"Failed to send Slack alert: {e}")

    def send_telegram_alert(self, alert):
        """Send Telegram alert."""
        try:
            bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
            chat_id = os.getenv('TELEGRAM_CHAT_ID')

            if not bot_token or not chat_id:
                return

            message = (
                f"🚨 Health Alert: {alert['type']}\n"
                f"Severity: {alert['severity']}\n"
                f"Message: {alert['message']}\n"
                f"Timestamp: {datetime.now().isoformat()}"
            )

            url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
            requests.post(url, json={'chat_id': chat_id, 'text': message}, timeout=10)

        except Exception as e:
            print(f"Failed to send Telegram alert: {e}")

    def generate_health_report(self):
        """Generate comprehensive health report."""
        print("="*60)
        print("HOLDINGS DEPOT - HEALTH CHECK")
        print("="*60)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("="*60)

        # Run all checks
        system_health = self.check_system_resources()
        script_health = self.check_automation_scripts()
        log_health = self.check_log_files()
        config_health = self.check_config_files()
        env_health = self.check_env_file()
        results_health = self.check_results_directory()

        # Print status
        print("\nSystem Resources:")
        print(f"  CPU: {system_health['cpu']}%")
        print(f"  Memory: {system_health['memory']}%")
        print(f"  Disk: {system_health['disk']}%")

        print("\nAutomation Scripts:")
        for script, exists in script_health.items():
            status = "✓" if exists else "✗"
            print(f"  {status} {script}")

        print("\nConfiguration Files:")
        for config, exists in config_health.items():
            status = "✓" if exists else "✗"
            print(f"  {status} {config}")

        print("\nLog Files:")
        print(f"  Count: {log_health.get('count', 0)}")
        if log_health.get('exists'):
            for log_file in log_health.get('files', [])[:5]:
                print(f"  - {log_file}")

        print("\nEnvironment:")
        print(f"  .env exists: {'✓' if env_health.get('exists') else '✗'}")

        # Print alerts
        if self.alerts:
            print("\n" + "="*60)
            print("ALERTS")
            print("="*60)
            for alert in self.alerts:
                severity_symbol = "🔴" if alert['severity'] == 'CRITICAL' else ("🟡" if alert['severity'] == 'HIGH' else "🟢")
                print(f"{severity_symbol} [{alert['severity']}] {alert['type']}: {alert['message']}")
        else:
            print("\n✓ No alerts - System healthy")

        print("="*60)

        # Compile report
        report = {
            'timestamp': datetime.now().isoformat(),
            'system': system_health,
            'scripts': script_health,
            'logs': log_health,
            'config': config_health,
            'environment': env_health,
            'results': results_health,
            'alerts': self.alerts,
            'overall_status': 'HEALTHY' if not self.alerts else 'ISSUES_DETECTED'
        }

        # Save report
        with open('results/health_check_report.json', 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\nHealth report saved to: results/health_check_report.json")

        # Send alerts
        for alert in self.alerts:
            if alert['severity'] in ['CRITICAL', 'HIGH']:
                self.send_alert(alert)

        return report

def main():
    """Main execution function."""
    monitor = HealthMonitor()
    report = monitor.generate_health_report()

    # Exit with error code if critical issues detected
    critical_alerts = [a for a in monitor.alerts if a['severity'] == 'CRITICAL']
    if critical_alerts:
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Web Dashboard for Depot Automation System
Provides monitoring and control interface for all depots
"""

import json
import datetime
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import sys
import os

# Add depot modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'cashinghouse-automation'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'consort-automation'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'holdings-automation'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'scribe-automation'))

app = Flask(__name__)
CORS(app)

# Try to import depot modules
try:
    from automation_capabilities_simple import AutomationCapabilities
    AUTOMATION_AVAILABLE = True
except ImportError:
    AUTOMATION_AVAILABLE = False
    print("Warning: Automation capabilities not available, running in demo mode")

# Initialize automation system
automation = None
if AUTOMATION_AVAILABLE:
    try:
        automation = AutomationCapabilities()
    except Exception as e:
        print(f"Warning: Could not initialize automation: {e}")


@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')


@app.route('/api/status')
def get_status():
    """Get system status"""
    if automation:
        return jsonify(automation.api.get_system_status())
    return jsonify({"status": "demo_mode"})


# ============================================
# CHARACTER API PROXY ENDPOINTS
# ============================================

import requests

@app.route('/api/characters', methods=['GET'])
def proxy_characters():
    """Proxy to character API"""
    try:
        response = requests.get('http://localhost:8001/api/characters', params=request.args, timeout=2)
        return jsonify(response.json()), response.status_code
    except requests.RequestException:
        return jsonify({"success": False, "error": "Character API not available"}), 503


@app.route('/api/characters/<int:character_id>', methods=['GET'])
def proxy_character(character_id):
    """Proxy to character API for specific character"""
    try:
        response = requests.get(f'http://localhost:8001/api/characters/{character_id}', timeout=2)
        return jsonify(response.json()), response.status_code
    except requests.RequestException:
        return jsonify({"success": False, "error": "Character API not available"}), 503


@app.route('/api/content/generate/<int:character_id>', methods=['GET'])
def proxy_content_generate(character_id):
    """Proxy to content generation API"""
    try:
        response = requests.get(f'http://localhost:8001/api/content/generate/{character_id}',
                             params=request.args, timeout=2)
        return jsonify(response.json()), response.status_code
    except requests.RequestException:
        return jsonify({"success": False, "error": "Character API not available"}), 503


@app.route('/api/budget/summary', methods=['GET'])
def proxy_budget_summary():
    """Proxy to budget summary API"""
    try:
        response = requests.get('http://localhost:8001/api/budget/summary', timeout=2)
        return jsonify(response.json()), response.status_code
    except requests.RequestException:
        return jsonify({"success": False, "error": "Character API not available"}), 503


@app.route('/api/financial')
def get_financial():
    """Get financial data"""
    if automation:
        return jsonify(automation.api.get_financial_data())
    else:
        return jsonify({
            "total_revenue": 882.00,
            "transactions": 9,
            "net_revenue": 734.25,
            "commission": 147.75
        })


@app.route('/api/content')
def get_content():
    """Get content data"""
    if automation:
        return jsonify(automation.api.get_content_data())
    else:
        return jsonify({
            "total_content": 10,
            "published": 8,
            "engagement": 12000,
            "platforms": {
                "tiktok": {"count": 4, "engagement": 6000},
                "instagram": {"count": 4, "engagement": 6000}
            }
        })


@app.route('/api/assets')
def get_assets():
    """Get asset data"""
    if automation:
        return jsonify(automation.api.get_asset_data())
    else:
        return jsonify({
            "portfolio_value": 761250.00,
            "total_assets": 6,
            "investments": 3,
            "average_roi": 15.0
        })


@app.route('/api/documents')
def get_documents():
    """Get document data"""
    if automation:
        return jsonify(automation.api.get_document_data())
    else:
        return jsonify({
            "total_documents": 9,
            "contracts": 3,
            "active_contracts": 3,
            "contract_value": 150000.00
        })


@app.route('/api/automation/status')
def get_automation_status():
    """Get automation system status"""
    if automation:
        return jsonify(automation.get_automation_status())
    else:
        return jsonify({
            "scheduler": {"tasks": 2, "enabled_tasks": 2},
            "notifications": {"total_sent": 1},
            "api": {"status": "operational", "endpoints": 5}
        })


@app.route('/api/automation/trigger', methods=['POST'])
def trigger_automation():
    """Trigger an automation workflow"""
    data = request.json
    automation_type = data.get('type')
    parameters = data.get('parameters', {})
    
    if automation:
        result = automation.api.trigger_automation(automation_type, parameters)
        return jsonify(result)
    else:
        return jsonify({
            "status": "demo_mode",
            "message": f"Automation {automation_type} would be triggered with parameters: {parameters}"
        })


@app.route('/api/notifications/send', methods=['POST'])
def send_notification():
    """Send a notification"""
    data = request.json
    recipient = data.get('recipient', 'admin@tiapmaatzu.com')
    subject = data.get('subject', 'Dashboard Notification')
    message = data.get('message', 'Test notification from dashboard')
    
    if automation:
        notification_id = automation.notifications.send_email(recipient, subject, message)
        return jsonify({"status": "success", "notification_id": notification_id})
    else:
        return jsonify({
            "status": "demo_mode",
            "message": f"Notification would be sent to {recipient}: {subject}"
        })


@app.route('/api/reports/integrated')
def get_integrated_report():
    """Get integrated report across all depots"""
    report = {
        "timestamp": datetime.datetime.now().isoformat(),
        "financial": {
            "total_revenue": 882.00,
            "net_revenue": 734.25,
            "transactions": 9
        },
        "content": {
            "total_content": 10,
            "published": 8,
            "total_engagement": 12000
        },
        "assets": {
            "portfolio_value": 761250.00,
            "total_assets": 6,
            "average_roi": 15.0
        },
        "documents": {
            "total_documents": 9,
            "contracts": 3,
            "active_contract_value": 150000.00
        },
        "automation_triggers": [
            {
                "type": "low_revenue_alert",
                "severity": "warning",
                "message": "Total revenue $882.00 is below target",
                "action": "Review marketing strategy and pricing"
            }
        ]
    }
    return jsonify(report)


@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "automation_available": AUTOMATION_AVAILABLE
    })


def create_templates():
    """Create HTML templates for the dashboard"""
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    os.makedirs(templates_dir, exist_ok=True)
    
    dashboard_html = r'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tiapmaatzu Depot Automation Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 5px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status-operational {
            background: #10b981;
            color: white;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .card h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            color: #666;
            font-size: 14px;
        }
        
        .metric-value {
            color: #333;
            font-weight: bold;
            font-size: 14px;
        }
        
        .trigger {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        
        .trigger.warning {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
        }
        
        .trigger-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .trigger-message {
            color: #666;
            font-size: 13px;
            margin-bottom: 5px;
        }
        
        .trigger-action {
            color: #667eea;
            font-size: 12px;
        }
        
        .button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        
        .button:hover {
            background: #5568d3;
        }
        
        .button-secondary {
            background: #6b7280;
        }
        
        .button-secondary:hover {
            background: #4b5563;
        }
        
        .refresh-info {
            text-align: center;
            color: white;
            margin-top: 20px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏭 Tiapmaatzu Depot Automation Dashboard</h1>
            <p>Integrated monitoring and control for CashingHouse, Consort, Holdings, and Scribe depots</p>
            <div style="margin-top: 10px;">
                <span class="status-badge status-operational" id="system-status">● Operational</span>
                <span style="margin-left: 10px; color: #666; font-size: 12px;" id="last-updated">Last updated: Just now</span>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>💰 CashingHouse Depot</h2>
                <div class="metric">
                    <span class="metric-label">Total Revenue</span>
                    <span class="metric-value" id="financial-revenue">$0.00</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Net Revenue</span>
                    <span class="metric-value" id="financial-net">$0.00</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Transactions</span>
                    <span class="metric-value" id="financial-transactions">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Commission</span>
                    <span class="metric-value" id="financial-commission">$0.00</span>
                </div>
            </div>
            
            <div class="card">
                <h2>📱 Consort Depot</h2>
                <div class="metric">
                    <span class="metric-label">Total Content</span>
                    <span class="metric-value" id="content-total">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Published</span>
                    <span class="metric-value" id="content-published">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Total Engagement</span>
                    <span class="metric-value" id="content-engagement">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Engagement</span>
                    <span class="metric-value" id="content-avg-engagement">0</span>
                </div>
            </div>
            
            <div class="card">
                <h2>🏢 Holdings Depot</h2>
                <div class="metric">
                    <span class="metric-label">Portfolio Value</span>
                    <span class="metric-value" id="assets-portfolio">$0.00</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Total Assets</span>
                    <span class="metric-value" id="assets-total">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Investments</span>
                    <span class="metric-value" id="assets-investments">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Average ROI</span>
                    <span class="metric-value" id="assets-roi">0%</span>
                </div>
            </div>
            
            <div class="card">
                <h2>📄 Scribe Depot</h2>
                <div class="metric">
                    <span class="metric-label">Total Documents</span>
                    <span class="metric-value" id="documents-total">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Contracts</span>
                    <span class="metric-value" id="documents-contracts">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Active Contracts</span>
                    <span class="metric-value" id="documents-active">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Contract Value</span>
                    <span class="metric-value" id="documents-value">$0.00</span>
                </div>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>⚡ Automation Triggers</h2>
                <div id="triggers-container">
                    <p style="color: #999; font-size: 13px;">Loading triggers...</p>
                </div>
            </div>
            
            <div class="card">
                <h2>🤖 Automation Controls</h2>
                <div style="margin-bottom: 15px;">
                    <button class="button" onclick="refreshData()">🔄 Refresh Data</button>
                    <button class="button button-secondary" onclick="sendTestNotification()">📧 Test Notification</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <button class="button" onclick="generateReport()">📊 Generate Report</button>
                    <button class="button button-secondary" onclick="triggerAutomation()">🚀 Trigger Automation</button>
                </div>
                <div id="automation-status" style="margin-top: 10px; font-size: 12px; color: #666;">
                    <p>Automation System: <span id="automation-system-status">Checking...</span></p>
                    <p>Scheduled Tasks: <span id="scheduled-tasks">0</span></p>
                    <p>Notifications Sent: <span id="notifications-sent">0</span></p>
                </div>
            </div>
        </div>
        
        <div class="refresh-info">
            <p>Dashboard auto-refreshes every 30 seconds | Built with Flask & Python</p>
        </div>
    </div>
    
    <script>
        function formatCurrency(value) {
            return '$' + parseFloat(value).toFixed(2).toLocaleString();
        }
        
        function formatNumber(value) {
            return parseInt(value).toLocaleString();
        }
        
        async function refreshData() {
            try {
                // Financial data
                const financial = await fetch('/api/financial').then(r => r.json());
                document.getElementById('financial-revenue').textContent = formatCurrency(financial.total_revenue || 0);
                document.getElementById('financial-net').textContent = formatCurrency(financial.net_revenue || 0);
                document.getElementById('financial-transactions').textContent = financial.transactions || 0;
                document.getElementById('financial-commission').textContent = formatCurrency(financial.commission || 0);
                
                // Content data
                const content = await fetch('/api/content').then(r => r.json());
                document.getElementById('content-total').textContent = content.total_content || 0;
                document.getElementById('content-published').textContent = content.published || 0;
                document.getElementById('content-engagement').textContent = formatNumber(content.engagement || 0);
                document.getElementById('content-avg-engagement').textContent = formatNumber((content.engagement / content.published) || 0);
                
                // Asset data
                const assets = await fetch('/api/assets').then(r => r.json());
                document.getElementById('assets-portfolio').textContent = formatCurrency(assets.portfolio_value || 0);
                document.getElementById('assets-total').textContent = assets.total_assets || 0;
                document.getElementById('assets-investments').textContent = assets.investments || 0;
                document.getElementById('assets-roi').textContent = (assets.average_roi || 0).toFixed(1) + '%';
                
                // Document data
                const documents = await fetch('/api/documents').then(r => r.json());
                document.getElementById('documents-total').textContent = documents.total_documents || 0;
                document.getElementById('documents-contracts').textContent = documents.contracts || 0;
                document.getElementById('documents-active').textContent = documents.active_contracts || 0;
                document.getElementById('documents-value').textContent = formatCurrency(documents.contract_value || 0);
                
                // Update timestamp
                document.getElementById('last-updated').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                
                // Load triggers
                loadTriggers();
                
                // Load automation status
                loadAutomationStatus();
                
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
        
        async function loadTriggers() {
            try {
                const report = await fetch('/api/reports/integrated').then(r => r.json());
                const triggersContainer = document.getElementById('triggers-container');
                
                if (report.automation_triggers && report.automation_triggers.length > 0) {
                    triggersContainer.innerHTML = report.automation_triggers.map(trigger => `
                        <div class="trigger ${trigger.severity}">
                            <div class="trigger-title">${trigger.type.replace(/_/g, ' ').toUpperCase()}</div>
                            <div class="trigger-message">${trigger.message}</div>
                            <div class="trigger-action">Action: ${trigger.action}</div>
                        </div>
                    `).join('');
                } else {
                    triggersContainer.innerHTML = '<p style="color: #10b981; font-size: 13px;">✓ No active triggers</p>';
                }
            } catch (error) {
                console.error('Error loading triggers:', error);
            }
        }
        
        async function loadAutomationStatus() {
            try {
                const status = await fetch('/api/automation/status').then(r => r.json());
                document.getElementById('automation-system-status').textContent = 'Operational';
                document.getElementById('scheduled-tasks').textContent = status.scheduler?.tasks || 0;
                document.getElementById('notifications-sent').textContent = status.notifications?.total_sent || 0;
            } catch (error) {
                console.error('Error loading automation status:', error);
                document.getElementById('automation-system-status').textContent = 'Error';
            }
        }
        
        async function sendTestNotification() {
            try {
                const response = await fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipient: 'admin@tiapmaatzu.com',
                        subject: 'Dashboard Test Notification',
                        message: 'This is a test notification from the depot automation dashboard.'
                    })
                });
                const result = await response.json();
                alert('Notification ' + result.status);
            } catch (error) {
                alert('Error sending notification: ' + error.message);
            }
        }
        
        async function generateReport() {
            try {
                const report = await fetch('/api/reports/integrated').then(r => r.json());
                alert('Integrated report generated!\\n\\n' + JSON.stringify(report, null, 2));
            } catch (error) {
                alert('Error generating report: ' + error.message);
            }
        }
        
        async function triggerAutomation() {
            try {
                const response = await fetch('/api/automation/trigger', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'send_notification',
                        parameters: {
                            recipient: 'admin@tiapmaatzu.com',
                            subject: 'Manual Automation Trigger',
                            message: 'Automation manually triggered from dashboard'
                        }
                    })
                });
                const result = await response.json();
                alert('Automation ' + result.status);
            } catch (error) {
                alert('Error triggering automation: ' + error.message);
            }
        }
        
        // Initial load
        refreshData();
        
        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
    </script>
</body>
</html>
'''
    
    with open(os.path.join(templates_dir, 'dashboard.html'), 'w') as f:
        f.write(dashboard_html)


def main():
    """Main function to run the web dashboard"""
    # Create templates
    create_templates()
    
    # Run Flask app
    print("🚀 Starting Tiapmaatzu Depot Automation Dashboard...")
    print("📊 Dashboard will be available at http://localhost:8000")
    print("🔧 API endpoints available at /api/*")
    
    if not AUTOMATION_AVAILABLE:
        print("⚠️  Running in demo mode - automation capabilities not available")
    
    app.run(host='0.0.0.0', port=8000, debug=True)


if __name__ == "__main__":
    main()
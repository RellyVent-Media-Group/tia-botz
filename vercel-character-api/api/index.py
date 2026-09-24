from http.server import BaseHTTPRequestHandler
import json
import datetime
import os
import sys
import urllib.request
import urllib.parse

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load Discord webhook URL from environment
DISCORD_WEBHOOK = os.environ.get('DISCORD_WEBHOOK', 'https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO')

class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default logging
        return

    def do_GET(self):
        # Health check endpoint
        if self.path == '/api/character-health' or self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'healthy',
                'timestamp': datetime.datetime.now().isoformat(),
                'message': 'Character API is running on Vercel',
                'discord_webhook': 'configured' if DISCORD_WEBHOOK else 'not_configured'
            }
            self.wfile.write(json.dumps(response).encode())
        
        # Random character endpoint (simplified version)
        elif self.path == '/api/characters/random':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # Return mock data for now - in production this would connect to actual character data
            response = {
                'success': True,
                'data': {
                    'id': 1,
                    'name': 'Mary Magnumbytes',
                    'archetype': 'Digital Storyteller',
                    'rarity': 'Legendary',
                    'allocated_budget': 50000,
                    'description': 'Digital Storyteller. AI-Powered Content Creator. The one who turns data into narratives that actually make sense.'
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        # Search characters endpoint (simplified version)
        elif '/api/characters/search/' in self.path:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # Return mock search results
            response = {
                'success': True,
                'data': [
                    {
                        'id': 1,
                        'name': 'Mary Magnumbytes',
                        'archetype': 'Digital Storyteller',
                        'rarity': 'Legendary',
                        'description': 'Digital Storyteller. AI-Powered Content Creator.'
                    }
                ],
                'total': 1
            }
            self.wfile.write(json.dumps(response).encode())
        
        # Content creators endpoint (simplified version)
        elif self.path == '/api/content/creators':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': [
                    {
                        'id': 1,
                        'name': 'Mary Magnumbytes',
                        'archetype': 'Digital Storyteller',
                        'rarity': 'Legendary',
                        'key_tool_categories': ['Content Creation', 'AI', 'Storytelling']
                    }
                ],
                'total': 1
            }
            self.wfile.write(json.dumps(response).encode())
        
        # Budget summary endpoint (simplified version)
        elif self.path == '/api/budget/summary':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': {
                    'total_budget': 100000,
                    'allocated_budget': 75000,
                    'remaining_budget': 25000,
                    'utilization_rate': 75.0
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        # Character performance endpoint (simplified version)
        elif self.path == '/api/analytics/character-performance':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': [
                    {
                        'id': 1,
                        'name': 'Mary Magnumbytes',
                        'archetype': 'Digital Storyteller',
                        'rarity': 'Legendary',
                        'allocated_budget': 50000,
                        'utilization_rate': 80.0,
                        'status': 'active'
                    }
                ],
                'summary': {
                    'total_characters': 1,
                    'total_budget': 100000,
                    'total_allocated': 75000,
                    'overall_utilization': 75.0
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        # Default endpoint
        else:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'message': 'Character API endpoints',
                'available_endpoints': [
                    '/api/character-health',
                    '/health',
                    '/api/characters/random',
                    '/api/characters/search/:query',
                    '/api/content/creators',
                    '/api/budget/summary',
                    '/api/analytics/character-performance',
                    '/api/webhooks/discord [POST]',
                    '/api/notifications/discord [POST]'
                ]
            }
            self.wfile.write(json.dumps(response).encode())
        
        return

    def do_POST(self):
        # Discord Webhook Receiver - Receive events from Discord
        if self.path == '/api/webhooks/discord':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode('utf-8'))
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    'status': 'received',
                    'timestamp': datetime.datetime.now().isoformat(),
                    'event': payload.get('event', 'unknown'),
                    'message': 'Webhook event logged'
                }
                
                print(f"Discord Webhook Received: {json.dumps(payload, indent=2)}")
                self.wfile.write(json.dumps(response).encode())
                
            except json.JSONDecodeError as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'error': 'Invalid JSON', 'details': str(e)}
                self.wfile.write(json.dumps(response).encode())

        # Discord Notification - Send notification via webhook
        elif self.path == '/api/notifications/discord':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                notification = json.loads(post_data.decode('utf-8'))
                
                # Send to Discord webhook
                send_discord_notification(notification)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'status': 'sent',
                    'timestamp': datetime.datetime.now().isoformat(),
                    'message': 'Notification sent to Discord'
                }
                self.wfile.write(json.dumps(response).encode())
                
            except json.JSONDecodeError as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'error': 'Invalid JSON', 'details': str(e)}
                self.wfile.write(json.dumps(response).encode())

        # Default POST handler
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {'error': 'Endpoint not found'}
            self.wfile.write(json.dumps(response).encode())
        
        return


def send_discord_notification(notification):
    """
    Send notification to Discord webhook
    
    Args:
        notification: dict with keys: content, embeds, username, avatar_url
    """
    if not DISCORD_WEBHOOK:
        print("Warning: DISCORD_WEBHOOK not configured")
        return False
    
    try:
        # Build payload
        payload = {
            'content': notification.get('content', ''),
            'embeds': notification.get('embeds', [])
        }
        
        # Add optional fields
        if 'username' in notification:
            payload['username'] = notification['username']
        if 'avatar_url' in notification:
            payload['avatar_url'] = notification['avatar_url']
        
        # Send to Discord
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            DISCORD_WEBHOOK,
            data=data,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'CharacterAPI/1.0'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"Discord Notification Sent: {result}")
            return True
            
    except Exception as e:
        print(f"Error sending Discord notification: {e}")
        return False
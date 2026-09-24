from http.server import BaseHTTPRequestHandler
import json
import datetime
import os
import sys
import urllib.request
import urllib.parse
import re
import random

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load Discord webhook URL from environment
DISCORD_WEBHOOK = os.environ.get('DISCORD_WEBHOOK', 'https://discord.com/api/webhooks/1499281114533990503/hsljOI0_tI4TF6jSMMmskZe2jZ69DT_48GjrK6-ugo5iD77onwMdrLwcdgx5Fo7jETyO')

# Load character data from JSON file
try:
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'characters.json')
    with open(data_path, 'r') as f:
        CHARACTERS_DATA = json.load(f)
except Exception as e:
    print(f"Warning: Could not load characters.json: {e}")
    CHARACTERS_DATA = []

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
                'discord_webhook': 'configured' if DISCORD_WEBHOOK else 'not_configured',
                'characters_loaded': len(CHARACTERS_DATA)
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get all characters endpoint
        elif self.path == '/api/characters' or self.path == '/api/characters/':
            self.handle_get_all_characters()
            return
        
        # Get specific character by ID
        elif re.match(r'^/api/characters/\d+$', self.path):
            self.handle_get_character_by_id()
            return
        
        # Search characters endpoint
        elif '/api/characters/search/' in self.path:
            self.handle_search_characters()
            return
        
        # Random character endpoint
        elif self.path == '/api/characters/random':
            self.handle_random_character()
            return
        
        # Get characters by category
        elif '/api/characters/categories' in self.path:
            self.handle_get_by_category()
            return
        
        # Content creators endpoint
        elif self.path == '/api/content/creators':
            self.handle_content_creators()
            return
        
        # Budget summary endpoint
        elif self.path == '/api/budget/summary':
            self.handle_budget_summary()
            return
        
        # Character performance endpoint
        elif self.path == '/api/analytics/character-performance':
            self.handle_character_performance()
            return
        
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
                    '/api/characters',
                    '/api/characters/:id',
                    '/api/characters/search/:query',
                    '/api/characters/random',
                    '/api/characters/categories?category=:name',
                    '/api/content/creators',
                    '/api/budget/summary',
                    '/api/analytics/character-performance',
                    '/api/webhooks/discord [POST]',
                    '/api/notifications/discord [POST]'
                ]
            }
            self.wfile.write(json.dumps(response).encode())
            return

    def handle_get_all_characters(self):
        """Get all characters with optional filters"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Parse query parameters
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        # Filter characters
        filtered = CHARACTERS_DATA
        
        if 'rarity' in params:
            filtered = [c for c in filtered if c.get('rarity', '').lower() == params['rarity'][0].lower()]
        if 'archetype' in params:
            filtered = [c for c in filtered if params['archetype'][0].lower() in c.get('archetype', '').lower()]
        if 'category' in params:
            filtered = [c for c in filtered if params['category'][0].lower() in [t.lower() for t in c.get('keyToolCategories', [])]]
        if 'limit' in params:
            try:
                limit = int(params['limit'][0])
                filtered = filtered[:limit]
            except:
                pass
        
        response = {
            'success': True,
            'data': filtered,
            'total': len(filtered),
            'total_all': len(CHARACTERS_DATA)
        }
        self.wfile.write(json.dumps(response).encode())

    def handle_get_character_by_id(self):
        """Get a specific character by ID"""
        match = re.match(r'^/api/characters/(\d+)$', self.path)
        if match:
            char_id = int(match.group(1))
            character = next((c for c in CHARACTERS_DATA if c.get('id') == char_id), None)
            
            if character:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'data': character
                }
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'success': False,
                    'error': 'Character not found'
                }
                self.wfile.write(json.dumps(response).encode())

    def handle_search_characters(self):
        """Search characters by name, archetype, or description"""
        match = re.search(r'/api/characters/search/([^/]+)', self.path)
        if match:
            query = urllib.parse.unquote(match.group(1)).lower()
            
            results = []
            for char in CHARACTERS_DATA:
                if (query in char.get('name', '').lower() or 
                    query in char.get('archetype', '').lower() or 
                    query in char.get('description', '').lower() or
                    query in ' '.join(char.get('tags', [])).lower()):
                    results.append(char)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': results,
                'total': len(results),
                'query': urllib.parse.unquote(match.group(1))
            }
            self.wfile.write(json.dumps(response).encode())

    def handle_random_character(self):
        """Get a random character"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        if CHARACTERS_DATA:
            character = random.choice(CHARACTERS_DATA)
            response = {
                'success': True,
                'data': character
            }
        else:
            response = {
                'success': True,
                'data': {
                    'id': 1,
                    'name': 'Mary Magnumbytes',
                    'archetype': 'Digital Storyteller',
                    'rarity': 'Legendary',
                    'allocated_budget': 50000,
                    'description': 'Digital Storyteller. AI-Powered Content Creator.'
                }
            }
        self.wfile.write(json.dumps(response).encode())

    def handle_get_by_category(self):
        """Get characters by category"""
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if 'category' in params:
            category = params['category'][0].lower()
            filtered = [c for c in CHARACTERS_DATA 
                      if category in [t.lower() for t in c.get('keyToolCategories', [])]]
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': filtered,
                'category': category,
                'total': len(filtered)
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': False,
                'error': 'Category parameter is required'
            }
            self.wfile.write(json.dumps(response).encode())

    def handle_content_creators(self):
        """Get content creators"""
        # Get characters that are content creators
        creators = [c for c in CHARACTERS_DATA if 'Content Creation' in c.get('keyToolCategories', [])]
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {
            'success': True,
            'data': creators,
            'total': len(creators)
        }
        self.wfile.write(json.dumps(response).encode())

    def handle_budget_summary(self):
        """Get budget summary"""
        total_budget = sum(c.get('allocatedBudget', 0) for c in CHARACTERS_DATA)
        total_characters = len(CHARACTERS_DATA)
        
        # Get budget by rarity
        budget_by_rarity = {}
        for char in CHARACTERS_DATA:
            rarity = char.get('rarity', 'Unknown')
            budget_by_rarity[rarity] = budget_by_rarity.get(rarity, 0) + char.get('allocatedBudget', 0)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {
            'success': True,
            'data': {
                'total_budget': total_budget,
                'total_characters': total_characters,
                'average_per_character': round(total_budget / total_characters, 2) if total_characters > 0 else 0,
                'budget_by_rarity': budget_by_rarity,
                'utilization_rate': 100.0
            }
        }
        self.wfile.write(json.dumps(response).encode())

    def handle_character_performance(self):
        """Get character performance analytics"""
        performance_data = []
        for char in CHARACTERS_DATA:
            # Generate performance metrics based on character data
            performance_data.append({
                'id': char.get('id'),
                'name': char.get('name'),
                'archetype': char.get('archetype'),
                'rarity': char.get('rarity'),
                'allocated_budget': char.get('allocatedBudget', 0),
                'utilization_rate': 85.0,
                'status': char.get('status', 'Active'),
                'tags': char.get('tags', [])
            })
        
        total_budget = sum(c.get('allocatedBudget', 0) for c in CHARACTERS_DATA)
        total_allocated = sum(c.get('allocatedBudget', 0) for c in CHARACTERS_DATA)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {
            'success': True,
            'data': performance_data,
            'summary': {
                'total_characters': len(performance_data),
                'total_budget': total_budget,
                'total_allocated': total_allocated,
                'overall_utilization': 85.0
            }
        }
        self.wfile.write(json.dumps(response).encode())

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

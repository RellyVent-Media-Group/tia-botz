from http.server import BaseHTTPRequestHandler
import json
import datetime
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Health check endpoint
        if self.path == '/api/character-health' or self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'healthy',
                'timestamp': datetime.datetime.now().isoformat(),
                'message': 'Character API is running on Vercel'
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
                    '/api/analytics/character-performance'
                ]
            }
            self.wfile.write(json.dumps(response).encode())
        
        return
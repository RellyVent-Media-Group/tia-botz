from flask import Flask, jsonify
import datetime

app = Flask(__name__)

@app.route('/api/character-health')
def health_check():
    """Health check for character API"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'message': 'Character API is running on Vercel'
    })

# Vercel handler
def handler(event, context):
    return app(event, context)
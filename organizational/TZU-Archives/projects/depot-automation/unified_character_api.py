"""
Unified Character-Depot API
REST API combining character database and depot automation data
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
from typing import Dict, List, Optional
import json

from character_integration import (
    CharacterIntegration,
    CharacterContentGenerator,
    CharacterBudgetTracker,
    CharacterDataSource
)
from character_holdings_sync import CharacterHoldingsSync


app = Flask(__name__)
CORS(app)

# Initialize character integration
char_integration = CharacterIntegration()
content_generator = CharacterContentGenerator(char_integration)
budget_tracker = CharacterBudgetTracker(char_integration)
holdings_sync = CharacterHoldingsSync(char_integration)


# ============================================
# CHARACTER DATA ENDPOINTS
# ============================================

@app.route('/api/characters', methods=['GET'])
def get_characters():
    """Get all characters with optional filters"""
    char_integration.load_characters()

    rarity = request.args.get('rarity')
    archetype = request.args.get('archetype')
    category = request.args.get('category')
    limit = request.args.get('limit', type=int)

    characters = char_integration.load_characters()

    # Apply filters
    if rarity:
        characters = [c for c in characters if c.rarity == rarity]
    if archetype:
        archetype_lower = archetype.lower()
        characters = [c for c in characters if archetype_lower in c.archetype.lower()]
    if category:
        category_lower = category.lower()
        characters = [c for c in characters
                      if any(category_lower in cat.lower() for cat in c.key_tool_categories)]
    if limit:
        characters = characters[:limit]

    # Convert to dict
    result = [{
        'id': c.id,
        'name': c.name,
        'allocated_budget': c.allocated_budget,
        'archetype': c.archetype,
        'description': c.description,
        'entity_type': c.entity_type,
        'gender': c.gender,
        'rarity': c.rarity,
        'status': c.status,
        'key_tool_categories': c.key_tool_categories
    } for c in characters]

    return jsonify({
        'success': True,
        'data': result,
        'total': len(result)
    })


@app.route('/api/characters/<int:character_id>', methods=['GET'])
def get_character(character_id):
    """Get specific character by ID"""
    char = char_integration.get_character(character_id)
    if not char:
        return jsonify({'success': False, 'error': 'Character not found'}), 404

    return jsonify({
        'success': True,
        'data': {
            'id': char.id,
            'name': char.name,
            'allocated_budget': char.allocated_budget,
            'archetype': char.archetype,
            'description': char.description,
            'entity_type': char.entity_type,
            'gender': char.gender,
            'rarity': char.rarity,
            'status': char.status,
            'key_tool_categories': char.key_tool_categories,
            'prompts': {
                'hook': char.prompts.hook,
                'branding': char.prompts.branding,
                'trust': char.prompts.trust
            }
        }
    })


@app.route('/api/characters/search/<query>', methods=['GET'])
def search_characters(query):
    """Search characters by name, archetype, or description"""
    results = char_integration.search_characters(query)

    result = [{
        'id': c.id,
        'name': c.name,
        'archetype': c.archetype,
        'rarity': c.rarity,
        'description': c.description[:100] + '...' if len(c.description) > 100 else c.description
    } for c in results]

    return jsonify({
        'success': True,
        'data': result,
        'total': len(result)
    })


@app.route('/api/characters/random', methods=['GET'])
def get_random_character():
    """Get a random character"""
    char = char_integration.get_random_character()
    if not char:
        return jsonify({'success': False, 'error': 'No characters available'}), 404

    return jsonify({
        'success': True,
        'data': {
            'id': char.id,
            'name': char.name,
            'archetype': char.archetype,
            'rarity': char.rarity,
            'allocated_budget': char.allocated_budget
        }
    })


@app.route('/api/characters/categories', methods=['GET'])
def get_character_categories():
    """Get characters by category"""
    category = request.args.get('category')
    if not category:
        return jsonify({'success': False, 'error': 'Category parameter required'}), 400

    characters = char_integration.get_characters_by_category(category)

    result = [{
        'id': c.id,
        'name': c.name,
        'archetype': c.archetype,
        'rarity': c.rarity,
        'key_tool_categories': c.key_tool_categories
    } for c in characters]

    return jsonify({
        'success': True,
        'data': result,
        'total': len(result),
        'category': category
    })


# ============================================
# CONTENT GENERATION ENDPOINTS
# ============================================

@app.route('/api/content/generate/<int:character_id>', methods=['GET'])
def generate_content_idea(character_id):
    """Generate a content idea for a specific character"""
    content_type = request.args.get('type', 'social')
    idea = content_generator.generate_content_idea(character_id, content_type)

    if 'error' in idea:
        return jsonify({'success': False, 'error': idea['error']}), 404

    return jsonify({
        'success': True,
        'data': idea
    })


@app.route('/api/content/batch', methods=['POST'])
def generate_batch_content_ideas():
    """Generate multiple content ideas"""
    data = request.get_json()
    count = data.get('count', 5) if data else 5

    ideas = content_generator.generate_batch_content_ideas(count)

    return jsonify({
        'success': True,
        'data': ideas,
        'total': len(ideas)
    })


@app.route('/api/content/creators', methods=['GET'])
def get_content_creators():
    """Get all characters suitable for content creation"""
    creators = char_integration.get_content_creators()

    result = [{
        'id': c.id,
        'name': c.name,
        'archetype': c.archetype,
        'rarity': c.rarity,
        'key_tool_categories': c.key_tool_categories
    } for c in creators]

    return jsonify({
        'success': True,
        'data': result,
        'total': len(result)
    })


# ============================================
# BUDGET TRACKING ENDPOINTS
# ============================================

@app.route('/api/budget/summary', methods=['GET'])
def get_budget_summary():
    """Get budget utilization summary"""
    report = budget_tracker.get_budget_utilization_report()

    return jsonify({
        'success': True,
        'data': report
    })


@app.route('/api/budget/by-archetype', methods=['GET'])
def get_budget_by_archetype():
    """Get budget breakdown by archetype"""
    budgets = budget_tracker.get_total_budget_by_archetype()

    result = [{
        'archetype': archetype,
        'total_budget': budget
    } for archetype, budget in budgets.items()]

    # Sort by budget
    result.sort(key=lambda x: x['total_budget'], reverse=True)

    return jsonify({
        'success': True,
        'data': result,
        'total': len(result)
    })


@app.route('/api/budget/character/<int:character_id>', methods=['GET'])
def get_character_budget(character_id):
    """Get budget allocation for a specific character"""
    allocation = holdings_sync.get_character_allocation(character_id)
    if not allocation:
        return jsonify({'success': False, 'error': 'Character allocation not found'}), 404

    return jsonify({
        'success': True,
        'data': {
            'character_id': allocation.character_id,
            'character_name': allocation.character_name,
            'allocated_budget': allocation.allocated_budget,
            'allocated_to_assets': allocation.allocated_to_assets,
            'remaining_budget': allocation.remaining_budget,
            'asset_ids': allocation.asset_ids,
            'utilization_rate': (allocation.allocated_to_assets / allocation.allocated_budget * 100)
                              if allocation.allocated_budget > 0 else 0,
            'last_synced': allocation.last_synced
        }
    })


@app.route('/api/budget/sync', methods=['POST'])
def sync_budgets():
    """Sync character budgets with Holdings"""
    sync_result = holdings_sync.sync_character_budgets()

    return jsonify({
        'success': True,
        'data': sync_result
    })


@app.route('/api/budget/allocate', methods=['POST'])
def allocate_budget():
    """Allocate budget from character to asset"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400

    character_id = data.get('character_id')
    asset_id = data.get('asset_id')
    amount = data.get('amount')

    if not all([character_id, asset_id, amount]):
        return jsonify({'success': False, 'error': 'character_id, asset_id, and amount required'}), 400

    success = holdings_sync.allocate_budget_to_asset(character_id, asset_id, amount)

    if success:
        return jsonify({
            'success': True,
            'message': f'Allocated ${amount:,.2f} from character {character_id} to asset {asset_id}'
        })
    else:
        return jsonify({'success': False, 'error': 'Allocation failed (insufficient budget or character not found)'}), 400


# ============================================
# UNIFIED ANALYTICS ENDPOINTS
# ============================================

@app.route('/api/analytics/character-performance', methods=['GET'])
def get_character_performance():
    """Get character performance analytics"""
    characters = char_integration.load_characters()
    sync_summary = holdings_sync.get_allocation_summary()

    # Combine character data with budget allocation
    performance_data = []
    for char in characters:
        allocation = holdings_sync.get_character_allocation(char.id)
        if allocation:
            utilization = (allocation.allocated_to_assets / allocation.allocated_budget * 100) \
                         if allocation.allocated_budget > 0 else 0
        else:
            utilization = 0

        performance_data.append({
            'id': char.id,
            'name': char.name,
            'archetype': char.archetype,
            'rarity': char.rarity,
            'allocated_budget': char.allocated_budget,
            'utilization_rate': utilization,
            'status': char.status
        })

    # Sort by budget
    performance_data.sort(key=lambda x: x['allocated_budget'], reverse=True)

    return jsonify({
        'success': True,
        'data': performance_data,
        'summary': {
            'total_characters': len(characters),
            'total_budget': sync_summary['total_budget'],
            'total_allocated': sync_summary['total_allocated_to_assets'],
            'overall_utilization': sync_summary['allocation_rate']
        }
    })


@app.route('/api/analytics/archetype-breakdown', methods=['GET'])
def get_archetype_breakdown():
    """Get analytics breakdown by archetype"""
    characters = char_integration.load_characters()
    archetype_data = {}

    for char in characters:
        archetype = char.archetype
        if archetype not in archetype_data:
            archetype_data[archetype] = {
                'count': 0,
                'total_budget': 0,
                'characters': []
            }

        archetype_data[archetype]['count'] += 1
        archetype_data[archetype]['total_budget'] += char.allocated_budget
        archetype_data[archetype]['characters'].append({
            'id': char.id,
            'name': char.name,
            'budget': char.allocated_budget
        })

    # Sort by total budget
    sorted_archetypes = sorted(archetype_data.items(), key=lambda x: x[1]['total_budget'], reverse=True)

    result = [{
        'archetype': archetype,
        'count': data['count'],
        'total_budget': data['total_budget'],
        'average_budget': data['total_budget'] / data['count'] if data['count'] > 0 else 0,
        'characters': data['characters']
    } for archetype, data in sorted_archetypes]

    return jsonify({
        'success': True,
        'data': result,
        'total_archetypes': len(result)
    })


# ============================================
# HEALTH AND DOCUMENTATION
# ============================================

@app.route('/api/character-health', methods=['GET'])
def health_check():
    """Health check for character API"""
    try:
        characters = char_integration.load_characters()
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.datetime.now().isoformat(),
            'characters_loaded': len(characters),
            'data_source': char_integration.data_source.value,
            'budget_sync_status': 'active'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.datetime.now().isoformat()
        }), 500


@app.route('/api/character-docs', methods=['GET'])
def api_docs():
    """API documentation"""
    docs = {
        'title': 'Unified Character-Depot API',
        'version': '1.0.0',
        'description': 'REST API combining character database and depot automation data',
        'endpoints': {
            'character_data': {
                'GET /api/characters': 'Get all characters with optional filters',
                'GET /api/characters/:id': 'Get specific character by ID',
                'GET /api/characters/search/:query': 'Search characters',
                'GET /api/characters/random': 'Get random character',
                'GET /api/characters/categories?category=X': 'Get characters by category'
            },
            'content_generation': {
                'GET /api/content/generate/:id?type=social': 'Generate content idea for character',
                'POST /api/content/batch': 'Generate batch content ideas',
                'GET /api/content/creators': 'Get content creator characters'
            },
            'budget_tracking': {
                'GET /api/budget/summary': 'Get budget utilization summary',
                'GET /api/budget/by-archetype': 'Get budget by archetype',
                'GET /api/budget/character/:id': 'Get character budget allocation',
                'POST /api/budget/sync': 'Sync character budgets',
                'POST /api/budget/allocate': 'Allocate budget to asset'
            },
            'analytics': {
                'GET /api/analytics/character-performance': 'Get character performance analytics',
                'GET /api/analytics/archetype-breakdown': 'Get archetype breakdown'
            },
            'utility': {
                'GET /api/character-health': 'Health check',
                'GET /api/character-docs': 'API documentation'
            }
        },
        'filters': {
            'rarity': 'Legendary, Rare, Common',
            'archetype': 'Any archetype name',
            'category': 'Content Creation, Technology, Finance, etc.',
            'limit': 'Maximum number of results'
        }
    }

    return jsonify(docs)


def main():
    """Run the unified character API server"""
    print("Starting Unified Character-Depot API...")
    print("Character API Health: http://localhost:8001/api/character-health")
    print("API Documentation: http://localhost:8001/api/character-docs")
    print()

    # Run on port 8001 to avoid conflict with main dashboard
    app.run(host='0.0.0.0', port=8001, debug=False)


if __name__ == '__main__':
    main()

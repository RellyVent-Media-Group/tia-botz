"""
Character Integration Validation Test
Comprehensive test of all character-depot integration components
"""

import sys
import json
from character_integration import CharacterIntegration, CharacterContentGenerator, CharacterBudgetTracker
from character_holdings_sync import CharacterHoldingsSync
from character_automation_triggers import CharacterAutomationSystem, TriggerType


def test_character_integration():
    """Test character data access layer"""
    print("=" * 80)
    print("TEST 1: Character Integration Layer")
    print("=" * 80)

    char_integration = CharacterIntegration()
    characters = char_integration.load_characters()

    assert len(characters) > 0, "No characters loaded"
    print(f"✓ Loaded {len(characters)} characters")

    # Test character lookup
    mary = char_integration.get_character_by_name("Mary")
    assert mary is not None, "Mary Magnumbytes not found"
    print(f"✓ Found character: {mary.name} - {mary.archetype}")

    # Test content creators
    creators = char_integration.get_content_creators()
    assert len(creators) > 0, "No content creators found"
    print(f"✓ Found {len(creators)} content creators")

    # Test financial experts
    experts = char_integration.get_financial_experts()
    assert len(experts) > 0, "No financial experts found"
    print(f"✓ Found {len(experts)} financial experts")

    # Test total budget
    total_budget = char_integration.get_total_allocated_budget()
    assert total_budget > 0, "Total budget is zero"
    print(f"✓ Total budget: ${total_budget:,.2f}")

    print("✓ Character Integration Layer: PASSED\n")
    return True


def test_content_generation():
    """Test character content generation"""
    print("=" * 80)
    print("TEST 2: Character Content Generation")
    print("=" * 80)

    char_integration = CharacterIntegration()
    generator = CharacterContentGenerator(char_integration)

    # Test single content idea generation
    mary = char_integration.get_character_by_name("Mary")
    idea = generator.generate_content_idea(mary.id, 'social')

    assert 'error' not in idea, "Content idea generation failed"
    assert idea['character_name'] == mary.name, "Character name mismatch"
    print(f"✓ Generated content idea for {mary.name}")
    print(f"  Angle: {idea['suggested_angle']}")
    print(f"  Themes: {', '.join(idea['key_themes'])}")

    # Test batch content generation
    batch_ideas = generator.generate_batch_content_ideas(3)
    assert len(batch_ideas) > 0, "Batch content generation failed"
    print(f"✓ Generated {len(batch_ideas)} batch content ideas")

    print("✓ Character Content Generation: PASSED\n")
    return True


def test_budget_tracking():
    """Test character budget tracking"""
    print("=" * 80)
    print("TEST 3: Character Budget Tracking")
    print("=" * 80)

    char_integration = CharacterIntegration()
    tracker = CharacterBudgetTracker(char_integration)

    # Test budget summary
    report = tracker.get_budget_utilization_report()
    assert report['total_allocated_budget'] > 0, "Total budget is zero"
    print(f"✓ Total budget: ${report['total_allocated_budget']:,.2f}")
    print(f"✓ Average budget per character: ${report['average_budget_per_character']:,.2f}")

    # Test budget by archetype
    budgets_by_archetype = tracker.get_total_budget_by_archetype()
    assert len(budgets_by_archetype) > 0, "No archetype budgets found"
    print(f"✓ Found {len(budgets_by_archetype)} archetypes with budgets")

    # Test character budgets
    character_budgets = tracker.get_character_budgets()
    assert len(character_budgets) > 0, "No character budgets found"
    print(f"✓ Found {len(character_budgets)} character budgets")

    print("✓ Character Budget Tracking: PASSED\n")
    return True


def test_budget_synchronization():
    """Test character-holdings budget synchronization"""
    print("=" * 80)
    print("TEST 4: Character-Holdings Budget Synchronization")
    print("=" * 80)

    char_integration = CharacterIntegration()
    sync = CharacterHoldingsSync(char_integration)

    # Test budget sync
    sync_result = sync.sync_character_budgets()
    assert sync_result['total_characters'] > 0, "No characters synced"
    print(f"✓ Synced {sync_result['total_characters']} characters")
    print(f"✓ Total budget: ${sync_result['total_budget']:,.2f}")

    # Test allocation summary
    summary = sync.get_allocation_summary()
    assert summary['total_characters'] > 0, "No characters in summary"
    print(f"✓ Allocation rate: {summary['allocation_rate']:.1f}%")

    # Test budget allocation
    mary_id = 1
    test_asset_id = "test_asset_validation"
    allocation_success = sync.allocate_budget_to_asset(mary_id, test_asset_id, 1000.0)
    assert allocation_success, "Budget allocation failed"
    print(f"✓ Allocated $1,000 to test asset for character {mary_id}")

    # Verify allocation
    allocation = sync.get_character_allocation(mary_id)
    assert allocation is not None, "Character allocation not found"
    assert test_asset_id in allocation.asset_ids, "Asset ID not in allocation"
    print(f"✓ Verified allocation for character {mary_id}")

    # Test utilization by archetype
    archetype_utilization = sync.get_budget_utilization_by_archetype()
    assert len(archetype_utilization) > 0, "No archetype utilization found"
    print(f"✓ Found utilization data for {len(archetype_utilization)} archetypes")

    print("✓ Character-Holdings Budget Synchronization: PASSED\n")
    return True


def test_automation_triggers():
    """Test character automation triggers"""
    print("=" * 80)
    print("TEST 5: Character Automation Triggers")
    print("=" * 80)

    char_integration = CharacterIntegration()
    holdings_sync = CharacterHoldingsSync(char_integration)
    automation = CharacterAutomationSystem(char_integration, holdings_sync)

    # Test trigger summary
    summary = automation.get_trigger_summary()
    assert summary['total_triggers'] > 0, "No triggers found"
    print(f"✓ Total triggers: {summary['total_triggers']}")
    print(f"✓ Enabled triggers: {summary['enabled_triggers']}")

    # Test trigger evaluation
    triggered = automation.evaluate_triggers()
    print(f"✓ Evaluated triggers, {len(triggered)} actions triggered")

    # Test adding a new trigger
    mary = char_integration.get_character_by_name("Mary")
    trigger_id = automation.add_trigger(
        character_id=mary.id,
        character_name=mary.name,
        trigger_type=TriggerType.CONTENT_GENERATION,
        condition={"schedule": "daily"},
        action="generate_content_idea",
        parameters={"content_type": "social"}
    )
    assert trigger_id is not None, "Trigger creation failed"
    print(f"✓ Added new trigger: {trigger_id}")

    # Test trigger report
    report = automation.generate_report()
    assert len(report) > 0, "Report generation failed"
    print(f"✓ Generated automation report")

    print("✓ Character Automation Triggers: PASSED\n")
    return True


def test_api_endpoints():
    """Test unified character API endpoints"""
    print("=" * 80)
    print("TEST 6: Unified Character API Endpoints")
    print("=" * 80)

    import requests
    import time
    import subprocess

    # Start the API server
    print("Starting unified character API...")
    api_process = subprocess.Popen(
        ['python3', 'unified_character_api.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # Wait for server to start
    time.sleep(3)

    try:
        # Test health endpoint
        response = requests.get('http://localhost:8001/api/character-health', timeout=2)
        assert response.status_code == 200, "Health check failed"
        health_data = response.json()
        assert health_data['status'] == 'healthy', "API not healthy"
        print(f"✓ API health check: {health_data['status']}")
        print(f"✓ Characters loaded: {health_data['characters_loaded']}")

        # Test characters endpoint
        response = requests.get('http://localhost:8001/api/characters?limit=5', timeout=2)
        assert response.status_code == 200, "Characters endpoint failed"
        characters_data = response.json()
        assert characters_data['success'] == True, "Characters request failed"
        print(f"✓ Characters endpoint: {characters_data['total']} characters")

        # Test specific character endpoint
        response = requests.get('http://localhost:8001/api/characters/1', timeout=2)
        assert response.status_code == 200, "Character endpoint failed"
        character_data = response.json()
        assert character_data['success'] == True, "Character request failed"
        print(f"✓ Character endpoint: {character_data['data']['name']}")

        # Test content generation endpoint
        response = requests.get('http://localhost:8001/api/content/generate/1', timeout=2)
        assert response.status_code == 200, "Content generation endpoint failed"
        content_data = response.json()
        assert content_data['success'] == True, "Content generation failed"
        print(f"✓ Content generation: {content_data['data']['character_name']}")

        # Test budget summary endpoint
        response = requests.get('http://localhost:8001/api/budget/summary', timeout=2)
        assert response.status_code == 200, "Budget summary endpoint failed"
        budget_data = response.json()
        assert budget_data['success'] == True, "Budget summary failed"
        print(f"✓ Budget summary: ${budget_data['data']['total_allocated_budget']:,.2f}")

        # Test analytics endpoint
        response = requests.get('http://localhost:8001/api/analytics/character-performance', timeout=2)
        assert response.status_code == 200, "Analytics endpoint failed"
        analytics_data = response.json()
        assert analytics_data['success'] == True, "Analytics failed"
        print(f"✓ Analytics: {analytics_data['summary']['total_characters']} characters")

        print("✓ Unified Character API Endpoints: PASSED\n")

    except requests.RequestException as e:
        print(f"✗ API endpoint test failed: {e}")
        return False
    finally:
        # Stop the API server
        api_process.terminate()
        api_process.wait()

    return True


def main():
    """Run all integration tests"""
    print("\n" + "=" * 80)
    print("CHARACTER-DEPOT INTEGRATION VALIDATION TEST SUITE")
    print("=" * 80 + "\n")

    tests = [
        ("Character Integration Layer", test_character_integration),
        ("Character Content Generation", test_content_generation),
        ("Character Budget Tracking", test_budget_tracking),
        ("Character-Holdings Budget Synchronization", test_budget_synchronization),
        ("Character Automation Triggers", test_automation_triggers),
        ("Unified Character API Endpoints", test_api_endpoints),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"✗ {test_name}: FAILED - {e}\n")
            results.append((test_name, False))

    # Print summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All integration tests PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())

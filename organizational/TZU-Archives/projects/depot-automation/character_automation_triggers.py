"""
Character-Triggered Automation Workflows
Integrates character events with depot automation triggers
"""

import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

from character_integration import CharacterIntegration, CharacterContentGenerator
from character_holdings_sync import CharacterHoldingsSync


class TriggerType(Enum):
    BUDGET_ALERT = "budget_alert"
    CONTENT_GENERATION = "content_generation"
    CHARACTER_STATUS_CHANGE = "character_status_change"
    BUDGET_UTILIZATION = "budget_utilization"
    CHARACTER_MILESTONE = "character_milestone"


@dataclass
class CharacterTrigger:
    """Automation trigger based on character data"""
    trigger_id: str
    character_id: int
    character_name: str
    trigger_type: TriggerType
    condition: Dict
    action: str
    parameters: Dict
    created_at: str
    last_triggered: str
    trigger_count: int
    enabled: bool


class CharacterAutomationSystem:
    """Manages character-triggered automation workflows"""

    def __init__(self, character_integration: CharacterIntegration,
                 holdings_sync: CharacterHoldingsSync):
        self.char_integration = character_integration
        self.holdings_sync = holdings_sync
        self.content_generator = CharacterContentGenerator(character_integration)
        self.triggers: Dict[str, CharacterTrigger] = {}
        self.trigger_history: List[Dict] = []
        self.load_triggers()

    def load_triggers(self):
        """Load triggers from file"""
        try:
            with open('data/character_triggers.json', 'r') as f:
                data = json.load(f)
                for trigger_id, trigger_data in data.get("triggers", {}).items():
                    self.triggers[trigger_id] = CharacterTrigger(
                        trigger_id=trigger_id,
                        character_id=trigger_data["character_id"],
                        character_name=trigger_data["character_name"],
                        trigger_type=TriggerType(trigger_data["trigger_type"]),
                        condition=trigger_data["condition"],
                        action=trigger_data["action"],
                        parameters=trigger_data["parameters"],
                        created_at=trigger_data["created_at"],
                        last_triggered=trigger_data["last_triggered"],
                        trigger_count=trigger_data["trigger_count"],
                        enabled=trigger_data["enabled"]
                    )
        except FileNotFoundError:
            self._initialize_default_triggers()

    def save_triggers(self):
        """Save triggers to file"""
        data = {
            "triggers": {},
            "last_updated": datetime.datetime.now().isoformat()
        }

        for trigger_id, trigger in self.triggers.items():
            data["triggers"][trigger_id] = {
                "trigger_id": trigger.trigger_id,
                "character_id": trigger.character_id,
                "character_name": trigger.character_name,
                "trigger_type": trigger.trigger_type.value,
                "condition": trigger.condition,
                "action": trigger.action,
                "parameters": trigger.parameters,
                "created_at": trigger.created_at,
                "last_triggered": trigger.last_triggered,
                "trigger_count": trigger.trigger_count,
                "enabled": trigger.enabled
            }

        with open('data/character_triggers.json', 'w') as f:
            json.dump(data, f, indent=2)

    def _initialize_default_triggers(self):
        """Initialize default character triggers"""
        # Budget utilization triggers for high-budget characters
        characters = self.char_integration.load_characters()
        high_budget_chars = [c for c in characters if c.allocated_budget >= 150000]

        for char in high_budget_chars:
            self.add_trigger(
                character_id=char.id,
                character_name=char.name,
                trigger_type=TriggerType.BUDGET_UTILIZATION,
                condition={"threshold": 0.8, "type": "high_utilization"},
                action="send_budget_alert",
                parameters={"recipient": "admin@tiapmaatzu.com"}
            )

        # Content generation triggers for content creators
        content_creators = self.char_integration.get_content_creators()
        for char in content_creators[:5]:  # Top 5 content creators
            self.add_trigger(
                character_id=char.id,
                character_name=char.name,
                trigger_type=TriggerType.CONTENT_GENERATION,
                condition={"schedule": "weekly", "day": "monday"},
                action="generate_content_idea",
                parameters={"content_type": "social"}
            )

    def add_trigger(self, character_id: int, character_name: str,
                    trigger_type: TriggerType, condition: Dict,
                    action: str, parameters: Dict) -> str:
        """Add a new character trigger"""
        trigger_id = f"TRIGGER_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{character_id}"

        trigger = CharacterTrigger(
            trigger_id=trigger_id,
            character_id=character_id,
            character_name=character_name,
            trigger_type=trigger_type,
            condition=condition,
            action=action,
            parameters=parameters,
            created_at=datetime.datetime.now().isoformat(),
            last_triggered="",
            trigger_count=0,
            enabled=True
        )

        self.triggers[trigger_id] = trigger
        self.save_triggers()
        return trigger_id

    def evaluate_triggers(self) -> List[Dict]:
        """Evaluate all enabled triggers and return triggered actions"""
        triggered_actions = []

        for trigger_id, trigger in self.triggers.items():
            if not trigger.enabled:
                continue

            if self._evaluate_condition(trigger):
                action_result = self._execute_action(trigger)
                triggered_actions.append({
                    "trigger_id": trigger_id,
                    "character_name": trigger.character_name,
                    "trigger_type": trigger.trigger_type.value,
                    "action": trigger.action,
                    "result": action_result,
                    "triggered_at": datetime.datetime.now().isoformat()
                })

                # Update trigger
                trigger.last_triggered = datetime.datetime.now().isoformat()
                trigger.trigger_count += 1
                self.save_triggers()

                # Add to history
                self.trigger_history.append(triggered_actions[-1])

        return triggered_actions

    def _evaluate_condition(self, trigger: CharacterTrigger) -> bool:
        """Evaluate if trigger condition is met"""
        char = self.char_integration.get_character(trigger.character_id)
        if not char:
            return False

        condition = trigger.condition

        if trigger.trigger_type == TriggerType.BUDGET_UTILIZATION:
            allocation = self.holdings_sync.get_character_allocation(trigger.character_id)
            if allocation:
                utilization = allocation.allocated_to_assets / allocation.allocated_budget
                threshold = condition.get("threshold", 0.8)
                return utilization >= threshold

        elif trigger.trigger_type == TriggerType.CONTENT_GENERATION:
            # Check if scheduled time matches
            if "schedule" in condition:
                now = datetime.datetime.now()
                if condition["schedule"] == "weekly" and condition["day"] == now.strftime("%A").lower():
                    return True
            return False

        elif trigger.trigger_type == TriggerType.BUDGET_ALERT:
            allocation = self.holdings_sync.get_character_allocation(trigger.character_id)
            if allocation:
                remaining = allocation.remaining_budget
                threshold = condition.get("threshold", 10000)
                return remaining <= threshold

        return False

    def _execute_action(self, trigger: CharacterTrigger) -> Dict:
        """Execute the trigger action"""
        action = trigger.action
        parameters = trigger.parameters

        if action == "send_budget_alert":
            return {
                "status": "success",
                "message": f"Budget alert sent for {trigger.character_name}",
                "details": parameters
            }

        elif action == "generate_content_idea":
            idea = self.content_generator.generate_content_idea(
                trigger.character_id,
                parameters.get("content_type", "social")
            )
            return {
                "status": "success",
                "message": f"Content idea generated for {trigger.character_name}",
                "idea": idea
            }

        elif action == "allocate_budget":
            allocation = self.holdings_sync.allocate_budget_to_asset(
                trigger.character_id,
                parameters.get("asset_id"),
                parameters.get("amount", 0)
            )
            return {
                "status": "success" if allocation else "failed",
                "message": f"Budget allocation for {trigger.character_name}",
                "details": parameters
            }

        return {
            "status": "unknown",
            "message": f"Action {action} not implemented"
        }

    def get_trigger_summary(self) -> Dict:
        """Get summary of all triggers"""
        total_triggers = len(self.triggers)
        enabled_triggers = sum(1 for t in self.triggers.values() if t.enabled)
        total_triggered = sum(t.trigger_count for t in self.triggers.values())

        triggers_by_type = {}
        for trigger in self.triggers.values():
            ttype = trigger.trigger_type.value
            triggers_by_type[ttype] = triggers_by_type.get(ttype, 0) + 1

        return {
            "total_triggers": total_triggers,
            "enabled_triggers": enabled_triggers,
            "disabled_triggers": total_triggers - enabled_triggers,
            "total_triggered": total_triggered,
            "triggers_by_type": triggers_by_type,
            "trigger_history_count": len(self.trigger_history)
        }

    def generate_report(self) -> str:
        """Generate character automation report"""
        summary = self.get_trigger_summary()

        report = []
        report.append("=" * 80)
        report.append("CHARACTER AUTOMATION TRIGGERS REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")

        report.append("SUMMARY:")
        report.append(f"  Total Triggers: {summary['total_triggers']}")
        report.append(f"  Enabled: {summary['enabled_triggers']}")
        report.append(f"  Disabled: {summary['disabled_triggers']}")
        report.append(f"  Total Executions: {summary['total_triggered']}")
        report.append("")

        report.append("TRIGGERS BY TYPE:")
        for ttype, count in summary['triggers_by_type'].items():
            report.append(f"  {ttype}: {count}")
        report.append("")

        report.append("RECENT TRIGGER HISTORY:")
        for history_item in self.trigger_history[-5:]:
            report.append(f"  {history_item['triggered_at']}")
            report.append(f"    Character: {history_item['character_name']}")
            report.append(f"    Type: {history_item['trigger_type']}")
            report.append(f"    Action: {history_item['action']}")
            report.append(f"    Status: {history_item['result']['status']}")
            report.append("")

        return "\n".join(report)


def main():
    """Test the character automation system"""
    print("=== Character Automation Triggers Test ===\n")

    # Initialize integration
    char_integration = CharacterIntegration()
    holdings_sync = CharacterHoldingsSync(char_integration)
    automation = CharacterAutomationSystem(char_integration, holdings_sync)

    # Get trigger summary
    print("Trigger Summary:")
    summary = automation.get_trigger_summary()
    print(f"  Total Triggers: {summary['total_triggers']}")
    print(f"  Enabled: {summary['enabled_triggers']}")
    print(f"  Total Executions: {summary['total_triggered']}")
    print()

    # Evaluate triggers
    print("Evaluating triggers...")
    triggered = automation.evaluate_triggers()
    print(f"Triggered {len(triggered)} actions")
    for action in triggered:
        print(f"  - {action['character_name']}: {action['action']}")
    print()

    # Generate report
    print("Generating automation report...")
    report = automation.generate_report()
    print(report)

    print("=== Test Complete ===")


if __name__ == "__main__":
    main()

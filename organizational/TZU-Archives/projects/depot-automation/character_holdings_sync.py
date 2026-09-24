"""
Character-Holdings Budget Synchronization
Synchronizes character allocated budgets with Holdings depot asset management
"""

import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from character_integration import CharacterIntegration, Character


@dataclass
class CharacterBudgetAllocation:
    """Budget allocation for a character"""
    character_id: int
    character_name: str
    allocated_budget: float
    allocated_to_assets: float
    remaining_budget: float
    asset_ids: List[str]
    last_synced: str


class CharacterHoldingsSync:
    """Synchronize character budgets with Holdings asset management"""

    def __init__(self, character_integration: CharacterIntegration,
                 holdings_data_path: str = "holdings-automation/holdings_asset_data.json"):
        self.char_integration = character_integration
        self.holdings_data_path = holdings_data_path
        self.budget_allocations: Dict[int, CharacterBudgetAllocation] = {}
        self.load_allocations()

    def load_allocations(self):
        """Load budget allocations from file"""
        try:
            with open(self.holdings_data_path.replace('.json', '_budgets.json'), 'r') as f:
                data = json.load(f)
                for char_id, alloc_data in data.get("allocations", {}).items():
                    self.budget_allocations[int(char_id)] = CharacterBudgetAllocation(
                        character_id=alloc_data["character_id"],
                        character_name=alloc_data["character_name"],
                        allocated_budget=alloc_data["allocated_budget"],
                        allocated_to_assets=alloc_data["allocated_to_assets"],
                        remaining_budget=alloc_data["remaining_budget"],
                        asset_ids=alloc_data["asset_ids"],
                        last_synced=alloc_data["last_synced"]
                    )
        except FileNotFoundError:
            # Initialize with character budgets
            self._initialize_from_characters()

    def save_allocations(self):
        """Save budget allocations to file"""
        data = {
            "allocations": {},
            "last_synced": datetime.datetime.now().isoformat()
        }

        for char_id, allocation in self.budget_allocations.items():
            data["allocations"][str(char_id)] = {
                "character_id": allocation.character_id,
                "character_name": allocation.character_name,
                "allocated_budget": allocation.allocated_budget,
                "allocated_to_assets": allocation.allocated_to_assets,
                "remaining_budget": allocation.remaining_budget,
                "asset_ids": allocation.asset_ids,
                "last_synced": allocation.last_synced
            }

        with open(self.holdings_data_path.replace('.json', '_budgets.json'), 'w') as f:
            json.dump(data, f, indent=2)

    def _initialize_from_characters(self):
        """Initialize budget allocations from character data"""
        characters = self.char_integration.load_characters()
        for char in characters:
            self.budget_allocations[char.id] = CharacterBudgetAllocation(
                character_id=char.id,
                character_name=char.name,
                allocated_budget=char.allocated_budget,
                allocated_to_assets=0.0,
                remaining_budget=char.allocated_budget,
                asset_ids=[],
                last_synced=datetime.datetime.now().isoformat()
            )
        self.save_allocations()

    def sync_character_budgets(self) -> Dict[str, any]:
        """Synchronize character budgets with current character data"""
        characters = self.char_integration.load_characters()
        updated_count = 0

        for char in characters:
            if char.id in self.budget_allocations:
                # Update allocated budget if changed
                old_budget = self.budget_allocations[char.id].allocated_budget
                if old_budget != char.allocated_budget:
                    budget_diff = char.allocated_budget - old_budget
                    self.budget_allocations[char.id].allocated_budget = char.allocated_budget
                    self.budget_allocations[char.id].remaining_budget += budget_diff
                    self.budget_allocations[char.id].last_synced = datetime.datetime.now().isoformat()
                    updated_count += 1
            else:
                # Add new character
                self.budget_allocations[char.id] = CharacterBudgetAllocation(
                    character_id=char.id,
                    character_name=char.name,
                    allocated_budget=char.allocated_budget,
                    allocated_to_assets=0.0,
                    remaining_budget=char.allocated_budget,
                    asset_ids=[],
                    last_synced=datetime.datetime.now().isoformat()
                )
                updated_count += 1

        self.save_allocations()
        return {
            "total_characters": len(characters),
            "updated_allocations": updated_count,
            "total_budget": sum(alloc.allocated_budget for alloc in self.budget_allocations.values()),
            "total_allocated_to_assets": sum(alloc.allocated_to_assets for alloc in self.budget_allocations.values()),
            "total_remaining": sum(alloc.remaining_budget for alloc in self.budget_allocations.values())
        }

    def allocate_budget_to_asset(self, character_id: int, asset_id: str, amount: float) -> bool:
        """Allocate budget from a character to an asset"""
        if character_id not in self.budget_allocations:
            return False

        allocation = self.budget_allocations[character_id]

        if allocation.remaining_budget < amount:
            return False

        allocation.allocated_to_assets += amount
        allocation.remaining_budget -= amount
        if asset_id not in allocation.asset_ids:
            allocation.asset_ids.append(asset_id)
        allocation.last_synced = datetime.datetime.now().isoformat()

        self.save_allocations()
        return True

    def get_character_allocation(self, character_id: int) -> Optional[CharacterBudgetAllocation]:
        """Get budget allocation for a specific character"""
        return self.budget_allocations.get(character_id)

    def get_allocation_summary(self) -> Dict[str, any]:
        """Get summary of all budget allocations"""
        total_budget = sum(alloc.allocated_budget for alloc in self.budget_allocations.values())
        total_allocated = sum(alloc.allocated_to_assets for alloc in self.budget_allocations.values())
        total_remaining = sum(alloc.remaining_budget for alloc in self.budget_allocations.values())

        allocations_by_status = {
            "fully_allocated": [],
            "partially_allocated": [],
            "unallocated": []
        }

        for char_id, alloc in self.budget_allocations.items():
            if alloc.allocated_to_assets >= alloc.allocated_budget * 0.9:
                allocations_by_status["fully_allocated"].append(alloc.character_name)
            elif alloc.allocated_to_assets > 0:
                allocations_by_status["partially_allocated"].append(alloc.character_name)
            else:
                allocations_by_status["unallocated"].append(alloc.character_name)

        return {
            "total_characters": len(self.budget_allocations),
            "total_budget": total_budget,
            "total_allocated_to_assets": total_allocated,
            "total_remaining": total_remaining,
            "allocation_rate": (total_allocated / total_budget * 100) if total_budget > 0 else 0,
            "allocations_by_status": allocations_by_status,
            "last_synced": datetime.datetime.now().isoformat()
        }

    def get_budget_utilization_by_archetype(self) -> Dict[str, Dict]:
        """Get budget utilization grouped by character archetype"""
        characters = self.char_integration.load_characters()
        archetype_data = {}

        for char in characters:
            if char.id in self.budget_allocations:
                archetype = char.archetype
                alloc = self.budget_allocations[char.id]

                if archetype not in archetype_data:
                    archetype_data[archetype] = {
                        "total_budget": 0,
                        "total_allocated": 0,
                        "character_count": 0
                    }

                archetype_data[archetype]["total_budget"] += alloc.allocated_budget
                archetype_data[archetype]["total_allocated"] += alloc.allocated_to_assets
                archetype_data[archetype]["character_count"] += 1

        # Calculate utilization rates
        for archetype, data in archetype_data.items():
            data["utilization_rate"] = (data["total_allocated"] / data["total_budget"] * 100) if data["total_budget"] > 0 else 0

        return archetype_data

    def generate_sync_report(self) -> str:
        """Generate a budget synchronization report"""
        summary = self.get_allocation_summary()
        archetype_utilization = self.get_budget_utilization_by_archetype()

        report = []
        report.append("=" * 80)
        report.append("CHARACTER-HOLDINGS BUDGET SYNCHRONIZATION REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")

        report.append("SUMMARY:")
        report.append(f"  Total Characters: {summary['total_characters']}")
        report.append(f"  Total Budget: ${summary['total_budget']:,.2f}")
        report.append(f"  Allocated to Assets: ${summary['total_allocated_to_assets']:,.2f}")
        report.append(f"  Remaining Budget: ${summary['total_remaining']:,.2f}")
        report.append(f"  Allocation Rate: {summary['allocation_rate']:.1f}%")
        report.append("")

        report.append("ALLOCATION STATUS:")
        report.append(f"  Fully Allocated: {len(summary['allocations_by_status']['fully_allocated'])} characters")
        report.append(f"  Partially Allocated: {len(summary['allocations_by_status']['partially_allocated'])} characters")
        report.append(f"  Unallocated: {len(summary['allocations_by_status']['unallocated'])} characters")
        report.append("")

        report.append("UTILIZATION BY ARCHETYPE:")
        for archetype, data in sorted(archetype_utilization.items(), key=lambda x: x[1]['total_budget'], reverse=True):
            report.append(f"  {archetype}:")
            report.append(f"    Characters: {data['character_count']}")
            report.append(f"    Total Budget: ${data['total_budget']:,.2f}")
            report.append(f"    Allocated: ${data['total_allocated']:,.2f}")
            report.append(f"    Utilization: {data['utilization_rate']:.1f}%")
            report.append("")

        report.append("TOP 5 CHARACTERS BY BUDGET:")
        sorted_allocations = sorted(self.budget_allocations.values(),
                                   key=lambda x: x.allocated_budget, reverse=True)
        for i, alloc in enumerate(sorted_allocations[:5], 1):
            utilization = (alloc.allocated_to_assets / alloc.allocated_budget * 100) if alloc.allocated_budget > 0 else 0
            report.append(f"  {i}. {alloc.character_name}")
            report.append(f"     Budget: ${alloc.allocated_budget:,.2f}")
            report.append(f"     Allocated: ${alloc.allocated_to_assets:,.2f} ({utilization:.1f}%)")
            report.append(f"     Remaining: ${alloc.remaining_budget:,.2f}")
            report.append(f"     Assets: {len(alloc.asset_ids)}")
            report.append("")

        return "\n".join(report)


def main():
    """Test the character-holdings synchronization"""
    print("=== Character-Holdings Budget Synchronization Test ===\n")

    # Initialize integration
    char_integration = CharacterIntegration()
    sync = CharacterHoldingsSync(char_integration)

    # Sync character budgets
    print("Syncing character budgets...")
    sync_result = sync.sync_character_budgets()
    print(f"Synced {sync_result['total_characters']} characters")
    print(f"Updated {sync_result['updated_allocations']} allocations")
    print(f"Total Budget: ${sync_result['total_budget']:,.2f}")
    print()

    # Get allocation summary
    print("Allocation Summary:")
    summary = sync.get_allocation_summary()
    print(f"  Allocation Rate: {summary['allocation_rate']:.1f}%")
    print(f"  Fully Allocated: {len(summary['allocations_by_status']['fully_allocated'])}")
    print(f"  Partially Allocated: {len(summary['allocations_by_status']['partially_allocated'])}")
    print(f"  Unallocated: {len(summary['allocations_by_status']['unallocated'])}")
    print()

    # Test budget allocation
    print("Testing budget allocation...")
    mary_id = 1  # Mary Magnumbytes
    if sync.allocate_budget_to_asset(mary_id, "test_asset_001", 50000.0):
        print(f"Allocated $50,000 to test_asset_001 for character {mary_id}")
        alloc = sync.get_character_allocation(mary_id)
        print(f"  Remaining budget: ${alloc.remaining_budget:,.2f}")
    print()

    # Generate report
    print("Generating synchronization report...")
    report = sync.generate_sync_report()
    print(report)

    print("=== Test Complete ===")


if __name__ == "__main__":
    main()

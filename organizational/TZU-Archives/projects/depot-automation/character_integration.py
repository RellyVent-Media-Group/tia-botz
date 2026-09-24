"""
Character Integration Module
Integrates character database with depot automation system
"""

import json
import os
import requests
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class CharacterRarity(Enum):
    LEGENDARY = "Legendary"
    RARE = "Rare"
    COMMON = "Common"


class EntityType(Enum):
    PRIMARY_CHARACTER = "Primary Character"
    PRIMARY_ENTITY = "Primary Entity"
    LEGENDARY_ENTITY = "Legendary Entity"
    COMMON_ENTITY = "Common Entity"
    RARE_SOUL = "Rare Soul"


@dataclass
class CharacterPrompts:
    hook: str
    branding: str
    trust: str


@dataclass
class Character:
    id: int
    name: str
    allocated_budget: float
    archetype: str
    description: str
    entity_type: str
    gender: str
    rarity: str
    status: str
    key_tool_categories: List[str]
    prompts: CharacterPrompts

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Character':
        prompts_data = data.get('prompts', {})
        prompts = CharacterPrompts(
            hook=prompts_data.get('hook', ''),
            branding=prompts_data.get('branding', ''),
            trust=prompts_data.get('trust', '')
        )
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            allocated_budget=data.get('allocatedBudget', 0),
            archetype=data.get('archetype', ''),
            description=data.get('description', ''),
            entity_type=data.get('entityType', ''),
            gender=data.get('gender', ''),
            rarity=data.get('rarity', ''),
            status=data.get('status', ''),
            key_tool_categories=data.get('keyToolCategory', []),
            prompts=prompts
        )


class CharacterDataSource(Enum):
    LOCAL_FILE = "local_file"
    INTEGRATION_HUB = "integration_hub"


class CharacterIntegration:
    """Main integration class for character data access"""

    def __init__(self, data_source: CharacterDataSource = CharacterDataSource.LOCAL_FILE,
                 local_path: str = None,
                 hub_url: str = None):
        self.data_source = data_source
        self.local_path = local_path or "/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/characters-cleaned.json"
        self.hub_url = hub_url or "http://localhost:3001"
        self._cache: Dict[int, Character] = {}
        self._last_load: Optional[datetime] = None

    def load_characters(self, force_reload: bool = False) -> List[Character]:
        """Load all characters from the configured data source"""
        if self._cache and not force_reload:
            return list(self._cache.values())

        if self.data_source == CharacterDataSource.LOCAL_FILE:
            characters = self._load_from_file()
        else:
            characters = self._load_from_hub()

        # Cache characters
        self._cache = {char.id: char for char in characters}
        self._last_load = datetime.now()
        return characters

    def _load_from_file(self) -> List[Character]:
        """Load characters from local JSON file"""
        try:
            with open(self.local_path, 'r') as f:
                data = json.load(f)
                characters_data = data.get('characters', [])
                return [Character.from_dict(c) for c in characters_data]
        except FileNotFoundError:
            print(f"Character file not found: {self.local_path}")
            return []
        except json.JSONDecodeError as e:
            print(f"Error parsing character file: {e}")
            return []

    def _load_from_hub(self) -> List[Character]:
        """Load characters from integration hub API"""
        try:
            response = requests.get(f"{self.hub_url}/api/characters", timeout=5)
            response.raise_for_status()
            data = response.json()
            characters_data = data.get('data', [])
            return [Character.from_dict(c) for c in characters_data]
        except requests.RequestException as e:
            print(f"Error loading from integration hub: {e}")
            # Fallback to local file
            print("Falling back to local file...")
            self.data_source = CharacterDataSource.LOCAL_FILE
            return self._load_from_file()

    def get_character(self, character_id: int) -> Optional[Character]:
        """Get a specific character by ID"""
        if not self._cache:
            self.load_characters()
        return self._cache.get(character_id)

    def get_character_by_name(self, name: str) -> Optional[Character]:
        """Get a character by name (partial match)"""
        if not self._cache:
            self.load_characters()
        name_lower = name.lower()
        for char in self._cache.values():
            if name_lower in char.name.lower():
                return char
        return None

    def get_characters_by_archetype(self, archetype: str) -> List[Character]:
        """Get all characters of a specific archetype"""
        if not self._cache:
            self.load_characters()
        archetype_lower = archetype.lower()
        return [char for char in self._cache.values()
                if archetype_lower in char.archetype.lower()]

    def get_characters_by_rarity(self, rarity: str) -> List[Character]:
        """Get all characters of a specific rarity"""
        if not self._cache:
            self.load_characters()
        return [char for char in self._cache.values() if char.rarity == rarity]

    def get_characters_by_category(self, category: str) -> List[Character]:
        """Get characters that have a specific key tool category"""
        if not self._cache:
            self.load_characters()
        category_lower = category.lower()
        return [char for char in self._cache.values()
                if any(category_lower in cat.lower() for cat in char.key_tool_categories)]

    def get_content_creators(self) -> List[Character]:
        """Get characters suitable for content creation"""
        content_categories = ['Content Creation', 'Visual Arts', 'Performance']
        creators = []
        for category in content_categories:
            creators.extend(self.get_characters_by_category(category))
        # Remove duplicates
        seen = set()
        unique_creators = []
        for char in creators:
            if char.id not in seen:
                seen.add(char.id)
                unique_creators.append(char)
        return unique_creators

    def get_financial_experts(self) -> List[Character]:
        """Get characters suitable for financial operations"""
        financial_categories = ['Finance', 'Strategy', 'Operations']
        experts = []
        for category in financial_categories:
            experts.extend(self.get_characters_by_category(category))
        # Remove duplicates
        seen = set()
        unique_experts = []
        for char in experts:
            if char.id not in seen:
                seen.add(char.id)
                unique_experts.append(char)
        return unique_experts

    def get_total_allocated_budget(self) -> float:
        """Get total allocated budget across all characters"""
        if not self._cache:
            self.load_characters()
        return sum(char.allocated_budget for char in self._cache.values())

    def get_active_characters(self) -> List[Character]:
        """Get all active characters"""
        if not self._cache:
            self.load_characters()
        return [char for char in self._cache.values() if char.status == 'Active']

    def get_random_character(self) -> Optional[Character]:
        """Get a random character"""
        active = self.get_active_characters()
        if not active:
            return None
        import random
        return random.choice(active)

    def search_characters(self, query: str) -> List[Character]:
        """Search characters by name, archetype, or description"""
        if not self._cache:
            self.load_characters()
        query_lower = query.lower()
        results = []
        for char in self._cache.values():
            if (query_lower in char.name.lower() or
                query_lower in char.archetype.lower() or
                query_lower in char.description.lower()):
                results.append(char)
        return results

    def get_character_prompt(self, character_id: int, prompt_type: str = 'hook') -> Optional[str]:
        """Get a specific prompt for a character"""
        char = self.get_character(character_id)
        if not char:
            return None
        return getattr(char.prompts, prompt_type, None)


class CharacterContentGenerator:
    """Generate content ideas based on character data"""

    def __init__(self, character_integration: CharacterIntegration):
        self.char_integration = character_integration

    def generate_content_idea(self, character_id: int, content_type: str = 'social') -> Dict[str, Any]:
        """Generate a content idea for a specific character"""
        char = self.char_integration.get_character(character_id)
        if not char:
            return {"error": "Character not found"}

        prompt = self.char_integration.get_character_prompt(character_id, 'hook')

        idea = {
            "character_id": char.id,
            "character_name": char.name,
            "archetype": char.archetype,
            "content_type": content_type,
            "prompt": prompt,
            "suggested_angle": self._generate_content_angle(char, content_type),
            "key_themes": self._extract_themes(char),
            "estimated_engagement": self._estimate_engagement(char),
            "budget_allocation": char.allocated_budget,
            "generated_at": datetime.now().isoformat()
        }
        return idea

    def _generate_content_angle(self, char: Character, content_type: str) -> str:
        """Generate a content angle based on character archetype"""
        angles = {
            'Digital Storyteller': f"Focus on {char.name}'s narrative expertise and tech-forward approach",
            'Shadow Work Specialist': f"Highlight {char.name}'s community wisdom and traditional knowledge",
            'Operations & Logistics': f"Showcase {char.name}'s operational excellence and systematic thinking",
            'Strategy & Planning': f"Emphasize {char.name}'s strategic vision and analytical insights",
            'Performance Artist': f"Capture {char.name}'s stage presence and authentic expression",
            'Cinematic Artist': f"Leverage {char.name}'s visual storytelling and cinematic techniques"
        }
        return angles.get(char.archetype, f"Feature {char.name}'s unique perspective as {char.archetype}")

    def _extract_themes(self, char: Character) -> List[str]:
        """Extract key themes from character data"""
        themes = [char.archetype]
        themes.extend(char.key_tool_categories[:3])  # Top 3 categories
        return themes

    def _estimate_engagement(self, char: Character) -> str:
        """Estimate potential engagement based on character attributes"""
        if char.rarity == 'Legendary':
            return 'High'
        elif char.rarity == 'Rare':
            return 'Medium'
        else:
            return 'Standard'

    def generate_batch_content_ideas(self, count: int = 5) -> List[Dict[str, Any]]:
        """Generate multiple content ideas from different characters"""
        creators = self.char_integration.get_content_creators()
        if not creators:
            return []

        import random
        selected = random.sample(creators, min(count, len(creators)))
        return [self.generate_content_idea(char.id) for char in selected]


class CharacterBudgetTracker:
    """Track and synchronize character budgets with Holdings depot"""

    def __init__(self, character_integration: CharacterIntegration):
        self.char_integration = character_integration

    def get_character_budgets(self) -> Dict[str, float]:
        """Get all character budgets"""
        if not self.char_integration._cache:
            self.char_integration.load_characters()
        return {char.name: char.allocated_budget for char in self.char_integration._cache.values()}

    def get_total_budget_by_archetype(self) -> Dict[str, float]:
        """Get total budget grouped by archetype"""
        if not self.char_integration._cache:
            self.char_integration.load_characters()
        budgets = {}
        for char in self.char_integration._cache.values():
            budgets[char.archetype] = budgets.get(char.archetype, 0) + char.allocated_budget
        return budgets

    def get_budget_utilization_report(self) -> Dict[str, Any]:
        """Generate a budget utilization report"""
        total_budget = self.char_integration.get_total_allocated_budget()
        budgets_by_archetype = self.get_total_budget_by_archetype()

        return {
            "total_allocated_budget": total_budget,
            "total_characters": len(self.char_integration._cache),
            "budgets_by_archetype": budgets_by_archetype,
            "average_budget_per_character": total_budget / len(self.char_integration._cache) if self.char_integration._cache else 0,
            "highest_budget_character": max(self.char_integration._cache.values(),
                                            key=lambda c: c.allocated_budget).name if self.char_integration._cache else None,
            "lowest_budget_character": min(self.char_integration._cache.values(),
                                           key=lambda c: c.allocated_budget).name if self.char_integration._cache else None,
            "generated_at": datetime.now().isoformat()
        }


def main():
    """Test the character integration"""
    print("=== Character Integration Test ===\n")

    # Initialize integration
    char_integration = CharacterIntegration()

    # Load characters
    print("Loading characters...")
    characters = char_integration.load_characters()
    print(f"Loaded {len(characters)} characters\n")

    # Test specific character lookup
    print("Looking up Mary Magnumbytes...")
    mary = char_integration.get_character_by_name("Mary")
    if mary:
        print(f"Found: {mary.name} - {mary.archetype} - Budget: ${mary.allocated_budget:,}")
        print(f"Categories: {', '.join(mary.key_tool_categories)}\n")

    # Test content creators
    print("Getting content creators...")
    creators = char_integration.get_content_creators()
    print(f"Found {len(creators)} content creators")
    for creator in creators[:3]:
        print(f"  - {creator.name} ({creator.archetype})")
    print()

    # Test content generation
    print("Generating content ideas...")
    generator = CharacterContentGenerator(char_integration)
    if mary:
        idea = generator.generate_content_idea(mary.id)
        print(f"Content idea for {mary.name}:")
        print(f"  Angle: {idea['suggested_angle']}")
        print(f"  Themes: {', '.join(idea['key_themes'])}")
        print(f"  Estimated Engagement: {idea['estimated_engagement']}\n")

    # Test budget tracking
    print("Budget utilization report...")
    tracker = CharacterBudgetTracker(char_integration)
    report = tracker.get_budget_utilization_report()
    print(f"Total Budget: ${report['total_allocated_budget']:,}")
    print(f"Average per Character: ${report['average_budget_per_character']:,.2f}")
    print(f"Highest Budget: {report['highest_budget_character']}")
    print(f"Lowest Budget: {report['lowest_budget_character']}\n")

    print("=== Test Complete ===")


if __name__ == "__main__":
    main()

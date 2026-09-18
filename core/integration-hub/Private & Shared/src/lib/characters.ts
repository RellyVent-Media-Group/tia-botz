import charactersData from '../../characters-cleaned.json';

export interface Character {
  id: number;
  name: string;
  allocatedBudget: number;
  archetype: string;
  description: string;
  entityType: string;
  gender: string;
  rarity: string;
  status: string;
  keyToolCategory: string[];
  prompts: {
    hook: string;
    branding: string;
    trust: string;
  };
}

export const characters: Character[] = charactersData.characters;

export function getCharacterById(id: number): Character | undefined {
  return characters.find(char => char.id === id);
}

export function getCharactersByRarity(rarity: string): Character[] {
  return characters.filter(char => char.rarity === rarity);
}

export function getCharactersByStatus(status: string): Character[] {
  return characters.filter(char => char.status === status);
}

export function searchCharacters(query: string): Character[] {
  const lowerQuery = query.toLowerCase();
  return characters.filter(char => 
    char.name.toLowerCase().includes(lowerQuery) ||
    char.archetype.toLowerCase().includes(lowerQuery) ||
    char.description.toLowerCase().includes(lowerQuery)
  );
}

export function getCharacterStats() {
  const total = characters.length;
  const legendary = characters.filter(c => c.rarity === 'Legendary').length;
  const rare = characters.filter(c => c.rarity === 'Rare').length;
  const common = characters.filter(c => c.rarity === 'Common').length;
  const active = characters.filter(c => c.status === 'Active').length;
  
  return { total, legendary, rare, common, active };
}
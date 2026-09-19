/**
 * Eternity Calls Character Database
 * Extracted from Private & Shared/Character Database markdown files
 * 
 * This contains the 44 character profiles with their archetypes, budgets, and image prompts
 * for potential integration with ChiefPilot's Character Bible system.
 */

// Type definition for Eternity Calls characters
export interface EternityCharacter {
  id: string;
  file: string;
  name: string;
  allocatedBudget: string;
  allocatedBudgetValue: number;
  archetype: string;
  classicHookPrompt: string;
  description: string;
  entityName: string;
  gender: string;
  heroBrandingPrompt: string;
  keyToolCategory: string;
  rarity: string;
  status: string;
  trustWarmthPrompt: string;
  generatedAssets: string[];
}

// Import the raw JSON data
import rawData from './characterDatabase.json';

// Type assertion for the imported JSON
export const CHARACTER_DATABASE: EternityCharacter[] = rawData as EternityCharacter[];

// Helper functions for filtering and sorting
export const getCharactersByRarity = (rarity: string): EternityCharacter[] => {
  return CHARACTER_DATABASE.filter(c => c.rarity === rarity);
};

export const getCharactersByArchetype = (archetype: string): EternityCharacter[] => {
  return CHARACTER_DATABASE.filter(c => c.archetype.toLowerCase().includes(archetype.toLowerCase()));
};

export const getCharactersByBudgetRange = (min: number, max: number): EternityCharacter[] => {
  return CHARACTER_DATABASE.filter(c => (c.allocatedBudgetValue || 0) >= min && (c.allocatedBudgetValue || 0) <= max);
};

export const getCharacterById = (id: string): EternityCharacter | undefined => {
  return CHARACTER_DATABASE.find(c => c.id === id || c.name === id);
};

// Statistics
export const CHARACTER_STATS = {
  total: CHARACTER_DATABASE.length,
  totalBudget: CHARACTER_DATABASE.reduce((sum, c) => sum + (c.allocatedBudgetValue || 0), 0),
  averageBudget: CHARACTER_DATABASE.reduce((sum, c) => sum + (c.allocatedBudgetValue || 0), 0) / CHARACTER_DATABASE.length,
  rarest: getCharactersByRarity('Legendary').length,
  byRarity: {
    Legendary: getCharactersByRarity('Legendary').length,
    Rare: getCharactersByRarity('Rare').length,
    Common: getCharactersByRarity('Common').length,
    Uncommon: getCharactersByRarity('Uncommon').length,
    Epic: getCharactersByRarity('Epic').length,
    Mythic: getCharactersByRarity('Mythic').length,
  },
  byGender: {
    Male: CHARACTER_DATABASE.filter(c => c.gender === 'Male').length,
    Female: CHARACTER_DATABASE.filter(c => c.gender === 'Female').length,
    Other: CHARACTER_DATABASE.filter(c => c.gender === 'Other').length,
  },
};

// Export for backwards compatibility
export default CHARACTER_DATABASE;

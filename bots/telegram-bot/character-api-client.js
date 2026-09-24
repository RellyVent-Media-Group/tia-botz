/**
 * Character API Client
 * Connects bot systems to the depot automation unified character API
 */

import axios from 'axios';

class CharacterAPIClient {
  constructor(baseUrl = 'http://localhost:8001') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if the character API is healthy
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/api/character-health');
      return response.data;
    } catch (error) {
      throw new Error(`Character API health check failed: ${error.message}`);
    }
  }

  /**
   * Get all characters with optional filters
   */
  async getCharacters(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.rarity) params.append('rarity', filters.rarity);
      if (filters.archetype) params.append('archetype', filters.archetype);
      if (filters.category) params.append('category', filters.category);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await this.client.get(`/api/characters?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch characters: ${error.message}`);
    }
  }

  /**
   * Get a specific character by ID
   */
  async getCharacter(characterId) {
    try {
      const response = await this.client.get(`/api/characters/${characterId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch character ${characterId}: ${error.message}`);
    }
  }

  /**
   * Search characters by name, archetype, or description
   */
  async searchCharacters(query) {
    try {
      const response = await this.client.get(`/api/characters/search/${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search characters: ${error.message}`);
    }
  }

  /**
   * Get a random character
   */
  async getRandomCharacter() {
    try {
      const response = await this.client.get('/api/characters/random');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get random character: ${error.message}`);
    }
  }

  /**
   * Get characters by category
   */
  async getCharactersByCategory(category) {
    try {
      const response = await this.client.get(`/api/characters/categories?category=${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get characters by category: ${error.message}`);
    }
  }

  /**
   * Get content creator characters
   */
  async getContentCreators() {
    try {
      const response = await this.client.get('/api/content/creators');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get content creators: ${error.message}`);
    }
  }

  /**
   * Generate a content idea for a specific character
   */
  async generateContentIdea(characterId, contentType = 'social') {
    try {
      const response = await this.client.get(`/api/content/generate/${characterId}?type=${contentType}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate content idea: ${error.message}`);
    }
  }

  /**
   * Generate batch content ideas
   */
  async generateBatchContentIdeas(count = 5) {
    try {
      const response = await this.client.post('/api/content/batch', { count });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate batch content ideas: ${error.message}`);
    }
  }

  /**
   * Get budget summary
   */
  async getBudgetSummary() {
    try {
      const response = await this.client.get('/api/budget/summary');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get budget summary: ${error.message}`);
    }
  }

  /**
   * Get budget breakdown by archetype
   */
  async getBudgetByArchetype() {
    try {
      const response = await this.client.get('/api/budget/by-archetype');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get budget by archetype: ${error.message}`);
    }
  }

  /**
   * Get character budget allocation
   */
  async getCharacterBudget(characterId) {
    try {
      const response = await this.client.get(`/api/budget/character/${characterId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get character budget: ${error.message}`);
    }
  }

  /**
   * Get character performance analytics
   */
  async getCharacterPerformance() {
    try {
      const response = await this.client.get('/api/analytics/character-performance');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get character performance: ${error.message}`);
    }
  }

  /**
   * Get archetype breakdown
   */
  async getArchetypeBreakdown() {
    try {
      const response = await this.client.get('/api/analytics/archetype-breakdown');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get archetype breakdown: ${error.message}`);
    }
  }

  /**
   * Format character data for bot responses
   */
  formatCharacterForBot(character) {
    if (!character) return null;

    return {
      name: character.name,
      archetype: character.archetype,
      rarity: character.rarity,
      description: character.description,
      budget: character.allocated_budget ? `$${character.allocated_budget.toLocaleString()}` : 'Not allocated',
      categories: character.key_tool_categories || [],
      prompts: character.prompts || null
    };
  }

  /**
   * Format character list for bot responses
   */
  formatCharacterListForBot(characters) {
    if (!characters || !Array.isArray(characters)) return [];

    return characters.map(char => this.formatCharacterForBot(char));
  }
}

export default CharacterAPIClient;

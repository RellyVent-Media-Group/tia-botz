/**
 * Universal Integration Hub for Character Database
 * 
 * This file provides integration endpoints and utilities for:
 * - Apple Shortcuts/Automator (via webhooks and REST API)
 * - iHosts (hosts file management)
 * - Unified Remote (remote control commands)
 * - Requestly (HTTP request interception/modification)
 * - Network Toolbox (network diagnostics and management)
 * - Notion (database integration via API)
 * 
 * Usage: Node this file as a server or import functions as needed
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  port: process.env.INTEGRATION_PORT || 3001,
  characterDataPath: join(__dirname, 'characters-cleaned.json'),
  notionApiKey: process.env.NOTION_API_KEY,
  notionDatabaseId: process.env.NOTION_DATABASE_ID,
  enableLogging: true
};

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load character data
let characterData = null;

function loadCharacterData() {
  try {
    const rawData = fs.readFileSync(CONFIG.characterDataPath, 'utf8');
    characterData = JSON.parse(rawData);
    log('Character data loaded successfully');
  } catch (error) {
    log('Error loading character data:', error);
    characterData = { characters: [], metadata: {} };
  }
}

// Logging utility
function log(...args) {
  if (CONFIG.enableLogging) {
    console.log(`[Integration Hub] ${new Date().toISOString()}`, ...args);
  }
}

// ============================================
// CHARACTER DATA API ENDPOINTS
// ============================================

// Get all characters
app.get('/api/characters', (req, res) => {
  if (!characterData) loadCharacterData();
  
  const { rarity, archetype, entityType, limit, offset } = req.query;
  let filtered = [...characterData.characters];
  
  if (rarity) {
    filtered = filtered.filter(c => c.rarity === rarity);
  }
  
  if (archetype) {
    filtered = filtered.filter(c => 
      c.archetype.toLowerCase().includes(archetype.toLowerCase())
    );
  }
  
  if (entityType) {
    filtered = filtered.filter(c => c.entityType === entityType);
  }
  
  if (limit) {
    const start = parseInt(offset) || 0;
    filtered = filtered.slice(start, start + parseInt(limit));
  }
  
  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
    metadata: characterData.metadata
  });
});

// Get random character (must come before :id route to avoid route conflict)
app.get('/api/characters/random', (req, res) => {
  if (!characterData) loadCharacterData();
  
  const randomIndex = Math.floor(Math.random() * characterData.characters.length);
  const character = characterData.characters[randomIndex];
  
  res.json({
    success: true,
    data: character
  });
});

// Get specific character by ID
app.get('/api/characters/:id', (req, res) => {
  if (!characterData) loadCharacterData();
  
  const character = characterData.characters.find(c => c.id === parseInt(req.params.id));
  
  if (!character) {
    return res.status(404).json({
      success: false,
      error: 'Character not found'
    });
  }
  
  res.json({
    success: true,
    data: character
  });
});

// Search characters by name
app.get('/api/characters/search/:name', (req, res) => {
  if (!characterData) loadCharacterData();
  
  const searchTerm = req.params.name.toLowerCase();
  const results = characterData.characters.filter(c =>
    c.name.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    success: true,
    data: results,
    total: results.length
  });
});

// Get character prompts only
app.get('/api/characters/:id/prompts', (req, res) => {
  if (!characterData) loadCharacterData();
  
  const character = characterData.characters.find(c => c.id === parseInt(req.params.id));
  
  if (!character) {
    return res.status(404).json({
      success: false,
      error: 'Character not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      name: character.name,
      prompts: character.prompts
    }
  });
});

// ============================================
// SHORTCUTS/AUTOMATOR WEBHOOK ENDPOINTS
// ============================================

// Webhook for Apple Shortcuts - Character search
app.post('/webhook/shortcuts/search', (req, res) => {
  const { searchTerm, promptType } = req.body;
  
  if (!characterData) loadCharacterData();
  
  let results = characterData.characters;
  
  if (searchTerm) {
    results = results.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.archetype.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Format for Shortcuts (simple text response)
  const shortcutResponse = results.map(c => ({
    name: c.name,
    archetype: c.archetype,
    rarity: c.rarity,
    prompt: promptType && c.prompts[promptType] ? c.prompts[promptType] : c.prompts.hook
  }));
  
  res.json({
    success: true,
    results: shortcutResponse,
    count: shortcutResponse.length
  });
});

// Webhook for batch character requests
app.post('/webhook/shortcuts/batch', (req, res) => {
  const { count, promptType } = req.body;
  const batchCount = Math.min(parseInt(count) || 5, 10);
  
  if (!characterData) loadCharacterData();
  
  // Shuffle and pick random characters
  const shuffled = [...characterData.characters].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, batchCount);
  
  const batchResponse = selected.map(c => ({
    name: c.name,
    archetype: c.archetype,
    rarity: c.rarity,
    prompt: promptType && c.prompts[promptType] ? c.prompts[promptType] : c.prompts.hook
  }));
  
  res.json({
    success: true,
    batch: batchResponse,
    count: batchResponse.length
  });
});

// ============================================
// NOTION INTEGRATION
// ============================================

// Sync character data to Notion database
app.post('/api/notion/sync', async (req, res) => {
  if (!CONFIG.notionApiKey || !CONFIG.notionDatabaseId) {
    return res.status(400).json({
      success: false,
      error: 'Notion API credentials not configured'
    });
  }
  
  try {
    if (!characterData) loadCharacterData();
    
    // This is a template for Notion integration
    // In production, you would use the Notion SDK or API
    const notionPayload = {
      success: true,
      message: 'Notion sync template ready',
      databaseId: CONFIG.notionDatabaseId,
      charactersToSync: characterData.characters.length,
      // Example Notion page structure
      notionPages: characterData.characters.map(char => ({
        parent: { database_id: CONFIG.notionDatabaseId },
        properties: {
          Name: {
            title: [{ text: { content: char.name } }]
          },
          Archetype: {
            select: { name: char.archetype }
          },
          Rarity: {
            select: { name: char.rarity }
          },
          Budget: {
            number: char.allocatedBudget
          },
          Status: {
            select: { name: char.status }
          }
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: char.description } }]
            }
          },
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ type: 'text', text: { content: 'AI Prompts' } }]
            }
          },
          {
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{ type: 'text', text: { content: char.prompts.hook } }],
              language: 'text'
            }
          }
        ]
      }))
    };
    
    res.json(notionPayload);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Notion database schema template
app.get('/api/notion/schema', (req, res) => {
  const schema = {
    databaseName: 'Character Database',
    properties: [
      {
        name: 'Name',
        type: 'title',
        description: 'Character name'
      },
      {
        name: 'Archetype',
        type: 'select',
        options: [
          'Digital Storyteller',
          'Operations & Logistics',
          'Strategy & Planning',
          'High Strategy & Execution',
          'System Architect',
          'Performance Artist',
          'Wisdom Keeper',
          'Cyber Guardian',
          'Crypto Sorceress',
          'Temporal Architect',
          'Hyper-Capitalist'
        ]
      },
      {
        name: 'Rarity',
        type: 'select',
        options: ['Legendary', 'Rare', 'Common']
      },
      {
        name: 'Entity Type',
        type: 'select',
        options: ['Primary Character', 'Primary Entity', 'Legendary Entity', 'Common Entity', 'Rare Soul']
      },
      {
        name: 'Budget',
        type: 'number',
        format: 'number'
      },
      {
        name: 'Status',
        type: 'select',
        options: ['Active', 'Inactive', 'Pending']
      },
      {
        name: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Other']
      },
      {
        name: 'Key Tool Categories',
        type: 'multi_select',
        options: [
          'Content Creation',
          'Technology',
          'Visual Arts',
          'Operations',
          'Strategy',
          'Performance',
          'Wisdom',
          'Finance',
          'Security',
          'Community Building'
        ]
      },
      {
        name: 'Description',
        type: 'text'
      },
      {
        name: 'Hook Prompt',
        type: 'text'
      },
      {
        name: 'Branding Prompt',
        type: 'text'
      },
      {
        name: 'Trust Prompt',
        type: 'text'
      }
    ]
  };
  
  res.json(schema);
});

// ============================================
// IHOSTS INTEGRATION
// ============================================

// Generate hosts file entries for local development
app.get('/api/ihosts/entries', (req, res) => {
  const entries = [
    {
      comment: '# Character Database Integration Hub',
      ip: '127.0.0.1',
      hostname: 'characters.local',
      enabled: true
    },
    {
      comment: '# Character API endpoint',
      ip: '127.0.0.1',
      hostname: 'api.characters.local',
      enabled: true
    },
    {
      comment: '# Character webhooks',
      ip: '127.0.0.1',
      hostname: 'webhook.characters.local',
      enabled: true
    }
  ];
  
  res.json({
    success: true,
    entries: entries,
    hostsFileFormat: entries.map(e => 
      `${e.enabled ? '' : '# '}${e.ip}    ${e.hostname}    ${e.comment}`
    ).join('\n')
  });
});

// ============================================
// UNIFIED REMOTE COMMANDS
// ============================================

// Get remote control command mappings
app.get('/api/unified-remote/commands', (req, res) => {
  const commands = [
    {
      action: 'get_random_character',
      description: 'Get a random character prompt',
      endpoint: '/api/characters/random',
      method: 'GET',
      voiceCommand: 'random character'
    },
    {
      action: 'search_characters',
      description: 'Search for characters by name',
      endpoint: '/api/characters/search/:name',
      method: 'GET',
      voiceCommand: 'search character {name}'
    },
    {
      action: 'get Legendary_characters',
      description: 'Get all legendary characters',
      endpoint: '/api/characters?rarity=Legendary',
      method: 'GET',
      voiceCommand: 'legendary characters'
    },
    {
      action: 'batch_characters',
      description: 'Get multiple random characters',
      endpoint: '/webhook/shortcuts/batch',
      method: 'POST',
      voiceCommand: 'batch characters {count}'
    }
  ];
  
  res.json({
    success: true,
    commands: commands,
    serverUrl: `http://localhost:${CONFIG.port}`
  });
});

// ============================================
// REQUESTLY RULES
// ============================================

// Generate Requestly rules for API interception
app.get('/api/requestly/rules', (req, res) => {
  const rules = [
    {
      id: 'character-api-redirect',
      name: 'Character API Redirect',
      description: 'Redirect character API calls to local server',
      type: 'Redirect',
      condition: {
        operator: 'Contains',
        source: {
          key: 'Url',
          value: '/api/characters'
        }
      },
      action: {
        type: 'Redirect',
        to: `http://localhost:${CONFIG.port}/api/characters`
      }
    },
    {
      id: 'character-prompt-modify',
      name: 'Character Prompt Modifier',
      description: 'Modify character prompts in transit',
      type: 'Modify',
      condition: {
        operator: 'Contains',
        source: {
          key: 'Url',
          value: '/api/characters'
        }
      },
      action: {
        type: 'Replace',
        search: '"prompt"',
        replace: '"enhancedPrompt"'
      }
    },
    {
      id: 'character-headers',
      name: 'Character API Headers',
      description: 'Add custom headers to character API calls',
      type: 'Headers',
      condition: {
        operator: 'Contains',
        source: {
          key: 'Url',
          value: '/api/characters'
        }
      },
      action: {
        type: 'Add',
        headers: {
          'X-Character-Source': 'Integration-Hub',
          'X-Request-ID': '{{requestId}}'
        }
      }
    }
  ];
  
  res.json({
    success: true,
    rules: rules,
    importFormat: JSON.stringify(rules, null, 2)
  });
});

// ============================================
// NETWORK TOOLBOX INTEGRATION
// ============================================

// Network diagnostics for the integration hub
app.get('/api/network/diagnostics', (req, res) => {
  const diagnostics = {
    server: {
      status: 'running',
      port: CONFIG.port,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    endpoints: [
      {
        path: '/api/characters',
        method: 'GET',
        description: 'Get all characters',
        testUrl: `http://localhost:${CONFIG.port}/api/characters`
      },
      {
        path: '/api/characters/:id',
        method: 'GET',
        description: 'Get specific character',
        testUrl: `http://localhost:${CONFIG.port}/api/characters/1`
      },
      {
        path: '/webhook/shortcuts/search',
        method: 'POST',
        description: 'Shortcuts webhook for search',
        testUrl: `http://localhost:${CONFIG.port}/webhook/shortcuts/search`
      }
    ],
    networkTests: {
      dns: 'localhost',
      port: CONFIG.port,
      timeout: 5000
    }
  };
  
  res.json(diagnostics);
});

// ============================================
// UTILITY ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    charactersLoaded: characterData ? characterData.characters.length : 0
  });
});

// Root route - landing page
app.get('/', (req, res) => {
  res.json({
    name: 'Character Database Integration Hub',
    version: '1.0.0',
    status: 'running',
    description: 'Universal integration hub for character database supporting multiple automation platforms',
    endpoints: {
      health: '/health',
      documentation: '/api/docs',
      characters: '/api/characters',
      randomCharacter: '/api/characters/random',
      webhooks: {
        shortcuts: '/webhook/shortcuts/search'
      },
      integrations: {
        notion: '/api/notion/schema',
        ihosts: '/api/ihosts/entries',
        unifiedRemote: '/api/unified-remote/commands',
        requestly: '/api/requestly/rules',
        network: '/api/network/diagnostics'
      }
    },
    quickStart: {
      healthCheck: 'GET /health',
      getRandomCharacter: 'GET /api/characters/random',
      searchCharacter: 'GET /api/characters/search/{name}',
      fullDocs: 'GET /api/docs'
    },
    charactersLoaded: characterData ? characterData.characters.length : 0,
    uptime: process.uptime()
  });
});

// Get integration documentation
app.get('/api/docs', (req, res) => {
  const docs = {
    title: 'Character Database Integration Hub',
    version: '1.0.0',
    description: 'Universal integration hub for character database supporting multiple platforms',
    endpoints: {
      characterAPI: {
        baseUrl: `/api/characters`,
        methods: ['GET', 'POST'],
        availableFilters: ['rarity', 'archetype', 'entityType', 'limit', 'offset']
      },
      webhooks: {
        shortcuts: '/webhook/shortcuts/search',
        batch: '/webhook/shortcuts/batch'
      },
      integrations: {
        notion: '/api/notion/sync',
        ihosts: '/api/ihosts/entries',
        unifiedRemote: '/api/unified-remote/commands',
        requestly: '/api/requestly/rules',
        networkToolbox: '/api/network/diagnostics'
      }
    },
    quickStart: {
      step1: 'Ensure characters-cleaned.json is in the same directory',
      step2: 'Set environment variables for Notion integration (optional)',
      step3: 'Start the server: node universal-integration-hub.mjs',
      step4: 'Access endpoints at http://localhost:3000'
    }
  };
  
  res.json(docs);
});

// ============================================
// SERVER STARTUP
// ============================================

function startServer() {
  loadCharacterData();
  
  const server = createServer(app);
  
  server.listen(CONFIG.port, () => {
    log(`Integration Hub server running on port ${CONFIG.port}`);
    log(`Character data loaded: ${characterData.characters.length} characters`);
    log(`API Documentation: http://localhost:${CONFIG.port}/api/docs`);
    log(`Health Check: http://localhost:${CONFIG.port}/health`);
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down Integration Hub...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
}

// ============================================
// COMMAND LINE INTERFACE
// ============================================

// Always start server when run directly
startServer();

// Export for use as module
export {
  app,
  loadCharacterData,
  CONFIG,
  startServer
};
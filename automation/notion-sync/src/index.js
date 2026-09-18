#!/usr/bin/env node
/**
 * ChiefPilot Notion Integration
 * Syncs character database, content calendar, and tasks with Notion
 */

import dotenv from 'dotenv';
import cron from 'node-cron';
import { Client } from '@notionhq/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Tiapma\'atzu-OS-Toolkit/core/character-database/Character Database';
const visualAssetsPath = process.env.VISUAL_ASSETS_PATH || '/Users/jypsee72/Desktop/Tiapma\'atzu-OS-Toolkit/content/visual-assets';

// Database IDs
const characterDatabaseId = process.env.NOTION_CHARACTER_DATABASE_ID;
const contentCalendarId = process.env.NOTION_CONTENT_CALENDAR_ID;
const taskDatabaseId = process.env.NOTION_TASK_DATABASE_ID;

// Sync state
const syncState = {
  lastSync: null,
  charactersSynced: 0,
  calendarEventsSynced: 0,
  tasksSynced: 0,
  errors: [],
};

// Character database sync
async function syncCharacterDatabase() {
  console.log('👤 Syncing character database to Notion...');

  if (!characterDatabaseId) {
    console.warn('⚠️  Character database ID not configured, skipping sync');
    return;
  }

  try {
    const characters = loadCharacterList();
    console.log(`📚 Found ${characters.length} characters in local database`);

    let syncedCount = 0;

    for (const characterName of characters) {
      try {
        const character = loadCharacter(characterName);
        if (!character) {
          console.warn(`⚠️  Could not load character: ${characterName}`);
          continue;
        }

        // Check if character already exists in Notion
        const existingPages = await notion.databases.query({
          database_id: characterDatabaseId,
          filter: {
            property: 'Name',
            title: {
              equals: characterName,
            },
          },
        });

        if (existingPages.results.length > 0) {
          // Update existing page
          const pageId = existingPages.results[0].id;
          await notion.pages.update({
            page_id: pageId,
            properties: buildCharacterProperties(character),
          });
          console.log(`✏️  Updated: ${characterName}`);
        } else {
          // Create new page
          await notion.pages.create({
            parent: { database_id: characterDatabaseId },
            properties: buildCharacterProperties(character),
          });
          console.log(`➕ Created: ${characterName}`);
        }

        syncedCount++;
      } catch (error) {
        console.error(`❌ Error syncing ${characterName}:`, error.message);
        syncState.errors.push({ character: characterName, error: error.message });
      }
    }

    syncState.charactersSynced = syncedCount;
    console.log(`✅ Character database sync complete: ${syncedCount} characters synced`);
  } catch (error) {
    console.error('❌ Character database sync failed:', error);
    syncState.errors.push({ error: 'Character database sync failed', message: error.message });
  }
}

function buildCharacterProperties(character) {
  const properties = {
    Name: {
      title: [
        {
          text: {
            content: character.name,
          },
        },
      ],
    },
  };

  // Add optional properties if they exist
  if (character.title) {
    properties.Title = {
      rich_text: [
        {
          text: {
            content: character.title,
          },
        },
      ],
    };
  }

  if (character.archetype) {
    properties.Archetype = {
      select: {
        name: character.archetype,
      },
    };
  }

  if (character.rarity) {
    properties.Rarity = {
      select: {
        name: character.rarity,
      },
    };
  }

  if (character.element) {
    properties.Element = {
      select: {
        name: character.element,
      },
    };
  }

  if (character.bio) {
    properties.Bio = {
      rich_text: [
        {
          text: {
            content: character.bio,
          },
        },
      ],
    };
  }

  if (character.personaTraits && character.personaTraits.length > 0) {
    properties['Persona Traits'] = {
      multi_select: character.personaTraits.map(trait => ({ name: trait })),
    };
  }

  if (character.shadowTraits && character.shadowTraits.length > 0) {
    properties['Shadow Traits'] = {
      multi_select: character.shadowTraits.map(trait => ({ name: trait })),
    };
  }

  // Check for generated assets
  const imagesDir = join(characterDbPath, 'images');
  if (existsSync(imagesDir)) {
    const files = readdirSync(imagesDir);
    const characterImages = files.filter(f => f.toLowerCase().includes(character.name.toLowerCase()));

    if (characterImages.length > 0) {
      properties['Generated Assets'] = {
        rich_text: [
          {
            text: {
              content: characterImages.join(', '),
            },
          },
        ],
      };
      properties['Asset Count'] = {
        number: characterImages.length,
      };
    }
  }

  return properties;
}

// Content calendar sync
async function syncContentCalendar() {
  console.log('📅 Syncing content calendar to Notion...');

  if (!contentCalendarId) {
    console.warn('⚠️  Content calendar ID not configured, skipping sync');
    return;
  }

  try {
    // Get existing calendar events
    const existingEvents = await notion.databases.query({
      database_id: contentCalendarId,
    });

    console.log(`📅 Found ${existingEvents.results.length} existing calendar events`);

    // Generate content calendar for next 30 days
    const characters = loadCharacterList();
    const newEvents = generateContentCalendarEvents(characters);

    let syncedCount = 0;

    for (const event of newEvents) {
      try {
        // Check if event already exists
        const exists = existingEvents.results.some(page => {
          const title = page.properties.Name?.title?.[0]?.text?.content;
          const date = page.properties.Date?.date?.start;
          return title === event.title && date === event.date;
        });

        if (!exists) {
          await notion.pages.create({
            parent: { database_id: contentCalendarId },
            properties: buildCalendarEventProperties(event),
          });
          console.log(`➕ Created calendar event: ${event.title}`);
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Error creating calendar event ${event.title}:`, error.message);
        syncState.errors.push({ event: event.title, error: error.message });
      }
    }

    syncState.calendarEventsSynced = syncedCount;
    console.log(`✅ Content calendar sync complete: ${syncedCount} new events created`);
  } catch (error) {
    console.error('❌ Content calendar sync failed:', error);
    syncState.errors.push({ error: 'Content calendar sync failed', message: error.message });
  }
}

function generateContentCalendarEvents(characters) {
  const events = [];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const platforms = ['Instagram', 'TikTok'];
  const contentTypes = ['Character Reveal', 'Poster Showcase', 'Avatar Spotlight', 'Story Preview'];

  let currentDate = new Date(startDate);
  let eventIndex = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (const platform of platforms) {
        const character = characters[eventIndex % characters.length];
        const contentType = contentTypes[eventIndex % contentTypes.length];

        events.push({
          title: `${platform}: ${contentType} - ${character}`,
          date: currentDate.toISOString().split('T')[0],
          platform,
          character,
          contentType,
          status: 'Not Started',
        });

        eventIndex++;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}

function buildCalendarEventProperties(event) {
  return {
    Name: {
      title: [
        {
          text: {
            content: event.title,
          },
        },
      ],
    },
    Date: {
      date: {
        start: event.date,
      },
    },
    Platform: {
      select: {
        name: event.platform,
      },
    },
    Character: {
      select: {
        name: event.character,
      },
    },
    'Content Type': {
      select: {
        name: event.contentType,
      },
    },
    Status: {
      status: {
        name: event.status,
      },
    },
  };
}

// Task database sync
async function syncTaskDatabase() {
  console.log('📋 Syncing task database to Notion...');

  if (!taskDatabaseId) {
    console.warn('⚠️  Task database ID not configured, skipping sync');
    return;
  }

  try {
    // Define standard tasks
    const tasks = [
      {
        name: 'Generate character images',
        description: 'Generate portrait, poster, and avatar images for characters',
        status: 'In Progress',
        priority: 'High',
        assignee: 'ChiefPilot',
      },
      {
        name: 'Update character database',
        description: 'Sync character metadata with Notion database',
        status: 'In Progress',
        priority: 'Medium',
        assignee: 'ChiefPilot',
      },
      {
        name: 'Schedule social media posts',
        description: 'Create and schedule Instagram and TikTok posts',
        status: 'Not Started',
        priority: 'Medium',
        assignee: 'ChiefPilot',
      },
      {
        name: 'Review generated assets',
        description: 'Quality check for generated character images',
        status: 'Not Started',
        priority: 'High',
        assignee: 'ChiefPilot',
      },
    ];

    let syncedCount = 0;

    for (const task of tasks) {
      try {
        // Check if task already exists
        const existingTasks = await notion.databases.query({
          database_id: taskDatabaseId,
          filter: {
            property: 'Name',
            title: {
              equals: task.name,
            },
          },
        });

        if (existingTasks.results.length === 0) {
          await notion.pages.create({
            parent: { database_id: taskDatabaseId },
            properties: buildTaskProperties(task),
          });
          console.log(`➕ Created task: ${task.name}`);
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Error creating task ${task.name}:`, error.message);
        syncState.errors.push({ task: task.name, error: error.message });
      }
    }

    syncState.tasksSynced = syncedCount;
    console.log(`✅ Task database sync complete: ${syncedCount} tasks created`);
  } catch (error) {
    console.error('❌ Task database sync failed:', error);
    syncState.errors.push({ error: 'Task database sync failed', message: error.message });
  }
}

function buildTaskProperties(task) {
  return {
    Name: {
      title: [
        {
          text: {
            content: task.name,
          },
        },
      ],
    },
    Description: {
      rich_text: [
        {
          text: {
            content: task.description,
          },
        },
      ],
    },
    Status: {
      status: {
        name: task.status,
      },
    },
    Priority: {
      select: {
        name: task.priority,
      },
    },
    Assignee: {
      people: [
        {
          id: process.env.NOTION_USER_ID || 'ChiefPilot',
        },
      ],
    },
  };
}

// Helper functions
function loadCharacterList() {
  try {
    const files = readdirSync(characterDbPath);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', '').split(' ').slice(0, -1).join(' '));
  } catch (error) {
    console.error('Failed to load character list:', error);
    return [];
  }
}

function loadCharacter(name) {
  try {
    const files = readdirSync(characterDbPath);
    const match = files.find(f => f.toLowerCase().includes(name.toLowerCase()));

    if (!match) return null;

    const filePath = join(characterDbPath, match);
    const content = readFileSync(filePath, 'utf-8');

    const lines = content.split('\n');
    const character = { name };

    lines.forEach(line => {
      if (line.startsWith('# ')) character.title = line.replace('# ', '');
      if (line.includes('Archetype')) character.archetype = line.split(':')[1]?.trim();
      if (line.includes('Rarity')) character.rarity = line.split(':')[1]?.trim();
      if (line.includes('Element')) character.element = line.split(':')[1]?.trim();
      if (line.includes('Bio')) character.bio = line.split(':')[1]?.trim();
      if (line.includes('Persona')) {
        const traits = line.split(':')[1]?.trim();
        if (traits) character.personaTraits = traits.split(',').map(t => t.trim());
      }
      if (line.includes('Shadow')) {
        const traits = line.split(':')[1]?.trim();
        if (traits) character.shadowTraits = traits.split(',').map(t => t.trim());
      }
    });

    return character;
  } catch (error) {
    console.error(`Failed to load character ${name}:`, error);
    return null;
  }
}

// Full sync
async function fullSync() {
  console.log('🔄 Starting full Notion sync...');
  console.log('=====================================');

  syncState.lastSync = new Date();
  syncState.errors = [];

  await syncCharacterDatabase();
  await syncContentCalendar();
  await syncTaskDatabase();

  console.log('=====================================');
  console.log('📊 Sync Summary:');
  console.log(`  Characters synced: ${syncState.charactersSynced}`);
  console.log(`  Calendar events synced: ${syncState.calendarEventsSynced}`);
  console.log(`  Tasks synced: ${syncState.tasksSynced}`);
  console.log(`  Errors: ${syncState.errors.length}`);

  if (syncState.errors.length > 0) {
    console.log('\n❌ Errors:');
    syncState.errors.forEach(err => console.log(`  - ${JSON.stringify(err)}`));
  }

  console.log(`\n✅ Full sync complete at ${syncState.lastSync.toISOString()}`);
}

// Scheduler
function startScheduler() {
  const interval = process.env.SYNC_INTERVAL_MINUTES || 30;
  const autoSync = process.env.AUTO_SYNC_ENABLED === 'true';

  if (!autoSync) {
    console.log('⚠️  Auto-sync disabled');
    return;
  }

  console.log(`⏰ Starting Notion sync scheduler (every ${interval} minutes)...`);

  cron.schedule(`*/${interval} * * * *`, async () => {
    console.log('🔄 Running scheduled sync...');
    await fullSync();
  });

  console.log('✅ Scheduler started');
}

// CLI interface
if (process.argv.length > 2) {
  const command = process.argv[2];

  if (command === 'sync') {
    fullSync();
  } else if (command === 'characters') {
    syncCharacterDatabase();
  } else if (command === 'calendar') {
    syncContentCalendar();
  } else if (command === 'tasks') {
    syncTaskDatabase();
  } else if (command === 'schedule') {
    startScheduler();
  } else {
    console.error('Unknown command. Available: sync, characters, calendar, tasks, schedule');
    process.exit(1);
  }
} else {
  // Default: run full sync and start scheduler
  fullSync();
  startScheduler();

  console.log('\n🚀 Notion Integration started');
  console.log('📚 Character database: Synced');
  console.log('📅 Content calendar: Synced');
  console.log('📋 Task database: Synced');
  console.log('⏰ Scheduler: Running');
  console.log('\nCommands:');
  console.log('  node src/index.js sync - Run full sync');
  console.log('  node src/index.js characters - Sync characters only');
  console.log('  node src/index.js calendar - Sync calendar only');
  console.log('  node src/index.js tasks - Sync tasks only');
  console.log('  node src/index.js schedule - Start scheduler');
}

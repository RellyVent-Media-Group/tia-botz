#!/usr/bin/env node
/**
 * ChiefPilot Telegram Bot - Enhanced Version
 * Commands: /prompt, /random, /batch, /subscribe, /character, /status
 * New: /generate, /admin, /analytics, /link, /workspace, /sync
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import http from 'http';

// Import shared modules
import {
  initializeDatabase,
  getOrCreateUser,
  getOrCreateSession,
  updateSession,
  checkDailyLimit,
  logPrompt,
  logAnalytics,
  logEngagement,
  getUserStats,
  linkUserAccounts
} from '../database.js';

import {
  generateEnhancedPrompt,
  generateWithMidjourney,
  generateWithStableDiffusion,
  generateWithOpenAI,
  queueGeneration,
  getGenerationStatus,
  getUserQueue,
  cancelGeneration,
  getAvailableServices,
  getAvailablePromptTypes,
  getAvailableStyles
} from '../ai-generation.js';

import {
  isAdmin,
  handleAdminCommand
} from '../admin.js';

import {
  getContentCalendar,
  getWorkspaceAnalytics,
  syncEngagementToWorkspace,
  syncPromptGenerationToWorkspace,
  checkWorkspaceHealth,
  formatContentCalendarSummary,
  formatWorkspaceAnalytics,
  getWorkspaceProjects,
  formatProjectsList,
  scheduleContent
} from '../workspace.js';

import IntegrationManager from '../integration-manager.js';
import CharacterAPIClient from '../character-api-client.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/characters-cleaned.json';
const characterApiUrl = process.env.CHARACTER_API_URL || 'http://localhost:8001';

// Initialize character API client
const characterAPI = new CharacterAPIClient(characterApiUrl);

// Create bot with polling (for development)
const bot = new TelegramBot(token, { polling: true });

// Initialize database
initializeDatabase().catch(console.error);

// Initialize integration manager
const integrationManager = new IntegrationManager();

// Command handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Get or create user in database
  const user = await getOrCreateUser(userId);
  const session = await getOrCreateSession(user.id, 'telegram');
  
  // Log analytics
  await logAnalytics(user.id, 'start', { platform: 'telegram' }, 'telegram');
  
  // Sync user to Notion via integration manager
  const userData = {
    name: msg.from.first_name || 'Unknown',
    username: msg.from.username || 'Unknown'
  };
  integrationManager.syncUserActivity(userId.toString(), userData).catch(console.error);
  
  const welcomeMessage = `
🎭 *Welcome to ChiefPilot Telegram Bot*

Your gateway to the Gilded Mirrors Universe character database and AI prompt system.

*Available Commands:*
/prompt - Get a custom character prompt
/random - Get a random character prompt
/batch - Generate multiple prompts at once
/generate - Generate AI images (NEW!)
/character - View character details
/api - Query character database via API (NEW!)
/subscribe - Subscribe to premium features
/status - Check your subscription status
/analytics - View your usage analytics
/link - Link accounts across platforms
/workspace - View workspace integration
/sync - Sync data to workspace
/admin - Admin commands (admin only)
/health - System health check (admin only)
/network - Network diagnostics (admin only)
/help - Show this help message

*Quick Start:*
Try /random to get your first character prompt!

---
ChiefPilot v3 // Gilded Mirrors OS
  `.trim();

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Get user for analytics
  const user = await getOrCreateUser(userId);
  await logAnalytics(user.id, 'help', { platform: 'telegram' }, 'telegram');
  
  const helpMessage = `
📚 *ChiefPilot Bot Help*

*Basic Commands:*

/prompt [character] [type] [style]
  Generate a custom prompt for a specific character
  Example: /prompt Mary portrait cinematic

/random
  Get a random character prompt from the database

/batch [count] [character]
  Generate multiple prompts at once
  Example: /batch 5 Mary

/character [name]
  View detailed character information
  Example: /character Mac Nazarene

/api [query] [filter]
  Query character database via API
  Example: /api search Mary
  Example: /api random
  Example: /api creators
  Example: /api budget

*New AI Generation Commands:*

/generate [character] [type] [service] [style]
  Generate AI images using various services
  Example: /generate Mary portrait midjourney cinematic
  Services: midjourney, stable-diffusion, openai

/generate status [queue_id]
  Check generation status
  Example: /generate status abc123

/generate cancel [queue_id]
  Cancel a generation
  Example: /generate cancel abc123

/generate services
  List available AI services

*Analytics & Management:*

/analytics
  View your usage analytics and statistics

/status
  Check your current subscription status

/link [code]
  Link this account with other platforms
  Example: /link LINK123

/workspace
  View workspace integration and projects

/sync
  Sync your data to workspace

*Admin Commands:*

/admin [command]
  Admin management commands (admin only)
  Example: /admin user list

/health
  System health check (admin only)
  Checks all integrated services status

/network
  Network diagnostics (admin only)
  Tests connectivity to all services

*Subscription:*

/subscribe
  View subscription plans and pricing

*Character Examples:*
• Mary Magnumbytes
• Mac Nazarene
• Mrs. Cox-Turner
• Latti Pleddespo
• And 7 more Legendary characters...

*Prompt Types:*
• portrait, poster, avatar, story, concept, social, animation

*Styles:*
• cinematic, anime, realistic, fantasy, minimalist, vintage, cyberpunk, modern, cartoon, pixel, vector

---
Need help? Contact support
  `.trim();

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/prompt(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);

  if (args.length < 2) {
    bot.sendMessage(chatId, 'Usage: /prompt [character] [type] [style]\nExample: /prompt Mary portrait cinematic');
    return;
  }

  const characterName = args[0];
  const promptType = args[1];
  const style = args[2] || 'cinematic';

  // Get user and check limits
  const user = await getOrCreateUser(userId);
  const limitCheck = await checkDailyLimit(user.id, 'telegram', user.subscription_tier === 'premium' ? 999 : 5);
  
  if (!limitCheck.allowed) {
    bot.sendMessage(chatId, `⚠️ Daily limit reached. You have ${limitCheck.remaining} prompts remaining today.\n\nType /subscribe for premium unlimited access.`);
    return;
  }

  bot.sendMessage(chatId, `🎨 Generating ${promptType} prompt for ${characterName} (${style} style)...`);

  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      bot.sendMessage(chatId, `❌ Character "${characterName}" not found`);
      return;
    }

    const prompt = generateEnhancedPrompt(character, promptType, style);
    
    // Log to database
    await logPrompt(user.id, characterName, promptType, prompt, 'telegram');
    await updateSession(user.id, 'telegram', { 
      prompts_generated: (await getOrCreateSession(user.id, 'telegram')).prompts_generated + 1,
      daily_usage: (await getOrCreateSession(user.id, 'telegram')).daily_usage + 1
    });
    await logAnalytics(user.id, 'prompt_generated', { character: characterName, type: promptType, style }, 'telegram');
    
    bot.sendMessage(chatId, `✨ *Prompt Generated*\n\n\`\`\`\n${prompt}\n\`\`\``, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

bot.onText(/\/random/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🎲 Fetching random character prompt...');

  try {
    const characters = await loadCharacterList();
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
    const types = ['portrait', 'poster', 'avatar', 'story'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const prompt = await generatePrompt(randomCharacter, randomType);
    bot.sendMessage(chatId, `✨ *Random Prompt: ${randomCharacter} (${randomType})*\n\n\`\`\`\n${prompt}\n\`\`\``, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

bot.onText(/\/batch(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);

  let count = 3;
  let characterName = null;

  if (args.length >= 1) {
    count = parseInt(args[0]) || 3;
  }
  if (args.length >= 2) {
    characterName = args.slice(1).join(' ');
  }

  bot.sendMessage(chatId, `📦 Generating ${count} prompts${characterName ? ` for ${characterName}` : ''}...`);

  try {
    const prompts = [];
    const characters = characterName ? [characterName] : await loadCharacterList();
    const types = ['portrait', 'poster', 'avatar', 'story'];

    for (let i = 0; i < count; i++) {
      const char = characterName || characters[Math.floor(Math.random() * characters.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const prompt = await generatePrompt(char, type);
      prompts.push({ character: char, type, prompt });
    }

    let response = `✨ *Batch Generation Complete*\n\n`;
    prompts.forEach((p, i) => {
      response += `${i + 1}. *${p.character} (${p.type})*\n\`\`\`\n${p.prompt}\n\`\`\`\n\n`;
    });

    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

bot.onText(/\/character(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const characterName = match[1].trim();

  if (!characterName) {
    bot.sendMessage(chatId, 'Usage: /character [name]\nExample: /character Mac Nazarene');
    return;
  }

  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      bot.sendMessage(chatId, `❌ Character "${characterName}" not found`);
      return;
    }

    const message = `
👤 *${character.name}*

*Archetype:* ${character.archetype || 'N/A'}
*Rarity:* ${character.rarity || 'N/A'}
*Status:* ${character.status || 'N/A'}
*Entity Type:* ${character.entityType || 'N/A'}
*Gender:* ${character.gender || 'N/A'}

*Description:*
${character.description || 'No description available'}

*Key Tool Categories:*
${character.keyToolCategory?.join(', ') || 'N/A'}

*Allocated Budget:* ${character.allocatedBudget ? `$${character.allocatedBudget.toLocaleString()}` : 'N/A'}

---
ChiefPilot Character Database
    `.trim();

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// API Command - Query character database via API
bot.onText(/\/api(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);

  if (args.length === 0) {
    bot.sendMessage(chatId, `
🔌 *Character API Commands*

/api search [query]
  Search characters by name, archetype, or description
  Example: /api search Mary

/api random
  Get a random character from the database

/api creators
  Get all content creator characters

/api budget
  Get budget summary

/api budget archetype
  Get budget breakdown by archetype

/api filters [rarity] [archetype] [category]
  Filter characters with multiple criteria
  Example: /api filters Legendary content-creator

/api performance
  Get character performance analytics

/api health
  Check character API health status
    `.trim());
    return;
  }

  const subCommand = args[0].toLowerCase();

  try {
    // Check API health first
    const health = await characterAPI.healthCheck();
    if (!health.healthy) {
      bot.sendMessage(chatId, `❌ Character API is currently unavailable: ${health.error || 'Unknown error'}`);
      return;
    }

    switch (subCommand) {
      case 'search':
        if (args.length < 2) {
          bot.sendMessage(chatId, 'Usage: /api search [query]\nExample: /api search Mary');
          return;
        }
        const query = args.slice(1).join(' ');
        const searchResults = await characterAPI.searchCharacters(query);
        const formattedSearch = characterAPI.formatCharacterListForBot(searchResults);
        if (formattedSearch.length === 0) {
          bot.sendMessage(chatId, `❌ No characters found matching "${query}"`);
        } else {
          let response = `🔍 *Search Results for "${query}"*\n\n`;
          formattedSearch.slice(0, 5).forEach((char, i) => {
            response += `${i + 1}. *${char.name}*\n   ${char.archetype} | ${char.rarity}\n`;
          });
          if (formattedSearch.length > 5) {
            response += `\n...and ${formattedSearch.length - 5} more`;
          }
          bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        }
        break;

      case 'random':
        const randomChar = await characterAPI.getRandomCharacter();
        const formattedRandom = characterAPI.formatCharacterForBot(randomChar);
        bot.sendMessage(chatId, `
🎲 *Random Character*

*${formattedRandom.name}*
*Archetype:* ${formattedRandom.archetype}
*Rarity:* ${formattedRandom.rarity}
*Budget:* ${formattedRandom.budget}

*Description:*
${formattedRandom.description?.substring(0, 200)}...

Use /character "${formattedRandom.name}" for full details
        `.trim(), { parse_mode: 'Markdown' });
        break;

      case 'creators':
        const creators = await characterAPI.getContentCreators();
        const formattedCreators = characterAPI.formatCharacterListForBot(creators);
        let creatorResponse = `👥 *Content Creators*\n\n`;
        formattedCreators.forEach((char, i) => {
          creatorResponse += `${i + 1}. *${char.name}*\n   ${char.archetype} | ${char.budget}\n`;
        });
        bot.sendMessage(chatId, creatorResponse, { parse_mode: 'Markdown' });
        break;

      case 'budget':
        if (args[1] === 'archetype') {
          const budgetByArchetype = await characterAPI.getBudgetByArchetype();
          let budgetResponse = `💰 *Budget by Archetype*\n\n`;
          Object.entries(budgetByArchetype).forEach(([archetype, budget]) => {
            budgetResponse += `• ${archetype}: $${budget.toLocaleString()}\n`;
          });
          bot.sendMessage(chatId, budgetResponse, { parse_mode: 'Markdown' });
        } else {
          const budgetSummary = await characterAPI.getBudgetSummary();
          bot.sendMessage(chatId, `
💰 *Budget Summary*

*Total Allocated:* $${budgetSummary.total?.toLocaleString() || 'N/A'}
*Total Spent:* $${budgetSummary.spent?.toLocaleString() || 'N/A'}
*Remaining:* $${budgetSummary.remaining?.toLocaleString() || 'N/A'}
*Characters Funded:* ${budgetSummary.count || 'N/A'}
          `.trim(), { parse_mode: 'Markdown' });
        }
        break;

      case 'filters':
        const filters = {};
        let filterIndex = 1;
        while (filterIndex < args.length) {
          const filterType = args[filterIndex].toLowerCase();
          if (['rarity', 'archetype', 'category'].includes(filterType) && args[filterIndex + 1]) {
            filters[filterType] = args[filterIndex + 1];
            filterIndex += 2;
          } else {
            filterIndex++;
          }
        }
        const filteredChars = await characterAPI.getCharacters(filters);
        const formattedFiltered = characterAPI.formatCharacterListForBot(filteredChars);
        if (formattedFiltered.length === 0) {
          bot.sendMessage(chatId, '❌ No characters found with these filters');
        } else {
          let filterResponse = `🔎 *Filtered Characters*\n\n`;
          formattedFiltered.forEach((char, i) => {
            filterResponse += `${i + 1}. *${char.name}*\n   ${char.archetype} | ${char.rarity}\n`;
          });
          bot.sendMessage(chatId, filterResponse, { parse_mode: 'Markdown' });
        }
        break;

      case 'performance':
        const performance = await characterAPI.getCharacterPerformance();
        let perfResponse = `📊 *Character Performance Analytics*\n\n`;
        Object.entries(performance).forEach(([metric, value]) => {
          perfResponse += `• ${metric}: ${value}\n`;
        });
        bot.sendMessage(chatId, perfResponse, { parse_mode: 'Markdown' });
        break;

      case 'health':
        bot.sendMessage(chatId, `✅ Character API is healthy\n\n*Version:* ${health.version || 'Unknown'}\n*Timestamp:* ${new Date(health.timestamp).toLocaleString()}`, { parse_mode: 'Markdown' });
        break;

      default:
        bot.sendMessage(chatId, `❌ Unknown API command: ${subCommand}\nUse /api to see available commands`);
    }

    // Log analytics
    const user = await getOrCreateUser(userId);
    await logAnalytics(user.id, 'api_query', { command: subCommand, args: args.slice(1) }, 'telegram');

  } catch (error) {
    bot.sendMessage(chatId, `❌ API Error: ${error.message}\n\n💡 Tip: Use /api health to check if the character API is running`);
  }
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const user = await getOrCreateUser(userId);
  const monthlyPrice = process.env.SUBSCRIPTION_PRICE_MONTHLY || '9.99';
  const yearlyPrice = process.env.SUBSCRIPTION_PRICE_YEARLY || '99.99';

  const message = `
💎 *Subscription Plans*

*Free Tier*
• 5 prompts per day
• Random prompts only
• Basic character info

*Premium Monthly* - $${monthlyPrice}/month
• Unlimited prompts
• Custom prompt generation
• Batch generation (up to 50)
• Full character database access
• Priority support
• AI image generation

*Premium Yearly* - $${yearlyPrice}/year
• All monthly features
• 2 months free
• Early access to new features
• API access
• Workspace integration

*To subscribe:*
1. Visit gumroad.com/chiefpilot
2. Select your plan
3. Enter your Telegram ID: ${userId}
4. Your access will be activated automatically

*Current Status:* ${user.subscription_tier === 'premium' ? '✅ Premium' : '🆓 Free'}

---
Need help? Contact @chiefpilot_support
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const user = await getOrCreateUser(userId);
  const stats = await getUserStats(user.id);
  const session = stats.sessions.find(s => s.platform === 'telegram') || stats.sessions[0];
  
  const message = `
📊 *Your Status*

*Subscription:* ${user.subscription_tier === 'premium' ? '✅ Premium' : '🆓 Free'}
${user.subscription_expires ? `*Expires:* ${new Date(user.subscription_expires).toLocaleDateString()}` : ''}

*Session Stats:*
• Total Prompts Generated: ${stats.totalPrompts}
• Total Analytics Events: ${stats.totalAnalytics}
• Messages Sent: ${session?.message_count || 0}
• Last Activity: ${session?.last_activity ? new Date(session.last_activity).toLocaleString() : 'Never'}

*Daily Limit:* ${user.subscription_tier === 'premium' ? 'Unlimited' : '5/5'}
*Today's usage:* ${session?.daily_usage || 0}

---
ChiefPilot Telegram Bot
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// New AI Generation Commands
bot.onText(/\/generate(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);

  if (args.length === 0) {
    bot.sendMessage(chatId, `
🎨 *AI Generation Commands*

/generate [character] [type] [service] [style]
  Generate AI image
  Example: /generate Mary portrait midjourney cinematic

/generate status [queue_id]
  Check generation status

/generate cancel [queue_id]
  Cancel generation

/generate services
  List available services

/generate types
  List available prompt types

/generate styles [type]
  List available styles for a type
    `.trim());
    return;
  }

  const subCommand = args[0].toLowerCase();

  if (subCommand === 'services') {
    const services = getAvailableServices();
    let response = '🔧 *Available AI Services*\n\n';
    Object.entries(services).forEach(([name, info]) => {
      response += `• ${name}: ${info.available ? '✅ Available' : '❌ Not configured'}\n`;
      response += `  Max Concurrency: ${info.maxConcurrency}\n`;
    });
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    return;
  }

  if (subCommand === 'types') {
    const types = getAvailablePromptTypes();
    bot.sendMessage(chatId, `📋 *Available Prompt Types*\n\n${types.join(', ')}`, { parse_mode: 'Markdown' });
    return;
  }

  if (subCommand === 'styles') {
    const promptType = args[1];
    if (!promptType) {
      bot.sendMessage(chatId, 'Usage: /generate styles [prompt_type]\nExample: /generate styles portrait');
      return;
    }
    const styles = getAvailableStyles(promptType);
    bot.sendMessage(chatId, `🎨 *Available Styles for ${promptType}*\n\n${styles.join(', ')}`, { parse_mode: 'Markdown' });
    return;
  }

  if (subCommand === 'status') {
    const queueId = args[1];
    if (!queueId) {
      bot.sendMessage(chatId, 'Usage: /generate status [queue_id]');
      return;
    }
    const status = getGenerationStatus(queueId);
    if (!status) {
      bot.sendMessage(chatId, `❌ Generation ${queueId} not found`);
      return;
    }
    bot.sendMessage(chatId, `📊 *Generation Status*\n\n• Status: ${status.status}\n• Service: ${status.service}\n• Queued: ${status.queuedAt ? new Date(status.queuedAt).toLocaleString() : 'N/A'}`);
    return;
  }

  if (subCommand === 'cancel') {
    const queueId = args[1];
    if (!queueId) {
      bot.sendMessage(chatId, 'Usage: /generate cancel [queue_id]');
      return;
    }
    const cancelled = cancelGeneration(queueId);
    bot.sendMessage(chatId, cancelled ? '✅ Generation cancelled' : '❌ Failed to cancel generation');
    return;
  }

  // Handle image generation
  const characterName = args[0];
  const promptType = args[1] || 'portrait';
  const service = args[2] || 'stable-diffusion';
  const style = args[3] || 'cinematic';

  const user = await getOrCreateUser(userId);
  
  bot.sendMessage(chatId, `🎨 Queueing ${service} generation for ${characterName}...`);

  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      bot.sendMessage(chatId, `❌ Character "${characterName}" not found`);
      return;
    }

    const prompt = generateEnhancedPrompt(character, promptType, style);
    const { queueId, position, estimatedWait } = queueGeneration(user.id, service, prompt, { promptType, style });

    bot.sendMessage(chatId, `✅ *Generation Queued*\n\n• Queue ID: ${queueId}\n• Position: ${position}\n• Estimated wait: ${estimatedWait} seconds\n\nUse /generate status ${queueId} to check progress`);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Analytics Command
bot.onText(/\/analytics/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const user = await getOrCreateUser(userId);
  const stats = await getUserStats(user.id);
  
  const message = `
📊 *Your Analytics*

*Overview:*
• Total Prompts Generated: ${stats.totalPrompts}
• Total Analytics Events: ${stats.totalAnalytics}
• Account Created: ${new Date(stats.user.created_at).toLocaleDateString()}
• Subscription Tier: ${stats.user.subscription_tier}

*Session Details:*
${stats.sessions.map(s => 
  `• ${s.platform}: ${s.prompts_generated} prompts, ${s.message_count} messages, last active ${new Date(s.last_activity).toLocaleDateString()}`
).join('\n')}

*Recent Activity:*
Check your workspace dashboard for detailed analytics.
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Link Command
bot.onText(/\/link(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const code = match[1].trim();

  if (!code) {
    bot.sendMessage(chatId, `
🔗 *Account Linking*

To link your accounts across platforms:

1. Use /link on your other platform
2. Share the generated code here
3. Your accounts will be merged

Example: /link LINK123

This allows you to:
• Share subscription across platforms
• Sync usage data
• Unified analytics
    `.trim());
    return;
  }

  // Implementation would involve validating the code and linking accounts
  bot.sendMessage(chatId, `⚠️ Account linking functionality requires workspace integration. Contact support for manual linking.`);
});

// Workspace Command
bot.onText(/\/workspace(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);
  
  const subCommand = args[0]?.toLowerCase() || 'overview';

  try {
    const health = await checkWorkspaceHealth();
    if (!health.healthy) {
      bot.sendMessage(chatId, `❌ Workspace is currently unavailable: ${health.error}`);
      return;
    }

    switch (subCommand) {
      case 'calendar':
        const calendar = await getContentCalendar();
        bot.sendMessage(chatId, formatContentCalendarSummary(calendar), { parse_mode: 'Markdown' });
        break;
      case 'analytics':
        const analytics = await getWorkspaceAnalytics();
        bot.sendMessage(chatId, formatWorkspaceAnalytics(analytics), { parse_mode: 'Markdown' });
        break;
      case 'projects':
        const projects = await getWorkspaceProjects();
        bot.sendMessage(chatId, formatProjectsList(projects), { parse_mode: 'Markdown' });
        break;
      case 'overview':
      default:
        const dashboard = await getContentCalendar();
        bot.sendMessage(chatId, formatContentCalendarSummary(dashboard), { parse_mode: 'Markdown' });
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error accessing workspace: ${error.message}`);
  }
});

// Sync Command
bot.onText(/\/sync/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const user = await getOrCreateUser(userId);
  const stats = await getUserStats(user.id);
  
  bot.sendMessage(chatId, '🔄 Syncing your data to workspace...');

  try {
    const engagementData = {
      messageCount: stats.sessions.reduce((sum, s) => sum + s.message_count, 0),
      promptsGenerated: stats.totalPrompts,
      lastActivity: stats.sessions[0]?.last_activity,
      platform: 'telegram'
    };

    const result = await syncEngagementToWorkspace(user.id, engagementData);
    if (result) {
      bot.sendMessage(chatId, '✅ Data synced successfully to workspace!');
    } else {
      bot.sendMessage(chatId, '❌ Failed to sync data. Workspace may be unavailable.');
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Sync error: ${error.message}`);
  }
});

// Admin Command
bot.onText(/\/admin(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);

  const response = await handleAdminCommand(userId, args);
  bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
});

// Health Check Command (Integration Manager)
bot.onText(/\/health/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (!await isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ This command is for admins only');
    return;
  }
  
  bot.sendMessage(chatId, '🔍 Running comprehensive health check...');
  
  try {
    const health = await integrationManager.performHealthCheck();
    
    let message = `🏥 *System Health Check*\n\n`;
    message += `*Timestamp:* ${new Date(health.timestamp).toLocaleString()}\n\n`;
    message += `*Services Status:*\n`;
    
    Object.entries(health.services).forEach(([service, status]) => {
      const emoji = status === 'healthy' || status === 'online' || status === 'configured' ? '✅' : '❌';
      message += `${emoji} ${service}: ${status}\n`;
    });
    
    if (health.error) {
      message += `\n⚠️ *Error:* ${health.error}`;
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
    // Log admin activity
    await integrationManager.logAdminActivity({
      adminId: userId.toString(),
      action: 'Health Check',
      details: 'Comprehensive system health check performed',
      status: 'Success',
      ipAddress: msg.from.ip || 'Unknown'
    });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Health check failed: ${error.message}`);
  }
});

// Network Diagnostics Command
bot.onText(/\/network/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (!await isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ This command is for admins only');
    return;
  }
  
  bot.sendMessage(chatId, '🌐 Running network diagnostics...');
  
  try {
    const diagnostics = await integrationManager.runNetworkDiagnostics();
    
    let message = `🌐 *Network Diagnostics*\n\n`;
    message += `*Timestamp:* ${new Date(diagnostics.timestamp).toLocaleString()}\n\n`;
    message += `*Connection Tests:*\n`;
    
    Object.entries(diagnostics.tests).forEach(([service, result]) => {
      const emoji = result.status === 'success' ? '✅' : '❌';
      message += `${emoji} ${service}: ${result.status}\n`;
      if (result.statusCode) message += `   Status Code: ${result.statusCode}\n`;
      if (result.latency && result.latency !== 'unknown') message += `   Latency: ${result.latency}ms\n`;
      if (result.error) message += `   Error: ${result.error}\n`;
    });
    
    if (diagnostics.error) {
      message += `\n⚠️ *Error:* ${diagnostics.error}`;
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Network diagnostics failed: ${error.message}`);
  }
});

// Helper functions
async function loadCharacterList() {
  try {
    const content = readFileSync(characterDbPath, 'utf-8');
    const data = JSON.parse(content);
    return data.characters.map(c => c.name);
  } catch (error) {
    throw new Error('Failed to load character list');
  }
}

async function loadCharacter(name) {
  try {
    const content = readFileSync(characterDbPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Find character by name (case-insensitive partial match)
    const character = data.characters.find(c => 
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.name.toLowerCase())
    );

    if (!character) return null;

    return character;
  } catch (error) {
    throw new Error(`Failed to load character: ${error.message}`);
  }
}

async function generatePrompt(characterName, type) {
  // This function is now replaced by generateEnhancedPrompt from shared module
  // Kept for backward compatibility
  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      throw new Error('Character not found');
    }
    return generateEnhancedPrompt(character, type, 'cinematic');
  } catch (error) {
    throw error;
  }
}

// Track user sessions with database
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageContent = msg.text || msg.caption || '';
  
  try {
    const user = await getOrCreateUser(userId);
    const session = await getOrCreateSession(user.id, 'telegram');
    
    await updateSession(user.id, 'telegram', {
      message_count: session.message_count + 1
    });
    
    await logEngagement(user.id, 'telegram', messageContent, 'text');
  } catch (error) {
    console.error('Error tracking message:', error);
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error(`[Telegram Bot] Polling error: ${error.code} - ${error.message}`);
});

console.log('🤖 ChiefPilot Telegram Bot started...');
console.log('📡 Listening for commands...');

// Health check server for Railway deployment
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      telegram: 'connected'
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

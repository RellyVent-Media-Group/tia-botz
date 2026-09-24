#!/usr/bin/env node
/**
 * ChiefPilot WhatsApp Business Bot - Enhanced Version
 * Template messages, engagement tracking, and automation
 * New: AI generation, admin commands, analytics, workspace integration
 */

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import axios from 'axios';
import qrcode from 'qrcode-terminal';
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

import CharacterAPIClient from '../character-api-client.js';

dotenv.config();

const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Tiapmaatzu-OS-Toolkit/core/character-database/characters-cleaned.json';
const workspaceApiUrl = process.env.WORKSPACE_API_URL || 'http://localhost:8080';
const characterApiUrl = process.env.CHARACTER_API_URL || 'http://localhost:8001';

// Initialize character API client
const characterAPI = new CharacterAPIClient(characterApiUrl);

// Logger
const logger = pino({ level: 'silent' });

// Session management (keeping for backward compatibility, will be phased out)
const sessions = new Map();
const messageQueue = new Map();

// Initialize database
initializeDatabase().catch(console.error);

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    logger,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 Scan this QR code with WhatsApp Business:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🔌 Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Business Bot connected!');
      console.log('📨 Listening for messages...');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const remoteJid = msg.key.remoteJid;
      const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

      if (!messageContent) continue;

      console.log(`📩 Message from ${remoteJid}: ${messageContent}`);

      // Track engagement
      trackEngagement(remoteJid, messageContent);

      // Process commands
      await processCommand(sock, remoteJid, messageContent, msg);
    }
  });
}

async function processCommand(sock, remoteJid, message, msg) {
  const command = message.toLowerCase().trim();
  const userId = remoteJid.split('@')[0];

  // Get or create user in database
  const user = await getOrCreateUser(null, userId);
  const dbSession = await getOrCreateSession(user.id, 'whatsapp');

  // Initialize session (keeping for backward compatibility)
  if (!sessions.has(userId)) {
    sessions.set(userId, { messageCount: 0, lastActivity: new Date(), promptsGenerated: 0, subscription: user.subscription_tier });
  }
  const session = sessions.get(userId);
  session.messageCount++;
  session.lastActivity = new Date();

  // Command routing
  if (command === '/start' || command === 'hello' || command === 'hi') {
    await sock.sendMessage(remoteJid, { text: await getWelcomeMessage(user.id) });
  } else if (command === '/help') {
    await sock.sendMessage(remoteJid, { text: await getHelpMessage(user.id) });
  } else if (command.startsWith('/prompt')) {
    const args = command.split(' ').slice(1);
    await handlePromptCommand(sock, remoteJid, args, user, dbSession);
  } else if (command === '/random') {
    await handleRandomCommand(sock, remoteJid, user, dbSession);
  } else if (command === '/batch') {
    await handleBatchCommand(sock, remoteJid, user, dbSession);
  } else if (command === '/character') {
    const args = command.split(' ').slice(1);
    await handleCharacterCommand(sock, remoteJid, args);
  } else if (command === '/status') {
    await sock.sendMessage(remoteJid, { text: await getStatusMessage(user.id) });
  } else if (command === '/subscribe') {
    await sock.sendMessage(remoteJid, { text: getSubscribeMessage(user.subscription_tier) });
  } else if (command === '/calendar') {
    await handleCalendarCommand(sock, remoteJid);
  } else if (command === '/workspace') {
    await handleWorkspaceCommand(sock, remoteJid);
  } else if (command === '/sync') {
    await handleSyncCommand(sock, remoteJid, user.id, dbSession);
  } else if (command === '/products') {
    await sock.sendMessage(remoteJid, { text: getProductsMessage() });
  } else if (command === '/workflow') {
    await sock.sendMessage(remoteJid, { text: getWorkflowMessage() });
  } else if (command.startsWith('/api')) {
    const args = command.split(' ').slice(1);
    await handleApiCommand(sock, remoteJid, args, user.id);
  } else if (command.startsWith('/generate')) {
    const args = command.split(' ').slice(1);
    await handleGenerateCommand(sock, remoteJid, args, user);
  } else if (command === '/analytics') {
    await handleAnalyticsCommand(sock, remoteJid, user.id);
  } else if (command.startsWith('/link')) {
    const args = command.split(' ').slice(1);
    await handleLinkCommand(sock, remoteJid, args, user.id);
  } else if (command.startsWith('/admin')) {
    const args = command.split(' ').slice(1);
    const response = await handleAdminCommand(user.id, args);
    await sock.sendMessage(remoteJid, { text: response });
  } else {
    await sock.sendMessage(remoteJid, { text: getUnknownCommandMessage() });
  }
}

async function handlePromptCommand(sock, remoteJid, args, user, dbSession) {
  // Check daily limit for free users
  const limitCheck = await checkDailyLimit(user.id, 'whatsapp', user.subscription_tier === 'premium' ? 999 : 5);
  
  if (!limitCheck.allowed) {
    await sock.sendMessage(remoteJid, { text: `⚠️ Daily limit reached. You have ${limitCheck.remaining} prompts remaining today.\n\nType /subscribe for premium unlimited access.` });
    return;
  }

  if (args.length < 2) {
    await sock.sendMessage(remoteJid, { text: 'Usage: /prompt [character] [type] [style]\nExample: /prompt Mary portrait cinematic' });
    return;
  }

  const characterName = args[0];
  const promptType = args[1];
  const style = args[2] || 'cinematic';

  await sock.sendMessage(remoteJid, { text: `🎨 Generating ${promptType} prompt for ${characterName} (${style} style)...` });

  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      await sock.sendMessage(remoteJid, { text: `❌ Character "${characterName}" not found` });
      return;
    }

    const prompt = generateEnhancedPrompt(character, promptType, style);
    
    // Log to database
    await logPrompt(user.id, characterName, promptType, prompt, 'whatsapp');
    await updateSession(user.id, 'whatsapp', { 
      prompts_generated: dbSession.prompts_generated + 1,
      daily_usage: dbSession.daily_usage + 1
    });
    await logAnalytics(user.id, 'prompt_generated', { character: characterName, type: promptType, style }, 'whatsapp');
    
    await sock.sendMessage(remoteJid, { text: `✨ *Prompt Generated*\n\n${prompt}` });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleRandomCommand(sock, remoteJid, user, dbSession) {
  // Check daily limit for free users
  const limitCheck = await checkDailyLimit(user.id, 'whatsapp', user.subscription_tier === 'premium' ? 999 : 5);
  
  if (!limitCheck.allowed) {
    await sock.sendMessage(remoteJid, { text: `⚠️ Daily limit reached. You have ${limitCheck.remaining} prompts remaining today.\n\nType /subscribe for premium unlimited access.` });
    return;
  }

  await sock.sendMessage(remoteJid, { text: '🎲 Fetching random character prompt...' });

  try {
    const characters = await loadCharacterList();
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
    const types = ['portrait', 'poster', 'avatar', 'story'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const character = await loadCharacter(randomCharacter);
    const prompt = generateEnhancedPrompt(character, randomType, 'cinematic');
    
    // Log to database
    await logPrompt(user.id, randomCharacter, randomType, prompt, 'whatsapp');
    await updateSession(user.id, 'whatsapp', { 
      prompts_generated: dbSession.prompts_generated + 1,
      daily_usage: dbSession.daily_usage + 1
    });
    await logAnalytics(user.id, 'random_prompt', { character: randomCharacter, type: randomType }, 'whatsapp');
    
    await sock.sendMessage(remoteJid, { text: `✨ *Random Prompt: ${randomCharacter} (${randomType})*\n\n${prompt}` });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleBatchCommand(sock, remoteJid, user, dbSession) {
  // Check subscription for batch access
  if (user.subscription_tier === 'free') {
    await sock.sendMessage(remoteJid, { text: '⚠️ *Batch generation is a premium feature*\n\nFree tier: 5 prompts per day\nPremium: Unlimited prompts + batch generation + AI image generation\n\nType /subscribe to upgrade and unlock batch generation.' });
    return;
  }

  await sock.sendMessage(remoteJid, { text: '📦 *Starting Batch Generation*\n\nGenerating 5 random prompts for batch production...\n\nThis may take a moment...' });

  try {
    const characters = await loadCharacterList();
    const types = ['portrait', 'poster', 'avatar', 'story', 'concept'];
    let batchResponse = '✨ *Batch Generation Complete*\n\n';
    batchResponse += `Generated 5 prompts at ${new Date().toLocaleTimeString()}\n\n`;

    for (let i = 0; i < 5; i++) {
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const character = await loadCharacter(randomCharacter);
      const prompt = generateEnhancedPrompt(character, randomType, 'cinematic');
      batchResponse += `${i + 1}. *${randomCharacter} (${randomType})*\n${prompt}\n\n`;
      
      // Log each prompt
      await logPrompt(user.id, randomCharacter, randomType, prompt, 'whatsapp');
    }

    await updateSession(user.id, 'whatsapp', { 
      prompts_generated: dbSession.prompts_generated + 5,
      daily_usage: dbSession.daily_usage + 5
    });
    await logAnalytics(user.id, 'batch_generation', { count: 5 }, 'whatsapp');

    batchResponse += `---\n💡 *Tip:* Use /generate with these prompts to create AI images.\nType /workflow for the 90-minute production guide.`;
    await sock.sendMessage(remoteJid, { text: batchResponse });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleCharacterCommand(sock, remoteJid, args) {
  const characterName = args.join(' ');

  if (!characterName) {
    await sock.sendMessage(remoteJid, { text: 'Usage: /character [name]\nExample: /character Mac Nazarene' });
    return;
  }

  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      await sock.sendMessage(remoteJid, { text: `❌ Character "${characterName}" not found` });
      return;
    }

    await sock.sendMessage(remoteJid, { text: formatCharacterInfo(character) });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleCalendarCommand(sock, remoteJid) {
  await sock.sendMessage(remoteJid, { text: '📅 Fetching content calendar from workspace...' });

  try {
    const calendar = await getWorkspaceContentCalendar();
    if (!calendar) {
      await sock.sendMessage(remoteJid, { text: '❌ Failed to fetch content calendar. Workspace may be offline.' });
      return;
    }

    const summary = formatContentCalendarSummary(calendar);
    await sock.sendMessage(remoteJid, { text: summary });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleWorkspaceCommand(sock, remoteJid) {
  await sock.sendMessage(remoteJid, { text: '🔗 Fetching workspace information...' });

  try {
    const health = await checkWorkspaceHealth();
    if (!health.healthy) {
      await sock.sendMessage(remoteJid, { text: `❌ Workspace is currently unavailable: ${health.error}` });
      return;
    }

    const analytics = await getWorkspaceAnalyticsLocal();
    if (!analytics) {
      await sock.sendMessage(remoteJid, { text: '❌ Failed to fetch workspace analytics. Workspace may be offline.' });
      return;
    }

    const summary = formatWorkspaceAnalytics(analytics);
    await sock.sendMessage(remoteJid, { text: summary });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleSyncCommand(sock, remoteJid, userId, dbSession) {
  await sock.sendMessage(remoteJid, { text: '🔄 Syncing your engagement data to workspace...' });

  try {
    const stats = await getUserStats(userId);
    const engagementData = {
      messageCount: stats.sessions.reduce((sum, s) => sum + s.message_count, 0),
      promptsGenerated: stats.totalPrompts,
      lastActivity: dbSession.last_activity,
      platform: 'whatsapp'
    };

    const result = await syncEngagementToWorkspaceLocal(userId, engagementData);
    if (result) {
      await sock.sendMessage(remoteJid, { text: '✅ Engagement data synced successfully!' });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Failed to sync engagement data. Workspace may be offline.' });
    }
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleApiCommand(sock, remoteJid, args, userId) {
  if (args.length === 0) {
    await sock.sendMessage(remoteJid, { text: `
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
    `.trim() });
    return;
  }

  const subCommand = args[0].toLowerCase();

  try {
    // Check API health first
    const health = await characterAPI.healthCheck();
    if (!health.healthy) {
      await sock.sendMessage(remoteJid, { text: `❌ Character API is currently unavailable: ${health.error || 'Unknown error'}` });
      return;
    }

    switch (subCommand) {
      case 'search':
        if (args.length < 2) {
          await sock.sendMessage(remoteJid, { text: 'Usage: /api search [query]\nExample: /api search Mary' });
          return;
        }
        const query = args.slice(1).join(' ');
        const searchResults = await characterAPI.searchCharacters(query);
        const formattedSearch = characterAPI.formatCharacterListForBot(searchResults);
        if (formattedSearch.length === 0) {
          await sock.sendMessage(remoteJid, { text: `❌ No characters found matching "${query}"` });
        } else {
          let response = `🔍 *Search Results for "${query}"*\n\n`;
          formattedSearch.slice(0, 5).forEach((char, i) => {
            response += `${i + 1}. *${char.name}*\n   ${char.archetype} | ${char.rarity}\n`;
          });
          if (formattedSearch.length > 5) {
            response += `\n...and ${formattedSearch.length - 5} more`;
          }
          await sock.sendMessage(remoteJid, { text: response });
        }
        break;

      case 'random':
        const randomChar = await characterAPI.getRandomCharacter();
        const formattedRandom = characterAPI.formatCharacterForBot(randomChar);
        await sock.sendMessage(remoteJid, { text: `
🎲 *Random Character*

*${formattedRandom.name}*
*Archetype:* ${formattedRandom.archetype}
*Rarity:* ${formattedRandom.rarity}
*Budget:* ${formattedRandom.budget}

*Description:*
${formattedRandom.description?.substring(0, 200)}...

Use /character "${formattedRandom.name}" for full details
        `.trim() });
        break;

      case 'creators':
        const creators = await characterAPI.getContentCreators();
        const formattedCreators = characterAPI.formatCharacterListForBot(creators);
        let creatorResponse = `👥 *Content Creators*\n\n`;
        formattedCreators.forEach((char, i) => {
          creatorResponse += `${i + 1}. *${char.name}*\n   ${char.archetype} | ${char.budget}\n`;
        });
        await sock.sendMessage(remoteJid, { text: creatorResponse });
        break;

      case 'budget':
        if (args[1] === 'archetype') {
          const budgetByArchetype = await characterAPI.getBudgetByArchetype();
          let budgetResponse = `💰 *Budget by Archetype*\n\n`;
          Object.entries(budgetByArchetype).forEach(([archetype, budget]) => {
            budgetResponse += `• ${archetype}: $${budget.toLocaleString()}\n`;
          });
          await sock.sendMessage(remoteJid, { text: budgetResponse });
        } else {
          const budgetSummary = await characterAPI.getBudgetSummary();
          await sock.sendMessage(remoteJid, { text: `
💰 *Budget Summary*

*Total Allocated:* $${budgetSummary.total?.toLocaleString() || 'N/A'}
*Total Spent:* $${budgetSummary.spent?.toLocaleString() || 'N/A'}
*Remaining:* $${budgetSummary.remaining?.toLocaleString() || 'N/A'}
*Characters Funded:* ${budgetSummary.count || 'N/A'}
          `.trim() });
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
          await sock.sendMessage(remoteJid, { text: '❌ No characters found with these filters' });
        } else {
          let filterResponse = `🔎 *Filtered Characters*\n\n`;
          formattedFiltered.forEach((char, i) => {
            filterResponse += `${i + 1}. *${char.name}*\n   ${char.archetype} | ${char.rarity}\n`;
          });
          await sock.sendMessage(remoteJid, { text: filterResponse });
        }
        break;

      case 'performance':
        const performance = await characterAPI.getCharacterPerformance();
        let perfResponse = `📊 *Character Performance Analytics*\n\n`;
        Object.entries(performance).forEach(([metric, value]) => {
          perfResponse += `• ${metric}: ${value}\n`;
        });
        await sock.sendMessage(remoteJid, { text: perfResponse });
        break;

      case 'health':
        await sock.sendMessage(remoteJid, { text: `✅ Character API is healthy\n\n*Version:* ${health.version || 'Unknown'}\n*Timestamp:* ${new Date(health.timestamp).toLocaleString()}` });
        break;

      default:
        await sock.sendMessage(remoteJid, { text: `❌ Unknown API command: ${subCommand}\nUse /api to see available commands` });
    }

    // Log analytics
    await logAnalytics(userId, 'api_query', { command: subCommand, args: args.slice(1) }, 'whatsapp');

  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ API Error: ${error.message}\n\n💡 Tip: Use /api health to check if the character API is running` });
  }
}

// Helper functions
async function getWelcomeMessage(userId) {
  await logAnalytics(userId, 'start', { platform: 'whatsapp' }, 'whatsapp');
  
  return `
🎭 *Welcome to ChiefPilot WhatsApp*

Your gateway to the Gilded Mirrors Universe character database and AI prompt system.

*Quick Commands:*
• /prompt - Get custom prompts
• /random - Random character prompt
• /batch - Generate 5 prompts (premium)
• /generate - Generate AI images (NEW!)
• /character - View character details
• /api - Query character database via API (NEW!)
• /products - View available products
• /workflow - Get production workflow
• /status - Check your status
• /analytics - View your analytics
• /link - Link accounts across platforms
• /workspace - View workspace integration
• /sync - Sync data to workspace
• /admin - Admin commands (admin only)
• /help - Show all commands

*Quick Start:*
Try /random to get your first character prompt!

*Free Tier:* 5 prompts per day
*Premium:* Unlimited prompts + batch generation + AI image generation

Type /subscribe for premium access.

---
ChiefPilot v3 // Gilded Mirrors OS
  `.trim();
}

async function getHelpMessage(userId) {
  await logAnalytics(userId, 'help', { platform: 'whatsapp' }, 'whatsapp');
  
  return `
📚 *ChiefPilot Help*

*Basic Commands:*

/prompt [character] [type] [style]
  Generate custom prompt
  Example: /prompt Mary portrait cinematic

/random
  Get random character prompt

/batch
  Generate 5 prompts (premium only)

/character [name]
  View character details
  Example: /character Mac Nazarene

/api [query] [filter]
  Query character database via API
  Example: /api search Mary
  Example: /api random
  Example: /api creators
  Example: /api budget

*New AI Generation Commands:*

/generate [character] [type] [service] [style]
  Generate AI images
  Example: /generate Mary portrait midjourney cinematic

/generate status [queue_id]
  Check generation status

/generate services
  List available AI services

*Analytics & Management:*

/analytics
  View your usage analytics

/status
  Check your status

/link [code]
  Link accounts across platforms

/workspace [calendar|analytics|projects]
  View workspace integration

/sync
  Sync data to workspace

*Products & Workflow:*

/products
  View available products

/workflow
  Get 90-minute production workflow

*Admin:*

/admin [command]
  Admin commands (admin only)

*Subscription:*

/subscribe
  View subscription plans

*Character Examples:*
• Mary Magnumbytes
• Mac Nazarene
• Mrs. Cox-Turner
• Latti Pleddespo

*Prompt Types:*
• portrait, poster, avatar, story, concept, social, animation

*Styles:*
• cinematic, anime, realistic, fantasy, minimalist, vintage, cyberpunk, modern, cartoon, pixel, vector

---
Need help? Contact support
  `.trim();
}

async function getStatusMessage(userId) {
  const stats = await getUserStats(userId);
  const session = stats.sessions.find(s => s.platform === 'whatsapp') || stats.sessions[0];
  
  return `
📊 *Your Status*

*Subscription:* ${stats.user.subscription_tier === 'premium' ? '✅ Premium' : '🆓 Free'}
${stats.user.subscription_expires ? `*Expires:* ${new Date(stats.user.subscription_expires).toLocaleDateString()}` : ''}

*Session Stats:*
• Total Prompts Generated: ${stats.totalPrompts}
• Total Analytics Events: ${stats.totalAnalytics}
• Messages Sent: ${session?.message_count || 0}
• Last Activity: ${session?.last_activity ? new Date(session.last_activity).toLocaleString() : 'Never'}

*Daily Limit:* ${stats.user.subscription_tier === 'premium' ? 'Unlimited' : '5/5'}
*Today's usage:* ${session?.daily_usage || 0}

---
ChiefPilot WhatsApp Bot
  `.trim();
}

function getSubscribeMessage(subscriptionTier = 'free') {
  const monthlyPrice = process.env.SUBSCRIPTION_PRICE_MONTHLY || '9.99';
  const yearlyPrice = process.env.SUBSCRIPTION_PRICE_YEARLY || '99.99';

  return `
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
Visit gumroad.com/chiefpilot

*Current Status:* ${subscriptionTier === 'premium' ? '✅ Premium' : '🆓 Free'}

---
ChiefPilot WhatsApp
  `.trim();
}

function getUnknownCommandMessage() {
  return `
❓ *Unknown Command*

Use /help to see available commands.

*Quick Start:*
• /random - Get a random prompt
• /help - Show all commands

---
ChiefPilot WhatsApp Bot
  `.trim();
}

function getProductsMessage() {
  return `
🛍️ *ChiefPilot Product Suite*

*📦 Prompt Vault Basic* - $27
• 25 cinematic character prompts
• Character consistency rules
• Basic production guides
• Commercial license included
• PDF download

*📦 Prompt Vault Standard* - $47 ⭐ POPULAR
• Everything in Basic
• Notion integration templates
• 90-minute production workflow
• Caption formulas & scripts
• Priority email support
• PDF + Notion templates

*📦 Prompt Vault Premium* - $97
• Everything in Standard
• 15-minute custom consultation
• Future prompt updates (1 year)
• White-label licensing option
• Dedicated support channel
• All formats included

*🚀 Platform Integration Kit* - $197
• Complete bot setup (Telegram + WhatsApp)
• Workspace integration configuration
• Custom development for your stack
• Priority support (24h response)
• Training documentation
• Deployment assistance

*🎯 Multi-Platform Starter Kit* - $497
• Everything in all packages
• Bots for 10+ platforms
• Complete marketing materials
• Custom gig descriptions
• Visual asset specifications
• Script library
• Full implementation guide

*📥 How to Purchase:*
1. Visit gumroad.com/chiefpilot
2. Select your preferred package
3. Instant download after purchase
4. Email support for setup questions

*💬 Need help deciding?*
Reply with a product name for detailed info or "compare" to see side-by-side features.

---
ChiefPilot Product Suite
gumroad.com/chiefpilot
  `.trim();
}

function getWorkflowMessage() {
  return `
⏱️ *90-Minute Production Workflow*

This workflow produces 4-6 consistent character videos in 90 minutes.

*Step 1: Generate Images (0-20 min)*
• Use /prompt or /batch to get character prompts
• Generate with Midjourney (v6), Stable Diffusion XL, or DALL-E 3
• Maintain consistency: same aspect ratio, style, lighting
• Create 2-3 variations per character (different angles/poses)
• Download highest resolution available

*Step 2: Animate with AI (20-50 min)*
• Use Kling 2.0, Runway Gen-3, or Pika Labs
• Upload character images as reference
• Set motion strength: medium (40-60%)
• Create 2 variations per image = 4-6 videos total
• Follow technical specs: 15-60 seconds, 1080p minimum
• Export with consistent frame rate (24-30 fps)

*Step 3: Export & Format (50-70 min)*
• Export all video content in MP4 format
• Trim to optimal lengths: 15s (TikTok), 30s (Instagram), 60s (YouTube)
• Add subtle watermarks if brand protection needed
• Format for each platform's specs
• Organize by platform in folders

*Step 4: Write & Schedule (70-90 min)*
• Use caption formula: Hook + Value + CTA
• Include character-specific hashtags
• Tag relevant accounts
• Schedule for optimal posting times
• Track performance in workspace analytics

*📋 Platform-Specific Tips:*
• TikTok: 9:16 vertical, trending sounds, fast cuts
• Instagram: 1:1 or 4:5, aesthetic feed, Stories + Reels
• YouTube: 16:9 horizontal, longer descriptions, community tab
• X/Twitter: 16:9 or 1:1, thread format, tag relevant accounts

*🎯 Success Metrics:*
• Views: 1K+ within 24 hours
• Engagement: 5%+ engagement rate
• Saves: 10+ saves per video
• Shares: 5+ shares per video

*💡 Pro Tips:*
• Batch similar tasks together
• Use templates for captions
• Maintain character voice across platforms
• Engage with comments within 1 hour
• Post consistently (3-5x per week)

Type /products to get the complete prompt system that makes this workflow possible.

---
ChiefPilot Production Workflow
For detailed guides, get Prompt Vault Standard or higher
  `.trim();
}

function formatCharacterInfo(character) {
  return `
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
}

function trackEngagement(userId, message) {
  if (!messageQueue.has(userId)) {
    messageQueue.set(userId, []);
  }
  const queue = messageQueue.get(userId);
  queue.push({
    message,
    timestamp: new Date(),
  });

  // Keep last 100 messages
  if (queue.length > 100) {
    queue.shift();
  }
}

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

// New command handlers
async function handleGenerateCommand(sock, remoteJid, args, user) {
  if (args.length === 0) {
    await sock.sendMessage(remoteJid, { text: `
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
    `.trim() });
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
    await sock.sendMessage(remoteJid, { text: response });
    return;
  }

  if (subCommand === 'types') {
    const types = getAvailablePromptTypes();
    await sock.sendMessage(remoteJid, { text: `📋 *Available Prompt Types*\n\n${types.join(', ')}` });
    return;
  }

  if (subCommand === 'styles') {
    const promptType = args[1];
    if (!promptType) {
      await sock.sendMessage(remoteJid, { text: 'Usage: /generate styles [prompt_type]\nExample: /generate styles portrait' });
      return;
    }
    const styles = getAvailableStyles(promptType);
    await sock.sendMessage(remoteJid, { text: `🎨 *Available Styles for ${promptType}*\n\n${styles.join(', ')}` });
    return;
  }

  if (subCommand === 'status') {
    const queueId = args[1];
    if (!queueId) {
      await sock.sendMessage(remoteJid, { text: 'Usage: /generate status [queue_id]' });
      return;
    }
    const status = getGenerationStatus(queueId);
    if (!status) {
      await sock.sendMessage(remoteJid, { text: `❌ Generation ${queueId} not found` });
      return;
    }
    await sock.sendMessage(remoteJid, { text: `📊 *Generation Status*\n\n• Status: ${status.status}\n• Service: ${status.service}\n• Queued: ${status.queuedAt ? new Date(status.queuedAt).toLocaleString() : 'N/A'}` });
    return;
  }

  if (subCommand === 'cancel') {
    const queueId = args[1];
    if (!queueId) {
      await sock.sendMessage(remoteJid, { text: 'Usage: /generate cancel [queue_id]' });
      return;
    }
    const cancelled = cancelGeneration(queueId);
    await sock.sendMessage(remoteJid, { text: cancelled ? '✅ Generation cancelled' : '❌ Failed to cancel generation' });
    return;
  }

  // Handle image generation
  const characterName = args[0];
  const promptType = args[1] || 'portrait';
  const service = args[2] || 'stable-diffusion';
  const style = args[3] || 'cinematic';

  await sock.sendMessage(remoteJid, { text: `🎨 Queueing ${service} generation for ${characterName}...` });

  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      await sock.sendMessage(remoteJid, { text: `❌ Character "${characterName}" not found` });
      return;
    }

    const prompt = generateEnhancedPrompt(character, promptType, style);
    const { queueId, position, estimatedWait } = queueGeneration(user.id, service, prompt, { promptType, style });

    await sock.sendMessage(remoteJid, { text: `✅ *Generation Queued*\n\n• Queue ID: ${queueId}\n• Position: ${position}\n• Estimated wait: ${estimatedWait} seconds\n\nUse /generate status ${queueId} to check progress` });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleAnalyticsCommand(sock, remoteJid, userId) {
  const stats = await getUserStats(userId);
  
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

  await sock.sendMessage(remoteJid, { text: message });
}

async function handleLinkCommand(sock, remoteJid, args, userId) {
  const code = args[0];

  if (!code) {
    await sock.sendMessage(remoteJid, { text: `
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
    `.trim() });
    return;
  }

  // Implementation would involve validating the code and linking accounts
  await sock.sendMessage(remoteJid, { text: `⚠️ Account linking functionality requires workspace integration. Contact support for manual linking.` });
}

// Workspace Integration Functions - using shared module
// These local functions are kept for backward compatibility but delegate to shared module
async function getWorkspaceContentCalendar() {
  return await getContentCalendar();
}

async function getWorkspaceCharacters() {
  // Placeholder - would call shared module function if needed
  return [];
}

async function syncEngagementToWorkspaceLocal(userId, engagementData) {
  // Call the shared module function with a different name to avoid recursion
  const { syncEngagementToWorkspace: syncShared } = await import('../shared/workspace.js');
  return await syncShared(userId, engagementData);
}

async function getWorkspaceAnalyticsLocal() {
  // Call the shared module function with a different name to avoid recursion
  const { getWorkspaceAnalytics: getSharedAnalytics } = await import('../shared/workspace.js');
  return await getSharedAnalytics();
}

// Start the bot
startWhatsAppBot().catch((error) => {
  console.error('Failed to start WhatsApp bot:', error);
});

// Health check server for Railway deployment
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      whatsapp: 'connected'
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

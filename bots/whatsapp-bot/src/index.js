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
} from '../../shared/database.js';

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
} from '../../shared/ai-generation.js';

import {
  isAdmin,
  handleAdminCommand
} from '../../shared/admin.js';

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
} from '../../shared/workspace.js';

dotenv.config({ path: '../../.env' });

const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Tiapma\'atzu-OS-Toolkit/core/character-database/Character Database';
const workspaceApiUrl = process.env.WORKSPACE_API_URL || 'http://localhost:8080';

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
    await sock.sendMessage(remoteJid, { text: '⚠️ Batch generation is a premium feature.\n\nType /subscribe to upgrade.' });
    return;
  }

  await sock.sendMessage(remoteJid, { text: '📦 Generating 5 random prompts for batch production...' });

  try {
    const characters = await loadCharacterList();
    const types = ['portrait', 'poster', 'avatar', 'story'];
    let batchResponse = '✨ *Batch Generation Complete*\n\n';

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
🛍️ *Available Products*

*Prompt Vault Basic* - $27
• 25 cinematic prompts
• Character consistency rules
• Basic guides
• Commercial license

*Prompt Vault Standard* - $47
• Everything in Basic
• Notion integration templates
• Production workflow guides
• Priority support

*Prompt Vault Premium* - $97
• Everything in Standard
• Custom consultation (15-min)
• Future prompt updates
• White-label licensing option

*Platform Integration Kit* - $197
• Complete bot setup
• Workspace integration
• Custom development
• Priority support

*To purchase:*
Visit gumroad.com/chiefpilot
Or reply with your preferred product for details.

---
ChiefPilot Products
  `.trim();
}

function getWorkflowMessage() {
  return `
⏱️ *90-Minute Production Workflow*

*Step 1: Generate Images (0-20 min)*
• Use character prompts from /prompt
• Generate with Midjourney/Stable Diffusion
• Maintain consistency rules
• Create 2-3 variations per character

*Step 2: Animate with AI (20-50 min)*
• Use Kling 2.0, Runway, or Pika
• Apply character images to video generation
• Create 2 variations per image = 4-6 videos
• Follow technical specs from prompts

*Step 3: Export & Format (50-70 min)*
• Export all video content
• Trim to optimal lengths (15-60 sec)
• Add watermarks if needed
• Format for target platforms

*Step 4: Write & Schedule (70-90 min)*
• Use caption formula from guides
• Include character hashtags
• Schedule for optimal posting times
• Track performance in workspace

*Goal: 4-6 consistent character videos in 90 minutes*

Type /products to get the complete prompt system.

---
ChiefPilot Production Workflow
  `.trim();
}

function formatCharacterInfo(character) {
  return `
👤 *${character.name}*

*Title:* ${character.title || 'N/A'}
*Archetype:* ${character.archetype || 'N/A'}
*Rarity:* ${character.rarity || 'N/A'}

*Bio:*
${character.bio || 'No bio available'}

*Persona:* ${character.personaTraits?.join(', ') || 'N/A'}
*Shadow:* ${character.shadowTraits?.join(', ') || 'N/A'}

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
    const files = readdirSync(characterDbPath);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', '').split(' ').slice(0, -1).join(' '));
  } catch (error) {
    throw new Error('Failed to load character list');
  }
}

async function loadCharacter(name) {
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

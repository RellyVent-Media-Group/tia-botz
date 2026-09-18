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

import IntegrationManager from '../../shared/integration-manager.js';

dotenv.config({ path: '../../.env' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Tiapma\'atzu-OS-Toolkit/core/character-database/Character Database';

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

*Title:* ${character.title || 'N/A'}
*Archetype:* ${character.archetype || 'N/A'}
*Rarity:* ${character.rarity || 'N/A'}
*Element:* ${character.element || 'N/A'}

*Bio:*
${character.bio || 'No bio available'}

*Persona Traits:*
${character.personaTraits?.join(', ') || 'N/A'}

*Shadow Traits:*
${character.shadowTraits?.join(', ') || 'N/A'}

*Preferred Platforms:*
${character.preferredPlatforms?.join(', ') || 'N/A'}

---
ChiefPilot Character Database
    `.trim();

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
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
    const files = readdirSync(characterDbPath);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', '').split(' ').slice(0, -1).join(' ')); // Remove hash
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

    // Parse markdown to extract character data
    const lines = content.split('\n');
    const character = { name };

    lines.forEach(line => {
      if (line.startsWith('# ')) character.title = line.replace('# ', '');
      if (line.startsWith('**Archetype:**')) character.archetype = line.split(':')[1]?.trim();
      if (line.startsWith('**Rarity:**')) character.rarity = line.split(':')[1]?.trim();
      if (line.startsWith('**Element:**')) character.element = line.split(':')[1]?.trim();
      if (line.startsWith('**Bio:**')) character.bio = line.split(':')[1]?.trim();
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

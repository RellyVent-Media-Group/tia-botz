#!/usr/bin/env node
/**
 * ChiefPilot WhatsApp Business Bot
 * Template messages, engagement tracking, and automation
 */

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import axios from 'axios';

dotenv.config();

const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Private & Shared/Character Database';
const workspaceApiUrl = process.env.WORKSPACE_API_URL || 'http://localhost:8080';

// Logger
const logger = pino({ level: 'silent' });

// Session management
const sessions = new Map();
const messageQueue = new Map();

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 Scan this QR code with WhatsApp Business:');
      console.log(qr);
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

  // Initialize session
  if (!sessions.has(userId)) {
    sessions.set(userId, { messageCount: 0, lastActivity: new Date(), promptsGenerated: 0 });
  }
  const session = sessions.get(userId);
  session.messageCount++;
  session.lastActivity = new Date();

  // Command routing
  if (command === '/start' || command === 'hello' || command === 'hi') {
    await sock.sendMessage(remoteJid, { text: getWelcomeMessage() });
  } else if (command === '/help') {
    await sock.sendMessage(remoteJid, { text: getHelpMessage() });
  } else if (command.startsWith('/prompt')) {
    const args = command.split(' ').slice(1);
    await handlePromptCommand(sock, remoteJid, args);
  } else if (command === '/random') {
    await handleRandomCommand(sock, remoteJid);
  } else if (command === '/character') {
    const args = command.split(' ').slice(1);
    await handleCharacterCommand(sock, remoteJid, args);
  } else if (command === '/status') {
    await sock.sendMessage(remoteJid, { text: getStatusMessage(session) });
  } else if (command === '/subscribe') {
    await sock.sendMessage(remoteJid, { text: getSubscribeMessage() });
  } else if (command === '/calendar') {
    await handleCalendarCommand(sock, remoteJid);
  } else if (command === '/workspace') {
    await handleWorkspaceCommand(sock, remoteJid);
  } else if (command === '/sync') {
    await handleSyncCommand(sock, remoteJid, userId, session);
  } else {
    await sock.sendMessage(remoteJid, { text: getUnknownCommandMessage() });
  }
}

async function handlePromptCommand(sock, remoteJid, args) {
  if (args.length < 2) {
    await sock.sendMessage(remoteJid, { text: 'Usage: /prompt [character] [type]\nExample: /prompt Mary portrait' });
    return;
  }

  const characterName = args[0];
  const promptType = args[1];

  await sock.sendMessage(remoteJid, { text: `🎨 Generating ${promptType} prompt for ${characterName}...` });

  try {
    const prompt = await generatePrompt(characterName, promptType);
    await sock.sendMessage(remoteJid, { text: `✨ *Prompt Generated*\n\n${prompt}` });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleRandomCommand(sock, remoteJid) {
  await sock.sendMessage(remoteJid, { text: '🎲 Fetching random character prompt...' });

  try {
    const characters = await loadCharacterList();
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
    const types = ['portrait', 'poster', 'avatar', 'story'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const prompt = await generatePrompt(randomCharacter, randomType);
    await sock.sendMessage(remoteJid, { text: `✨ *Random Prompt: ${randomCharacter} (${randomType})*\n\n${prompt}` });
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

    const summary = `
📅 *Content Calendar Summary*

*Total Posts:* ${calendar.posts?.length || 0}
*Published:* ${calendar.posts?.filter(p => p.status === 'published').length || 0}
*Planned:* ${calendar.posts?.filter(p => p.status === 'planned').length || 0}
*Ideas:* ${calendar.posts?.filter(p => p.status === 'idea').length || 0}

*Theme:* ${calendar.theme || 'N/A'}
*Description:* ${calendar.description || 'N/A'}

View full calendar at your workspace dashboard.
    `.trim();

    await sock.sendMessage(remoteJid, { text: summary });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleWorkspaceCommand(sock, remoteJid) {
  await sock.sendMessage(remoteJid, { text: '🔗 Fetching workspace information...' });

  try {
    const analytics = await getWorkspaceAnalytics();
    if (!analytics) {
      await sock.sendMessage(remoteJid, { text: '❌ Failed to fetch workspace analytics. Workspace may be offline.' });
      return;
    }

    const summary = `
🚀 *Workspace Dashboard*

*Total Projects:* ${analytics.projects || 0}
*Active Users:* ${analytics.users || 0}
*Content Posts:* ${analytics.posts || 0}
*Engagement Rate:* ${analytics.engagementRate || 0}%

*Recent Activity:*
${analytics.recentActivity?.slice(0, 3).map(a => `• ${a}`).join('\n') || 'No recent activity'}

Access full dashboard at ${workspaceApiUrl}
    `.trim();

    await sock.sendMessage(remoteJid, { text: summary });
  } catch (error) {
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${error.message}` });
  }
}

async function handleSyncCommand(sock, remoteJid, userId, session) {
  await sock.sendMessage(remoteJid, { text: '🔄 Syncing your engagement data to workspace...' });

  try {
    const engagementData = {
      messageCount: session.messageCount,
      promptsGenerated: session.promptsGenerated,
      lastActivity: session.lastActivity,
      recentMessages: messageQueue.get(userId)?.slice(-5) || []
    };

    const result = await syncEngagementToWorkspace(userId, engagementData);
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
function getWelcomeMessage() {
  return `
🎭 *Welcome to ChiefPilot WhatsApp*

Your gateway to the Gilded Mirrors Universe character database and AI prompt system.

*Quick Commands:*
• /prompt - Get custom prompts
• /random - Random character prompt
• /character - View character details
• /status - Check your status
• /help - Show all commands

*Quick Start:*
Try /random to get your first character prompt!

---
ChiefPilot v3 // Gilded Mirrors OS
  `.trim();
}

function getHelpMessage() {
  return `
📚 *ChiefPilot Help*

*Commands:*

/prompt [character] [type]
  Generate custom prompt
  Example: /prompt Mary portrait

/random
  Get random character prompt

/character [name]
  View character details
  Example: /character Mac Nazarene

/status
  Check your status

/subscribe
  View subscription plans

/calendar
  View content calendar from workspace

/workspace
  View workspace dashboard analytics

/sync
  Sync your engagement data to workspace

/help
  Show this help message

*Character Examples:*
• Mary Magnumbytes
• Mac Nazarene
• Mrs. Cox-Turner
• Latti Pleddespo

*Prompt Types:*
• portrait, poster, avatar, story

*Workspace Integration:*
Connects to your Private & Shared workspace for unified analytics and content management.

---
Need help? Contact support
  `.trim();
}

function getStatusMessage(session) {
  return `
📊 *Your Status*

*Messages Sent:* ${session.messageCount}
*Prompts Generated:* ${session.promptsGenerated}
*Last Activity:* ${session.lastActivity.toLocaleString()}

*Session ID:* ${session.id || 'Free Tier'}

---
ChiefPilot WhatsApp Bot
  `.trim();
}

function getSubscribeMessage() {
  const monthlyPrice = process.env.SUBSCRIPTION_PRICE_MONTHLY || '9.99';
  const yearlyPrice = process.env.SUBSCRIPTION_PRICE_YEARLY || '99.99';

  return `
💎 *Subscription Plans*

*Free Tier*
• 10 messages per day
• Random prompts only

*Premium Monthly* - $${monthlyPrice}/month
• Unlimited messages
• Custom prompts
• Full database access

*Premium Yearly* - $${yearlyPrice}/year
• All monthly features
• 2 months free

*To subscribe:*
Visit gumroad.com/chiefpilot

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
  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      throw new Error('Character not found');
    }

    const prompts = {
      portrait: `A cinematic character portrait of ${characterName}, ${character.bio || 'mysterious figure'}, professional studio lighting, high detail, editorial photography style.`,
      poster: `Promotional poster art featuring ${characterName}, ${character.title || 'legendary character'}, dramatic composition, cinematic lighting, strong silhouette.`,
      avatar: `Square avatar portrait of ${characterName}, recognizable silhouette, clean background, polished digital illustration, ${character.archetype || 'heroic'} aesthetic.`,
      story: `A narrative scene featuring ${characterName}, ${character.bio || 'on a journey through the Gilded Mirrors universe'}, atmospheric lighting, emotional depth, cinematic storytelling.`
    };

    return prompts[type] || prompts.portrait;
  } catch (error) {
    const genericPrompts = {
      portrait: `A cinematic character portrait of ${characterName}, professional studio lighting, high detail, editorial photography style.`,
      poster: `Promotional poster art featuring ${characterName}, dramatic composition, cinematic lighting, strong silhouette.`,
      avatar: `Square avatar portrait of ${characterName}, recognizable silhouette, clean background, polished digital illustration.`,
      story: `A narrative scene featuring ${characterName}, atmospheric lighting, emotional depth, cinematic storytelling.`
    };
    return genericPrompts[type] || genericPrompts.portrait;
  }
}

// Workspace Integration Functions
async function getWorkspaceContentCalendar() {
  try {
    const response = await axios.get(`${workspaceApiUrl}/api/content-calendar`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch content calendar:', error.message);
    return null;
  }
}

async function getWorkspaceCharacters() {
  try {
    const response = await axios.get(`${workspaceApiUrl}/api/characters`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch characters:', error.message);
    return null;
  }
}

async function syncEngagementToWorkspace(userId, engagementData) {
  try {
    const response = await axios.post(`${workspaceApiUrl}/api/engagement`, {
      userId,
      platform: 'whatsapp',
      ...engagementData
    });
    return response.data;
  } catch (error) {
    console.error('Failed to sync engagement:', error.message);
    return null;
  }
}

async function getWorkspaceAnalytics() {
  try {
    const response = await axios.get(`${workspaceApiUrl}/api/analytics`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error.message);
    return null;
  }
}

// Start the bot
startWhatsAppBot().catch((error) => {
  console.error('Failed to start WhatsApp bot:', error);
});

#!/usr/bin/env node
/**
 * ChiefPilot Telegram Bot
 * Commands: /prompt, /random, /batch, /subscribe, /character, /status
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Private & Shared/Character Database';

// Create bot with polling (for development)
const bot = new TelegramBot(token, { polling: true });

// Subscription tracking (in-memory for now, move to database in production)
const subscriptions = new Map();
const userSessions = new Map();

// Command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🎭 *Welcome to ChiefPilot Telegram Bot*

Your gateway to the Gilded Mirrors Universe character database and AI prompt system.

*Available Commands:*
/prompt - Get a custom character prompt
/random - Get a random character prompt
/batch - Generate multiple prompts at once
/character - View character details
/subscribe - Subscribe to premium features
/status - Check your subscription status
/help - Show this help message

*Quick Start:*
Try /random to get your first character prompt!

---
ChiefPilot v3 // Gilded Mirrors OS
  `.trim();

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📚 *ChiefPilot Bot Help*

*Commands:*

/prompt [character] [type]
  Generate a custom prompt for a specific character
  Example: /prompt Mary portrait

/random
  Get a random character prompt from the database

/batch [count] [character]
  Generate multiple prompts at once
  Example: /batch 5 Mary

/character [name]
  View detailed character information
  Example: /character Mac Nazarene

/subscribe
  View subscription plans and pricing

/status
  Check your current subscription status

/help
  Show this help message

*Character Examples:*
• Mary Magnumbytes
• Mac Nazarene
• Mrs. Cox-Turner
• Latti Pleddespo
• And 7 more Legendary characters...

*Prompt Types:*
• portrait - Character portrait prompts
• poster - Promotional poster prompts
• avatar - Avatar/icon prompts
• story - Narrative/story prompts

---
Need help? Contact support
  `.trim();

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/prompt(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].trim().split(/\s+/).filter(a => a);

  if (args.length < 2) {
    bot.sendMessage(chatId, 'Usage: /prompt [character] [type]\nExample: /prompt Mary portrait');
    return;
  }

  const characterName = args[0];
  const promptType = args[1];

  bot.sendMessage(chatId, `🎨 Generating ${promptType} prompt for ${characterName}...`);

  try {
    const prompt = await generatePrompt(characterName, promptType);
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

bot.onText(/\/subscribe/, (msg) => {
  const chatId = msg.chat.id;
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

*Premium Yearly* - $${yearlyPrice}/year
• All monthly features
• 2 months free
• Early access to new features
• API access

*To subscribe:*
1. Visit gumroad.com/chiefpilot
2. Select your plan
3. Enter your Telegram ID: ${chatId}
4. Your access will be activated automatically

*Current Status:* ${subscriptions.has(chatId) ? '✅ Premium' : '🆓 Free'}

---
Need help? Contact @chiefpilot_support
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const subscription = subscriptions.get(chatId);
  const session = userSessions.get(chatId);

  const message = `
📊 *Your Status*

*Subscription:* ${subscription ? '✅ Premium' : '🆓 Free'}
${subscription ? `*Plan:* ${subscription.plan}\n*Expires:* ${subscription.expires}` : ''}

*Session Stats:*
• Prompts generated: ${session?.promptCount || 0}
• Last activity: ${session?.lastActivity || 'Never'}

*Daily Limit:* ${subscription ? 'Unlimited' : '5/5'}
*Today's usage:* ${session?.dailyUsage || 0}

---
ChiefPilot Telegram Bot
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
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
  // Try to load character-specific prompt from database
  try {
    const character = await loadCharacter(characterName);
    if (!character) {
      throw new Error('Character not found');
    }

    // Generate prompt based on type
    const prompts = {
      portrait: `A cinematic character portrait of ${characterName}, ${character.bio || 'mysterious figure'}, professional studio lighting, high detail, editorial photography style.`,
      poster: `Promotional poster art featuring ${characterName}, ${character.title || 'legendary character'}, dramatic composition, cinematic lighting, strong silhouette.`,
      avatar: `Square avatar portrait of ${characterName}, recognizable silhouette, clean background, polished digital illustration, ${character.archetype || 'heroic'} aesthetic.`,
      story: `A narrative scene featuring ${characterName}, ${character.bio || 'on a journey through the Gilded Mirrors universe'}, atmospheric lighting, emotional depth, cinematic storytelling.`
    };

    return prompts[type] || prompts.portrait;
  } catch (error) {
    // Fallback to generic prompt
    const genericPrompts = {
      portrait: `A cinematic character portrait of ${characterName}, professional studio lighting, high detail, editorial photography style.`,
      poster: `Promotional poster art featuring ${characterName}, dramatic composition, cinematic lighting, strong silhouette.`,
      avatar: `Square avatar portrait of ${characterName}, recognizable silhouette, clean background, polished digital illustration.`,
      story: `A narrative scene featuring ${characterName}, atmospheric lighting, emotional depth, cinematic storytelling.`
    };
    return genericPrompts[type] || genericPrompts.portrait;
  }
}

// Track user sessions
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, { promptCount: 0, dailyUsage: 0, lastActivity: new Date().toISOString() });
  }
  const session = userSessions.get(chatId);
  session.lastActivity = new Date().toISOString();
});

// Error handling
bot.on('polling_error', (error) => {
  console.error(`[Telegram Bot] Polling error: ${error.code} - ${error.message}`);
});

console.log('🤖 ChiefPilot Telegram Bot started...');
console.log('📡 Listening for commands...');

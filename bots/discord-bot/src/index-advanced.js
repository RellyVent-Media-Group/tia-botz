/**
 * Discord Bot with Advanced Features
 * 
 * This file extends the basic bot with advanced features:
 * - Message Components (Buttons, Select Menus)
 * - Modals
 * - Autocomplete
 * - Context Menu Commands
 * - Interactive Polls and Quizzes
 * 
 * To use: Rename this file to index.js or merge with existing index.js
 */

import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import CharacterAPIClient from '../character-api-client.js';
import { initializeDatabase, getOrCreateUser, getOrCreateSession, updateSession, checkDailyLimit, logPrompt, logAnalytics, logEngagement, getUserStats } from '../database.js';
import http from 'http';

// Import advanced commands and handlers
import {
  allAdvancedCommands,
  createCharacterProfileEmbed,
  createConfirmationButtons,
  createCharacterActionButtons,
  getRarityColor
} from './advanced-commands.js';

import {
  handleButtonInteraction,
  handleSelectMenuInteraction,
  handleModalSubmit,
  handleAutocomplete,
  executeGenerateCommand,
  executeConfigureCommand,
  executeCreateCharacterCommand,
  executePollCommand,
  executeQuizCommand,
  cleanupExpiredSessions
} from './advanced-commands-handlers.js';

dotenv.config();

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// Initialize Character API client
const characterApiUrl = process.env.CHARACTER_API_URL || 'http://localhost:8001';
const characterAPI = new CharacterAPIClient(characterApiUrl);

// Initialize database
const dbPath = process.env.DATABASE_PATH || (process.env.NODE_ENV === 'production' ? '/tmp/chiefpilot.db' : './chiefpilot.db');
initializeDatabase(dbPath);

// Combine basic and advanced commands
const commands = [
  // Basic commands from original index.js
  new (require('discord.js').SlashCommandBuilder)()
    .setName('help')
    .setDescription('Show available commands'),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('character')
    .setDescription('Get character information')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Character name to search for')
        .setRequired(false)),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('random')
    .setDescription('Get a random character'),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('prompt')
    .setDescription('Generate a creative prompt')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic for the prompt')
        .setRequired(false)),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('api')
    .setDescription('Query the character API')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Search characters')
        .addStringOption(option =>
          option.setName('query')
            .setDescription('Search query')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('random')
        .setDescription('Get random character'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('creators')
        .setDescription('Get content creators'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('budget')
        .setDescription('Get budget summary'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('performance')
        .setDescription('Get character performance')),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('status')
    .setDescription('Check your subscription status'),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('subscribe')
    .setDescription('Subscribe to premium features'),
  new (require('discord.js').SlashCommandBuilder)()
    .setName('health')
    .setDescription('Check bot and API health'),
  
  // Advanced commands
  ...allAdvancedCommands
].map(command => command.toJSON());

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Helper: Format character for Discord embed
function formatCharacterEmbed(character) {
  const embed = new (require('discord.js').EmbedBuilder)()
    .setTitle(character.name || 'Unknown Character')
    .setColor(getRarityColor(character.rarity || character.entityType));

  if (character.archetype) {
    embed.addFields({ name: 'Archetype', value: character.archetype, inline: true });
  }
  if (character.entityType) {
    embed.addFields({ name: 'Entity Type', value: character.entityType, inline: true });
  }
  if (character.status) {
    embed.addFields({ name: 'Status', value: character.status, inline: true });
  }
  if (character.rarity) {
    embed.addFields({ name: 'Rarity', value: character.rarity, inline: true });
  }

  if (character.description) {
    embed.setDescription(character.description.substring(0, 400));
  }

  if (character.visualSignature) {
    embed.addFields({ name: 'Visual Signature', value: character.visualSignature.substring(0, 300), inline: false });
  }
  if (character.allocatedBudget) {
    embed.addFields({ name: 'Budget', value: `$${character.allocatedBudget.toLocaleString()}`, inline: true });
  }
  if (character.keyToolCategories) {
    embed.addFields({ 
      name: 'Tools', 
      value: character.keyToolCategories.join(', '), 
      inline: true 
    });
  }

  embed.setTimestamp();
  return embed;
}

// Command handlers
client.on('interactionCreate', async interaction => {
  // Handle chat input commands (slash commands)
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    try {
      // Get or create user in database
      const userId = interaction.user.id;
      const userName = interaction.user.username;
      const user = getOrCreateUser(userId, userName, 'discord');

      // Log engagement
      logEngagement(userId, 'discord', commandName);

      let handled = false;

      // Handle basic commands
      switch (commandName) {
        case 'help':
          await interaction.reply({
            embeds: [new (require('discord.js').EmbedBuilder)()
              .setTitle('ChiefPilot Discord Bot Commands')
              .setColor(0x0099ff)
              .addFields(
                { name: '/character [name]', value: 'Get character information', inline: true },
                { name: '/random', value: 'Get a random character', inline: true },
                { name: '/prompt [topic]', value: 'Generate a creative prompt', inline: true },
                { name: '/api', value: 'Query character API (search, random, creators, budget, performance)', inline: true },
                { name: '/status', value: 'Check your subscription status', inline: true },
                { name: '/subscribe', value: 'Subscribe to premium features', inline: true },
                { name: '/health', value: 'Check bot and API health', inline: true },
                { name: '--- Advanced Commands ---', value: ' ' },
                { name: '/generate', value: 'Generate content with AI', inline: true },
                { name: '/configure', value: 'Configure bot settings', inline: true },
                { name: '/create-character', value: 'Create new character', inline: true },
                { name: '/poll', value: 'Create interactive poll', inline: true },
                { name: '/quiz', value: 'Start knowledge quiz', inline: true }
              )
            ]
          });
          handled = true;
          break;

        case 'character':
          const charName = interaction.options.getString('name');
          if (charName) {
            try {
              const character = await characterAPI.searchCharacters(charName);
              if (character && character.length > 0) {
                const embed = formatCharacterEmbed(character[0]);
                const row = createCharacterActionButtons(character[0].id || character[0].name);
                await interaction.reply({ embeds: [embed], components: [row] });
              } else {
                await interaction.reply('Character not found. Try /api search for more options.');
              }
            } catch (error) {
              await interaction.reply('Error searching character. The API may be unavailable.');
            }
          } else {
            await interaction.reply('Please provide a character name using /character name:<name>');
          }
          handled = true;
          break;

        case 'random':
          try {
            const character = await characterAPI.getRandomCharacter();
            if (character) {
              const embed = formatCharacterEmbed(character);
              const row = createCharacterActionButtons(character.id || character.name);
              await interaction.reply({ embeds: [embed], components: [row] });
            } else {
              await interaction.reply('Could not retrieve a random character.');
            }
          } catch (error) {
            await interaction.reply('Error retrieving random character. The API may be unavailable.');
          }
          handled = true;
          break;

        case 'prompt':
          const topic = interaction.options.getString('topic') || 'Gilded Mirrors universe';
          const promptResponse = `Creative prompt for ${topic}: "Describe a scene where a Soul confronts their Shadow in the Temenos, revealing both their deepest fear and their golden shadow virtue."`;
          await interaction.reply(promptResponse);
          logPrompt(userId, topic, promptResponse, 'discord');
          handled = true;
          break;

        case 'api':
          const subcommand = interaction.options.getSubcommand();

          try {
            const health = await characterAPI.healthCheck();
            if (!health.ok) {
              await interaction.reply('Character API is currently unavailable. Please try again later.');
              return;
            }
          } catch (error) {
            await interaction.reply('Cannot connect to Character API. Please ensure it is running.');
            return;
          }

          switch (subcommand) {
            case 'search':
              const query = interaction.options.getString('query');
              const searchResults = await characterAPI.searchCharacters(query);
              if (searchResults && searchResults.length > 0) {
                const formatted = characterAPI.formatCharacterListForBot(searchResults);
                await interaction.reply(formatted.substring(0, 1900));
              } else {
                await interaction.reply('No characters found matching your search.');
              }
              break;

            case 'random':
              const randomChar = await characterAPI.getRandomCharacter();
              if (randomChar) {
                const embed = formatCharacterEmbed(randomChar);
                const row = createCharacterActionButtons(randomChar.id || randomChar.name);
                await interaction.reply({ embeds: [embed], components: [row] });
              } else {
                await interaction.reply('Could not retrieve a random character.');
              }
              break;

            case 'creators':
              const creators = await characterAPI.getContentCreators();
              if (creators && creators.length > 0) {
                await interaction.reply(`Content Creators: ${creators.map(c => c.name).join(', ')}`);
              } else {
                await interaction.reply('No content creators found.');
              }
              break;

            case 'budget':
              const budget = await characterAPI.getBudgetSummary();
              await interaction.reply(`Budget Summary: ${JSON.stringify(budget, null, 2)}`);
              break;

            case 'performance':
              const performance = await characterAPI.getCharacterPerformance();
              await interaction.reply(`Character Performance: ${JSON.stringify(performance, null, 2)}`);
              break;

            default:
              await interaction.reply('Unknown API subcommand.');
          }
          handled = true;
          break;

        case 'status':
          const stats = getUserStats(userId);
          const statusEmbed = new (require('discord.js').EmbedBuilder)()
            .setTitle('Your Subscription Status')
            .setColor(0x00ff00)
            .addFields(
              { name: 'Tier', value: user.subscriptionTier || 'Free', inline: true },
              { name: 'Prompts Today', value: `${stats.promptsToday} / ${user.subscriptionTier === 'premium' ? '∞' : '5'}`, inline: true },
              { name: 'Total Prompts', value: stats.totalPrompts.toString(), inline: true }
            );
          await interaction.reply({ embeds: [statusEmbed] });
          handled = true;
          break;

        case 'subscribe':
          await interaction.reply({
            embeds: [new (require('discord.js').EmbedBuilder)()
              .setTitle('Upgrade to Premium')
              .setColor(0xffd700)
              .setDescription('Premium features include:')
              .addFields(
                { name: 'Unlimited Prompts', value: 'No daily limits', inline: true },
                { name: 'Batch Generation', value: 'Generate multiple prompts at once', inline: true },
                { name: 'Full Character Database', value: 'Complete access to all characters', inline: true },
                { name: 'Priority Support', value: 'Faster response times', inline: true }
              )
              .setFooter({ text: 'Contact @admin for subscription details' })
            ]
          });
          handled = true;
          break;

        case 'health':
          try {
            const apiHealth = await characterAPI.healthCheck();
            const EmbedBuilder = require('discord.js').EmbedBuilder;
            const healthEmbed = new EmbedBuilder()
              .setTitle('System Health')
              .setColor(apiHealth.ok ? 0x00ff00 : 0xff0000)
              .addFields(
                { name: 'Discord Bot', value: '✅ Online', inline: true },
                { name: 'Character API', value: apiHealth.ok ? '✅ Online' : '❌ Offline', inline: true },
                { name: 'Database', value: '✅ Connected', inline: true },
                { name: 'Active Polls', value: activePolls.size.toString(), inline: true },
                { name: 'Active Quizzes', value: activeQuizzes.size.toString(), inline: true }
              );
            await interaction.reply({ embeds: [healthEmbed] });
          } catch (error) {
            await interaction.reply('Health check failed: ' + error.message);
          }
          handled = true;
          break;
      }

      // Handle advanced commands
      if (!handled) {
        switch (commandName) {
          case 'generate':
            await executeGenerateCommand(interaction);
            handled = true;
            break;
          case 'configure':
            await executeConfigureCommand(interaction);
            handled = true;
            break;
          case 'create-character':
            await executeCreateCharacterCommand(interaction);
            handled = true;
            break;
          case 'poll':
            await executePollCommand(interaction);
            handled = true;
            break;
          case 'quiz':
            await executeQuizCommand(interaction);
            handled = true;
            break;
        }
      }

      if (!handled) {
        await interaction.reply('Unknown command. Use /help for available commands.');
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      if (!interaction.replied) {
        await interaction.reply('An error occurred while processing your command.');
      }
    }
    return;
  }

  // Handle button interactions
  if (!interaction.replied) {
    const handled = await handleButtonInteraction(interaction);
    if (handled) return;
  }

  // Handle select menu interactions
  if (!interaction.replied) {
    const handled = await handleSelectMenuInteraction(interaction);
    if (handled) return;
  }

  // Handle modal submissions
  if (!interaction.replied) {
    const handled = await handleModalSubmit(interaction);
    if (handled) return;
  }

  // Handle autocomplete
  if (!interaction.replied) {
    const handled = await handleAutocomplete(interaction);
    if (handled) return;
  }
});

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerCommands();
  
  // Start cleanup interval for expired sessions
  setInterval(cleanupExpiredSessions, 60000); // Clean up every minute
});

// Login
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});

// Health check server for Railway deployment
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      discord: client.isReady() ? 'connected' : 'disconnected',
      features: {
        advancedCommands: true,
        messageComponents: true,
        modals: true,
        autocomplete: true,
        polls: activePolls.size,
        quizzes: activeQuizzes.size
      }
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

// Import for cleanup functions (circular reference)
import { activePolls, activeQuizzes } from './advanced-commands-handlers.js';

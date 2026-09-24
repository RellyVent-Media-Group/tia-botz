import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import CharacterAPIClient from '../../shared/character-api-client.js';
import { initializeDatabase, getOrCreateUser, getOrCreateSession, updateSession, checkDailyLimit, logPrompt, logAnalytics, logEngagement, getUserStats } from '../../shared/database.js';
import http from 'http';

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

// Initialize database - use /tmp for Railway/ephemeral storage, or local path for development
const dbPath = process.env.DATABASE_PATH || (process.env.NODE_ENV === 'production' ? '/tmp/chiefpilot.db' : './bots/shared/chiefpilot.db');
initializeDatabase(dbPath);

// Bot commands registry
const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),
  new SlashCommandBuilder()
    .setName('character')
    .setDescription('Get character information')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Character name to search for')
        .setRequired(false)),
  new SlashCommandBuilder()
    .setName('random')
    .setDescription('Get a random character'),
  new SlashCommandBuilder()
    .setName('prompt')
    .setDescription('Generate a creative prompt')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Topic for the prompt')
        .setRequired(false)),
  new SlashCommandBuilder()
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
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your subscription status'),
  new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Subscribe to premium features'),
  new SlashCommandBuilder()
    .setName('health')
    .setDescription('Check bot and API health'),
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
  const embed = new EmbedBuilder()
    .setTitle(character.name || 'Unknown Character')
    .setColor(0x0099ff)
    .addFields(
      { name: 'Archetype', value: character.archetype || 'N/A', inline: true },
      { name: 'Entity Type', value: character.entityType || 'N/A', inline: true },
      { name: 'Status', value: character.status || 'N/A', inline: true }
    );

  if (character.description) {
    embed.setDescription(character.description.substring(0, 400));
  }

  if (character.visualSignature) {
    embed.addFields({ name: 'Visual Signature', value: character.visualSignature.substring(0, 300), inline: false });
  }

  return embed;
}

// Command handlers
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    // Get or create user in database
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const user = getOrCreateUser(userId, userName, 'discord');

    // Log engagement
    logEngagement(userId, 'discord', commandName);

    switch (commandName) {
      case 'help':
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle('ChiefPilot Discord Bot Commands')
            .setColor(0x0099ff)
            .addFields(
              { name: '/character [name]', value: 'Get character information', inline: true },
              { name: '/random', value: 'Get a random character', inline: true },
              { name: '/prompt [topic]', value: 'Generate a creative prompt', inline: true },
              { name: '/api', value: 'Query character API (search, random, creators, budget, performance)', inline: true },
              { name: '/status', value: 'Check your subscription status', inline: true },
              { name: '/subscribe', value: 'Subscribe to premium features', inline: true },
              { name: '/health', value: 'Check bot and API health', inline: true }
            )
          ]
        });
        break;

      case 'character':
        const charName = interaction.options.getString('name');
        if (charName) {
          try {
            const character = await characterAPI.searchCharacters(charName);
            if (character && character.length > 0) {
              await interaction.reply({ embeds: [formatCharacterEmbed(character[0])] });
            } else {
              await interaction.reply('Character not found. Try /api search for more options.');
            }
          } catch (error) {
            await interaction.reply('Error searching character. The API may be unavailable.');
          }
        } else {
          await interaction.reply('Please provide a character name using /character name:<name>');
        }
        break;

      case 'random':
        try {
          const character = await characterAPI.getRandomCharacter();
          if (character) {
            await interaction.reply({ embeds: [formatCharacterEmbed(character)] });
          } else {
            await interaction.reply('Could not retrieve a random character.');
          }
        } catch (error) {
          await interaction.reply('Error retrieving random character. The API may be unavailable.');
        }
        break;

      case 'prompt':
        const topic = interaction.options.getString('topic') || 'Gilded Mirrors universe';
        const promptResponse = `Creative prompt for ${topic}: "Describe a scene where a Soul confronts their Shadow in the Temenos, revealing both their deepest fear and their golden shadow virtue."`;
        await interaction.reply(promptResponse);
        logPrompt(userId, topic, promptResponse, 'discord');
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
              await interaction.reply({ embeds: [formatCharacterEmbed(randomChar)] });
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
        break;

      case 'status':
        const stats = getUserStats(userId);
        const statusEmbed = new EmbedBuilder()
          .setTitle('Your Subscription Status')
          .setColor(0x00ff00)
          .addFields(
            { name: 'Tier', value: user.subscriptionTier || 'Free', inline: true },
            { name: 'Prompts Today', value: `${stats.promptsToday} / ${user.subscriptionTier === 'premium' ? '∞' : '5'}`, inline: true },
            { name: 'Total Prompts', value: stats.totalPrompts.toString(), inline: true }
          );
        await interaction.reply({ embeds: [statusEmbed] });
        break;

      case 'subscribe':
        await interaction.reply({
          embeds: [new EmbedBuilder()
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
        break;

      case 'health':
        try {
          const apiHealth = await characterAPI.healthCheck();
          const healthEmbed = new EmbedBuilder()
            .setTitle('System Health')
            .setColor(apiHealth.ok ? 0x00ff00 : 0xff0000)
            .addFields(
              { name: 'Discord Bot', value: '✅ Online', inline: true },
              { name: 'Character API', value: apiHealth.ok ? '✅ Online' : '❌ Offline', inline: true },
              { name: 'Database', value: '✅ Connected', inline: true }
            );
          await interaction.reply({ embeds: [healthEmbed] });
        } catch (error) {
          await interaction.reply('Health check failed: ' + error.message);
        }
        break;

      default:
        await interaction.reply('Unknown command. Use /help for available commands.');
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied) {
      await interaction.reply('An error occurred while processing your command.');
    }
  }
});

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerCommands();
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
      discord: client.isReady() ? 'connected' : 'disconnected'
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

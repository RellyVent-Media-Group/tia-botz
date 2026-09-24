/**
 * Advanced Discord Bot Features
 * 
 * Includes:
 * - Message Components (Buttons, Select Menus)
 * - Modals for complex input
 * - Autocomplete for slash commands
 * - Context menu commands
 * - Persistent view components
 * - Ephemeral responses
 * - Deferred replies
 * - Follow-up messages
 * 
 * Usage: Import and register these commands alongside basic commands
 */

import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  SelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits
} from 'discord.js';

// ============================================================================
// ADVANCED SLASH COMMANDS
// ============================================================================

/**
 * Generate command - Creates content with options
 * Features: Autocomplete, modals, buttons
 */
export const generateCommand = new SlashCommandBuilder()
  .setName('generate')
  .setDescription('Generate content using AI')
  .addStringOption(option =>
    option
      .setName('type')
      .setDescription('Type of content to generate')
      .setRequired(true)
      .addChoices(
        { name: 'Story', value: 'story' },
        { name: 'Dialogue', value: 'dialogue' },
        { name: 'Character Profile', value: 'profile' },
        { name: 'World Lore', value: 'lore' },
        { name: 'Quest', value: 'quest' }
      ))
  .addStringOption(option =>
    option
      .setName('character')
      .setDescription('Character to use (autocomplete)')
      .setRequired(false)
      .setAutocomplete(true))
  .addIntegerOption(option =>
    option
      .setName('length')
      .setDescription('Length of generation (words)')
      .setRequired(false)
      .addChoices(
        { name: 'Short (100)', value: 100 },
        { name: 'Medium (300)', value: 300 },
        { name: 'Long (500)', value: 500 },
        { name: 'Epic (1000)', value: 1000 }
      ))
  .addBooleanOption(option =>
    option
      .setName('private')
      .setDescription('Make response visible only to you')
      .setRequired(false))
  .setDMPermission(false);

/**
 * Configure command - Settings for the bot
 * Features: Select menus, buttons for configuration
 */
export const configureCommand = new SlashCommandBuilder()
  .setName('configure')
  .setDescription('Configure bot settings for this server')
  .addSubcommand(subcommand =>
    subcommand
      .setName('notifications')
      .setDescription('Configure notification settings')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel for notifications')
          .setRequired(false))
      .addBooleanOption(option =>
        option
          .setName('enabled')
          .setDescription('Enable notifications')
          .setRequired(false)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('prefix')
      .setDescription('Set command prefix for text commands')
      .addStringOption(option =>
        option
          .setName('prefix')
          .setDescription('The prefix character(s)')
          .setRequired(true)))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

/**
 * Character builder command - Create new characters
 * Features: Modal for complex input
 */
export const createCharacterCommand = new SlashCommandBuilder()
  .setName('create-character')
  .setDescription('Create a new character for the database')
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('Character name')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('archetype')
      .setDescription('Character archetype')
      .setRequired(false)
      .setAutocomplete(true))
  .setDMPermission(true);

/**
 * Poll command - Create interactive polls
 * Features: Buttons for voting
 */
export const pollCommand = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a poll with multiple options')
  .addStringOption(option =>
    option
      .setName('question')
      .setDescription('The poll question')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('option1')
      .setDescription('First option')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('option2')
      .setDescription('Second option')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('option3')
      .setDescription('Third option')
      .setRequired(false))
  .addStringOption(option =>
    option
      .setName('option4')
      .setDescription('Fourth option')
      .setRequired(false))
  .addBooleanOption(option =>
    option
      .setName('multiple')
      .setDescription('Allow multiple selections')
      .setRequired(false))
  .setDMPermission(false);

/**
 * Quiz command - Interactive quiz
 * Features: Multiple choice with buttons
 */
export const quizCommand = new SlashCommandBuilder()
  .setName('quiz')
  .setDescription('Start a character knowledge quiz')
  .addStringOption(option =>
    option
      .setName('topic')
      .setDescription('Quiz topic')
      .setRequired(false)
      .addChoices(
        { name: 'Characters', value: 'characters' },
        { name: 'Archetypes', value: 'archetypes' },
        { name: 'Lore', value: 'lore' },
        { name: 'All', value: 'all' }
      ))
  .addIntegerOption(option =>
    option
      .setName('questions')
      .setDescription('Number of questions')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(20))
  .setDMPermission(true);

// ============================================================================
// CONTEXT MENU COMMANDS
// ============================================================================

/**
 * Context menu: Show character info from message
 */
export const characterInfoContextCommand = new ContextMenuCommandBuilder()
  .setName('Get Character Info')
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

/**
 * Context menu: Translate message
 */
export const translateContextCommand = new ContextMenuCommandBuilder()
  .setName('Translate')
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

/**
 * Context menu: Save to database
 */
export const saveToDatabaseContextCommand = new ContextMenuCommandBuilder()
  .setName('Save to Database')
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

// ============================================================================
// HELPER FUNCTIONS FOR BUTTONS AND COMPONENTS
// ============================================================================

/**
 * Create a confirmation button row
 */
export function createConfirmationButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_yes')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('confirm_no')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
    );
}

/**
 * Create a pagination button row
 */
export function createPaginationButtons(currentPage, totalPages) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`page_first`)
        .setLabel('<<')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1),
      new ButtonBuilder()
        .setCustomId(`page_prev_${currentPage}`)
        .setLabel('<')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1),
      new ButtonBuilder()
        .setCustomId('page_current')
        .setLabel(`${currentPage}/${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`page_next_${currentPage}`)
        .setLabel('>')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages),
      new ButtonBuilder()
        .setCustomId(`page_last_${totalPages}`)
        .setLabel('>>')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages)
    );
}

/**
 * Create character selection menu
 */
export function createCharacterSelectMenu(characters, customId = 'character_select') {
  return new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder('Select a character...')
        .addOptions(
          characters.slice(0, 25).map(char => ({
            label: char.name || char.id,
            value: char.id || char.name,
            description: char.archetype || char.description?.substring(0, 50)
          }))
        )
        .setMinValues(1)
        .setMaxValues(1)
    );
}

/**
 * Create multi-select menu for tags
 */
export function createTagSelectMenu(availableTags, selectedTags = [], customId = 'tag_select') {
  return new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder('Select tags...')
        .addOptions(
          availableTags.map(tag => ({
            label: tag,
            value: tag,
            default: selectedTags.includes(tag)
          }))
        )
        .setMinValues(0)
        .setMaxValues(availableTags.length)
    );
}

/**
 * Create action buttons for a character embed
 */
export function createCharacterActionButtons(characterId) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`character_info_${characterId}`)
        .setLabel('Info')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📄'),
      new ButtonBuilder()
        .setCustomId(`character_prompt_${characterId}`)
        .setLabel('Generate')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✨'),
      new ButtonBuilder()
        .setCustomId(`character_share_${characterId}`)
        .setLabel('Share')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔗'),
      new ButtonBuilder()
        .setURL(`https://example.com/characters/${characterId}`)
        .setLabel('View Online')
        .setStyle(ButtonStyle.Link)
        .setEmoji('🌐')
    );
}

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

/**
 * Create character creation modal
 */
export function createCharacterModal() {
  const modal = new ModalBuilder()
    .setCustomId('character_creation_modal')
    .setTitle('Create New Character');

  // Name field
  const nameInput = new TextInputBuilder()
    .setCustomId('character_name')
    .setLabel('Character Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder('Enter character name')
    .setMaxLength(100);

  // Description field
  const descriptionInput = new TextInputBuilder()
    .setCustomId('character_description')
    .setLabel('Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setPlaceholder('Detailed description of the character...')
    .setMaxLength(1000);

  // Archetype field
  const archetypeInput = new TextInputBuilder()
    .setCustomId('character_archetype')
    .setLabel('Archetype')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('e.g., Digital Storyteller, Shadow Runner')
    .setMaxLength(50);

  // Visual signature field
  const visualInput = new TextInputBuilder()
    .setCustomId('character_visual')
    .setLabel('Visual Signature')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('Physical appearance and style')
    .setMaxLength(200);

  // Rarity field
  const rarityInput = new TextInputBuilder()
    .setCustomId('character_rarity')
    .setLabel('Rarity')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('Common, Rare, Epic, Legendary')
    .setValue('Common');

  // Add all fields to modal
  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(archetypeInput),
    new ActionRowBuilder().addComponents(rarityInput),
    new ActionRowBuilder().addComponents(visualInput),
    new ActionRowBuilder().addComponents(descriptionInput)
  );

  return modal;
}

/**
 * Create prompt generation modal
 */
export function createPromptModal(context = '') {
  const modal = new ModalBuilder()
    .setCustomId('prompt_generation_modal')
    .setTitle('Generate Custom Prompt');

  // Topic field
  const topicInput = new TextInputBuilder()
    .setCustomId('prompt_topic')
    .setLabel('Topic')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder('What should the prompt be about?')
    .setValue(context);

  // Style field
  const styleInput = new TextInputBuilder()
    .setCustomId('prompt_style')
    .setLabel('Style')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('e.g., Cinematic, Poetic, Technical')
    .setMaxLength(50);

  // Length field
  const lengthInput = new TextInputBuilder()
    .setCustomId('prompt_length')
    .setLabel('Length (words)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('100-1000')
    .setValue('300');

  // Context field
  const contextInput = new TextInputBuilder()
    .setCustomId('prompt_context')
    .setLabel('Additional Context')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setPlaceholder('Any additional information for the AI...')
    .setMaxLength(500);

  // Add all fields to modal
  modal.addComponents(
    new ActionRowBuilder().addComponents(topicInput),
    new ActionRowBuilder().addComponents(styleInput),
    new ActionRowBuilder().addComponents(lengthInput),
    new ActionRowBuilder().addComponents(contextInput)
  );

  return modal;
}

/**
 * Create feedback modal
 */
export function createFeedbackModal(commandName = '') {
  const modal = new ModalBuilder()
    .setCustomId('feedback_modal')
    .setTitle('Provide Feedback');

  // Command field
  const commandInput = new TextInputBuilder()
    .setCustomId('feedback_command')
    .setLabel('Command')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(commandName)
    .setMaxLength(50);

  // Rating field
  const ratingInput = new TextInputBuilder()
    .setCustomId('feedback_rating')
    .setLabel('Rating (1-5)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder('1-5')
    .setMaxLength(1);

  // Feedback field
  const feedbackInput = new TextInputBuilder()
    .setCustomId('feedback_text')
    .setLabel('Feedback')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setPlaceholder('What did you think? How can we improve?')
    .setMaxLength(1000);

  // Add all fields to modal
  modal.addComponents(
    new ActionRowBuilder().addComponents(commandInput),
    new ActionRowBuilder().addComponents(ratingInput),
    new ActionRowBuilder().addComponents(feedbackInput)
  );

  return modal;
}

// ============================================================================
// EMBED BUILDERS
// ============================================================================

/**
 * Create a character profile embed
 */
export function createCharacterProfileEmbed(character, includeImage = true) {
  const embed = new EmbedBuilder()
    .setTitle(`${character.name} ${character.rarity ? `(${character.rarity})` : ''}`)
    .setColor(getRarityColor(character.rarity))
    .setDescription(character.description || 'No description available.');

  if (character.archetype) {
    embed.addFields({ name: 'Archetype', value: character.archetype, inline: true });
  }
  if (character.entityType) {
    embed.addFields({ name: 'Entity Type', value: character.entityType, inline: true });
  }
  if (character.status) {
    embed.addFields({ name: 'Status', value: character.status, inline: true });
  }
  if (character.visualSignature) {
    embed.addFields({ name: 'Visual Signature', value: character.visualSignature, inline: false });
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

  // Add image if available
  if (includeImage && character.imageUrl) {
    embed.setImage(character.imageUrl);
  }

  embed.setTimestamp();
  embed.setFooter({ text: `ID: ${character.id}` });

  return embed;
}

/**
 * Create a poll embed
 */
export function createPollEmbed(question, options, votes = {}, authorId) {
  const embed = new EmbedBuilder()
    .setTitle(`Poll: ${question}`)
    .setColor(0x0099ff)
    .setAuthor({ name: `Created by <@${authorId}>`, iconURL: 'https://cdn.discordapp.com/emojis/741868961323679844.png' });

  // Add each option with vote count
  options.forEach((option, index) => {
    const voteCount = votes[option] || 0;
    const percentage = options.length > 0 ? Math.round((voteCount / Math.max(...Object.values(votes), 1)) * 100) : 0;
    const progressBar = getProgressBar(percentage);
    embed.addFields({ 
      name: `Option ${index + 1}: ${option}`, 
      value: `${progressBar} ${voteCount} votes (${percentage}%)`, 
      inline: false 
    });
  });

  embed.setTimestamp();
  return embed;
}

/**
 * Create a quiz question embed
 */
export function createQuizEmbed(question, options, questionNum, totalQuestions) {
  const embed = new EmbedBuilder()
    .setTitle(`Question ${questionNum}/${totalQuestions}`)
    .setColor(0xff9900)
    .setDescription(`**${question.text}**`);

  options.forEach((option, index) => {
    embed.addFields({ 
      name: `${index + 1}. ${option}`, 
      value: '', 
      inline: false 
    });
  });

  embed.setFooter({ text: 'Select your answer below' });
  return embed;
}

/**
 * Create a quiz result embed
 */
export function createQuizResultEmbed(score, totalQuestions, timeTaken) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const grade = getGrade(percentage);

  return new EmbedBuilder()
    .setTitle('Quiz Results')
    .setColor(getGradeColor(grade))
    .setDescription(`You scored **${score}/${totalQuestions} (${percentage}%)**`)
    .addFields(
      { name: 'Grade', value: grade, inline: true },
      { name: 'Time', value: `${timeTaken} seconds`, inline: true }
    )
    .setTimestamp();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color based on rarity
 */
export function getRarityColor(rarity) {
  const colors = {
    'Common': 0x999999,
    'Uncommon': 0x00ff00,
    'Rare': 0x0000ff,
    'Epic': 0xaa00aa,
    'Legendary': 0xffd700,
    'Mythic': 0xff00ff
  };
  return colors[rarity] || 0x0099ff;
}

/**
 * Get grade based on percentage
 */
function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D';
  return 'F';
}

/**
 * Get color based on grade
 */
function getGradeColor(grade) {
  if (grade.startsWith('A')) return 0x00ff00;
  if (grade.startsWith('B')) return 0x0000ff;
  if (grade.startsWith('C')) return 0xffff00;
  if (grade.startsWith('D')) return 0xff9900;
  return 0xff0000;
}

/**
 * Create a progress bar
 */
function getProgressBar(percentage) {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'-'.repeat(empty)}]`;
}

/**
 * Generate a unique ID for a poll
 */
export function generatePollId() {
  return `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for a quiz
 */
export function generateQuizId() {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format characters for autocomplete
 */
export function formatCharactersForAutocomplete(characters) {
  return characters.map(char => ({
    name: char.name || `Character ${char.id}`,
    value: char.id || char.name
  }));
}

/**
 * Extract autocomplete focus value
 */
export function getAutocompleteFocus(interaction) {
  const focusedOption = interaction.options.getFocused(true);
  return focusedOption?.value || '';
}

// ============================================================================
// EXPORT ALL COMMANDS
// ============================================================================

export const advancedSlashCommands = [
  generateCommand,
  configureCommand,
  createCharacterCommand,
  pollCommand,
  quizCommand
];

export const advancedContextCommands = [
  characterInfoContextCommand,
  translateContextCommand,
  saveToDatabaseContextCommand
];

export const allAdvancedCommands = [
  ...advancedSlashCommands,
  ...advancedContextCommands
];

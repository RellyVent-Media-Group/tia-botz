/**
 * Advanced Discord Bot Command Handlers
 * 
 * Handles interactions for:
 * - Buttons
 * - Select Menus
 * - Modals
 * - Autocomplete
 * 
 * This file contains the actual logic for handling advanced component interactions
 */

import { 
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder
} from 'discord.js';
import { 
  createCharacterModal,
  createPromptModal,
  createFeedbackModal,
  createPollEmbed,
  createQuizEmbed,
  createQuizResultEmbed,
  createCharacterProfileEmbed,
  createConfirmationButtons,
  createPaginationButtons,
  createCharacterSelectMenu,
  createCharacterActionButtons,
  generatePollId,
  generateQuizId,
  getRarityColor
} from './advanced-commands.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Poll state storage
 * @type {Map<string, {question: string, options: string[], votes: Record<string, string[]>, multiple: boolean, authorId: string, timestamp: number}>}
 */
const activePolls = new Map();

/**
 * Quiz state storage
 * @type {Map<string, {questions: Array<{text: string, options: string[], answer: number}>, current: number, answers: number[], score: number, startTime: number, authorId: string}>}
 */
const activeQuizzes = new Map();

/**
 * Pending confirmations storage
 * @type {Map<string, {userId: string, callback: Function, timeout: NodeJS.Timeout}>}
 */
const pendingConfirmations = new Map();

// ============================================================================
// BUTTON HANDLERS
// ============================================================================

/**
 * Handle button interactions
 */
export async function handleButtonInteraction(interaction) {
  if (!interaction.isButton()) return false;

  const { customId, user } = interaction;

  try {
    // Poll voting buttons
    if (customId.startsWith('poll_vote_')) {
      return await handlePollVote(interaction);
    }

    // Quiz answer buttons
    if (customId.startsWith('quiz_answer_')) {
      return await handleQuizAnswer(interaction);
    }

    // Pagination buttons
    if (customId.startsWith('page_')) {
      return await handlePagination(interaction);
    }

    // Confirmation buttons
    if (customId === 'confirm_yes' || customId === 'confirm_no') {
      return await handleConfirmation(interaction);
    }

    // Character action buttons
    if (customId.startsWith('character_')) {
      return await handleCharacterAction(interaction);
    }

    // Feedback button
    if (customId === 'feedback_button') {
      return await handleFeedbackButton(interaction);
    }

    return false;
  } catch (error) {
    console.error('Error handling button interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred while processing your button click.', ephemeral: true });
    }
    return true;
  }
}

/**
 * Handle poll voting
 */
async function handlePollVote(interaction) {
  const [, pollId, optionIndex] = interaction.customId.split('_');
  const poll = activePolls.get(pollId);

  if (!poll) {
    await interaction.reply({ content: 'This poll has expired.', ephemeral: true });
    return true;
  }

  const option = poll.options[parseInt(optionIndex)];
  if (!option) {
    await interaction.reply({ content: 'Invalid option.', ephemeral: true });
    return true;
  }

  // Check if user already voted
  const hasVoted = poll.votes[option]?.includes(interaction.user.id);
  
  if (hasVoted && !poll.multiple) {
    await interaction.reply({ content: 'You have already voted in this poll.', ephemeral: true });
    return true;
  }

  // Record vote
  if (!poll.votes[option]) {
    poll.votes[option] = [];
  }
  
  // Remove previous vote if multiple is false
  if (!poll.multiple) {
    for (const opt of poll.options) {
      if (opt !== option) {
        poll.votes[opt] = poll.votes[opt]?.filter(id => id !== interaction.user.id) || [];
      }
    }
  }
  
  // Add new vote
  if (!poll.votes[option].includes(interaction.user.id)) {
    poll.votes[option].push(interaction.user.id);
  }

  // Update the poll message
  const embed = createPollEmbed(poll.question, poll.options, poll.votes, poll.authorId);
  const row = createPollButtons(pollId, poll.options, poll.multiple);
  
  await interaction.update({
    embeds: [embed],
    components: [row]
  });

  return true;
}

/**
 * Handle quiz answer
 */
async function handleQuizAnswer(interaction) {
  const [, quizId, answerIndex] = interaction.customId.split('_');
  const quiz = activeQuizzes.get(quizId);

  if (!quiz) {
    await interaction.reply({ content: 'This quiz has expired.', ephemeral: true });
    return true;
  }

  const questionIndex = quiz.current;
  const question = quiz.questions[questionIndex];
  
  if (!question) {
    await interaction.reply({ content: 'Invalid question.', ephemeral: true });
    return true;
  }

  const selectedAnswer = parseInt(answerIndex);
  const isCorrect = selectedAnswer === question.answer;
  
  // Record answer
  quiz.answers[questionIndex] = selectedAnswer;
  
  if (isCorrect) {
    quiz.score++;
    await interaction.reply({ content: '✅ Correct!', ephemeral: true });
  } else {
    await interaction.reply({ content: `❌ Wrong! The correct answer was option ${question.answer + 1}.`, ephemeral: true });
  }

  // Move to next question or show results
  quiz.current++;
  
  if (quiz.current < quiz.questions.length) {
    // Next question
    const nextQuestion = quiz.questions[quiz.current];
    const embed = createQuizEmbed(
      nextQuestion,
      nextQuestion.options,
      quiz.current + 1,
      quiz.questions.length
    );
    const row = createQuizAnswerButtons(quizId, nextQuestion.options);
    
    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  } else {
    // Quiz complete
    const timeTaken = Math.floor((Date.now() - quiz.startTime) / 1000);
    const embed = createQuizResultEmbed(quiz.score, quiz.questions.length, timeTaken);
    
    await interaction.editReply({
      embeds: [embed],
      components: []
    });
    
    // Clean up
    activeQuizzes.delete(quizId);
  }

  return true;
}

/**
 * Handle pagination
 */
async function handlePagination(interaction) {
  const { customId } = interaction;
  let pageNum = 1;

  if (customId.startsWith('page_next_')) {
    pageNum = parseInt(customId.split('_')[2]) + 1;
  } else if (customId.startsWith('page_prev_')) {
    pageNum = parseInt(customId.split('_')[2]) - 1;
  } else if (customId.startsWith('page_first')) {
    pageNum = 1;
  } else if (customId.startsWith('page_last')) {
    const totalPages = parseInt(customId.split('_')[2]);
    pageNum = totalPages;
  }

  // Get the original message components
  const originalMessage = await interaction.channel.messages.fetch(interaction.message.id);
  const originalEmbed = originalMessage.embeds[0];
  
  // Update pagination buttons
  const totalPages = 10; // This should be dynamic based on actual data
  const row = createPaginationButtons(pageNum, totalPages);
  
  // Update the message
  await interaction.update({
    embeds: [originalEmbed],
    components: [row]
  });

  return true;
}

/**
 * Handle confirmation
 */
async function handleConfirmation(interaction) {
  const { customId, user } = interaction;
  const isConfirmed = customId === 'confirm_yes';

  // Find pending confirmation for this user
  const confirmation = Array.from(pendingConfirmations.entries())
    .find(([id, conf]) => conf.userId === user.id);

  if (!confirmation) {
    await interaction.reply({ content: 'This confirmation has expired.', ephemeral: true });
    return true;
  }

  const [confirmationId, conf] = confirmation;
  
  // Execute callback
  if (conf.callback) {
    conf.callback(isConfirmed, interaction);
  }
  
  // Clean up
  clearTimeout(conf.timeout);
  pendingConfirmations.delete(confirmationId);

  return true;
}

/**
 * Handle character actions
 */
async function handleCharacterAction(interaction) {
  const { customId } = interaction;
  const [, action, characterId] = customId.split('_');

  switch (action) {
    case 'info':
      await interaction.reply({
        content: `Fetching info for character ${characterId}...`,
        ephemeral: true
      });
      break;
    case 'prompt':
      await interaction.showModal(createPromptModal(characterId));
      break;
    case 'share':
      await interaction.reply({
        content: `Share link for character ${characterId}: https://example.com/characters/${characterId}`,
        ephemeral: true
      });
      break;
    default:
      await interaction.reply({ content: 'Unknown character action.', ephemeral: true });
  }

  return true;
}

/**
 * Handle feedback button
 */
async function handleFeedbackButton(interaction) {
  await interaction.showModal(createFeedbackModal());
  return true;
}

// ============================================================================
// SELECT MENU HANDLERS
// ============================================================================

/**
 * Handle select menu interactions
 */
export async function handleSelectMenuInteraction(interaction) {
  if (!interaction.isStringSelectMenu()) return false;

  const { customId, values, user } = interaction;

  try {
    // Character selection
    if (customId.startsWith('character_select')) {
      return await handleCharacterSelection(interaction);
    }

    // Tag selection
    if (customId.startsWith('tag_select')) {
      return await handleTagSelection(interaction);
    }

    // Role selection
    if (customId.startsWith('role_select')) {
      return await handleRoleSelection(interaction);
    }

    return false;
  } catch (error) {
    console.error('Error handling select menu interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred while processing your selection.', ephemeral: true });
    }
    return true;
  }
}

/**
 * Handle character selection
 */
async function handleCharacterSelection(interaction) {
  const selectedId = interaction.values[0];
  
  await interaction.reply({
    content: `You selected character: ${selectedId}`,
    ephemeral: true
  });
  
  return true;
}

/**
 * Handle tag selection
 */
async function handleTagSelection(interaction) {
  const selectedTags = interaction.values;
  
  await interaction.reply({
    content: `You selected tags: ${selectedTags.join(', ')}`,
    ephemeral: true
  });
  
  return true;
}

/**
 * Handle role selection
 */
async function handleRoleSelection(interaction) {
  const selectedRole = interaction.values[0];
  
  await interaction.reply({
    content: `You selected role: ${selectedRole}`,
    ephemeral: true
  });
  
  return true;
}

// ============================================================================
// MODAL HANDLERS
// ============================================================================

/**
 * Handle modal submissions
 */
export async function handleModalSubmit(interaction) {
  if (!interaction.isModalSubmit()) return false;

  const { customId, fields } = interaction;

  try {
    switch (customId) {
      case 'character_creation_modal':
        return await handleCharacterCreationModal(interaction, fields);
      case 'prompt_generation_modal':
        return await handlePromptGenerationModal(interaction, fields);
      case 'feedback_modal':
        return await handleFeedbackModal(interaction, fields);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error handling modal submission:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your submission.', ephemeral: true });
    }
    return true;
  }
}

/**
 * Handle character creation modal
 */
async function handleCharacterCreationModal(interaction, fields) {
  const name = fields.getTextInputValue('character_name');
  const description = fields.getTextInputValue('character_description');
  const archetype = fields.getTextInputValue('character_archetype');
  const visual = fields.getTextInputValue('character_visual');
  const rarity = fields.getTextInputValue('character_rarity');

  // Here you would save to database or API
  // For now, just show a preview
  const embed = new EmbedBuilder()
    .setTitle(`New Character: ${name}`)
    .setColor(getRarityColor(rarity))
    .addFields(
      { name: 'Archetype', value: archetype || 'N/A', inline: true },
      { name: 'Rarity', value: rarity || 'Common', inline: true },
      { name: 'Visual', value: visual || 'N/A', inline: false },
      { name: 'Description', value: description || 'No description', inline: false }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });

  return true;
}

/**
 * Handle prompt generation modal
 */
async function handlePromptGenerationModal(interaction, fields) {
  const topic = fields.getTextInputValue('prompt_topic');
  const style = fields.getTextInputValue('prompt_style');
  const length = fields.getTextInputValue('prompt_length');
  const context = fields.getTextInputValue('prompt_context');

  // Generate a mock prompt (in production, call your AI API)
  const generatedPrompt = `Generate a ${style || 'creative'} ${topic} story. Length: ${length || 300} words. ${context || 'Make it engaging and original.'}`;

  const embed = new EmbedBuilder()
    .setTitle('Generated Prompt')
    .setColor(0x0099ff)
    .setDescription(generatedPrompt)
    .addFields(
      { name: 'Topic', value: topic, inline: true },
      { name: 'Style', value: style || 'N/A', inline: true },
      { name: 'Length', value: length ? `${length} words` : 'Default', inline: true }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });

  return true;
}

/**
 * Handle feedback modal
 */
async function handleFeedbackModal(interaction, fields) {
  const command = fields.getTextInputValue('feedback_command');
  const rating = fields.getTextInputValue('feedback_rating');
  const feedback = fields.getTextInputValue('feedback_text');

  // Here you would save feedback to database or analytics service
  const embed = new EmbedBuilder()
    .setTitle('Thank You for Your Feedback!')
    .setColor(0x00ff00)
    .setDescription(`Your feedback has been recorded.`)
    .addFields(
      { name: 'Command', value: command, inline: true },
      { name: 'Rating', value: `${rating}/5`, inline: true },
      { name: 'Feedback', value: feedback, inline: false }
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });

  return true;
}

// ============================================================================
// AUTOCOMPLETE HANDLERS
// ============================================================================

/**
 * Handle autocomplete interactions
 */
export async function handleAutocomplete(interaction) {
  if (!interaction.isAutocomplete()) return false;

  const { commandName, options } = interaction;

  try {
    // Character name autocomplete
    if (commandName === 'generate' || commandName === 'create-character') {
      return await handleCharacterAutocomplete(interaction);
    }

    // Archetype autocomplete
    if (commandName === 'create-character') {
      const focusedOption = options.getFocused(true);
      if (focusedOption.name === 'archetype') {
        return await handleArchetypeAutocomplete(interaction);
      }
    }

    return false;
  } catch (error) {
    console.error('Error handling autocomplete:', error);
    return false;
  }
}

/**
 * Handle character name autocomplete
 */
async function handleCharacterAutocomplete(interaction) {
  const focusedValue = interaction.options.getFocused(true).value;
  
  // Mock character data - in production, fetch from API
  const mockCharacters = [
    { id: '1', name: 'Mary Magnumbytes', archetype: 'Digital Storyteller' },
    { id: '2', name: 'Mac Nazarene', archetype: 'Tech Prophet' },
    { id: '3', name: 'Shadow Runner', archetype: 'Espionage Specialist' },
    { id: '4', name: 'Data Weaver', archetype: 'Information Architect' },
    { id: '5', name: 'Code Sage', archetype: 'Master Programmer' },
    { id: '6', name: 'Pixel Artist', archetype: 'Visual Creator' },
    { id: '7', name: 'System Guardian', archetype: 'Security Expert' },
    { id: '8', name: 'Logic Oracle', archetype: 'Strategic Thinker' },
  ];

  // Filter characters based on input
  const filtered = mockCharacters.filter(char => 
    char.name.toLowerCase().includes(focusedValue.toLowerCase())
  );

  // Limit to 25 results (Discord limit)
  const choices = filtered.slice(0, 25).map(char => ({
    name: char.name,
    value: char.name
  }));

  await interaction.respond(choices);
  return true;
}

/**
 * Handle archetype autocomplete
 */
async function handleArchetypeAutocomplete(interaction) {
  const focusedValue = interaction.options.getFocused(true).value;
  
  // Mock archetypes
  const archetypes = [
    'Digital Storyteller',
    'Tech Prophet',
    'Espionage Specialist',
    'Information Architect',
    'Master Programmer',
    'Visual Creator',
    'Security Expert',
    'Strategic Thinker',
    'AI Researcher',
    'Data Scientist'
  ];

  // Filter archetypes
  const filtered = archetypes.filter(arch => 
    arch.toLowerCase().includes(focusedValue.toLowerCase())
  );

  const choices = filtered.slice(0, 25).map(arch => ({
    name: arch,
    value: arch
  }));

  await interaction.respond(choices);
  return true;
}

// ============================================================================
// COMMAND EXECUTORS
// ============================================================================

/**
 * Execute generate command
 */
export async function executeGenerateCommand(interaction) {
  const type = interaction.options.getString('type');
  const character = interaction.options.getString('character');
  const length = interaction.options.getInteger('length') || 300;
  const isPrivate = interaction.options.getBoolean('private') || false;

  // Check if character is specified and needs modal
  if (!character) {
    // Show modal for more details
    await interaction.showModal(createPromptModal(type));
    return;
  }

  // Generate content (mock for now)
  const content = `Generated ${type} about ${character} (${length} words). This is a placeholder.`;

  await interaction.reply({
    content,
    ephemeral: isPrivate
  });
}

/**
 * Execute configure command
 */
export async function executeConfigureCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'notifications':
      await configureNotifications(interaction);
      break;
    case 'prefix':
      await configurePrefix(interaction);
      break;
    default:
      await interaction.reply({ content: 'Unknown configuration option.', ephemeral: true });
  }
}

/**
 * Configure notifications
 */
async function configureNotifications(interaction) {
  const channel = interaction.options.getChannel('channel');
  const enabled = interaction.options.getBoolean('enabled');

  const embed = new EmbedBuilder()
    .setTitle('Notification Settings')
    .setColor(0x0099ff)
    .addFields(
      { name: 'Channel', value: channel ? channel.name : 'Current channel', inline: true },
      { name: 'Enabled', value: enabled ? 'Yes' : 'No', inline: true }
    );

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}

/**
 * Configure prefix
 */
async function configurePrefix(interaction) {
  const prefix = interaction.options.getString('prefix');

  await interaction.reply({
    content: `Prefix set to: **${prefix}**`,
    ephemeral: true
  });
}

/**
 * Execute create-character command
 */
export async function executeCreateCharacterCommand(interaction) {
  const name = interaction.options.getString('name');
  const archetype = interaction.options.getString('archetype');

  // If archetype is provided but we want more details, show modal
  if (name) {
    // Show modal for full character creation
    await interaction.showModal(createCharacterModal());
    return;
  }

  // Otherwise show error
  await interaction.reply({
    content: 'Please provide a character name.',
    ephemeral: true
  });
}

/**
 * Execute poll command
 */
export async function executePollCommand(interaction) {
  const question = interaction.options.getString('question');
  const options = [
    interaction.options.getString('option1'),
    interaction.options.getString('option2'),
    interaction.options.getString('option3'),
    interaction.options.getString('option4')
  ].filter(Boolean);

  const multiple = interaction.options.getBoolean('multiple') || false;

  if (options.length < 2) {
    await interaction.reply({
      content: 'You need at least 2 options for a poll.',
      ephemeral: true
    });
    return;
  }

  // Create poll
  const pollId = generatePollId();
  const votes = {};
  options.forEach(opt => votes[opt] = []);

  activePolls.set(pollId, {
    question,
    options,
    votes,
    multiple,
    authorId: interaction.user.id,
    timestamp: Date.now()
  });

  // Create embed and buttons
  const embed = createPollEmbed(question, options, votes, interaction.user.id);
  const row = createPollButtons(pollId, options, multiple);

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Execute quiz command
 */
export async function executeQuizCommand(interaction) {
  const topic = interaction.options.getString('topic') || 'all';
  const numQuestions = interaction.options.getInteger('questions') || 5;

  // Generate mock questions
  const questions = generateQuizQuestions(topic, numQuestions);

  if (questions.length === 0) {
    await interaction.reply({
      content: 'No questions available for this topic.',
      ephemeral: true
    });
    return;
  }

  // Create quiz
  const quizId = generateQuizId();
  activeQuizzes.set(quizId, {
    questions,
    current: 0,
    answers: [],
    score: 0,
    startTime: Date.now(),
    authorId: interaction.user.id
  });

  // Show first question
  const firstQuestion = questions[0];
  const embed = createQuizEmbed(
    firstQuestion,
    firstQuestion.options,
    1,
    questions.length
  );
  const row = createQuizAnswerButtons(quizId, firstQuestion.options);

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Generate quiz questions based on topic
 */
function generateQuizQuestions(topic, count) {
  const allQuestions = {
    characters: [
      {
        text: 'Who is the Digital Storyteller?',
        options: ['Mary Magnumbytes', 'Mac Nazarene', 'Shadow Runner', 'Data Weaver'],
        answer: 0
      },
      {
        text: 'Which character is known as the Tech Prophet?',
        options: ['Mary Magnumbytes', 'Mac Nazarene', 'Code Sage', 'System Guardian'],
        answer: 1
      }
    ],
    archetypes: [
      {
        text: 'What is Mary Magnumbytes\'s archetype?',
        options: ['Digital Storyteller', 'Tech Prophet', 'Security Expert', 'Visual Creator'],
        answer: 0
      }
    ],
    lore: [
      {
        text: 'What is the name of the universe in the Gilded Mirrors?',
        options: ['Temenos', 'Cosmos', 'Aion', 'Pleroma'],
        answer: 0
      }
    ],
    all: [
      {
        text: 'Who is the Digital Storyteller?',
        options: ['Mary Magnumbytes', 'Mac Nazarene', 'Shadow Runner', 'Data Weaver'],
        answer: 0
      },
      {
        text: 'What is Mary Magnumbytes\'s archetype?',
        options: ['Digital Storyteller', 'Tech Prophet', 'Security Expert', 'Visual Creator'],
        answer: 0
      },
      {
        text: 'What is the name of the universe in the Gilded Mirrors?',
        options: ['Temenos', 'Cosmos', 'Aion', 'Pleroma'],
        answer: 0
      }
    ]
  };

  const selectedQuestions = allQuestions[topic] || allQuestions.all;
  return shuffleArray(selectedQuestions).slice(0, count);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create poll buttons
 */
function createPollButtons(pollId, options, multiple) {
  const row = new ActionRowBuilder();
  
  options.forEach((option, index) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`poll_vote_${pollId}_${index}`)
        .setLabel(option.substring(0, 80))
        .setStyle(ButtonStyle.Secondary)
    );
  });

  return row;
}

/**
 * Create quiz answer buttons
 */
function createQuizAnswerButtons(quizId, options) {
  const row = new ActionRowBuilder();
  
  options.forEach((option, index) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`quiz_answer_${quizId}_${index}`)
        .setLabel(option.substring(0, 80))
        .setStyle(ButtonStyle.Primary)
    );
  });

  return row;
}

/**
 * Request confirmation from user
 */
export function requestConfirmation(interaction, question, callback) {
  const embed = new EmbedBuilder()
    .setTitle('Confirmation Required')
    .setColor(0xff9900)
    .setDescription(question);

  const row = createConfirmationButtons();

  interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });

  // Set timeout for confirmation
  const confirmationId = `conf_${Date.now()}`;
  const timeout = setTimeout(() => {
    pendingConfirmations.delete(confirmationId);
    interaction.editReply({
      content: 'Confirmation timed out.',
      embeds: [],
      components: []
    });
  }, 60000); // 60 seconds

  pendingConfirmations.set(confirmationId, {
    userId: interaction.user.id,
    callback,
    timeout
  });
}

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Clean up expired polls and quizzes
 */
export function cleanupExpiredSessions() {
  const now = Date.now();

  // Clean up polls older than 7 days
  for (const [pollId, poll] of activePolls.entries()) {
    if (now - poll.timestamp > 7 * 24 * 60 * 60 * 1000) {
      activePolls.delete(pollId);
    }
  }

  // Clean up pending confirmations older than 1 minute
  for (const [confId, conf] of pendingConfirmations.entries()) {
    if (now - conf.timestamp > 60 * 1000) {
      clearTimeout(conf.timeout);
      pendingConfirmations.delete(confId);
    }
  }
}

/**
 * Get active poll by ID
 */
export function getActivePoll(pollId) {
  return activePolls.get(pollId);
}

/**
 * Get active quiz by ID
 */
export function getActiveQuiz(quizId) {
  return activeQuizzes.get(quizId);
}

// ============================================================================
// EXPORT ALL HANDLERS
// ============================================================================

export const advancedHandlers = {
  handleButtonInteraction,
  handleSelectMenuInteraction,
  handleModalSubmit,
  handleAutocomplete,
  executeGenerateCommand,
  executeConfigureCommand,
  executeCreateCharacterCommand,
  executePollCommand,
  executeQuizCommand,
  requestConfirmation,
  cleanupExpiredSessions
};

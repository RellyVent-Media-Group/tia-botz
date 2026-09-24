# Advanced Discord Bot Features

This directory contains advanced Discord bot features that extend the basic functionality with interactive components.

## Features Included

### 1. Message Components
- **Buttons**: Interactive buttons for voting, navigation, and actions
- **Select Menus**: Dropdown menus for single and multi-selection
- **Modals**: Form-based input for complex data collection

### 2. Advanced Slash Commands

#### `/generate`
- Generate content using AI
- Options:
  - `type`: Story, Dialogue, Character Profile, World Lore, or Quest
  - `character`: Autocomplete-enabled character selection
  - `length`: Word count (100, 300, 500, 1000)
  - `private`: Make response ephemeral (visible only to you)
- Features: Opens modal for detailed input when needed

#### `/configure`
- Server configuration settings
- Subcommands:
  - `notifications`: Set up notification channel and toggle
  - `prefix`: Set command prefix for text commands
- Requires: Manage Guild permission

#### `/create-character`
- Create new characters for the database
- Opens modal with fields for:
  - Name (required)
  - Archetype (autocomplete)
  - Description
  - Visual Signature
  - Rarity

#### `/poll`
- Create interactive polls with multiple options
- Options:
  - `question`: The poll question
  - `option1-4`: Poll options (2-4 required)
  - `multiple`: Allow multiple selections
- Features: Real-time vote counting with progress bars

#### `/quiz`
- Start a character knowledge quiz
- Options:
  - `topic`: Characters, Archetypes, Lore, or All
  - `questions`: Number of questions (1-20)
- Features: Multiple choice with instant feedback, scoring, and timing

### 3. Context Menu Commands
- **Get Character Info**: Extract character info from messages
- **Translate**: Translate message content
- **Save to Database**: Save message content to database

### 4. Helper Functions

#### Button Components
- `createConfirmationButtons()`: Yes/No confirmation buttons
- `createPaginationButtons(currentPage, totalPages)`: Page navigation buttons
- `createCharacterActionButtons(characterId)`: Character-specific action buttons

#### Select Menu Components
- `createCharacterSelectMenu(characters, customId)`: Character selection dropdown
- `createTagSelectMenu(availableTags, selectedTags, customId)`: Multi-select tag menu

#### Modal Components
- `createCharacterModal()`: Character creation form
- `createPromptModal(context)`: Prompt generation form
- `createFeedbackModal(commandName)`: Feedback submission form

#### Embed Builders
- `createCharacterProfileEmbed(character)`: Rich character profile display
- `createPollEmbed(question, options, votes, authorId)`: Poll display with results
- `createQuizEmbed(question, options, questionNum, totalQuestions)`: Quiz question display
- `createQuizResultEmbed(score, totalQuestions, timeTaken)`: Quiz results summary

## Usage

### Importing in index.js

```javascript
import {
  allAdvancedCommands,
  advancedHandlers
} from './advanced-commands.js';

// Register commands
const commands = [
  ...basicCommands,
  ...allAdvancedCommands
].map(command => command.toJSON());

// Handle interactions
client.on('interactionCreate', async interaction => {
  // Basic command handling
  if (interaction.isChatInputCommand()) {
    // Handle basic commands...
    
    // Handle advanced commands
    if (!handled) {
      handled = await handleAdvancedSlashCommands(interaction);
    }
  }
  
  // Handle component interactions
  if (!handled) {
    handled = await advancedHandlers.handleButtonInteraction(interaction);
  }
  if (!handled) {
    handled = await advancedHandlers.handleSelectMenuInteraction(interaction);
  }
  if (!handled) {
    handled = await advancedHandlers.handleModalSubmit(interaction);
  }
  if (!handled) {
    handled = await advancedHandlers.handleAutocomplete(interaction);
  }
});
```

### Command Registration

When registering commands with the Discord API, include both basic and advanced commands:

```javascript
const allCommands = [
  ...basicCommands,
  ...allAdvancedCommands
];

await rest.put(
  Routes.applicationCommands(clientId),
  { body: allCommands }
);
```

## Architecture

### File Structure
```
bots/discord-bot/src/
├── index.js              # Main bot file with basic commands
├── advanced-commands.js  # Advanced command definitions and UI components
├── advanced-commands-handlers.js  # Interaction handlers for advanced features
└── ADVANCED_FEATURES.md  # This documentation
```

### Data Flow

1. **Command Registration**: Commands are registered with Discord when the bot starts
2. **Interaction Receive**: Discord sends interactions to the bot
3. **Command Handling**: Commands are routed to appropriate handlers
4. **Component Handling**: Button clicks, select menus, and modals trigger specific handlers
5. **State Management**: Active polls, quizzes, and confirmations are stored in memory (with cleanup)
6. **Response**: Bot sends appropriate response (embed, modal, or simple message)

## State Management

### Active Polls
Stored in a Map with structure:
```javascript
{
  question: string,
  options: string[],
  votes: Record<string, string[]>,  // option -> array of user IDs
  multiple: boolean,
  authorId: string,
  timestamp: number
}
```

### Active Quizzes
Stored in a Map with structure:
```javascript
{
  questions: Array<{
    text: string,
    options: string[],
    answer: number
  }>,
  current: number,        // current question index
  answers: number[],      // user's answers
  score: number,         // correct answers count
  startTime: number,     // quiz start timestamp
  authorId: string
}
```

### Pending Confirmations
Stored in a Map with structure:
```javascript
{
  userId: string,
  callback: Function,     // callback(isConfirmed, interaction)
  timeout: NodeJS.Timeout // auto-cleanup timeout
}
```

## Customization

### Adding New Commands
1. Define the command in `advanced-commands.js`
2. Add the handler in `advanced-commands-handlers.js`
3. Export from the appropriate export array
4. Register with Discord API

### Adding New Components
1. Create a builder function in `advanced-commands.js`
2. Add handler logic in `advanced-commands-handlers.js`
3. Update interaction routing

### Adding New Modals
1. Create modal definition in `advanced-commands.js`
2. Add submission handler in `advanced-commands-handlers.js`
3. Show modal from command handler

## Best Practices

1. **Error Handling**: Always catch errors and provide user feedback
2. **Ephemeral Responses**: Use ephemeral for private responses
3. **Deferred Replies**: Use `deferReply()` for long operations
4. **Follow-up Messages**: Use `followUp()` for additional messages
5. **Component IDs**: Use descriptive IDs with prefixes (e.g., `poll_vote_<id>_<option>`)
6. **Cleanup**: Always clean up state (polls, quizzes, confirmations) when done
7. **Validation**: Validate all user input before processing

## Testing

Test each feature:
- Buttons: Click and verify response
- Select Menus: Select options and verify handling
- Modals: Submit and verify data collection
- Autocomplete: Type and verify suggestions appear
- Commands: Execute and verify responses

## Dependencies

These features require:
- `discord.js` v14+
- Node.js 18+
- Discord bot with appropriate permissions and intents

## Discord API Requirements

### Bot Permissions
- `applications.commands` - For slash commands
- `Use Application Commands` - For users to use commands
- `Manage Guild` - For configuration commands (optional)

### Required Intents
- `Guilds`
- `GuildMessages`
- `MessageContent`
- `GuildMembers` (optional, for member-related features)

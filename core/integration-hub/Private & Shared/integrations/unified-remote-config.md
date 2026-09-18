# Unified Remote Voice Command Configuration

## Voice Command Mappings

The integration hub provides predefined voice commands for Unified Remote to control character database access.

## Available Commands

### 1. Get Random Character
**Voice Command**: "random character" or "get random character"
**Action**: Retrieves a random character from the database
**Endpoint**: `GET http://localhost:3000/api/characters/random`
**Method**: GET

### 2. Search Characters
**Voice Command**: "search character {name}" or "find character {name}"
**Action**: Searches for characters by name
**Endpoint**: `GET http://localhost:3000/api/characters/search/{name}`
**Method**: GET
**Parameters**: `{name}` - character name to search

### 3. Get Legendary Characters
**Voice Command**: "show legendary characters" or "legendary characters"
**Action**: Retrieves all legendary rarity characters
**Endpoint**: `GET http://localhost:3000/api/characters?rarity=Legendary`
**Method**: GET

### 4. Get Character Prompts
**Voice Command**: "get prompts for {character name}" or "prompts for {character name}"
**Action**: Retrieves AI image prompts for a specific character
**Endpoint**: `GET http://localhost:3000/api/characters/{id}/prompts`
**Method**: GET
**Parameters**: `{id}` - character ID (needs name-to-ID lookup first)

## Unified Remote Setup Instructions

### Method 1: Using Unified Remote API

**Endpoint**: `GET http://localhost:3000/api/unified-remote/commands`

**Response**:
```json
{
  "commands": [
    {
      "action": "get_random_character",
      "description": "Get a random character prompt",
      "endpoint": "/api/characters/random",
      "method": "GET",
      "voiceCommand": "random character"
    },
    {
      "action": "search_characters",
      "description": "Search for characters by name",
      "endpoint": "/api/characters/search/:name",
      "method": "GET",
      "voiceCommand": "search character {name}"
    }
  ]
}
```

### Method 2: Manual Configuration in Unified Remote

1. **Open Unified Remote app**
2. **Add custom remote**
3. **Configure voice commands**:
   - Command: "random character"
   - Action: HTTP GET to `http://localhost:3000/api/characters/random`
   - Display format: JSON → Show character name

4. **Add search command**:
   - Command: "search character {name}"
   - Action: HTTP GET to `http://localhost:3000/api/characters/search/{name}`
   - Display format: JSON → Show results list

5. **Add rarity filter**:
   - Command: "show legendary characters"
   - Action: HTTP GET to `http://localhost:3000/api/characters?rarity=Legendary`
   - Display format: JSON → Show list

### Method 3: Import Configuration

Create a JSON configuration file for Unified Remote:

```json
{
  "remoteName": "Character Database Hub",
  "commands": [
    {
      "id": "cmd_random_char",
      "name": "Random Character",
      "voiceCommand": "random character",
      "action": {
        "type": "http",
        "method": "GET",
        "url": "http://localhost:3000/api/characters/random",
        "parseResponse": true,
        "displayField": "name"
      }
    },
    {
      "id": "cmd_search_char",
      "name": "Search Character",
      "voiceCommand": "search character {name}",
      "action": {
        "type": "http",
        "method": "GET",
        "url": "http://localhost:3000/api/characters/search/{name}",
        "parseResponse": true,
        "displayField": "data"
      }
    },
    {
      "id": "cmd_legendary",
      "name": "Legendary Characters",
      "voiceCommand": "show legendary characters",
      "action": {
        "type": "http",
        "method": "GET",
        "url": "http://localhost:3000/api/characters?rarity=Legendary",
        "parseResponse": true,
        "displayField": "data"
      }
    }
  ]
}
```

## Voice Command Examples

### Basic Commands
- "random character" → Returns a random character
- "search character Mary" → Searches for "Mary"
- "show legendary characters" → Shows all legendary characters

### Advanced Commands
- "get prompts for character 1" → Gets prompts for character ID 1
- "search character digital" → Searches for "digital" in character names
- "show rare characters" → Shows rare characters (modify URL to ?rarity=Rare)

## Response Handling

### Display Options

**Character Name Only**:
```json
{
  "displayField": "name"
}
```

**Full Character Data**:
```json
{
  "displayField": "data",
  "format": "full"
}
```

**Custom Format**:
```json
{
  "displayField": "data",
  "format": "custom",
  "template": "{name} - {archetype} - {rarity}"
}
```

## Integration with Other Voice Assistants

### Siri Shortcuts
1. Create Siri Shortcut for each command
2. Use voice phrase to trigger
3. Shortcut calls hub endpoint
4. Display result on device

### Google Assistant
1. Use IFTTT or similar service
2. Create webhook trigger
3. Connect to hub endpoint
4. Voice command triggers webhook

### Amazon Alexa
1. Create Alexa Skill
2. Use HTTP endpoint
3. Map voice intents to hub endpoints
4. Return spoken response

## Troubleshooting

### Voice Recognition Issues
- Ensure clear pronunciation
- Check microphone settings
- Train voice recognition if available
- Use alternative command phrases

### Connection Errors
- Verify hub is running: `http://localhost:3000/health`
- Check network connectivity
- Ensure firewall allows localhost connections
- Verify Unified Remote has network permissions

### Response Parsing
- Verify JSON response format
- Check display field configuration
- Test endpoint manually first
- Use logging to debug response handling

## Advanced Features

### Command Chaining
Combine multiple commands:
1. "search character Mary"
2. "get prompts for [result ID]"
3. "save to favorites"

### Custom Actions
Add custom actions to commands:
- Save character to list
- Generate AI image from prompt
- Share character via email
- Add to calendar/event

### Multi-Language Support
Configure voice commands in multiple languages:
- English: "random character"
- Spanish: "personaje aleatorio"
- French: "personnage aléatoire"

## Security Considerations

- Voice commands only work locally
- No authentication required for basic commands
- Consider adding API keys for sensitive operations
- Use HTTPS in production environments
- Log voice command usage for audit

## Performance Optimization

- Cache frequently accessed characters
- Use pagination for large result sets
- Implement rate limiting for voice commands
- Optimize response size for mobile devices

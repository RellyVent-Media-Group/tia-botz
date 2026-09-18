# Character Database Integration Hub

Universal integration hub for the character database that supports multiple automation and productivity platforms.

## Supported Platforms

- **Apple Shortcuts/Automator** - Webhook-based character retrieval
- **iHosts** - Local hosts file management for development
- **Unified Remote** - Voice command integration for character access
- **Requestly** - HTTP request interception and modification rules
- **Network Toolbox** - Network diagnostics and API monitoring
- **Notion** - Database synchronization and schema management

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

### Environment Variables (Optional)

```bash
# For Notion integration
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id

# Custom port (default: 3000)
INTEGRATION_PORT=3000
```

## API Endpoints

### Character Data API

- `GET /api/characters` - Get all characters (with optional filters)
- `GET /api/characters/:id` - Get specific character by ID
- `GET /api/characters/search/:name` - Search characters by name
- `GET /api/characters/random` - Get a random character
- `GET /api/characters/:id/prompts` - Get character prompts only

### Webhook Endpoints

- `POST /webhook/shortcuts/search` - Apple Shortcuts search webhook
- `POST /webhook/shortcuts/batch` - Batch character requests

### Platform Integrations

- `POST /api/notion/sync` - Sync characters to Notion database
- `GET /api/notion/schema` - Get Notion database schema template
- `GET /api/ihosts/entries` - Get hosts file entries
- `GET /api/unified-remote/commands` - Get remote control commands
- `GET /api/requestly/rules` - Get Requestly modification rules
- `GET /api/network/diagnostics` - Network diagnostics

### Utility Endpoints

- `GET /health` - Health check and server status
- `GET /api/docs` - API documentation

## Platform-Specific Setup

### Apple Shortcuts

1. Create a new Shortcut
2. Add "Get Contents of URL" action
3. Set URL to: `http://localhost:3000/webhook/shortcuts/search`
4. Method: POST
5. Headers: `Content-Type: application/json`
6. Request Body: `{"searchTerm": "Mary", "promptType": "hook"}`
7. Parse the JSON response

### Automator

1. Create new Automator workflow
2. Add "Run Shell Script" action
3. Use curl to access endpoints:
```bash
curl -X POST http://localhost:3000/webhook/shortcuts/batch \
  -H "Content-Type: application/json" \
  -d '{"count": 3, "promptType": "branding"}'
```

### iHosts

1. Import hosts entries from `/api/ihosts/entries`
2. Add entries to your local hosts file for local development
3. Entries will redirect `characters.local` to your integration hub

### Unified Remote

1. Import commands from `/api/unified-remote/commands`
2. Set up voice commands for character retrieval
3. Example: "random character" → calls `/api/characters/random`

### Requestly

1. Import rules from `/api/requestly/rules`
2. Rules include API redirects, header modifications, and response transformations
3. Useful for testing and development workflow

### Network Toolbox

1. Use `/api/network/diagnostics` to monitor server health
2. Check endpoint availability and response times
3. Monitor API performance and uptime

### Notion Integration

1. Set up Notion API credentials in environment variables
2. Use `/api/notion/schema` to create the database structure
3. Sync character data using `/api/notion/sync`
4. Characters will be created as pages with proper properties

## Data Format

The integration hub uses the cleaned character data from `characters-cleaned.json`. Each character includes:

```json
{
  "id": 1,
  "name": "Character Name",
  "allocatedBudget": 150000,
  "archetype": "Archetype Name",
  "description": "Character description",
  "entityType": "Primary Character",
  "gender": "Female",
  "rarity": "Legendary",
  "status": "Active",
  "keyToolCategory": ["Category1", "Category2"],
  "prompts": {
    "hook": "Hook prompt text",
    "branding": "Branding prompt text",
    "trust": "Trust prompt text"
  }
}
```

## Filtering Examples

### Get legendary characters only
```
GET /api/characters?rarity=Legendary
```

### Get characters by archetype
```
GET /api/characters?archetype=Digital Storyteller
```

### Get paginated results
```
GET /api/characters?limit=10&offset=0
```

### Multiple filters
```
GET /api/characters?rarity=Legendary&entityType=Primary Character
```

## Development

### Running in development mode with auto-reload
```bash
npm run dev
```

### Testing the integration
```bash
npm test
```

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Set `INTEGRATION_PORT` to a different port
- Ensure Node.js version is >= 18.0.0

### Character data not loading
- Verify `characters-cleaned.json` exists in the same directory
- Check file permissions
- Look for JSON parsing errors in the console

### Notion integration not working
- Verify `NOTION_API_KEY` and `NOTION_DATABASE_ID` are set
- Check that the Notion database exists and is shared with your integration
- Ensure your Notion API key has proper permissions

## License

MIT
# Apple Shortcuts/Automator Integration Guide

## Webhook Endpoints

The integration hub provides webhook endpoints for Apple Shortcuts and Automator:

### 1. Character Search Webhook
**Endpoint**: `POST http://localhost:3000/webhook/shortcuts/search`

**Request Body**:
```json
{
  "searchTerm": "Mary",
  "promptType": "hook"
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "name": "Mary Magnumbytes",
      "prompts": {
        "hook": "Cinematic epic portrait of Mary Magnumbytes..."
      }
    }
  ]
}
```

### 2. Batch Character Request Webhook
**Endpoint**: `POST http://localhost:3000/webhook/shortcuts/batch`

**Request Body**:
```json
{
  "count": 5,
  "promptType": "branding"
}
```

## Shortcuts Setup Instructions

### Method 1: Using Webhooks in Shortcuts

1. **Create a new Shortcut**
2. **Add "Get Contents of URL" action**
   - URL: `http://localhost:3000/webhook/shortcuts/search`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Request Body: 
     ```json
     {
       "searchTerm": "{{Shortcut Input}}",
       "promptType": "hook"
     }
     ```
3. **Add "Get Dictionary from Input" action**
4. **Add "Get Dictionary Value" action** to extract `results`
5. **Add "Repeat with Each"** to process characters
6. **Add "Get Dictionary Value"** for `name` and `prompts`
7. **Add "Show Result"** or save to Notes

### Method 2: Using REST API Calls

**Get Random Character**:
- URL: `http://localhost:3000/api/characters/random`
- Method: GET

**Search Characters**:
- URL: `http://localhost:3000/api/characters/search/{{name}}`
- Method: GET

**Filter by Rarity**:
- URL: `http://localhost:3000/api/characters?rarity=Legendary`
- Method: GET

## Example Shortcuts

### Shortcut 1: Random Character Generator
```
1. Get Contents of URL
   URL: http://localhost:3000/api/characters/random
   Method: GET

2. Get Dictionary from Input

3. Get Dictionary Value: data

4. Get Dictionary Value: name

5. Text: "Random Character: "

6. Combine Text

7. Show Result
```

### Shortcut 2: Character Search
```
1. Ask for Input
   Prompt: "Enter character name"

2. Get Contents of URL
   URL: http://localhost:3000/api/characters/search/{{Input}}
   Method: GET

3. Get Dictionary from Input

4. Get Dictionary Value: data

5. Repeat with Each
   - Get Dictionary Value: name
   - Get Dictionary Value: prompts
   - Show Result
```

### Shortcut 3: Legendary Characters List
```
1. Get Contents of URL
   URL: http://localhost:3000/api/characters?rarity=Legendary
   Method: GET

2. Get Dictionary from Input

3. Get Dictionary Value: data

4. Repeat with Each
   - Get Dictionary Value: name
   - Add to List

5. Show Result
```

## Automator Workflow

### Create a Quick Action (macOS)

1. Open Automator
2. Choose "Quick Action"
3. Add "Get Contents of URL" action
4. Configure with endpoint details
5. Add "Run AppleScript" action to process JSON
6. Save as "Get Random Character"

### Example AppleScript for JSON Processing
```applescript
on run {input, parameters}
    set jsonText to input as string
    tell application "Events"
        set jsonResult to make record with data jsonText
        set characterName to value of record field "name" of jsonResult
        set characterPrompt to value of record field "prompts" of jsonResult
        return characterName & " - " & characterPrompt
    end tell
end run
```

## Voice Control Integration

Create Siri Shortcuts with voice commands:
- "Get random character" → Random Character shortcut
- "Search character [name]" → Character Search shortcut
- "Show legendary characters" → Legendary Characters shortcut

## Troubleshooting

### Connection Issues
- Ensure the integration hub is running: `http://localhost:3000/health`
- Check firewall settings allow localhost connections
- Verify port 3000 is not blocked

### JSON Parsing Errors
- Use "Get Dictionary from Input" before accessing values
- Check response structure using "Show Result" action
- Validate JSON format using online JSON validator

### Performance
- Batch requests return up to 10 characters at once
- Use pagination for large character sets
- Cache results for frequently accessed characters

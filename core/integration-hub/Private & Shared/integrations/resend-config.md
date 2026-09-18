# Resend Email Integration Configuration

## Overview

The integration hub can be configured to send character data and notifications via Resend email service. This integration enables automated email delivery for character prompts, batch exports, and system notifications.

## Resend Integration Endpoints

### 1. Send Character via Email
**Endpoint**: `POST http://localhost:3000/api/resend/send-character`

**Request Body**:
```json
{
  "apiKey": "your_resend_api_key",
  "to": "recipient@example.com",
  "characterId": 1,
  "promptType": "hook"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_1234567890",
  "character": "Mary Magnumbytes",
  "sentAt": "2026-09-17T20:30:10.216Z"
}
```

### 2. Send Batch Characters
**Endpoint**: `POST http://localhost:3000/api/resend/send-batch`

**Request Body**:
```json
{
  "apiKey": "your_resend_api_key",
  "to": "recipient@example.com",
  "characterIds": [1, 2, 3],
  "promptType": "branding"
}
```

**Response**:
```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "messageIds": ["msg_1", "msg_2", "msg_3"]
}
```

### 3. Send Random Character
**Endpoint**: `POST http://localhost:3000/api/resend/send-random`

**Request Body**:
```json
{
  "apiKey": "your_resend_api_key",
  "to": "recipient@example.com",
  "promptType": "trust"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_9876543210",
  "character": "Aaron Starhunter",
  "rarity": "Rare"
}
```

## Resend Setup Instructions

### Step 1: Create Resend Account

1. **Go to Resend**: https://resend.com
2. **Sign up** for an account
3. **Verify your email address**

### Step 2: Get API Key

1. **Go to API Keys**: https://resend.com/api-keys
2. **Create New API Key**:
   - Name: "Character Database Hub"
   - Permissions: Full access or Sending access
3. **Copy the API key** (shown only once)
4. **Store securely** in environment variable

### Step 3: Configure Environment Variables

```bash
# Set Resend API key
export RESEND_API_KEY="re_your_api_key_here"

# Or add to .env file
echo "RESEND_API_KEY=re_your_api_key_here" >> .env
```

### Step 4: Verify Domain (Required for Production)

1. **Go to Domains**: https://resend.com/domains
2. **Add Your Domain**:
   - Enter your domain (e.g., `yourdomain.com`)
   - Verify DNS records (MX, TXT, CNAME)
3. **Wait for verification** (usually within 24 hours)

**For Development**:
- Use `@resend.dev` domain (no verification needed)
- Limited to 300 emails per day
- Perfect for testing

## Email Templates

### Character Email Template

**Subject**: `🎭 Character Prompt: {characterName}`

**Body**:
```html
<h1>🎭 {characterName}</h1>
<p><strong>Rarity:</strong> {rarity}</p>
<p><strong>Archetype:</strong> {archetype}</p>

<h2>Description</h2>
<p>{description}</p>

<h2>Prompt ({promptType})</h2>
<pre>{promptContent}</pre>

<p>
  <em>Sent from Character Database Integration Hub</em>
</p>
```

### Batch Email Template

**Subject**: `📦 Character Batch Export ({count} characters)`

**Body**:
```html
<h1>Character Batch Export</h1>
<p>Here are your requested characters:</p>

<ul>
  {#each character}
  <li>
    <strong>{name}</strong> ({rarity}) - {archetype}
  </li>
  {/each}
</ul>

<p>
  <em>Sent from Character Database Integration Hub</em>
</p>
```

## Usage Examples

### Send Single Character

```bash
curl -X POST http://localhost:3000/api/resend/send-character \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "re_your_api_key",
    "to": "user@example.com",
    "characterId": 1,
    "promptType": "hook"
  }'
```

### Send Random Character

```bash
curl -X POST http://localhost:3000/api/resend/send-random \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "re_your_api_key",
    "to": "user@example.com",
    "promptType": "branding"
  }'
```

### Send Batch Characters

```bash
curl -X POST http://localhost:3000/api/resend/send-batch \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "re_your_api_key",
    "to": "user@example.com",
    "characterIds": [1, 2, 3, 4, 5],
    "promptType": "trust"
  }'
```

## Integration with Hub

### Hub Endpoint Implementation

Add to `universal-integration-hub.mjs`:

```javascript
// Resend email endpoints
app.post('/api/resend/send-character', async (req, res) => {
  const { apiKey, to, characterId, promptType } = req.body;
  
  try {
    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Character Hub <noreply@yourdomain.com>',
        to: to,
        subject: `🎭 Character Prompt: ${character.name}`,
        html: generateCharacterEmail(character, promptType)
      })
    });

    const data = await response.json();
    res.json({
      success: true,
      messageId: data.id,
      character: character.name,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resend/send-random', async (req, res) => {
  const { apiKey, to, promptType } = req.body;
  
  try {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const character = characters[randomIndex];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Character Hub <noreply@yourdomain.com>',
        to: to,
        subject: `🎲 Random Character: ${character.name}`,
        html: generateCharacterEmail(character, promptType)
      })
    });

    const data = await response.json();
    res.json({
      success: true,
      messageId: data.id,
      character: character.name,
      rarity: character.rarity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateCharacterEmail(character, promptType) {
  const prompt = character.prompts?.[promptType] || 'No prompt available';
  
  return `
    <h1>🎭 ${character.name}</h1>
    <p><strong>Rarity:</strong> ${character.rarity || 'Unknown'}</p>
    <p><strong>Archetype:</strong> ${character.archetype || 'Unknown'}</p>
    
    <h2>Description</h2>
    <p>${character.description || 'No description available'}</p>
    
    <h2>Prompt (${promptType})</h2>
    <pre>${prompt}</pre>
    
    <p><em>Sent from Character Database Integration Hub</em></p>
  `;
}
```

## Automation Examples

### Scheduled Character Delivery

```javascript
// daily-character-email.mjs
import fetch from 'node-fetch';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUB_URL = process.env.HUB_URL || 'http://localhost:3000';

async function sendDailyCharacter() {
  try {
    // Get random character from hub
    const characterResponse = await fetch(`${HUB_URL}/api/characters/random`);
    const character = await characterResponse.json();

    // Send via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Character Hub <noreply@yourdomain.com>',
        to: 'subscriber@example.com',
        subject: `🎲 Daily Character: ${character.data.name}`,
        html: generateCharacterEmail(character.data, 'hook')
      })
    });

    console.log('Daily character sent successfully');
  } catch (error) {
    console.error('Failed to send daily character:', error);
  }
}

sendDailyCharacter();
```

### Webhook-Triggered Email

```javascript
// Add to hub
app.post('/webhook/resend/character', async (req, res) => {
  const { to, characterId, promptType } = req.body;
  
  try {
    const character = characters.find(c => c.id === characterId);
    
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Character Hub <noreply@yourdomain.com>',
        to: to,
        subject: `🎭 Character: ${character.name}`,
        html: generateCharacterEmail(character, promptType)
      })
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Error Handling

### Common Errors

**Invalid API Key**:
```json
{
  "error": "Invalid API key",
  "solution": "Verify RESEND_API_KEY is correct"
}
```

**Domain Not Verified**:
```json
{
  "error": "Domain not verified",
  "solution": "Verify your domain in Resend dashboard or use @resend.dev"
}
```

**Rate Limit Exceeded**:
```json
{
  "error": "Rate limit exceeded",
  "solution": "Wait before sending more emails or upgrade your plan"
}
```

**Invalid Email Address**:
```json
{
  "error": "Invalid email address",
  "solution": "Verify recipient email format"
}
```

## Security Best Practices

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Use separate keys for dev/prod

2. **Email Validation**:
   - Validate recipient email addresses
   - Implement rate limiting
   - Add unsubscribe links
   - Comply with email regulations (CAN-SPAM, GDPR)

3. **Content Security**:
   - Sanitize email content
   - Validate character data
   - Avoid HTML injection
   - Use secure email templates

## Monitoring and Logging

### Track Email Delivery

```javascript
async function trackEmailDelivery(messageId) {
  try {
    const response = await fetch(`https://api.resend.com/emails/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      }
    });
    
    const data = await response.json();
    console.log('Email status:', data);
  } catch (error) {
    console.error('Failed to track email:', error);
  }
}
```

### Log Email Events

```javascript
function logEmailEvent(event, data) {
  console.log({
    timestamp: new Date(),
    event: event,
    messageId: data.message_id,
    recipient: data.to,
    status: data.status
  });
}
```

## Webhooks for Email Events

Configure Resend webhooks to track email delivery:

```javascript
app.post('/webhook/resend/events', async (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'email.delivered':
      console.log('Email delivered:', data.message_id);
      break;
    case 'email.opened':
      console.log('Email opened:', data.message_id);
      break;
    case 'email.clicked':
      console.log('Email clicked:', data.message_id);
      break;
    case 'email.bounced':
      console.log('Email bounced:', data.message_id);
      break;
  }
  
  res.json({ received: true });
});
```

## Quick Start Script

```bash
#!/bin/bash
# test-resend-integration.sh

echo "Testing Resend integration..."

# Check environment variables
if [ -z "$RESEND_API_KEY" ]; then
  echo "Error: RESEND_API_KEY must be set"
  exit 1
fi

# Send test email
curl -X POST http://localhost:3000/api/resend/send-random \
  -H "Content-Type: application/json" \
  -d "{
    \"apiKey\": \"$RESEND_API_KEY\",
    \"to\": \"test@example.com\",
    \"promptType\": \"hook\"
  }"

echo "Test email sent!"
```

## Troubleshooting

### Email Not Sending

**Check**:
- API key is valid
- Domain is verified (or using @resend.dev)
- Recipient email is valid
- Hub is running

### Delivery Delays

**Check**:
- Resend service status
- Rate limits
- Email queue size
- Network connectivity

### Bounced Emails

**Check**:
- Recipient email exists
- Domain is valid
- Spam filters
- Email content compliance

## Integration Complete

The Resend email integration is now configured and can:
- Send single characters via email
- Send random characters
- Send batch character exports
- Track email delivery
- Handle email events via webhooks
- Integrate with scheduled tasks and webhooks

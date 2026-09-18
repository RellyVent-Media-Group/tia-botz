# Environment Variables Reference

Complete reference for all environment variables used in the Character Database Integration Hub.

## Core Hub Configuration

### `HUB_URL`
- **Purpose**: Base URL for the integration hub
- **Default**: `http://localhost:3000`
- **Required**: No
- **Used by**: Telegram bot, WhatsApp bot, Resend integration
- **Example**: `HUB_URL=http://localhost:3000`

### `INTEGRATION_PORT`
- **Purpose**: Port number for the integration hub server
- **Default**: `3000`
- **Required**: No
- **Used by**: Integration hub startup script
- **Example**: `INTEGRATION_PORT=3000`

## Telegram Bot

### `TELEGRAM_BOT_TOKEN`
- **Purpose**: API token for Telegram bot authentication
- **Default**: None
- **Required**: Yes (for Telegram bot)
- **How to get**: Message @BotFather on Telegram with `/newbot`
- **Used by**: Telegram bot (`bots/telegram-bot.mjs`)
- **Example**: `TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

## Notion Integration

### `NOTION_API_KEY`
- **Purpose**: API key for Notion integration
- **Default**: None
- **Required**: Yes (for Notion sync)
- **How to get**: Create integration at https://www.notion.so/my-integrations
- **Used by**: Notion sync endpoint
- **Example**: `NOTION_API_KEY=secret_abc123...`

### `NOTION_DATABASE_ID`
- **Purpose**: ID of the Notion database to sync with
- **Default**: None
- **Required**: Yes (for Notion sync)
- **How to get**: From Notion database URL
- **Used by**: Notion sync endpoint
- **Example**: `NOTION_DATABASE_ID=abc123def456`

## Resend Email Integration

### `RESEND_API_KEY`
- **Purpose**: API key for Resend email service
- **Default**: None
- **Required**: Yes (for email features)
- **How to get**: Create API key at https://resend.com/api-keys
- **Used by**: Resend email endpoints
- **Example**: `RESEND_API_KEY=re_abc123...`

## Stripe Integration

### `STRIPE_PAYMENT_LINK`
- **Purpose**: Payment link for Stripe checkout
- **Default**: None
- **Required**: No
- **How to get**: Create payment link in Stripe Dashboard
- **Used by**: Telegram/WhatsApp bot upgrade commands
- **Example**: `STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_link`

## Database Configuration

### `DATABASE_URL`
- **Purpose**: PostgreSQL database connection string
- **Default**: None (uses PGLite if not set)
- **Required**: No
- **Used by**: Main application database
- **Example**: `DATABASE_URL=postgresql://user:password@localhost:5432/dbname`

## Authentication

### `BETTER_AUTH_SECRET`
- **Purpose**: Secret key for Better Auth
- **Default**: None
- **Required**: Yes (if using authentication)
- **How to get**: Generate a random string
- **Used by**: Better Auth middleware
- **Example**: `BETTER_AUTH_SECRET=random_secret_string_here`

### `BETTER_AUTH_URL`
- **Purpose**: Base URL for Better Auth
- **Default**: `http://localhost:8080`
- **Required**: Yes (if using authentication)
- **Used by**: Better Auth configuration
- **Example**: `BETTER_AUTH_URL=http://localhost:8080`

## Development Settings

### `NODE_ENV`
- **Purpose**: Node.js environment mode
- **Default**: `development`
- **Required**: No
- **Used by**: Application configuration
- **Example**: `NODE_ENV=development` or `NODE_ENV=production`

### `LOG_LEVEL`
- **Purpose**: Logging verbosity level
- **Default**: `info`
- **Required**: No
- **Options**: `error`, `warn`, `info`, `debug`
- **Used by**: Logging configuration
- **Example**: `LOG_LEVEL=info`

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong, unique values** for all secrets
3. **Rotate API keys** regularly
4. **Use different values** for development and production
5. **Limit API key permissions** to minimum required
6. **Monitor usage** of all API keys

## Quick Setup Template

```bash
# Core Hub
HUB_URL=http://localhost:3000
INTEGRATION_PORT=3000

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_token_here

# Notion (optional)
NOTION_API_KEY=your_notion_key
NOTION_DATABASE_ID=your_database_id

# Resend (optional)
RESEND_API_KEY=your_resend_key

# Stripe (optional)
STRIPE_PAYMENT_LINK=https://buy.stripe.com/your_link

# Database (optional - uses PGLite if empty)
DATABASE_URL=

# Auth (optional - required if using auth)
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:8080

# Development
NODE_ENV=development
LOG_LEVEL=info
```

## Integration-Specific Variables

| Integration | Variables Required |
|-------------|-------------------|
| Telegram Bot | `TELEGRAM_BOT_TOKEN`, `HUB_URL` |
| WhatsApp Bot | `HUB_URL` |
| Notion | `NOTION_API_KEY`, `NOTION_DATABASE_ID` |
| Resend | `RESEND_API_KEY` |
| Stripe | `STRIPE_PAYMENT_LINK` |
| Authentication | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |

## Testing Configuration

After setting up your `.env` file, run the configuration check:

```bash
./configure-all-integrations.sh
```

This will verify:
- All required files exist
- Integration configuration files are present
- Environment variables are set correctly
- Startup scripts are executable

## Troubleshooting

### Variables Not Loading
- Ensure `.env` file is in the project root
- Check file permissions on `.env`
- Verify variable names match exactly (case-sensitive)

### API Key Issues
- Verify API key format
- Check key hasn't expired
- Ensure key has required permissions
- Test key with provider's API directly

### Port Conflicts
- Change `INTEGRATION_PORT` if 3000 is in use
- Check for other services using the port
- Update `HUB_URL` if changing port

## Additional Resources

- [Integration Hub README](INTEGRATION-HUB-README.md)
- [Integration Summary](integrations/INTEGRATION-SUMMARY.md)
- [Specific Integration Guides](integrations/)

# ChiefPilot Social Media Platform

TypeScript-based social media automation platform with platform adapters and queue-based publishing.

## Overview

This platform provides a unified, type-safe interface for publishing content across multiple social media platforms including Instagram, TikTok, Twitter, Telegram, Discord, YouTube, Facebook, and LinkedIn.

## Architecture

The platform is built on the following principles:

- **Type Safety**: Full TypeScript support with strict type checking
- **Adapter Pattern**: Each platform implements a common `IPlatformAdapter` interface
- **Registry Pattern**: Centralized management of platform adapters
- **Rate Limiting**: Built-in rate limiting with configurable policies
- **Retry Logic**: Exponential backoff for failed operations
- **Extensibility**: Easy to add new platform adapters

## Project Structure

```
social-media-platform/
├── src/
│   ├── types/
│   │   └── platform.ts          # Core type definitions
│   ├── adapters/
│   │   ├── IPlatformAdapter.ts  # Adapter interface
│   │   ├── BasePlatformAdapter.ts # Base adapter implementation
│   │   ├── InstagramAdapter.ts  # Instagram implementation
│   │   └── TikTokAdapter.ts     # TikTok implementation
│   ├── registry/
│   │   └── PlatformRegistry.ts  # Adapter registry
│   ├── index.ts                 # Main exports
│   └── test.ts                  # Test script
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

**Note:** Installation requires sufficient disk space. If you encounter `ENOSPC` errors, clear disk space before running `npm install`.

```bash
cd automation/social-media-platform
npm install
```

## Core Types

### Platform Enum
```typescript
enum Platform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin'
}
```

### ContentType Enum
```typescript
enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
  STORY = 'story',
  REEL = 'reel',
  TEXT = 'text',
  POLL = 'poll',
  LIVE = 'live'
}
```

### PublishStatus Enum
```typescript
enum PublishStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

## Usage

### Register and Use Adapters

```typescript
import { PlatformRegistry } from './registry/PlatformRegistry.js';
import { InstagramAdapter } from './adapters/InstagramAdapter.js';
import { TikTokAdapter } from './adapters/TikTokAdapter.js';

// Get registry instance
const registry = PlatformRegistry.getInstance();

// Register adapters
const instagramAdapter = new InstagramAdapter();
const tiktokAdapter = new TikTokAdapter();

registry.register(instagramAdapter);
registry.register(tiktokAdapter);

// Initialize adapter
await instagramAdapter.initialize({
  platform: Platform.INSTAGRAM,
  apiKey: process.env.INSTAGRAM_API_KEY,
  apiSecret: process.env.INSTAGRAM_API_SECRET
});

// Publish content
const payload = {
  id: 'post-1',
  platform: Platform.INSTAGRAM,
  contentType: ContentType.IMAGE,
  caption: 'Hello from ChiefPilot!',
  hashtags: ['#chiefpilot', '#automation'],
  mediaAssets: [{
    id: 'media-1',
    type: ContentType.IMAGE,
    url: 'https://example.com/image.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    uploadedAt: new Date()
  }]
};

const result = await instagramAdapter.publish(payload);
console.log(`Published: ${result.postUrl}`);
```

### Create Custom Platform Adapter

```typescript
import { BasePlatformAdapter } from './adapters/BasePlatformAdapter.js';
import { Platform, ContentType } from './types/platform.js';

class CustomPlatformAdapter extends BasePlatformAdapter {
  readonly platform = Platform.CUSTOM; // Add to Platform enum first

  getCapabilities() {
    return {
      supportedContentTypes: [ContentType.IMAGE, ContentType.VIDEO],
      supportsScheduling: true,
      supportsAnalytics: true,
      supportsDrafts: false,
      maxMediaCount: 5,
      maxCaptionLength: 500,
      supportsHashtags: true,
      supportsMentions: true,
      supportsLocation: false
    };
  }

  async publish(payload) {
    // Implement platform-specific publishing logic
  }

  async uploadMedia(asset, mimeType) {
    // Implement platform-specific media upload
  }

  async getEngagementMetrics(postId) {
    // Implement platform-specific metrics retrieval
  }
}
```

## Configuration

Environment variables are configured in `.env`:

```env
API_PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://user:password@localhost:5432/chiefpilot_social
INSTAGRAM_API_KEY=your_key
TIKTOK_API_KEY=your_key
# ... other platform credentials
```

## Building

```bash
npm run build
```

## Development

```bash
npm run dev  # Watch mode
npm run typecheck  # Type checking without emitting
npm run lint  # ESLint
```

## Testing

```bash
npm test
```

Or run the test script directly:

```bash
npm run build
node dist/test.js
```

## Integration with Character API

The platform can integrate with the depot automation character API:

```typescript
import CharacterAPIClient from '../../bots/shared/character-api-client.js';

const charClient = new CharacterAPIClient('http://localhost:8001');
const character = await charClient.getCharacter(1);

// Use character data in content payload
const payload = {
  // ... other fields
  character: {
    id: character.data.id,
    name: character.data.name,
    archetype: character.data.archetype,
    rarity: character.data.rarity
  }
};
```

## Next Steps

The foundation is in place. Additional features to implement:

1. **Queue Manager**: BullMQ integration for async publishing
2. **Content Orchestrator**: Multi-platform publishing coordination
3. **Prisma Schema**: Database models for persistence
4. **Fastify API**: REST API endpoints
5. **Redis Integration**: Caching and queue management
6. **Additional Platform Adapters**: Twitter, Discord, YouTube, etc.
7. **Monitoring**: Metrics and logging
8. **Docker/Kubernetes**: Deployment configurations

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use different keys for development and production
- Implement proper secrets management for production deployments

## License

MIT

---

*Generated with [Devin](https://devin.ai)*

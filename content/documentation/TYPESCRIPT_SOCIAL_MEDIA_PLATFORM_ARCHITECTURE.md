# TypeScript Social Media Platform Architecture

**Version:** 1.0
**Last Updated:** 2026-09-22
**Status:** Design Complete

---

## Executive Summary

This document describes the architecture for a scalable, type-safe TypeScript/Node.js social media bot platform. The platform uses a shared adapter pattern to support multiple platforms (Discord, Twitter, Reddit, Telegram, WhatsApp) with unified content orchestration, queue management, and observability.

---

## Technology Stack

### Core Framework
- **Language:** TypeScript 5.x
- **Runtime:** Node.js 22.x
- **Framework:** Fastify (high-performance, plugin-based)
- **Type Safety:** Strict TypeScript with Zod for runtime validation

### Database & Caching
- **ORM:** Prisma (PostgreSQL)
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+ (caching, rate limiting, session management)
- **Queue:** BullMQ (job scheduling, retry logic, dead-letter queues)

### Platform APIs
- **Discord:** Discord.js (library-based)
- **Twitter:** Twitter API v2 (official)
- **Reddit:** Snoowrap (library-based)
- **Telegram:** Telegram Bot API (official)
- **WhatsApp:** WhatsApp Business API (official)

### Observability & Monitoring
- **Logging:** Pino (structured, high-performance)
- **Metrics:** Prometheus (custom metrics)
- **Tracing:** OpenTelemetry (distributed tracing)
- **Health Checks:** Fastify health-check plugin

### Infrastructure
- **Containerization:** Docker (multi-stage builds)
- **Orchestration:** Kubernetes (Helm charts)
- **CI/CD:** GitHub Actions (or GitLab CI)
- **Secrets Management:** HashiCorp Vault or AWS Secrets Manager

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         API Layer                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  REST API    │  │  Webhooks    │  │  GraphQL     │             │
│  │  (Fastify)   │  │  (Fastify)   │  │  (Optional)  │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼────────────────────┐
│         │       Content Orchestration Layer    │                    │
│  ┌──────▼──────┐  ┌──────┬──────┐  ┌────────▼────────┐          │
│  │  Scheduler  │  │ Queue│      │  │ Content         │          │
│  │  (BullMQ)   │  │ Manager   │  │ Transformer     │          │
│  └──────┬──────┘  └──────┴──────┘  └────────┬────────┘          │
└─────────┼────────────────────────────────────┼────────────────────┘
          │                                     │
┌─────────┼─────────────────────────────────────┼────────────────────┐
│         │      Platform Abstraction Layer     │                    │
│  ┌──────▼──────┐  ┌──────┬──────┐  ┌────────▼────────┐          │
│  │   Shared    │  │ Platform│      │  Rate Limiting  │          │
│  │   Adapter   │  │ Registry│      │  (Redis)        │          │
│  └──────┬──────┘  └──────┴──────┘  └────────┬────────┘          │
└─────────┼────────────────────────────────────┼────────────────────┘
          │                                     │
┌─────────┼─────────────────────────────────────┼────────────────────┐
│         │      Platform Adapters              │                    │
│  ┌──────▼──────┐  ┌──────┬──────┐  ┌────────▼────────┐          │
│  │  Discord    │  │Twitter│      │  │  Reddit         │          │
│  │  Adapter    │  │Adapter│      │  │  Adapter        │          │
│  └─────────────┘  └──────┴──────┘  └─────────────────┘          │
│  ┌──────┬──────┐  ┌──────┬──────┐                                      │
│  │Telegram│      │WhatsApp│                                             │
│  │Adapter │      │Adapter │                                             │
│  └───────┴──────┘  └───────┴──────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Design Principles

1. **Single Responsibility:** Each adapter handles one platform only
2. **Type Safety:** All interfaces are strongly typed with TypeScript
3. **Resilience:** Retry logic, circuit breakers, graceful degradation
4. **Observability:** Structured logging, metrics, tracing everywhere
5. **Scalability:** Horizontal scaling, queue-based processing
6. **Maintainability:** Clear interfaces, plugin architecture
7. **Testability:** Dependency injection, mockable interfaces
8. **Security:** Credential rotation, signature verification, rate limiting
9. **Performance:** Connection pooling, caching, batch processing
10. **Flexibility:** Easy to add new platforms without modifying core

---

## Directory Structure

```
social-media-platform/
├── src/
│   ├── core/
│   │   ├── types/
│   │   │   ├── platform.types.ts
│   │   │   ├── content.types.ts
│   │   │   ├── queue.types.ts
│   │   │   └── index.ts
│   │   ├── interfaces/
│   │   │   ├── IPlatformAdapter.ts
│   │   │   ├── IContentTransformer.ts
│   │   │   ├── IRateLimiter.ts
│   │   │   └── IQueueManager.ts
│   │   ├── base/
│   │   │   ├── BasePlatformAdapter.ts
│   │   │   ├── BaseContentTransformer.ts
│   │   │   └── BaseRateLimiter.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── metrics.ts
│   │       ├── validator.ts
│   │       └── errors.ts
│   ├── platforms/
│   │   ├── discord/
│   │   │   ├── DiscordAdapter.ts
│   │   │   ├── DiscordTypes.ts
│   │   │   ├── DiscordRateLimiter.ts
│   │   │   └── index.ts
│   │   ├── twitter/
│   │   │   ├── TwitterAdapter.ts
│   │   │   ├── TwitterTypes.ts
│   │   │   ├── TwitterRateLimiter.ts
│   │   │   └── index.ts
│   │   ├── reddit/
│   │   │   ├── RedditAdapter.ts
│   │   │   ├── RedditTypes.ts
│   │   │   ├── RedditRateLimiter.ts
│   │   │   └── index.ts
│   │   ├── telegram/
│   │   │   ├── TelegramAdapter.ts
│   │   │   ├── TelegramTypes.ts
│   │   │   ├── TelegramRateLimiter.ts
│   │   │   └── index.ts
│   │   ├── whatsapp/
│   │   │   ├── WhatsAppAdapter.ts
│   │   │   ├── WhatsAppTypes.ts
│   │   │   ├── WhatsAppRateLimiter.ts
│   │   │   └── index.ts
│   │   └── registry.ts
│   ├── orchestration/
│   │   ├── QueueManager.ts
│   │   ├── ContentOrchestrator.ts
│   │   ├── Scheduler.ts
│   │   └── RetryHandler.ts
│   ├── api/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── content.routes.ts
│   │   │   ├── platform.routes.ts
│   │   │   ├── health.routes.ts
│   │   │   └── webhook.routes.ts
│   │   └── middleware/
│   │       ├── auth.middleware.ts
│   │       ├── validation.middleware.ts
│   │       └── error.middleware.ts
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── client.ts
│   │   └── repositories/
│   │       ├── ContentRepository.ts
│   │       ├── PlatformRepository.ts
│   │       └── QueueRepository.ts
│   ├── cache/
│   │   ├── RedisClient.ts
│   │   └── CacheManager.ts
│   ├── config/
│   │   ├── index.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── platform.config.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   │   ├── core/
│   │   ├── platforms/
│   │   └── orchestration/
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   └── e2e/
│       └── workflows/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── kubernetes/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── configmap.yaml
├── scripts/
│   ├── migrate.ts
│   ├── seed.ts
│   └── deploy.sh
├── .env.example
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc.js
└── README.md
```

---

## Core Type Definitions

### Platform Types

```typescript
// src/core/types/platform.types.ts

export enum Platform {
  DISCORD = 'discord',
  TWITTER = 'twitter',
  REDDIT = 'reddit',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  POLL = 'poll',
  EMBED = 'embed',
}

export interface PlatformCredentials {
  platform: Platform;
  credentials: Record<string, string>;
  encrypted: boolean;
  expiresAt?: Date;
}

export interface PlatformConfig {
  platform: Platform;
  enabled: boolean;
  rateLimits: RateLimitConfig;
  webhookConfig?: WebhookConfig;
  retryConfig: RetryConfig;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstAllowance: number;
  strategy: 'token-bucket' | 'sliding-window' | 'fixed-window';
}

export interface WebhookConfig {
  enabled: boolean;
  endpoint: string;
  secret: string;
  signatureHeader: string;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}
```

### Content Types

```typescript
// src/core/types/content.types.ts

export interface Content {
  id: string;
  platform: Platform;
  type: ContentType;
  data: ContentData;
  metadata: ContentMetadata;
  status: ContentStatus;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentData {
  text?: string;
  media?: MediaAttachment[];
  embed?: EmbedData;
  poll?: PollData;
  platformSpecific?: Record<string, unknown>;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'audio';
  url: string;
  altText?: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
}

export interface EmbedData {
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  author?: {
    name: string;
    url?: string;
    iconUrl?: string;
  };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  color?: number;
}

export interface PollData {
  question: string;
  options: Array<{ label: string; votes: number }>;
  duration: number; // in seconds
  allowMultipleChoice: boolean;
}

export interface ContentMetadata {
  author: string;
  tags: string[];
  locale: string;
  priority: 'low' | 'normal' | 'high';
  retryCount: number;
  lastError?: string;
}

export enum ContentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  RETRYING = 'retrying',
}
```

### Queue Types

```typescript
// src/core/types/queue.types.ts

export interface QueueJob {
  id: string;
  type: JobType;
  data: JobData;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export enum JobType {
  PUBLISH_CONTENT = 'publish_content',
  DELETE_CONTENT = 'delete_content',
  FETCH_METRICS = 'fetch_metrics',
  SYNC_PLATFORM = 'sync_platform',
  WEBHOOK_PROCESS = 'webhook_process',
}

export interface JobData {
  platform: Platform;
  contentId?: string;
  platformContentId?: string;
  action: JobType;
  payload: Record<string, unknown>;
}

export interface QueueConfig {
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete: number;
    removeOnFail: number;
  };
  connection: {
    host: string;
    port: number;
    db: number;
  };
}
```

---

## Platform Adapter Interface

```typescript
// src/core/interfaces/IPlatformAdapter.ts

import { Platform, Content, ContentData, ContentType } from '../types/platform.types';

export interface IPlatformAdapter {
  /**
   * Initialize the adapter with credentials
   */
  initialize(credentials: Record<string, string>): Promise<void>;

  /**
   * Publish content to the platform
   */
  publish(content: ContentData): Promise<PlatformContentResult>;

  /**
   * Delete content from the platform
   */
  delete(platformContentId: string): Promise<boolean>;

  /**
   * Fetch content metrics
   */
  fetchMetrics(platformContentId: string): Promise<ContentMetrics>;

  /**
   * Validate content for the platform
   */
  validate(content: ContentData): ValidationResult;

  /**
   * Transform content to platform-specific format
   */
  transform(content: ContentData): PlatformSpecificContent;

  /**
   * Handle webhook events from the platform
   */
  handleWebhook(event: WebhookEvent): Promise<void>;

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): RateLimitStatus;

  /**
   * Health check for the adapter
   */
  healthCheck(): Promise<HealthStatus>;
}

export interface PlatformContentResult {
  platformContentId: string;
  url: string;
  publishedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  timestamp: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PlatformSpecificContent {
  [key: string]: unknown;
}

export interface WebhookEvent {
  type: string;
  platform: Platform;
  data: Record<string, unknown>;
  timestamp: Date;
  signature?: string;
}

export interface RateLimitStatus {
  remaining: number;
  resetAt: Date;
  limit: number;
}

export interface HealthStatus {
  healthy: boolean;
  message: string;
  lastChecked: Date;
}
```

---

## Base Platform Adapter

```typescript
// src/core/base/BasePlatformAdapter.ts

import { IPlatformAdapter } from '../interfaces/IPlatformAdapter';
import { PinoLogger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';
import { ContentData, Platform } from '../types/platform.types';

export abstract class BasePlatformAdapter implements IPlatformAdapter {
  protected logger: PinoLogger;
  protected metrics: MetricsCollector;
  protected platform: Platform;
  protected credentials: Record<string, string>;
  protected initialized: boolean = false;

  constructor(platform: Platform, logger: PinoLogger, metrics: MetricsCollector) {
    this.platform = platform;
    this.logger = logger.child({ platform });
    this.metrics = metrics;
  }

  async initialize(credentials: Record<string, string>): Promise<void> {
    this.credentials = credentials;
    await this.connect();
    this.initialized = true;
    this.logger.info('Platform adapter initialized');
  }

  protected abstract connect(): Promise<void>;

  async publish(content: ContentData): Promise<PlatformContentResult> {
    if (!this.initialized) {
      throw new Error('Adapter not initialized');
    }

    const startTime = Date.now();
    try {
      this.logger.info('Publishing content', { type: content.type });

      const validation = this.validate(content);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const transformed = this.transform(content);
      const result = await this.publishToPlatform(transformed);

      this.metrics.increment('bot_sends_total', { platform: this.platform });
      this.metrics.timing('bot_send_duration_seconds', Date.now() - startTime, {
        platform: this.platform,
      });

      this.logger.info('Content published successfully', {
        platformContentId: result.platformContentId,
      });

      return result;
    } catch (error) {
      this.metrics.increment('bot_errors_total', { platform: this.platform });
      this.logger.error('Failed to publish content', { error: error.message });
      throw error;
    }
  }

  protected abstract publishToPlatform(
    content: unknown
  ): Promise<PlatformContentResult>;

  async delete(platformContentId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Adapter not initialized');
    }

    try {
      this.logger.info('Deleting content', { platformContentId });
      const result = await this.deleteFromPlatform(platformContentId);
      this.logger.info('Content deleted successfully', { platformContentId });
      return result;
    } catch (error) {
      this.logger.error('Failed to delete content', { error: error.message });
      throw error;
    }
  }

  protected abstract deleteFromPlatform(platformContentId: string): Promise<boolean>;

  async fetchMetrics(platformContentId: string): Promise<ContentMetrics> {
    if (!this.initialized) {
      throw new Error('Adapter not initialized');
    }

    try {
      this.logger.info('Fetching metrics', { platformContentId });
      const metrics = await this.fetchMetricsFromPlatform(platformContentId);
      this.logger.info('Metrics fetched successfully', { platformContentId });
      return metrics;
    } catch (error) {
      this.logger.error('Failed to fetch metrics', { error: error.message });
      throw error;
    }
  }

  protected abstract fetchMetricsFromPlatform(platformContentId: string): Promise<ContentMetrics>;

  validate(content: ContentData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Base validation
    if (!content.text && !content.media) {
      errors.push('Content must have either text or media');
    }

    if (content.text && content.text.length > this.getMaxTextLength()) {
      errors.push(`Text exceeds maximum length of ${this.getMaxTextLength()}`);
    }

    // Platform-specific validation
    const platformValidation = this.validatePlatformSpecific(content);
    errors.push(...platformValidation.errors);
    warnings.push(...platformValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  protected abstract validatePlatformSpecific(content: ContentData): ValidationResult;

  protected abstract getMaxTextLength(): number;

  transform(content: ContentData): unknown {
    // Base transformation logic
    return {
      text: content.text,
      media: content.media,
      platformSpecific: content.platformSpecific,
    };
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    this.logger.info('Handling webhook', { type: event.type });
    await this.processWebhook(event);
  }

  protected abstract processWebhook(event: WebhookEvent): Promise<void>;

  getRateLimitStatus(): RateLimitStatus {
    // Implement rate limit tracking
    return {
      remaining: 100,
      resetAt: new Date(Date.now() + 60000),
      limit: 100,
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.checkConnection();
      return {
        healthy: true,
        message: 'Adapter is healthy',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Health check failed: ${error.message}`,
        lastChecked: new Date(),
      };
    }
  }

  protected abstract checkConnection(): Promise<void>;
}
```

---

## Platform Registry

```typescript
// src/platforms/registry.ts

import { Platform } from '../core/types/platform.types';
import { IPlatformAdapter } from '../core/interfaces/IPlatformAdapter';
import { DiscordAdapter } from './discord/DiscordAdapter';
import { TwitterAdapter } from './twitter/TwitterAdapter';
import { RedditAdapter } from './reddit/RedditAdapter';
import { TelegramAdapter } from './telegram/TelegramAdapter';
import { WhatsAppAdapter } from './whatsapp/WhatsAppAdapter';

export class PlatformRegistry {
  private adapters: Map<Platform, IPlatformAdapter> = new Map();

  constructor() {
    this.registerAdapters();
  }

  private registerAdapters(): void {
    // Register all platform adapters
    this.adapters.set(Platform.DISCORD, new DiscordAdapter());
    this.adapters.set(Platform.TWITTER, new TwitterAdapter());
    this.adapters.set(Platform.REDDIT, new RedditAdapter());
    this.adapters.set(Platform.TELEGRAM, new TelegramAdapter());
    this.adapters.set(Platform.WHATSAPP, new WhatsAppAdapter());
  }

  getAdapter(platform: Platform): IPlatformAdapter | undefined {
    return this.adapters.get(platform);
  }

  getAllAdapters(): Map<Platform, IPlatformAdapter> {
    return this.adapters;
  }

  getEnabledAdapters(): IPlatformAdapter[] {
    return Array.from(this.adapters.values()).filter((adapter) =>
      this.isAdapterEnabled(adapter)
    );
  }

  private isAdapterEnabled(adapter: IPlatformAdapter): boolean {
    // Check configuration to determine if adapter is enabled
    return true;
  }
}
```

---

## Queue Manager

```typescript
// src/orchestration/QueueManager.ts

import { Queue, Worker, Job } from 'bullmq';
import { PinoLogger } from '../core/utils/logger';
import { MetricsCollector } from '../core/utils/metrics';
import { PlatformRegistry } from '../platforms/registry';
import { JobType, QueueConfig } from '../core/types/queue.types';

export class QueueManager {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private logger: PinoLogger;
  private metrics: MetricsCollector;
  private platformRegistry: PlatformRegistry;

  constructor(
    logger: PinoLogger,
    metrics: MetricsCollector,
    platformRegistry: PlatformRegistry,
    config: QueueConfig
  ) {
    this.logger = logger.child({ component: 'QueueManager' });
    this.metrics = metrics;
    this.platformRegistry = platformRegistry;
    this.initializeQueues(config);
    this.initializeWorkers(config);
  }

  private initializeQueues(config: QueueConfig): void {
    const connection = {
      host: config.connection.host,
      port: config.connection.port,
      db: config.connection.db,
    };

    // Create queues for each job type
    Object.values(JobType).forEach((jobType) => {
      const queue = new Queue(jobType, {
        connection,
        defaultJobOptions: config.defaultJobOptions,
      });

      this.queues.set(jobType, queue);
      this.logger.info('Queue initialized', { jobType });
    });
  }

  private initializeWorkers(config: QueueConfig): void {
    const connection = {
      host: config.connection.host,
      port: config.connection.port,
      db: config.connection.db,
    };

    // Create workers for each job type
    Object.values(JobType).forEach((jobType) => {
      const worker = new Worker(
        jobType,
        async (job: Job) => {
          return this.processJob(job);
        },
        {
          connection,
          concurrency: 5,
        }
      );

      worker.on('completed', (job) => {
        this.logger.info('Job completed', { jobId: job.id, jobType });
        this.metrics.increment('queue_jobs_completed_total', { jobType });
      });

      worker.on('failed', (job, error) => {
        this.logger.error('Job failed', { jobId: job?.id, jobType, error: error.message });
        this.metrics.increment('queue_jobs_failed_total', { jobType });
      });

      this.workers.set(jobType, worker);
      this.logger.info('Worker initialized', { jobType });
    });
  }

  private async processJob(job: Job): Promise<void> {
    const { platform, action, payload } = job.data;

    const adapter = this.platformRegistry.getAdapter(platform);
    if (!adapter) {
      throw new Error(`No adapter found for platform: ${platform}`);
    }

    switch (action) {
      case JobType.PUBLISH_CONTENT:
        await adapter.publish(payload);
        break;
      case JobType.DELETE_CONTENT:
        await adapter.delete(payload.platformContentId);
        break;
      case JobType.FETCH_METRICS:
        await adapter.fetchMetrics(payload.platformContentId);
        break;
      default:
        throw new Error(`Unknown job type: ${action}`);
    }
  }

  async addJob(jobType: JobType, data: unknown, options?: unknown): Promise<void> {
    const queue = this.queues.get(jobType);
    if (!queue) {
      throw new Error(`No queue found for job type: ${jobType}`);
    }

    await queue.add(jobType, data, options);
    this.metrics.increment('queue_jobs_added_total', { jobType });
  }

  async getQueueStats(): Promise<Record<string, unknown>> {
    const stats: Record<string, unknown> = {};

    for (const [jobType, queue] of this.queues) {
      const counts = await queue.getJobCounts();
      stats[jobType] = counts;
    }

    return stats;
  }

  async close(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.close();
    }

    for (const queue of this.queues.values()) {
      await queue.close();
    }

    this.logger.info('Queue manager closed');
  }
}
```

---

## Content Orchestrator

```typescript
// src/orchestration/ContentOrchestrator.ts

import { PinoLogger } from '../core/utils/logger';
import { MetricsCollector } from '../core/utils/metrics';
import { PlatformRegistry } from '../platforms/registry';
import { QueueManager } from './QueueManager';
import { Content, Platform, ContentType, ContentStatus } from '../core/types/platform.types';
import { ContentRepository } from '../database/repositories/ContentRepository';

export class ContentOrchestrator {
  private logger: PinoLogger;
  private metrics: MetricsCollector;
  private platformRegistry: PlatformRegistry;
  private queueManager: QueueManager;
  private contentRepository: ContentRepository;

  constructor(
    logger: PinoLogger,
    metrics: MetricsCollector,
    platformRegistry: PlatformRegistry,
    queueManager: QueueManager,
    contentRepository: ContentRepository
  ) {
    this.logger = logger.child({ component: 'ContentOrchestrator' });
    this.metrics = metrics;
    this.platformRegistry = platformRegistry;
    this.queueManager = queueManager;
    this.contentRepository = contentRepository;
  }

  async scheduleContent(content: Content): Promise<void> {
    this.logger.info('Scheduling content', { contentId: content.id, platform: content.platform });

    // Save content to database
    await this.contentRepository.create(content);

    // Add to queue
    await this.queueManager.addJob('publish_content', {
      platform: content.platform,
      contentId: content.id,
      action: 'publish_content',
      payload: content.data,
    });

    // Update status
    await this.contentRepository.updateStatus(content.id, ContentStatus.SCHEDULED);

    this.metrics.increment('content_scheduled_total', { platform: content.platform });
  }

  async publishContent(content: Content): Promise<void> {
    this.logger.info('Publishing content', { contentId: content.id, platform: content.platform });

    const adapter = this.platformRegistry.getAdapter(content.platform);
    if (!adapter) {
      throw new Error(`No adapter found for platform: ${content.platform}`);
    }

    // Update status to processing
    await this.contentRepository.updateStatus(content.id, ContentStatus.PROCESSING);

    try {
      // Publish to platform
      const result = await adapter.publish(content.data);

      // Update with platform content ID
      await this.contentRepository.updatePlatformContentId(content.id, result.platformContentId);

      // Update status to published
      await this.contentRepository.updateStatus(content.id, ContentStatus.PUBLISHED);

      this.metrics.increment('content_published_total', { platform: content.platform });
    } catch (error) {
      // Update status to failed
      await this.contentRepository.updateStatus(content.id, ContentStatus.FAILED);
      await this.contentRepository.updateError(content.id, error.message);

      this.metrics.increment('content_failed_total', { platform: content.platform });
      throw error;
    }
  }

  async publishToMultiplePlatforms(content: Content, platforms: Platform[]): Promise<void> {
    this.logger.info('Publishing to multiple platforms', {
      contentId: content.id,
      platforms,
    });

    const promises = platforms.map(async (platform) => {
      const platformContent = { ...content, platform };
      await this.scheduleContent(platformContent);
    });

    await Promise.all(promises);
  }

  async fetchContentMetrics(contentId: string): Promise<void> {
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    const adapter = this.platformRegistry.getAdapter(content.platform);
    if (!adapter) {
      throw new Error(`No adapter found for platform: ${content.platform}`);
    }

    const metrics = await adapter.fetchMetrics(content.platformContentId || '');
    await this.contentRepository.updateMetrics(contentId, metrics);
  }
}
```

---

## Prisma Schema

```prisma
// src/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Content {
  id               String    @id @default(cuid())
  platform         Platform
  type             ContentType
  text             String?
  media            Json?
  embed            Json?
  poll             Json?
  platformSpecific Json?
  platformContentId String?  @unique
  status           ContentStatus @default(DRAFT)
  scheduledAt      DateTime?
  publishedAt      DateTime?
  author           String
  tags             String[]
  locale           String    @default("en")
  priority         Priority  @default(NORMAL)
  retryCount       Int       @default(0)
  lastError        String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  metrics          ContentMetric[]

  @@index([platform, status])
  @@index([scheduledAt])
}

model ContentMetric {
  id               String    @id @default(cuid())
  contentId        String
  content          Content   @relation(fields: [contentId], references: [id])
  views            Int       @default(0)
  likes            Int       @default(0)
  shares           Int       @default(0)
  comments         Int       @default(0)
  engagementRate   Float     @default(0)
  timestamp        DateTime  @default(now())

  @@index([contentId])
}

model PlatformCredential {
  id           String   @id @default(cuid())
  platform     Platform
  credentials  Json
  encrypted    Boolean  @default(true)
  expiresAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([platform])
}

model QueueJob {
  id           String   @id @default(cuid())
  type         JobType
  platform     Platform
  contentId    String?
  platformContentId String?
  action       JobType
  payload      Json
  priority     Int      @default(0)
  attempts     Int      @default(0)
  maxAttempts  Int      @default(3)
  createdAt    DateTime @default(now())
  scheduledAt  DateTime?
  processedAt  DateTime?
  completedAt  DateTime?
  failedAt     DateTime?
  error        String?

  @@index([type, status])
  @@index([scheduledAt])
}

enum Platform {
  DISCORD
  TWITTER
  REDDIT
  TELEGRAM
  WHATSAPP
}

enum ContentType {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  POLL
  EMBED
}

enum ContentStatus {
  DRAFT
  SCHEDULED
  QUEUED
  PROCESSING
  PUBLISHED
  FAILED
  RETRYING
}

enum Priority {
  LOW
  NORMAL
  HIGH
}

enum JobType {
  PUBLISH_CONTENT
  DELETE_CONTENT
  FETCH_METRICS
  SYNC_PLATFORM
  WEBHOOK_PROCESS
}
```

---

## Docker Configuration

```dockerfile
# docker/Dockerfile

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/social_media_platform
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=social_media_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Kubernetes Deployment

```yaml
# docker/kubernetes/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: social-media-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: social-media-platform
  template:
    metadata:
      labels:
        app: social-media-platform
    spec:
      containers:
        - name: app
          image: social-media-platform:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## Migration Phases

### Phase 1: Foundation (Week 1-2)
- Set up project structure
- Implement core types and interfaces
- Set up Prisma schema
- Configure Redis and PostgreSQL
- Implement base adapter class

### Phase 2: Platform Adapters (Week 3-5)
- Implement Discord adapter
- Implement Telegram adapter
- Implement Reddit adapter
- Implement Twitter adapter
- Implement WhatsApp adapter

### Phase 3: Orchestration (Week 6-7)
- Implement queue manager with BullMQ
- Implement content orchestrator
- Implement retry handler
- Implement scheduler

### Phase 4: API Layer (Week 8)
- Implement Fastify server
- Implement REST API routes
- Implement webhook handlers
- Implement authentication middleware

### Phase 5: Observability (Week 9)
- Implement Pino logging
- Implement Prometheus metrics
- Implement OpenTelemetry tracing
- Implement health checks

### Phase 6: Deployment (Week 10)
- Docker containerization
- Kubernetes manifests
- CI/CD pipeline
- Production rollout with canary testing

---

## Metrics to Track

### Platform Metrics
- `bot_sends_total` - Total messages sent per platform
- `bot_errors_total` - Total errors per platform
- `bot_send_duration_seconds` - Time to send messages
- `bot_queue_size` - Current queue size per platform
- `bot_platform_health` - Platform health status

### Queue Metrics
- `queue_jobs_added_total` - Total jobs added
- `queue_jobs_completed_total` - Total jobs completed
- `queue_jobs_failed_total` - Total jobs failed
- `queue_job_duration_seconds` - Job processing time

### Content Metrics
- `content_scheduled_total` - Total content scheduled
- `content_published_total` - Total content published
- `content_failed_total` - Total content failed
- `content_engagement_rate` - Average engagement rate

### System Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `database_connections_active` - Active database connections
- `redis_commands_total` - Total Redis commands

---

## Security Considerations

1. **Credential Management**
   - Encrypt all platform credentials at rest
   - Use HashiCorp Vault or AWS Secrets Manager
   - Rotate credentials regularly
   - Implement credential rotation logic

2. **Rate Limiting**
   - Implement per-platform rate limiting
   - Use Redis for distributed rate limiting
   - Respect platform API limits
   - Implement backoff strategies

3. **Webhook Security**
   - Verify webhook signatures
   - Use HMAC for signature verification
   - Implement replay attack prevention
   - Log all webhook events

4. **Input Validation**
   - Validate all input with Zod schemas
   - Sanitize content before publishing
   - Implement content length limits
   - Check for malicious content

5. **Access Control**
   - Implement API authentication
   - Use JWT for API access
   - Implement role-based access control
   - Audit all API access

---

## Testing Strategy

### Unit Tests
- Test all adapter methods
- Test queue manager
- Test content orchestrator
- Test validators
- Test transformers

### Integration Tests
- Test adapter-platform integration
- Test queue-Redis integration
- Test database operations
- Test API endpoints

### End-to-End Tests
- Test content publishing workflow
- Test webhook handling
- Test retry logic
- Test multi-platform publishing

---

## Next Steps

1. **Initialize Project**
   ```bash
   mkdir social-media-platform
   cd social-media-platform
   npm init -y
   npm install typescript @types/node fastify prisma @prisma/client bullmq ioredis pino
   npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier
   npx tsc --init
   ```

2. **Set Up Database**
   ```bash
   npx prisma init
   # Update schema.prisma with the schema above
   npx prisma migrate dev --name init
   ```

3. **Implement Core Types**
   - Create type definitions
   - Create interfaces
   - Create base adapter

4. **Implement First Adapter**
   - Start with Discord adapter
   - Test thoroughly
   - Document patterns

5. **Implement Queue System**
   - Set up BullMQ
   - Implement queue manager
   - Test job processing

6. **Deploy and Monitor**
   - Set up Docker
   - Deploy to Kubernetes
   - Configure monitoring
   - Set up alerts

---

**Architecture Status:** Design Complete
**Ready for Implementation:** Yes
**Estimated Implementation Time:** 10 weeks

---

*Generated with [Devin](https://devin.ai)*

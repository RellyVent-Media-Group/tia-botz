/**
 * Base Platform Adapter
 * Provides common functionality for all platform adapters
 */

import type {
  Platform,
  ContentType,
  PublishStatus,
  ContentPayload,
  PublishResult,
  EngagementMetrics,
  AdapterCapabilities,
  PlatformConfig,
  ScheduleMetadata,
  ErrorMetadata
} from '../types/platform.js';
import type { IPlatformAdapter } from './IPlatformAdapter.js';

/**
 * Abstract base class for platform adapters
 * Implements common functionality and defines the contract for platform-specific implementations
 */
export abstract class BasePlatformAdapter implements IPlatformAdapter {
  protected config: PlatformConfig | null = null;
  protected isInitialized = false;
  protected rateLimitState = {
    requestsThisMinute: 0,
    requestsThisHour: 0,
    lastResetMinute: Date.now(),
    lastResetHour: Date.now()
  };

  /**
   * Platform-specific implementations must provide this
   */
  abstract readonly platform: Platform;
  abstract getCapabilities(): AdapterCapabilities;
  abstract publish(payload: ContentPayload): Promise<PublishResult>;
  abstract uploadMedia(asset: Buffer, mimeType: string): Promise<string>;
  abstract getEngagementMetrics(postId: string): Promise<EngagementMetrics>;

  /**
   * Initialize the adapter with configuration
   */
  async initialize(config: PlatformConfig): Promise<void> {
    this.config = config;
    this.isInitialized = true;
    await this.platformSpecificInit();
  }

  /**
   * Platform-specific initialization hook
   * Override this in subclasses for custom initialization logic
   */
  protected async platformSpecificInit(): Promise<void> {
    // Default: no additional initialization needed
  }

  /**
   * Check if the adapter is properly authenticated and ready
   */
  async healthCheck(): Promise<boolean> {
    return this.isInitialized && this.config !== null;
  }

  /**
   * Validate a content payload before publishing
   */
  async validatePayload(payload: ContentPayload): Promise<void> {
    const capabilities = this.getCapabilities();

    // Check platform matches
    if (payload.platform !== this.platform) {
      throw new Error(`Payload platform ${payload.platform} does not match adapter platform ${this.platform}`);
    }

    // Check content type is supported
    if (!capabilities.supportedContentTypes.includes(payload.contentType)) {
      throw new Error(`Content type ${payload.contentType} is not supported by ${this.platform}`);
    }

    // Check media count limit
    if (payload.mediaAssets.length > capabilities.maxMediaCount) {
      throw new Error(`Too many media assets. Maximum is ${capabilities.maxMediaCount}, got ${payload.mediaAssets.length}`);
    }

    // Check caption length
    if (payload.caption.length > capabilities.maxCaptionLength) {
      throw new Error(`Caption too long. Maximum is ${capabilities.maxCaptionLength}, got ${payload.caption.length}`);
    }

    // Check hashtags support
    if (payload.hashtags.length > 0 && !capabilities.supportsHashtags) {
      throw new Error(`${this.platform} does not support hashtags`);
    }

    // Check mentions support
    if (payload.mentions && payload.mentions.length > 0 && !capabilities.supportsMentions) {
      throw new Error(`${this.platform} does not support mentions`);
    }

    // Check location support
    if (payload.location && !capabilities.supportsLocation) {
      throw new Error(`${this.platform} does not support location tagging`);
    }

    // Validate media assets
    for (const asset of payload.mediaAssets) {
      if (!asset.url && !asset.localPath) {
        throw new Error('Media asset must have either url or localPath');
      }
    }
  }

  /**
   * Schedule content for future publishing
   * Base implementation throws error - platforms must override if they support scheduling
   */
  async schedule(payload: ContentPayload, schedule: ScheduleMetadata): Promise<string> {
    const capabilities = this.getCapabilities();
    if (!capabilities.supportsScheduling) {
      throw new Error(`${this.platform} does not support native scheduling`);
    }

    // Validate the payload first
    await this.validatePayload(payload);

    // Platform-specific scheduling logic
    return this.platformSpecificSchedule(payload, schedule);
  }

  /**
   * Platform-specific scheduling hook
   * Override this in subclasses for custom scheduling logic
   */
  protected async platformSpecificSchedule(payload: ContentPayload, schedule: ScheduleMetadata): Promise<string> {
    throw new Error('platformSpecificSchedule must be implemented by subclass');
  }

  /**
   * Cancel a scheduled post
   * Base implementation throws error - platforms must override if they support scheduling
   */
  async cancelSchedule(scheduleId: string): Promise<boolean> {
    const capabilities = this.getCapabilities();
    if (!capabilities.supportsScheduling) {
      throw new Error(`${this.platform} does not support native scheduling`);
    }

    return this.platformSpecificCancelSchedule(scheduleId);
  }

  /**
   * Platform-specific cancel scheduling hook
   * Override this in subclasses for custom cancel logic
   */
  protected async platformSpecificCancelSchedule(scheduleId: string): Promise<boolean> {
    throw new Error('platformSpecificCancelSchedule must be implemented by subclass');
  }

  /**
   * Get the status of a post
   * Base implementation returns UNKNOWN - platforms should override
   */
  async getPostStatus(postId: string): Promise<PublishStatus> {
    return PublishStatus.PENDING;
  }

  /**
   * Delete a published post
   * Base implementation returns false - platforms should override
   */
  async deletePost(postId: string): Promise<boolean> {
    return false;
  }

  /**
   * Update an existing post
   * Base implementation throws error - platforms should override if they support updates
   */
  async updatePost(postId: string, updates: Partial<ContentPayload>): Promise<PublishResult> {
    throw new Error(`${this.platform} does not support post updates`);
  }

  /**
   * Handle rate limiting and backoff
   */
  async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const rateLimit = this.config?.rateLimit;

    if (!rateLimit) {
      return; // No rate limiting configured
    }

    // Reset minute counter if needed
    if (now - this.rateLimitState.lastResetMinute > 60000) {
      this.rateLimitState.requestsThisMinute = 0;
      this.rateLimitState.lastResetMinute = now;
    }

    // Reset hour counter if needed
    if (now - this.rateLimitState.lastResetHour > 3600000) {
      this.rateLimitState.requestsThisHour = 0;
      this.rateLimitState.lastResetHour = now;
    }

    // Check minute limit
    if (this.rateLimitState.requestsThisMinute >= rateLimit.requestsPerMinute) {
      const waitTime = 60000 - (now - this.rateLimitState.lastResetMinute);
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // Check hour limit
    if (this.rateLimitState.requestsThisHour >= rateLimit.requestsPerHour) {
      const waitTime = 3600000 - (now - this.rateLimitState.lastResetHour);
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // Increment counters
    this.rateLimitState.requestsThisMinute++;
    this.rateLimitState.requestsThisHour++;
  }

  /**
   * Create a publish result for successful operations
   */
  protected createSuccessResult(postId: string, postUrl: string, metadata?: Record<string, unknown>): PublishResult {
    return {
      success: true,
      platform: this.platform,
      postId,
      postUrl,
      publishedAt: new Date(),
      metadata
    };
  }

  /**
   * Create a publish result for failed operations
   */
  protected createErrorResult(error: string, errorCode?: string, metadata?: Record<string, unknown>): PublishResult {
    return {
      success: false,
      platform: this.platform,
      error,
      errorCode,
      metadata
    };
  }

  /**
   * Retry a failed operation with exponential backoff
   */
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelayMs * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Sleep for a specified duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.config = null;
    this.isInitialized = false;
  }
}

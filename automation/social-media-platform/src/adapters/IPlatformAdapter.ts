/**
 * Platform Adapter Interface
 * All platform adapters must implement this interface
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
  ScheduleMetadata
} from '../types/platform.js';

/**
 * Interface for platform-specific adapters
 * Each platform (Instagram, TikTok, Twitter, etc.) implements this interface
 */
export interface IPlatformAdapter {
  /**
   * Get the platform this adapter handles
   */
  readonly platform: Platform;

  /**
   * Initialize the adapter with configuration
   */
  initialize(config: PlatformConfig): Promise<void>;

  /**
   * Check if the adapter is properly authenticated and ready
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get the capabilities of this platform adapter
   */
  getCapabilities(): AdapterCapabilities;

  /**
   * Validate a content payload before publishing
   * @throws Error if the payload is invalid
   */
  validatePayload(payload: ContentPayload): Promise<void>;

  /**
   * Publish content immediately
   */
  publish(payload: ContentPayload): Promise<PublishResult>;

  /**
   * Schedule content for future publishing
   */
  schedule(payload: ContentPayload, schedule: ScheduleMetadata): Promise<string>;

  /**
   * Cancel a scheduled post
   */
  cancelSchedule(scheduleId: string): Promise<boolean>;

  /**
   * Get the status of a post (draft, scheduled, published, etc.)
   */
  getPostStatus(postId: string): Promise<PublishStatus>;

  /**
   * Delete a published post
   */
  deletePost(postId: string): Promise<boolean>;

  /**
   * Update an existing post
   */
  updatePost(postId: string, updates: Partial<ContentPayload>): Promise<PublishResult>;

  /**
   * Fetch engagement metrics for a post
   */
  getEngagementMetrics(postId: string): Promise<EngagementMetrics>;

  /**
   * Upload media assets to the platform
   */
  uploadMedia(asset: Buffer, mimeType: string): Promise<string>;

  /**
   * Handle rate limiting and backoff
   */
  handleRateLimit(): Promise<void>;

  /**
   * Clean up resources
   */
  dispose(): Promise<void>;
}

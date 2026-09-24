/**
 * Core platform type definitions
 * Defines the shared contracts for all platform adapters
 */

/**
 * Supported social media platforms
 */
export enum Platform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin'
}

/**
 * Content types for social media posts
 */
export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
  STORY = 'story',
  REEL = 'reel',
  TEXT = 'text',
  POLL = 'poll',
  LIVE = 'live'
}

/**
 * Publishing status for content
 */
export enum PublishStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Media asset metadata
 */
export interface MediaAsset {
  id: string;
  type: ContentType;
  url: string;
  localPath?: string;
  altText?: string;
  thumbnailUrl?: string;
  duration?: number; // For video in seconds
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

/**
 * Scheduling metadata
 */
export interface ScheduleMetadata {
  scheduledAt: Date;
  timezone: string;
  priority?: 'low' | 'normal' | 'high';
  retryOnFailure?: boolean;
  maxRetries?: number;
}

/**
 * Publishing result
 */
export interface PublishResult {
  success: boolean;
  platform: Platform;
  postId?: string;
  postUrl?: string;
  publishedAt?: Date;
  error?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  platform: Platform;
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  clicks?: number;
  impressions?: number;
  engagementRate?: number;
  collectedAt: Date;
}

/**
 * Error/retry metadata
 */
export interface ErrorMetadata {
  code: string;
  message: string;
  timestamp: Date;
  retryCount: number;
  willRetry: boolean;
  nextRetryAt?: Date;
  context?: Record<string, unknown>;
}

/**
 * Character reference for content
 */
export interface CharacterReference {
  id: string;
  name: string;
  archetype: string;
  rarity: string;
}

/**
 * Content payload for publishing
 */
export interface ContentPayload {
  id: string;
  platform: Platform;
  contentType: ContentType;
  caption: string;
  hashtags: string[];
  mediaAssets: MediaAsset[];
  character?: CharacterReference;
  location?: string;
  mentions?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Platform adapter capabilities
 */
export interface AdapterCapabilities {
  supportedContentTypes: ContentType[];
  supportsScheduling: boolean;
  supportsAnalytics: boolean;
  supportsDrafts: boolean;
  maxMediaCount: number;
  maxCaptionLength: number;
  supportsHashtags: boolean;
  supportsMentions: boolean;
  supportsLocation: boolean;
}

/**
 * Platform configuration
 */
export interface PlatformConfig {
  platform: Platform;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
    exponentialBackoff: boolean;
  };
}

/**
 * ChiefPilot Social Media Platform
 * TypeScript-based social media automation platform
 */

// Export types
export * from './types/platform.js';

// Export adapter interface and base class
export * from './adapters/IPlatformAdapter.js';
export * from './adapters/BasePlatformAdapter.js';

// Export platform adapters
export * from './adapters/InstagramAdapter.js';
export * from './adapters/TikTokAdapter.js';

// Export registry
export * from './registry/PlatformRegistry.js';

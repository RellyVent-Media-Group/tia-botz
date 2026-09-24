/**
 * Platform Registry
 * Manages registration and retrieval of platform adapters
 */

import type { IPlatformAdapter } from '../adapters/IPlatformAdapter.js';
import type { Platform } from '../types/platform.js';

/**
 * Registry for managing platform adapters
 * Provides a centralized way to register and retrieve adapters
 */
export class PlatformRegistry {
  private static instance: PlatformRegistry;
  private adapters: Map<Platform, IPlatformAdapter> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): PlatformRegistry {
    if (!PlatformRegistry.instance) {
      PlatformRegistry.instance = new PlatformRegistry();
    }
    return PlatformRegistry.instance;
  }

  /**
   * Register a platform adapter
   */
  register(adapter: IPlatformAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  /**
   * Unregister a platform adapter
   */
  unregister(platform: Platform): void {
    this.adapters.delete(platform);
  }

  /**
   * Get a platform adapter by platform
   */
  getAdapter(platform: Platform): IPlatformAdapter | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Check if a platform adapter is registered
   */
  hasAdapter(platform: Platform): boolean {
    return this.adapters.has(platform);
  }

  /**
   * Get all registered platforms
   */
  getRegisteredPlatforms(): Platform[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): IPlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Clear all registered adapters
   */
  clear(): void {
    this.adapters.clear();
  }

  /**
   * Get the count of registered adapters
   */
  getAdapterCount(): number {
    return this.adapters.size;
  }
}

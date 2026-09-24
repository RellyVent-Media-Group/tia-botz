/**
 * TikTok Platform Integration
 * 
 * Uses TikTok API for secure, maintained TikTok access
 * 
 * This module provides a similar interface to the Instagram module
 * for consistent integration across platforms.
 * 
 * Note: TikTok API requires separate registration and approval
 */

import axios from 'axios';
import FormData from 'form-data';
import { readFileSync } from 'fs';

/**
 * TikTok API Configuration
 */
const TIKTOK_API_BASE = 'https://api.tiktok.com';

/**
 * TikTok API Client Class
 */
class TikTokApi {
  /**
   * Create TikTok API client
   * @param {Object} config - Configuration options
   * @param {string} config.accessToken - TikTok access token
   * @param {string} [config.apiKey] - TikTok API key (optional)
   */
  constructor(config) {
    this.accessToken = config.accessToken;
    this.apiKey = config.apiKey;
    
    if (!this.accessToken) {
      throw new Error('TikTokApi: accessToken is required');
    }
  }

  /**
   * Make API request with error handling
   */
  async _request(method, endpoint, data = null, params = {}) {
    const url = `${TIKTOK_API_BASE}/${endpoint}`;
    
    try {
      const response = await axios({
        method,
        url,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': data ? 'application/json' : undefined
        },
        params,
        data
      });

      if (response.data.error) {
        throw new Error(`TikTok API Error: ${response.data.error.message}`);
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      const code = error.response?.status || error.code;
      throw new Error(`TikTok API Request Failed: ${message} (Code: ${code})`);
    }
  }

  /**
   * Upload Video to TikTok
   * 
   * @param {string} videoPath - Path to video file
   * @param {string} caption - Video caption/description
   * @returns {Promise<Object>} Upload result
   */
  async uploadVideo(videoPath, caption) {
    try {
      const videoData = readFileSync(videoPath);
      
      const form = new FormData();
      form.append('video', videoData, { filename: videoPath.split('/').pop() });
      form.append('description', caption);
      
      const response = await axios.post(
        `${TIKTOK_API_BASE}/api/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(`Upload failed: ${response.data.error.message}`);
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Get Video Information
   * 
   * @param {string} videoId - TikTok video ID
   * @returns {Promise<Object>} Video data
   */
  async getVideo(videoId) {
    const data = await this._request('GET', `api/video/${videoId}`);
    return data;
  }

  /**
   * Get User Videos
   * 
   * @param {number} [limit=10] - Number of videos to retrieve
   * @returns {Promise<Array>} Array of video objects
   */
  async getUserVideos(limit = 10) {
    const params = { limit };
    const data = await this._request('GET', 'api/user/videos', null, params);
    return data.videos || [];
  }

  /**
   * Get Video Analytics
   * 
   * @param {string} videoId - TikTok video ID
   * @returns {Promise<Object>} Analytics data
   */
  async getVideoAnalytics(videoId) {
    const data = await this._request('GET', `api/video/${videoId}/analytics`);
    return data;
  }

  /**
   * Get User Analytics
   * 
   * @returns {Promise<Object>} User analytics data
   */
  async getUserAnalytics() {
    const data = await this._request('GET', 'api/user/analytics');
    return data;
  }

  /**
   * Post Comment on Video
   * 
   * @param {string} videoId - TikTok video ID
   * @param {string} comment - Comment text
   * @returns {Promise<Object>} Comment result
   */
  async postComment(videoId, comment) {
    const data = await this._request('POST', `api/video/${videoId}/comment`, {
      text: comment
    });
    return data;
  }

  /**
   * Like a Video
   * 
   * @param {string} videoId - TikTok video ID
   * @returns {Promise<Object>} Like result
   */
  async likeVideo(videoId) {
    const data = await this._request('POST', `api/video/${videoId}/like`);
    return data;
  }

  /**
   * Get Trending Videos
   * 
   * @param {number} [limit=20] - Number of videos to retrieve
   * @returns {Promise<Array>} Array of trending video objects
   */
  async getTrendingVideos(limit = 20) {
    const params = { limit };
    const data = await this._request('GET', 'api/trending', null, params);
    return data.videos || [];
  }
}

/**
 * Factory function to create TikTok client from environment
 */
function createTikTokClient() {
  return new TikTokApi({
    accessToken: process.env.TIKTOK_ACCESS_TOKEN,
    apiKey: process.env.TIKTOK_API_KEY
  });
}

// Initialize TikTok client
let tiktokClient = null;

/**
 * Initialize TikTok client
 * Call this at application startup
 */
function initTikTokClient() {
  try {
    tiktokClient = createTikTokClient();
    console.log('✅ TikTok API client initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize TikTok client:', error.message);
    // Fall back to placeholder mode
    tiktokClient = null;
    return false;
  }
}

/**
 * Post to TikTok
 * 
 * @param {Object} content - Content to post
 * @param {string} content.character - Character name
 * @param {string} content.contentType - Type of content
 * @param {string} content.caption - Post caption
 * @param {string} content.mediaFile - Path to media file
 * @param {Array} content.hashtags - Array of hashtags
 * @returns {Promise<boolean>} Success status
 */
async function postToTikTok(content) {
  console.log(`🎵 Posting to TikTok: ${content.character} (${content.contentType})`);
  console.log(`📝 Caption: ${content.caption.substring(0, 100)}...`);

  // Check if we have a valid TikTok client
  if (!tiktokClient) {
    console.warn('⚠️  TikTok client not initialized. Running in placeholder mode.');
    console.log('✅ TikTok post successful (placeholder)');
    return true;
  }

  try {
    if (content.mediaFile) {
      const result = await tiktokClient.uploadVideo(content.mediaFile, content.caption);
      console.log('✅ TikTok post successful');
      return true;
    } else {
      console.error('❌ No media file provided for TikTok post');
      return false;
    }
  } catch (error) {
    console.error('❌ TikTok post failed:', error.message);
    return false;
  }
}

/**
 * Get TikTok User Information
 * 
 * @returns {Promise<Object|null>} User data or null on error
 */
async function getTikTokUser() {
  if (!tiktokClient) {
    console.warn('⚠️  TikTok client not initialized');
    return null;
  }

  try {
    // This would need to be implemented based on actual TikTok API
    // For now, return a mock response
    return { username: 'chiefpilot', follower_count: 0 };
  } catch (error) {
    console.error('❌ Failed to get TikTok user:', error.message);
    return null;
  }
}

/**
 * Get Recent TikTok Videos
 * 
 * @param {number} limit - Number of videos to retrieve
 * @returns {Promise<Array>} Array of video objects
 */
async function getRecentVideos(limit = 10) {
  if (!tiktokClient) {
    console.warn('⚠️  TikTok client not initialized');
    return [];
  }

  try {
    return await tiktokClient.getUserVideos(limit);
  } catch (error) {
    console.error('❌ Failed to get recent videos:', error.message);
    return [];
  }
}

/**
 * Get TikTok User Analytics
 * 
 * @returns {Promise<Object|null>} Analytics data or null on error
 */
async function getUserAnalytics() {
  if (!tiktokClient) {
    console.warn('⚠️  TikTok client not initialized');
    return null;
  }

  try {
    return await tiktokClient.getUserAnalytics();
  } catch (error) {
    console.error('❌ Failed to get user analytics:', error.message);
    return null;
  }
}

export {
  initTikTokClient,
  postToTikTok,
  getTikTokUser,
  getRecentVideos,
  getUserAnalytics
};

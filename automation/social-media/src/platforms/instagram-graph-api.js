/**
 * Instagram Graph API Client
 * 
 * Secure, maintained alternative to instagram-private-api
 * Uses official Instagram Graph API (Facebook)
 * 
 * Prerequisites:
 * 1. Instagram Business or Creator account
 * 2. Facebook Developer App with Instagram Graph API enabled
 * 3. Valid access token with required permissions
 * 
 * Required permissions:
 * - instagram_basic
 * - pages_show_list
 * - pages_read_engagement
 * - instagram_content_publish (for posting)
 */

import axios from 'axios';
import FormData from 'form-data';
import { readFileSync } from 'fs';

/**
 * Instagram Graph API Configuration
 */
const INSTAGRAM_GRAPH_API_VERSION = 'v19.0';
const INSTAGRAM_GRAPH_API_BASE = `https://graph.facebook.com/${INSTAGRAM_GRAPH_API_VERSION}`;

/**
 * Instagram Graph API Client Class
 */
class InstagramGraphApi {
  /**
   * Create Instagram Graph API client
   * @param {Object} config - Configuration options
   * @param {string} config.accessToken - Facebook access token
   * @param {string} config.instagramUserId - Instagram User ID
   * @param {string} [config.pageId] - Facebook Page ID (optional)
   */
  constructor(config) {
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
    this.pageId = config.pageId;
    
    // Validate required configuration
    if (!this.accessToken) {
      throw new Error('InstagramGraphApi: accessToken is required');
    }
    if (!this.instagramUserId) {
      throw new Error('InstagramGraphApi: instagramUserId is required');
    }
  }

  /**
   * Make API request with error handling
   */
  async _request(method, endpoint, data = null, params = {}) {
    const url = `${INSTAGRAM_GRAPH_API_BASE}/${endpoint}`;
    
    try {
      const response = await axios({
        method,
        url,
        params: {
          access_token: this.accessToken,
          ...params
        },
        data,
        headers: {
          'Content-Type': data ? 'application/json' : undefined
        }
      });

      if (response.data.error) {
        throw new Error(`Instagram API Error: ${response.data.error.message}`);
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      const code = error.response?.data?.error?.code || error.code;
      throw new Error(`Instagram API Request Failed: ${message} (Code: ${code})`);
    }
  }

  /**
   * Get Instagram User Information
   * @returns {Promise<Object>} User profile data
   */
  async getUser() {
    const data = await this._request('GET', this.instagramUserId);
    return data;
  }

  /**
   * Get Instagram Media (Posts)
   * @param {number} [limit=10] - Number of posts to retrieve
   * @returns {Promise<Array>} Array of media objects
   */
  async getMedia({ limit = 10 } = {}) {
    const endpoint = `${this.instagramUserId}/media`;
    const params = {
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
      limit
    };
    
    const data = await this._request('GET', endpoint, null, params);
    return data.data || [];
  }

  /**
   * Upload Photo to Instagram
   * 
   * Note: For the Graph API, photos must be hosted on a public URL
   * or use the upload API with a POST request containing the image data.
   * 
   * @param {string} imageUrl - Public URL of the image to post
   * @param {string} caption - Post caption
   * @param {string} [accessToken] - Override access token for this request
   * @returns {Promise<Object>} Post creation result
   */
  async uploadPhoto(imageUrl, caption, accessToken = null) {
    // Step 1: Create the photo container
    const containerResponse = await this._request('POST', `${this.instagramUserId}/media`, {
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken || this.accessToken
    });

    const creationId = containerResponse.id;

    // Step 2: Publish the container
    const publishResponse = await this._request('POST', `${this.instagramUserId}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken || this.accessToken
    });

    return {
      container: containerResponse,
      published: publishResponse
    };
  }

  /**
   * Upload Photo from File (using form-data)
   * 
   * Alternative approach: Upload image file directly
   * Note: This requires the image to be hosted or use a different endpoint
   * 
   * @param {string} filePath - Path to image file
   * @param {string} caption - Post caption
   * @returns {Promise<Object>} Post creation result
   */
  async uploadPhotoFromFile(filePath, caption) {
    try {
      const fileData = readFileSync(filePath);
      
      // Create form data
      const form = new FormData();
      form.append('image_file', fileData, { filename: filePath.split('/').pop() });
      form.append('caption', caption);
      form.append('access_token', this.accessToken);

      // Upload to Instagram's upload endpoint
      // Note: This endpoint may require special permissions
      const response = await axios.post(
        `${INSTAGRAM_GRAPH_API_BASE}/${this.instagramUserId}/media`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          params: {
            access_token: this.accessToken
          }
        }
      );

      if (response.data.error) {
        throw new Error(`Upload failed: ${response.data.error.message}`);
      }

      const creationId = response.data.id;

      // Publish the uploaded media
      const publishResponse = await this._request('POST', `${this.instagramUserId}/media_publish`, {
        creation_id: creationId
      });

      return publishResponse;
    } catch (error) {
      throw new Error(`Failed to upload photo from file: ${error.message}`);
    }
  }

  /**
   * Upload Video to Instagram
   * 
   * @param {string} videoUrl - Public URL of the video
   * @param {string} caption - Post caption
   * @returns {Promise<Object>} Post creation result
   */
  async uploadVideo(videoUrl, caption) {
    // Step 1: Create the video container
    const containerResponse = await this._request('POST', `${this.instagramUserId}/media`, {
      video_url: videoUrl,
      caption: caption,
      media_type: 'VIDEO'
    });

    const creationId = containerResponse.id;

    // Step 2: Publish the container
    const publishResponse = await this._request('POST', `${this.instagramUserId}/media_publish`, {
      creation_id: creationId
    });

    return {
      container: containerResponse,
      published: publishResponse
    };
  }

  /**
   * Post Story to Instagram
   * 
   * @param {string} mediaUrl - Public URL of the media (image or video)
   * @param {string} [caption] - Optional caption
   * @returns {Promise<Object>} Story creation result
   */
  async uploadStory(mediaUrl, caption = '') {
    // Note: Story posting requires additional permissions
    const response = await this._request('POST', `${this.instagramUserId}/stories`, {
      image_url: mediaUrl,
      caption: caption
    });

    return response;
  }

  /**
   * Get Media Insights
   * 
   * @param {string} mediaId - Instagram media ID
   * @returns {Promise<Object>} Insights data
   */
  async getMediaInsights(mediaId) {
    const endpoint = `${mediaId}/insights`;
    const params = {
      metric: 'impressions,reach,engagement,saved,video_views'
    };
    
    const data = await this._request('GET', endpoint, null, params);
    return data;
  }

  /**
   * Get User Insights
   * 
   * @returns {Promise<Object>} User insights data
   */
  async getUserInsights() {
    const endpoint = `${this.instagramUserId}/insights`;
    const params = {
      metric: 'follower_count,impressions,reach,profile_views'
    };
    
    const data = await this._request('GET', endpoint, null, params);
    return data;
  }

  /**
   * Delete a Media Post
   * 
   * @param {string} mediaId - Instagram media ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteMedia(mediaId) {
    const data = await this._request('DELETE', mediaId);
    return data;
  }

  /**
   * Reply to Comment
   * 
   * @param {string} commentId - Comment ID
   * @param {string} message - Reply message
   * @returns {Promise<Object>} Reply result
   */
  async replyToComment(commentId, message) {
    const data = await this._request('POST', `${commentId}/replies`, {
      message: message
    });
    return data;
  }

  /**
   * Get Comments on a Media Post
   * 
   * @param {string} mediaId - Media ID
   * @param {number} [limit=25] - Number of comments to retrieve
   * @returns {Promise<Array>} Array of comments
   */
  async getComments(mediaId, limit = 25) {
    const endpoint = `${mediaId}/comments`;
    const params = {
      fields: 'id,username,text,timestamp',
      limit
    };
    
    const data = await this._request('GET', endpoint, null, params);
    return data.data || [];
  }

  /**
   * Like a Comment
   * 
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Like result
   */
  async likeComment(commentId) {
    const data = await this._request('POST', `${commentId}/likes`);
    return data;
  }

  /**
   * Unlike a Comment
   * 
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Unlike result
   */
  async unlikeComment(commentId) {
    const data = await this._request('DELETE', `${commentId}/likes`);
    return data;
  }

  /**
   * Search for Media by Hashtag
   * 
   * Note: Requires additional permissions
   * 
   * @param {string} hashtag - Hashtag to search (without #)
   * @param {number} [limit=10] - Number of results
   * @returns {Promise<Array>} Array of media objects
   */
  async searchByHashtag(hashtag, limit = 10) {
    // Note: Hashtag search requires Instagram Basic Display API
    // This is a placeholder - actual implementation may vary
    const endpoint = `ig_hashtag_search`;
    const params = {
      q: hashtag,
      fields: 'id,name',
      limit
    };
    
    const data = await this._request('GET', endpoint, null, params);
    return data.data || [];
  }
}

/**
 * Factory function to create Instagram client from environment
 */
function createInstagramClient() {
  return new InstagramGraphApi({
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    instagramUserId: process.env.INSTAGRAM_USER_ID,
    pageId: process.env.FACEBOOK_PAGE_ID
  });
}

export { InstagramGraphApi, createInstagramClient };

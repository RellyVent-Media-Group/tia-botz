/**
 * Workspace Integration Module for ChiefPilot Bots
 * Enhanced connectivity with workspace API and content management
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const workspaceApiUrl = process.env.WORKSPACE_API_URL || 'http://localhost:8080';
const workspaceApiKey = process.env.WORKSPACE_API_KEY || '';

// Cache for workspace data
const workspaceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to make authenticated API calls
async function workspaceRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (workspaceApiKey) {
    headers['Authorization'] = `Bearer ${workspaceApiKey}`;
  }
  
  try {
    const config = {
      method,
      url: `${workspaceApiUrl}${endpoint}`,
      headers
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Workspace API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      throw new Error('Workspace API not reachable. Check connection.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

// Cache management
function getCachedData(key) {
  const cached = workspaceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  workspaceCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

function clearCache(key = null) {
  if (key) {
    workspaceCache.delete(key);
  } else {
    workspaceCache.clear();
  }
}

// Content Calendar Functions
async function getContentCalendar(forceRefresh = false) {
  const cacheKey = 'content-calendar';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const calendar = await workspaceRequest('/api/content-calendar');
    setCachedData(cacheKey, calendar);
    return calendar;
  } catch (error) {
    console.error('Failed to fetch content calendar:', error.message);
    return null;
  }
}

async function getContentCalendarPost(postId) {
  try {
    const post = await workspaceRequest(`/api/content-calendar/posts/${postId}`);
    return post;
  } catch (error) {
    console.error('Failed to fetch content calendar post:', error.message);
    return null;
  }
}

async function createContentCalendarPost(postData) {
  try {
    const post = await workspaceRequest('/api/content-calendar/posts', 'POST', postData);
    clearCache('content-calendar'); // Clear calendar cache after creating post
    return post;
  } catch (error) {
    console.error('Failed to create content calendar post:', error.message);
    throw error;
  }
}

async function updateContentCalendarPost(postId, updateData) {
  try {
    const post = await workspaceRequest(`/api/content-calendar/posts/${postId}`, 'PUT', updateData);
    clearCache('content-calendar');
    return post;
  } catch (error) {
    console.error('Failed to update content calendar post:', error.message);
    throw error;
  }
}

async function deleteContentCalendarPost(postId) {
  try {
    await workspaceRequest(`/api/content-calendar/posts/${postId}`, 'DELETE');
    clearCache('content-calendar');
    return true;
  } catch (error) {
    console.error('Failed to delete content calendar post:', error.message);
    throw error;
  }
}

// Character Management Functions
async function getWorkspaceCharacters(forceRefresh = false) {
  const cacheKey = 'workspace-characters';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const characters = await workspaceRequest('/api/characters');
    setCachedData(cacheKey, characters);
    return characters;
  } catch (error) {
    console.error('Failed to fetch workspace characters:', error.message);
    return null;
  }
}

async function getWorkspaceCharacter(characterId) {
  try {
    const character = await workspaceRequest(`/api/characters/${characterId}`);
    return character;
  } catch (error) {
    console.error('Failed to fetch workspace character:', error.message);
    return null;
  }
}

async function createWorkspaceCharacter(characterData) {
  try {
    const character = await workspaceRequest('/api/characters', 'POST', characterData);
    clearCache('workspace-characters');
    return character;
  } catch (error) {
    console.error('Failed to create workspace character:', error.message);
    throw error;
  }
}

async function updateWorkspaceCharacter(characterId, updateData) {
  try {
    const character = await workspaceRequest(`/api/characters/${characterId}`, 'PUT', updateData);
    clearCache('workspace-characters');
    return character;
  } catch (error) {
    console.error('Failed to update workspace character:', error.message);
    throw error;
  }
}

// Analytics Functions
async function getWorkspaceAnalytics(forceRefresh = false) {
  const cacheKey = 'workspace-analytics';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const analytics = await workspaceRequest('/api/analytics');
    setCachedData(cacheKey, analytics);
    return analytics;
  } catch (error) {
    console.error('Failed to fetch workspace analytics:', error.message);
    return null;
  }
}

async function getWorkspaceAnalyticsByDateRange(startDate, endDate) {
  try {
    const analytics = await workspaceRequest(
      `/api/analytics/range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    return analytics;
  } catch (error) {
    console.error('Failed to fetch analytics by date range:', error.message);
    return null;
  }
}

async function getWorkspaceAnalyticsByPlatform(platform) {
  try {
    const analytics = await workspaceRequest(`/api/analytics/platform/${platform}`);
    return analytics;
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error.message);
    return null;
  }
}

// Engagement Sync Functions
async function syncEngagementToWorkspace(userId, engagementData) {
  try {
    const result = await workspaceRequest('/api/engagement', 'POST', {
      userId,
      platform: engagementData.platform || 'unknown',
      ...engagementData
    });
    return result;
  } catch (error) {
    console.error('Failed to sync engagement to workspace:', error.message);
    return null;
  }
}

async function syncUserSessionToWorkspace(userId, sessionData) {
  try {
    const result = await workspaceRequest('/api/sessions', 'POST', {
      userId,
      ...sessionData
    });
    return result;
  } catch (error) {
    console.error('Failed to sync session to workspace:', error.message);
    return null;
  }
}

async function syncPromptGenerationToWorkspace(userId, promptData) {
  try {
    const result = await workspaceRequest('/api/prompts', 'POST', {
      userId,
      ...promptData
    });
    return result;
  } catch (error) {
    console.error('Failed to sync prompt generation to workspace:', error.message);
    return null;
  }
}

// Project Management Functions
async function getWorkspaceProjects(forceRefresh = false) {
  const cacheKey = 'workspace-projects';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const projects = await workspaceRequest('/api/projects');
    setCachedData(cacheKey, projects);
    return projects;
  } catch (error) {
    console.error('Failed to fetch workspace projects:', error.message);
    return null;
  }
}

async function getWorkspaceProject(projectId) {
  try {
    const project = await workspaceRequest(`/api/projects/${projectId}`);
    return project;
  } catch (error) {
    console.error('Failed to fetch workspace project:', error.message);
    return null;
  }
}

async function createWorkspaceProject(projectData) {
  try {
    const project = await workspaceRequest('/api/projects', 'POST', projectData);
    clearCache('workspace-projects');
    return project;
  } catch (error) {
    console.error('Failed to create workspace project:', error.message);
    throw error;
  }
}

// User Management Functions
async function getWorkspaceUsers(forceRefresh = false) {
  const cacheKey = 'workspace-users';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const users = await workspaceRequest('/api/users');
    setCachedData(cacheKey, users);
    return users;
  } catch (error) {
    console.error('Failed to fetch workspace users:', error.message);
    return null;
  }
}

async function getWorkspaceUser(userId) {
  try {
    const user = await workspaceRequest(`/api/users/${userId}`);
    return user;
  } catch (error) {
    console.error('Failed to fetch workspace user:', error.message);
    return null;
  }
}

async function linkBotUserToWorkspace(botUserId, workspaceUserId) {
  try {
    const result = await workspaceRequest('/api/users/link', 'POST', {
      botUserId,
      workspaceUserId
    });
    return result;
  } catch (error) {
    console.error('Failed to link bot user to workspace:', error.message);
    throw error;
  }
}

// Content Scheduling Functions
async function scheduleContent(contentData) {
  try {
    const scheduled = await workspaceRequest('/api/schedule', 'POST', contentData);
    clearCache('content-calendar');
    return scheduled;
  } catch (error) {
    console.error('Failed to schedule content:', error.message);
    throw error;
  }
}

async function getScheduledContent(forceRefresh = false) {
  const cacheKey = 'scheduled-content';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const scheduled = await workspaceRequest('/api/schedule');
    setCachedData(cacheKey, scheduled);
    return scheduled;
  } catch (error) {
    console.error('Failed to fetch scheduled content:', error.message);
    return null;
  }
}

// Dashboard Data Functions
async function getDashboardData(forceRefresh = false) {
  const cacheKey = 'dashboard-data';
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }
  
  try {
    const dashboard = await workspaceRequest('/api/dashboard');
    setCachedData(cacheKey, dashboard);
    return dashboard;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error.message);
    return null;
  }
}

// Batch sync function
async function batchSyncToWorkspace(userId, data) {
  try {
    const result = await workspaceRequest('/api/batch-sync', 'POST', {
      userId,
      ...data
    });
    return result;
  } catch (error) {
    console.error('Failed to batch sync to workspace:', error.message);
    return null;
  }
}

// Workspace health check
async function checkWorkspaceHealth() {
  try {
    const health = await workspaceRequest('/api/health');
    return {
      healthy: true,
      ...health
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}

// Format workspace data for bot responses
function formatContentCalendarSummary(calendar) {
  if (!calendar) return '❌ Calendar data not available';
  
  const posts = calendar.posts || [];
  const published = posts.filter(p => p.status === 'published').length;
  const planned = posts.filter(p => p.status === 'planned').length;
  const ideas = posts.filter(p => p.status === 'idea').length;
  
  return `
📅 *Content Calendar Summary*

*Total Posts:* ${posts.length}
*Published:* ${published}
*Planned:* ${planned}
*Ideas:* ${ideas}

*Theme:* ${calendar.theme || 'N/A'}
*Description:* ${calendar.description || 'N/A'}

*Recent Posts:*
${posts.slice(0, 3).map((p, i) => `${i + 1}. ${p.title || 'Untitled'} (${p.status})`).join('\n')}

View full calendar at your workspace dashboard.
  `.trim();
}

function formatWorkspaceAnalytics(analytics) {
  if (!analytics) return '❌ Analytics data not available';
  
  return `
🚀 *Workspace Analytics*

*Total Projects:* ${analytics.projects || 0}
*Active Users:* ${analytics.users || 0}
*Content Posts:* ${analytics.posts || 0}
*Engagement Rate:* ${analytics.engagementRate || 0}%

*Recent Activity:*
${analytics.recentActivity?.slice(0, 3).map(a => `• ${a}`).join('\n') || 'No recent activity'}

*Top Performing Content:*
${analytics.topContent?.slice(0, 3).map(c => `• ${c.title}: ${c.engagement} engagement`).join('\n') || 'No data yet'}

Access full dashboard at ${workspaceApiUrl}
  `.trim();
}

function formatProjectsList(projects) {
  if (!projects || projects.length === 0) return '❌ No projects found';
  
  return `
📁 *Workspace Projects*

${projects.map((p, i) => `
${i + 1}. *${p.name || 'Untitled'}*
   Status: ${p.status || 'Unknown'}
   Created: ${p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
   ${p.description ? `Description: ${p.description}` : ''}
`).join('\n')}

Total: ${projects.length} projects
  `.trim();
}

// Export functions
export {
  workspaceApiUrl,
  getContentCalendar,
  getContentCalendarPost,
  createContentCalendarPost,
  updateContentCalendarPost,
  deleteContentCalendarPost,
  getWorkspaceCharacters,
  getWorkspaceCharacter,
  createWorkspaceCharacter,
  updateWorkspaceCharacter,
  getWorkspaceAnalytics,
  getWorkspaceAnalyticsByDateRange,
  getWorkspaceAnalyticsByPlatform,
  syncEngagementToWorkspace,
  syncUserSessionToWorkspace,
  syncPromptGenerationToWorkspace,
  getWorkspaceProjects,
  getWorkspaceProject,
  createWorkspaceProject,
  getWorkspaceUsers,
  getWorkspaceUser,
  linkBotUserToWorkspace,
  scheduleContent,
  getScheduledContent,
  getDashboardData,
  batchSyncToWorkspace,
  checkWorkspaceHealth,
  formatContentCalendarSummary,
  formatWorkspaceAnalytics,
  formatProjectsList,
  clearCache
};
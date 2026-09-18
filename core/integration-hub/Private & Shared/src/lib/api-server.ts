import { SAMPLE_CAMPAIGN } from "@/lib/content-calendar";
import { projects } from "@/lib/catalog";
import { SOCIAL_CHARACTERS } from "@/lib/social-characters";

// In-memory storage for engagement data
const engagementStore = new Map<string, any>();

export function getContentCalendar() {
  return SAMPLE_CAMPAIGN;
}

export function getCharacters() {
  return {
    projects: projects,
    socialCharacters: SOCIAL_CHARACTERS,
    total: projects.length + SOCIAL_CHARACTERS.length
  };
}

export function getAnalytics() {
  const totalImpressions = SAMPLE_CAMPAIGN.posts.reduce((sum, post) => sum + (post.metrics?.impressions || 0), 0);
  const totalEngagement = SAMPLE_CAMPAIGN.posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
  const publishedPosts = SAMPLE_CAMPAIGN.posts.filter(p => p.status === 'published').length;

  const engagementRate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : 0;

  const recentActivity = [
    'New character added: Zupa Novaclutch',
    'Content calendar updated with 3 new posts',
    'Social media templates refreshed',
    'Character database synced successfully'
  ];

  return {
    projects: projects.length + SOCIAL_CHARACTERS.length,
    users: 42,
    posts: SAMPLE_CAMPAIGN.posts.length,
    publishedPosts,
    totalImpressions,
    totalEngagement,
    engagementRate: parseFloat(String(engagementRate)),
    recentActivity,
    platforms: ['instagram', 'linkedin', 'twitter', 'tiktok'],
    lastUpdated: new Date().toISOString()
  };
}

export function storeEngagement(data: any) {
  const { userId, platform, messageCount, promptsGenerated, lastActivity, recentMessages } = data;

  const engagementData = {
    userId,
    platform,
    messageCount,
    promptsGenerated,
    lastActivity,
    recentMessages,
    timestamp: new Date().toISOString()
  };

  const key = `${platform}-${userId}`;
  engagementStore.set(key, engagementData);

  console.log('Engagement data received:', engagementData);

  return {
    success: true,
    message: 'Engagement data stored successfully',
    data: engagementData
  };
}
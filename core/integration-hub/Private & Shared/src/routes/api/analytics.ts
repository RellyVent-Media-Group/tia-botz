import { createFileRoute } from "@tanstack/react-router";
import { SAMPLE_CAMPAIGN } from "@/lib/content-calendar";
import { projects } from "@/lib/catalog";
import { SOCIAL_CHARACTERS } from "@/lib/social-characters";

export const Route = createFileRoute("/api/analytics")({
  loader: async () => {
    const totalImpressions = SAMPLE_CAMPAIGN.posts.reduce((sum, post) => sum + (post.metrics?.impressions || 0), 0);
    const totalEngagement = SAMPLE_CAMPAIGN.posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
    const publishedPosts = SAMPLE_CAMPAIGN.posts.filter(p => p.status === 'published').length;

    // Calculate engagement rate
    const engagementRate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : 0;

    // Recent activity simulation
    const recentActivity = [
      'New character added: Zupa Novaclutch',
      'Content calendar updated with 3 new posts',
      'Social media templates refreshed',
      'Character database synced successfully'
    ];

    const data = {
      projects: projects.length + SOCIAL_CHARACTERS.length,
      users: 42, // Simulated user count
      posts: SAMPLE_CAMPAIGN.posts.length,
      publishedPosts,
      totalImpressions,
      totalEngagement,
      engagementRate: parseFloat(String(engagementRate)),
      recentActivity,
      platforms: ['instagram', 'linkedin', 'twitter', 'tiktok'],
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
});
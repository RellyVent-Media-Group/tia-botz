import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

// In-memory storage for engagement data (in production, this would go to database)
const engagementStore = new Map<string, any>();

export const storeEngagement = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
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

    // Store engagement data
    const key = `${platform}-${userId}`;
    engagementStore.set(key, engagementData);

    // In a real implementation, this would sync to database
    console.log('Engagement data received:', engagementData);

    return {
      success: true,
      message: 'Engagement data stored successfully',
      data: engagementData
    };
  });

export const Route = createFileRoute("/api/engagement")({
  component: () => null,
});
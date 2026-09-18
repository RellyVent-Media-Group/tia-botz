/**
 * API Server for Workspace Integration
 * Deployed as serverless function
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing (in production, this would connect to actual data sources)
const MOCK_DATA = {
  contentCalendar: {
    id: "tak-tiapmaatzu-launch",
    name: "TaK-Tiapmaatzu OS Launch",
    theme: "Data Doesn't Lie, But People Do",
    description: "Trust, Integrity, and Autonomous Operations - Launch campaign featuring Mary Magnumbytes and Mac Nazarene",
    primaryCharacters: ["mary-magnumbytes", "mac-nazarene"],
    contentPillars: ["character-introduction", "digital-privacy-wisdom", "difficult-decisions", "behind-the-scenes", "system-capabilities"],
    posts: [
      {
        id: "post-1",
        title: "Mary Magnumbytes Introduction",
        platform: "instagram",
        status: "published",
        pillar: "character-introduction",
        characterId: "mary-magnumbytes",
        content: {
          caption: "Meet Mary Magnumbytes 👩‍💻\n\nDigital Storyteller. AI-Powered Content Creator. The one who turns data into narratives that actually make sense.",
          imageType: "portrait",
          hashtags: ["#MaryMagnumbytes", "#DigitalStoryteller", "#DataPrivacy"]
        },
        metrics: { likes: 245, comments: 32, shares: 18, impressions: 1200 }
      },
      {
        id: "post-2",
        title: "Mac Nazarene Introduction",
        platform: "instagram",
        status: "published",
        pillar: "character-introduction",
        characterId: "mac-nazarene",
        content: {
          caption: "Meet Mac Nazarene 🧘‍♂️\n\nShadow Work Specialist. Community Bridge. The one who helps you face what you'd rather ignore.",
          imageType: "portrait",
          hashtags: ["#MacNazarene", "#ShadowWork", "#Integrity"]
        },
        metrics: { likes: 189, comments: 28, shares: 15, impressions: 980 }
      }
    ]
  },
  
  characters: {
    projects: [
      { id: "mary-magnumbytes", name: "Mary Magnumbytes", title: "Digital Storyteller" },
      { id: "mac-nazarene", name: "Mac Nazarene", title: "Shadow Work Specialist" }
    ],
    socialCharacters: [
      { id: "mary-magnumbytes", name: "Mary Magnumbytes", role: "DIVINE MOTHER" },
      { id: "mac-nazarene", name: "Mac Nazarene", role: "SHADOW WORK SPECIALIST" }
    ],
    total: 4
  }
};

// In-memory storage for engagement data
const engagementStore = new Map();

// API Routes

// Content Calendar API
app.get('/api/content-calendar', (req, res) => {
  try {
    res.json(MOCK_DATA.contentCalendar);
  } catch (error) {
    console.error('Error fetching content calendar:', error);
    res.status(500).json({ error: 'Failed to fetch content calendar' });
  }
});

// Characters API
app.get('/api/characters', (req, res) => {
  try {
    res.json(MOCK_DATA.characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Analytics API
app.get('/api/analytics', (req, res) => {
  try {
    const contentCalendar = MOCK_DATA.contentCalendar;
    const characters = MOCK_DATA.characters;
    
    const totalImpressions = contentCalendar.posts.reduce((sum, post) => sum + (post.metrics?.impressions || 0), 0);
    const totalEngagement = contentCalendar.posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
    const publishedPosts = contentCalendar.posts.filter(p => p.status === 'published').length;

    const engagementRate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : 0;

    const recentActivity = [
      'New character added: Zupa Novaclutch',
      'Content calendar updated with 3 new posts',
      'Social media templates refreshed',
      'Character database synced successfully'
    ];

    const data = {
      projects: characters.total,
      users: 42,
      posts: contentCalendar.posts.length,
      publishedPosts,
      totalImpressions,
      totalEngagement,
      engagementRate: parseFloat(engagementRate),
      recentActivity,
      platforms: ['instagram', 'linkedin', 'twitter', 'tiktok'],
      lastUpdated: new Date().toISOString()
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Engagement API
app.post('/api/engagement', (req, res) => {
  try {
    const { userId, platform, messageCount, promptsGenerated, lastActivity, recentMessages } = req.body;

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

    res.json({
      success: true,
      message: 'Engagement data stored successfully',
      data: engagementData
    });
  } catch (error) {
    console.error('Error storing engagement:', error);
    res.status(500).json({ error: 'Failed to store engagement data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For Vercel serverless function
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET  /api/content-calendar`);
    console.log(`   GET  /api/characters`);
    console.log(`   GET  /api/analytics`);
    console.log(`   POST /api/engagement`);
    console.log(`   GET  /health`);
  });
}
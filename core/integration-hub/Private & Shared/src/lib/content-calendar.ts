export type Platform = "instagram" | "linkedin" | "twitter" | "tiktok";
export type ContentStatus = "idea" | "planned" | "published";
export type ContentPillar = 
  | "character-introduction"
  | "digital-privacy-wisdom"
  | "difficult-decisions"
  | "behind-the-scenes"
  | "system-capabilities";

export interface ContentPost {
  id: string;
  title: string;
  platform: Platform;
  status: ContentStatus;
  pillar: ContentPillar;
  characterId?: string; // Links to character catalog
  scheduledDate?: string;
  publishDate?: string;
  templateType?: "square" | "story" | "banner"; // Social media template type
  content: {
    caption?: string;
    imageType?: "portrait" | "poster" | "avatar" | "carousel";
    script?: string;
    hashtags?: string[];
  };
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  theme: string;
  description: string;
  primaryCharacters: string[];
  startDate?: string;
  endDate?: string;
  contentPillars: ContentPillar[];
  posts: ContentPost[];
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  tiktok: "TikTok",
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  published: "Published",
};

export const PILLAR_LABELS: Record<ContentPillar, string> = {
  "character-introduction": "Character Introduction",
  "digital-privacy-wisdom": "Digital Privacy Wisdom",
  "difficult-decisions": "Difficult Decisions",
  "behind-the-scenes": "Behind the Scenes",
  "system-capabilities": "System Capabilities",
};

// Sample content from the markdown files
export const SAMPLE_CAMPAIGN: Campaign = {
  id: "tak-tiapmaatzu-launch",
  name: "TaK-Tiapmaatzu OS Launch",
  theme: "Data Doesn't Lie, But People Do",
  description: "Trust, Integrity, and Autonomous Operations - Launch campaign featuring Mary Magnumbytes and Mac Nazarene",
  primaryCharacters: ["mary-magnumbytes", "mac-nazarene"],
  contentPillars: [
    "character-introduction",
    "digital-privacy-wisdom",
    "difficult-decisions",
    "behind-the-scenes",
    "system-capabilities",
  ],
  posts: [
    {
      id: "post-1",
      title: "Mary Magnumbytes Introduction",
      platform: "instagram",
      status: "published",
      pillar: "character-introduction",
      characterId: "mary-magnumbytes",
      content: {
        caption: "Meet Mary Magnumbytes 👩‍💻\n\nDigital Storyteller. AI-Powered Content Creator. The one who turns data into narratives that actually make sense.\n\nIn a world where everyone's watching, she's the one paying attention to who's watching back.\n\nYour data isn't private because someone promised it would be. It's private because you made it too expensive to steal.",
        imageType: "portrait",
        hashtags: ["#MaryMagnumbytes", "#DigitalStoryteller", "#DataPrivacy", "#CyberSecurity", "#TaKTiapmaatzu"],
      },
      metrics: {
        likes: 245,
        comments: 32,
        shares: 18,
        impressions: 1200,
      },
    },
    {
      id: "post-2",
      title: "Mac Nazarene Introduction",
      platform: "instagram",
      status: "published",
      pillar: "character-introduction",
      characterId: "mac-nazarene",
      content: {
        caption: "Meet Mac Nazarene 🧘‍♂️\n\nShadow Work Specialist. Community Bridge. The one who helps you face what you'd rather ignore.\n\nSome choices aren't between right and wrong. They're between what's easy and what's necessary.\n\nThe right choice often feels wrong before it feels right. That discomfort is your integrity working.",
        imageType: "portrait",
        hashtags: ["#MacNazarene", "#ShadowWork", "#Integrity", "#Leadership", "#TaKTiapmaatzu"],
      },
      metrics: {
        likes: 189,
        comments: 28,
        shares: 15,
        impressions: 980,
      },
    },
    {
      id: "post-3",
      title: "Mary + Mac: The Perfect Balance",
      platform: "instagram",
      status: "published",
      pillar: "behind-the-scenes",
      characterId: "mary-magnumbytes",
      content: {
        caption: "Mary + Mac: The Perfect Balance ⚖️\n\nMary sees the patterns in the data. Mac sees the patterns in the people.\n\nMary: \"I've been going through this client's server logs for three days. The pattern is so obvious it's almost insulting.\"\n\nMac: \"And what does the client want you to do with this information?\"\n\nMary: \"They want a villain. I need to give them the truth.\"",
        imageType: "carousel",
        hashtags: ["#MaryAndMac", "#TaKTiapmaatzu", "#AutonomousOps", "#DataIntegrity"],
      },
      metrics: {
        likes: 312,
        comments: 45,
        shares: 28,
        impressions: 1500,
      },
    },
    {
      id: "post-4",
      title: "Mary Professional Introduction",
      platform: "linkedin",
      status: "published",
      pillar: "character-introduction",
      characterId: "mary-magnumbytes",
      content: {
        caption: "Introducing Mary Magnumbytes: The Digital Storyteller\n\nIn autonomous business operations, there's no shortage of data. The shortage is of people who can translate that data into narratives that actually drive decisions.\n\nThat's where Mary comes in.\n\nAs our Digital Storyteller and AI-Powered Content Creator, Mary brings 15 years of experience in digital forensic analysis, narrative strategy for complex technical systems, and data-driven storytelling.",
        imageType: "poster",
        hashtags: ["#DigitalStorytelling", "#AutonomousSystems", "#AI", "#DataAnalytics", "#Leadership"],
      },
      metrics: {
        likes: 156,
        comments: 23,
        shares: 12,
        impressions: 890,
      },
    },
    {
      id: "post-5",
      title: "Mac Leadership Wisdom",
      platform: "linkedin",
      status: "published",
      pillar: "difficult-decisions",
      characterId: "mac-nazarene",
      content: {
        caption: "The Shadow Work Specialist: Why Every Autonomous System Needs Mac Nazarene\n\nWe built our autonomous business operating system to handle complex operations, make strategic decisions, and optimize performance across multiple platforms.\n\nBut here's what we learned: The hardest decisions aren't technical. They're human.\n\nThat's why Mac Nazarene is essential to the TaK-Tiapmaatzu OS.",
        imageType: "poster",
        hashtags: ["#Leadership", "#Integrity", "#AutonomousOps", "#BusinessEthics", "#DecisionMaking"],
      },
      metrics: {
        likes: 134,
        comments: 19,
        shares: 8,
        impressions: 720,
      },
    },
    {
      id: "post-6",
      title: "Mary One-Liner",
      platform: "twitter",
      status: "published",
      pillar: "digital-privacy-wisdom",
      characterId: "mary-magnumbytes",
      content: {
        caption: "Your browser history tells a story you probably wouldn't read aloud to your mother.\n\n- Mary Magnumbytes",
        hashtags: ["#DataPrivacy", "#CyberSecurity", "#DigitalFootprint"],
      },
      metrics: {
        likes: 89,
        comments: 7,
        shares: 24,
        impressions: 450,
      },
    },
    {
      id: "post-7",
      title: "Mac Wisdom",
      platform: "twitter",
      status: "published",
      pillar: "difficult-decisions",
      characterId: "mac-nazarene",
      content: {
        caption: "The truth doesn't get easier with time. You just get stronger at carrying it.\n\n- Mac Nazarene",
        hashtags: ["#Integrity", "#Leadership", "#Wisdom"],
      },
      metrics: {
        likes: 112,
        comments: 9,
        shares: 31,
        impressions: 520,
      },
    },
    {
      id: "post-8",
      title: "Mary Introduction Video",
      platform: "tiktok",
      status: "planned",
      pillar: "character-introduction",
      characterId: "mary-magnumbytes",
      content: {
        caption: "Your data isn't private because someone promised it would be. It's private because you made it too expensive to steal. - Mary Magnumbytes",
        imageType: "avatar",
        hashtags: ["#DataPrivacy", "#CyberSecurity"],
      },
    },
    {
      id: "post-9",
      title: "Mac Wisdom Video",
      platform: "tiktok",
      status: "planned",
      pillar: "difficult-decisions",
      characterId: "mac-nazarene",
      content: {
        caption: "You can't fix what you won't look at. But looking doesn't mean you have to like what you see. - Mac Nazarene",
        imageType: "avatar",
        hashtags: ["#Integrity", "#Wisdom"],
      },
    },
    {
      id: "post-10",
      title: "Mary and Mac Dialogue Scene",
      platform: "tiktok",
      status: "idea",
      pillar: "behind-the-scenes",
      characterId: "mary-magnumbytes",
      content: {
        script: `Mary: "I've been going through this client's server logs for three days. The pattern is so obvious it's almost insulting."\n\nMac: "And what does the client want you to do with this information?"\n\nMary: "They want a villain. I need to give them the truth."\n\nMac: "Then you already know what you're going to do."`,
        hashtags: ["#MaryAndMac", "#TaKTiapmaatzu", "#DataIntegrity"],
      },
    },
  ],
};

export function getPostsByPlatform(platform: Platform): ContentPost[] {
  return SAMPLE_CAMPAIGN.posts.filter((post) => post.platform === platform);
}

export function getPostsByStatus(status: ContentStatus): ContentPost[] {
  return SAMPLE_CAMPAIGN.posts.filter((post) => post.status === status);
}

export function getPostsByCharacter(characterId: string): ContentPost[] {
  return SAMPLE_CAMPAIGN.posts.filter((post) => post.characterId === characterId);
}

// Update character content counts
export function updateCharacterContentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  SAMPLE_CAMPAIGN.posts.forEach((post) => {
    if (post.characterId) {
      counts[post.characterId] = (counts[post.characterId] || 0) + 1;
    }
  });
  return counts;
}

export function getPostsByPillar(pillar: ContentPillar): ContentPost[] {
  return SAMPLE_CAMPAIGN.posts.filter((post) => post.pillar === pillar);
}

// CRUD Operations for content management
export function addPost(post: Omit<ContentPost, "id">): ContentPost {
  const newPost: ContentPost = {
    ...post,
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  SAMPLE_CAMPAIGN.posts.push(newPost);
  return newPost;
}

export function updatePost(id: string, updates: Partial<ContentPost>): ContentPost | null {
  const index = SAMPLE_CAMPAIGN.posts.findIndex((post) => post.id === id);
  if (index === -1) return null;
  SAMPLE_CAMPAIGN.posts[index] = { ...SAMPLE_CAMPAIGN.posts[index], ...updates };
  return SAMPLE_CAMPAIGN.posts[index];
}

export function deletePost(id: string): boolean {
  const index = SAMPLE_CAMPAIGN.posts.findIndex((post) => post.id === id);
  if (index === -1) return false;
  SAMPLE_CAMPAIGN.posts.splice(index, 1);
  return true;
}

// Analytics functions
export function getPlatformMetrics() {
  const metrics: Record<Platform, { count: number; totalLikes: number; totalImpressions: number; engagementRate: number }> = {
    instagram: { count: 0, totalLikes: 0, totalImpressions: 0, engagementRate: 0 },
    linkedin: { count: 0, totalLikes: 0, totalImpressions: 0, engagementRate: 0 },
    twitter: { count: 0, totalLikes: 0, totalImpressions: 0, engagementRate: 0 },
    tiktok: { count: 0, totalLikes: 0, totalImpressions: 0, engagementRate: 0 },
  };

  SAMPLE_CAMPAIGN.posts.forEach((post) => {
    const platform = post.platform;
    metrics[platform].count++;
    metrics[platform].totalLikes += post.metrics?.likes || 0;
    metrics[platform].totalImpressions += post.metrics?.impressions || 0;
  });

  // Calculate engagement rates
  Object.keys(metrics).forEach((platform) => {
    const p = platform as Platform;
    const totalEngagement = SAMPLE_CAMPAIGN.posts
      .filter((post) => post.platform === p)
      .reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
    metrics[p].engagementRate = metrics[p].totalImpressions > 0 
      ? (totalEngagement / metrics[p].totalImpressions) * 100 
      : 0;
  });

  return metrics;
}

export function getPillarMetrics() {
  const metrics: Record<ContentPillar, { count: number; avgEngagement: number }> = {
    "character-introduction": { count: 0, avgEngagement: 0 },
    "digital-privacy-wisdom": { count: 0, avgEngagement: 0 },
    "difficult-decisions": { count: 0, avgEngagement: 0 },
    "behind-the-scenes": { count: 0, avgEngagement: 0 },
    "system-capabilities": { count: 0, avgEngagement: 0 },
  };

  SAMPLE_CAMPAIGN.posts.forEach((post) => {
    metrics[post.pillar].count++;
  });

  // Calculate average engagement per pillar
  Object.keys(metrics).forEach((pillar) => {
    const p = pillar as ContentPillar;
    const pillarPosts = SAMPLE_CAMPAIGN.posts.filter((post) => post.pillar === p);
    const totalEngagement = pillarPosts.reduce(
      (sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0),
      0
    );
    metrics[p].avgEngagement = pillarPosts.length > 0 ? totalEngagement / pillarPosts.length : 0;
  });

  return metrics;
}

export function exportToCSV(): string {
  const headers = ["ID", "Title", "Platform", "Status", "Pillar", "Character", "Likes", "Comments", "Shares", "Impressions"];
  const rows = SAMPLE_CAMPAIGN.posts.map((post) => [
    post.id,
    post.title,
    post.platform,
    post.status,
    post.pillar,
    post.characterId || "",
    post.metrics?.likes || 0,
    post.metrics?.comments || 0,
    post.metrics?.shares || 0,
    post.metrics?.impressions || 0,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
}

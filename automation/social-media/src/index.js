#!/usr/bin/env node
/**
 * ChiefPilot Social Media Automation
 * Handles Instagram and TikTok posting, scheduling, and engagement tracking
 */

import dotenv from 'dotenv';
import cron from 'node-cron';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

dotenv.config();

const characterDbPath = process.env.CHARACTER_DATABASE_PATH || '/Users/jypsee72/Desktop/Tiapma\'atzu-OS-Toolkit/core/character-database/Character Database';
const visualAssetsPath = process.env.VISUAL_ASSETS_PATH || '/Users/jypsee72/Desktop/Tiapma\'atzu-OS-Toolkit/content/visual-assets';

// Content calendar (in-memory, move to database in production)
const contentCalendar = new Map();
const engagementData = new Map();
const postedContent = new Map();

// Platform configuration
const platforms = {
  instagram: {
    enabled: true,
    frequency: parseInt(process.env.POST_FREQUENCY_INSTAGRAM) || 3, // posts per week
    optimalTimes: ['09:00', '12:00', '18:00'],
    hashtags: ['#GildedMirrors', '#ChiefPilot', '#CharacterArt', '#AIGenerated', '#StopMotion', '#Puppetry'],
  },
  tiktok: {
    enabled: true,
    frequency: parseInt(process.env.POST_FREQUENCY_TIKTOK) || 2, // posts per week
    optimalTimes: ['10:00', '16:00', '20:00'],
    hashtags: ['#GildedMirrors', '#ChiefPilot', '#CharacterReveal', '#AICharacter', '#PuppetArt', '#StopMotion'],
  }
};

// Content types
const contentTypes = {
  character_reveal: {
    template: 'Character Reveal: {name}\n\n{bio}\n\nArchetype: {archetype}\nRarity: {rarity}\n\n{hashtags}',
    media: 'portrait',
  },
  poster_showcase: {
    template: 'Poster Showcase: {name}\n\n{title}\n\nDramatic cinematic composition featuring {name} in the Gilded Mirrors universe.\n\n{hashtags}',
    media: 'poster',
  },
  avatar_spotlight: {
    template: 'Avatar Spotlight: {name}\n\n{archetype} • {element}\n\n{hashtags}',
    media: 'avatar',
  },
  story_preview: {
    template: 'Story Preview: {name}\n\n{narrative}\n\nFollow for more Gilded Mirrors content!\n\n{hashtags}',
    media: 'story',
  }
};

// Initialize content calendar
function initializeContentCalendar() {
  console.log('📅 Initializing content calendar...');

  // Load characters from database
  const characters = loadCharacterList();
  console.log(`👤 Loaded ${characters.length} characters`);

  // Generate content schedule for next 30 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  let currentDate = new Date(startDate);
  let postIndex = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends (optional)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Schedule Instagram posts
      if (platforms.instagram.enabled && postIndex % Math.floor(7 / platforms.instagram.frequency) === 0) {
        const content = generateContent(characters, 'instagram');
        const scheduledTime = getRandomOptimalTime('instagram');
        const scheduledDate = new Date(currentDate);
        const [hours, minutes] = scheduledTime.split(':');
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        contentCalendar.set(`instagram-${scheduledDate.toISOString()}`, {
          platform: 'instagram',
          content,
          scheduledDate,
          status: 'scheduled',
        });
      }

      // Schedule TikTok posts
      if (platforms.tiktok.enabled && postIndex % Math.floor(7 / platforms.tiktok.frequency) === 0) {
        const content = generateContent(characters, 'tiktok');
        const scheduledTime = getRandomOptimalTime('tiktok');
        const scheduledDate = new Date(currentDate);
        const [hours, minutes] = scheduledTime.split(':');
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        contentCalendar.set(`tiktok-${scheduledDate.toISOString()}`, {
          platform: 'tiktok',
          content,
          scheduledDate,
          status: 'scheduled',
        });
      }

      postIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`📅 Scheduled ${contentCalendar.size} posts for the next 30 days`);
}

function generateContent(characters, platform) {
  const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
  const contentTypesList = Object.keys(contentTypes);
  const randomContentType = contentTypesList[Math.floor(Math.random() * contentTypesList.length)];
  const contentType = contentTypes[randomContentType];

  // Load character details
  const character = loadCharacter(randomCharacter);

  // Generate caption
  const caption = contentType.template
    .replace('{name}', character?.name || randomCharacter)
    .replace('{bio}', character?.bio || 'Mysterious figure from the Gilded Mirrors universe')
    .replace('{title}', character?.title || 'Legendary Character')
    .replace('{archetype}', character?.archetype || 'Unknown')
    .replace('{rarity}', character?.rarity || 'Legendary')
    .replace('{element}', character?.element || 'Aether')
    .replace('{narrative}', `${randomCharacter} embarks on a journey through the Gilded Mirrors universe.`)
    .replace('{hashtags}', platforms[platform].hashtags.join(' '));

  // Find media file
  const mediaFile = findMediaFile(randomCharacter, contentType.media);

  return {
    character: randomCharacter,
    contentType: randomContentType,
    caption,
    mediaFile,
    hashtags: platforms[platform].hashtags,
  };
}

function findMediaFile(characterName, mediaType) {
  // Try to find the media file in the character database images directory
  const imagesDir = join(characterDbPath, 'images');
  if (existsSync(imagesDir)) {
    const files = readdirSync(imagesDir);
    const match = files.find(f => f.toLowerCase().includes(characterName.toLowerCase()) && f.toLowerCase().includes(mediaType));
    if (match) {
      return join(imagesDir, match);
    }
  }

  // Fallback to visual-assets directory
  const assetsDir = join(visualAssetsPath, 'characters');
  if (existsSync(assetsDir)) {
    const files = readdirSync(assetsDir);
    const match = files.find(f => f.toLowerCase().includes(characterName.toLowerCase()) && f.toLowerCase().includes(mediaType));
    if (match) {
      return join(assetsDir, match);
    }
  }

  return null;
}

function getRandomOptimalTime(platform) {
  const times = platforms[platform].optimalTimes;
  return times[Math.floor(Math.random() * times.length)];
}

function loadCharacterList() {
  try {
    const files = readdirSync(characterDbPath);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', '').split(' ').slice(0, -1).join(' '));
  } catch (error) {
    console.error('Failed to load character list:', error);
    return [];
  }
}

function loadCharacter(name) {
  try {
    const files = readdirSync(characterDbPath);
    const match = files.find(f => f.toLowerCase().includes(name.toLowerCase()));

    if (!match) return null;

    const filePath = join(characterDbPath, match);
    const content = readFileSync(filePath, 'utf-8');

    const lines = content.split('\n');
    const character = { name };

    lines.forEach(line => {
      if (line.startsWith('# ')) character.title = line.replace('# ', '');
      if (line.includes('Archetype')) character.archetype = line.split(':')[1]?.trim();
      if (line.includes('Rarity')) character.rarity = line.split(':')[1]?.trim();
      if (line.includes('Element')) character.element = line.split(':')[1]?.trim();
      if (line.includes('Bio')) character.bio = line.split(':')[1]?.trim();
    });

    return character;
  } catch (error) {
    console.error(`Failed to load character ${name}:`, error);
    return null;
  }
}

// Post to platform (placeholder for actual API integration)
async function postToInstagram(content) {
  console.log(`📸 Posting to Instagram: ${content.character} (${content.contentType})`);
  console.log(`📝 Caption: ${content.caption.substring(0, 100)}...`);

  // Placeholder for actual Instagram API integration
  // const ig = new InstagramApi({ username: process.env.INSTAGRAM_USERNAME, password: process.env.INSTAGRAM_PASSWORD });
  // await ig.uploadPhoto({ file: content.mediaFile, caption: content.caption });

  // Simulate posting
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Track engagement
  trackEngagement('instagram', content);

  console.log('✅ Instagram post successful');
  return true;
}

async function postToTikTok(content) {
  console.log(`🎵 Posting to TikTok: ${content.character} (${content.contentType})`);
  console.log(`📝 Caption: ${content.caption.substring(0, 100)}...`);

  // Placeholder for actual TikTok API integration
  // const tiktok = new TikTokApi({ username: process.env.TIKTOK_USERNAME, password: process.env.TIKTOK_PASSWORD });
  // await tiktok.uploadVideo({ file: content.mediaFile, caption: content.caption });

  // Simulate posting
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Track engagement
  trackEngagement('tiktok', content);

  console.log('✅ TikTok post successful');
  return true;
}

function trackEngagement(platform, content) {
  const key = `${platform}-${content.character}`;
  if (!engagementData.has(key)) {
    engagementData.set(key, {
      platform,
      character: content.character,
      posts: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      lastPosted: null,
    });
  }

  const data = engagementData.get(key);
  data.posts++;
  data.lastPosted = new Date();

  // Simulate engagement metrics (replace with actual API data)
  data.likes += Math.floor(Math.random() * 100) + 10;
  data.comments += Math.floor(Math.random() * 20) + 1;
  data.shares += Math.floor(Math.random() * 10) + 1;
}

// Scheduled task runner
function startScheduler() {
  console.log('⏰ Starting social media scheduler...');

  // Check every minute for scheduled posts
  cron.schedule('* * * * *', () => {
    const now = new Date();
    const nowString = now.toISOString();

    for (const [key, scheduled] of contentCalendar) {
      if (scheduled.status === 'scheduled' && new Date(scheduled.scheduledDate) <= now) {
        console.log(`🚀 Executing scheduled post: ${key}`);

        // Post to platform
        if (scheduled.platform === 'instagram') {
          postToInstagram(scheduled.content);
        } else if (scheduled.platform === 'tiktok') {
          postToTikTok(scheduled.content);
        }

        // Update status
        scheduled.status = 'posted';
        postedContent.set(key, scheduled);
        contentCalendar.delete(key);
      }
    }
  });

  // Generate engagement report daily at midnight
  cron.schedule('0 0 * * *', () => {
    generateEngagementReport();
  });

  console.log('✅ Scheduler started');
}

function generateEngagementReport() {
  console.log('📊 Generating engagement report...');

  const report = {
    date: new Date().toISOString(),
    platforms: {
      instagram: { posts: 0, totalLikes: 0, totalComments: 0, totalShares: 0 },
      tiktok: { posts: 0, totalLikes: 0, totalComments: 0, totalShares: 0 },
    },
    topPerformingCharacters: [],
  };

  engagementData.forEach((data) => {
    if (data.platform === 'instagram') {
      report.platforms.instagram.posts += data.posts;
      report.platforms.instagram.totalLikes += data.likes;
      report.platforms.instagram.totalComments += data.comments;
      report.platforms.instagram.totalShares += data.shares;
    } else if (data.platform === 'tiktok') {
      report.platforms.tiktok.posts += data.posts;
      report.platforms.tiktok.totalLikes += data.likes;
      report.platforms.tiktok.totalComments += data.comments;
      report.platforms.tiktok.totalShares += data.shares;
    }
  });

  // Find top performing characters
  const characterPerformance = new Map();
  engagementData.forEach((data) => {
    const totalEngagement = data.likes + data.comments + data.shares;
    if (!characterPerformance.has(data.character)) {
      characterPerformance.set(data.character, 0);
    }
    characterPerformance.set(data.character, characterPerformance.get(data.character) + totalEngagement);
  });

  report.topPerformingCharacters = Array.from(characterPerformance.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([character, engagement]) => ({ character, totalEngagement: engagement }));

  console.log('📊 Engagement Report:');
  console.log(JSON.stringify(report, null, 2));

  return report;
}

// Manual post command
async function manualPost(platform, characterName, contentType) {
  console.log(`📝 Manual post to ${platform}: ${characterName} (${contentType})`);

  const characters = loadCharacterList();
  const character = characterName || characters[Math.floor(Math.random() * characters.length)];
  const content = generateContent([character], platform);

  if (platform === 'instagram') {
    await postToInstagram(content);
  } else if (platform === 'tiktok') {
    await postToTikTok(content);
  }
}

// CLI interface
if (process.argv.length > 2) {
  const command = process.argv[2];

  if (command === 'post') {
    const platform = process.argv[3];
    const character = process.argv[4];
    const type = process.argv[5];

    if (!platform || !['instagram', 'tiktok'].includes(platform)) {
      console.error('Usage: node src/index.js post [instagram|tiktok] [character] [type]');
      process.exit(1);
    }

    manualPost(platform, character, type);
  } else if (command === 'report') {
    generateEngagementReport();
  } else if (command === 'schedule') {
    initializeContentCalendar();
    startScheduler();
  } else {
    console.error('Unknown command. Available: post, report, schedule');
    process.exit(1);
  }
} else {
  // Default: initialize and start scheduler
  initializeContentCalendar();
  startScheduler();

  console.log('🚀 Social Media Automation started');
  console.log('📸 Instagram: Enabled');
  console.log('🎵 TikTok: Enabled');
  console.log('⏰ Scheduler: Running');
  console.log('\nCommands:');
  console.log('  node src/index.js post [instagram|tiktok] [character] [type] - Manual post');
  console.log('  node src/index.js report - Generate engagement report');
  console.log('  node src/index.js schedule - Restart scheduler');
}

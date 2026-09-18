const cron = require('node-cron');
const NotionSync = require('./notion-client');
const db = require('./database');

const notionSync = new NotionSync();

// Sync analytics daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Starting daily analytics sync...');
    
    // Get analytics from database
    const analytics = await db.getDailyAnalytics();
    
    // Sync to Notion
    await notionSync.syncAnalytics({
      platform: 'Telegram',
      ...analytics,
    });
    
    console.log('Daily analytics sync completed');
  } catch (error) {
    console.error('Daily analytics sync failed:', error);
  }
});

// Sync character data weekly
cron.schedule('0 0 * * 0', async () => {
  try {
    console.log('Starting weekly character sync...');
    
    // Get character data from file system
    const characters = require('../organized-content/character-database');
    
    // Sync each character
    for (const character of characters) {
      await notionSync.syncCharacter(character);
    }
    
    console.log('Weekly character sync completed');
  } catch (error) {
    console.error('Weekly character sync failed:', error);
  }
});

console.log('Scheduled Notion sync jobs started');
console.log('- Daily analytics sync: 00:00');
console.log('- Weekly character sync: Sunday 00:00');
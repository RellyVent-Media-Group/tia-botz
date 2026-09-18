const { Client } = require('@notionhq/client');

class NotionSync {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  // User Sync Methods
  async syncUser(telegramId, userData) {
    try {
      // Check if user exists
      const existingUser = await this.findUserByTelegramId(telegramId);
      
      if (existingUser) {
        // Update existing user
        return await this.notion.pages.update({
          page_id: existingUser.id,
          properties: {
            'Last Active': { date: { start: new Date().toISOString() } },
            'WhatsApp ID': userData.whatsappId ? { 
              phone_number: userData.whatsappId 
            } : existingUser.properties['WhatsApp ID'],
          },
        });
      } else {
        // Create new user
        return await this.notion.pages.create({
          parent: {
            database_id: process.env.NOTION_USERS_DATABASE_ID,
          },
          properties: {
            'Name': { 
              title: [{ text: { content: userData.name || 'Unknown' } }] 
            },
            'Telegram ID': { 
              phone_number: telegramId 
            },
            'Platform': { 
              select: { name: 'Telegram' } 
            },
            'Join Date': { 
              date: { start: new Date().toISOString() } 
            },
            'Last Active': { 
              date: { start: new Date().toISOString() } 
            },
          },
        });
      }
    } catch (error) {
      console.error('Error syncing user to Notion:', error);
      throw error;
    }
  }

  async findUserByTelegramId(telegramId) {
    try {
      const response = await this.notion.databases.query({
        database_id: process.env.NOTION_USERS_DATABASE_ID,
        filter: {
          property: 'Telegram ID',
          phone_number: { equals: telegramId },
        },
      });
      return response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  // Character Sync Methods
  async syncCharacter(characterData) {
    try {
      const existingCharacter = await this.findCharacterByName(characterData.name);
      
      if (existingCharacter) {
        return await this.notion.pages.update({
          page_id: existingCharacter.id,
          properties: {
            'Personality': { 
              rich_text: [{ text: { content: characterData.personality } }] 
            },
            'Last Updated': { 
              date: { start: new Date().toISOString() } 
            },
          },
        });
      } else {
        return await this.notion.pages.create({
          parent: {
            database_id: process.env.NOTION_CHARACTERS_DATABASE_ID,
          },
          properties: {
            'Name': { 
              title: [{ text: { content: characterData.name } }] 
            },
            'Type': { 
              select: { name: characterData.type || 'Main' } 
            },
            'Personality': { 
              rich_text: [{ text: { content: characterData.personality } }] 
            },
            'Voice Style': { 
              rich_text: [{ text: { content: characterData.voiceStyle } }] 
            },
            'Tags': { 
              multi_select: characterData.tags.map(tag => ({ name: tag })) 
            },
            'Created Date': { 
              date: { start: new Date().toISOString() } 
            },
          },
        });
      }
    } catch (error) {
      console.error('Error syncing character:', error);
      throw error;
    }
  }

  async findCharacterByName(name) {
    try {
      const response = await this.notion.databases.query({
        database_id: process.env.NOTION_CHARACTERS_DATABASE_ID,
        filter: {
          property: 'Name',
          title: { equals: name },
        },
      });
      return response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('Error finding character:', error);
      return null;
    }
  }

  // Content Prompt Sync
  async syncPrompt(promptData) {
    try {
      return await this.notion.pages.create({
        parent: {
          database_id: process.env.NOTION_PROMPTS_DATABASE_ID,
        },
        properties: {
          'Title': { 
            title: [{ text: { content: promptData.title } }] 
          },
          'Character': { 
            relation: [{ id: promptData.characterId }] 
          },
          'Type': { 
            select: { name: promptData.type } 
          },
          'Style': { 
            select: { name: promptData.style } 
          },
          'Prompt Text': { 
            rich_text: [{ text: { content: promptData.prompt } }] 
          },
          'Status': { 
            select: { name: 'Draft' } 
          },
          'Created Date': { 
            date: { start: new Date().toISOString() } 
          },
        },
      });
    } catch (error) {
      console.error('Error syncing prompt:', error);
      throw error;
    }
  }

  // Analytics Sync
  async syncAnalytics(analyticsData) {
    try {
      return await this.notion.pages.create({
        parent: {
          database_id: process.env.NOTION_ANALYTICS_DATABASE_ID,
        },
        properties: {
          'Date': { 
            date: { start: new Date().toISOString() } 
          },
          'Platform': { 
            select: { name: analyticsData.platform } 
          },
          'Total Users': { 
            number: analyticsData.totalUsers 
          },
          'Active Users': { 
            number: analyticsData.activeUsers 
          },
          'Commands Executed': { 
            number: analyticsData.commandsExecuted 
          },
          'Content Generated': { 
            number: analyticsData.contentGenerated 
          },
          'Errors': { 
            number: analyticsData.errors 
          },
          'Response Time': { 
            number: analyticsData.responseTime 
          },
        },
      });
    } catch (error) {
      console.error('Error syncing analytics:', error);
      throw error;
    }
  }

  // Admin Log Sync
  async logAdminActivity(logData) {
    try {
      return await this.notion.pages.create({
        parent: {
          database_id: process.env.NOTION_ADMIN_LOGS_DATABASE_ID,
        },
        properties: {
          'Timestamp': { 
            date: { start: new Date().toISOString() } 
          },
          'Admin': { 
            relation: [{ id: logData.adminId }] 
          },
          'Action': { 
            select: { name: logData.action } 
          },
          'Details': { 
            rich_text: [{ text: { content: logData.details } }] 
          },
          'Status': { 
            select: { name: logData.status } 
          },
          'IP Address': { 
            rich_text: [{ text: { content: logData.ipAddress } }] 
          },
        },
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
      throw error;
    }
  }
}

module.exports = NotionSync;
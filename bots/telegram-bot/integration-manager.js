const NotionSync = require('./notion-client');
const { Resend } = require('resend');

class IntegrationManager {
  constructor() {
    this.notion = new NotionSync();
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3001';
    this.apiKey = process.env.WEBHOOK_API_KEY;
  }

  // Sync user when they interact with bot
  async syncUserActivity(telegramId, userData) {
    try {
      await this.notion.syncUser(telegramId, userData);
      console.log(`User ${telegramId} synced to Notion`);
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  }

  // Log analytics data
  async logAnalytics(analyticsData) {
    try {
      await this.notion.syncAnalytics(analyticsData);
      console.log('Analytics synced to Notion');
    } catch (error) {
      console.error('Failed to sync analytics:', error);
    }
  }

  // Send notification via multiple channels
  async sendNotification(message, options = {}) {
    const { email, priority = 'normal', platform = 'all' } = options;
    
    try {
      // Send system notification
      const { exec } = require('child_process');
      exec(`osascript -e 'display notification "${message}" with title "Bot System"'`);

      // Send email if provided
      if (email && process.env.RESEND_API_KEY) {
        await this.resend.emails.send({
          from: 'Eternity Calls Bot System <noreply@rellyvent.com>',
          to: email,
          subject: `Bot System Notification (${priority})`,
          html: `<p>${message}</p><p><small>Sent via Eternity Calls Bot System</small></p>`
        });
      }

      // Send webhook notification
      if (platform === 'all' || platform === 'webhook') {
        await fetch(`${this.webhookUrl}/api/webhook/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({ message, priority, email })
        });
      }

      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Generate content and sync to Notion
  async generateAndSyncContent(promptData) {
    try {
      // Sync prompt to Notion
      await this.notion.syncPrompt(promptData);
      
      // Call webhook for generation
      const response = await fetch(`${this.webhookUrl}/api/webhook/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: promptData.prompt,
          character: promptData.character,
          type: promptData.type
        })
      });

      const result = await response.json();
      console.log('Content generated:', result);
      return result;
    } catch (error) {
      console.error('Failed to generate and sync content:', error);
      throw error;
    }
  }

  // Health check across all integrations
  async performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    try {
      // Check webhook server
      const webhookResponse = await fetch(`${this.webhookUrl}/health`);
      health.services.webhook = webhookResponse.ok ? 'healthy' : 'unhealthy';

      // Check Notion connection
      try {
        await this.notion.findUserByTelegramId('test');
        health.services.notion = 'healthy';
      } catch (error) {
        health.services.notion = 'unhealthy';
      }

      // Check Resend
      if (process.env.RESEND_API_KEY) {
        health.services.resend = 'configured';
      } else {
        health.services.resend = 'not configured';
      }

      // Check local services
      const { exec } = require('child_process');
      
      // Check PM2 status
      exec('pm2 status', (error, stdout) => {
        health.services.pm2 = error ? 'unhealthy' : 'healthy';
        health.services.telegram = stdout.includes('chiefpilot-telegram') ? 'online' : 'offline';
        health.services.whatsapp = stdout.includes('chiefpilot-whatsapp') ? 'online' : 'offline';
      });

      // Check Ollama
      exec('curl -s http://localhost:11434/api/tags', (error) => {
        health.services.ollama = error ? 'unhealthy' : 'healthy';
      });

      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      health.error = error.message;
      return health;
    }
  }

  // Admin activity logging
  async logAdminActivity(logData) {
    try {
      await this.notion.logAdminActivity(logData);
      console.log('Admin activity logged to Notion');
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  }

  // Character data sync
  async syncCharacterData(characterData) {
    try {
      await this.notion.syncCharacter(characterData);
      console.log(`Character ${characterData.name} synced to Notion`);
    } catch (error) {
      console.error('Failed to sync character:', error);
    }
  }

  // Network diagnostics integration
  async runNetworkDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test Telegram API
      const telegramTest = await this.testConnection('https://api.telegram.org');
      diagnostics.tests.telegram = telegramTest;

      // Test Ollama
      const ollamaTest = await this.testConnection('http://localhost:11434/api/tags');
      diagnostics.tests.ollama = ollamaTest;

      // Test webhook server
      const webhookTest = await this.testConnection(`${this.webhookUrl}/health`);
      diagnostics.tests.webhook = webhookTest;

      return diagnostics;
    } catch (error) {
      console.error('Network diagnostics failed:', error);
      diagnostics.error = error.message;
      return diagnostics;
    }
  }

  async testConnection(url) {
    try {
      const response = await fetch(url);
      return {
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        latency: response.headers.get('x-response-time') || 'unknown'
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      };
    }
  }

  // Integration with automation tools
  async triggerAutomation(automationType, data) {
    try {
      switch (automationType) {
        case 'health_check':
          return await this.performHealthCheck();
        case 'network_diagnostics':
          return await this.runNetworkDiagnostics();
        case 'notification':
          return await this.sendNotification(data.message, data.options);
        case 'content_generation':
          return await this.generateAndSyncContent(data);
        default:
          throw new Error(`Unknown automation type: ${automationType}`);
      }
    } catch (error) {
      console.error(`Automation ${automationType} failed:`, error);
      throw error;
    }
  }
}

module.exports = IntegrationManager;
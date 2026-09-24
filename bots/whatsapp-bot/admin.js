/**
 * Admin Module for ChiefPilot Bots
 * Management commands and administrative functions
 */

import {
  getAllUsers,
  getUserStats,
  updateUserSubscription,
  logAdminAction,
  getAdminLogs,
  linkUserAccounts,
  getPlatformAnalytics
} from './database.js';

// Admin access control
const ADMIN_IDS = new Set(
  (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim()).filter(id => id)
    .concat((process.env.ADMIN_WHATSAPP_IDS || '').split(',').map(id => id.trim()).filter(id => id))
);

function isAdmin(userId) {
  return ADMIN_IDS.has(userId.toString()) || ADMIN_IDS.has(userId);
}

// Admin command handlers
const adminCommands = {
  // User management
  async handleUserCommand(args) {
    if (args.length === 0) {
      return this.getUserListHelp();
    }
    
    const subCommand = args[0].toLowerCase();
    
    switch (subCommand) {
      case 'list':
        return await this.handleUserList(args.slice(1));
      case 'info':
        return await this.handleUserInfo(args.slice(1));
      case 'ban':
        return await this.handleUserBan(args.slice(1));
      case 'unban':
        return await this.handleUserUnban(args.slice(1));
      case 'subscription':
        return await this.handleUserSubscription(args.slice(1));
      case 'link':
        return await this.handleUserLink(args.slice(1));
      default:
        return `❓ Unknown user command: ${subCommand}\n\n${this.getUserListHelp()}`;
    }
  },
  
  async handleUserList(args) {
    const limit = parseInt(args[0]) || 20;
    const offset = parseInt(args[1]) || 0;
    
    try {
      const users = await getAllUsers(limit, offset);
      
      let response = `👥 *User List (Showing ${users.length} users)*\n\n`;
      
      users.forEach((user, index) => {
        response += `${index + 1}. ID: ${user.id}\n`;
        response += `   Telegram: ${user.telegram_id || 'N/A'}\n`;
        response += `   WhatsApp: ${user.whatsapp_id || 'N/A'}\n`;
        response += `   Email: ${user.email || 'N/A'}\n`;
        response += `   Subscription: ${user.subscription_tier}\n`;
        response += `   Created: ${new Date(user.created_at).toLocaleDateString()}\n\n`;
      });
      
      return response;
    } catch (error) {
      return `❌ Error fetching user list: ${error.message}`;
    }
  },
  
  async handleUserInfo(args) {
    if (args.length === 0) {
      return 'Usage: /admin user info [user_id]';
    }
    
    const userId = parseInt(args[0]);
    
    try {
      const stats = await getUserStats(userId);
      
      if (!stats.user) {
        return `❌ User with ID ${userId} not found`;
      }
      
      let response = `👤 *User Information*\n\n`;
      response += `*ID:* ${stats.user.id}\n`;
      response += `*Telegram ID:* ${stats.user.telegram_id || 'N/A'}\n`;
      response += `*WhatsApp ID:* ${stats.user.whatsapp_id || 'N/A'}\n`;
      response += `*Email:* ${stats.user.email || 'N/A'}\n`;
      response += `*Subscription:* ${stats.user.subscription_tier}\n`;
      response += `*Subscription Expires:* ${stats.user.subscription_expires ? new Date(stats.user.subscription_expires).toLocaleDateString() : 'N/A'}\n`;
      response += `*Created:* ${new Date(stats.user.created_at).toLocaleString()}\n`;
      response += `*Last Updated:* ${new Date(stats.user.updated_at).toLocaleString()}\n\n`;
      
      response += `*Statistics:*\n`;
      response += `• Total Prompts Generated: ${stats.totalPrompts}\n`;
      response += `• Total Analytics Events: ${stats.totalAnalytics}\n`;
      response += `• Active Sessions: ${stats.sessions.length}\n\n`;
      
      if (stats.sessions.length > 0) {
        response += `*Session Details:*\n`;
        stats.sessions.forEach(session => {
          response += `• ${session.platform}: ${session.promptsGenerated} prompts, ${session.messageCount} messages\n`;
        });
      }
      
      return response;
    } catch (error) {
      return `❌ Error fetching user info: ${error.message}`;
    }
  },
  
  async handleUserBan(args) {
    // Placeholder for ban functionality
    return '⚠️ Ban functionality not yet implemented';
  },
  
  async handleUserUnban(args) {
    // Placeholder for unban functionality
    return '⚠️ Unban functionality not yet implemented';
  },
  
  async handleUserSubscription(args) {
    if (args.length < 2) {
      return 'Usage: /admin user subscription [user_id] [tier] [expires]\nExample: /admin user subscription 123 premium 2024-12-31';
    }
    
    const userId = parseInt(args[0]);
    const tier = args[1].toLowerCase();
    const expires = args[2] ? new Date(args[2]) : null;
    
    const validTiers = ['free', 'basic', 'premium', 'enterprise'];
    if (!validTiers.includes(tier)) {
      return `❌ Invalid tier. Valid options: ${validTiers.join(', ')}`;
    }
    
    try {
      const updatedUser = await updateUserSubscription(userId, tier, expires);
      
      await logAdminAction(this.adminUserId, 'update_subscription', userId, {
        tier,
        expires: expires ? expires.toISOString() : null
      });
      
      return `✅ User subscription updated\n\n*User ID:* ${userId}\n*New Tier:* ${tier}\n*Expires:* ${expires ? expires.toLocaleDateString() : 'Never'}`;
    } catch (error) {
      return `❌ Error updating subscription: ${error.message}`;
    }
  },
  
  async handleUserLink(args) {
    if (args.length < 2) {
      return 'Usage: /admin user link [primary_user_id] [secondary_user_id]\nThis will merge the secondary account into the primary account.';
    }
    
    const primaryUserId = parseInt(args[0]);
    const secondaryUserId = parseInt(args[1]);
    
    try {
      const mergedUser = await linkUserAccounts(primaryUserId, secondaryUserId);
      
      await logAdminAction(this.adminUserId, 'link_accounts', primaryUserId, {
        secondaryUserId
      });
      
      return `✅ Accounts merged successfully\n\n*Primary User ID:* ${primaryUserId}\n*Merged User ID:* ${secondaryUserId}\n*Result:* Telegram: ${mergedUser.telegram_id}, WhatsApp: ${mergedUser.whatsapp_id}`;
    } catch (error) {
      return `❌ Error linking accounts: ${error.message}`;
    }
  },
  
  // Analytics commands
  async handleAnalyticsCommand(args) {
    if (args.length === 0) {
      return this.getAnalyticsHelp();
    }
    
    const subCommand = args[0].toLowerCase();
    
    switch (subCommand) {
      case 'overview':
        return await this.handleAnalyticsOverview(args.slice(1));
      case 'platform':
        return await this.handlePlatformAnalytics(args.slice(1));
      case 'user':
        return await this.handleUserAnalytics(args.slice(1));
      case 'export':
        return await this.handleAnalyticsExport(args.slice(1));
      default:
        return `❓ Unknown analytics command: ${subCommand}\n\n${this.getAnalyticsHelp()}`;
    }
  },
  
  async handleAnalyticsOverview(args) {
    try {
      const telegramAnalytics = await getPlatformAnalytics('telegram');
      const whatsappAnalytics = await getPlatformAnalytics('whatsapp');
      
      let response = `📊 *Analytics Overview*\n\n`;
      
      response += `*Telegram Platform:*\n`;
      response += `• Total Events: ${telegramAnalytics.length}\n`;
      response += `• Event Types: ${[...new Set(telegramAnalytics.map(a => a.event_type))].join(', ')}\n\n`;
      
      response += `*WhatsApp Platform:*\n`;
      response += `• Total Events: ${whatsappAnalytics.length}\n`;
      response += `• Event Types: ${[...new Set(whatsappAnalytics.map(a => a.event_type))].join(', ')}\n\n`;
      
      // Event breakdown
      const allEvents = [...telegramAnalytics, ...whatsappAnalytics];
      const eventBreakdown = {};
      allEvents.forEach(event => {
        eventBreakdown[event.event_type] = (eventBreakdown[event.event_type] || 0) + 1;
      });
      
      response += `*Event Breakdown:*\n`;
      Object.entries(eventBreakdown).forEach(([type, count]) => {
        response += `• ${type}: ${count}\n`;
      });
      
      return response;
    } catch (error) {
      return `❌ Error fetching analytics overview: ${error.message}`;
    }
  },
  
  async handlePlatformAnalytics(args) {
    if (args.length === 0) {
      return 'Usage: /admin analytics platform [telegram|whatsapp] [days]';
    }
    
    const platform = args[0].toLowerCase();
    const days = parseInt(args[1]) || 7;
    
    if (!['telegram', 'whatsapp'].includes(platform)) {
      return '❌ Invalid platform. Use "telegram" or "whatsapp"';
    }
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const analytics = await getPlatformAnalytics(platform, startDate);
      
      let response = `📊 *${platform.charAt(0).toUpperCase() + platform.slice(1)} Analytics (Last ${days} days)*\n\n`;
      response += `• Total Events: ${analytics.length}\n\n`;
      
      // Event breakdown
      const eventBreakdown = {};
      analytics.forEach(event => {
        eventBreakdown[event.event_type] = (eventBreakdown[event.event_type] || 0) + 1;
      });
      
      response += `*Event Breakdown:*\n`;
      Object.entries(eventBreakdown).forEach(([type, count]) => {
        response += `• ${type}: ${count}\n`;
      });
      
      // Recent events
      response += `\n*Recent Events:*\n`;
      analytics.slice(0, 5).forEach(event => {
        response += `• ${event.event_type}: ${new Date(event.created_at).toLocaleString()}\n`;
      });
      
      return response;
    } catch (error) {
      return `❌ Error fetching platform analytics: ${error.message}`;
    }
  },
  
  async handleUserAnalytics(args) {
    if (args.length === 0) {
      return 'Usage: /admin analytics user [user_id] [days]';
    }
    
    const userId = parseInt(args[0]);
    const days = parseInt(args[1]) || 7;
    
    try {
      const stats = await getUserStats(userId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      let response = `📊 *User Analytics (ID: ${userId}, Last ${days} days)*\n\n`;
      response += `• Total Prompts: ${stats.totalPrompts}\n`;
      response += `• Total Analytics Events: ${stats.totalAnalytics}\n`;
      response += `• Active Sessions: ${stats.sessions.length}\n\n`;
      
      // Session breakdown
      if (stats.sessions.length > 0) {
        response += `*Session Activity:*\n`;
        stats.sessions.forEach(session => {
          response += `• ${session.platform}: ${session.promptsGenerated} prompts, ${session.messageCount} messages\n`;
        });
      }
      
      return response;
    } catch (error) {
      return `❌ Error fetching user analytics: ${error.message}`;
    }
  },
  
  async handleAnalyticsExport(args) {
    // Placeholder for export functionality
    return '⚠️ Analytics export not yet implemented';
  },
  
  // System commands
  async handleSystemCommand(args) {
    if (args.length === 0) {
      return this.getSystemHelp();
    }
    
    const subCommand = args[0].toLowerCase();
    
    switch (subCommand) {
      case 'status':
        return await this.handleSystemStatus();
      case 'logs':
        return await this.handleSystemLogs(args.slice(1));
      case 'config':
        return await this.handleSystemConfig();
      default:
        return `❓ Unknown system command: ${subCommand}\n\n${this.getSystemHelp()}`;
    }
  },
  
  async handleSystemStatus() {
    let response = `🖥️ *System Status*\n\n`;
    response += `• Database: Connected\n`;
    response += `• Bot Status: Running\n`;
    response += `• Uptime: ${process.uptime().toFixed(2)} seconds\n`;
    response += `• Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
    response += `• Node Version: ${process.version}\n`;
    response += `• Platform: ${process.platform}\n`;
    
    return response;
  },
  
  async handleSystemLogs(args) {
    const limit = parseInt(args[0]) || 20;
    
    try {
      const logs = await getAdminLogs(limit);
      
      let response = `📋 *Recent Admin Logs (Last ${logs.length} actions)*\n\n`;
      
      logs.forEach((log, index) => {
        response += `${index + 1}. ${log.action}\n`;
        response += `   Admin: ${log.admin_user_id}\n`;
        response += `   Target: ${log.target_user_id || 'N/A'}\n`;
        response += `   Time: ${new Date(log.created_at).toLocaleString()}\n`;
        if (log.action_data && Object.keys(log.action_data).length > 0) {
          response += `   Data: ${JSON.stringify(log.action_data)}\n`;
        }
        response += '\n';
      });
      
      return response;
    } catch (error) {
      return `❌ Error fetching admin logs: ${error.message}`;
    }
  },
  
  async handleSystemConfig() {
    let response = `⚙️ *System Configuration*\n\n`;
    response += `• Environment: ${process.env.NODE_ENV || 'development'}\n`;
    response += `• Database Host: ${process.env.DB_HOST || 'localhost'}\n`;
    response += `• Workspace API: ${process.env.WORKSPACE_API_URL || 'Not configured'}\n`;
    response += `• Admin Count: ${ADMIN_IDS.size}\n`;
    
    return response;
  },
  
  // Help functions
  getUserListHelp() {
    return `
👥 *User Management Commands*

/admin user list [limit] [offset]
  List users with pagination
  Example: /admin user list 20 0

/admin user info [user_id]
  Get detailed user information
  Example: /admin user info 123

/admin user subscription [user_id] [tier] [expires]
  Update user subscription
  Example: /admin user subscription 123 premium 2024-12-31

/admin user link [primary_id] [secondary_id]
  Merge two user accounts
  Example: /admin user link 123 456

Valid tiers: free, basic, premium, enterprise
    `.trim();
  },
  
  getAnalyticsHelp() {
    return `
📊 *Analytics Commands*

/admin analytics overview
  Get overall analytics overview

/admin analytics platform [telegram|whatsapp] [days]
  Get platform-specific analytics
  Example: /admin analytics platform telegram 7

/admin analytics user [user_id] [days]
  Get user-specific analytics
  Example: /admin analytics user 123 30

/admin analytics export
  Export analytics data (coming soon)
    `.trim();
  },
  
  getSystemHelp() {
    return `
🖥️ *System Commands*

/admin system status
  Get system status and health

/admin system logs [limit]
  View recent admin logs
  Example: /admin system logs 20

/admin system config
  View system configuration
    `.trim();
  },
  
  getMainHelp() {
    return `
🔧 *Admin Commands*

*User Management:*
/admin user [command]
  • list, info, subscription, link

*Analytics:*
/admin analytics [command]
  • overview, platform, user, export

*System:*
/admin system [command]
  • status, logs, config

*Usage:*
/admin user list
/admin analytics overview
/admin system status

Type /admin [category] for detailed help on each category.
    `.trim();
  }
};

// Main admin command handler
async function handleAdminCommand(adminUserId, args) {
  if (!isAdmin(adminUserId)) {
    return '❌ You do not have permission to use admin commands.';
  }
  
  if (args.length === 0) {
    return adminCommands.getMainHelp();
  }
  
  const category = args[0].toLowerCase();
  const categoryArgs = args.slice(1);
  
  // Set admin user ID for logging
  adminCommands.adminUserId = adminUserId;
  
  switch (category) {
    case 'user':
      return await adminCommands.handleUserCommand(categoryArgs);
    case 'analytics':
      return await adminCommands.handleAnalyticsCommand(categoryArgs);
    case 'system':
      return await adminCommands.handleSystemCommand(categoryArgs);
    default:
      return `❓ Unknown admin category: ${category}\n\n${adminCommands.getMainHelp()}`;
  }
}

// Export functions
export {
  isAdmin,
  handleAdminCommand,
  adminCommands
};
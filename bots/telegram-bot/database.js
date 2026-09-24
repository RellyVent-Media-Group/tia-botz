/**
 * Shared Database Module for ChiefPilot Bots
 * SQLite connection and schema management
 */

import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = process.env.DB_PATH || resolve(__dirname, 'chiefpilot.db');
let db = null;

// Initialize database connection
async function initializeDatabase() {
  try {
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE,
        whatsapp_id TEXT UNIQUE,
        email TEXT UNIQUE,
        subscription_tier TEXT DEFAULT 'free',
        subscription_expires TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        platform TEXT NOT NULL,
        message_count INTEGER DEFAULT 0,
        prompts_generated INTEGER DEFAULT 0,
        last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
        daily_usage INTEGER DEFAULT 0,
        last_daily_reset TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, platform),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        character_name TEXT NOT NULL,
        prompt_type TEXT NOT NULL,
        prompt_content TEXT NOT NULL,
        platform TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL,
        event_data TEXT,
        platform TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS engagement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        platform TEXT NOT NULL,
        message_content TEXT,
        message_type TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_user_id INTEGER,
        action TEXT NOT NULL,
        target_user_id INTEGER,
        action_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES users(id),
        FOREIGN KEY (target_user_id) REFERENCES users(id)
      );
    `);

    // Create indexes for performance
    db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON engagement(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at)');

    console.log('✅ SQLite database initialized successfully');
    console.log(`📁 Database location: ${dbPath}`);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// User management functions
async function getOrCreateUser(telegramId = null, whatsappId = null, email = null) {
  try {
    // Try to find existing user
    let user = null;
    
    if (telegramId) {
      user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
    }
    if (!user && whatsappId) {
      user = db.prepare('SELECT * FROM users WHERE whatsapp_id = ?').get(whatsappId);
    }
    if (!user && email) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    // Create new user if not found
    if (!user) {
      const stmt = db.prepare('INSERT INTO users (telegram_id, whatsapp_id, email) VALUES (?, ?, ?)');
      const result = stmt.run(telegramId, whatsappId, email);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else {
      // Update existing user with new identifiers
      const stmt = db.prepare(
        `UPDATE users 
         SET telegram_id = COALESCE(?, telegram_id),
             whatsapp_id = COALESCE(?, whatsapp_id),
             email = COALESCE(?, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      );
      stmt.run(telegramId || user.telegram_id, whatsappId || user.whatsapp_id, email || user.email, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to get/create user: ${error.message}`);
  }
}

async function getUserById(userId) {
  try {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

async function updateUserSubscription(userId, tier, expiresAt = null) {
  try {
    const stmt = db.prepare(
      `UPDATE users 
       SET subscription_tier = ?, subscription_expires = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    );
    stmt.run(tier, expiresAt, userId);
    return await getUserById(userId);
  } catch (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

// Session management functions
async function getOrCreateSession(userId, platform) {
  try {
    const stmt = db.prepare(
      `INSERT INTO sessions (user_id, platform) 
       VALUES (?, ?) 
       ON CONFLICT(user_id, platform) 
       DO UPDATE SET last_activity = CURRENT_TIMESTAMP`
    );
    stmt.run(userId, platform);
    return db.prepare('SELECT * FROM sessions WHERE user_id = ? AND platform = ?').get(userId, platform);
  } catch (error) {
    throw new Error(`Failed to get/create session: ${error.message}`);
  }
}

async function updateSession(userId, platform, updates) {
  try {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates);
    const stmt = db.prepare(
      `UPDATE sessions 
       SET ${setClause}, last_activity = CURRENT_TIMESTAMP 
       WHERE user_id = ? AND platform = ?`
    );
    stmt.run(...values, userId, platform);
    return db.prepare('SELECT * FROM sessions WHERE user_id = ? AND platform = ?').get(userId, platform);
  } catch (error) {
    throw new Error(`Failed to update session: ${error.message}`);
  }
}

async function resetDailyUsage(userId, platform) {
  try {
    const stmt = db.prepare(
      `UPDATE sessions 
       SET daily_usage = 0, last_daily_reset = CURRENT_TIMESTAMP 
       WHERE user_id = ? AND platform = ?`
    );
    stmt.run(userId, platform);
    return db.prepare('SELECT * FROM sessions WHERE user_id = ? AND platform = ?').get(userId, platform);
  } catch (error) {
    throw new Error(`Failed to reset daily usage: ${error.message}`);
  }
}

async function checkDailyLimit(userId, platform, limit = 5) {
  try {
    const session = await getOrCreateSession(userId, platform);
    
    // Reset daily usage if it's a new day
    const lastReset = new Date(session.last_daily_reset);
    const now = new Date();
    if (lastReset.toDateString() !== now.toDateString()) {
      await resetDailyUsage(userId, platform);
      return { allowed: true, remaining: limit };
    }
    
    const remaining = limit - session.daily_usage;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  } catch (error) {
    throw new Error(`Failed to check daily limit: ${error.message}`);
  }
}

// Prompt tracking functions
async function logPrompt(userId, characterName, promptType, promptContent, platform) {
  try {
    const stmt = db.prepare(
      `INSERT INTO prompts (user_id, character_name, prompt_type, prompt_content, platform) 
       VALUES (?, ?, ?, ?, ?)`
    );
    const result = stmt.run(userId, characterName, promptType, promptContent, platform);
    return db.prepare('SELECT * FROM prompts WHERE id = ?').get(result.lastInsertRowid);
  } catch (error) {
    throw new Error(`Failed to log prompt: ${error.message}`);
  }
}

async function getUserPrompts(userId, limit = 50) {
  try {
    return db.prepare(
      `SELECT * FROM prompts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    ).all(userId, limit);
  } catch (error) {
    throw new Error(`Failed to get user prompts: ${error.message}`);
  }
}

// Analytics functions
async function logAnalytics(userId, eventType, eventData, platform) {
  try {
    const stmt = db.prepare(
      `INSERT INTO analytics (user_id, event_type, event_data, platform) 
       VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(userId, eventType, JSON.stringify(eventData), platform);
    return db.prepare('SELECT * FROM analytics WHERE id = ?').get(result.lastInsertRowid);
  } catch (error) {
    throw new Error(`Failed to log analytics: ${error.message}`);
  }
}

async function getUserAnalytics(userId, startDate = null, endDate = null) {
  try {
    let query = 'SELECT * FROM analytics WHERE user_id = ?';
    const params = [userId];
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate.toISOString());
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate.toISOString());
    }
    
    query += ' ORDER BY created_at DESC';
    
    return db.prepare(query).all(...params);
  } catch (error) {
    throw new Error(`Failed to get user analytics: ${error.message}`);
  }
}

async function getPlatformAnalytics(platform, startDate = null, endDate = null) {
  try {
    let query = 'SELECT * FROM analytics WHERE platform = ?';
    const params = [platform];
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate.toISOString());
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate.toISOString());
    }
    
    query += ' ORDER BY created_at DESC';
    
    return db.prepare(query).all(...params);
  } catch (error) {
    throw new Error(`Failed to get platform analytics: ${error.message}`);
  }
}

// Engagement tracking functions
async function logEngagement(userId, platform, messageContent, messageType = 'text') {
  try {
    const stmt = db.prepare(
      `INSERT INTO engagement (user_id, platform, message_content, message_type) 
       VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(userId, platform, messageContent, messageType);
    return db.prepare('SELECT * FROM engagement WHERE id = ?').get(result.lastInsertRowid);
  } catch (error) {
    throw new Error(`Failed to log engagement: ${error.message}`);
  }
}

async function getUserEngagement(userId, limit = 100) {
  try {
    return db.prepare(
      `SELECT * FROM engagement WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    ).all(userId, limit);
  } catch (error) {
    throw new Error(`Failed to get user engagement: ${error.message}`);
  }
}

// Admin functions
async function logAdminAction(adminUserId, action, targetUserId = null, actionData = {}) {
  try {
    const stmt = db.prepare(
      `INSERT INTO admin_logs (admin_user_id, action, target_user_id, action_data) 
       VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(adminUserId, action, targetUserId, JSON.stringify(actionData));
    return db.prepare('SELECT * FROM admin_logs WHERE id = ?').get(result.lastInsertRowid);
  } catch (error) {
    throw new Error(`Failed to log admin action: ${error.message}`);
  }
}

async function getAdminLogs(limit = 100) {
  try {
    return db.prepare(
      `SELECT al.*, u.telegram_id, u.whatsapp_id 
       FROM admin_logs al 
       LEFT JOIN users u ON al.admin_user_id = u.id 
       ORDER BY al.created_at DESC LIMIT ?`
    ).all(limit);
  } catch (error) {
    throw new Error(`Failed to get admin logs: ${error.message}`);
  }
}

async function getAllUsers(limit = 100, offset = 0) {
  try {
    return db.prepare(
      `SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
  } catch (error) {
    throw new Error(`Failed to get all users: ${error.message}`);
  }
}

async function getUserStats(userId) {
  try {
    const user = await getUserById(userId);
    const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ?').all(userId);
    const promptCount = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?').get(userId);
    const analyticsCount = db.prepare('SELECT COUNT(*) as count FROM analytics WHERE user_id = ?').get(userId);
    
    return {
      user,
      sessions,
      totalPrompts: promptCount.count,
      totalAnalytics: analyticsCount.count
    };
  } catch (error) {
    throw new Error(`Failed to get user stats: ${error.message}`);
  }
}

// Cross-platform functions
async function linkUserAccounts(primaryUserId, secondaryUserId) {
  try {
    // Get secondary user data
    const secondaryUser = await getUserById(secondaryUserId);
    if (!secondaryUser) {
      throw new Error('Secondary user not found');
    }
    
    // Update primary user with secondary user's identifiers
    const stmt = db.prepare(
      `UPDATE users 
       SET telegram_id = COALESCE(?, telegram_id),
           whatsapp_id = COALESCE(?, whatsapp_id),
           email = COALESCE(?, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    );
    stmt.run(
      secondaryUser.telegram_id || null,
      secondaryUser.whatsapp_id || null,
      secondaryUser.email || null,
      primaryUserId
    );
    
    // Migrate sessions from secondary to primary
    db.prepare(`UPDATE sessions SET user_id = ? WHERE user_id = ?`).run(primaryUserId, secondaryUserId);
    
    // Migrate prompts from secondary to primary
    db.prepare(`UPDATE prompts SET user_id = ? WHERE user_id = ?`).run(primaryUserId, secondaryUserId);
    
    // Migrate analytics from secondary to primary
    db.prepare(`UPDATE analytics SET user_id = ? WHERE user_id = ?`).run(primaryUserId, secondaryUserId);
    
    // Migrate engagement from secondary to primary
    db.prepare(`UPDATE engagement SET user_id = ? WHERE user_id = ?`).run(primaryUserId, secondaryUserId);
    
    // Delete secondary user
    db.prepare('DELETE FROM users WHERE id = ?').run(secondaryUserId);
    
    return await getUserById(primaryUserId);
  } catch (error) {
    throw new Error(`Failed to link user accounts: ${error.message}`);
  }
}

// Close database connection
async function closeDatabase() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}

// Export functions
export {
  initializeDatabase,
  getOrCreateUser,
  getUserById,
  updateUserSubscription,
  getOrCreateSession,
  updateSession,
  resetDailyUsage,
  checkDailyLimit,
  logPrompt,
  getUserPrompts,
  logAnalytics,
  getUserAnalytics,
  getPlatformAnalytics,
  logEngagement,
  getUserEngagement,
  logAdminAction,
  getAdminLogs,
  getAllUsers,
  getUserStats,
  linkUserAccounts,
  closeDatabase
};
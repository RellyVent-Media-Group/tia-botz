/**
 * Cross-Platform Identity Management System
 * Platform-agnostic user identity with platform-specific mappings
 */

import Database from 'better-sqlite3';
import { randomBytes } from 'crypto';

class CrossPlatformIdentity {
  constructor(dbPath = './cross-platform-identity.db') {
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  /**
   * Generate UUID v4 using crypto
   */
  generateUUID() {
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
    
    const hex = bytes.toString('hex');
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  }

  initializeDatabase() {
    // Create users table with platform-agnostic primary ID
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        primary_email TEXT UNIQUE,
        display_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      );
    `);

    // Create platform mappings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS platform_mappings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        platform_identifier TEXT NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        verification_method TEXT,
        last_verified TEXT,
        platform_metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(platform, platform_identifier),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create identity verification table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS identity_verifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        verification_code TEXT,
        verification_method TEXT,
        expires_at TEXT,
        verified_at TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create conversation state table for cross-platform continuity
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversation_state (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        conversation_id TEXT,
        state_data TEXT,
        last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for performance
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_platform_mappings_user_id ON platform_mappings(user_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_platform_mappings_platform ON platform_mappings(platform)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_platform_mappings_identifier ON platform_mappings(platform_identifier)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_conversation_state_user_id ON conversation_state(user_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id)');

    console.log('✅ Cross-platform identity database initialized');
  }

  /**
   * Create or get platform-agnostic user
   */
  createOrGetUser(primaryEmail = null, displayName = null, metadata = {}) {
    try {
      // Check if user exists by email
      let user = null;
      if (primaryEmail) {
        user = this.db.prepare('SELECT * FROM users WHERE primary_email = ?').get(primaryEmail);
      }

      if (!user) {
        // Create new user
        const userId = this.generateUUID();
        const stmt = this.db.prepare(`
          INSERT INTO users (id, primary_email, display_name, metadata)
          VALUES (?, ?, ?, ?)
        `);
        stmt.run(userId, primaryEmail, displayName, JSON.stringify(metadata));
        
        user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        console.log(`✅ Created new user: ${userId}`);
      } else {
        // Update existing user
        const stmt = this.db.prepare(`
          UPDATE users 
          SET display_name = COALESCE(?, display_name),
              metadata = COALESCE(?, metadata),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmt.run(displayName, JSON.stringify(metadata), user.id);
        
        user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }

      return user;
    } catch (error) {
      console.error('❌ Error creating/getting user:', error);
      throw error;
    }
  }

  /**
   * Link platform identifier to user
   */
  linkPlatform(userId, platform, platformIdentifier, metadata = {}) {
    try {
      // Check if mapping already exists
      const existing = this.db.prepare(`
        SELECT * FROM platform_mappings 
        WHERE platform = ? AND platform_identifier = ?
      `).get(platform, platformIdentifier);

      if (existing) {
        // Update existing mapping
        const stmt = this.db.prepare(`
          UPDATE platform_mappings 
          SET user_id = ?,
              platform_metadata = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmt.run(userId, JSON.stringify(metadata), existing.id);
        
        return this.db.prepare('SELECT * FROM platform_mappings WHERE id = ?').get(existing.id);
      }

      // Create new mapping
      const mappingId = this.generateUUID();
      const stmt = this.db.prepare(`
        INSERT INTO platform_mappings (id, user_id, platform, platform_identifier, platform_metadata)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(mappingId, userId, platform, platformIdentifier, JSON.stringify(metadata));

      console.log(`✅ Linked ${platform} identifier ${platformIdentifier} to user ${userId}`);
      return this.db.prepare('SELECT * FROM platform_mappings WHERE id = ?').get(mappingId);
    } catch (error) {
      console.error('❌ Error linking platform:', error);
      throw error;
    }
  }

  /**
   * Resolve user by platform identifier
   */
  getUserByPlatform(platform, platformIdentifier) {
    try {
      const mapping = this.db.prepare(`
        SELECT * FROM platform_mappings 
        WHERE platform = ? AND platform_identifier = ?
      `).get(platform, platformIdentifier);

      if (!mapping) {
        return null;
      }

      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(mapping.user_id);
      
      return {
        user,
        mapping,
        platforms: this.getUserPlatforms(mapping.user_id)
      };
    } catch (error) {
      console.error('❌ Error resolving user by platform:', error);
      throw error;
    }
  }

  /**
   * Get all platforms for a user
   */
  getUserPlatforms(userId) {
    try {
      const mappings = this.db.prepare(`
        SELECT * FROM platform_mappings WHERE user_id = ?
      `).all(userId);

      return mappings.map(mapping => ({
        platform: mapping.platform,
        identifier: mapping.platform_identifier,
        verified: mapping.verified,
        lastVerified: mapping.last_verified
      }));
    } catch (error) {
      console.error('❌ Error getting user platforms:', error);
      throw error;
    }
  }

  /**
   * Verify platform ownership
   */
  initiateVerification(userId, platform, method = 'code') {
    try {
      const verificationId = this.generateUUID();
      const verificationCode = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const stmt = this.db.prepare(`
        INSERT INTO identity_verifications (id, user_id, platform, verification_code, verification_method, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(verificationId, userId, platform, verificationCode, method, expiresAt.toISOString());

      console.log(`✅ Initiated verification for ${platform}: ${verificationCode}`);
      return {
        verificationId,
        verificationCode,
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Error initiating verification:', error);
      throw error;
    }
  }

  /**
   * Complete verification
   */
  completeVerification(verificationId, code) {
    try {
      const verification = this.db.prepare(`
        SELECT * FROM identity_verifications WHERE id = ?
      `).get(verificationId);

      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.verification_code !== code) {
        throw new Error('Invalid verification code');
      }

      if (new Date(verification.expires_at) < new Date()) {
        throw new Error('Verification expired');
      }

      // Update verification status
      const stmt = this.db.prepare(`
        UPDATE identity_verifications 
        SET status = 'verified', verified_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(verificationId);

      // Mark platform mapping as verified
      const mappingStmt = this.db.prepare(`
        UPDATE platform_mappings 
        SET verified = TRUE, last_verified = CURRENT_TIMESTAMP
        WHERE user_id = ? AND platform = ?
      `);
      mappingStmt.run(verification.user_id, verification.platform);

      console.log(`✅ Verification completed for ${verification.platform}`);
      return { status: 'verified', userId: verification.user_id };
    } catch (error) {
      console.error('❌ Error completing verification:', error);
      throw error;
    }
  }

  /**
   * Save conversation state for cross-platform continuity
   */
  saveConversationState(userId, platform, conversationId, stateData) {
    try {
      const stateId = this.generateUUID();
      const stmt = this.db.prepare(`
        INSERT INTO conversation_state (id, user_id, platform, conversation_id, state_data)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(stateId, userId, platform, conversationId, JSON.stringify(stateData));

      return this.db.prepare('SELECT * FROM conversation_state WHERE id = ?').get(stateId);
    } catch (error) {
      console.error('❌ Error saving conversation state:', error);
      throw error;
    }
  }

  /**
   * Get conversation state for user
   */
  getConversationState(userId, platform = null) {
    try {
      let query = 'SELECT * FROM conversation_state WHERE user_id = ?';
      const params = [userId];

      if (platform) {
        query += ' AND platform = ?';
        params.push(platform);
      }

      query += ' ORDER BY last_activity DESC LIMIT 10';

      const states = this.db.prepare(query).all(...params);
      
      return states.map(state => ({
        ...state,
        stateData: JSON.parse(state.state_data)
      }));
    } catch (error) {
      console.error('❌ Error getting conversation state:', error);
      throw error;
    }
  }

  /**
   * Merge user accounts (for consolidation)
   */
  mergeUsers(primaryUserId, secondaryUserId) {
    try {
      // Update all platform mappings from secondary to primary
      const stmt = this.db.prepare(`
        UPDATE platform_mappings 
        SET user_id = ? 
        WHERE user_id = ?
      `);
      const result = stmt.run(primaryUserId, secondaryUserId);

      // Update conversation states
      const stateStmt = this.db.prepare(`
        UPDATE conversation_state 
        SET user_id = ? 
        WHERE user_id = ?
      `);
      stateStmt.run(primaryUserId, secondaryUserId);

      // Delete secondary user
      const deleteStmt = this.db.prepare('DELETE FROM users WHERE id = ?');
      deleteStmt.run(secondaryUserId);

      console.log(`✅ Merged user ${secondaryUserId} into ${primaryUserId}`);
      return {
        primaryUserId,
        mergedMappings: result.changes
      };
    } catch (error) {
      console.error('❌ Error merging users:', error);
      throw error;
    }
  }

  /**
   * Generate verification code
   */
  generateVerificationCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get user identity summary
   */
  getIdentitySummary(userId) {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!user) {
        return null;
      }

      const platforms = this.getUserPlatforms(userId);
      const conversationStates = this.getConversationState(userId);

      return {
        user: {
          id: user.id,
          email: user.primary_email,
          displayName: user.display_name,
          createdAt: user.created_at
        },
        platforms,
        conversationStates: conversationStates.length,
        totalPlatforms: platforms.length,
        verifiedPlatforms: platforms.filter(p => p.verified).length
      };
    } catch (error) {
      console.error('❌ Error getting identity summary:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
    console.log('Database connection closed');
  }
}

export default CrossPlatformIdentity;
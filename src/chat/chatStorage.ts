/**
 * Elite Chat Storage Module
 * 
 * Manages chat messages in localStorage with full CRUD operations.
 * Handles message persistence, retrieval, and cleanup.
 * 
 * @module chatStorage
 */

import { logger } from '../utils/logger';
import * as storage from '../utils/storageHelper';
import * as versioning from '../utils/versioning';
import { enterpriseMonitoringService } from '../services/enterpriseMonitoringService';

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date | string;
  isRead: boolean;
  metadata?: any;
  
  // Translation support
  originalLanguage?: string; // Detected language (e.g., 'en', 'id')
  translatedVersions?: Record<string, string>; // Cache: { 'id': 'Halo', 'zh': '你好' }
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  scrollPosition: number;
  unreadCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Language preferences
  userLanguagePreference?: string; // User's selected language (e.g., 'en', 'id', 'zh')
  autoTranslate?: boolean; // Whether to auto-translate messages
}

const CHAT_SESSION_PREFIX = 'chat_session_';
const MAX_MESSAGES_PER_SESSION = 500;

/**
 * Get storage key for session
 */
function getSessionKey(sessionId: string): string {
  return `${CHAT_SESSION_PREFIX}${sessionId}`;
}

/**
 * Create new chat session
 */
export function createSession(sessionId: string): ChatSession {
  const session: ChatSession = {
    id: sessionId,
    messages: [],
    scrollPosition: 0,
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  saveSession(session);
  
  logger.info(`💬 Created new chat session: ${sessionId}`);
  
  return session;
}

/**
 * Load chat session from localStorage
 */
export function loadSession(sessionId: string): ChatSession | null {
  try {
    const key = getSessionKey(sessionId);
    const result = storage.getItem<ChatSession>(key);
    
    if (!result.success || !result.data) {
      logger.info(`💬 No existing session found: ${sessionId}`);
      return null;
    }
    
    logger.info(`💬 Loaded chat session: ${sessionId}`, {
      messageCount: result.data.messages.length
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_session_loaded',
      value: 1,
      unit: 'count'
    });
    
    return result.data;
  } catch (error) {
    logger.error(`❌ Failed to load chat session: ${sessionId}`, { error });
    return null;
  }
}

/**
 * Save chat session to localStorage
 */
export function saveSession(session: ChatSession): boolean {
  try {
    const key = getSessionKey(session.id);
    
    // Update timestamp
    session.updatedAt = new Date();
    
    const result = storage.setItem(key, session);
    
    if (!result.success) {
      logger.error(`❌ Failed to save chat session: ${session.id}`, {
        error: result.error
      });
      return false;
    }
    
    logger.info(`💾 Saved chat session: ${session.id}`, {
      messageCount: session.messages.length
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_session_saved',
      value: 1,
      unit: 'count'
    });
    
    return true;
  } catch (error) {
    logger.error(`❌ Failed to save chat session: ${session.id}`, { error });
    return false;
  }
}

/**
 * Add message to chat session
 */
export function addMessage(
  sessionId: string, 
  message: Omit<ChatMessage, 'sessionId'>
): boolean {
  try {
    let session = loadSession(sessionId);
    
    if (!session) {
      session = createSession(sessionId);
    }
    
    // Create full message object
    const fullMessage: ChatMessage = {
      ...message,
      sessionId,
      timestamp: message.timestamp || new Date()
    };
    
    // Add to messages array
    session.messages.push(fullMessage);
    
    // Trim if exceeds max
    if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
      const removed = session.messages.length - MAX_MESSAGES_PER_SESSION;
      session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
      
      logger.warn(`⚠️ Trimmed ${removed} old messages from session: ${sessionId}`);
    }
    
    // Increment unread count if not from current user
    if (!message.isRead) {
      session.unreadCount++;
    }
    
    // Save session
    const success = saveSession(session);
    
    if (success) {
      logger.info(`💬 Added message to session: ${sessionId}`, {
        messageId: message.id
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_message_added',
        value: 1,
        unit: 'count'
      });
    }
    
    return success;
  } catch (error) {
    logger.error(`❌ Failed to add message to session: ${sessionId}`, { error });
    return false;
  }
}

/**
 * Update message in chat session
 */
export function updateMessage(
  sessionId: string, 
  messageId: string, 
  updates: Partial<ChatMessage>
): boolean {
  try {
    const session = loadSession(sessionId);
    
    if (!session) {
      logger.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      logger.warn(`⚠️ Message not found: ${messageId}`);
      return false;
    }
    
    // Update message
    session.messages[messageIndex] = {
      ...session.messages[messageIndex],
      ...updates
    };
    
    // Save session
    const success = saveSession(session);
    
    if (success) {
      logger.info(`✏️ Updated message in session: ${sessionId}`, {
        messageId
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_message_updated',
        value: 1,
        unit: 'count'
      });
    }
    
    return success;
  } catch (error) {
    logger.error(`❌ Failed to update message in session: ${sessionId}`, { error });
    return false;
  }
}

/**
 * Delete message from chat session
 */
export function deleteMessage(sessionId: string, messageId: string): boolean {
  try {
    const session = loadSession(sessionId);
    
    if (!session) {
      logger.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    const initialLength = session.messages.length;
    session.messages = session.messages.filter(m => m.id !== messageId);
    
    if (session.messages.length === initialLength) {
      logger.warn(`⚠️ Message not found: ${messageId}`);
      return false;
    }
    
    // Save session
    const success = saveSession(session);
    
    if (success) {
      logger.info(`🗑️ Deleted message from session: ${sessionId}`, {
        messageId
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_message_deleted',
        value: 1,
        unit: 'count'
      });
    }
    
    return success;
  } catch (error) {
    logger.error(`❌ Failed to delete message from session: ${sessionId}`, { error });
    return false;
  }
}

/**
 * Clear all messages from session
 */
export function clearMessages(sessionId: string, preserveSession: boolean = true): boolean {
  try {
    if (!preserveSession) {
      const key = getSessionKey(sessionId);
      const result = storage.removeItem(key);
      
      logger.info(`🗑️ Deleted chat session: ${sessionId}`);
      
      return result.success;
    }
    
    const session = loadSession(sessionId);
    
    if (!session) {
      logger.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    session.messages = [];
    session.unreadCount = 0;
    session.scrollPosition = 0;
    
    const success = saveSession(session);
    
    if (success) {
      logger.info(`🗑️ Cleared messages from session: ${sessionId}`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_messages_cleared',
        value: 1,
        unit: 'count'
      });
    }
    
    return success;
  } catch (error) {
    logger.error(`❌ Failed to clear messages from session: ${sessionId}`, { error });
    return false;
  }
}

/**
 * Get message count for session
 */
export function getMessageCount(sessionId: string): number {
  const session = loadSession(sessionId);
  return session?.messages.length || 0;
}

/**
 * Mark messages as read
 */
export function markMessagesAsRead(sessionId: string, messageIds?: string[]): boolean {
  try {
    const session = loadSession(sessionId);
    
    if (!session) {
      logger.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    if (messageIds) {
      // Mark specific messages as read
      session.messages.forEach(message => {
        if (messageIds.includes(message.id)) {
          message.isRead = true;
        }
      });
    } else {
      // Mark all messages as read
      session.messages.forEach(message => {
        message.isRead = true;
      });
    }
    
    session.unreadCount = 0;
    
    return saveSession(session);
  } catch (error) {
    logger.error(`❌ Failed to mark messages as read: ${sessionId}`, { error });
    return false;
  }
}

/**
 * Update scroll position
 */
export function updateScrollPosition(sessionId: string, position: number): boolean {
  try {
    const session = loadSession(sessionId);
    
    if (!session) {
      logger.warn(`⚠️ Session not found: ${sessionId}`);
      return false;
    }
    
    session.scrollPosition = position;
    
    return saveSession(session);
  } catch (error) {
    logger.error(`❌ Failed to update scroll position: ${sessionId}`, { error });
    return false;
  }
}

/**
 * Get all active sessions
 */
export function getAllSessions(): ChatSession[] {
  try {
    const keys = storage.getKeysByPrefix(CHAT_SESSION_PREFIX);
    const sessions: ChatSession[] = [];
    
    keys.forEach(key => {
      const result = storage.getItem<ChatSession>(key);
      if (result.success && result.data) {
        sessions.push(result.data);
      }
    });
    
    logger.info(`💬 Loaded ${sessions.length} chat sessions`);
    
    return sessions;
  } catch (error) {
    logger.error('❌ Failed to load all chat sessions', { error });
    return [];
  }
}

/**
 * Get session statistics
 */
export function getSessionStats(sessionId: string): {
  messageCount: number;
  unreadCount: number;
  storageSize: number;
  lastUpdated: Date | string | null;
} {
  try {
    const session = loadSession(sessionId);
    
    if (!session) {
      return {
        messageCount: 0,
        unreadCount: 0,
        storageSize: 0,
        lastUpdated: null
      };
    }
    
    const key = getSessionKey(sessionId);
    const storageSize = storage.getItemSize(key);
    
    return {
      messageCount: session.messages.length,
      unreadCount: session.unreadCount,
      storageSize,
      lastUpdated: session.updatedAt
    };
  } catch (error) {
    logger.error(`❌ Failed to get session stats: ${sessionId}`, { error });
    return {
      messageCount: 0,
      unreadCount: 0,
      storageSize: 0,
      lastUpdated: null
    };
  }
}

/**
 * Clean up old sessions (older than threshold)
 */
export function cleanupOldSessions(thresholdMs: number = 7 * 24 * 60 * 60 * 1000): number {
  try {
    const sessions = getAllSessions();
    let cleaned = 0;
    
    sessions.forEach(session => {
      const age = versioning.getVersionAge(session.updatedAt);
      
      if (age > thresholdMs) {
        const key = getSessionKey(session.id);
        storage.removeItem(key);
        cleaned++;
        
        logger.info(`🗑️ Cleaned up old session: ${session.id}`, {
          age: versioning.formatVersionAge(session.updatedAt)
        });
      }
    });
    
    if (cleaned > 0) {
      logger.info(`✅ Cleaned up ${cleaned} old chat sessions`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_sessions_cleaned',
        value: cleaned,
        unit: 'count'
      });
    }
    
    return cleaned;
  } catch (error) {
    logger.error('❌ Failed to cleanup old sessions', { error });
    return 0;
  }
}

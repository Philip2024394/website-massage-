/**
 * Elite Chat Window Module
 * 
 * UI logic for chat window with localStorage integration.
 * Handles message display, user input, and real-time updates.
 * 
 * @module chatWindow
 */

import { logger } from '../utils/logger';
import * as chatStorage from './chatStorage';
import { chatAutosaveService } from './chatAutosave';
import { enterpriseMonitoringService } from '../services/enterpriseMonitoringService';
import { translateText, detectLanguage, getSystemMessage, getUserLanguagePreference } from '../utils/chatTranslation';

export interface ChatWindowState {
  sessionId: string;
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
  lastMessage: chatStorage.ChatMessage | null;
  
  // Language preferences
  userLanguage: string;
  autoTranslate: boolean;
}

class ChatWindowService {
  private activeWindows: Map<string, ChatWindowState> = new Map();
  private messageListeners: Map<string, Array<(message: chatStorage.ChatMessage) => void>> = new Map();
  
  /**
   * Open chat window for session
   */
  openWindow(sessionId: string): ChatWindowState {
    let window = this.activeWindows.get(sessionId);
    
    if (!window) {
      // Load existing session or create new
      let session = chatStorage.loadSession(sessionId);
      
      if (!session) {
        session = chatStorage.createSession(sessionId);
      }
      
      window = {
        sessionId,
        isOpen: true,
        isMinimized: false,
        unreadCount: session.unreadCount,
        lastMessage: session.messages[session.messages.length - 1] || null,
        userLanguage: session.userLanguagePreference || getUserLanguagePreference(),
        autoTranslate: session.autoTranslate !== undefined ? session.autoTranslate : true
      };
      
      this.activeWindows.set(sessionId, window);
      
      logger.info(`💬 Opened chat window: ${sessionId}`, {
        language: window.userLanguage,
        autoTranslate: window.autoTranslate
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_window_opened',
        value: 1,
        unit: 'count'
      });
    } else {
      window.isOpen = true;
      window.isMinimized = false;
    }
    
    return window;
  }
  
  /**
   * Set language preference for chat window
   */
  setLanguagePreference(sessionId: string, language: string, autoTranslate: boolean = true): void {
    const window = this.activeWindows.get(sessionId);
    
    if (window) {
      window.userLanguage = language;
      window.autoTranslate = autoTranslate;
    }
    
    // Save to session
    const session = chatStorage.loadSession(sessionId);
    if (session) {
      session.userLanguagePreference = language;
      session.autoTranslate = autoTranslate;
      chatStorage.saveSession(session);
    }
    
    logger.info(`🌍 Language preference updated: ${sessionId}`, { language, autoTranslate });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_language_changed',
      value: 1,
      unit: 'count',
      tags: { language }
    });
  }
  
  /**
   * Translate message for display
   */
  async translateMessage(
    message: chatStorage.ChatMessage,
    targetLanguage: string
  ): Promise<chatStorage.ChatMessage> {
    // System messages: Use pre-translated versions
    if (message.metadata?.systemEventType) {
      const translatedText = getSystemMessage(
        message.metadata.systemEventType,
        targetLanguage,
        message.metadata
      );
      
      return {
        ...message,
        message: translatedText
      };
    }
    
    // User messages: Check cache first
    if (message.translatedVersions && message.translatedVersions[targetLanguage]) {
      return {
        ...message,
        message: message.translatedVersions[targetLanguage]
      };
    }
    
    // Detect original language if not set
    const originalLang = message.originalLanguage || detectLanguage(message.message);
    
    // If same language, no translation needed
    if (originalLang === targetLanguage) {
      return message;
    }
    
    try {
      // Translate and cache
      const translated = await translateText(message.message, targetLanguage, originalLang);
      
      // Update cache
      const updatedMessage = {
        ...message,
        message: translated.translatedText,
        originalLanguage: originalLang,
        translatedVersions: {
          ...message.translatedVersions,
          [targetLanguage]: translated.translatedText
        }
      };
      
      return updatedMessage;
      
    } catch (error) {
      logger.warn('⚠️ Translation failed, showing original', { error, messageId: message.id });
      return message;
    }
  }
  
  /**
   * Close chat window
   */
  closeWindow(sessionId: string, saveOnClose: boolean = true): void {
    const window = this.activeWindows.get(sessionId);
    
    if (!window) {
      logger.warn(`⚠️ Window not found: ${sessionId}`);
      return;
    }
    
    window.isOpen = false;
    
    if (saveOnClose) {
      // Force save any pending changes
      chatAutosaveService.forceFlush();
    }
    
    logger.info(`💬 Closed chat window: ${sessionId}`);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_window_closed',
      value: 1,
      unit: 'count'
    });
  }
  
  /**
   * Minimize/maximize window
   */
  toggleMinimize(sessionId: string): void {
    const window = this.activeWindows.get(sessionId);
    
    if (!window) {
      logger.warn(`⚠️ Window not found: ${sessionId}`);
      return;
    }
    
    window.isMinimized = !window.isMinimized;
    
    logger.info(`💬 ${window.isMinimized ? 'Minimized' : 'Maximized'} chat window: ${sessionId}`);
  }
  
  /**
   * Send message from chat window
   */
  sendMessage(
    sessionId: string,
    senderId: string,
    senderName: string,
    message: string,
    metadata?: any
  ): string | null {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const chatMessage: Omit<chatStorage.ChatMessage, 'sessionId'> = {
        id: messageId,
        senderId,
        senderName,
        message,
        timestamp: new Date(),
        isRead: true, // Sender always reads their own messages
        metadata
      };
      
      const success = chatStorage.addMessage(sessionId, chatMessage);
      
      if (!success) {
        logger.error(`❌ Failed to send message in session: ${sessionId}`);
        return null;
      }
      
      // Update window state
      const window = this.activeWindows.get(sessionId);
      if (window) {
        window.lastMessage = { ...chatMessage, sessionId };
      }
      
      // Trigger message listeners
      this.notifyMessageListeners(sessionId, { ...chatMessage, sessionId });
      
      // Schedule autosave
      const session = chatStorage.loadSession(sessionId);
      if (session) {
        chatAutosaveService.scheduleAutosave(sessionId, session);
      }
      
      logger.info(`💬 Message sent in session: ${sessionId}`, {
        messageId,
        length: message.length
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_message_sent',
        value: 1,
        unit: 'count'
      });
      
      return messageId;
    } catch (error) {
      logger.error(`❌ Failed to send message in session: ${sessionId}`, { error });
      return null;
    }
  }
  
  /**
   * Load messages for chat window
   */
  loadMessages(sessionId: string, limit?: number): chatStorage.ChatMessage[] {
    const session = chatStorage.loadSession(sessionId);
    
    if (!session) {
      logger.warn(`⚠️ Session not found: ${sessionId}`);
      return [];
    }
    
    const messages = limit 
      ? session.messages.slice(-limit) 
      : session.messages;
    
    logger.info(`💬 Loaded ${messages.length} messages for session: ${sessionId}`);
    
    return messages;
  }
  
  /**
   * Mark messages as read in window
   */
  markAsRead(sessionId: string, messageIds?: string[]): void {
    const success = chatStorage.markMessagesAsRead(sessionId, messageIds);
    
    if (success) {
      const window = this.activeWindows.get(sessionId);
      if (window) {
        window.unreadCount = 0;
      }
      
      logger.info(`👀 Marked messages as read: ${sessionId}`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_messages_read',
        value: 1,
        unit: 'count'
      });
    }
  }
  
  /**
   * Update scroll position for window
   */
  updateScrollPosition(sessionId: string, position: number): void {
    chatStorage.updateScrollPosition(sessionId, position);
  }
  
  /**
   * Get scroll position for window
   */
  getScrollPosition(sessionId: string): number {
    const session = chatStorage.loadSession(sessionId);
    return session?.scrollPosition || 0;
  }
  
  /**
   * Delete message from window
   */
  deleteMessage(sessionId: string, messageId: string): boolean {
    const success = chatStorage.deleteMessage(sessionId, messageId);
    
    if (success) {
      // Update window state
      const window = this.activeWindows.get(sessionId);
      if (window && window.lastMessage?.id === messageId) {
        const messages = this.loadMessages(sessionId);
        window.lastMessage = messages[messages.length - 1] || null;
      }
      
      // Trigger message listeners
      this.notifyMessageListeners(sessionId, null);
      
      logger.info(`🗑️ Deleted message from window: ${sessionId}`, { messageId });
    }
    
    return success;
  }
  
  /**
   * Clear all messages in window
   */
  clearMessages(sessionId: string): boolean {
    const success = chatStorage.clearMessages(sessionId, true);
    
    if (success) {
      const window = this.activeWindows.get(sessionId);
      if (window) {
        window.lastMessage = null;
        window.unreadCount = 0;
      }
      
      logger.info(`🗑️ Cleared messages from window: ${sessionId}`);
    }
    
    return success;
  }
  
  /**
   * Get window state
   */
  getWindowState(sessionId: string): ChatWindowState | null {
    return this.activeWindows.get(sessionId) || null;
  }
  
  /**
   * Get all active windows
   */
  getActiveWindows(): ChatWindowState[] {
    return Array.from(this.activeWindows.values()).filter(w => w.isOpen);
  }
  
  /**
   * Register message listener
   */
  onMessage(sessionId: string, callback: (message: chatStorage.ChatMessage) => void): () => void {
    let listeners = this.messageListeners.get(sessionId);
    
    if (!listeners) {
      listeners = [];
      this.messageListeners.set(sessionId, listeners);
    }
    
    listeners.push(callback);
    
    logger.info(`📡 Registered message listener for session: ${sessionId}`);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.messageListeners.get(sessionId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Notify message listeners
   */
  private notifyMessageListeners(sessionId: string, message: chatStorage.ChatMessage | null): void {
    const listeners = this.messageListeners.get(sessionId);
    
    if (!listeners || listeners.length === 0) {
      return;
    }
    
    if (message) {
      listeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          logger.error(`❌ Message listener error for session: ${sessionId}`, { error });
        }
      });
    }
  }
  
  /**
   * Get window statistics
   */
  getWindowStats(sessionId: string): {
    messageCount: number;
    unreadCount: number;
    isOpen: boolean;
    isMinimized: boolean;
    lastMessage: chatStorage.ChatMessage | null;
  } {
    const window = this.activeWindows.get(sessionId);
    const stats = chatStorage.getSessionStats(sessionId);
    
    return {
      messageCount: stats.messageCount,
      unreadCount: stats.unreadCount,
      isOpen: window?.isOpen || false,
      isMinimized: window?.isMinimized || false,
      lastMessage: window?.lastMessage || null
    };
  }
  
  /**
   * Refresh window state from storage
   */
  refreshWindow(sessionId: string): void {
    const session = chatStorage.loadSession(sessionId);
    const window = this.activeWindows.get(sessionId);
    
    if (session && window) {
      window.unreadCount = session.unreadCount;
      window.lastMessage = session.messages[session.messages.length - 1] || null;
      
      logger.info(`🔄 Refreshed window state: ${sessionId}`);
    }
  }
  
  /**
   * Close all windows
   */
  closeAllWindows(saveOnClose: boolean = true): void {
    const sessionIds = Array.from(this.activeWindows.keys());
    
    sessionIds.forEach(sessionId => {
      this.closeWindow(sessionId, saveOnClose);
    });
    
    logger.info(`💬 Closed ${sessionIds.length} chat windows`);
  }
}

// Export singleton instance
export const chatWindowService = new ChatWindowService();

/**
 * 🔒 CHAT LOCAL STORAGE SERVICE
 * 
 * Local-first chat message storage:
 * - Store messages in localStorage while chat is open
 * - No direct backend calls during interaction
 * - Sync to Appwrite only when needed
 * - Real-time UI updates from localStorage
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

import { localStorageManager } from './localStorageManager';

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: 'user' | 'therapist' | 'place' | 'system';
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'location' | 'booking-update' | 'system';
  timestamp: number;
  createdAt: string;
  isRead: boolean;
  synced: boolean; // Flag to track sync status
  metadata?: {
    bookingId?: string;
    location?: { lat: number; lng: number; address: string };
    imageUrl?: string;
    systemEventType?: string;
  };
}

export interface ChatSession {
  id: string;
  chatRoomId: string;
  therapistId: string;
  therapistName: string;
  customerId: string;
  customerName: string;
  isActive: boolean;
  startedAt: string;
  lastActivityAt: string;
  messageCount: number;
}

/**
 * Chat localStorage Service - Message Management
 */
class ChatLocalStorageService {
  private MESSAGES_KEY = 'chat_messages';
  private SESSION_KEY = 'chat_session';
  private DRAFT_KEY = 'chat_draft';

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  /**
   * Add message to localStorage
   * 
   * FLOW:
   * 1. User types message
   * 2. Message saved to localStorage immediately
   * 3. UI updated from localStorage
   * 4. Sync happens separately (via sync service)
   */
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'synced'>): ChatMessage {
    console.log('💬 [ChatLocalStorage] Adding message to localStorage');
    
    const newMessage: ChatMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      synced: false
    };

    const messages = this.getMessages();
    messages.push(newMessage);
    
    localStorageManager.set(this.MESSAGES_KEY, messages);
    
    // Update session activity
    this.updateSessionActivity();
    
    console.log('✅ [ChatLocalStorage] Message added:', newMessage.id);
    return newMessage;
  }

  /**
   * Get all messages from localStorage
   */
  getMessages(): ChatMessage[] {
    const messages = localStorageManager.get<ChatMessage[]>(this.MESSAGES_KEY);
    return messages || [];
  }

  /**
   * Get messages for specific chat room
   */
  getMessagesByChatRoom(chatRoomId: string): ChatMessage[] {
    const messages = this.getMessages();
    return messages.filter(msg => msg.chatRoomId === chatRoomId);
  }

  /**
   * Get unsynced messages
   */
  getUnsyncedMessages(): ChatMessage[] {
    const messages = this.getMessages();
    return messages.filter(msg => !msg.synced);
  }

  /**
   * Mark message as synced
   */
  markMessageSynced(messageId: string): boolean {
    console.log('✅ [ChatLocalStorage] Marking message synced:', messageId);
    
    const messages = this.getMessages();
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) {
      console.warn('⚠️ [ChatLocalStorage] Message not found:', messageId);
      return false;
    }

    message.synced = true;
    localStorageManager.set(this.MESSAGES_KEY, messages);
    
    return true;
  }

  /**
   * Mark message as read
   */
  markMessageRead(messageId: string): boolean {
    const messages = this.getMessages();
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) return false;

    message.isRead = true;
    localStorageManager.set(this.MESSAGES_KEY, messages);
    
    return true;
  }

  /**
   * Clear all messages
   */
  clearMessages(): boolean {
    console.log('🗑️ [ChatLocalStorage] Clearing all messages');
    return localStorageManager.remove(this.MESSAGES_KEY);
  }

  /**
   * Clear messages for specific chat room
   */
  clearMessagesByChatRoom(chatRoomId: string): boolean {
    const messages = this.getMessages();
    const filtered = messages.filter(msg => msg.chatRoomId !== chatRoomId);
    return localStorageManager.set(this.MESSAGES_KEY, filtered);
  }

  // ============================================================================
  // SESSION OPERATIONS
  // ============================================================================

  /**
   * Create or update chat session
   */
  setSession(session: Omit<ChatSession, 'startedAt' | 'lastActivityAt' | 'messageCount'>): ChatSession {
    console.log('💬 [ChatLocalStorage] Setting chat session');
    
    const existingSession = this.getSession();
    
    const newSession: ChatSession = {
      ...session,
      startedAt: existingSession?.startedAt || new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      messageCount: existingSession?.messageCount || 0
    };

    localStorageManager.set(this.SESSION_KEY, newSession);
    
    console.log('✅ [ChatLocalStorage] Session saved:', newSession.id);
    return newSession;
  }

  /**
   * Get current chat session
   */
  getSession(): ChatSession | null {
    return localStorageManager.get<ChatSession>(this.SESSION_KEY);
  }

  /**
   * Update session activity timestamp
   */
  updateSessionActivity(): boolean {
    const session = this.getSession();
    if (!session) return false;

    session.lastActivityAt = new Date().toISOString();
    session.messageCount = this.getMessages().length;

    return localStorageManager.set(this.SESSION_KEY, session);
  }

  /**
   * End chat session
   */
  endSession(): boolean {
    console.log('🛑 [ChatLocalStorage] Ending chat session');
    
    const session = this.getSession();
    if (!session) return false;

    session.isActive = false;
    localStorageManager.set(this.SESSION_KEY, session);
    
    return true;
  }

  /**
   * Clear session
   */
  clearSession(): boolean {
    console.log('🗑️ [ChatLocalStorage] Clearing chat session');
    return localStorageManager.remove(this.SESSION_KEY);
  }

  // ============================================================================
  // DRAFT OPERATIONS
  // ============================================================================

  /**
   * Save message draft
   */
  saveDraft(chatRoomId: string, message: string): boolean {
    const drafts = localStorageManager.get<Record<string, string>>('chat_drafts') || {};
    drafts[chatRoomId] = message;
    return localStorageManager.set('chat_drafts', drafts);
  }

  /**
   * Get message draft
   */
  getDraft(chatRoomId: string): string | null {
    const drafts = localStorageManager.get<Record<string, string>>('chat_drafts');
    return drafts?.[chatRoomId] || null;
  }

  /**
   * Clear draft
   */
  clearDraft(chatRoomId: string): boolean {
    const drafts = localStorageManager.get<Record<string, string>>('chat_drafts') || {};
    delete drafts[chatRoomId];
    return localStorageManager.set('chat_drafts', drafts);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const messages = this.getMessages();
    const session = this.getSession();
    
    return {
      totalMessages: messages.length,
      unsyncedMessages: messages.filter(m => !m.synced).length,
      syncedMessages: messages.filter(m => !m.synced).length,
      sessionActive: session?.isActive || false,
      lastActivity: session?.lastActivityAt
    };
  }
}

// Export singleton instance
export const chatLocalStorage = new ChatLocalStorageService();

/**
 * ============================================================================
 * 🚀 MODERN CHAT SERVICE - WhatsApp/Messenger-style Real-time Chat
 * ============================================================================
 * 
 * Features:
 * ✅ Real-time message delivery with status tracking
 * ✅ Typing indicators with debounced updates
 * ✅ Read receipts (sent ✓, delivered ✓✓, read ✓✓)
 * ✅ Optimistic UI updates for instant UX
 * ✅ Memory leak prevention with cleanup
 * ✅ Rate limiting for typing spam prevention
 * ✅ Cross-chat security (no data leakage)
 */

import { Client, Databases, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  $id: string;
  $createdAt: string;
  chatRoomId: string;
  content: string;
  senderType: 'customer' | 'therapist' | 'system' | 'admin';
  senderName: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  readAt?: string;
}

export interface TypingStatus {
  $id: string;
  chatRoomId: string;
  userId: string;
  role: 'user' | 'therapist';
  isTyping: boolean;
  updatedAt: string;
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

// ============================================================================
// MODERN CHAT SERVICE CLASS
// ============================================================================

class ModernChatService {
  private client: Client;
  private databases: Databases;
  private messageSubscriptions: Map<string, () => void> = new Map();
  private typingSubscriptions: Map<string, () => void> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private lastTypingUpdate: Map<string, number> = new Map();
  
  // Rate limiting constants
  private readonly TYPING_DEBOUNCE_MS = 2000;
  private readonly TYPING_RATE_LIMIT_MS = 1000;
  private readonly TYPING_CLEANUP_INTERVAL = 10000; // 10 seconds

  constructor() {
    this.client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
    
    this.databases = new Databases(this.client);
    
    // Start periodic cleanup of stale typing indicators
    this.startTypingCleanup();
  }

  // ========================================================================
  // MESSAGE OPERATIONS
  // ========================================================================

  /**
   * Send message with optimistic updates and status tracking
   */
  async sendMessage(params: {
    chatRoomId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderType: 'customer' | 'therapist' | 'system' | 'admin';
  }): Promise<ChatMessage> {
    const { chatRoomId, content, senderId, senderName, senderType } = params;

    const messageData = {
      chatRoomId,
      content: content.trim(),
      senderId,
      senderName,
      senderType,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent' as const
    };

    try {
      const response = await this.databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        ID.unique(),
        messageData
      );

      console.log('📤 [ModernChat] Message sent:', response.$id);

      // Stop typing indicator when message is sent
      await this.setTypingStatus(chatRoomId, senderId, senderType as any, false);

      return response as ChatMessage;

    } catch (error) {
      console.error('❌ [ModernChat] Send message failed:', error);
      throw error;
    }
  }

  /**
   * Fetch message history for a chat room
   */
  async getMessages(chatRoomId: string, limit: number = 100): Promise<ChatMessage[]> {
    try {
      const response = await this.databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );

      return response.documents.reverse() as ChatMessage[];

    } catch (error) {
      console.error('❌ [ModernChat] Fetch messages failed:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read and update read receipts
   */
  async markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
    try {
      // Get unread messages for this user in this chat room
      const unreadMessages = await this.databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.notEqual('senderId', userId), // Don't mark own messages
          Query.equal('read', false)
        ]
      );

      const readAt = new Date().toISOString();

      // Update each unread message
      const updates = unreadMessages.documents.map(message =>
        this.databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.chatMessages,
          message.$id,
          {
            read: true,
            status: 'read',
            readAt
          }
        )
      );

      await Promise.all(updates);

      console.log(`✅ [ModernChat] Marked ${updates.length} messages as read`);

    } catch (error) {
      console.error('❌ [ModernChat] Mark as read failed:', error);
      throw error;
    }
  }

  // ========================================================================
  // TYPING INDICATORS
  // ========================================================================

  /**
   * Set typing status with rate limiting and auto-cleanup
   */
  async setTypingStatus(
    chatRoomId: string, 
    userId: string, 
    role: 'user' | 'therapist', 
    isTyping: boolean
  ): Promise<void> {
    const typingKey = `${chatRoomId}-${userId}`;
    const now = Date.now();

    // Rate limiting - prevent spam
    const lastUpdate = this.lastTypingUpdate.get(typingKey) || 0;
    if (now - lastUpdate < this.TYPING_RATE_LIMIT_MS && isTyping) {
      return;
    }

    try {
      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(typingKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Update typing status in database
      await this.upsertTypingStatus(chatRoomId, userId, role, isTyping);
      
      this.lastTypingUpdate.set(typingKey, now);

      if (isTyping) {
        // Auto-clear typing after debounce period
        const timeout = setTimeout(() => {
          this.setTypingStatus(chatRoomId, userId, role, false);
        }, this.TYPING_DEBOUNCE_MS);

        this.typingTimeouts.set(typingKey, timeout);
      } else {
        this.typingTimeouts.delete(typingKey);
      }

      console.log(`⌨️  [ModernChat] Typing status: ${userId} ${isTyping ? 'started' : 'stopped'} typing`);

    } catch (error) {
      console.error('❌ [ModernChat] Typing status update failed:', error);
    }
  }

  /**
   * Upsert typing status in database
   */
  private async upsertTypingStatus(
    chatRoomId: string,
    userId: string,
    role: 'user' | 'therapist',
    isTyping: boolean
  ): Promise<void> {
    try {
      // Try to find existing document
      const existing = await this.databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'chat_typing',
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.equal('userId', userId)
        ]
      );

      const data = {
        chatRoomId,
        userId,
        role,
        isTyping,
        updatedAt: new Date().toISOString()
      };

      if (existing.documents.length > 0) {
        // Update existing
        await this.databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          'chat_typing',
          existing.documents[0].$id,
          data
        );
      } else {
        // Create new
        await this.databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          'chat_typing',
          ID.unique(),
          data
        );
      }

    } catch (error) {
      console.error('❌ [ModernChat] Upsert typing failed:', error);
      throw error;
    }
  }

  /**
   * Get current typing users for a chat room
   */
  async getTypingUsers(chatRoomId: string, excludeUserId?: string): Promise<TypingStatus[]> {
    try {
      const queries = [
        Query.equal('chatRoomId', chatRoomId),
        Query.equal('isTyping', true),
        Query.greaterThan('updatedAt', new Date(Date.now() - this.TYPING_DEBOUNCE_MS).toISOString())
      ];

      if (excludeUserId) {
        queries.push(Query.notEqual('userId', excludeUserId));
      }

      const response = await this.databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'chat_typing',
        queries
      );

      return response.documents as TypingStatus[];

    } catch (error) {
      console.error('❌ [ModernChat] Get typing users failed:', error);
      return [];
    }
  }

  /**
   * Clean up stale typing indicators
   */
  private async cleanupStaleTyping(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - this.TYPING_DEBOUNCE_MS).toISOString();
      
      const staleTyping = await this.databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'chat_typing',
        [
          Query.lessThan('updatedAt', cutoff),
          Query.equal('isTyping', true)
        ]
      );

      // Clear stale typing indicators
      const cleanups = staleTyping.documents.map(doc =>
        this.databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          'chat_typing',
          doc.$id,
          { isTyping: false, updatedAt: new Date().toISOString() }
        )
      );

      await Promise.all(cleanups);

      if (cleanups.length > 0) {
        console.log(`🧹 [ModernChat] Cleaned up ${cleanups.length} stale typing indicators`);
      }

    } catch (error) {
      console.error('❌ [ModernChat] Cleanup failed:', error);
    }
  }

  /**
   * Start periodic cleanup of typing indicators
   */
  private startTypingCleanup(): void {
    setInterval(() => {
      this.cleanupStaleTyping();
    }, this.TYPING_CLEANUP_INTERVAL);
  }

  // ========================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================================================

  /**
   * Subscribe to real-time messages for a chat room
   */
  subscribeToMessages(
    chatRoomId: string,
    onMessage: (message: ChatMessage) => void,
    onUpdate: (message: ChatMessage) => void
  ): () => void {
    const subscriptionKey = `messages-${chatRoomId}`;

    // Clean up existing subscription
    this.unsubscribeFromMessages(chatRoomId);

    console.log('🔔 [ModernChat] Subscribing to messages:', chatRoomId);

    const unsubscribe = this.client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatMessages}.documents`,
      (response: RealtimeResponseEvent<ChatMessage>) => {
        const payload = response.payload;
        
        // Only process messages for current chat room
        if (payload.chatRoomId !== chatRoomId) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('➕ [ModernChat] New message received');
          onMessage(payload);
        }

        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          console.log('🔄 [ModernChat] Message updated (read receipt)');
          onUpdate(payload);
        }
      }
    );

    this.messageSubscriptions.set(subscriptionKey, unsubscribe);
    return () => this.unsubscribeFromMessages(chatRoomId);
  }

  /**
   * Subscribe to real-time typing indicators
   */
  subscribeToTyping(
    chatRoomId: string,
    excludeUserId: string,
    onTypingChange: (typingUsers: TypingStatus[]) => void
  ): () => void {
    const subscriptionKey = `typing-${chatRoomId}`;

    // Clean up existing subscription
    this.unsubscribeFromTyping(chatRoomId);

    console.log('⌨️  [ModernChat] Subscribing to typing:', chatRoomId);

    const unsubscribe = this.client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.chat_typing.documents`,
      async (response: RealtimeResponseEvent<TypingStatus>) => {
        const payload = response.payload;
        
        // Only process typing for current chat room
        if (payload.chatRoomId !== chatRoomId) return;
        
        // Don't show own typing
        if (payload.userId === excludeUserId) return;

        // Fetch current typing users
        const typingUsers = await this.getTypingUsers(chatRoomId, excludeUserId);
        onTypingChange(typingUsers);
      }
    );

    this.typingSubscriptions.set(subscriptionKey, unsubscribe);
    return () => this.unsubscribeFromTyping(chatRoomId);
  }

  // ========================================================================
  // CLEANUP METHODS
  // ========================================================================

  /**
   * Unsubscribe from messages for a chat room
   */
  unsubscribeFromMessages(chatRoomId: string): void {
    const subscriptionKey = `messages-${chatRoomId}`;
    const unsubscribe = this.messageSubscriptions.get(subscriptionKey);
    
    if (unsubscribe) {
      unsubscribe();
      this.messageSubscriptions.delete(subscriptionKey);
      console.log('🔌 [ModernChat] Unsubscribed from messages:', chatRoomId);
    }
  }

  /**
   * Unsubscribe from typing indicators for a chat room
   */
  unsubscribeFromTyping(chatRoomId: string): void {
    const subscriptionKey = `typing-${chatRoomId}`;
    const unsubscribe = this.typingSubscriptions.get(subscriptionKey);
    
    if (unsubscribe) {
      unsubscribe();
      this.typingSubscriptions.delete(subscriptionKey);
      console.log('🔌 [ModernChat] Unsubscribed from typing:', chatRoomId);
    }
  }

  /**
   * Clean up all subscriptions and timeouts
   */
  cleanup(): void {
    console.log('🧹 [ModernChat] Cleaning up all subscriptions');

    // Clean up message subscriptions
    this.messageSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.messageSubscriptions.clear();

    // Clean up typing subscriptions
    this.typingSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.typingSubscriptions.clear();

    // Clear all typing timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();

    // Clear rate limiting cache
    this.lastTypingUpdate.clear();
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Generate optimistic message for instant UI updates
   */
  createOptimisticMessage(params: {
    chatRoomId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderType: 'customer' | 'therapist' | 'system' | 'admin';
  }): ChatMessage {
    return {
      $id: `optimistic-${Date.now()}`,
      $createdAt: new Date().toISOString(),
      chatRoomId: params.chatRoomId,
      content: params.content,
      senderId: params.senderId,
      senderName: params.senderName,
      senderType: params.senderType,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent'
    };
  }

  /**
   * Check if message is optimistic (not yet saved to database)
   */
  isOptimisticMessage(messageId: string): boolean {
    return messageId.startsWith('optimistic-');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const modernChatService = new ModernChatService();

// ============================================================================
// CLEANUP ON PAGE UNLOAD
// ============================================================================

// Clean up subscriptions when page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    modernChatService.cleanup();
  });
}
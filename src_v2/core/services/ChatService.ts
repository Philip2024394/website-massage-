/**
 * ============================================================================
 * 💬 CHAT SERVICE - INTEGRATED MESSAGING
 * ============================================================================
 * 
 * Unified chat service that integrates with booking system.
 * Eliminates message sending failures by using single Appwrite client.
 * 
 * ============================================================================
 */

import { 
  databases, 
  DATABASE_ID, 
  COLLECTION_IDS, 
  ID, 
  Query 
} from '../clients/appwrite';

export interface ChatMessage {
  id?: string;
  chatSessionId: string;
  bookingId?: string;
  senderId: string;
  senderType: 'customer' | 'therapist' | 'system' | 'admin';
  content: string;
  messageType: 'text' | 'image' | 'system_notification' | 'booking_update';
  timestamp: Date;
  read: boolean;
  metadata?: {
    bookingStatus?: string;
    providerInfo?: any;
    location?: any;
  };
}

export interface ChatSession {
  id?: string;
  bookingId?: string;
  userId: string;
  therapistId?: string;
  status: 'active' | 'ended' | 'paused';
  startedAt: Date;
  endedAt?: Date;
  lastActivity: Date;
  messageCount: number;
}

export class ChatService {
  
  /**
   * Create or get existing chat session
   */
  static async createChatSession(data: {
    bookingId?: string;
    userId: string;
    therapistId?: string;
  }): Promise<ChatSession> {
    try {
      const sessionId = ID.unique();
      const sessionData = {
        bookingId: data.bookingId,
        userId: data.userId,
        therapistId: data.therapistId,
        status: 'active',
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0
      };

      const session = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.chatSessions,
        sessionId,
        sessionData
      );

      console.log('✅ [CHAT] Session created:', session.$id);
      return {
        id: session.$id,
        ...sessionData,
        startedAt: new Date(sessionData.startedAt),
        lastActivity: new Date(sessionData.lastActivity)
      };
    } catch (error) {
      console.error('❌ [CHAT] Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Send message - THE FIX for message sending failures
   */
  static async sendMessage(data: {
    chatSessionId: string;
    senderId: string;
    senderType: 'customer' | 'therapist' | 'system' | 'admin';
    content: string;
    messageType?: 'text' | 'image' | 'system_notification' | 'booking_update';
    bookingId?: string;
    metadata?: any;
  }): Promise<ChatMessage> {
    try {
      const messageData = {
        chatSessionId: data.chatSessionId,
        bookingId: data.bookingId,
        senderId: data.senderId,
        senderType: data.senderType,
        content: data.content,
        messageType: data.messageType || 'text',
        timestamp: new Date().toISOString(),
        read: false,
        metadata: data.metadata || {}
      };

      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.messages,
        ID.unique(),
        messageData
      );

      // Update session activity
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.chatSessions,
        data.chatSessionId,
        {
          lastActivity: new Date().toISOString(),
          messageCount: Query.increment()
        }
      );

      console.log('✅ [CHAT] Message sent successfully');
      return {
        id: message.$id,
        ...messageData,
        timestamp: new Date(messageData.timestamp)
      };
    } catch (error) {
      console.error('❌ [CHAT] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  static async getChatHistory(chatSessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.messages,
        [
          Query.equal('chatSessionId', chatSessionId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        chatSessionId: doc.chatSessionId,
        bookingId: doc.bookingId,
        senderId: doc.senderId,
        senderType: doc.senderType,
        content: doc.content,
        messageType: doc.messageType,
        timestamp: new Date(doc.timestamp),
        read: doc.read,
        metadata: doc.metadata
      }));
    } catch (error) {
      console.error('❌ [CHAT] Failed to get chat history:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(messageIds: string[]): Promise<void> {
    try {
      const promises = messageIds.map(id =>
        databases.updateDocument(
          DATABASE_ID,
          COLLECTION_IDS.messages,
          id,
          { read: true }
        )
      );

      await Promise.all(promises);
      console.log(`✅ [CHAT] ${messageIds.length} messages marked as read`);
    } catch (error) {
      console.error('❌ [CHAT] Failed to mark messages as read:', error);
    }
  }

  /**
   * End chat session
   */
  static async endSession(chatSessionId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.chatSessions,
        chatSessionId,
        {
          status: 'ended',
          endedAt: new Date().toISOString()
        }
      );

      console.log('✅ [CHAT] Session ended:', chatSessionId);
    } catch (error) {
      console.error('❌ [CHAT] Failed to end session:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const createChatSession = ChatService.createChatSession;
export const sendMessage = ChatService.sendMessage;
export const getChatHistory = ChatService.getChatHistory;
export const markAsRead = ChatService.markAsRead;
export const endSession = ChatService.endSession;

console.log('💬 [CORE] ChatService loaded');
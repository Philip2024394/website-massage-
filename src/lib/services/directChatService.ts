/**
 * 🔧 DIRECT CHAT SERVICE - FALLBACK FOR RELIABILITY
 * 
 * This service provides direct database access for chat messages
 * Used as fallback when server-enforced service fails
 * Ensures chat never completely breaks
 */

import { databases, ID, client } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

export interface DirectChatMessage {
  $id?: string;
  $createdAt?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'therapist' | 'admin';
  receiverId: string;
  receiverName: string;
  receiverRole: 'customer' | 'therapist' | 'admin';
  message: string;
  messageType: 'text' | 'system' | 'booking' | 'auto-reply' | 'status-update' | 'fallback';
  bookingId?: string;
  isRead: boolean;
}

export const directChatService = {
  /**
   * Send message directly to database (no server validation)
   * Use only as fallback when main service fails
   */
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'therapist' | 'admin';
    receiverId: string;
    receiverName: string;
    receiverRole: 'customer' | 'therapist' | 'admin';
    message: string;
    messageType?: 'text' | 'system' | 'booking' | 'auto-reply' | 'status-update' | 'fallback';
    bookingId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('🔧 [DIRECT CHAT] Sending message via direct database access...');
      
      const messageData = {
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        receiverRole: data.receiverRole,
        message: data.message,
        messageType: data.messageType || 'text',
        isRead: false,
        
        // Duplicate fields for compatibility
        messageId: ID.unique(),
        recipientId: data.receiverId,
        content: data.message,
        sentAt: new Date().toISOString(),
        
        // Optional fields
        ...(data.bookingId && { bookingId: data.bookingId })
      };
      
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        ID.unique(),
        messageData
      );
      
      console.log('✅ [DIRECT CHAT] Message sent successfully:', response.$id);
      
      return {
        success: true,
        messageId: response.$id
      };
      
    } catch (error) {
      console.error('❌ [DIRECT CHAT] Failed to send message:', error);
      
      return {
        success: false,
        error: (error as Error).message
      };
    }
  },

  /**
   * Get messages directly from database
   */
  async getMessages(conversationId: string): Promise<DirectChatMessage[]> {
    try {
      console.log('🔧 [DIRECT CHAT] Fetching messages for:', conversationId);
      
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        []
      );
      
      // Filter messages for this conversation
      const messages = response.documents
        .filter(doc => doc.conversationId === conversationId)
        .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime())
        .map(doc => ({
          $id: doc.$id,
          $createdAt: doc.$createdAt,
          conversationId: doc.conversationId,
          senderId: doc.senderId,
          senderName: doc.senderName,
          senderRole: doc.senderRole,
          receiverId: doc.receiverId,
          receiverName: doc.receiverName,
          receiverRole: doc.receiverRole,
          message: doc.message,
          messageType: doc.messageType || 'text',
          isRead: doc.isRead || false,
          ...(doc.bookingId && { bookingId: doc.bookingId })
        })) as DirectChatMessage[];
      
      console.log('✅ [DIRECT CHAT] Found', messages.length, 'messages');
      
      return messages;
      
    } catch (error) {
      console.error('❌ [DIRECT CHAT] Failed to fetch messages:', error);
      return [];
    }
  },

  /**
   * Subscribe to messages using Appwrite real-time
   */
  subscribeToMessages(conversationId: string, callback: (message: DirectChatMessage) => void): () => void {
    try {
      console.log('🔧 [DIRECT CHAT] Subscribing to messages for:', conversationId);
      
      const channelName = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatMessages}.documents`;
      
      const unsubscribe = client.subscribe(channelName, (response: any) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const payload = response.payload as DirectChatMessage;
          if (payload.conversationId === conversationId) {
            console.log('🔧 [DIRECT CHAT] New message received:', payload.$id);
            callback(payload);
          }
        }
      });
      
      console.log('✅ [DIRECT CHAT] Subscription active for:', conversationId);
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ [DIRECT CHAT] Subscription failed:', error);
      return () => {};
    }
  }
};

export default directChatService;
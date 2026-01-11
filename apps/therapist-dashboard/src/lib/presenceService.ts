/**
 * 👥 Presence & Typing Indicators Service
 * 
 * Real-time presence (online/offline) and typing indicators for chat
 * Facebook standards compliance: Real-time communication indicators
 */

import { client, APPWRITE_CONFIG } from '../../../../lib/appwrite/config';

type PresenceCallback = (isOnline: boolean, lastSeen?: number) => void;
type TypingCallback = (isTyping: boolean, userId?: string) => void;

class PresenceService {
  private presenceSubscriptions = new Map<string, () => void>();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();
  private typingSubscriptions = new Map<string, () => void>();
  
  /**
   * Subscribe to admin/support online status
   */
  subscribeToPresence(
    conversationId: string,
    callback: PresenceCallback
  ): () => void {
    const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.presence.documents`;
    
    console.log('👥 Subscribing to presence for conversation:', conversationId);
    
    try {
      const unsubscribe = client.subscribe(channel, (response: any) => {
        if (response.payload?.conversationId === conversationId) {
          const isOnline = response.payload?.isOnline || false;
          const lastSeen = response.payload?.lastSeen;
          
          console.log('👥 Presence update:', { conversationId, isOnline, lastSeen });
          callback(isOnline, lastSeen);
        }
      });
      
      // Store subscription for cleanup
      this.presenceSubscriptions.set(conversationId, unsubscribe);
      
      // Return cleanup function
      return () => {
        console.log('👥 Unsubscribing from presence:', conversationId);
        unsubscribe();
        this.presenceSubscriptions.delete(conversationId);
      };
    } catch (error) {
      console.error('Failed to subscribe to presence:', error);
      return () => {}; // No-op cleanup
    }
  }
  
  /**
   * Send typing indicator (auto-clears after 3 seconds)
   */
  async sendTypingIndicator(conversationId: string, therapistId: string) {
    // Clear existing timeout
    const existing = this.typingTimeouts.get(conversationId);
    if (existing) {
      clearTimeout(existing);
    }
    
    try {
      console.log('⌨️ Sending typing indicator:', conversationId);
      
      // Send typing event to database
      // TODO: Implement messaging service typing event
      // await messagingService.sendTypingEvent(conversationId, therapistId, true);
      
      // Auto-clear after 3 seconds
      const timeout = setTimeout(async () => {
        console.log('⌨️ Clearing typing indicator:', conversationId);
        // await messagingService.sendTypingEvent(conversationId, therapistId, false);
        this.typingTimeouts.delete(conversationId);
      }, 3000);
      
      this.typingTimeouts.set(conversationId, timeout);
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }
  
  /**
   * Subscribe to typing indicators from other users
   */
  subscribeToTyping(
    conversationId: string,
    callback: TypingCallback
  ): () => void {
    const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.typing.documents`;
    
    console.log('⌨️ Subscribing to typing indicators for conversation:', conversationId);
    
    try {
      const unsubscribe = client.subscribe(channel, (response: any) => {
        if (response.payload?.conversationId === conversationId) {
          const isTyping = response.payload?.isTyping || false;
          const userId = response.payload?.userId;
          
          console.log('⌨️ Typing update:', { conversationId, isTyping, userId });
          callback(isTyping, userId);
        }
      });
      
      // Store subscription for cleanup
      this.typingSubscriptions.set(conversationId, unsubscribe);
      
      // Return cleanup function
      return () => {
        console.log('⌨️ Unsubscribing from typing indicators:', conversationId);
        unsubscribe();
        this.typingSubscriptions.delete(conversationId);
      };
    } catch (error) {
      console.error('Failed to subscribe to typing indicators:', error);
      return () => {}; // No-op cleanup
    }
  }
  
  /**
   * Broadcast therapist online status
   */
  async broadcastPresence(therapistId: string, isOnline: boolean) {
    try {
      console.log('📡 Broadcasting presence:', { therapistId, isOnline });
      
      // TODO: Implement presence broadcast to database
      // await database.createDocument(
      //   APPWRITE_CONFIG.databaseId,
      //   APPWRITE_CONFIG.collections.presence,
      //   'unique()',
      //   {
      //     therapistId,
      //     isOnline,
      //     lastSeen: Date.now()
      //   }
      // );
    } catch (error) {
      console.error('Failed to broadcast presence:', error);
    }
  }
  
  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    console.log('🧹 Cleaning up presence service subscriptions');
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Unsubscribe from all presence subscriptions
    this.presenceSubscriptions.forEach(unsubscribe => unsubscribe());
    this.presenceSubscriptions.clear();
    
    // Unsubscribe from all typing subscriptions
    this.typingSubscriptions.forEach(unsubscribe => unsubscribe());
    this.typingSubscriptions.clear();
  }
}

// Export singleton instance
export const presenceService = new PresenceService();

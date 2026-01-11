/**
 * 📬 Message Delivery Service
 * 
 * Tracks message delivery status and retries failed messages
 * Facebook standards compliance: Reliable message delivery with confirmations
 */

import { simpleChatService } from '../../../../lib/simpleChatService';

interface PendingMessage {
  messageId: string;
  conversationId: string;
  content: string;
  retryCount: number;
  timestamp: number;
  status: 'pending' | 'sending' | 'delivered' | 'failed';
}

type MessageStatusCallback = (messageId: string, status: 'delivered' | 'failed') => void;

class MessageDeliveryService {
  private pendingMessages = new Map<string, PendingMessage>();
  private statusCallbacks = new Map<string, MessageStatusCallback>();
  private maxRetries = 3;
  
  /**
   * Send message with delivery confirmation and automatic retry
   */
  async sendWithConfirmation(
    conversationId: string,
    content: string,
    onStatusChange?: MessageStatusCallback
  ): Promise<string> {
    const messageId = crypto.randomUUID();
    
    // Add to pending queue
    this.pendingMessages.set(messageId, {
      messageId,
      conversationId,
      content,
      retryCount: 0,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    // Register callback
    if (onStatusChange) {
      this.statusCallbacks.set(messageId, onStatusChange);
    }
    
    // Attempt to send
    await this.attemptSend(messageId);
    
    return messageId;
  }
  
  /**
   * Attempt to send a message
   */
  private async attemptSend(messageId: string): Promise<void> {
    const pending = this.pendingMessages.get(messageId);
    if (!pending) return;
    
    // Update status
    pending.status = 'sending';
    
    try {
      console.log(`📤 Sending message ${messageId} (attempt ${pending.retryCount + 1}/${this.maxRetries + 1})`);
      
      // Send message via chat service
      await simpleChatService.sendMessage(
        pending.conversationId,
        pending.content
      );
      
      // Mark as delivered
      pending.status = 'delivered';
      this.pendingMessages.delete(messageId);
      
      // Notify callback
      const callback = this.statusCallbacks.get(messageId);
      if (callback) {
        callback(messageId, 'delivered');
        this.statusCallbacks.delete(messageId);
      }
      
      console.log(`✅ Message ${messageId} delivered`);
    } catch (error) {
      console.error(`❌ Message ${messageId} send failed:`, error);
      
      // Queue for retry if not exceeded max attempts
      await this.queueForRetry(messageId);
    }
  }
  
  /**
   * Queue message for retry with exponential backoff
   */
  private async queueForRetry(messageId: string): Promise<void> {
    const pending = this.pendingMessages.get(messageId);
    if (!pending) return;
    
    pending.retryCount++;
    
    // Check if max retries exceeded
    if (pending.retryCount > this.maxRetries) {
      console.error(`❌ Message ${messageId} failed after ${this.maxRetries} retries`);
      pending.status = 'failed';
      
      // Notify callback
      const callback = this.statusCallbacks.get(messageId);
      if (callback) {
        callback(messageId, 'failed');
        this.statusCallbacks.delete(messageId);
      }
      
      return;
    }
    
    // Calculate exponential backoff: 2s, 4s, 8s
    const delay = Math.pow(2, pending.retryCount) * 1000;
    
    console.log(`🔄 Retrying message ${messageId} in ${delay}ms`);
    pending.status = 'pending';
    
    // Schedule retry
    setTimeout(() => {
      this.attemptSend(messageId);
    }, delay);
  }
  
  /**
   * Get message status
   */
  getMessageStatus(messageId: string): 'delivered' | 'pending' | 'failed' | 'unknown' {
    const pending = this.pendingMessages.get(messageId);
    if (!pending) return 'unknown';
    return pending.status === 'delivered' ? 'delivered' : 
           pending.status === 'failed' ? 'failed' : 'pending';
  }
  
  /**
   * Get all pending messages
   */
  getPendingMessages(): PendingMessage[] {
    return Array.from(this.pendingMessages.values());
  }
  
  /**
   * Cancel message delivery
   */
  cancelMessage(messageId: string) {
    console.log(`🚫 Canceling message ${messageId}`);
    this.pendingMessages.delete(messageId);
    this.statusCallbacks.delete(messageId);
  }
  
  /**
   * Get stats for monitoring
   */
  getStats() {
    const messages = Array.from(this.pendingMessages.values());
    return {
      total: messages.length,
      pending: messages.filter(m => m.status === 'pending' || m.status === 'sending').length,
      failed: messages.filter(m => m.status === 'failed').length
    };
  }
}

// Export singleton instance
export const messageDeliveryService = new MessageDeliveryService();

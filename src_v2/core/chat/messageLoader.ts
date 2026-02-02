/**
 * ============================================================================
 * 💬 CHAT MESSAGE LOADER - STEP 17 STABILIZATION
 * ============================================================================
 * 
 * Core functions for loading messages and real-time subscriptions.
 * UI components call these functions - NO direct Appwrite access in UI.
 * 
 * Functions:
 * - loadChatMessages(bookingId): Load historical messages
 * - subscribeToChatUpdates(bookingId, callback): Real-time updates
 * 
 * This prevents Step 16 UI from having direct Appwrite access.
 * 
 * ============================================================================
 */

import { appwriteClient } from '../clients';
import { Query } from 'appwrite';
import type { ChatMessage } from './chat.types';

export interface MessageLoadResult {
  success: boolean;
  messages: ChatMessage[];
  error?: string;
  total?: number;
}

export interface ChatSubscriptionCallback {
  (message: ChatMessage, event: 'create' | 'update' | 'delete'): void;
}

/**
 * Load historical messages for a booking
 * UI calls this instead of direct Appwrite access
 */
export async function loadChatMessages(bookingId: string): Promise<MessageLoadResult> {
  try {
    if (!bookingId || typeof bookingId !== 'string') {
      return {
        success: false,
        messages: [],
        error: 'Invalid booking ID provided'
      };
    }

    const response = await appwriteClient.databases.listDocuments(
      'massage-bookings-db',
      'messages',
      [
        Query.equal('bookingId', bookingId),
        Query.orderAsc('$createdAt'),
        Query.limit(100)
      ]
    );

    return {
      success: true,
      messages: response.documents as ChatMessage[],
      total: response.total
    };

  } catch (error: any) {
    console.error('❌ [CHAT CORE] Failed to load messages:', error);
    
    return {
      success: false,
      messages: [],
      error: error.message || 'Failed to load chat messages'
    };
  }
}

/**
 * Subscribe to real-time chat updates
 * UI calls this instead of direct Appwrite subscription
 */
export function subscribeToChatUpdates(
  bookingId: string, 
  callback: ChatSubscriptionCallback
): () => void {
  
  if (!bookingId || typeof bookingId !== 'string') {
    console.warn('⚠️ [CHAT CORE] Invalid booking ID for subscription');
    return () => {}; // Return no-op unsubscribe
  }

  if (!callback || typeof callback !== 'function') {
    console.warn('⚠️ [CHAT CORE] Invalid callback for subscription');
    return () => {}; // Return no-op unsubscribe
  }

  try {
    const unsubscribe = appwriteClient.subscribe(
      [`databases.massage-bookings-db.collections.messages.documents`],
      (response) => {
        try {
          const payload = response.payload as ChatMessage;
          
          // Only process messages for this specific booking
          if (payload.bookingId === bookingId) {
            let eventType: 'create' | 'update' | 'delete' = 'create';
            
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
              eventType = 'create';
            } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
              eventType = 'update';
            } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
              eventType = 'delete';
            }

            callback(payload, eventType);
          }
        } catch (callbackError) {
          console.error('❌ [CHAT CORE] Subscription callback error:', callbackError);
        }
      }
    );

    console.log('✅ [CHAT CORE] Real-time subscription established for booking:', bookingId);
    return unsubscribe;

  } catch (error: any) {
    console.error('❌ [CHAT CORE] Failed to establish subscription:', error);
    return () => {}; // Return no-op unsubscribe
  }
}

/**
 * Check if real-time subscriptions are available
 */
export function isRealtimeAvailable(): boolean {
  try {
    return typeof appwriteClient.subscribe === 'function';
  } catch {
    return false;
  }
}

console.log('📡 [CHAT CORE] Message loader functions ready - UI can load messages without direct Appwrite access');
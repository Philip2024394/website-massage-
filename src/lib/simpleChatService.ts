/**
 * 🔒 SIMPLIFIED CHAT & BOOKING SERVICE - LOGIC LOCKED
 * DO NOT MODIFY: Scheduled booking validation, bank details enforcement
 * UI/text changes allowed ONLY
 * Last locked: 2026-01-28
 *
 * Chat Integration for Therapist Dashboard
 * Simplified service for immediate use with existing ChatWindow
 */

import { databases, ID, client } from './appwrite';
import { Query } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS, REQUIRED_BANK_FIELDS } from '../constants/businessLogic';

export interface ChatMessage {
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
    metadata?: string; // JSON string
}

/**
 * Simplified chat service for immediate integration
 */
export const simpleChatService = {
    /**
     * Send a message and save to database
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
        metadata?: Record<string, any>;
    }): Promise<ChatMessage> {
        try {
            const timestamp = new Date().toISOString();
            const messageData: any = {
                // Required message content fields
                message: data.message,
                content: data.message.length > 255 ? data.message.substring(0, 255) : data.message,
                
                // Required sender/recipient fields
                senderId: data.senderId,
                senderName: data.senderName,
                senderType: data.senderRole,
                recipientId: data.receiverId,
                recipientName: data.receiverName,
                recipientType: data.receiverRole,
                
                // Required IDs and metadata
                roomId: data.conversationId,
                conversationId: data.conversationId,
                receiverId: data.receiverId,
                receivername: data.receiverName,
                sessionId: data.conversationId,
                
                // Required enums and settings
                messageType: data.messageType || 'text',
                originalLanguage: 'en',
                
                // Required timestamps and status
                createdAt: timestamp,
                read: false,
                isSystemMessage: false,
                
                // Required fields with defaults
                bookingid: data.bookingId || 'none',
                originalMessageId: 'none',
                expiresat: new Date(Date.now() + 24*60*60*1000).toISOString(),
                archivedBy: 'none',
                
                // Optional metadata
                metadata: JSON.stringify(data.metadata || {})
            };

            if (data.bookingId) {
                messageData.bookingId = data.bookingId;
            }

            console.log('📤 Creating message document:', {
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.chatMessages,
                messageData: {
                    conversationId: messageData.conversationId,
                    senderId: messageData.senderId,
                    senderRole: messageData.senderRole
                }
            });
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                ID.unique(),
                messageData
            );

            console.log('✅ Message saved to database:', response.$id);
            return response as unknown as ChatMessage;
        } catch (error: any) {
            console.error('❌ Error sending message:', {
                message: error?.message,
                code: error?.code,
                type: error?.type,
                response: error?.response,
                collectionId: APPWRITE_CONFIG.collections.chatMessages
            });
            throw error;
        }
    },

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: string): Promise<ChatMessage[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );

            const messages = response.documents.map(doc => ({
                ...doc,
                metadata: doc.metadata ? JSON.parse(doc.metadata as string) : {}
            })) as unknown as ChatMessage[];

            return messages.reverse();
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
            return [];
        }
    },

    /**
     * Subscribe to new messages
     */
    subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void): () => void {
        try {
            const collectionId = APPWRITE_CONFIG.collections.chatMessages;
            const channelName = `databases.${APPWRITE_CONFIG.databaseId}.collections.${collectionId}.documents`;
            
            const unsubscribe = client.subscribe(channelName, (response: any) => {
                const payload = response.payload as ChatMessage;
                if (payload.conversationId === conversationId) {
                    callback(payload);
                }
            });

            console.log('✅ Subscribed to messages for:', conversationId);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error subscribing:', error);
            return () => {};
        }
    }
};

/**
 * Simplified booking service
 */
export const simpleBookingService = {
    /**
     * ============================================================================
     * 🔒 HARD LOCK: UPDATE BOOKING STATUS WITH BACKEND VALIDATION
     * ============================================================================
     * Business Rule: Scheduled bookings require complete bank details
     * Constants: BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS, REQUIRED_BANK_FIELDS
     * Impact: Server-side enforcement prevents API bypass
     * Returns: { success: boolean, error?: string }
     * DO NOT MODIFY - Critical security validation layer
     * ============================================================================
     */
    async updateStatus(bookingId: string, status: string, therapistData?: any): Promise<{ success: boolean; error?: string }> {
        try {
            // ============================================================================
            // 🔒 HARD LOCK: SCHEDULED BOOKING BANK DETAILS VALIDATION
            // ============================================================================
            // If accepting scheduled booking, verify therapist has complete bank details
            // All three fields (bankName, accountName, accountNumber) must be populated
            // DO NOT MODIFY - Critical for payment flow
            // ============================================================================
            if (status === 'confirmed' && therapistData) {
                const { isScheduled, bankName, accountName, accountNumber } = therapistData;
                
                if (BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS && isScheduled) {
                    // Validate all required bank fields
                    const missingFields = [];
                    if (REQUIRED_BANK_FIELDS.bankName && !bankName) missingFields.push('Bank Name');
                    if (REQUIRED_BANK_FIELDS.accountName && !accountName) missingFields.push('Account Name');
                    if (REQUIRED_BANK_FIELDS.accountNumber && !accountNumber) missingFields.push('Account Number');
                    
                    if (missingFields.length > 0) {
                        const errorMsg = `Bank details required for scheduled bookings: ${missingFields.join(', ')}. Please complete payment information first.`;
                        console.error('❌ BLOCKED: Scheduled booking acceptance - Missing:', missingFields);
                        return { 
                            success: false, 
                            error: errorMsg 
                        };
                    }
                }
            }

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId,
                {
                    status,
                    updatedAt: new Date().toISOString()
                }
            );
            console.log(`✅ Booking ${bookingId} updated to: ${status}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating booking:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to update booking' 
            };
        }
    },

    /**
     * Notify admin about event
     */
    async notifyAdmin(message: string, data?: any): Promise<void> {
        try {
            // FORCE-FAIL: Throw if collection is empty
            const notificationsCollection = APPWRITE_CONFIG.collections.notifications;
            if (!notificationsCollection || notificationsCollection === '') {
                throw new Error('notifications collection ID is empty - cannot notify admin');
            }

            const timestamp = new Date().toISOString();
            const notifId = ID.unique();
            
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                notificationsCollection,
                notifId,
                {
                    // Primary fields (matching your Appwrite schema)
                    notificationId: notifId, // duplicate of $id
                    userId: 'admin',
                    eventId: data?.bookingId || data?.eventId || null,
                    notificationType: 'booking_event', // enum field
                    message: message,
                    status: 'unread', // enum field (unread/read)
                    createdAt: timestamp, // duplicate of $createdAt
                    type: 'booking_event', // duplicate of notificationType
                    title: 'Booking Update',
                    data: JSON.stringify(data || {}),
                    isRead: false // duplicate of status
                }
            );
            console.log('✅ Admin notified');
        } catch (error) {
            console.error('❌ Error notifying admin:', error);
        }
    }
};

export default simpleChatService;


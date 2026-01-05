/**
 * Chat Integration for Therapist Dashboard
 * Simplified service for immediate use with existing ChatWindow
 */

import { databases, ID, client } from './appwrite';
import { Query } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

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
                // Primary fields (matching your Appwrite schema)
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
                
                // Duplicate fields (your schema has these)
                messageId: ID.unique(), // duplicate of $id
                recipientId: data.receiverId, // duplicate of receiverId
                content: data.message, // duplicate of message
                sentAt: timestamp, // duplicate of $createdAt
                
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
     * Update booking status
     */
    async updateStatus(bookingId: string, status: string): Promise<void> {
        try {
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
        } catch (error) {
            console.error('❌ Error updating booking:', error);
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

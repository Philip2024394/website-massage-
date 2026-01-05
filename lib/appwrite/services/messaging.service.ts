/**
 * Messaging Service
 * Handles chat and messaging between users
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const messagingService = {
    async create(message: any): Promise<any> {
        try {
            console.log('📝 Creating message document:', {
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.messages,
                messageKeys: Object.keys(message)
            });
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages,
                ID.unique(),
                message
            );
            return response;
        } catch (error: any) {
            console.error('❌ Error creating message:', {
                message: error?.message,
                code: error?.code,
                type: error?.type,
                response: error?.response
            });
            throw error;
        }
    },

    async getConversation(conversationId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return [];
        }
    },

    async markAsRead(messageId: string): Promise<void> {
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages,
                messageId,
                { read: true }
            );
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    },

    // Additional messaging methods
    generateConversationId(
        user1: string | { id: string; role?: string },
        user2: string | { id: string; role?: string }
    ): string {
        const id1 = typeof user1 === 'string' ? user1 : user1.id;
        const id2 = typeof user2 === 'string' ? user2 : user2.id;
        const sortedIds = [id1, id2].sort();
        return `${sortedIds[0]}_${sortedIds[1]}`;
    },

    async sendMessage(messageData: any): Promise<any> {
        try {
            console.log('[MESSAGING SERVICE] sendMessage called with:', messageData);
            
            // Normalize ids in case callers pass objects with { id, role }
            const senderId = typeof messageData?.senderId === 'object' ? messageData.senderId.id : messageData.senderId;
            const recipientId = typeof messageData?.recipientId === 'object' ? messageData.recipientId.id : messageData.recipientId;

            const conversationId = messageData.conversationId || this.generateConversationId(senderId, recipientId);
            
            console.log('[MESSAGING SERVICE] Normalized IDs - sender:', senderId, 'recipient:', recipientId);
            console.log('[MESSAGING SERVICE] Conversation ID:', conversationId);
            console.log('[MESSAGING SERVICE] Database ID:', APPWRITE_CONFIG.databaseId);
            console.log('[MESSAGING SERVICE] Messages Collection ID:', APPWRITE_CONFIG.collections.messages);
            
            // Generate messageId if not provided
            const messageId = messageData.messageId || ID.unique();
            
            // CRITICAL: Only include schema-compliant fields (no spread operator)
            const message = {
                messageId,  // Required by Messages collection
                senderId,
                recipientId,
                conversationId,
                content: messageData.content,
                type: messageData.type || 'text',
                read: false,
                createdAt: new Date().toISOString()
            };
            
            console.log('[MESSAGING SERVICE] Message object to be created:', message);
            
            const result = await this.create(message);
            console.log('[MESSAGING SERVICE] Message created successfully:', result);
            return result;
        } catch (error: any) {
            console.error('[MESSAGING SERVICE] ❌ Error sending message:', {
                message: error?.message,
                code: error?.code,
                type: error?.type,
                response: error?.response,
                collectionId: APPWRITE_CONFIG.collections.messages
            });
            throw error;
        }
    },

    async getUserConversations(userId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages,
                [
                    Query.or([
                        Query.equal('senderId', userId),
                        Query.equal('recipientId', userId)
                    ]),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            return [];
        }
    }
};

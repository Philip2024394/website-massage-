/**
 * Messaging Service
 * Handles chat and messaging between users
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const messagingService = {
    async create(message: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages,
                ID.unique(),
                message
            );
            return response;
        } catch (error) {
            console.error('Error creating message:', error);
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
                    Query.orderAsc('createdAt'),
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
            // Normalize ids in case callers pass objects with { id, role }
            const senderId = typeof messageData?.senderId === 'object' ? messageData.senderId.id : messageData.senderId;
            const recipientId = typeof messageData?.recipientId === 'object' ? messageData.recipientId.id : messageData.recipientId;

            const conversationId = messageData.conversationId || this.generateConversationId(senderId, recipientId);
            const message = {
                senderId,
                recipientId,
                conversationId,
                content: messageData.content,
                type: messageData.type || 'text',
                read: false,
                createdAt: new Date().toISOString(),
                ...messageData
            };
            return await this.create(message);
        } catch (error) {
            console.error('Error sending message:', error);
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
                    Query.orderDesc('createdAt'),
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

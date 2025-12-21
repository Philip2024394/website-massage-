/**
 * Admin Message Service  
 * Manages messaging between agents and admins
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const adminMessageService = {
    /**
     * Get messages for an agent
     */
    async getMessages(agentId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.or([
                        Query.equal('senderId', agentId),
                        Query.equal('receiverId', agentId),
                        Query.equal('receiverId', 'admin')
                    ]),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching admin messages:', error);
            return [];
        }
    },

    /**
     * Send a message
     */
    async sendMessage(data: {
        senderId: string;
        senderName: string;
        senderType: 'agent' | 'admin';
        receiverId: string;
        message: string;
    }): Promise<any> {
        try {
            const messageData = {
                ...data,
                isRead: false,
                createdAt: new Date().toISOString()
            };

            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                ID.unique(),
                messageData
            );

            console.log('✅ Message sent:', response.$id);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    /**
     * Mark messages as read
     */
    async markAsRead(agentId: string): Promise<void> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.equal('receiverId', agentId),
                    Query.equal('isRead', false)
                ]
            );

            const updatePromises = response.documents.map((doc: any) =>
                databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'admin_messages',
                    doc.$id,
                    { isRead: true }
                )
            );

            await Promise.all(updatePromises);
            console.log(`✅ Marked ${response.documents.length} messages as read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    /**
     * Get unread message count
     */
    async getUnreadCount(agentId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.equal('receiverId', agentId),
                    Query.equal('isRead', false)
                ]
            );
            return response.total;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
};

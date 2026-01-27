import { databases, account, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

interface ChatMessage {
    $id?: string;
    senderId: string;
    senderName: string;
    senderType: string;
    recipientId: string;
    recipientName: string;
    recipientType: string;
    message: string;
    createdAt: string;
    read: boolean;
    messageType?: 'text' | 'file' | 'location' | 'system';
    fileUrl?: string;
    fileName?: string;
    location?: string;
    keepForever?: boolean;
    roomId?: string;
    isSystemMessage?: boolean;
    readAt?: string;
}

interface ChatThread {
    id: string;
    userId: string;
    userName: string;
    messages: ChatMessage[];
    lastActivity: string;
    unreadCount: number;
}

export const chatService = {
    // Get all admin chat conversations
    async getAdminChats(): Promise<ChatThread[]> {
        try {
            // Get all unique chat participants who have sent messages
            const allMessages = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                [Query.orderDesc('createdAt'), Query.limit(1000)]
            );

            // Group messages by sender
            const chatThreads = new Map<string, ChatThread>();
            
            allMessages.documents.forEach((message: any) => {
                const userId = message.senderId;
                const userName = message.senderName;
                
                if (!chatThreads.has(userId)) {
                    chatThreads.set(userId, {
                        id: userId,
                        userId,
                        userName,
                        messages: [],
                        lastActivity: message.createdAt,
                        unreadCount: 0
                    });
                }
                
                const thread = chatThreads.get(userId)!;
                thread.messages.push(message);
                
                // Update last activity if this message is newer
                if (new Date(message.createdAt) > new Date(thread.lastActivity)) {
                    thread.lastActivity = message.createdAt;
                }
                
                // Count unread messages from user (not admin)
                if (!message.read && message.senderType !== 'admin') {
                    thread.unreadCount++;
                }
            });

            return Array.from(chatThreads.values()).sort((a, b) => 
                new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
            );
        } catch (error) {
            console.error('Error fetching admin chats:', error);
            return [];
        }
    },

    // Get chat thread for specific user
    async getChatThread(userId: string): Promise<ChatThread | null> {
        try {
            const messages = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                [
                    Query.or([
                        Query.equal('senderId', userId),
                        Query.equal('recipientId', userId)
                    ]),
                    Query.orderAsc('createdAt')
                ]
            );

            if (messages.documents.length === 0) {
                return null;
            }

            const firstMessage = messages.documents[0];
            const lastMessage = messages.documents[messages.documents.length - 1];
            
            return {
                id: userId,
                userId,
                userName: firstMessage.senderName,
                messages: messages.documents as unknown as ChatMessage[],
                lastActivity: lastMessage.createdAt,
                unreadCount: messages.documents.filter((m: any) => 
                    !m.read && m.senderType !== 'admin'
                ).length
            };
        } catch (error) {
            console.error('Error fetching chat thread:', error);
            return null;
        }
    },

    // Send message as admin
    async sendMessage(recipientId: string, message: string, isAdmin: boolean = true): Promise<ChatMessage | null> {
        try {
            // ✅ ENSURE AUTHENTICATION: Chat operations require valid session
            // Admin/therapist chat needs authentication for real-time permissions
            const { ensureAuthSession } = await import('../lib/authSessionHelper');
            const authResult = await ensureAuthSession('chat messaging');
            
            if (!authResult.success) {
                console.error('❌ Cannot send chat message without authentication');
                return null;
            }
            
            const currentUser = await account.get();
            
            // ✅ USE CENTRALIZED MESSAGING SERVICE - Single source of truth
            const { messagingService } = await import('../lib/appwrite/services/messaging.service');
            
            const conversationId = [recipientId, currentUser.$id].sort().join('_');
            
            const response = await messagingService.sendMessage({
                conversationId,
                senderId: isAdmin ? 'admin' : currentUser.$id,
                senderName: isAdmin ? 'Admin' : currentUser.name,
                recipientId: recipientId,
                recipientName: '', // Will be populated from user data
                content: message,
                messageType: 'text',
            });

            return response as unknown as ChatMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    },

    // Mark messages as read
    async markMessagesAsRead(userId: string): Promise<void> {
        try {
            // Get unread messages from this user
            const unreadMessages = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                [
                    Query.equal('senderId', userId),
                    Query.equal('read', false)
                ]
            );

            // Mark each message as read
            for (const message of unreadMessages.documents) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatMessages,
                    message.$id,
                    {
                        read: true,
                        readAt: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    },

    // Get live chat statistics
    async getChatStats(): Promise<{
        totalMessages: number;
        activeChats: number;
        unreadMessages: number;
        averageResponseTime: number;
    }> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Get today's messages
            const todayMessages = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                [
                    Query.greaterThanEqual('createdAt', today.toISOString()),
                    Query.orderDesc('createdAt')
                ]
            );

            // Get all unread messages
            const unreadMessages = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatMessages,
                [Query.equal('read', false)]
            );

            // Count active chats (chats with messages in last 24 hours)
            const activeChats = new Set();
            todayMessages.documents.forEach((message: any) => {
                activeChats.add(message.senderId);
                activeChats.add(message.recipientId);
            });

            return {
                totalMessages: todayMessages.documents.length,
                activeChats: activeChats.size,
                unreadMessages: unreadMessages.documents.length,
                averageResponseTime: 0 // Can be calculated based on response patterns
            };
        } catch (error) {
            console.error('Error fetching chat stats:', error);
            return {
                totalMessages: 0,
                activeChats: 0,
                unreadMessages: 0,
                averageResponseTime: 0
            };
        }
    },

    // Subscribe to real-time chat updates
    subscribeToChat(callback: (message: ChatMessage) => void) {
        // This would use Appwrite's real-time subscriptions
        // For now, we'll simulate with polling
        const interval = setInterval(async () => {
            try {
                const recentMessages = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatMessages,
                    [
                        Query.greaterThan('createdAt', new Date(Date.now() - 30000).toISOString()),
                        Query.orderDesc('createdAt'),
                        Query.limit(10)
                    ]
                );

                recentMessages.documents.forEach((message: any) => {
                    callback(message as ChatMessage);
                });
            } catch (error) {
                console.error('Error in chat subscription:', error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }
};

export default chatService;

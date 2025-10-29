/**
 * Chat Service
 * Handles all chat room and message operations with Appwrite backend
 * Includes auto-translation support for EN ↔ ID
 */

import { Client, Databases, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { ChatRoom, ChatMessage, ChatRoomStatus, MessageSenderType } from '../types';
import { translateText } from './translationService';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_ROOMS_COLLECTION = APPWRITE_CONFIG.collections.chatRooms;
const CHAT_MESSAGES_COLLECTION = APPWRITE_CONFIG.collections.chatMessages;

/**
 * Create a new chat room for a booking
 */
export async function createChatRoom(data: {
    bookingId: number;
    customerId: string;
    customerName: string;
    customerLanguage: 'en' | 'id';
    customerPhoto?: string;
    therapistId: number;
    therapistName: string;
    therapistLanguage: 'en' | 'id';
    therapistType: 'therapist' | 'place';
    therapistPhoto?: string;
    expiresAt: string;
}): Promise<ChatRoom> {
    try {
        const chatRoom = await databases.createDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            ID.unique(),
            {
                bookingId: data.bookingId,
                customerId: data.customerId,
                customerName: data.customerName,
                customerLanguage: data.customerLanguage,
                customerPhoto: data.customerPhoto || '',
                therapistId: data.therapistId,
                therapistName: data.therapistName,
                therapistLanguage: data.therapistLanguage,
                therapistType: data.therapistType,
                therapistPhoto: data.therapistPhoto || '',
                status: ChatRoomStatus.Pending,
                expiresAt: data.expiresAt,
                unreadCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        return chatRoom as unknown as ChatRoom;
    } catch (error) {
        console.error('Error creating chat room:', error);
        throw error;
    }
}

/**
 * Send a message in a chat room (with auto-translation)
 */
export async function sendMessage(data: {
    roomId: string;
    senderId: string;
    senderType: MessageSenderType;
    senderName: string;
    text: string;
    senderLanguage: 'en' | 'id';
    recipientLanguage: 'en' | 'id';
}): Promise<ChatMessage> {
    try {
        // Auto-translate message if languages are different
        let translatedText: string | undefined;
        if (data.senderLanguage !== data.recipientLanguage) {
            translatedText = await translateText(
                data.text,
                data.senderLanguage,
                data.recipientLanguage
            );
        }

        // Create message document
        const message = await databases.createDocument(
            DATABASE_ID,
            CHAT_MESSAGES_COLLECTION,
            ID.unique(),
            {
                roomId: data.roomId,
                senderId: data.senderId,
                senderType: data.senderType,
                senderName: data.senderName,
                originalText: data.text,
                originalLanguage: data.senderLanguage,
                translatedText: translatedText || data.text,
                translatedLanguage: data.recipientLanguage,
                isRead: false,
                isSystemMessage: false,
                createdAt: new Date().toISOString()
            }
        );

        // Update chat room with last message info
        await databases.updateDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            data.roomId,
            {
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview: data.text.substring(0, 50),
                updatedAt: new Date().toISOString()
            }
        );

        return message as unknown as ChatMessage;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Send a system message (no translation needed)
 */
export async function sendSystemMessage(
    roomId: string,
    message: { en: string; id: string }
): Promise<void> {
    try {
        // Send in both languages
        await databases.createDocument(
            DATABASE_ID,
            CHAT_MESSAGES_COLLECTION,
            ID.unique(),
            {
                roomId,
                senderId: 'system',
                senderType: MessageSenderType.System,
                senderName: 'System',
                originalText: message.en,
                originalLanguage: 'en',
                translatedText: message.id,
                translatedLanguage: 'id',
                isRead: false,
                isSystemMessage: true,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error('Error sending system message:', error);
        throw error;
    }
}

/**
 * Get all messages in a chat room
 */
export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHAT_MESSAGES_COLLECTION,
            [
                Query.equal('roomId', roomId),
                Query.orderAsc('createdAt'),
                Query.limit(1000) // Limit to prevent overload
            ]
        );

        return response.documents as unknown as ChatMessage[];
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
    }
}

/**
 * Get chat room by booking ID
 */
export async function getChatRoomByBookingId(bookingId: number): Promise<ChatRoom | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            [
                Query.equal('bookingId', bookingId),
                Query.limit(1)
            ]
        );

        return response.documents.length > 0 
            ? response.documents[0] as unknown as ChatRoom 
            : null;
    } catch (error) {
        console.error('Error fetching chat room:', error);
        return null;
    }
}

/**
 * Get chat room by ID
 */
export async function getChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
        const room = await databases.getDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            roomId
        );

        return room as unknown as ChatRoom;
    } catch (error) {
        console.error('Error fetching chat room:', error);
        return null;
    }
}

/**
 * Update chat room status
 */
export async function updateChatRoomStatus(
    roomId: string,
    status: ChatRoomStatus
): Promise<void> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            roomId,
            {
                status,
                updatedAt: new Date().toISOString(),
                ...(status === ChatRoomStatus.Active && {
                    respondedAt: new Date().toISOString()
                })
            }
        );
    } catch (error) {
        console.error('Error updating chat room status:', error);
        throw error;
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<void> {
    try {
        const promises = messageIds.map(id =>
            databases.updateDocument(
                DATABASE_ID,
                CHAT_MESSAGES_COLLECTION,
                id,
                {
                    isRead: true,
                    readAt: new Date().toISOString()
                }
            )
        );

        await Promise.all(promises);
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
}

/**
 * Get all chat rooms for a user (for admin panel)
 */
export async function getAllChatRooms(limit: number = 100): Promise<ChatRoom[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            [
                Query.orderDesc('createdAt'),
                Query.limit(limit)
            ]
        );

        return response.documents as unknown as ChatRoom[];
    } catch (error) {
        console.error('Error fetching all chat rooms:', error);
        return [];
    }
}

/**
 * Subscribe to realtime chat messages
 */
export function subscribeToMessages(
    roomId: string,
    callback: (message: ChatMessage) => void
): () => void {
    const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES_COLLECTION}.documents`,
        (response: any) => {
            // Check if this message belongs to our room
            if (response.payload.roomId === roomId) {
                callback(response.payload as ChatMessage);
            }
        }
    );

    return unsubscribe;
}

/**
 * Subscribe to chat room updates (status changes)
 */
export function subscribeToChatRoom(
    roomId: string,
    callback: (room: ChatRoom) => void
): () => void {
    const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${CHAT_ROOMS_COLLECTION}.documents.${roomId}`,
        (response: any) => {
            callback(response.payload as ChatRoom);
        }
    );

    return unsubscribe;
}

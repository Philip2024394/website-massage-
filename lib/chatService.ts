/**
 * Chat Service
 * Handles all chat room and message operations with Appwrite backend
 * Includes auto-translation support for EN ↔ ID
 */

import { Client, Databases, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { ChatRoom, ChatMessage, ChatRoomStatus, MessageSenderType } from '../types';
import { translateText } from './translationService';
import { validateChatRoom } from './appwrite/schemas/validators';
import { systemMessageService } from './services/systemMessage.service';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_ROOMS_COLLECTION = APPWRITE_CONFIG.collections.chatRooms;
const CHAT_MESSAGES_COLLECTION = APPWRITE_CONFIG.collections.chatMessages;

// FIXED: Admin ID for system messages (required by Appwrite schema)
const INDASTREET_ADMIN_ID = "693cfadf000997d3cd66"; // Use actual admin user ID

/**
 * RESTORED: Original system message templates
 */
export const SYSTEM_MESSAGE_TEMPLATES = {
    WELCOME: (therapistName: string) => ({
        en: `${therapistName}: Welcome to my chat`,
        id: `${therapistName}: Selamat datang di chat saya`
    }),
    
    BOOKING_RECEIVED: {
        en: "Waiting for therapist response (5 minutes)",
        id: "Menunggu respon terapis (5 menit)"
    },
    
    TIMEOUT_SEARCHING: {
        en: "Searching for a new therapist",
        id: "Mencari terapis baru"
    },
    
    THERAPIST_ACCEPTED: {
        en: "Therapist on the way",
        id: "Terapis dalam perjalanan"
    },
    
    THERAPIST_ON_WAY: {
        en: "Therapist is on the way. Please ensure location is correct and accessible.",
        id: "Terapis sedang dalam perjalanan. Pastikan lokasi benar dan dapat diakses."
    },
    
    BOOKING_CANCELLED: {
        en: "This booking has been cancelled. If you need help, Indastreet Admin is available in this chat.",
        id: "Booking ini telah dibatalkan. Jika Anda butuh bantuan, Admin Indastreet tersedia di chat ini."
    },
    
    SERVICE_COMPLETED: {
        en: "Service completed. Thank you for using Indastreet Massage.",
        id: "Layanan selesai. Terima kasih telah menggunakan Indastreet Massage."
    }
};

/**
 * RESTORED: Send welcome message automatically when chat opens
 */
export async function sendWelcomeMessage(roomId: string, therapistName: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.WELCOME(therapistName), recipientUserId);
}

/**
 * RESTORED: Booking status system message functions
 */
export async function sendBookingReceivedMessage(roomId: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.BOOKING_RECEIVED, recipientUserId);
}

export async function sendTherapistSearchingMessage(roomId: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.TIMEOUT_SEARCHING, recipientUserId);
}

export async function sendTherapistAcceptedMessage(roomId: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.THERAPIST_ACCEPTED, recipientUserId);
}

export async function sendTherapistOnWayMessage(roomId: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.THERAPIST_ON_WAY, recipientUserId);
}

export async function sendBookingCancelledMessage(roomId: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.BOOKING_CANCELLED, recipientUserId);
}

export async function sendServiceCompletedMessage(roomId: string, recipientUserId?: string): Promise<void> {
    await sendSystemMessage(roomId, SYSTEM_MESSAGE_TEMPLATES.SERVICE_COMPLETED, recipientUserId);
}

/**
 * Create a new chat room for a booking
 */
export async function createChatRoom(data: {
    bookingId: string | number;
    customerId: string;
    customerName: string;
    customerLanguage: 'en' | 'id';
    customerPhoto?: string;
    therapistId: string | number; // Document $id (string) - NOT numeric userId
    therapistName: string;
    therapistLanguage: 'en' | 'id';
    therapistType: 'therapist' | 'place';
    therapistPhoto?: string;
    expiresAt: string;
}): Promise<ChatRoom> {
    try {
        // Normalize therapistId to string (Appwrite document $id)
        const therapistIdString = typeof data.therapistId === 'number' 
            ? data.therapistId.toString()
            : data.therapistId;
        
        console.debug('[CHAT ROOM CREATE]', {
            therapistId: therapistIdString,
            typeofTherapistId: typeof therapistIdString,
            originalValue: data.therapistId
        });
        
        // Prepare untrusted input from caller
        const untrustedPayload = {
            bookingId: data.bookingId,
            customerId: data.customerId,
            customerName: data.customerName,
            customerLanguage: data.customerLanguage,
            customerPhoto: data.customerPhoto || '',
            therapistId: therapistIdString, // ✅ String document $id
            therapistName: data.therapistName,
            therapistLanguage: data.therapistLanguage,
            therapistType: data.therapistType,
            therapistPhoto: data.therapistPhoto || '',
            status: ChatRoomStatus.Pending,
            expiresAt: data.expiresAt,
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // SCHEMA VALIDATION: Treat caller input as untrusted
        let validatedRoom;
        try {
            validatedRoom = validateChatRoom(untrustedPayload);
        } catch (validationError: any) {
            console.error('💥 chat_rooms validation failed:', validationError.message);
            throw new Error(`Failed to create chat room: ${validationError.message}`);
        }

        const chatRoom = await databases.createDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            ID.unique(),
            validatedRoom  // Use validated payload
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
        // 🔒 ENTERPRISE SECURITY: Route system messages through backend function
        if (data.senderId === 'system' || data.senderType === MessageSenderType.System) {
            console.log('🔒 [CHAT SERVICE] Routing system message through backend function');
            
            // Auto-translate message if languages are different
            let finalText = data.text;
            if (data.senderLanguage !== data.recipientLanguage) {
                finalText = await translateText(
                    data.text,
                    data.senderLanguage,
                    data.recipientLanguage
                ) || data.text;
            }

            // Use system message service for backend routing
            const result = await systemMessageService.sendSystemMessage({
                conversationId: data.roomId,
                recipientId: 'customer', // This seems to be a different chat structure
                recipientName: 'Customer',
                recipientType: 'user', // Fixed: use 'user' instead of 'admin' for Appwrite validation
                content: finalText
            });

            if (!result.success) {
                throw new Error(`System message failed: ${result.message}`);
            }

            // Return a ChatMessage-compatible object
            return {
                $id: result.messageId || 'system-' + Date.now(),
                $createdAt: result.createdAt || new Date().toISOString(),
                roomId: data.roomId,
                senderId: 'system',
                senderType: MessageSenderType.System,
                senderName: 'System',
                originalText: data.text,
                originalLanguage: data.senderLanguage,
                translatedText: finalText,
                translatedLanguage: data.recipientLanguage,
                isRead: false
            } as ChatMessage;
        }

        // Regular user/therapist messages - continue with normal flow
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
/**
 * Send a system message to a chat room
 * Uses messagingService for proper field handling
 * CRITICAL: recipientId MUST be a valid Appwrite userId, NEVER "all"
 */
export async function sendSystemMessage(
    roomId: string,
    message: { en: string; id: string },
    recipientUserId?: string | number,
    senderUserId?: string | number
): Promise<void> {
    try {
        const { messagingService } = await import('./appwrite/services/messaging.service');
        
        // CRITICAL FIX: Use actual user IDs, never "all" or "system"
        let actualRecipientId: string;
        let actualSenderId: string;
        
        if (recipientUserId) {
            actualRecipientId = String(recipientUserId);
        } else {
            // FIXED: Use admin ID instead of "system"
            actualRecipientId = INDASTREET_ADMIN_ID;
        }
        
        // FIXED: Always use admin ID for system messages
        actualSenderId = INDASTREET_ADMIN_ID;
        
        // MANDATORY: Validate recipientId is not "all"
        if (actualRecipientId === 'all') {
            throw new Error('Invalid recipientId: "all" is not allowed. Must be a valid userId.');
        }
        
        console.log('[SYSTEM MESSAGE] Using admin sender - recipientId:', actualRecipientId, 'senderId:', actualSenderId);
        
        // FIXED: Use admin sender for all system messages
        await messagingService.sendMessage({
            roomId,
            senderId: actualSenderId,
            senderType: 'admin', // FIXED: Use admin instead of system
            senderName: 'Indastreet System',
            recipientId: actualRecipientId,
            recipientName: actualRecipientId === INDASTREET_ADMIN_ID ? 'Indastreet System' : 'User',
            recipientType: actualRecipientId === INDASTREET_ADMIN_ID ? 'admin' : 'user', // FIXED: Valid enum values only
            messageType: 'text',
            content: message.en,
            message: message.en,
            originalLanguage: 'en',
            translatedText: message.id,
            translatedLanguage: 'id',
            isSystemMessage: true,
            bookingid: '',
            originalMessageId: '',
            expiresat: '',
            archivedBy: '',
            sessionId: roomId,
            read: false
        });
        
        console.log('✅ System message sent successfully');
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
export async function getChatRoomByBookingId(bookingId: string): Promise<ChatRoom | null> {
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
        const updateData: Record<string, any> = {
            status,
            updatedAt: new Date().toISOString()
        };

        // Set appropriate timestamp fields based on status
        if (status === ChatRoomStatus.Accepted) {
            updateData.acceptedAt = new Date().toISOString();
        } else if (status === ChatRoomStatus.Declined) {
            updateData.declinedAt = new Date().toISOString();
        } else if (status === ChatRoomStatus.Active) {
            updateData.respondedAt = new Date().toISOString();
        }

        await databases.updateDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            roomId,
            updateData
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

/**
 * Cancel a booking before therapist accepts
 * Updates booking status and sends cancellation message
 */
export async function cancelBooking(bookingId: string, roomId: string, userId?: string): Promise<void> {
    try {
        console.log('🚫 Cancelling booking:', bookingId);
        
        // Update booking status to cancelled
        await databases.updateDocument(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.bookings || 'bookings',
            bookingId,
            {
                status: 'Cancelled',
                cancelledAt: new Date().toISOString(),
                cancelledBy: userId || 'customer'
            }
        );
        
        // Update chat room status
        await databases.updateDocument(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION,
            roomId,
            {
                status: ChatRoomStatus.Cancelled,
                updatedAt: new Date().toISOString()
            }
        );
        
        // Send cancellation message
        await sendBookingCancelledMessage(roomId, userId);
        
        console.log('✅ Booking cancelled successfully');
    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        throw error;
    }
}

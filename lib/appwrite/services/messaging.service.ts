/**
 * Messaging Service
 * SINGLE SOURCE OF TRUTH for all chat message creation
 * All chat_messages collection writes MUST go through this service
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';
import { validateChatMessage } from '../schemas/validators';
import { 
  RecipientType, 
  SenderType, 
  MessageType,
  normalizeRecipientType,
  normalizeSenderType,
  type RecipientTypeValue,
  type SenderTypeValue,
  type MessageTypeValue,
  CHAT_MESSAGE_ATTRIBUTES as ATTR
} from '../constants';

export const messagingService = {
    async create(message: any): Promise<any> {
        try {
            // STEP 3: COLLECTION ID USAGE CHECK
            const collectionId = APPWRITE_CONFIG.collections.messages;
            
            console.log('[MESSAGING] 📝 Creating message document');
            console.log('[MESSAGING] Database ID:', APPWRITE_CONFIG.databaseId);
            console.log('[MESSAGING] Collection ID:', collectionId);
            console.log('[MESSAGING] Message keys:', Object.keys(message));
            
            // FAIL IMMEDIATELY if collection ID is empty
            if (!collectionId || collectionId === '') {
                const error = `❌ EMPTY COLLECTION ID: messages collection ID is "${collectionId}" - Cannot create document`;
                console.error(`[MESSAGING] ${error}`);
                console.error('[MESSAGING] File: lib/appwrite/services/messaging.service.ts:11');
                throw new Error(error);
            }
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                ID.unique(),
                message
            );
            
            console.log('[MESSAGING] ✅ Message created:', response.$id);
            return response;
        } catch (error: any) {
            console.error('[MESSAGING] ❌ Error creating message:', {
                message: error?.message,
                code: error?.code,
                type: error?.type,
                response: error?.response,
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.messages
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
            console.log('[MESSAGING SERVICE] 📨 sendMessage called');
            console.log('[MESSAGING SERVICE] Raw input:', JSON.stringify(messageData, null, 2));
            
            // ========================================================================
            // STEP 2: REQUIRED PAYLOAD ENFORCEMENT (NON-OPTIONAL)
            // ========================================================================
            
            const requiredFields = [
                'senderId', 'senderName', 'recipientId', 'content'
            ];
            
            for (const field of requiredFields) {
                if (!messageData[field]) {
                    throw new Error(`❌ MESSAGING SERVICE: Required field '${field}' is missing or empty. Cannot send message.`);
                }
            }
            
            // Normalize ids in case callers pass objects with { id, role }
            const senderId = typeof messageData?.senderId === 'object' ? messageData.senderId.id : messageData.senderId;
            const recipientId = typeof messageData?.recipientId === 'object' ? messageData.recipientId.id : messageData.recipientId;

            // CRITICAL FIX: Validate recipientId is never "all" and is properly formatted
            if (recipientId === 'all') {
                throw new Error('❌ MESSAGING SERVICE: recipientId cannot be "all". Must be a real userId or "system".');
            }
            
            // CRITICAL FIX: Validate recipientId is valid Appwrite ID or system
            if (recipientId !== 'system' && (!recipientId || recipientId.trim().length === 0)) {
                throw new Error(`❌ MESSAGING SERVICE: Invalid recipientId "${recipientId}". Must be a valid userId or "system".`);
            }

            const conversationId = messageData.conversationId || this.generateConversationId(senderId, recipientId);
            
            console.log('[MESSAGING SERVICE] Normalized IDs - sender:', senderId, 'recipient:', recipientId);
            console.log('[MESSAGING SERVICE] Conversation ID:', conversationId);
            
            // ========================================================================
            // STEP 3: MANDATORY ENUM NORMALIZATION + LOCAL REJECTION
            // ========================================================================
            
            let normalizedSenderType: SenderTypeValue;
            let normalizedRecipientType: RecipientTypeValue;
            
            try {
                normalizedSenderType = normalizeSenderType(messageData.senderType, senderId);
                // FIXED: Don't convert admin to user - admin is valid in database schema
                normalizedRecipientType = normalizeRecipientType(messageData.recipientType);
                
                console.log('[MESSAGING SERVICE] 🔄 Raw enum values:');
                console.log(`  senderType: "${messageData.senderType}"`);
                console.log(`  recipientType: "${messageData.recipientType}"`);
                console.log('[MESSAGING SERVICE] 🔄 Normalized enum values:');
                console.log(`  senderType: "${messageData.senderType}" → "${normalizedSenderType}"`);
                console.log(`  recipientType: "${messageData.recipientType}" → "${normalizedRecipientType}"`);
            } catch (enumError) {
                throw new Error(`❌ MESSAGING SERVICE: Invalid enum value - ${enumError.message}`);
            }
            
            // Additional enum validation - reject anything not in allowed lists
            const allowedRecipientTypes: RecipientTypeValue[] = ['user', 'therapist', 'place', 'hotel', 'villa', 'agent', 'admin'];
            const allowedSenderTypes: SenderTypeValue[] = ['customer', 'therapist', 'place', 'system'];
            
            if (!allowedRecipientTypes.includes(normalizedRecipientType)) {
                throw new Error(`❌ MESSAGING SERVICE: Invalid recipientType "${normalizedRecipientType}". Allowed: ${allowedRecipientTypes.join(', ')}`);
            }
            
            if (!allowedSenderTypes.includes(normalizedSenderType)) {
                throw new Error(`❌ MESSAGING SERVICE: Invalid senderType "${normalizedSenderType}". Allowed: ${allowedSenderTypes.join(', ')}`);
            }
            
            // ========================================================================
            // Build payload with ALL required attributes + validated enums
            // FIXED: Added receiverId and receivername (required by schema)
            // ========================================================================
            
            const untrustedPayload = {
                [ATTR.CONVERSATION_ID]: conversationId,
                [ATTR.ROOM_ID]: messageData.roomId || conversationId,
                [ATTR.SENDER_ID]: senderId,
                [ATTR.SENDER_NAME]: messageData.senderName || 'Unknown',
                [ATTR.SENDER_TYPE]: normalizedSenderType,
                [ATTR.RECIPIENT_ID]: recipientId,
                [ATTR.RECIPIENT_NAME]: messageData.recipientName || 'Unknown',
                [ATTR.RECIPIENT_TYPE]: normalizedRecipientType,
                [ATTR.RECEIVER_ID]: recipientId, // Required field that was missing
                [ATTR.RECEIVER_NAME]: messageData.recipientName || 'Unknown', // Required field that was missing
                [ATTR.CONTENT]: messageData.content,
                [ATTR.MESSAGE]: messageData.message || messageData.content,
                [ATTR.MESSAGE_TYPE]: (messageData.messageType || messageData.type || MessageType.TEXT) as MessageTypeValue,
                [ATTR.ORIGINAL_LANGUAGE]: messageData.originalLanguage || 'id',
                [ATTR.IS_SYSTEM_MESSAGE]: messageData.isSystemMessage ?? (senderId === 'system'),
                [ATTR.BOOKING_ID]: messageData.bookingid || messageData.bookingId || '',
                [ATTR.ORIGINAL_MESSAGE_ID]: messageData.originalMessageId || '',
                [ATTR.EXPIRES_AT]: messageData.expiresat || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                [ATTR.ARCHIVED_BY]: messageData.archivedBy || '',
                [ATTR.SESSION_ID]: messageData.sessionId || conversationId,
                [ATTR.READ]: messageData.read ?? false,
                [ATTR.READ_AT]: messageData.readAt,
                [ATTR.TRANSLATED_TEXT]: messageData.translatedText,
                [ATTR.TRANSLATED_LANGUAGE]: messageData.translatedLanguage,
                [ATTR.FILE_URL]: messageData.fileUrl,
                [ATTR.FILE_NAME]: messageData.fileName,
                [ATTR.LOCATION]: messageData.location,
                [ATTR.KEEP_FOREVER]: messageData.keepForever ?? false,
                [ATTR.MARKED_FOR_SAVE]: messageData.markedForSave ?? false,
                [ATTR.SAVED_BY]: messageData.savedby,
                [ATTR.SAVED_AT]: messageData.savedat,
                [ATTR.METADATA]: messageData.metadata,
                [ATTR.CREATED_AT]: new Date().toISOString()
            };
            
            // ========================================================================
            // STEP 5: HARD GUARD - REJECT IF MISSING REQUIRED FIELDS
            // ========================================================================
            
            const criticalFields = [
                ATTR.CONVERSATION_ID, ATTR.SENDER_ID, ATTR.SENDER_NAME, ATTR.SENDER_TYPE,
                ATTR.RECIPIENT_ID, ATTR.RECIPIENT_NAME, ATTR.RECIPIENT_TYPE, 
                ATTR.RECEIVER_ID, ATTR.RECEIVER_NAME, // Added missing required fields
                ATTR.CONTENT, ATTR.CREATED_AT
            ];
            
            for (const field of criticalFields) {
                if (!untrustedPayload[field] && untrustedPayload[field] !== false) {
                    throw new Error(`❌ HARD GUARD: Required field '${field}' is missing from payload. Cannot send to Appwrite.`);
                }
            }
            
            // Extra guard for the most critical field
            if (!untrustedPayload[ATTR.RECIPIENT_TYPE]) {
                throw new Error('❌ HARD GUARD: recipientType is required before sending message');
            }
            
            // ========================================================================
            // STEP 6: DEFENSIVE LOGGING (KEEP ENABLED)
            // ========================================================================
            
            console.log('[MESSAGING SERVICE] 📋 Final payload to be sent to Appwrite:');
            console.log(JSON.stringify(untrustedPayload, null, 2));
            console.log('[MESSAGING SERVICE] 🎯 Critical enum values:');
            console.log(`  ${ATTR.SENDER_TYPE}: "${untrustedPayload[ATTR.SENDER_TYPE]}"`);
            console.log(`  ${ATTR.RECIPIENT_TYPE}: "${untrustedPayload[ATTR.RECIPIENT_TYPE]}"`);
            console.log(`  ${ATTR.MESSAGE_TYPE}: "${untrustedPayload[ATTR.MESSAGE_TYPE]}"`);
            
            // ========================================================================
            // SCHEMA VALIDATION: Treat UI as untrusted, validate at service boundary
            // ========================================================================
            
            let validatedMessage;
            try {
                validatedMessage = validateChatMessage(untrustedPayload);
                console.log('[MESSAGING SERVICE] ✅ Schema validation passed');
            } catch (validationError: any) {
                console.error('[MESSAGING SERVICE] ❌ Schema validation failed:', validationError.message);
                console.error('[MESSAGING SERVICE] Failed payload:', JSON.stringify(untrustedPayload, null, 2));
                throw new Error(`Failed to send message: ${validationError.message}`);
            }
            
            console.log('[MESSAGING SERVICE] 🚀 Sending to Appwrite...');
            console.log('[MESSAGING SERVICE] Database ID:', APPWRITE_CONFIG.databaseId);
            console.log('[MESSAGING SERVICE] Collection ID:', APPWRITE_CONFIG.collections.messages);
            
            const result = await this.create(validatedMessage);
            console.log('[MESSAGING SERVICE] ✅ Message created successfully:', result.$id);
            return result;
        } catch (error: any) {
            console.error('[MESSAGING SERVICE] ❌ Error sending message');
            console.error('[MESSAGING SERVICE] Error details:', {
                message: error?.message,
                code: error?.code,
                type: error?.type,
                response: error?.response
            });
            console.error('[MESSAGING SERVICE] Appwrite config:', {
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.messages
            });
            console.error('[MESSAGING SERVICE] Original input:', JSON.stringify(messageData, null, 2));
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

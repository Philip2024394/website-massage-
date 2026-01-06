/**
 * Appwrite Collection Schema Validators
 * 
 * Strict schema enforcement at service boundary
 * Treats all UI input as untrusted
 * 
 * Each validator:
 * - Whitelists allowed fields
 * - Enforces required fields
 * - Validates types with compile-time safety
 * - Rejects unknown keys
 */

import { 
  RecipientType,
  SenderType,
  MessageType,
  type RecipientTypeValue,
  type SenderTypeValue,
  type MessageTypeValue,
  isValidRecipientType,
  isValidSenderType,
  isValidMessageType
} from '../constants';

// ============================================================================
// CHAT_MESSAGES SCHEMA - Type-safe with enum validation
// ============================================================================

export interface ChatMessagePayload {
    conversationId: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderType: SenderTypeValue;  // ✅ Compile-time type safety
    recipientId: string;
    recipientName: string;
    recipientType: RecipientTypeValue;  // ✅ Compile-time type safety
    receiverId: string;
    receivername: string;
    content: string;
    message: string;
    messageType: MessageTypeValue;  // ✅ Compile-time type safety
    originalLanguage: string;
    isSystemMessage: boolean;
    bookingid: string;
    originalMessageId: string;
    expiresat: string;
    archivedBy: string;
    sessionId: string;
    read: boolean;
    readAt?: string;
    translatedText?: string;
    translatedLanguage?: string;
    fileUrl?: string;
    fileName?: string;
    location?: string;
    keepForever: boolean;
    markedForSave: boolean;
    savedby?: string;
    savedat?: string;
    metadata?: string;
    createdAt: string;
}

const CHAT_MESSAGE_ALLOWED_FIELDS = new Set([
    'conversationId',
    'roomId',
    'senderId',
    'senderName',
    'senderType',
    'recipientId',
    'recipientName',
    'recipientType',
    'receiverId',
    'receivername',
    'content',
    'message',
    'messageType',
    'type',
    'originalLanguage',
    'isSystemMessage',
    'bookingid',
    'originalMessageId',
    'expiresat',
    'archivedBy',
    'sessionId',
    'read',
    'readAt',
    'translatedText',
    'translatedLanguage',
    'fileUrl',
    'fileName',
    'location',
    'keepForever',
    'markedForSave',
    'savedby',
    'savedat',
    'metadata',
    'createdAt'
]);

const CHAT_MESSAGE_REQUIRED_FIELDS = [
    'conversationId',
    'roomId',
    'senderId',
    'senderName',
    'senderType',
    'recipientId',
    'recipientName',
    'recipientType',
    'receiverId',
    'receivername',
    'content',
    'message',
    'messageType',
    'originalLanguage',
    'isSystemMessage',
    'expiresat',
    'archivedBy',
    'sessionId',
    'read',
    'createdAt'
];

export function validateChatMessage(data: unknown): ChatMessagePayload {
    if (!data || typeof data !== 'object') {
        throw new Error('chat_messages validation failed: payload must be an object');
    }

    const obj = data as Record<string, any>;

    // Check for unknown keys
    const unknownKeys = Object.keys(obj).filter(key => !CHAT_MESSAGE_ALLOWED_FIELDS.has(key));
    if (unknownKeys.length > 0) {
        throw new Error(`chat_messages validation failed: unexpected fields [${unknownKeys.join(', ')}]`);
    }

    // Check required fields
    for (const field of CHAT_MESSAGE_REQUIRED_FIELDS) {
        if (obj[field] === undefined || obj[field] === null) {
            throw new Error(`chat_messages validation failed: missing required field '${field}'`);
        }
    }

    // Type validation
    if (typeof obj.conversationId !== 'string') {
        throw new Error('chat_messages validation failed: conversationId must be a string');
    }
    if (typeof obj.roomId !== 'string') {
        throw new Error('chat_messages validation failed: roomId must be a string');
    }
    if (typeof obj.senderId !== 'string') {
        throw new Error('chat_messages validation failed: senderId must be a string');
    }
    if (typeof obj.senderName !== 'string') {
        throw new Error('chat_messages validation failed: senderName must be a string');
    }
    if (typeof obj.senderType !== 'string') {
        throw new Error('chat_messages validation failed: senderType must be a string');
    }
    // ✅ ENUM VALIDATION: Enforce valid senderType values
    if (!isValidSenderType(obj.senderType)) {
        throw new Error(`chat_messages validation failed: senderType "${obj.senderType}" is invalid. Must be one of: ${Object.values(SenderType).join(', ')}`);
    }
    if (typeof obj.recipientId !== 'string') {
        throw new Error('chat_messages validation failed: recipientId must be a string');
    }
    if (typeof obj.recipientName !== 'string') {
        throw new Error('chat_messages validation failed: recipientName must be a string');
    }
    if (typeof obj.recipientType !== 'string') {
        throw new Error('chat_messages validation failed: recipientType must be a string');
    }
    // ✅ ENUM VALIDATION: Enforce valid recipientType values
    if (!isValidRecipientType(obj.recipientType)) {
        throw new Error(`chat_messages validation failed: recipientType "${obj.recipientType}" is invalid. Must be one of: ${Object.values(RecipientType).join(', ')}`);
    }
    if (typeof obj.receiverId !== 'string') {
        throw new Error('chat_messages validation failed: receiverId must be a string');
    }
    if (typeof obj.receivername !== 'string') {
        throw new Error('chat_messages validation failed: receivername must be a string');
    }
    if (typeof obj.content !== 'string') {
        throw new Error('chat_messages validation failed: content must be a string');
    }
    if (typeof obj.message !== 'string') {
        throw new Error('chat_messages validation failed: message must be a string');
    }
    if (typeof obj.messageType !== 'string') {
        throw new Error('chat_messages validation failed: messageType must be a string');
    }
    // ✅ ENUM VALIDATION: Enforce valid messageType values
    if (!isValidMessageType(obj.messageType)) {
        throw new Error(`chat_messages validation failed: messageType "${obj.messageType}" is invalid. Must be one of: ${Object.values(MessageType).join(', ')}`);
    }
    if (typeof obj.originalLanguage !== 'string') {
        throw new Error('chat_messages validation failed: originalLanguage must be a string');
    }
    if (typeof obj.isSystemMessage !== 'boolean') {
        throw new Error('chat_messages validation failed: isSystemMessage must be a boolean');
    }
    if (obj.bookingid !== undefined && typeof obj.bookingid !== 'string') {
        throw new Error('chat_messages validation failed: bookingid must be a string');
    }
    if (obj.originalMessageId !== undefined && typeof obj.originalMessageId !== 'string') {
        throw new Error('chat_messages validation failed: originalMessageId must be a string');
    }
    if (typeof obj.expiresat !== 'string') {
        throw new Error('chat_messages validation failed: expiresat must be a string');
    }
    if (typeof obj.archivedBy !== 'string') {
        throw new Error('chat_messages validation failed: archivedBy must be a string');
    }
    if (typeof obj.sessionId !== 'string') {
        throw new Error('chat_messages validation failed: sessionId must be a string');
    }
    if (typeof obj.read !== 'boolean') {
        throw new Error('chat_messages validation failed: read must be a boolean');
    }
    if (typeof obj.createdAt !== 'string') {
        throw new Error('chat_messages validation failed: createdAt must be a string');
    }
    if (typeof obj.keepForever !== 'boolean') {
        throw new Error('chat_messages validation failed: keepForever must be a boolean');
    }
    if (typeof obj.markedForSave !== 'boolean') {
        throw new Error('chat_messages validation failed: markedForSave must be a boolean');
    }
    // Optional field validations
    if (obj.readAt !== undefined && typeof obj.readAt !== 'string') {
        throw new Error('chat_messages validation failed: readAt must be a string');
    }
    if (obj.translatedText !== undefined && typeof obj.translatedText !== 'string') {
        throw new Error('chat_messages validation failed: translatedText must be a string');
    }
    if (obj.translatedLanguage !== undefined && typeof obj.translatedLanguage !== 'string') {
        throw new Error('chat_messages validation failed: translatedLanguage must be a string');
    }
    if (obj.fileUrl !== undefined && typeof obj.fileUrl !== 'string') {
        throw new Error('chat_messages validation failed: fileUrl must be a string');
    }
    if (obj.fileName !== undefined && typeof obj.fileName !== 'string') {
        throw new Error('chat_messages validation failed: fileName must be a string');
    }
    if (obj.location !== undefined && typeof obj.location !== 'string') {
        throw new Error('chat_messages validation failed: location must be a string');
    }
    if (obj.savedby !== undefined && typeof obj.savedby !== 'string') {
        throw new Error('chat_messages validation failed: savedby must be a string');
    }
    if (obj.savedat !== undefined && typeof obj.savedat !== 'string') {
        throw new Error('chat_messages validation failed: savedat must be a string');
    }
    if (obj.metadata !== undefined && typeof obj.metadata !== 'string') {
        throw new Error('chat_messages validation failed: metadata must be a string');
    }

    // Construct clean payload (whitelist only)
    return {
        conversationId: obj.conversationId,
        roomId: obj.roomId,
        senderId: obj.senderId,
        senderName: obj.senderName,
        senderType: obj.senderType,
        recipientId: obj.recipientId,
        recipientName: obj.recipientName,
        recipientType: obj.recipientType,
        receiverId: obj.receiverId,
        receivername: obj.receivername,
        content: obj.content,
        message: obj.message,
        messageType: obj.messageType,
        originalLanguage: obj.originalLanguage,
        isSystemMessage: obj.isSystemMessage,
        bookingid: obj.bookingid || '',
        originalMessageId: obj.originalMessageId || '',
        expiresat: obj.expiresat,
        archivedBy: obj.archivedBy,
        sessionId: obj.sessionId,
        read: obj.read,
        readAt: obj.readAt,
        translatedText: obj.translatedText,
        translatedLanguage: obj.translatedLanguage,
        fileUrl: obj.fileUrl,
        fileName: obj.fileName,
        location: obj.location,
        keepForever: obj.keepForever,
        markedForSave: obj.markedForSave,
        savedby: obj.savedby,
        savedat: obj.savedat,
        metadata: obj.metadata,
        createdAt: obj.createdAt
    };
}

// ============================================================================
// CHAT_SESSIONS SCHEMA
// ============================================================================

export interface ChatSessionPayload {
    bookingId: string;
    therapistId: string;
    status: 'active' | 'ended' | 'expired';
    startedAt: string;
    endedAt?: string;
}

const CHAT_SESSION_ALLOWED_FIELDS = new Set([
    'bookingId',
    'therapistId',
    'status',
    'startedAt',
    'endedAt'
]);

const CHAT_SESSION_REQUIRED_FIELDS = [
    'bookingId',
    'therapistId',
    'status',
    'startedAt'
];

const CHAT_SESSION_STATUSES = ['active', 'ended', 'expired'];

export function validateChatSession(data: unknown): ChatSessionPayload {
    if (!data || typeof data !== 'object') {
        throw new Error('chat_sessions validation failed: payload must be an object');
    }

    const obj = data as Record<string, any>;

    // Check for unknown keys
    const unknownKeys = Object.keys(obj).filter(key => !CHAT_SESSION_ALLOWED_FIELDS.has(key));
    if (unknownKeys.length > 0) {
        throw new Error(`chat_sessions validation failed: unexpected fields [${unknownKeys.join(', ')}]`);
    }

    // Check required fields
    for (const field of CHAT_SESSION_REQUIRED_FIELDS) {
        if (!obj[field]) {
            throw new Error(`chat_sessions validation failed: missing required field '${field}'`);
        }
    }

    // Type validation
    if (typeof obj.bookingId !== 'string') {
        throw new Error('chat_sessions validation failed: bookingId must be a string');
    }
    if (typeof obj.therapistId !== 'string') {
        throw new Error('chat_sessions validation failed: therapistId must be a string');
    }
    if (!CHAT_SESSION_STATUSES.includes(obj.status)) {
        throw new Error(`chat_sessions validation failed: status must be one of [${CHAT_SESSION_STATUSES.join(', ')}]`);
    }
    if (typeof obj.startedAt !== 'string') {
        throw new Error('chat_sessions validation failed: startedAt must be a string (ISO datetime)');
    }

    // Construct clean payload
    const payload: ChatSessionPayload = {
        bookingId: obj.bookingId,
        therapistId: obj.therapistId,
        status: obj.status,
        startedAt: obj.startedAt
    };

    // Optional field
    if (obj.endedAt !== undefined) {
        if (typeof obj.endedAt !== 'string') {
            throw new Error('chat_sessions validation failed: endedAt must be a string (ISO datetime)');
        }
        payload.endedAt = obj.endedAt;
    }

    return payload;
}

// ============================================================================
// CHAT_ROOMS SCHEMA
// ============================================================================

export interface ChatRoomPayload {
    bookingId: string | number;
    customerId: string;
    customerName: string;
    customerLanguage: 'en' | 'id';
    customerPhoto?: string;
    therapistId: string | number;
    therapistName: string;
    therapistLanguage: 'en' | 'id';
    therapistType: 'therapist' | 'place';
    therapistPhoto?: string;
    status: string;
    expiresAt: string;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

const CHAT_ROOM_ALLOWED_FIELDS = new Set([
    'bookingId',
    'customerId',
    'customerName',
    'customerLanguage',
    'customerPhoto',
    'therapistId',
    'therapistName',
    'therapistLanguage',
    'therapistType',
    'therapistPhoto',
    'status',
    'expiresAt',
    'unreadCount',
    'createdAt',
    'updatedAt'
]);

const CHAT_ROOM_REQUIRED_FIELDS = [
    'bookingId',
    'customerId',
    'customerName',
    'customerLanguage',
    'therapistId',
    'therapistName',
    'therapistLanguage',
    'therapistType',
    'status',
    'expiresAt'
];

const CHAT_ROOM_LANGUAGES = ['en', 'id'];
const CHAT_ROOM_THERAPIST_TYPES = ['therapist', 'place'];

export function validateChatRoom(data: unknown): ChatRoomPayload {
    if (!data || typeof data !== 'object') {
        throw new Error('chat_rooms validation failed: payload must be an object');
    }

    const obj = data as Record<string, any>;

    // Check for unknown keys
    const unknownKeys = Object.keys(obj).filter(key => !CHAT_ROOM_ALLOWED_FIELDS.has(key));
    if (unknownKeys.length > 0) {
        throw new Error(`chat_rooms validation failed: unexpected fields [${unknownKeys.join(', ')}]`);
    }

    // Check required fields
    for (const field of CHAT_ROOM_REQUIRED_FIELDS) {
        if (obj[field] === undefined || obj[field] === null) {
            throw new Error(`chat_rooms validation failed: missing required field '${field}'`);
        }
    }

    // Type validation
    if (typeof obj.bookingId !== 'string' && typeof obj.bookingId !== 'number') {
        throw new Error('chat_rooms validation failed: bookingId must be a string or number');
    }
    if (typeof obj.customerId !== 'string') {
        throw new Error('chat_rooms validation failed: customerId must be a string');
    }
    if (typeof obj.customerName !== 'string') {
        throw new Error('chat_rooms validation failed: customerName must be a string');
    }
    if (!CHAT_ROOM_LANGUAGES.includes(obj.customerLanguage)) {
        throw new Error(`chat_rooms validation failed: customerLanguage must be one of [${CHAT_ROOM_LANGUAGES.join(', ')}]`);
    }
    if (typeof obj.therapistId !== 'string' && typeof obj.therapistId !== 'number') {
        throw new Error('chat_rooms validation failed: therapistId must be a string or number');
    }
    if (typeof obj.therapistName !== 'string') {
        throw new Error('chat_rooms validation failed: therapistName must be a string');
    }
    if (!CHAT_ROOM_LANGUAGES.includes(obj.therapistLanguage)) {
        throw new Error(`chat_rooms validation failed: therapistLanguage must be one of [${CHAT_ROOM_LANGUAGES.join(', ')}]`);
    }
    if (!CHAT_ROOM_THERAPIST_TYPES.includes(obj.therapistType)) {
        throw new Error(`chat_rooms validation failed: therapistType must be one of [${CHAT_ROOM_THERAPIST_TYPES.join(', ')}]`);
    }
    if (typeof obj.status !== 'string') {
        throw new Error('chat_rooms validation failed: status must be a string');
    }
    if (typeof obj.expiresAt !== 'string') {
        throw new Error('chat_rooms validation failed: expiresAt must be a string (ISO datetime)');
    }

    // Construct clean payload
    const payload: ChatRoomPayload = {
        bookingId: obj.bookingId,
        customerId: obj.customerId,
        customerName: obj.customerName,
        customerLanguage: obj.customerLanguage,
        therapistId: obj.therapistId,
        therapistName: obj.therapistName,
        therapistLanguage: obj.therapistLanguage,
        therapistType: obj.therapistType,
        status: obj.status,
        expiresAt: obj.expiresAt,
        unreadCount: typeof obj.unreadCount === 'number' ? obj.unreadCount : 0,
        createdAt: obj.createdAt || new Date().toISOString(),
        updatedAt: obj.updatedAt || new Date().toISOString()
    };

    // Optional fields
    if (obj.customerPhoto !== undefined) {
        if (typeof obj.customerPhoto !== 'string') {
            throw new Error('chat_rooms validation failed: customerPhoto must be a string');
        }
        payload.customerPhoto = obj.customerPhoto;
    }
    if (obj.therapistPhoto !== undefined) {
        if (typeof obj.therapistPhoto !== 'string') {
            throw new Error('chat_rooms validation failed: therapistPhoto must be a string');
        }
        payload.therapistPhoto = obj.therapistPhoto;
    }

    return payload;
}

// ============================================================================
// BOOKINGS SCHEMA (if written)
// ============================================================================

export interface BookingPayload {
    therapistId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    startTime: string;
    duration: number;
    serviceType: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

const BOOKING_ALLOWED_FIELDS = new Set([
    'therapistId',
    'customerId',
    'customerName',
    'customerPhone',
    'startTime',
    'duration',
    'serviceType',
    'totalPrice',
    'status',
    'notes'
]);

const BOOKING_REQUIRED_FIELDS = [
    'therapistId',
    'customerId',
    'customerName',
    'customerPhone',
    'startTime',
    'duration',
    'serviceType',
    'totalPrice',
    'status'
];

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export function validateBooking(data: unknown): BookingPayload {
    if (!data || typeof data !== 'object') {
        throw new Error('bookings validation failed: payload must be an object');
    }

    const obj = data as Record<string, any>;

    // Check for unknown keys
    const unknownKeys = Object.keys(obj).filter(key => !BOOKING_ALLOWED_FIELDS.has(key));
    if (unknownKeys.length > 0) {
        throw new Error(`bookings validation failed: unexpected fields [${unknownKeys.join(', ')}]`);
    }

    // Check required fields
    for (const field of BOOKING_REQUIRED_FIELDS) {
        if (obj[field] === undefined || obj[field] === null) {
            throw new Error(`bookings validation failed: missing required field '${field}'`);
        }
    }

    // Type validation
    if (typeof obj.therapistId !== 'string') {
        throw new Error('bookings validation failed: therapistId must be a string');
    }
    if (typeof obj.customerId !== 'string') {
        throw new Error('bookings validation failed: customerId must be a string');
    }
    if (typeof obj.customerName !== 'string') {
        throw new Error('bookings validation failed: customerName must be a string');
    }
    if (typeof obj.customerPhone !== 'string') {
        throw new Error('bookings validation failed: customerPhone must be a string');
    }
    if (typeof obj.startTime !== 'string') {
        throw new Error('bookings validation failed: startTime must be a string (ISO datetime)');
    }
    if (typeof obj.duration !== 'number') {
        throw new Error('bookings validation failed: duration must be a number');
    }
    if (typeof obj.serviceType !== 'string') {
        throw new Error('bookings validation failed: serviceType must be a string');
    }
    if (typeof obj.totalPrice !== 'number') {
        throw new Error('bookings validation failed: totalPrice must be a number');
    }
    if (!BOOKING_STATUSES.includes(obj.status)) {
        throw new Error(`bookings validation failed: status must be one of [${BOOKING_STATUSES.join(', ')}]`);
    }

    // Construct clean payload
    const payload: BookingPayload = {
        therapistId: obj.therapistId,
        customerId: obj.customerId,
        customerName: obj.customerName,
        customerPhone: obj.customerPhone,
        startTime: obj.startTime,
        duration: obj.duration,
        serviceType: obj.serviceType,
        totalPrice: obj.totalPrice,
        status: obj.status
    };

    // Optional field
    if (obj.notes !== undefined) {
        if (typeof obj.notes !== 'string') {
            throw new Error('bookings validation failed: notes must be a string');
        }
        payload.notes = obj.notes;
    }

    return payload;
}

/**
 * Appwrite Collection Schema Validators
 * 
 * Strict schema enforcement at service boundary
 * Treats all UI input as untrusted
 * 
 * Each validator:
 * - Whitelists allowed fields
 * - Enforces required fields
 * - Validates types
 * - Rejects unknown keys
 */

// ============================================================================
// CHAT_MESSAGES SCHEMA
// ============================================================================

export interface ChatMessagePayload {
    conversationId: string;
    senderId: string;
    recipientId: string;
    content: string;
    type: 'text' | 'system' | 'booking' | 'auto-reply' | 'status-update' | 'fallback';
    messageId: string;
    read: boolean;
    createdAt: string;
}

const CHAT_MESSAGE_ALLOWED_FIELDS = new Set([
    'conversationId',
    'senderId',
    'recipientId',
    'content',
    'type',
    'messageId',
    'read',
    'createdAt'
]);

const CHAT_MESSAGE_REQUIRED_FIELDS = [
    'conversationId',
    'senderId',
    'recipientId',
    'content',
    'type'
];

const CHAT_MESSAGE_TYPES = ['text', 'system', 'booking', 'auto-reply', 'status-update', 'fallback'];

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
        if (!obj[field]) {
            throw new Error(`chat_messages validation failed: missing required field '${field}'`);
        }
    }

    // Type validation
    if (typeof obj.conversationId !== 'string') {
        throw new Error('chat_messages validation failed: conversationId must be a string');
    }
    if (typeof obj.senderId !== 'string') {
        throw new Error('chat_messages validation failed: senderId must be a string');
    }
    if (typeof obj.recipientId !== 'string') {
        throw new Error('chat_messages validation failed: recipientId must be a string');
    }
    if (typeof obj.content !== 'string') {
        throw new Error('chat_messages validation failed: content must be a string');
    }
    if (!CHAT_MESSAGE_TYPES.includes(obj.type)) {
        throw new Error(`chat_messages validation failed: type must be one of [${CHAT_MESSAGE_TYPES.join(', ')}]`);
    }

    // Construct clean payload (whitelist only)
    return {
        conversationId: obj.conversationId,
        senderId: obj.senderId,
        recipientId: obj.recipientId,
        content: obj.content,
        type: obj.type,
        messageId: obj.messageId || '',
        read: obj.read ?? false,
        createdAt: obj.createdAt || new Date().toISOString()
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

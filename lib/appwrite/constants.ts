/**
 * Appwrite Chat System Constants
 * Single source of truth for all enum values and attribute names
 * These MUST match the Appwrite database schema exactly
 */

// ============================================================================
// ENUM TYPES - Must match Appwrite schema exactly
// ============================================================================

/**
 * Recipient Type - Valid values from Appwrite schema
 * Used in chat_messages collection recipientType attribute
 */
export const RecipientType = {
  ADMIN: 'admin',
  THERAPIST: 'therapist',
  PLACE: 'place',
  HOTEL: 'hotel',
  VILLA: 'villa',
  USER: 'user',
  AGENT: 'agent',
} as const;

export type RecipientTypeValue = typeof RecipientType[keyof typeof RecipientType];

/**
 * Sender Type - Valid values from Appwrite schema
 * Used in chat_messages collection senderType attribute
 */
export const SenderType = {
  CUSTOMER: 'customer',
  THERAPIST: 'therapist',
  PLACE: 'place',
  SYSTEM: 'system',
} as const;

export type SenderTypeValue = typeof SenderType[keyof typeof SenderType];

/**
 * Message Type - Valid message content types
 * Used in chat_messages collection messageType attribute
 */
export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  BOOKING: 'booking',
  SYSTEM: 'system',
  NOTIFICATION: 'notification',
} as const;

export type MessageTypeValue = typeof MessageType[keyof typeof MessageType];

// ============================================================================
// COLLECTION IDS AND DATABASE CONFIG
// ============================================================================

export const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';
export const CHAT_MESSAGES_COLLECTION_ID = 'chat_messages';
export const CHAT_SESSIONS_COLLECTION_ID = 'chat_sessions';

// ============================================================================
// ATTRIBUTE NAMES - Exact field names from Appwrite schema
// ============================================================================

export const CHAT_MESSAGE_ATTRIBUTES = {
  // Required core attributes
  CONVERSATION_ID: 'conversationId',
  ROOM_ID: 'roomId',
  SENDER_ID: 'senderId',
  SENDER_NAME: 'senderName',
  SENDER_TYPE: 'senderType',
  RECIPIENT_ID: 'recipientId',
  RECIPIENT_NAME: 'recipientName',
  RECIPIENT_TYPE: 'recipientType',
  RECEIVER_ID: 'receiverId',
  RECEIVER_NAME: 'receivername',
  CONTENT: 'content',
  MESSAGE: 'message',
  MESSAGE_TYPE: 'messageType',
  ORIGINAL_LANGUAGE: 'originalLanguage',
  IS_SYSTEM_MESSAGE: 'isSystemMessage',
  BOOKING_ID: 'bookingid',
  ORIGINAL_MESSAGE_ID: 'originalMessageId',
  EXPIRES_AT: 'expiresat',
  ARCHIVED_BY: 'archivedBy',
  SESSION_ID: 'sessionId',
  READ: 'read',
  CREATED_AT: 'createdAt',
  KEEP_FOREVER: 'keepForever',
  MARKED_FOR_SAVE: 'markedForSave',
  
  // Optional attributes
  READ_AT: 'readAt',
  TRANSLATED_TEXT: 'translatedText',
  TRANSLATED_LANGUAGE: 'translatedLanguage',
  FILE_URL: 'fileUrl',
  FILE_NAME: 'fileName',
  LOCATION: 'location',
  SAVED_BY: 'savedby',
  SAVED_AT: 'savedat',
  METADATA: 'metadata',
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a value is a valid RecipientType
 */
export function isValidRecipientType(value: string): value is RecipientTypeValue {
  return Object.values(RecipientType).includes(value as RecipientTypeValue);
}

/**
 * Check if a value is a valid SenderType
 */
export function isValidSenderType(value: string): value is SenderTypeValue {
  const validTypes = Object.values(SenderType);  // Only Appwrite-valid types
  return validTypes.includes(value as SenderTypeValue);
}

/**
 * Check if a value is a valid MessageType
 */
export function isValidMessageType(value: string): value is MessageTypeValue {
  return Object.values(MessageType).includes(value as MessageTypeValue);
}

/**
 * Normalize recipientType - maps common mistakes to valid values
 * Throws error for completely invalid values
 */
export function normalizeRecipientType(value: string | undefined): RecipientTypeValue {
  if (!value) return RecipientType.USER;
  
  const normalized = value.toLowerCase().trim();
  
  // Direct matches first
  if (isValidRecipientType(normalized)) {
    return normalized as RecipientTypeValue;
  }
  
  // Common mistakes mapping
  const mappings: Record<string, RecipientTypeValue> = {
    'system': RecipientType.ADMIN, // Map system to admin (system not allowed in Appwrite schema)
    'customer': RecipientType.USER,
    'buyer': RecipientType.USER,
    'client': RecipientType.USER,
    'seller': RecipientType.THERAPIST,
    'provider': RecipientType.THERAPIST,
    'massage': RecipientType.THERAPIST,
    'facial': RecipientType.PLACE,
    'spa': RecipientType.PLACE,
  };
  
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // If we reach here, it's an invalid value
  throw new Error(`Invalid recipientType: "${value}". Allowed: ${Object.values(RecipientType).join(', ')}`);
}

/**
 * Normalize senderType - maps common mistakes to valid values
 * Throws error for completely invalid values
 */
export function normalizeSenderType(value: string | undefined, senderId?: string): SenderTypeValue {
  // Auto-detect system
  if (!value && senderId === 'system') return SenderType.SYSTEM;
  if (!value) return SenderType.CUSTOMER;
  
  const normalized = value.toLowerCase().trim();
  
  // Direct matches first
  if (isValidSenderType(normalized)) {
    return normalized as SenderTypeValue;
  }
  
  // Common mistakes mapping
  const mappings: Record<string, SenderTypeValue> = {
    'user': SenderType.CUSTOMER,
    'member': SenderType.CUSTOMER,  // Connect member to user/customer
    'buyer': SenderType.CUSTOMER,
    'client': SenderType.CUSTOMER,
    'admin': SenderType.SYSTEM,  // Map admin to system for Appwrite compatibility
    'system': SenderType.SYSTEM,
    'seller': SenderType.THERAPIST,
    'provider': SenderType.THERAPIST,
    'massage': SenderType.THERAPIST,
    'facial': SenderType.PLACE,
    'spa': SenderType.PLACE,
  };
  
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // If we reach here, it's an invalid value
  throw new Error(`Invalid senderType: "${value}". Allowed: ${Object.values(SenderType).join(', ')}`);
}

/**
 * Get all valid recipient type values as array
 */
export function getValidRecipientTypes(): readonly RecipientTypeValue[] {
  return Object.values(RecipientType);
}

/**
 * Get all valid sender type values as array
 */
export function getValidSenderTypes(): readonly SenderTypeValue[] {
  return Object.values(SenderType);
}

// ============================================================================
// CONVENIENCE EXPORTS - Use these throughout the app
// ============================================================================

/**
 * Type-safe enum values for direct use in components
 */
export const VALID_RECIPIENT_TYPES = Object.values(RecipientType) as readonly RecipientTypeValue[];
export const VALID_SENDER_TYPES = Object.values(SenderType) as readonly SenderTypeValue[];
export const VALID_MESSAGE_TYPES = Object.values(MessageType) as readonly MessageTypeValue[];

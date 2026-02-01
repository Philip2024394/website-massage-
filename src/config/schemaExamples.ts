/**
 * APPWRITE SCHEMA MIGRATION GUIDE
 * 
 * How to migrate from hardcoded schemas to canonical schema system
 */

// ❌ OLD WAY - HARDCODED SCHEMAS (DEPRECATED)
/*
const message = {
  senderId: 'user123',
  message: 'Hello',
  createdAt: new Date().toISOString()
  // Missing required fields? No validation!
};
*/

// ✅ NEW WAY - CANONICAL SCHEMA WITH VALIDATION

import { 
  COLLECTIONS, 
  SchemaValidator, 
  MessageDocument,
  ChatMessageDocument,
  BookingDocument 
} from '../config/appwriteSchema';

// Example 1: Creating a validated message
export function createValidatedMessage(data: Partial<MessageDocument>): MessageDocument | null {
  // Get required attributes from canonical schema
  const required = SchemaValidator.getRequiredAttributes('MESSAGES');
  console.log('Required fields for MESSAGES:', required);
  
  // Validate the payload
  const validation = SchemaValidator.validateDocument('MESSAGES', data);
  
  if (!validation.valid) {
    console.error('❌ Message validation failed:', validation.errors);
    console.error('❌ Missing required fields:', validation.missingRequired);
    return null;
  }
  
  return data as MessageDocument;
}

// Example 2: Chat message with enum validation
export function createValidatedChatMessage(data: Partial<ChatMessageDocument>): ChatMessageDocument | null {
  const validation = SchemaValidator.validateDocument('CHAT_MESSAGES', data);
  
  if (!validation.valid) {
    console.error('❌ Chat message validation failed:', validation.errors);
    return null;
  }
  
  return data as ChatMessageDocument;
}

// Example 3: Booking creation with schema validation
export function createValidatedBooking(data: Partial<BookingDocument>): BookingDocument | null {
  const validation = SchemaValidator.validateDocument('BOOKINGS', data);
  
  if (!validation.valid) {
    console.error('❌ Booking validation failed:', validation.errors);
    return null;
  }
  
  return data as BookingDocument;
}

// Example 4: Get collection ID from schema
export function getCollectionId(collectionName: keyof typeof COLLECTIONS): string {
  return SchemaValidator.getCollectionId(collectionName);
}

// Example usage in components:
/*
import { createValidatedMessage, getCollectionId } from './schemaExamples';

const newMessage = createValidatedMessage({
  messageId: 'msg_123',
  senderId: 'user_456',
  recipientId: 'therapist_789',
  content: 'I would like to book a massage',
  sentAt: new Date().toISOString(),
  conversationId: 'conv_abc',
  senderName: 'John Doe',
  senderRole: 'customer',
  receiverId: 'therapist_789',
  receiverName: 'Jane Smith',
  receiverRole: 'therapist',
  message: 'I would like to book a massage',
  messageType: 'text',
  senderType: 'customer'
});

if (newMessage) {
  // Message is valid, proceed with creation
  const collectionId = getCollectionId('MESSAGES');
  console.log('Creating message in collection:', collectionId);
}
*/
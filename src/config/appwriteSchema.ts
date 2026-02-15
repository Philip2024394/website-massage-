/**
 * CANONICAL APPWRITE SCHEMA
 * 
 * Single source of truth for all Appwrite collection definitions.
 * This file must be imported wherever schemas are needed.
 * 
 * ⚠️ CRITICAL RULES:
 * - NO schema definitions outside this file
 * - NO hardcoded attribute names in components
 * - NO re-asking for schema information
 * - ALL collection access must validate against these definitions
 */

export interface CollectionAttribute {
  type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'enum';
  required: boolean;
  size?: number;
  default?: any;
  enumValues?: string[];
}

export interface CollectionSchema {
  name: string;
  collectionId: string;
  attributes: Record<string, CollectionAttribute>;
}

/**
 * APPWRITE DATABASE CONFIGURATION
 */
export const APPWRITE_DATABASE = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05'
} as const;

/**
 * COLLECTION DEFINITIONS - CANONICAL SCHEMAS
 * 
 * Based on actual Appwrite collections created and verified.
 * These are the ONLY valid schema definitions for the application.
 */
export const COLLECTIONS = {
  /**
   * BOOKINGS COLLECTION
   * Primary booking management system
   */
  BOOKINGS: {
    name: 'bookings',
    collectionId: 'bookings_collection_id',
    attributes: {
      bookingId: { type: 'string', required: true },
      bookingDate: { type: 'datetime', required: true },
      status: { type: 'string', required: false },
      totalCost: { type: 'double', required: false },
      paymentMethod: { type: 'string', required: false },
      duration: { type: 'integer', required: false },
      providerId: { type: 'string', required: true },
      providerType: { type: 'string', required: true },
      providerName: { type: 'string', required: true },
      service: { type: 'string', required: true },
      startTime: { type: 'datetime', required: true },
      userId: { type: 'string', required: true },
      userName: { type: 'string', required: false },
      hotelId: { type: 'string', required: false },
      hotelGuestName: { type: 'string', required: false },
      hotelRoomNumber: { type: 'string', required: false },
      therapistId: { type: 'string', required: false },
      therapistName: { type: 'string', required: false },
      therapistType: { type: 'string', required: false },
      price: { type: 'integer', required: true },
      createdAt: { type: 'datetime', required: true },
      responseDeadline: { type: 'datetime', required: true },
      scheduledTime: { type: 'datetime', required: false },
      customerName: { type: 'string', required: false },
      customerWhatsApp: { type: 'string', required: false }
    }
  } as CollectionSchema,

  /**
   * MESSAGES COLLECTION  
   * Primary messaging system used by messagingService
   */
  MESSAGES: {
    name: 'messages',
    collectionId: 'messages',
    attributes: {
      messageId: { type: 'string', required: true, size: 255 },
      senderId: { type: 'string', required: true, size: 255 },
      recipientId: { type: 'string', required: true, size: 255 },
      content: { type: 'string', required: true, size: 1000 },
      sentAt: { type: 'datetime', required: true },
      isRead: { type: 'boolean', required: false, default: false },
      conversationId: { type: 'string', required: true, size: 255 },
      senderName: { type: 'string', required: true, size: 255 },
      senderRole: { type: 'string', required: true, size: 255 },
      receiverId: { type: 'string', required: true, size: 255 },
      receiverName: { type: 'string', required: true, size: 255 },
      receiverRole: { type: 'string', required: true, size: 255 },
      message: { type: 'string', required: true, size: 10000 },
      messageType: { type: 'string', required: true, size: 500 },
      bookingId: { type: 'string', required: false, size: 255 },
      metadata: { type: 'string', required: false, size: 1000 },
      senderType: { type: 'string', required: true, size: 255 }
    }
  } as CollectionSchema,

  /**
   * CHAT_MESSAGES COLLECTION
   * Enhanced messaging system with advanced features
   */
  CHAT_MESSAGES: {
    name: 'chat_messages',
    collectionId: 'chat_messages',
    attributes: {
      senderId: { type: 'string', required: true, size: 255 },
      read: { type: 'boolean', required: true },
      senderName: { type: 'string', required: true, size: 255 },
      translatedText: { type: 'string', required: false, size: 5000 },
      originalLanguage: { type: 'string', required: true, size: 10 },
      isSystemMessage: { type: 'boolean', required: true },
      readAt: { type: 'datetime', required: false },
      senderType: { 
        type: 'enum', 
        required: true,
        enumValues: ['customer', 'therapist', 'place', 'system']
      },
      roomId: { type: 'string', required: true, size: 255 },
      message: { type: 'string', required: true, size: 5000 },
      createdAt: { type: 'datetime', required: true },
      translatedLanguage: { 
        type: 'enum', 
        required: false,
        enumValues: ['en', 'id']
      },
      recipientId: { type: 'string', required: true, size: 255 },
      recipientName: { type: 'string', required: true, size: 255 },
      recipientType: { 
        type: 'enum', 
        required: true,
        enumValues: ['admin', 'therapist', 'place', 'hotel', 'villa', 'user', 'agent']
      },
      messageType: { 
        type: 'enum', 
        required: true,
        enumValues: ['text', 'image', 'file', 'booking', 'system', 'notification']
      },
      fileUrl: { type: 'string', required: false, size: 500 },
      fileName: { type: 'string', required: false, size: 255 },
      location: { type: 'string', required: false, size: 500 },
      keepForever: { type: 'boolean', required: false, default: false },
      conversationId: { type: 'string', required: true, size: 255 },
      receiverId: { type: 'string', required: true, size: 255 },
      receivername: { type: 'string', required: true, size: 255 },
      content: { type: 'string', required: true, size: 255 },
      bookingid: { type: 'string', required: true, size: 255 },
      originalMessageId: { type: 'string', required: true, size: 255 },
      expiresat: { type: 'datetime', required: true },
      markedForSave: { type: 'boolean', required: false, default: false },
      savedby: { type: 'string', required: false, size: 255 },
      savedat: { type: 'datetime', required: false },
      archivedBy: { type: 'string', required: true, size: 50 },
      metadata: { type: 'string', required: false, size: 500 },
      sessionId: { type: 'string', required: true, size: 150 }
    }
  } as CollectionSchema,

  /**
   * ADMIN_MESSAGES COLLECTION
   * Administrative messaging system
   */
  ADMIN_MESSAGES: {
    name: 'admin_messages',
    collectionId: 'admin_messages',
    attributes: {
      messageId: { type: 'string', required: true },
      adminId: { type: 'string', required: true },
      recipientId: { type: 'string', required: true },
      subject: { type: 'string', required: false },
      body: { type: 'string', required: false },
      isRead: { type: 'boolean', required: false },
      timestamp: { type: 'datetime', required: true },
      senderId: { type: 'string', required: true },
      senderName: { type: 'string', required: true },
      senderType: { type: 'string', required: true },
      receiverId: { type: 'string', required: true },
      message: { type: 'string', required: true }
    }
  } as CollectionSchema,

  /**
   * INDASTREET_NEWS COLLECTION
   * News feed for massage & skin clinic: techniques, producers, places, headlines.
   * Create in Appwrite Console with collection ID: indastreet_news, or run:
   *   APPWRITE_API_KEY=... npx ts-node scripts/setup-indastreet-news-collection.ts
   */
  INDASTREET_NEWS: {
    name: 'indastreet_news',
    collectionId: 'indastreet_news',
    attributes: {
      headline: { type: 'string', required: true, size: 500 },
      excerpt: { type: 'string', required: true, size: 2000 },
      date: { type: 'string', required: true, size: 50 },
      category: {
        type: 'enum',
        required: true,
        enumValues: ['techniques', 'producers', 'places-opening', 'places-closing', 'good-news', 'negative', 'headlines']
      },
      imageSrc: { type: 'string', required: false, size: 1000 },
      published: { type: 'boolean', required: false, default: true },
      order: { type: 'integer', required: false }
    }
  } as CollectionSchema,

  /**
   * INDASTREET_BLOG COLLECTION
   * Blog articles for wellness, massage, skin clinic – listing and view-post pages.
   * Create in Appwrite Console with collection ID: indastreet_blog
   * Image storage: use Storage bucket blog_images (see STORAGE_BUCKETS below).
   */
  INDASTREET_BLOG: {
    name: 'indastreet_blog',
    collectionId: 'indastreet_blog',
    attributes: {
      title: { type: 'string', required: true, size: 500 },
      slug: { type: 'string', required: true, size: 255 },
      excerpt: { type: 'string', required: true, size: 2000 },
      body: { type: 'string', required: true, size: 100000 },
      category: {
        type: 'enum',
        required: true,
        enumValues: ['international', 'industry', 'techniques', 'career', 'wellness']
      },
      author: { type: 'string', required: true, size: 255 },
      date: { type: 'string', required: true, size: 50 },
      readTime: { type: 'string', required: true, size: 50 },
      image: { type: 'string', required: false, size: 2000 },
      imageFileId: { type: 'string', required: false, size: 100 },
      featured: { type: 'boolean', required: false, default: false },
      published: { type: 'boolean', required: false, default: true },
      order: { type: 'integer', required: false }
    }
  } as CollectionSchema

} as const;

/**
 * STORAGE BUCKETS (Appwrite Storage)
 * Create buckets in Appwrite Console → Storage. Use these IDs in config.
 */
export const STORAGE_BUCKETS = {
  /** Main app bucket (therapist images, etc.) */
  default: '68f76bdd002387590584',
  /** Blog hero and in-article images (Appwrite Storage bucket ID) */
  blog_images: 'bogimages'
} as const;

/**
 * SCHEMA VALIDATION UTILITIES
 */
export class SchemaValidator {
  /**
   * Validates a document payload against a collection schema
   */
  static validateDocument(collectionName: keyof typeof COLLECTIONS, payload: Record<string, any>): {
    valid: boolean;
    errors: string[];
    missingRequired: string[];
  } {
    const schema = COLLECTIONS[collectionName];
    const errors: string[] = [];
    const missingRequired: string[] = [];

    // Check required fields
    for (const [attrName, attrDef] of Object.entries(schema.attributes)) {
      if (attrDef.required && !(attrName in payload)) {
        missingRequired.push(attrName);
        errors.push(`Missing required attribute: ${attrName}`);
      }
    }

    // Check enum values
    for (const [attrName, value] of Object.entries(payload)) {
      const attrDef = schema.attributes[attrName];
      if (attrDef?.type === 'enum' && attrDef.enumValues && value !== null && value !== undefined) {
        if (!attrDef.enumValues.includes(value as string)) {
          errors.push(`Invalid enum value for ${attrName}: ${value}. Valid values: ${attrDef.enumValues.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      missingRequired
    };
  }

  /**
   * Gets all required attributes for a collection
   */
  static getRequiredAttributes(collectionName: keyof typeof COLLECTIONS): string[] {
    const schema = COLLECTIONS[collectionName];
    return Object.entries(schema.attributes)
      .filter(([_, attrDef]) => attrDef.required)
      .map(([attrName, _]) => attrName);
  }

  /**
   * Gets collection ID for a collection name
   */
  static getCollectionId(collectionName: keyof typeof COLLECTIONS): string {
    return COLLECTIONS[collectionName].collectionId;
  }
}

/**
 * TYPE-SAFE DOCUMENT INTERFACES
 * Generated from canonical schema
 */
export interface BookingDocument {
  bookingId: string;
  bookingDate: string;
  status?: string;
  totalCost?: number;
  paymentMethod?: string;
  duration?: number;
  providerId: string;
  providerType: string;
  providerName: string;
  service: string;
  startTime: string;
  userId: string;
  userName?: string;
  hotelId?: string;
  hotelGuestName?: string;
  hotelRoomNumber?: string;
  therapistId?: string;
  therapistName?: string;
  therapistType?: string;
  price: number;
  createdAt: string;
  responseDeadline: string;
  scheduledTime?: string;
  customerName?: string;
  customerWhatsApp?: string;
}

export interface MessageDocument {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: string;
  isRead?: boolean;
  conversationId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  message: string;
  messageType: string;
  bookingId?: string;
  metadata?: string;
  senderType: string;
}

export interface ChatMessageDocument {
  senderId: string;
  read: boolean;
  senderName: string;
  translatedText?: string;
  originalLanguage: string;
  isSystemMessage: boolean;
  readAt?: string;
  senderType: 'customer' | 'therapist' | 'place' | 'system';
  roomId: string;
  message: string;
  createdAt: string;
  translatedLanguage?: 'en' | 'id';
  recipientId: string;
  recipientName: string;
  recipientType: 'admin' | 'therapist' | 'place' | 'hotel' | 'villa' | 'user' | 'agent';
  messageType: 'text' | 'image' | 'file' | 'booking' | 'system' | 'notification';
  fileUrl?: string;
  fileName?: string;
  location?: string;
  keepForever?: boolean;
  conversationId: string;
  receiverId: string;
  receivername: string;
  content: string;
  bookingid: string;
  originalMessageId: string;
  expiresat: string;
  markedForSave?: boolean;
  savedby?: string;
  savedat?: string;
  archivedBy: string;
  metadata?: string;
  sessionId: string;
}

/**
 * Blog document (from INDASTREET_BLOG collection)
 */
export interface IndastreetBlogDocument {
  $id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: 'international' | 'industry' | 'techniques' | 'career' | 'wellness';
  author: string;
  date: string;
  readTime: string;
  image?: string;
  imageFileId?: string;
  featured?: boolean;
  published?: boolean;
  order?: number;
  $createdAt?: string;
  $updatedAt?: string;
}

/**
 * EXPORT HELPERS FOR EASY IMPORTS
 */
export const getBookingSchema = () => COLLECTIONS.BOOKINGS;
export const getMessageSchema = () => COLLECTIONS.MESSAGES;
export const getChatMessageSchema = () => COLLECTIONS.CHAT_MESSAGES;
export const getAdminMessageSchema = () => COLLECTIONS.ADMIN_MESSAGES;
export const getIndastreetBlogSchema = () => COLLECTIONS.INDASTREET_BLOG;

export default COLLECTIONS;
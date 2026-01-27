/**
 * Shared Appwrite Client Configuration
 * Used by all service modules
 * 
 * ⚠️ IMPORTANT: This file now uses TEXT-BASED collection IDs only
 * ⚠️ Numeric hash IDs are blocked by appwrite-collection-validator.ts
 */
import { Client, Databases, Account } from 'appwrite';
import { VALIDATED_COLLECTIONS, DATABASE_ID } from '../appwrite-collection-validator';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

// Initialize services
const databases = new Databases(client);
const account = new Account(client);

// Export for use in other services
export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;

// ✅ Database and collection constants - TEXT-BASED IDs ONLY
// ⚠️  NEVER use numeric hash IDs like '675e13fc002aaf0777ce'
export const APPWRITE_CONFIG = {
  databaseId: DATABASE_ID,
  collections: {
    // ✅ Core collections with validated text-based IDs
    therapists: VALIDATED_COLLECTIONS.therapists,
    places: VALIDATED_COLLECTIONS.places,
    users: VALIDATED_COLLECTIONS.users,
    bookings: VALIDATED_COLLECTIONS.bookings,
    reviews: VALIDATED_COLLECTIONS.reviews,
    notifications: VALIDATED_COLLECTIONS.notifications,
    
    // ✅ Chat collections
    chatMessages: VALIDATED_COLLECTIONS.chat_messages,
    chatRooms: VALIDATED_COLLECTIONS.chat_rooms,
    
    // Keep empty string for disabled collections
    admins: '',
    agents: '', 
  }
};
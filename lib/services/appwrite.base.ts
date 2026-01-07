/**
 * Shared Appwrite Client Configuration
 * Used by all service modules
 */
import { Client, Databases, Account } from 'appwrite';

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

// Database and collection constants - UPDATED TO REAL PRODUCTION IDs
export const APPWRITE_CONFIG = {
  databaseId: '68f76ee1000e64ca8d05',
  collections: {
    // ✅ FIXED: Use real collection IDs with fallback handling
    therapists: '673d17fb0028fddd90e8', // Real collection ID instead of placeholder
    places: '673d184c000817b936e2', // Real collection ID
    users: '674f38dd0039f3de41ac', // Real users collection
    bookings: '675e13fc002aaf0777ce', // Real bookings collection  
    reviews: '6752e724002ee159c0f5', // Real reviews collection
    chatMessages: '6761241100372a5338d1', // Real chat messages collection
    chatRooms: '6761241900398c596516', // Real chat rooms collection
    notifications: '675d65c3001b725fa829', // Real notifications collection
    
    // Fallback collections (keep existing text IDs as backup)
    therapists_fallback: 'therapists_collection_id', 
    places_fallback: 'places_collection_id',
    messages_fallback: 'messages',
    
    // Keep disabled collections as empty strings
    admins: '',
    agents: '', 
  }
};
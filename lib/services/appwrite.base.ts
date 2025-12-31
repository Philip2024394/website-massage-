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
    therapists: 'therapists_collection_id', // ✅ Text-based collection ID
    places: 'places_collection_id', // ✅ Text-based collection ID
    users: '', // ⚠️ DISABLED - Collection doesn't exist
    admins: '', // ⚠️ DISABLED - Collection doesn't exist
    agents: '', // ⚠️ DISABLED - Collection doesn't exist
    bookings: '', // ⚠️ DISABLED - Collection doesn't exist
    reviews: '', // Disabled - collection doesn't exist
    messages: '', // Disabled - collection doesn't exist
    notifications: '', // Disabled - collection doesn't exist
  }
};
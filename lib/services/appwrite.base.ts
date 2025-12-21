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

// Database and collection constants
export const APPWRITE_CONFIG = {
  databaseId: '68f76ee1000e64ca8d05',
  collections: {
    // These IDs need to be updated with real collection IDs
    therapists: 'therapists_collection_id',
    places: 'places_collection_id',
    users: 'users_collection_id',
    bookings: 'bookings_collection_id',
    reviews: 'reviews_collection_id',
    messages: 'messages_collection_id',
    notifications: 'notifications_collection_id',
  }
};
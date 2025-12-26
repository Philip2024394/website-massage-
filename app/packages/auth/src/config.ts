import { Client, Databases, Account, Storage } from 'appwrite';

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_BUCKET_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Appwrite Configuration - Facebook Standards
 * Centralized configuration for all authentication services
 */
export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  bucketId: string;
  collections: {
    therapists: string;
    places: string;
    users: string;
    agents: string;
    bookings: string;
    hotels: string;
    partners: string;
    facialPlaces: string;
    villas: string;
    notifications: string;
    messages: string;
    reviews: string;
  };
}

export const APPWRITE_CONFIG: AppwriteConfig = {
  endpoint: (import.meta as any).env?.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1',
  projectId: (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664',
  databaseId: (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05',
  bucketId: (import.meta as any).env?.VITE_APPWRITE_BUCKET_ID || '68f76bdd002387590584',
  collections: {
    therapists: 'therapists_collection_id', // Actual collection name
    places: 'places_collection_id',
    users: 'users_collection_id',
    agents: 'agents_collection_id',
    bookings: 'bookings_collection_id',
    hotels: '676701f9001e6dc8b278',
    partners: '677a5d3f003c4d7e9c1a',
    facialPlaces: 'facial_places_collection',
    villas: 'villas_collection_id',
    notifications: 'notifications_collection_id',
    messages: 'messages_collection_id',
    reviews: 'reviews_collection_id'
  }
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

// Export client for advanced usage
export { client };

// Database constants for backward compatibility
export const DATABASE_ID = APPWRITE_CONFIG.databaseId;
export const COLLECTIONS = APPWRITE_CONFIG.collections;
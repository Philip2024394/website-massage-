/**
 * ============================================================================
 * 🔧 SINGLE APPWRITE CLIENT - THE FIX
 * ============================================================================
 * 
 * This is THE ONLY Appwrite client in the entire /src_v2 architecture.
 * All other clients are eliminated to prevent conflicts.
 * 
 * THE PROBLEM IT SOLVES:
 * "❌ Both message sending and booking creation failed"
 * 
 * CAUSED BY: Multiple Appwrite clients with different configs creating conflicts
 * FIXED BY: One client, one configuration, one source of truth
 * 
 * RULES:
 * - NO other file in /src_v2 creates Appwrite clients
 * - All services import from THIS file only
 * - Configuration is loaded once and cached
 * - Client is initialized once and reused
 * 
 * ============================================================================
 */

import { Client, Databases, Account, Storage, Functions, ID, Query, Permission, Role } from 'appwrite';

// Core configuration interface
interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  bucketId: string;
  collections: {
    bookings: string;
    therapists: string;
    places: string;
    messages: string;
    chatSessions: string;
    users: string;
    notifications: string;
    reviews: string;
  };
}

// THE FIX: Single configuration source
const APPWRITE_CONFIG: AppwriteConfig = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664', 
  databaseId: '68f76ee1000e64ca8d05',
  bucketId: '68f76bdd002387590584',
  collections: {
    // Core booking collections
    bookings: 'bookings', // THE FIX: Correct collection ID
    therapists: 'therapists_collection_id',
    places: 'places_collection_id',
    
    // Communication collections
    messages: 'chat_messages',
    chatSessions: 'chat_sessions',
    
    // User management
    users: 'users_collection_id',
    notifications: 'notifications',
    reviews: 'reviews'
  }
};

// THE FIX: Single client instance (no duplicates)
let _client: Client | null = null;
let _databases: Databases | null = null;
let _account: Account | null = null;
let _storage: Storage | null = null;
let _functions: Functions | null = null;

// Initialize client only once
function initializeClient(): Client {
  if (!_client) {
    _client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
    
    console.log('🔧 [CORE] Single Appwrite client initialized');
    console.log('📍 Endpoint:', APPWRITE_CONFIG.endpoint);
    console.log('📍 Project:', APPWRITE_CONFIG.projectId);
    console.log('📍 Database:', APPWRITE_CONFIG.databaseId);
  }
  return _client;
}

// THE FIX: Lazy-loaded service singletons
export const appwriteClient = (() => initializeClient())();

export const databases = (() => {
  if (!_databases) {
    _databases = new Databases(appwriteClient);
  }
  return _databases;
})();

export const account = (() => {
  if (!_account) {
    _account = new Account(appwriteClient);
  }
  return _account;
})();

export const storage = (() => {
  if (!_storage) {
    _storage = new Storage(appwriteClient);
  }
  return _storage;
})();

export const functions = (() => {
  if (!_functions) {
    _functions = new Functions(appwriteClient);
  }
  return _functions;
})();

// Configuration access
export const getAppwriteConfig = () => APPWRITE_CONFIG;

// Database constants
export const DATABASE_ID = APPWRITE_CONFIG.databaseId;
export const COLLECTION_IDS = APPWRITE_CONFIG.collections;

// Helper utilities (exported for convenience)
export { ID, Query, Permission, Role };

// Connection testing utility
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 [CORE] Testing Appwrite connection...');
    await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.bookings);
    console.log('✅ [CORE] Appwrite connection successful');
    return true;
  } catch (error) {
    console.error('❌ [CORE] Appwrite connection failed:', error);
    return false;
  }
};

// Collection validation utility 
export const validateCollections = async (): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  for (const [name, collectionId] of Object.entries(COLLECTION_IDS)) {
    try {
      await databases.listDocuments(DATABASE_ID, collectionId, [Query.limit(1)]);
      results[name] = true;
      console.log(`✅ [CORE] Collection '${name}' (${collectionId}) exists`);
    } catch (error) {
      results[name] = false;
      console.warn(`⚠️ [CORE] Collection '${name}' (${collectionId}) not accessible:`, (error as Error).message);
    }
  }
  
  return results;
};

// Export configuration for backward compatibility
export const APPWRITE_CONFIG_EXPORT = APPWRITE_CONFIG;

console.log('🚀 [CORE] Appwrite client module loaded - single source of truth established');
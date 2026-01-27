/**
 * Core Appwrite Configuration and Client Setup
 * Base configuration shared across all services
 */

import { Client, Databases, Account, Storage, Functions } from 'appwrite';

/**
 * Get required environment variable or throw
 */
function requireEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] || fallback;
  
  // STEP 1: ENVIRONMENT VARIABLES CHECK - Log all checks
  console.log(`[APPWRITE CONFIG] Checking ${key}:`, value ? '✅ LOADED' : '❌ MISSING');
  
  if (!value || value === '') {
    const error = `❌ MISSING CONFIG: ${key} is required but not set in environment variables`;
    console.error(`[APPWRITE CONFIG] ${error}`);
    console.error(`[APPWRITE CONFIG] Available env keys:`, Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    throw new Error(error);
  }
  
  console.log(`[APPWRITE CONFIG] ${key} = ${value}`);
  return value;
}

/**
 * Get optional environment variable (for disabled collections)
 * Returns empty string if not configured
 */
function optionalEnv(key: string): string {
  return import.meta.env[key] || '';
}

// Appwrite configuration
export const APPWRITE_CONFIG = {
  endpoint: requireEnv('VITE_APPWRITE_ENDPOINT', 'https://syd.cloud.appwrite.io/v1'),
  projectId: requireEnv('VITE_APPWRITE_PROJECT_ID', '68f23b11000d25eb3664'),
  databaseId: requireEnv('VITE_APPWRITE_DATABASE_ID', '68f76ee1000e64ca8d05'),
  bucketId: requireEnv('VITE_APPWRITE_BUCKET_ID', '68f76bdd002387590584'),
  collections: {
    // Core collections - REQUIRED
    therapists: requireEnv('VITE_THERAPISTS_COLLECTION_ID', 'therapists_collection_id'),
    places: requireEnv('VITE_PLACES_COLLECTION_ID', 'places_collection_id'),
    facial_places: requireEnv('VITE_FACIAL_PLACES_COLLECTION_ID', 'facial_places_collection'),
    bookings: requireEnv('VITE_BOOKINGS_COLLECTION_ID', 'bookings_collection_id'),
    reviews: requireEnv('VITE_REVIEWS_COLLECTION_ID', 'reviews_collection_id'),
    locations: requireEnv('VITE_LOCATIONS_COLLECTION_ID', 'locations'),
    
    // Communication - REQUIRED
    messages: requireEnv('VITE_MESSAGES_COLLECTION_ID', 'chat_messages'),
    chatMessages: requireEnv('VITE_CHAT_MESSAGES_COLLECTION_ID', 'chat_messages'),
    chatRooms: requireEnv('VITE_CHAT_ROOMS_COLLECTION_ID', 'chat_rooms'),
    chatAuditLogs: requireEnv('VITE_CHAT_AUDIT_LOGS_COLLECTION_ID', 'chat_audit_logs'),
    chatSessions: requireEnv('VITE_CHAT_SESSIONS_COLLECTION_ID', 'chat_sessions'),
    
    // Analytics - REQUIRED
    analytics: 'Analytics',
    analyticsEvents: 'Analytics Events',
    agentVisits: 'Agent Visits',
    
    // Communication - OPTIONAL
    chatTranslations: 'Chat Translations',
    
    // Core collections - DISABLED (return empty string, force-fail will catch usage)
    users: optionalEnv('VITE_USERS_COLLECTION_ID'),
    agents: optionalEnv('VITE_AGENTS_COLLECTION_ID'),
    admins: optionalEnv('VITE_ADMINS_COLLECTION_ID'),
    notifications: optionalEnv('VITE_NOTIFICATIONS_COLLECTION_ID'),
    
    // Business - OPTIONAL
    hotels: requireEnv('VITE_HOTELS_COLLECTION_ID', 'hotels_collection_id'),
    hotelBookings: requireEnv('VITE_HOTEL_BOOKINGS_COLLECTION_ID', 'hotel_bookings'),
    partners: import.meta.env.VITE_PARTNERS_COLLECTION_ID || 'Partners',
    
    // Content - OPTIONAL
    massageTypes: import.meta.env.VITE_MASSAGE_TYPES_COLLECTION_ID || 'Massage Types',
    customLinks: optionalEnv('VITE_CUSTOM_LINKS_COLLECTION_ID'),
    imageAssets: import.meta.env.VITE_IMAGE_ASSETS_COLLECTION_ID || 'Image Assets',
    loginBackgrounds: import.meta.env.VITE_LOGIN_BACKGROUNDS_COLLECTION_ID || 'Login Backgrounds',
    translations: optionalEnv('VITE_TRANSLATIONS_COLLECTION_ID'),
    
    // Pricing & Payments - OPTIONAL
    membershipPricing: 'Membership Pricing',
    pricing: 'Pricing',
    commissionRecords: 'Commission Records',
    payments: 'Payments',
    
    // Membership & Leads - OPTIONAL
    leadGenerations: import.meta.env.VITE_LEAD_GENERATIONS_COLLECTION_ID || 'Lead Generations',
    membershipAgreements: import.meta.env.VITE_MEMBERSHIP_AGREEMENTS_COLLECTION_ID || 'Membership Agreements',
    membershipUpgrades: import.meta.env.VITE_MEMBERSHIP_UPGRADES_COLLECTION_ID || 'Membership Upgrades',
    deactivationRequests: import.meta.env.VITE_DEACTIVATION_REQUESTS_COLLECTION_ID || 'Deactivation Requests',
    leads: optionalEnv('VITE_LEADS_COLLECTION_ID'),
    
    // Jobs - OPTIONAL
    employerJobPostings: 'Employer Job Postings',
    therapistJobListings: 'Therapist Job Listings',
    therapistMenus: 'therapist_menus',
    
    // Other - OPTIONAL
    verifications: 'Verifications',
    pushSubscriptions: 'Push Subscriptions',
    appConfig: 'App Config',
    uiConfig: 'UI Config',
    attributes: 'ATTRIBUTES'
  }
};

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// STEP 2: APPWRITE CLIENT AUTH CHECK - Log client initialization
console.log('[APPWRITE CONFIG] ✅ Appwrite Client initialized');
console.log('[APPWRITE CONFIG] Endpoint:', APPWRITE_CONFIG.endpoint);
console.log('[APPWRITE CONFIG] Project ID:', APPWRITE_CONFIG.projectId);
console.log('[APPWRITE CONFIG] Database ID:', APPWRITE_CONFIG.databaseId);

// Initialize services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Verify user session before any database operations
async function validateSession() {
  try {
    const session = await account.get();
    console.log('[APPWRITE CONFIG] ✅ User session active - User ID:', session.$id);
    return session;
  } catch (error) {
    console.warn('[APPWRITE CONFIG] ⚠️ No active session - Guest mode');
    return null;
  }
}

// Export session validator
export { validateSession };

// Rate-limited database instance (alias for databases)
export const rateLimitedDb = databases;

// Export configured instances
export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;
export const appwriteStorage = storage;
export const appwriteFunctions = functions;
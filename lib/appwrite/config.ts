/**
 * Core Appwrite Configuration and Client Setup
 * Base configuration shared across all services
 */

import { Client, Databases, Account, Storage, Functions } from 'appwrite';

// Appwrite configuration
export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05',
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || '68f76bdd002387590584',
  collections: {
    // Core collections - Using environment variables with database fallbacks
    therapists: import.meta.env.VITE_THERAPISTS_COLLECTION_ID || '676703b40009b9dd33de',
    places: import.meta.env.VITE_PLACES_COLLECTION_ID || '6767038a003b7bdff200', 
    facial_places: import.meta.env.VITE_FACIAL_PLACES_COLLECTION_ID || '67670371000c0bef1447',
    users: import.meta.env.VITE_USERS_COLLECTION_ID || '67670355000b2bc99d43',
    agents: import.meta.env.VITE_AGENTS_COLLECTION_ID || '67670345000d944b9c39',
    bookings: import.meta.env.VITE_BOOKINGS_COLLECTION_ID || '676703310021e8b17560',
    reviews: import.meta.env.VITE_REVIEWS_COLLECTION_ID || '6767031d002a0b3bfd56',
    
    // Analytics
    analytics: 'analytics_collection_id',
    analyticsEvents: 'Analytics Events',
    agentVisits: 'agent_visits_collection_id',
    
    // Communication
    messages: 'messages_collection_id',
    notifications: 'notifications_collection_id',
    chatMessages: 'chat_messages_collection_id',
    chatRooms: 'chat_rooms_collection_id',
    chatSessions: 'chat_sessions_collection_id',
    chatTranslations: 'chat_translations_collection_id',
    
    // Business  
    hotels: import.meta.env.VITE_HOTELS_COLLECTION_ID || '676701f9001e6dc8b278',
    partners: import.meta.env.VITE_PARTNERS_COLLECTION_ID || '676701e5000f4a7fb167',
    
    // Content
    massageTypes: import.meta.env.VITE_MASSAGE_TYPES_COLLECTION_ID || '6767025e00093a8fd152',
    customLinks: import.meta.env.VITE_CUSTOM_LINKS_COLLECTION_ID || '67670249000b8becb947', 
    imageAssets: import.meta.env.VITE_IMAGE_ASSETS_COLLECTION_ID || '67670235002d4cfb1356',
    loginBackgrounds: import.meta.env.VITE_LOGIN_BACKGROUNDS_COLLECTION_ID || '67670221002cf5e4f389',
    translations: import.meta.env.VITE_TRANSLATIONS_COLLECTION_ID || '6767020d001f6bafeea2',
    
    // Pricing & Payments
    membershipPricing: 'membership_pricing_collection_id',
    pricing: 'pricing_collection_id',
    commissionRecords: 'commission_records',
    payments: 'payments_collection_id',
    
    // Membership & Leads
    leadGenerations: 'lead_generations_collection_id',
    membershipAgreements: 'membership_agreements_collection_id',
    membershipUpgrades: 'membership_upgrades_collection_id',
    deactivationRequests: 'deactivation_requests_collection_id',
    leads: 'leads_collection_id',
    
    // Jobs
    employerJobPostings: 'employer_job_postings_collection_id',
    therapistJobListings: 'therapist_job_listings_collection_id',
    therapistMenus: 'therapist_menus_collection_id',
    
    // Other
    verifications: 'verifications_collection_id',
    pushSubscriptions: 'push_subscriptions_collection_id',
    appConfig: 'app_config_collection_id',
    uiConfig: 'ui_config_collection_id',
    attributes: 'ATTRIBUTES'
  }
};

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Rate-limited database instance (alias for databases)
export const rateLimitedDb = databases;

// Export configured instances
export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;
export const appwriteStorage = storage;
export const appwriteFunctions = functions;
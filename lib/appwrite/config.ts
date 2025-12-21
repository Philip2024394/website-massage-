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
    // Core collections - Using actual collection IDs from Appwrite database
    therapists: import.meta.env.VITE_THERAPISTS_COLLECTION_ID || 'therapists_collection_id',
    places: import.meta.env.VITE_PLACES_COLLECTION_ID || 'places_collection_id', 
    facial_places: import.meta.env.VITE_FACIAL_PLACES_COLLECTION_ID || 'facial_places_collection_id',
    users: import.meta.env.VITE_USERS_COLLECTION_ID || 'users_collection_id',
    agents: import.meta.env.VITE_AGENTS_COLLECTION_ID || 'agents_collection_id',
    bookings: import.meta.env.VITE_BOOKINGS_COLLECTION_ID || 'bookings_collection_id',
    reviews: import.meta.env.VITE_REVIEWS_COLLECTION_ID || 'reviews_collection_id',
    
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
    hotels: import.meta.env.VITE_HOTELS_COLLECTION_ID || 'hotels_collection_id',
    partners: import.meta.env.VITE_PARTNERS_COLLECTION_ID || 'partners_collection_id',
    
    // Content
    massageTypes: import.meta.env.VITE_MASSAGE_TYPES_COLLECTION_ID || 'massage_types_collection_id',
    customLinks: import.meta.env.VITE_CUSTOM_LINKS_COLLECTION_ID || 'custom_links_collection_id', 
    imageAssets: import.meta.env.VITE_IMAGE_ASSETS_COLLECTION_ID || 'image_assets_collection_id',
    loginBackgrounds: import.meta.env.VITE_LOGIN_BACKGROUNDS_COLLECTION_ID || 'login_backgrounds_collection_id',
    translations: import.meta.env.VITE_TRANSLATIONS_COLLECTION_ID || 'translations_collection_id',
    
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
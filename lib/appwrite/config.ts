/**
 * Core Appwrite Configuration and Client Setup
 * Base configuration shared across all services
 */

import { Client, Databases, Account, Storage, Functions } from 'appwrite';

// Appwrite configuration
export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'your-project-id',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'your-database-id',
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'your-bucket-id',
  collections: {
    // Core collections - Using actual collection IDs from Appwrite
    therapists: 'THERAPISTS_COLLECTION_ID',
    places: 'PLACES_COLLECTION_ID',
    facial_places: 'FACIAL_PLACES_COLLECTION_ID',
    users: 'USERS_COLLECTION_ID',
    agents: 'AGENTS_COLLECTION_ID',
    bookings: 'bookings_collection_id',
    reviews: 'reviews_collection_id',
    
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
    hotels: 'hotels_collection_id',
    partners: 'partners_collection_id',
    
    // Content
    massageTypes: 'massage_types_collection_id',
    customLinks: 'custom_links_collection_id',
    imageAssets: 'image_assets',
    loginBackgrounds: 'login_backgrounds',
    translations: 'translations_collection_id',
    
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
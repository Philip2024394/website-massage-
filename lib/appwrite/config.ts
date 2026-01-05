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
    facial_places: import.meta.env.VITE_FACIAL_PLACES_COLLECTION_ID || 'facial_places_collection', // ✅ Text-based collection ID
    users: import.meta.env.VITE_USERS_COLLECTION_ID || '', // ⚠️ DISABLED - Collection doesn't exist
    agents: import.meta.env.VITE_AGENTS_COLLECTION_ID || '', // ⚠️ DISABLED - Collection doesn't exist
    admins: import.meta.env.VITE_ADMINS_COLLECTION_ID || '', // ⚠️ DISABLED - Collection doesn't exist
    bookings: import.meta.env.VITE_BOOKINGS_COLLECTION_ID || 'bookings_collection_id',
    reviews: import.meta.env.VITE_REVIEWS_COLLECTION_ID || 'reviews_collection_id',
    
    // Analytics
    analytics: 'Analytics',
    analyticsEvents: 'Analytics Events',
    agentVisits: 'Agent Visits',
    
    // Communication
    messages: import.meta.env.VITE_MESSAGES_COLLECTION_ID || 'chat_messages',
    notifications: import.meta.env.VITE_NOTIFICATIONS_COLLECTION_ID || '', // ⚠️ DISABLED - Check if collection exists with correct schema
    chatMessages: import.meta.env.VITE_CHAT_MESSAGES_COLLECTION_ID || 'chat_messages',
    chatRooms: import.meta.env.VITE_CHAT_ROOMS_COLLECTION_ID || 'chat_rooms',
    chatAuditLogs: import.meta.env.VITE_CHAT_AUDIT_LOGS_COLLECTION_ID || 'chat_audit_logs',
    chatSessions: import.meta.env.VITE_CHAT_SESSIONS_COLLECTION_ID || 'chat_sessions',
    chatTranslations: 'Chat Translations',
    
    // Business  
    hotels: '', // ⚠️ DISABLED - Collection doesn't exist (causes 404 errors)
    partners: import.meta.env.VITE_PARTNERS_COLLECTION_ID || 'Partners',
    
    // Content
    massageTypes: import.meta.env.VITE_MASSAGE_TYPES_COLLECTION_ID || 'Massage Types',
    customLinks: '', // ⚠️ DISABLED - Collection doesn't exist or lacks permissions (causes 404 errors)
    imageAssets: import.meta.env.VITE_IMAGE_ASSETS_COLLECTION_ID || 'Image Assets',
    loginBackgrounds: import.meta.env.VITE_LOGIN_BACKGROUNDS_COLLECTION_ID || 'Login Backgrounds',
    translations: '', // ⚠️ DISABLED - Collection doesn't exist or lacks permissions (causes 404 errors)
    
    // Pricing & Payments
    membershipPricing: 'Membership Pricing',
    pricing: 'Pricing',
    commissionRecords: 'Commission Records',
    payments: 'Payments',
    
    // Membership & Leads
    leadGenerations: import.meta.env.VITE_LEAD_GENERATIONS_COLLECTION_ID || 'Lead Generations',
    membershipAgreements: import.meta.env.VITE_MEMBERSHIP_AGREEMENTS_COLLECTION_ID || 'Membership Agreements',
    membershipUpgrades: import.meta.env.VITE_MEMBERSHIP_UPGRADES_COLLECTION_ID || 'Membership Upgrades',
    deactivationRequests: import.meta.env.VITE_DEACTIVATION_REQUESTS_COLLECTION_ID || 'Deactivation Requests',
    leads: '', // ⚠️ DISABLED - Collection lacks 'Any' role read permissions (causes 401 errors)
    
    // Jobs
    employerJobPostings: 'Employer Job Postings',
    therapistJobListings: 'Therapist Job Listings',
    therapistMenus: 'therapist_menus',  // ✅ Fixed: was 'Therapist Menus' (with space), now using actual collection ID
    
    // Other
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
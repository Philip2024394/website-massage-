import { Client, Databases, Account, Storage, Functions, ID, Permission, Role, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Export both old and new names for backward compatibility
// Export both old and new names for backward compatibility
export { client, ID, Permission, Role, Query };
export { client as appwriteClient };
export { databases as appwriteDatabases };
export { account as appwriteAccount };
export { storage as appwriteStorage };
export { functions as appwriteFunctions };

// Database and Collection IDs - UPDATED TO REAL PRODUCTION IDs
export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05'; // Alias for validators
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id', // ✅ Text-based collection ID
    PLACES: 'places_collection_id', // ✅ Text-based collection ID
    FACIAL_PLACES: 'facial_places_collection', // ✅ Text-based collection ID
    USERS: '', // ⚠️ DISABLED - Collection doesn't exist
    AGENTS: '', // ⚠️ DISABLED - Collection doesn't exist
    BOOKINGS: 'bookings', // ✅ Production booking collection
    REVIEWS: '', // ⚠️ DISABLED - Collection doesn't exist (causes 404 errors on live site)
    // Achievement System
    ACHIEVEMENTS: 'achievements_collection_id', // ✅ Achievement badges and standards
    THERAPIST_ACHIEVEMENTS: 'therapist_achievements_collection_id', // ✅ Therapist achievement assignments
    // Production Booking System
    THERAPIST_MATCHES: 'therapist_matches', // ✅ Therapist search results  
    CHAT_SESSIONS: 'chat_sessions', // ✅ Active chat sessions
    CHAT_MESSAGES: 'chat_messages', // ✅ Chat messages
    ANALYTICS: '', // ⚠️ DISABLED - Collection doesn't exist
    ANALYTICS_EVENTS: '', // ⚠️ DISABLED - Collection doesn't exist
    ADMINS: '', // ⚠️ DISABLED - Collection doesn't exist
    HOTELS: '', // ⚠️ DISABLED - Collection doesn't exist (causes 404 errors)
    VILLAS: '', // ⚠️ DISABLED - Collection doesn't exist
    PARTNERS: '', // ⚠️ DISABLED - Collection doesn't exist
    NOTIFICATIONS: '', // ⚠️ DISABLED - Collection doesn't exist
    MASSAGE_TYPES: '', // ⚠️ DISABLED - Collection doesn't exist
    MEMBERSHIP_PRICING: '', // ⚠️ DISABLED - Collection doesn't exist
    CUSTOM_LINKS: '', // ⚠️ DISABLED - Collection doesn't exist or lacks permissions (causes 404 errors)
    IMAGE_ASSETS: '', // ⚠️ DISABLED - Collection doesn't exist
    LOGIN_BACKGROUNDS: '', // ⚠️ DISABLED - Collection doesn't exist
    TRANSLATIONS: '', // ⚠️ DISABLED - Collection doesn't exist or lacks permissions (causes 404 errors)
    COMMISSION_RECORDS: '', // ⚠️ DISABLED - Collection doesn't exist
    ATTRIBUTES: '' // ⚠️ DISABLED - Collection doesn't exist
};

// APPWRITE_CONFIG object for backward compatibility
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: DATABASE_ID,
    collections: {
        therapists: COLLECTIONS.THERAPISTS,
        places: COLLECTIONS.PLACES,
        facial_places: COLLECTIONS.FACIAL_PLACES,
        bookings: COLLECTIONS.BOOKINGS,
        therapistsCollection: COLLECTIONS.THERAPISTS,
        usersCollection: COLLECTIONS.USERS,
        placesCollection: COLLECTIONS.PLACES,
        commissionRecords: COLLECTIONS.COMMISSION_RECORDS,
        messages: COLLECTIONS.CHAT_MESSAGES
    }
};

// Storage bucket IDs
// Storage bucket IDs
export const STORAGE_BUCKETS = {
    PARTNER_IMAGES: 'partner_images_bucket',
    THERAPIST_DOCUMENTS: '697b3ca50023d08ec335' // KTP, certificates, documents
};

import { Client, Databases, Account, Storage, ID, Permission, Role, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

// Export both old and new names for backward compatibility
export { client, ID, Permission, Role, Query };
export { client as appwriteClient };
export { databases as appwriteDatabases };
export { account as appwriteAccount };
export { storage as appwriteStorage };

// Database and Collection IDs - UPDATED TO REAL PRODUCTION IDs
export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const COLLECTIONS = {
    THERAPISTS: 'THERAPISTS_COLLECTION_ID', // ✅ Real production collection ID
    PLACES: 'places_collection_id', // ✅ Real production collection ID
    FACIAL_PLACES: 'facial_places_collection', // ✅ Real production collection ID (facial places)
    USERS: 'users_collection_id', // ✅ Real production collection ID
    AGENTS: 'users_collection_id', // Using users collection
    BOOKINGS: 'bookings_collection_id', // ✅ Real production collection ID (NOTE: May not exist in database)
    REVIEWS: '6767020d001f6bafeea2', // Using translations collection as fallback
    ANALYTICS: '6767020d001f6bafeea2', // Using translations collection as fallback
    ANALYTICS_EVENTS: '6767020d001f6bafeea2', // Using translations collection as fallback
    ADMINS: 'users_collection_id', // Using users collection
    HOTELS: 'hotels_collection_id', // ✅ Real production collection ID
    VILLAS: 'hotels_collection_id', // Using hotels collection
    PARTNERS: 'hotels_collection_id', // Using hotels collection
    NOTIFICATIONS: '6767020d001f6bafeea2', // Using translations collection as fallback
    MASSAGE_TYPES: '6767020d001f6bafeea2', // Using translations collection as fallback
    MEMBERSHIP_PRICING: '6767020d001f6bafeea2', // Using translations collection as fallback
    CUSTOM_LINKS: 'custom_links_collection_id', // ✅ Real production collection ID
    IMAGE_ASSETS: 'custom_links_collection_id', // Using custom links collection
    LOGIN_BACKGROUNDS: 'custom_links_collection_id', // Using custom links collection
    TRANSLATIONS: '6767020d001f6bafeea2', // ✅ Real production collection ID
    COMMISSION_RECORDS: '6767020d001f6bafeea2', // Using translations collection as fallback
    ATTRIBUTES: '6767020d001f6bafeea2' // Using translations collection as fallback
};

// Storage bucket IDs
export const STORAGE_BUCKETS = {
    PARTNER_IMAGES: 'partner_images_bucket'
};

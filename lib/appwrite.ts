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

// Database and Collection IDs - REVERTED TO PRODUCTION DATABASE
export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id',
    PLACES: 'places_collection_id',
    USERS: 'users_collection_id', 
    AGENTS: 'agents_collection_id',
    BOOKINGS: 'bookings_collection_id',
    REVIEWS: 'reviews_collection_id',
    ANALYTICS: 'analytics_collection_id',
    ANALYTICS_EVENTS: 'Analytics Events',
    ADMINS: '', // Disabled - collection doesn't exist
    HOTELS: 'hotels_collection_id',
    VILLAS: '', // Disabled - collection doesn't exist
    PARTNERS: 'partners_collection_id', // Hotel & Villa partners
    NOTIFICATIONS: 'notifications_collection_id',
    MASSAGE_TYPES: 'massage_types_collection_id',
    MEMBERSHIP_PRICING: 'membership_pricing_collection_id',
    CUSTOM_LINKS: 'custom_links_collection_id',
    IMAGE_ASSETS: 'image_assets', 
    LOGIN_BACKGROUNDS: 'login_backgrounds',
    TRANSLATIONS: 'translations_collection_id',
    COMMISSION_RECORDS: 'commission_records',
    ATTRIBUTES: 'ATTRIBUTES'
};

// Storage bucket IDs
export const STORAGE_BUCKETS = {
    PARTNER_IMAGES: 'partner_images_bucket'
};

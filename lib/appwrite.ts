import { Client, Databases, Account, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

export { client };

// Database and Collection IDs
export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id',
    PLACES: 'places_collection_id',
    USERS: 'users_collection_id',
    AGENTS: 'agents_collection_id',
    BOOKINGS: 'BOOKINGS_COLLECTION_ID',
    REVIEWS: 'REVIEWS_COLLECTION_ID',
    ANALYTICS: 'analytics',
    ANALYTICS_EVENTS: 'analytics_events',
    ADMINS: 'admins',
    HOTELS: 'hotels_collection_id',
    VILLAS: 'villas',
    NOTIFICATIONS: 'NOTIFICATIONS_COLLECTION_ID',
    MASSAGE_TYPES: 'MASSAGE_TYPES_COLLECTION_ID',
    MEMBERSHIP_PRICING: 'MEMBERSHIP_PRICING_COLLECTION_ID',
    CUSTOM_LINKS: 'CUSTOM_LINKS_COLLECTION_ID',
    IMAGE_ASSETS: 'image_assets',
    LOGIN_BACKGROUNDS: 'login_backgrounds',
    TRANSLATIONS: 'translations_collection_id',
    COMMISSION_RECORDS: 'commission_records'
};

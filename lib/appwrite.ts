import { Client, Databases, Account, Storage, ID, Permission, Role } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

export { client, ID, Permission, Role };

// Database and Collection IDs
export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id',
    PLACES: 'places_collection_id',
    USERS: 'users_collection_id',
    AGENTS: 'agents_collection_id',
    BOOKINGS: 'bookings_collection_id',
    REVIEWS: 'reviews_collection_id',
    ANALYTICS: 'analytics',
    ANALYTICS_EVENTS: 'analytics_events',
    ADMINS: 'admins',
    HOTELS: 'hotels_collection_id',
    VILLAS: 'villas',
    NOTIFICATIONS: 'notifications_collection_id',
    MASSAGE_TYPES: 'massage_types_collection_id',
    MEMBERSHIP_PRICING: 'membership_pricing_collection_id',
    CUSTOM_LINKS: 'custom_links_collection_id',
    IMAGE_ASSETS: 'image_assets',
    LOGIN_BACKGROUNDS: 'login_backgrounds',
    TRANSLATIONS: 'translations_collection_id',
    COMMISSION_RECORDS: 'commission_records',
    ATTRIBUTES: 'attributes'
};

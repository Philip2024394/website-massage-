import { Client, Databases, Account, Storage, ID, Permission, Role } from 'appwrite';
import collectionsMap from './appwrite.collections.json';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

export { client, ID, Permission, Role };

// Database and Collection IDs - REVERTED TO PRODUCTION DATABASE
export const DATABASE_ID = '68f76ee1000e64ca8d05';

const get = (key: string, fallback: string) => {
    const map = (collectionsMap as Record<string, string>) || {};
    return map[key] || fallback;
};

export const COLLECTIONS = {
    THERAPISTS: get('therapists', 'therapists_collection_id'),
    PLACES: get('places', 'places_collection_id'),
    USERS: get('users', 'users_collection_id'),
    AGENTS: get('agents', 'agents_collection_id'),
    PROMOTERS: get('promoters', 'promoters_collection_id'),
    BOOKINGS: get('bookings', 'bookings_collection_id'),
    REVIEWS: get('reviews', 'reviews_collection_id'),
    ANALYTICS: get('analytics', 'analytics_collection_id'),
    ANALYTICS_EVENTS: get('analytics_events', 'Analytics Events'),
    ADMINS: get('admins', ''),
    HOTELS: get('hotels', 'hotels_collection_id'),
    VILLAS: get('villas', ''),
    NOTIFICATIONS: get('notifications', 'notifications_collection_id'),
    MASSAGE_TYPES: get('massage_types', 'massage_types_collection_id'),
    MEMBERSHIP_PRICING: get('membership_pricing', 'membership_pricing_collection_id'),
    CUSTOM_LINKS: get('custom_links', 'custom_links_collection_id'),
    IMAGE_ASSETS: get('image_assets', 'image_assets'),
    LOGIN_BACKGROUNDS: get('login_backgrounds', 'login_backgrounds'),
    TRANSLATIONS: get('translations', 'translations_collection_id'),
    COMMISSION_RECORDS: get('commission_records', 'commission_records'),
    ATTRIBUTES: get('attributes', 'ATTRIBUTES'),
    PROMOTER_PAYOUT_REQUESTS: get('promoter_payout_requests', 'promoter_payout_requests'),
    PROMOTER_TABLE_STAND_ORDERS: get('promoter_table_stand_orders', 'promoter_table_stand_orders')
};

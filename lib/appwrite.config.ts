// Appwrite Configuration
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    
    // Database ID from your Appwrite project
    databaseId: '68f76ee1000e64ca8d05',
    
    // Collection IDs from your Appwrite database
    collections: {
        therapists: 'THERAPISTS_COLLECTION_ID',
        places: 'PLACES_COLLECTION_ID',
        agents: 'AGENTS_COLLECTION_ID',
        bookings: 'BOOKINGS_COLLECTION_ID',
        reviews: 'REVIEWS_COLLECTION_ID',
        notifications: 'NOTIFICATIONS_COLLECTION_ID',
        users: 'USERS_COLLECTION_ID',
        hotels: 'HOTELS_COLLECTION_ID',
        massageTypes: 'MASSAGE_TYPES_COLLECTION_ID',
        membershipPricing: 'MEMBERSHIP_PRICING_COLLECTION_ID',
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: 'custom_links_collection_id',
        translations: 'translations_collection_id',
    },
    
    // Storage bucket ID
    bucketId: '68f76bdd002387590584'
};

export default APPWRITE_CONFIG;

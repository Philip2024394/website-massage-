// Appwrite Configuration
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    
    // Database ID from your Appwrite project
    databaseId: '68f76ee1000e64ca8d05',
    
    // Collection IDs from your Appwrite database
    collections: {
        therapists: 'therapists_collection_id',
        places: 'places_collection_id',
        agents: 'agents_collection_id',
        bookings: 'BOOKINGS_COLLECTION_ID',
        reviews: 'REVIEWS_COLLECTION_ID',
        notifications: 'NOTIFICATIONS_COLLECTION_ID',
        users: 'users_collection_id',
        hotels: 'hotels_collection_id',
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

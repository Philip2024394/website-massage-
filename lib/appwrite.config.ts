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
        bookings: 'bookings_collection_id',
        reviews: 'reviews_collection_id',
        notifications: 'notifications_collection_id',
        users: 'users_collection_id',
        hotels: 'hotels_collection_id',
        massageTypes: 'massage_types_collection_id',
        membershipPricing: 'membership_pricing_collection_id',
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: 'custom_links_collection_id',
        translations: 'translations_collection_id',
        commissionRecords: 'commission_records',
        attributes: 'attributes',
        analyticsEvents: 'analytics_events',
    },
    
    // Storage bucket ID
    bucketId: '68f76bdd002387590584'
};

export default APPWRITE_CONFIG;

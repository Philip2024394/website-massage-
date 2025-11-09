// Appwrite Configuration
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    
    // Database ID from your Appwrite project
    databaseId: '68f76ee1000e64ca8d05',
    
    // Collection IDs from your Appwrite database  
    collections: {
        admins: 'admin_messages',
        therapists: 'therapists_collection_id', // Correct collection ID - WORKING
        places: '', // DISABLED: Collection not found (causes 404 errors)
        agents: '', // DISABLED: Collection not found (causes 404 errors)
        bookings: '', // DISABLED: Collection not found (causes 404 errors)
        reviews: '', // DISABLED: Collection not found (causes 404 errors)
        notifications: '', // DISABLED: Collection not found (causes 404 errors)
        users: '', // DISABLED: Collection not found (causes 404 errors)
        // Keep the rest as-is
        agentVisits: 'agent_visits_collection_id',
        hotelBookings: 'hotel_bookings',
        hotels: 'hotels_collection_id',
        massageTypes: 'massage_types_collection_id',
        membershipPricing: 'membership_pricing_collection_id',
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: 'custom_links_collection_id',
        translations: 'translations_collection_id',
        commissionRecords: 'commission_records',
        attributes: 'ATTRIBUTES',
        analyticsEvents: 'Analytics Events',
        therapistJobListings: 'therapist_job_listings',
        employerJobPostings: 'employer_job_postings',
        bankDetails: 'bank_details',
        paymentTransactions: 'payment_transactions',
        messages: 'messages_collection_id', // NEW: In-app messaging
        packages: 'packages_collection_id', // NEW: Pricing packages
        pushSubscriptions: 'push_subscriptions', // NEW: Push notification subscriptions
        loyaltyWallets: 'loyalty_wallets', // NEW: Customer loyalty coins
        providerLoyaltySettings: 'provider_loyalty_settings', // NEW: Provider discount tiers
        coinTransactions: 'coin_transactions', // NEW: Coin transaction history
        userRegistrations: 'user_registrations', // NEW: Device tracking for welcome bonus
        chatRooms: 'chat_rooms', // NEW: Booking chat rooms
        chatMessages: 'chat_messages', // NEW: Chat messages with translations
        coins: 'coins', // NEW: Coin rewards transactions
        referrals: 'referrals', // NEW: Referral tracking
        activeDiscounts: 'active_discounts', // NEW: Promotional discount system
        appConfig: 'app_config', // NEW: Global app configuration (membership toggle, etc.)
    },
    
    // Storage bucket ID
    bucketId: '68f76bdd002387590584'
};

export default APPWRITE_CONFIG;

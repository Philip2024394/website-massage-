// Appwrite Configuration
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    
    // Database ID from your Appwrite project - PRODUCTION DATABASE
    databaseId: '68f76ee1000e64ca8d05',
    
    // Collection IDs from your Appwrite database  
    collections: {
        admins: '', // Disabled - collection doesn't exist
        therapists: 'therapists_collection_id', // Correct collection ID - WORKING
        places: 'places_collection_id', // REVERTED: Back to original ID
        agents: 'agents_collection_id', // REVERTED: Back to original ID
        bookings: 'bookings_collection_id', // REVERTED: Back to original ID  
        reviews: 'reviews_collection_id', // REVERTED: Back to original ID
        notifications: 'notifications_collection_id', // REVERTED: Back to original ID
        users: 'users_collection_id', // REVERTED: Back to original ID
        // Keep the rest as-is
        agentVisits: 'agent_visits_collection_id',
        hotelBookings: 'hotel_bookings',
        hotels: 'hotels_collection_id',
        villas: '', // Disabled - collection doesn't exist
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
        // NEW: Affiliate tracking
        affiliateClicks: 'affiliate_clicks',
        affiliateAttributions: 'affiliate_attributions',
        // NEW: Membership referrals (promoter-attributed memberships)
        membershipReferrals: 'membership_referrals',
        // NEW: Promoter subsystem (mapped to existing agents collection)
        promoters: 'agents_collection_id',
        promoterPayoutRequests: 'promoter_payout_requests',
        promoterTableStandOrders: 'promoter_table_stand_orders',
    },
    
    // Storage bucket ID
    bucketId: '68f76bdd002387590584'
};

export default APPWRITE_CONFIG;

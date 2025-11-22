// Appwrite Configuration
import collectionsMap from './appwrite.collections.json';

const envGet = (name: string): string | undefined => {
    try {
        // Vite client env
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const viteEnv = (import.meta as any)?.env;
        if (viteEnv && typeof viteEnv[name] !== 'undefined') return String(viteEnv[name]);
    } catch {}
    try {
        // Node env (scripts or SSR paths)
        if (typeof process !== 'undefined' && process.env && name in process.env) return String(process.env[name]);
    } catch {}
    return undefined;
};

const mapGet = (key: string, fallback: string): string => {
    const map = (collectionsMap as Record<string, string>) || {};
    return map[key] || fallback;
};

const resolveCollectionId = (opts: { envVar: string; mapKey: string; fallback: string }): string => {
    return envGet(opts.envVar) || mapGet(opts.mapKey, opts.fallback);
};

const THERAPISTS_ID = resolveCollectionId({
    envVar: 'VITE_APPWRITE_THERAPISTS_COLLECTION_ID',
    mapKey: 'therapists',
    fallback: 'therapists_collection_id'
});

const PLACES_ID = resolveCollectionId({
    envVar: 'VITE_APPWRITE_PLACES_COLLECTION_ID',
    mapKey: 'places',
    // Default to therapists if places map not provided (shared collection in some setups)
    fallback: THERAPISTS_ID || 'therapists_collection_id'
});

export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    
    // Database ID from your Appwrite project - PRODUCTION DATABASE
    databaseId: '68f76ee1000e64ca8d05',
    
    // Collection IDs from your Appwrite database  
    collections: {
        admins: '', // Disabled - collection doesn't exist
        therapists: THERAPISTS_ID,
        places: PLACES_ID,
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
        // NEW: QR usage logging
        qrUsageLogs: 'qr_usage_logs',
        // Marketplace
        marketplaceProducts: 'marketplace_products',
        marketplaceSellers: 'marketplace_sellers',
        // Admin notifications for marketplace events
        adminNotifications: 'admin_notifications',
        // NEW: Memberships (user subscriptions)
        memberships: 'memberships',
        // NEW: Countries (market configuration)
        countries: 'countries'
    },
    
    // Storage bucket ID
    bucketId: '68f76bdd002387590584'
};

export default APPWRITE_CONFIG;

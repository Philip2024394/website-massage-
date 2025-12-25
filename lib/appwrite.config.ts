// ===== APPWRITE DEBUG LOGGING =====
console.log('🔧 APPWRITE CONFIG DEBUG:');
console.log('  📍 Endpoint:', 'https://syd.cloud.appwrite.io/v1');
console.log('  🆔 Project ID:', '68f23b11000d25eb3664');
console.log('  💾 Database ID:', '68f76ee1000e64ca8d05');
console.log('  👥 Therapists Collection ID:', 'THERAPISTS_COLLECTION_ID');

// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBzcGi0AcIHpgJTayMdc06ayS_KwMsDqKU';

// Appwrite Configuration
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    
    // Database ID from your Appwrite project - PRODUCTION DATABASE
    databaseId: '68f76ee1000e64ca8d05',
    
    // Collection IDs from your Appwrite database  
    collections: {
        admins: '', // Disabled - collection doesn't exist
        therapists: 'THERAPISTS_COLLECTION_ID', // ✅ Actual collection name
        places: 'PLACES_COLLECTION_ID', // ✅ Actual collection name
        facial_places: 'facial_places_collection', // ✅ Actual collection name
        agents: 'AGENTS_COLLECTION_ID', // ✅ Actual collection name
        bookings: 'BOOKINGS_COLLECTION_ID', // ✅ Actual collection name
        reviews: 'REVIEWS_COLLECTION_ID', // ✅ Actual collection name
        notifications: 'NOTIFICATIONS_COLLECTION_ID', // ✅ Therapist notification system
        users: 'USERS_COLLECT', // ✅ Actual collection name
        share_links: 'share_links', // ✅ Short URL mappings (#12345 format)
        // Keep the rest as-is
        agentVisits: 'agent_visits',
        hotelBookings: 'hotel_bookings',
        hotels: 'HOTELS_COLLECTION_ID', // ✅ Actual collection name
        cities: '', // Disabled - has spaces in name 'cities collection id' (causes 400 errors)
        villas: '', // Disabled - collection doesn't exist
        massageTypes: 'MASSAGE_TYPES_COLLECTION_ID', // ✅ Actual collection name
        membershipPricing: 'MEMBERSHIP_PRICING_COLLECTION_ID', // ✅ Actual collection name
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: 'CUSTOM_LINKS_COLLECTION_ID', // ✅ Actual collection name
        translations: 'Translations', // ✅ Actual collection name
        commissionRecords: 'commission_records',
        auditLogs: 'audit_logs', // 🔒 Security audit trail for authorization violations
        attributes: 'ATTRIBUTES',
        analyticsEvents: 'analytics_events',
        therapistJobListings: 'therapist_job_listings',
        employerJobPostings: 'employer_job_postings',
        bankDetails: 'bank_details',
        paymentTransactions: 'payment_transactions',
        premiumPayments: 'premium_payments',
        therapistMenus: 'therapist_menus', // 🛡️ CRITICAL: Must use underscores, NOT spaces. 'Therapist Menus' causes 400 errors!
        messages: 'Messages',
        packages: 'Packages',
        pushSubscriptions: 'push_subscriptions',
        loyaltyWallets: 'loyalty_wallets',
        providerLoyaltySettings: 'provider_loyalty_settings',
        coinTransactions: 'coin_transactions',
        userRegistrations: 'user_registrations',
        chatRooms: 'chat_rooms',
        chatMessages: 'chat_messages',
        chatSessions: 'chat_sessions',
        chatTranslations: '', // Disabled - collection doesn't exist (causes 404 errors)
        payments: 'Payments',
        // Lead Generation System
        leads: 'leads', // ✅ Lead generation collection // TODO: Create collection with attributes
        leadGenerations: 'lead_generations',
        leadBillingSummary: 'lead_billing_summary',
        // Membership Agreement System
        membershipAgreements: 'membership_agreements',
        membershipUpgrades: 'membership_upgrades',
        deactivationRequests: 'deactivation_requests',
        coins: 'Coins',
        referrals: 'Referrals',
        activeDiscounts: 'active_discounts',
        appConfig: 'app_config',
        // NEW: Affiliate tracking
        affiliateClicks: 'affiliate_clicks',
        affiliateAttributions: 'affiliate_attributions',
        memberships: 'Memberships',
        uiConfig: '', // Disabled - collection doesn't exist (causes 404 errors)
    },
    
    // Storage bucket IDs
    bucketId: '68f76bdd002387590584', // Main storage bucket
    paymentProofsBucketId: '694d62f4000e59d03e0a', // Payment proof uploads for commission tracking
    facialPlacesBucketId: '6932f43700113926eb80', // Facial places images bucket
    
    // Google Maps Integration
    googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places', 'geometry'],
        region: 'ID', // Indonesia
        language: 'id' // Indonesian
    },
    
    // Country Configuration (for future multi-country expansion)
    country: {
        code: 'ID', // Indonesia
        name: 'Indonesia',
        currency: 'IDR',
        currencySymbol: 'Rp',
        locale: 'id-ID',
        timezone: 'Asia/Jakarta',
        phonePrefix: '+62',
        defaultCity: 'Bali'
    },
    
    // Language Configuration
    languages: {
        admin: 'en', // Admin dashboard: English only
        member: ['en', 'id'], // Member pages: English & Indonesian
        customer: ['en', 'id'] // Customer pages: English & Indonesian
    }
};

// Google Maps utility functions
export const loadGoogleMapsScript = (callback?: () => void) => {
    // If already loaded, call callback immediately
    if ((window as any).google?.maps) {
        console.log('✅ Google Maps already loaded, skipping script injection');
        callback?.();
        return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
        console.log('⏳ Google Maps script already in DOM, waiting for load...');
        if (callback) {
            existingScript.addEventListener('load', callback);
        }
        return;
    }

    console.log('Loading Google Maps API script...');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&region=ID&language=id&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
        console.log('Google Maps script loaded successfully.');
        if (callback) callback();
    };
    script.onerror = () => {
        console.error('❌ Failed to load Google Maps script');
    };
    document.head.appendChild(script);
};

export const isGoogleMapsLoaded = () => {
    return !!(window as any).google?.maps;
};

export const getGoogleMapsApiKey = () => {
    return GOOGLE_MAPS_API_KEY;
};

// Initialize Google Maps for city location functionality
export const initializeGoogleMaps = () => {
    return new Promise<void>((resolve, reject) => {
        if (isGoogleMapsLoaded()) {
            resolve();
            return;
        }
        
        loadGoogleMapsScript(() => {
            console.log('✅ Google Maps loaded for city location system');
            resolve();
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!isGoogleMapsLoaded()) {
                reject(new Error('Google Maps failed to load'));
            }
        }, 10000);
    });
};

export default APPWRITE_CONFIG;

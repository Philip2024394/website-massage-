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
        therapists: 'THERAPISTS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        places: 'PLACES_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        facial_places: 'facial places collection', // ✅ CORRECT - Facial salons/spas collection
        agents: 'AGENTS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        bookings: 'BOOKINGS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        reviews: 'REVIEWS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        notifications: 'NOTIFICATIONS_COLLECTION_ID', // ✅ CORRECT - Therapist notification system
        users: 'USERS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        // Keep the rest as-is
        agentVisits: 'agent_visits_collection_id',
        hotelBookings: 'hotel_bookings',
        hotels: 'HOTELS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        cities: 'cities collection id', // ✅ CORRECT - Cities for location dropdown
        villas: '', // Disabled - collection doesn't exist
        massageTypes: 'MASSAGE_TYPES_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        membershipPricing: 'MEMBERSHIP_PRICING_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: 'CUSTOM_LINKS_COLLECTION_ID', // ✅ CORRECT - Live from Appwrite
        translations: 'translations collection', // ✅ CORRECT - Live from Appwrite
        commissionRecords: 'commission_records',
        attributes: 'ATTRIBUTES',
        analyticsEvents: 'Analytics Events',
        therapistJobListings: 'therapist_job_listings',
        employerJobPostings: 'employer_job_postings',
        bankDetails: 'bank_details',
        paymentTransactions: 'payment_transactions',
        premiumPayments: 'premium_payments',
        therapistMenus: 'therapist_menus',
        messages: 'messages',
        packages: 'packages_collection_id',
        pushSubscriptions: 'push_subscriptions',
        loyaltyWallets: 'loyalty_wallets',
        providerLoyaltySettings: 'provider_loyalty_settings',
        coinTransactions: 'coinTransactions', // ✅ CORRECT - Live from Appwrite
        userRegistrations: 'user_registrations',
        chatRooms: 'chat_rooms', // NEW: Booking chat rooms
        chatMessages: 'chat_messages', // NEW: Chat messages with translations
        chatSessions: 'chat_sessions', // NEW: Persistent chat session management
        chatTranslations: '', // Disabled - collection doesn't exist (causes 404 errors)
        payments: 'payments', // NEW: Therapist payment/earnings tracking
        // Lead Generation System
        leads: '', // Disabled - collection doesn't exist (causes 404 errors)
        leadGenerations: 'lead_generations', // NEW: Pay-per-lead tracking
        leadBillingSummary: 'lead_billing_summary', // NEW: Monthly lead billing
        // Membership Agreement System
        membershipAgreements: 'membership_agreements', // NEW: Membership contracts
        membershipUpgrades: 'membership_upgrades', // NEW: Premium upgrade tracking
        deactivationRequests: 'deactivation_requests', // NEW: Account deactivation
        coins: 'coins', // NEW: Coin rewards transactions
        referrals: 'referrals', // NEW: Referral tracking
        activeDiscounts: 'active_discounts', // NEW: Promotional discount system
        appConfig: 'app_config', // NEW: Global app configuration (membership toggle, etc.)
        // NEW: Affiliate tracking
        affiliateClicks: 'affiliate_clicks',
        affiliateAttributions: 'affiliate_attributions',
        memberships: 'memberships_collection_id', // NEW: Membership packages (Bronze, Silver, Gold)
        uiConfig: 'ui_config', // NEW: UI configuration (book now behavior, schedule behavior)
    },
    
    // Storage bucket IDs
    bucketId: '68f76bdd002387590584', // Main storage bucket
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

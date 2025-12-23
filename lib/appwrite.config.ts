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
        therapists: 'therapists_collection_id', // ✅ Actual collection ID
        places: 'places_collection_id', // ✅ Actual collection ID  
        facial_places: 'facial_places_collection', // ✅ Actual collection ID
        agents: 'Agents', // ✅ Actual collection name
        bookings: 'bookings_collection_id', // ✅ Actual collection ID
        reviews: '', // Disabled - collection doesn't exist (causes 404 errors)
        notifications: 'Notifications', // ✅ Therapist notification system
        users: 'Users', // ✅ Actual collection name
        share_links: 'share_links', // ✅ Short URL mappings (#12345 format)
        // Keep the rest as-is
        agentVisits: 'agent_visits',
        hotelBookings: 'hotel_bookings',
        hotels: 'hotels_collection_id', // ✅ Actual collection ID
        cities: '', // Disabled - collection doesn't exist (causes 404 errors)
        villas: '', // Disabled - collection doesn't exist
        massageTypes: 'massage_types',
        membershipPricing: 'membership_pricing',
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: '67670249000b8becb947', // ✅ Real production collection ID
        translations: '6767020d001f6bafeea2', // ✅ Real production collection ID
        commissionRecords: 'commission_records',
        attributes: 'ATTRIBUTES',
        analyticsEvents: 'analytics_events',
        therapistJobListings: 'therapist_job_listings',
        employerJobPostings: 'employer_job_postings',
        bankDetails: 'bank_details',
        paymentTransactions: 'payment_transactions',
        premiumPayments: 'premium_payments',
        therapistMenus: 'therapist_menus',
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

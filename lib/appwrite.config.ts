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
        therapists: 'therapists_collection_id', // Correct collection ID - WORKING
        places: 'places_collection_id', // REVERTED: Back to original ID
        facial_places: 'facial_places_collection', // Facial salons/spas collection
        agents: 'agents_collection_id', // REVERTED: Back to original ID
        bookings: 'bookings_collection_id', // REVERTED: Back to original ID  
        reviews: 'reviews_collection_id', // REVERTED: Back to original ID
        notifications: 'notifications_collection_id', // REVERTED: Back to original ID
        users: 'users_collection_id', // REVERTED: Back to original ID
        // Keep the rest as-is
        agentVisits: 'agent_visits_collection_id',
        hotelBookings: 'hotel_bookings',
        hotels: 'hotels_collection_id',
        cities: 'cities_collection_id', // NEW: Cities for location dropdown
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
        // Lead Generation System
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

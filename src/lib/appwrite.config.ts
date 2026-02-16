// Google Maps API Configuration
// Handle both Vite (import.meta.env) and Node.js (process.env) environments
const getEnvVar = (key: string, defaultValue: string = ''): string => {
    // Try import.meta.env first (Vite build environment)
    try {
        if (import.meta?.env && (import.meta.env as any)[key]) {
            return (import.meta.env as any)[key];
        }
    } catch (e) {
        // import.meta not available, fall through to process.env
    }
    
    // Fallback to process.env (Node.js/testing environment)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    
    return defaultValue;
};

export const GOOGLE_MAPS_API_KEY = getEnvVar('VITE_GOOGLE_MAPS_API_KEY', '');

// ⚠️ SCHEMA ANCHORED: Using canonical schema from config/appwriteSchema.ts
// ⚠️ NO schema definitions allowed in this file - import only
// ⚠️ This eliminates schema drift and duplicate definitions

import { COLLECTIONS, APPWRITE_DATABASE, SchemaValidator } from '../config/appwriteSchema';
import { VALIDATED_COLLECTIONS, DATABASE_ID } from './appwrite-collection-validator';

// Appwrite Configuration - ANCHORED TO CANONICAL SCHEMA
export const APPWRITE_CONFIG = {
    endpoint: APPWRITE_DATABASE.endpoint,
    projectId: APPWRITE_DATABASE.projectId,
    
    // Database ID from canonical schema - SINGLE SOURCE OF TRUTH
    databaseId: APPWRITE_DATABASE.databaseId,
    
    // ✅ Collection IDs - TEXT-BASED ONLY (numeric hashes blocked)
    collections: {
        // CANONICAL SCHEMA COLLECTIONS - SINGLE SOURCE OF TRUTH
        admins: null, // ⚠️ DISABLED - Collection doesn't exist
        therapists: VALIDATED_COLLECTIONS.therapists,
        places: null, // ⚠️ DISABLED - Optional feature, collection not configured (prevents 404 errors)
        facial_places: 'facial_places_collection', // ✅ Text-based collection ID
        agents: null, // ⚠️ DISABLED - Collection doesn't exist
        bookings: SchemaValidator.getCollectionId('BOOKINGS'),
        reviews: VALIDATED_COLLECTIONS.reviews,
        notifications: VALIDATED_COLLECTIONS.notifications,
        users: VALIDATED_COLLECTIONS.users,
        // Production Booking System Collections
        booking_acknowledgments: 'booking_acknowledgments', // ✅ Therapist response tracking
        therapist_matches: 'therapist_matches', // ✅ Therapist search results
        chat_sessions: 'chat_sessions', // ✅ Active chat sessions
        share_links: 'share_links', // ✅ Short URL mappings (#12345 format)
        // Keep the rest as-is
        agentVisits: 'agent_visits',
        hotelBookings: 'hotel_bookings',
        hotels: null, // ⚠️ DISABLED - Collection doesn't exist or lacks permissions (causes 401 errors). To fix: Create collection or set permissions in Appwrite Console
        cities: null, // Disabled - collection doesn't exist (causes 404 errors)
        villas: null, // Disabled - collection doesn't exist
        massageTypes: 'massage_types',
        membershipPricing: 'membership_pricing',
        imageAssets: 'image_assets',
        loginBackgrounds: 'login_backgrounds',
        customLinks: 'custom_links_collection_id', // ✅ CONNECTED - Custom drawer menu links
        translations: null, // ⚠️ DISABLED - Collection doesn't exist or lacks permissions (causes 404 errors)
        commissionRecords: 'commission_records',
        attributes: 'ATTRIBUTES',
        analyticsEvents: 'analytics_events',
        therapistJobListings: 'therapist_job_listings',
        employerJobPostings: 'employer_job_postings',
        employerProfiles: 'employer_profiles',
        bankDetails: 'bank_details',
        paymentTransactions: 'payment_transactions',
        premiumPayments: 'premium_payments',
        therapistMenus: 'therapist_menus', // 🛡️ CRITICAL: Must use underscores, NOT spaces. 'Therapist Menus' causes 400 errors!
        messages: SchemaValidator.getCollectionId('MESSAGES'), // 🔒 SCHEMA ANCHORED
        packages: 'Packages',
        pushSubscriptions: 'push_subscriptions',
        loyaltyWallets: 'loyalty_wallets',
        providerLoyaltySettings: 'provider_loyalty_settings',
        coinTransactions: 'coin_transactions',
        userRegistrations: 'user_registrations',
        chatRooms: VALIDATED_COLLECTIONS.chat_rooms,
        chatMessages: SchemaValidator.getCollectionId('CHAT_MESSAGES'), // 🔒 SCHEMA ANCHORED
        chatAuditLogs: 'chat_audit_logs',
        chatSessions: 'chat_sessions',
        chatTranslations: null, // Disabled - collection doesn't exist (causes 404 errors)
        booking_locations: 'booking_locations', // ✅ Location verification system
        payments: 'Payments', // ⚠️ WARNING: May have permission issues (401 Unauthorized). To fix: Set 'Any' role permissions in Appwrite Console
        // Lead Generation System
        leads: null, // ⚠️ DISABLED - Collection lacks 'Any' role read permissions (causes 401 errors)
        leadGenerations: 'lead_generations',
        leadBillingSummary: 'lead_billing_summary',
        // Membership Agreement System
        membershipAgreements: 'membership_agreements',
        membershipUpgrades: 'membership_upgrades',
        deactivationRequests: 'deactivation_requests',
        contactInquiries: 'contact_inquiries', // Contact/support form submissions
        indastreetNews: 'indastreet_news', // Indastreet News – massage & skin clinic headlines
        indastreetBlog: 'indastreet_blog', // Indastreet Blog – articles for blog index & view post
        coins: 'Coins',
        referrals: 'Referrals',
        activeDiscounts: 'active_discounts',
        appConfig: 'app_config',
        // NEW: Affiliate tracking
        affiliateClicks: 'affiliate_clicks',
        affiliateAttributions: 'affiliate_attributions',
        memberships: 'Memberships',
        uiConfig: null, // Disabled - collection doesn't exist (causes 404 errors)
    },
    
    // Storage bucket IDs
    bucketId: '68f76bdd002387590584', // Main storage bucket
    facialPlacesBucketId: '6932f43700113926eb80', // Facial places images bucket
    blogImagesBucketId: getEnvVar('VITE_APPWRITE_BLOG_BUCKET_ID', 'bogimages'), // Blog hero/in-article images (Appwrite Storage bucket)
    
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
        phonePrefix: '+62'
        // ⚠️ NO defaultCity - IP-based location intentionally disabled due to inaccuracy in Indonesia.
        // Users MUST select city manually via CitySelectionPage.
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
        
        const apiKey = getGoogleMapsApiKey();
        loadGoogleMapsScript(apiKey, () => {
            console.log('✅ Google Maps loaded for city location system');
            resolve();
        }, () => {
            reject(new Error('Google Maps failed to load'));
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


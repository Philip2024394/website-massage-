/**
 * Data Feed Configuration
 * Secure configuration for therapist and places data feed operations
 * 
 * This configuration centralizes API key management for:
 * - Therapist data feeds
 * - Places data feeds
 * - Server-side data synchronization
 * - Admin dashboard backend operations
 */

// Get API key from environment
const APPWRITE_API_KEY = import.meta.env.VITE_APPWRITE_API_KEY || 
                         import.meta.env.APPWRITE_API_KEY || 
                         process.env.APPWRITE_API_KEY;

// Validate API key presence
if (!APPWRITE_API_KEY && typeof process !== 'undefined' && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ APPWRITE_API_KEY not set in environment variables');
}

export const DATA_FEED_CONFIG = {
    // API Configuration
    apiKey: APPWRITE_API_KEY,
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05',
    
    // Collection IDs
    collections: {
        therapists: import.meta.env.VITE_THERAPISTS_COLLECTION_ID || 'therapists_collection_id',
        places: import.meta.env.VITE_PLACES_COLLECTION_ID || '6767038a003b7bdff200',
        facialPlaces: import.meta.env.VITE_FACIAL_PLACES_COLLECTION_ID || '67670371000c0bef1447',
        bookings: import.meta.env.VITE_BOOKINGS_COLLECTION_ID || 'bookings_collection_id',
    },
    
    // Data Feed Settings
    feedSettings: {
        // Refresh intervals (in milliseconds)
        therapistFeedInterval: 5 * 60 * 1000, // 5 minutes
        placesFeedInterval: 5 * 60 * 1000,    // 5 minutes
        
        // Batch processing limits
        batchSize: 100,
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        
        // Cache settings
        cacheEnabled: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
    },
    
    // Security settings
    security: {
        // Only use API key for server-side operations
        isServerSide: typeof window === 'undefined',
        
        // Enable rate limiting
        rateLimitEnabled: true,
        rateLimitPerMinute: 60,
    },
} as const;

// Helper function to check if API key is configured
export const isApiKeyConfigured = (): boolean => {
    return !!DATA_FEED_CONFIG.apiKey && DATA_FEED_CONFIG.apiKey !== 'your_api_key_here';
};

// Helper function to get API headers
export const getApiHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': DATA_FEED_CONFIG.projectId,
    };
    
    // Only include API key if configured and running server-side
    if (isApiKeyConfigured() && DATA_FEED_CONFIG.security.isServerSide) {
        headers['X-Appwrite-Key'] = DATA_FEED_CONFIG.apiKey!;
    }
    
    return headers;
};

// Log configuration status (without exposing the key)
console.log('🔐 Data Feed Configuration Status:', {
    apiKeyConfigured: isApiKeyConfigured(),
    endpoint: DATA_FEED_CONFIG.endpoint,
    projectId: DATA_FEED_CONFIG.projectId,
    isServerSide: DATA_FEED_CONFIG.security.isServerSide,
    collections: Object.keys(DATA_FEED_CONFIG.collections),
});

export default DATA_FEED_CONFIG;

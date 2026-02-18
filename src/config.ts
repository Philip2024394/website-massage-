// App configuration
export const APP_CONFIG = {
    // Set to 'mock' to use mock data, 'appwrite' to use Appwrite backend
    DATA_SOURCE: 'mock' as 'mock' | 'appwrite',
    
    // Appwrite configuration
    APPWRITE: {
        ENDPOINT: 'https://syd.cloud.appwrite.io/v1',
        PROJECT_ID: '68f23b11000d25eb3664',
        DATABASE_ID: '68f76ee1000e64ca8d05'
    },
    
    // App settings
    DEFAULT_LANGUAGE: 'en' as 'en' | 'id',
    DEFAULT_CONTACT_NUMBER: '6281392000050',
    
    // Feature flags
    FEATURES: {
        GOOGLE_MAPS: true,
        PUSH_NOTIFICATIONS: true,
        ADMIN_DASHBOARD: true,
        AGENT_SYSTEM: true
    },

    /** When true, all booking goes via WhatsApp only; in-app chat/booking UI is disabled. */
    IN_APP_BOOKING_DISABLED: true,
};

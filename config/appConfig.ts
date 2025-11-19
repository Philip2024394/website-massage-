/**
 * Application Configuration
 * Central configuration constants for the app
 */

export const APP_CONFIG = {
    // Contact Information
    CONTACT_NUMBER: '6281392000050',
    
    // Timeouts
    DATA_FETCH_TIMEOUT: 10000, // 10 seconds
    
    // Version
    VERSION: '2024-10-31-10:15:00-SESSION-FIX',

    // Appwrite Configuration
    APPWRITE: {
        ENDPOINT: 'https://syd.cloud.appwrite.io/v1',
        PROJECT_ID: '68f23b11000d25eb3664',
        bucketId: '68f76bdd002387590584',
    },

    // Marketplace Seller Plans
    SELLER_TRIAL_DAYS: 30,
    SELLER_LOCAL_PLAN_PRICE_LABEL: '£10/month',
    SELLER_GLOBAL_PLAN_PRICE_LABEL: '£14.99/month',
    // Set your Stripe Payment Link URLs here (or via Vite envs for CheckoutButton)
    SELLER_LOCAL_PLAN_PAYMENT_LINK: '', // e.g., 'https://buy.stripe.com/abc123local'
    SELLER_GLOBAL_PLAN_PAYMENT_LINK: '', // e.g., 'https://buy.stripe.com/xyz789global'
} as const;

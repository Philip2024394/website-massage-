// App configuration
const ENV: any = (import.meta as any)?.env || {};
export const APP_CONFIG = {
    // Set to 'mock' to use mock data, 'appwrite' to use Appwrite backend
    DATA_SOURCE: 'appwrite' as 'mock' | 'appwrite',
    
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
    
    // Marketplace/Seller plans
    MARKETPLACE: {
        SELLER_TRIAL_DAYS: 30,
        SELLER_LOCAL_PRICE_LABEL: '£10/mo (Local, up to 50 products)',
        SELLER_GLOBAL_PRICE_LABEL: '£14.99/mo (Global, unlimited)',
        STRIPE_PAYMENT_LINK_LOCAL: ENV.VITE_STRIPE_PAYMENT_LINK_LOCAL || '',
        STRIPE_PAYMENT_LINK_GLOBAL: ENV.VITE_STRIPE_PAYMENT_LINK_GLOBAL || ''
    },

    // Membership plans (placeholders; configure Payment Links in env)
    MEMBERSHIPS: {
        PLANS: [
            {
                key: 'basic',
                name: 'Basic',
                priceLabel: '£4.99/mo',
                paymentLink: ENV.VITE_STRIPE_PAYMENT_LINK_MEMBER_BASIC || '',
                features: ['Member badge', 'Priority chat']
            },
            {
                key: 'pro',
                name: 'Pro',
                priceLabel: '£9.99/mo',
                paymentLink: ENV.VITE_STRIPE_PAYMENT_LINK_MEMBER_PRO || '',
                features: ['Everything in Basic', 'Exclusive offers']
            },
            {
                key: 'premium',
                name: 'Premium',
                priceLabel: '£14.99/mo',
                paymentLink: ENV.VITE_STRIPE_PAYMENT_LINK_MEMBER_PREMIUM || '',
                features: ['Everything in Pro', 'VIP support']
            }
        ],
        // Appwrite collection to store membership status (create and set in env)
        DATABASE_ID: ENV.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05',
        COLLECTION_ID: ENV.VITE_APPWRITE_MEMBERSHIPS_COLLECTION_ID || ''
    }
};
/**
 * E2E Test Environment Setup
 * Provides mock environment variables for tests
 */

// Mock import.meta for Node.js test environment
(globalThis as any).import = {
    meta: {
        env: {
            VITE_GOOGLE_MAPS_API_KEY: 'test-google-maps-key',
            VITE_APPWRITE_PROJECT_ID: '68f23b11000d25eb3664',
            VITE_APPWRITE_DATABASE_ID: 'default',
            VITE_APPWRITE_ENDPOINT: 'https://syd.cloud.appwrite.io/v1',
        }
    }
};

// Also set process.env for good measure
process.env.VITE_GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
process.env.VITE_APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';

console.log('✅ Test environment configured');

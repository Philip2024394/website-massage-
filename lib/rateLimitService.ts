/**
 * Rate limiting and retry utilities for Appwrite API calls
 */

// Enhanced development mode detection
const isDevelopment = (() => {
    const checks = {
        importMeta: import.meta.env?.DEV || import.meta.env?.MODE === 'development',
        nodeEnv: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
        hostname: typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('localhost') ||
            window.location.port === '3000' ||
            window.location.port === '3001' ||
            window.location.port === '3003'
        ),
        url: typeof window !== 'undefined' && window.location.href.includes('localhost')
    };
    
    const result = checks.importMeta || checks.nodeEnv || checks.hostname || checks.url;
    
    console.log('🔍 Development mode detection:', {
        checks,
        result,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        port: typeof window !== 'undefined' ? window.location.port : 'N/A',
        href: typeof window !== 'undefined' ? window.location.href : 'N/A'
    });
    
    return result;
})();

interface RateLimitConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxRetries: isDevelopment ? 5 : 3, // More retries in dev
    baseDelay: isDevelopment ? 500 : 1000, // Shorter delays in dev
    maxDelay: isDevelopment ? 5000 : 10000, // Shorter max delays in dev
    backoffMultiplier: 2
};

// Track recent API calls to prevent flooding
const apiCallTracker = new Map<string, number[]>();
const MAX_CALLS_PER_MINUTE = isDevelopment ? 100 : 30; // Much higher limit in dev
const CALL_WINDOW_MS = 60000; // 1 minute

/**
 * Check if we're hitting rate limits
 */
export function isRateLimited(endpoint: string): boolean {
    // In development, be much more lenient
    if (isDevelopment) {
        return false; // Disable rate limiting completely in dev
    }
    
    const now = Date.now();
    const calls = apiCallTracker.get(endpoint) || [];
    
    // Remove calls older than 1 minute
    const recentCalls = calls.filter(timestamp => now - timestamp < CALL_WINDOW_MS);
    
    // Update tracker
    apiCallTracker.set(endpoint, recentCalls);
    
    return recentCalls.length >= MAX_CALLS_PER_MINUTE;
}

/**
 * Track API call
 */
export function trackApiCall(endpoint: string): void {
    const now = Date.now();
    const calls = apiCallTracker.get(endpoint) || [];
    calls.push(now);
    apiCallTracker.set(endpoint, calls);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff delay calculator
 */
function calculateDelay(attempt: number, config: RateLimitConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
}

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error: any): boolean {
    return error?.code === 429 || 
           error?.status === 429 || 
           error?.message?.includes('429') ||
           error?.message?.includes('rate limit') ||
           error?.message?.includes('Too Many Requests');
}

/**
 * Retry wrapper for Appwrite API calls with exponential backoff
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    endpoint: string,
    config: RateLimitConfig = DEFAULT_CONFIG
): Promise<T> {
    let lastError: any;

    // Check for manual override or development mode
    const isDevMode = isDevelopment || (window as any).FORCE_DEV_MODE;

    // Enhanced development mode bypass with extensive logging
    if (isDevMode) {
        console.log(`🛠️ DEV MODE: Completely bypassing rate limits for ${endpoint}`);
        console.log(`🛠️ DEV MODE: isDevelopment = ${isDevelopment}, FORCE_DEV_MODE = ${(window as any).FORCE_DEV_MODE}`);
        
        try {
            const result = await operation();
            console.log(`✅ DEV MODE: ${endpoint} completed successfully without rate limiting`);
            return result;
        } catch (error) {
            console.log(`⚠️ DEV MODE: ${endpoint} failed with error:`, error);
            
            // If it's a rate limit error in dev mode, wait briefly and try once more
            if (isRateLimitError(error)) {
                console.log(`🔄 DEV MODE: Rate limit detected for ${endpoint}, retrying once more after brief delay...`);
                await sleep(2000); // 2 second delay
                
                try {
                    const retryResult = await operation();
                    console.log(`✅ DEV MODE: ${endpoint} succeeded on retry`);
                    return retryResult;
                } catch (retryError) {
                    console.error(`❌ DEV MODE: ${endpoint} failed even on retry:`, retryError);
                    throw retryError;
                }
            }
            
            // Non-rate-limit error, throw immediately
            throw error;
        }
    }

    console.log(`🏭 PRODUCTION MODE: Using rate limiting for ${endpoint}`);

    // Check rate limit before attempting (production only)
    if (isRateLimited(endpoint)) {
        console.warn(`⚠️ Rate limited for endpoint: ${endpoint}. Waiting...`);
        await sleep(5000); // Wait 5 seconds if rate limited
    }

    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
        try {
            // Track the API call
            trackApiCall(endpoint);
            
            const result = await operation();
            
            // Success! Reset any backoff tracking
            if (attempt > 1) {
                console.log(`✅ Operation succeeded on attempt ${attempt} for ${endpoint}`);
            }
            
            return result;
        } catch (error) {
            lastError = error;
            
            // Check if this is a rate limit error
            if (isRateLimitError(error)) {
                console.warn(`🚫 Rate limit hit for ${endpoint} (attempt ${attempt})`);
                
                if (attempt <= config.maxRetries) {
                    const delay = calculateDelay(attempt, config);
                    console.log(`⏳ Retrying ${endpoint} in ${delay}ms (attempt ${attempt}/${config.maxRetries})`);
                    await sleep(delay);
                    continue;
                }
            } else {
                // Not a rate limit error, don't retry
                console.error(`❌ Non-rate-limit error for ${endpoint}:`, error);
                throw error;
            }
        }
    }

    // All retries exhausted
    console.error(`❌ All retries exhausted for ${endpoint}`, lastError);
    throw lastError;
}

/**
 * Wrapper for database operations with rate limiting
 */
export class RateLimitedDatabaseService {
    async listDocuments(databases: any, databaseId: string, collectionId: string, queries?: string[]): Promise<any> {
        const endpoint = `listDocuments_${collectionId}`;
        
        return retryWithBackoff(
            () => databases.listDocuments(databaseId, collectionId, queries),
            endpoint
        );
    }

    async createDocument(databases: any, databaseId: string, collectionId: string, documentId: string, data: any, permissions?: string[]): Promise<any> {
        const endpoint = `createDocument_${collectionId}`;
        
        return retryWithBackoff(
            () => databases.createDocument(databaseId, collectionId, documentId, data, permissions),
            endpoint
        );
    }

    async updateDocument(databases: any, databaseId: string, collectionId: string, documentId: string, data: any, permissions?: string[]): Promise<any> {
        const endpoint = `updateDocument_${collectionId}`;
        
        return retryWithBackoff(
            () => databases.updateDocument(databaseId, collectionId, documentId, data, permissions),
            endpoint
        );
    }

    async deleteDocument(databases: any, databaseId: string, collectionId: string, documentId: string): Promise<any> {
        const endpoint = `deleteDocument_${collectionId}`;
        
        return retryWithBackoff(
            () => databases.deleteDocument(databaseId, collectionId, documentId),
            endpoint
        );
    }

    async getDocument(databases: any, databaseId: string, collectionId: string, documentId: string): Promise<any> {
        const endpoint = `getDocument_${collectionId}`;
        
        return retryWithBackoff(
            () => databases.getDocument(databaseId, collectionId, documentId),
            endpoint
        );
    }
}

export const rateLimitedDb = new RateLimitedDatabaseService();

// Development helpers - available immediately
console.log('🛠️ DEV MODE: Rate limiting is COMPLETELY DISABLED for development');
console.log('💡 Available helpers in console:');
console.log('   - clearApiCallTracker() - Clear API call tracker');
console.log('   - disableRateLimiting() - Disable all rate limiting');
console.log('   - resetAllRateLimits() - Reset all rate limit counters');
console.log('   - forceDevMode() - Force development mode override');

// Make helpers available globally, not just in development
(window as any).clearApiCallTracker = () => {
    apiCallTracker.clear();
    console.log('🔄 API call tracker cleared');
};

(window as any).disableRateLimiting = () => {
    console.log('🚫 Rate limiting disabled manually');
    // Override the development flag temporarily
    (window as any).FORCE_DEV_MODE = true;
};

(window as any).resetAllRateLimits = () => {
    apiCallTracker.clear();
    console.log('🔄 All rate limits reset');
};

(window as any).forceDevMode = () => {
    (window as any).FORCE_DEV_MODE = true;
    console.log('🛠️ Development mode FORCED ON');
};
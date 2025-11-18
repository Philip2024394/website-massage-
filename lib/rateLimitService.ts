/**
 * Rate limiting and retry utilities for Appwrite API calls
 */

interface RateLimitConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

// Read Vite env if available (works in browser and Vite dev)
let __env: any = {};
try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta is a Vite/ESM runtime feature
    __env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
} catch {
    __env = {};
}
const DISABLE_RATE_LIMIT = __env?.VITE_DISABLE_RATE_LIMIT === 'true';

const DEFAULT_CONFIG: RateLimitConfig = {
    maxRetries: DISABLE_RATE_LIMIT ? 0 : (Number(__env?.VITE_RATE_MAX_RETRIES) || 3),
    baseDelay: Number(__env?.VITE_RATE_BASE_DELAY) || (DISABLE_RATE_LIMIT ? 50 : 1000), // ms
    maxDelay: Number(__env?.VITE_RATE_MAX_DELAY) || 10000, // ms
    backoffMultiplier: Number(__env?.VITE_RATE_BACKOFF_MULTIPLIER) || 2
};

// Track recent API calls to prevent flooding
const apiCallTracker = new Map<string, number[]>();
const MAX_CALLS_PER_MINUTE = DISABLE_RATE_LIMIT ? Number.MAX_SAFE_INTEGER : (Number(__env?.VITE_RATE_MAX_CALLS_PER_MIN) || 30);
const CALL_WINDOW_MS = Number(__env?.VITE_RATE_CALL_WINDOW_MS) || 60000; // ms

/**
 * Check if we're hitting rate limits
 */
export function isRateLimited(endpoint: string): boolean {
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

    // Check rate limit before attempting
    if (!DISABLE_RATE_LIMIT && isRateLimited(endpoint)) {
        console.warn(`⚠️ Rate limited for endpoint: ${endpoint}. Waiting...`);
        await sleep(Number(__env?.VITE_RATE_PREWAIT_MS) || 5000); // Wait before retry
    }

    for (let attempt = 1; attempt <= (config.maxRetries + 1); attempt++) {
        try {
            // Track the API call
            if (!DISABLE_RATE_LIMIT) trackApiCall(endpoint);
            
            const result = await operation();
            
            // Success! Reset any backoff tracking
            if (attempt > 1) {
                console.log(`✅ Operation succeeded on attempt ${attempt} for ${endpoint}`);
            }
            
            return result;
        } catch (error) {
            lastError = error;
            
            // Check if this is a rate limit error
            if (!DISABLE_RATE_LIMIT && isRateLimitError(error)) {
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
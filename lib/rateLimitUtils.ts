/**
 * Rate Limiting Utility
 * Helps manage Appwrite rate limits and provides user-friendly error handling
 */

interface RateLimitTracker {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const rateLimitTracker: RateLimitTracker = {};

/**
 * Check if an operation should be rate limited
 */
export function checkRateLimit(operation: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    // Dev bypass via Vite env flag
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - import.meta.env exists in Vite runtime
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DISABLE_RATE_LIMIT === 'true') {
            return true;
        }
    } catch {}

    const now = Date.now();
    const key = operation;
    
    if (!rateLimitTracker[key]) {
        rateLimitTracker[key] = { count: 0, resetTime: now + windowMs };
    }
    
    const tracker = rateLimitTracker[key];
    
    // Reset counter if window has expired
    if (now >= tracker.resetTime) {
        tracker.count = 0;
        tracker.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (tracker.count >= maxAttempts) {
        return false; // Rate limited
    }
    
    tracker.count++;
    return true; // Allowed
}

/**
 * Get time until rate limit reset
 */
export function getTimeUntilReset(operation: string): number {
    const tracker = rateLimitTracker[operation];
    if (!tracker) return 0;
    
    const now = Date.now();
    return Math.max(0, tracker.resetTime - now);
}

/**
 * Format rate limit error message
 */
export function formatRateLimitError(operation: string): string {
    const timeUntilReset = getTimeUntilReset(operation);
    const minutes = Math.ceil(timeUntilReset / 60000);
    
    // If less than 1 minute, show seconds
    if (timeUntilReset < 60000) {
        const seconds = Math.ceil(timeUntilReset / 1000);
        return `Too many ${operation} attempts. Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.`;
    }
    
    return `Too many ${operation} attempts. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`;
}

/**
 * Reset rate limit for a specific operation (useful for testing)
 */
export function resetRateLimit(operation: string): void {
    delete rateLimitTracker[operation];
    console.log(`🔄 Rate limit reset for: ${operation}`);
}

/**
 * Reset all rate limits (useful for testing)
 */
export function resetAllRateLimits(): void {
    Object.keys(rateLimitTracker).forEach(key => delete rateLimitTracker[key]);
    console.log('🔄 All rate limits reset');
}

/**
 * Handle Appwrite errors with rate limiting context
 */
export function handleAppwriteError(error: any, operation: string): string {
    console.error(`Appwrite ${operation} error:`, error);
    
    // Rate limit error
    if (error.code === 429 || error.message?.includes('rate limit')) {
        return formatRateLimitError(operation);
    }
    
    // User already exists
    if (error.code === 409 || error.message?.includes('already exists')) {
        return 'An account with this email already exists. Please sign in instead.';
    }
    
    // Invalid credentials
    if (error.code === 401) {
        return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    // Network or server errors
    if (error.code >= 500) {
        return 'Server error. Please try again in a few moments.';
    }
    
    // Default error message
    return error.message || `${operation} failed. Please try again.`;
}

/**
 * Delay execution to avoid hitting rate limits
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    // Dev bypass and tuning via Vite env
    let effectiveMaxRetries = maxRetries;
    let effectiveBaseDelay = baseDelay;
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - import.meta.env exists in Vite runtime
        const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : undefined;
        if (env) {
            if (env.VITE_DISABLE_RATE_LIMIT === 'true') {
                effectiveMaxRetries = 0;
                effectiveBaseDelay = 50;
            } else {
                if (env.VITE_RATE_MAX_RETRIES) effectiveMaxRetries = Number(env.VITE_RATE_MAX_RETRIES) || effectiveMaxRetries;
                if (env.VITE_RATE_BASE_DELAY) effectiveBaseDelay = Number(env.VITE_RATE_BASE_DELAY) || effectiveBaseDelay;
            }
        }
    } catch {}

    let lastError: any;
    
    for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            
            // Don't retry on certain errors
            if (error.code === 401 || error.code === 409) {
                throw error;
            }
            
            // If this was the last attempt, throw the error
            if (attempt === effectiveMaxRetries) {
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            const delayMs = effectiveBaseDelay * Math.pow(2, attempt);
            console.log(`Retrying operation in ${delayMs}ms (attempt ${attempt + 1}/${effectiveMaxRetries + 1})`);
            await delay(delayMs);
        }
    }
    
    throw lastError;
}
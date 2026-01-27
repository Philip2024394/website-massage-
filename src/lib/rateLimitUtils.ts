/**
 * Rate Limiting Utility
 * Helps manage Appwrite rate limits and provides user-friendly error handling
 */

// Development mode detection
const isDevelopment = import.meta.env?.DEV || process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

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
    // In development mode, be much more lenient with rate limiting
    if (isDevelopment) {
        console.log(`🛠️ DEV MODE: Rate limiting relaxed for ${operation}`);
        maxAttempts = maxAttempts * 10; // 10x more attempts allowed
        windowMs = windowMs / 10; // 10x shorter reset window
    }
    
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
        if (isDevelopment) {
            console.log(`⚠️ DEV MODE: Still rate limited for ${operation}, but with relaxed limits`);
        }
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
 * Development helper: Completely disable rate limiting temporarily
 */
export function disableRateLimiting(): void {
    if (isDevelopment) {
        // Override checkRateLimit to always return true
        (window as any).originalCheckRateLimit = checkRateLimit;
        (window as any).checkRateLimit = () => true;
        console.log('🛠️ DEV MODE: Rate limiting DISABLED for this session');
        console.log('💡 To re-enable: Call enableRateLimiting() in console');
    } else {
        console.warn('⚠️ Rate limiting can only be disabled in development mode');
    }
}

/**
 * Development helper: Re-enable rate limiting
 */
export function enableRateLimiting(): void {
    if (isDevelopment && (window as any).originalCheckRateLimit) {
        delete (window as any).checkRateLimit;
        console.log('🛠️ DEV MODE: Rate limiting ENABLED');
    }
}

// Make development helpers globally available
if (isDevelopment) {
    (window as any).resetAllRateLimits = resetAllRateLimits;
    (window as any).disableRateLimiting = disableRateLimiting;
    (window as any).enableRateLimiting = enableRateLimiting;
    (window as any).resetRateLimit = resetRateLimit;
    
    console.log('🛠️ DEV MODE: Rate limit helpers available:');
    console.log('   - resetAllRateLimits() - Reset all rate limits');
    console.log('   - disableRateLimiting() - Completely disable rate limiting');
    console.log('   - enableRateLimiting() - Re-enable rate limiting');
    console.log('   - resetRateLimit("operation") - Reset specific operation');
}

/**
 * Handle Appwrite errors with rate limiting context
 */
export function handleAppwriteError(error: any, operation: string): string {
    console.error(`Appwrite ${operation} error:`, error);
    
    const errorMessage = error?.message || '';
    const errorCode = error?.code;
    
    // Rate limit errors
    if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('Too many requests')) {
        return formatRateLimitError(operation);
    }
    
    // User already exists
    if (errorCode === 409 || errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        return '📧 An account with this email already exists. Please sign in instead.';
    }
    
    // Invalid credentials - Most common login error
    if (errorCode === 401 || errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid_credentials')) {
        return '❌ Incorrect email or password. Please check your credentials and try again.';
    }
    
    // Account blocked
    if (errorMessage.includes('blocked') || errorMessage.includes('disabled') || errorMessage.includes('User (role: guests) missing scope')) {
        return '🚫 Your account has been blocked or disabled. Please contact support at indastreet.id@gmail.com for assistance.';
    }
    
    // Email not found
    if (errorMessage.includes('not found') || errorMessage.includes('user not found') || errorCode === 404) {
        return '📧 No account found with this email. Please check your email or sign up first.';
    }
    
    // Password too weak
    if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('short') || errorMessage.includes('minimum'))) {
        return '🔒 Password must be at least 8 characters long. Please choose a stronger password.';
    }
    
    // Invalid email format
    if (errorMessage.includes('email') && (errorMessage.includes('invalid') || errorMessage.includes('format'))) {
        return '📧 Invalid email format. Please enter a valid email address.';
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        return '🌐 Network error. Please check your internet connection and try again.';
    }
    
    // Server errors (500+)
    if (errorCode >= 500) {
        return '🔧 Server error. Please try again in a few moments.';
    }
    
    // Session errors
    if (errorMessage.includes('session') && errorMessage.includes('invalid')) {
        return '⏱️ Your session has expired. Please sign in again.';
    }
    
    // Default error message - be more helpful
    if (errorMessage) {
        // Clean up the error message - remove technical jargon
        const cleanMessage = errorMessage
            .replace(/AppwriteException:/gi, '')
            .replace(/Error:/gi, '')
            .trim();
        return `❌ ${cleanMessage}`;
    }
    
    return `❌ ${operation} failed. Please try again or contact support at indastreet.id@gmail.com if the problem persists.`;
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
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            
            // Don't retry on certain errors
            if (error.code === 401 || error.code === 409) {
                throw error;
            }
            
            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            const delayMs = baseDelay * Math.pow(2, attempt);
            console.log(`Retrying operation in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
            await delay(delayMs);
        }
    }
    
    throw lastError;
}
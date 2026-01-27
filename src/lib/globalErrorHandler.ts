/**
 * Global error handler for Appwrite API errors including rate limiting
 */

interface ErrorNotification {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: number;
    count?: number;
}

// Store recent error notifications to avoid spam
const errorNotifications = new Map<string, ErrorNotification>();
const ERROR_NOTIFICATION_COOLDOWN = 30000; // 30 seconds

// Global flag to prevent multiple anonymous session creation attempts
let isCreatingAnonymousSession = false;

/**
 * Clean up old error notifications
 */
function cleanupOldNotifications() {
    const now = Date.now();
    for (const [key, notification] of errorNotifications.entries()) {
        if (now - notification.timestamp > ERROR_NOTIFICATION_COOLDOWN) {
            errorNotifications.delete(key);
        }
    }
}

/**
 * Show user-friendly error notification (throttled)
 */
function showThrottledNotification(error: any, context: string) {
    cleanupOldNotifications();
    
    const errorKey = `${error?.code || 'unknown'}_${context}`;
    const existingNotification = errorNotifications.get(errorKey);
    
    if (existingNotification) {
        // Update count and timestamp
        existingNotification.count = (existingNotification.count || 1) + 1;
        existingNotification.timestamp = Date.now();
        return; // Don't show duplicate notification
    }
    
    let userMessage = '';
    let type: 'error' | 'warning' | 'info' = 'error';
    
    if (error?.code === 429) {
        userMessage = 'Server is busy. Please wait a moment and try again.';
        type = 'warning';
    } else if (error?.code === 401) {
        // ⚠️ REMOVED: Automatic anonymous session creation on 401 errors
        // Authentication is now handled explicitly when user takes protected actions:
        // - Clicking "Book Now" → ensureAuthSession('booking')
        // - Opening chat → ensureAuthSession('chat')
        // - Any protected operation → ensureAuthSession(reason)
        // See: lib/authSessionHelper.ts for on-demand authentication
        console.warn(`🔐 Authentication required for: ${context} (use ensureAuthSession() for protected actions)`);
        showThrottledNotification(error, context);
        return true;
    } else if (error?.code === 'timeout' || error?.message?.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
        type = 'warning';
    } else {
        userMessage = 'Connection issue. Please check your internet and try again.';
        type = 'error';
    }
    
    // Store notification
    errorNotifications.set(errorKey, {
        id: errorKey,
        message: userMessage,
        type,
        timestamp: Date.now(),
        count: 1
    });
    
    // Show toast notification (if toast system is available)
    if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(userMessage, type);
    } else {
        // Fallback to console
        console.warn(`🔔 User Notification [${type}]: ${userMessage}`);
    }
}

/**
 * Enhanced error handler for Appwrite operations
 */
export function handleAppwriteError(error: any, context: string = 'Unknown operation'): boolean {
    // Log for debugging
    console.error(`🔴 Appwrite Error [${context}]:`, {
        code: error?.code,
        message: error?.message,
        type: error?.type,
        context
    });
    
    // Rate limiting specific handling
    if (error?.code === 429) {
        console.warn(`🚫 Rate limit exceeded for: ${context}. Implementing backoff strategy.`);
        showThrottledNotification(error, context);
        return true; // Indicates error was handled
    }
    
    // Collection not found errors (404)
    if (error?.code === 404 && (
        error?.message?.includes('collection') || 
        error?.message?.includes('Collection')
    )) {
        console.warn(`⚠️ Collection not found for: ${context}. This may be expected for optional features.`);
        // Don't show notification for collection errors as they're often expected
        return true;
    }
    
    // Authentication errors (401)
    if (error?.code === 401) {
        console.warn(`🔐 Authentication required for: ${context}`);
        showThrottledNotification(error, context);
        return true;
    }
    
    // Permission errors (403)
    if (error?.code === 403) {
        console.warn(`🚫 Permission denied for: ${context}`);
        return true; // Handle silently for now
    }
    
    // Timeout errors
    if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
        console.warn(`⏱️ Timeout error for: ${context}`);
        showThrottledNotification({ code: 'timeout', message: 'Request timeout' }, context);
        return true;
    }
    
    // Network/connectivity errors
    if (!error?.code && (
        error?.message?.includes('network') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('connection')
    )) {
        console.warn(`🌐 Network error for: ${context}`);
        showThrottledNotification(error, context);
        return true;
    }
    
    // Unknown error - show generic message
    showThrottledNotification(error, context);
    return false; // Indicates error wasn't specifically handled
}

/**
 * Wrapper for async operations with error handling
 */
export async function safeAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue: T
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        const handled = handleAppwriteError(error, context);
        
        if (!handled) {
            console.error(`❌ Unhandled error in ${context}:`, error);
        }
        
        return fallbackValue;
    }
}

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandling() {
    // Handle unhandled promise rejections only
    if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && typeof event.reason === 'object') {
                const handled = handleAppwriteError(event.reason, 'Unhandled Promise Rejection');
                if (handled) {
                    event.preventDefault(); // Prevent default browser error handling
                }
            }
        });
        
        console.log('🛡️ Global error handling initialized (no fetch override)');
    }
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
    initializeGlobalErrorHandling();
}
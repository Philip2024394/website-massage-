/**
 * Global error handler for Appwrite API errors including rate limiting
 */

/** Known SDK/connection error code that can crash the app if unhandled (Appwrite/connection) */
const CRASH_ERROR_CODE_536870904 = 536870904;
const CRASH_ERROR_CODE_STR = '536870904';

/** Normalize code to number for comparison (SDK may return string in some envs) */
function isCrashCode(code: unknown): boolean {
    if (code === CRASH_ERROR_CODE_536870904) return true;
    if (code === CRASH_ERROR_CODE_STR) return true;
    if (typeof code === 'string' && code.trim() === CRASH_ERROR_CODE_STR) return true;
    const n = typeof code === 'number' ? code : parseInt(String(code), 10);
    return n === CRASH_ERROR_CODE_536870904;
}

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

/** Prevent duplicate registration of global handlers */
let globalErrorHandlingInitialized = false;

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
    
    if (isCrashCode(error?.code)) {
        userMessage = 'Connection or service error. Please try again.';
        type = 'warning';
    } else if (error?.code === 429) {
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

    // Known crash code 536870904 - handle so app does not crash
    if (isCrashCode(error?.code)) {
        console.warn(`🛡️ Caught crash code 536870904 in ${context} - showing fallback message`);
        showThrottledNotification(error, context);
        return true;
    }
    
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
 * Check if an error is the known crash code 536870904 (by code or message).
 * Handles both object errors and plain message (e.g. window.onerror when event.error is null).
 */
function isCrashCode536870904(error: unknown, message?: string): boolean {
    if (typeof message === 'string' && message.includes('536870904')) return true;
    if (error != null && typeof error === 'object') {
        const code = (error as { code?: number | string }).code;
        if (isCrashCode(code)) return true;
        const msg = (error as { message?: string }).message;
        if (typeof msg === 'string' && msg.includes('536870904')) return true;
    }
    return false;
}

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandling() {
    if (typeof window === 'undefined') return;
    if (globalErrorHandlingInitialized) return;
    globalErrorHandlingInitialized = true;

    // 1) Synchronous errors (e.g. thrown in callbacks) - prevent crash
    window.addEventListener('error', (event) => {
        const err = event.error;
        const msg = event.message || (err && typeof err === 'object' && (err as Error).message) || '';
        if (isCrashCode536870904(err, msg)) {
            console.warn('🛡️ Caught sync error with crash code 536870904 - suppressing');
            if (err != null) handleAppwriteError(err, 'window.onerror');
            else showThrottledNotification({ code: CRASH_ERROR_CODE_536870904, message: msg }, 'window.onerror');
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
        return false;
    }, true);

    // 2) Unhandled promise rejections - prevent crash (capture phase so we run first)
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const msg = reason && typeof reason === 'object' ? (reason as Error).message : String(reason ?? '');
        if (reason != null && isCrashCode536870904(reason, msg)) {
            console.warn('🛡️ Unhandled rejection with crash code 536870904 - preventing crash');
            handleAppwriteError(reason, 'Unhandled Promise Rejection');
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }
        if (reason && typeof reason === 'object') {
            const handled = handleAppwriteError(reason, 'Unhandled Promise Rejection');
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }, true);

    console.log('🛡️ Global error handling initialized (536870904 protected)');
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
    initializeGlobalErrorHandling();
}
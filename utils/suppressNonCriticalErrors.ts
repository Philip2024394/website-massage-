/**
 * Global error suppression for non-critical Appwrite collection errors
 * Prevents console clutter from missing/misconfigured collections
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// List of known non-critical Appwrite errors to suppress
const SUPPRESSED_ERRORS = [
    'Chat Sessions',
    'Facial Places', 
    'Hotels',
    'Places',
    'Bookings',
    'Cities',
    'Custom Links',
    '404 (Not Found)',
    '400 (Bad Request)',
    'Collection could not be found',
    'Document with the requested ID could not be found'
];

/**
 * Check if error message should be suppressed
 */
function shouldSuppress(message: string): boolean {
    const msgStr = String(message);
    return SUPPRESSED_ERRORS.some(pattern => msgStr.includes(pattern));
}

/**
 * Filtered console.error that suppresses known non-critical errors
 */
console.error = (...args: any[]) => {
    const message = args[0];
    
    // Check if this is a suppressed error
    if (typeof message === 'string' && shouldSuppress(message)) {
        // Silently log to a separate channel if needed for debugging
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_SUPPRESSED_ERRORS === '1') {
            originalWarn('[Suppressed Error]', ...args);
        }
        return;
    }
    
    // Allow all other errors through
    originalError(...args);
};

/**
 * Filtered console.warn for consistency
 */
console.warn = (...args: any[]) => {
    const message = args[0];
    
    if (typeof message === 'string' && shouldSuppress(message)) {
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_SUPPRESSED_ERRORS === '1') {
            originalWarn('[Suppressed Warning]', ...args);
        }
        return;
    }
    
    originalWarn(...args);
};

// Also intercept network errors in fetch/axios
const originalFetch = window.fetch;
window.fetch = async (...args: Parameters<typeof fetch>) => {
    try {
        const response = await originalFetch(...args);
        
        // Don't log errors for suppressed endpoints
        if (!response.ok) {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
            if (shouldSuppress(url)) {
                // Silently handle the error
                return response;
            }
        }
        
        return response;
    } catch (error) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        if (shouldSuppress(url)) {
            // Return a mock failed response
            return new Response(null, { status: 404, statusText: 'Not Found (Suppressed)' });
        }
        throw error;
    }
};

// Log that suppression is active (only in dev mode)
if (import.meta.env.DEV) {
    console.log(
        '%c🔇 Console Error Suppression Active',
        'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );
    console.log(
        '%cNon-critical Appwrite collection errors will be suppressed.',
        'color: #6b7280; font-size: 11px;'
    );
    console.log(
        '%cTo see suppressed errors, set VITE_DEBUG_SUPPRESSED_ERRORS=1',
        'color: #6b7280; font-size: 11px;'
    );
}

export {};

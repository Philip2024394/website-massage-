/**
 * React 19 Safe DOM Helpers
 * 
 * Utilities for safe DOM operations that avoid conflicts with React's concurrent rendering
 */

/**
 * Safely download a file without DOM manipulation conflicts
 * @param url - URL to download
 * @param filename - Name of the file to download
 */
export const safeDownload = (url: string, filename: string): void => {
    try {
        // Create invisible link element without adding to DOM
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Trigger download without DOM manipulation
        link.click();
        
        console.log('✅ Safe download triggered:', filename);
    } catch (error) {
        console.error('❌ Safe download failed:', error);
        // Fallback: open in new window
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (fallbackError) {
            console.error('❌ Fallback download also failed:', fallbackError);
        }
    }
};

/**
 * Safely open URL in new window
 * @param url - URL to open
 */
export const safeOpenUrl = (url: string): void => {
    try {
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('❌ Safe URL open failed:', error);
    }
};

/**
 * Safe event listener management for React 19
 */
export class SafeEventManager {
    private listeners: Map<string, { element: EventTarget; listener: EventListener }> = new Map();

    addListener(
        key: string, 
        element: EventTarget, 
        event: string, 
        listener: EventListener, 
        options?: AddEventListenerOptions
    ): boolean {
        try {
            if (typeof element?.addEventListener === 'function') {
                element.addEventListener(event, listener, options);
                this.listeners.set(key, { element, listener });
                return true;
            }
        } catch (error) {
            console.warn('Event listener setup warning (safe to ignore):', error);
        }
        return false;
    }

    removeListener(key: string, event: string): boolean {
        try {
            const stored = this.listeners.get(key);
            if (stored && typeof stored.element?.removeEventListener === 'function') {
                stored.element.removeEventListener(event, stored.listener);
                this.listeners.delete(key);
                return true;
            }
        } catch (error) {
            console.warn('Event listener cleanup warning (safe to ignore in React 19):', error);
        }
        return false;
    }

    removeAllListeners(event: string): void {
        for (const [key] of this.listeners) {
            this.removeListener(key, event);
        }
    }
}

/**
 * Wrapper for useEffect cleanup that's safe for React 19
 */
export const safeCleanup = (cleanupFn: () => void): (() => void) => {
    return () => {
        try {
            cleanupFn();
        } catch (error) {
            console.warn('Cleanup warning (safe to ignore in React 19):', error);
        }
    };
};
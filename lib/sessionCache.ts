/**
 * Session Cache
 * 
 * Prevents repeated 401 errors by caching session check results.
 * Clears on successful login/logout.
 */

interface SessionCacheEntry {
  hasSession: boolean;
  timestamp: number;
  user?: any;
}

const CACHE_DURATION_MS = 5000; // Cache for 5 seconds
let cachedSession: SessionCacheEntry | null = null;

export const sessionCache = {
  /**
   * Get cached session status
   */
  get(): SessionCacheEntry | null {
    if (!cachedSession) return null;
    
    const now = Date.now();
    if (now - cachedSession.timestamp > CACHE_DURATION_MS) {
      // Cache expired
      cachedSession = null;
      return null;
    }
    
    return cachedSession;
  },

  /**
   * Set cached session
   */
  set(hasSession: boolean, user?: any): void {
    cachedSession = {
      hasSession,
      timestamp: Date.now(),
      user
    };
  },

  /**
   * Clear cache (call on login/logout)
   */
  clear(): void {
    cachedSession = null;
  },

  /**
   * Mark as no session (prevents repeated 401s)
   */
  setNoSession(): void {
    cachedSession = {
      hasSession: false,
      timestamp: Date.now()
    };
  }
};

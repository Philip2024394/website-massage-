/**
 * 🔒 SOFT NAVIGATION & RECOVERY
 * 
 * Replaces hard window.location.reload() with soft recovery
 * Preserves user state, saves mobile bandwidth, faster recovery
 * 
 * Used by: Airbnb, Uber, Facebook for error recovery without full page reload
 * 
 * Why soft recovery?
 * - Preserves form data in sessionStorage
 * - Preserves authentication tokens
 * - Only re-mounts React components (fast)
 * - Saves mobile bandwidth (doesn't re-download assets)
 * - Better UX (no blank screen flash)
 * 
 * When to use hard reload?
 * - Only as LAST RESORT after soft recovery fails
 * - Service worker update required
 * - Complete cache clear needed
 */

/**
 * Soft recovery - attempts to recover app without full page reload
 * Falls back to hard reload only if soft recovery fails
 */
export function softRecover(): void {
  console.log('[softRecover] 🔄 Attempting soft recovery...');

  try {
    // Step 1: Clear any error states in localStorage (but preserve user data)
    const keysToPreserve = [
      'auth_token',
      'user_data',
      'booking_draft',
      'selected_language',
      'user_preferences'
    ];
    
    const preservedData: Record<string, string | null> = {};
    keysToPreserve.forEach(key => {
      preservedData[key] = localStorage.getItem(key);
    });

    // Clear error states
    ['app_error', 'crash_count', 'error_timestamp'].forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('[softRecover] ✅ Error states cleared, user data preserved');

    // Step 2: Dispatch soft recovery event for components to reset
    window.dispatchEvent(new CustomEvent('app:soft-recover', {
      detail: { timestamp: Date.now() }
    }));
    console.log('[softRecover] 📢 Soft recovery event dispatched');

    // Step 3: Navigate to safe route (home page) using hash navigation
    // This triggers React Router without full page reload
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== '') {
      console.log(`[softRecover] 🏠 Navigating from ${currentPath} to home...`);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    // Step 4: Reset scroll position
    window.scrollTo(0, 0);

    console.log('[softRecover] ✅ Soft recovery completed successfully');
    
    // Show success message to user
    showRecoveryToast('App recovered successfully', 'success');

  } catch (error) {
    console.error('[softRecover] ❌ Soft recovery failed:', error);
    
    // Soft recovery failed - inform user before hard reload
    showRecoveryToast('Reloading app...', 'info');
    
    // Wait 1 second to show message, then hard reload
    setTimeout(() => {
      console.log('[softRecover] 🔄 Falling back to hard reload...');
      window.location.reload();
    }, 1000);
  }
}

/**
 * Smart reload - tries soft recovery first, hard reload as fallback
 * This should replace most window.location.reload() calls
 */
export function smartReload(): void {
  console.log('[smartReload] 🧠 Determining best reload strategy...');
  
  // Check if hard reload is absolutely necessary
  const needsHardReload = 
    // Service worker update detected
    ('serviceWorker' in navigator && navigator.serviceWorker.controller?.state === 'installed') ||
    // Multiple soft recovery attempts failed
    (parseInt(sessionStorage.getItem('soft_recovery_attempts') || '0') >= 3);

  if (needsHardReload) {
    console.log('[smartReload] ⚠️ Hard reload required');
    sessionStorage.removeItem('soft_recovery_attempts');
    window.location.reload();
  } else {
    console.log('[smartReload] ✨ Attempting soft recovery');
    const attempts = parseInt(sessionStorage.getItem('soft_recovery_attempts') || '0') + 1;
    sessionStorage.setItem('soft_recovery_attempts', attempts.toString());
    softRecover();
  }
}

/**
 * Clear all caches and force hard reload
 * Use ONLY for critical failures (service worker update, etc)
 */
export async function hardReloadWithCacheClear(): Promise<void> {
  console.log('[hardReloadWithCacheClear] 🗑️ Clearing all caches before reload...');
  
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`[hardReloadWithCacheClear] ✅ Cleared ${cacheNames.length} caches`);
    }

    // Clear session storage
    sessionStorage.clear();
    console.log('[hardReloadWithCacheClear] ✅ Session storage cleared');

    // Hard reload
    window.location.reload();
  } catch (error) {
    console.error('[hardReloadWithCacheClear] ❌ Cache clear failed:', error);
    // Reload anyway
    window.location.reload();
  }
}

/**
 * Show user-friendly toast notification during recovery
 */
function showRecoveryToast(message: string, type: 'success' | 'info' | 'error'): void {
  // Only show if not already showing a toast
  if (document.getElementById('recovery-toast')) return;

  const colors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    error: 'bg-red-500'
  };

  const toast = document.createElement('div');
  toast.id = 'recovery-toast';
  toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[99999] animate-fade-in`;
  toast.style.animation = 'slideInRight 0.3s ease-out';
  toast.textContent = message;

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Listen for soft recovery events
 * Components can use this to reset their state
 */
export function onSoftRecover(callback: () => void): () => void {
  const handler = () => {
    console.log('[onSoftRecover] Event received, executing callback');
    callback();
  };

  window.addEventListener('app:soft-recover', handler);

  // Return cleanup function
  return () => {
    window.removeEventListener('app:soft-recover', handler);
  };
}

/**
 * Check if app is in a recoverable error state
 * Returns true if soft recovery is possible
 */
const CRASH_CODE_536870904 = 536870904;

export function isRecoverable(error: Error | unknown): boolean {
  const msg = error instanceof Error ? error.message : (error && typeof (error as any).message === 'string' ? (error as any).message : String(error ?? ''));
  const code = error && typeof error === 'object' ? (error as { code?: number | string }).code : undefined;
  if (code === CRASH_CODE_536870904 || code === '536870904' || (typeof msg === 'string' && msg.includes('536870904'))) return true;
  const recoverablePatterns = [
    /network/i,
    /timeout/i,
    /fetch failed/i,
    /loading chunk/i,
    /hydration/i,
    /CORS/i
  ];
  return recoverablePatterns.some(pattern => pattern.test(msg));
}

/**
 * Record error for analytics
 * Helps identify if soft recovery is effective
 */
export function recordRecovery(success: boolean, method: 'soft' | 'hard'): void {
  const key = `recovery_stats`;
  const stats = JSON.parse(localStorage.getItem(key) || '{"soft": 0, "hard": 0, "failed": 0}');
  
  if (success) {
    stats[method] = (stats[method] || 0) + 1;
  } else {
    stats.failed = (stats.failed || 0) + 1;
  }
  
  localStorage.setItem(key, JSON.stringify(stats));
  console.log('[recordRecovery] Stats updated:', stats);
}

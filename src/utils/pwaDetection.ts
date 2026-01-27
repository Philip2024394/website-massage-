/**
 * PWA Detection Utility
 * Detects if the app is running as a PWA (from home screen) vs browser
 * 
 * CRITICAL: Use this to prevent landing page redirects in PWA mode
 */

/**
 * Check if app is running as a PWA (installed on home screen)
 * @returns true if running as standalone PWA, false if in browser
 */
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check display mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check iOS standalone mode
  const isIosStandalone = (window.navigator as any).standalone === true;
  
  // Check if launched from PWA (source parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const isPwaSource = urlParams.get('source') === 'pwa';
  
  const result = isStandalone || isIosStandalone || isPwaSource;
  
  console.log('🔍 PWA Detection:', {
    isStandalone,
    isIosStandalone,
    isPwaSource,
    result,
    url: window.location.href
  });
  
  return result;
};

/**
 * Check if we should allow landing page redirects
 * @returns true if redirects are allowed (browser mode), false if PWA mode
 */
export const shouldAllowRedirects = (): boolean => {
  const pwaMode = isPWA();
  console.log(`🚦 Redirect check: ${pwaMode ? '🛑 BLOCKED (PWA mode)' : '✅ ALLOWED (browser mode)'}`);
  return !pwaMode;
};

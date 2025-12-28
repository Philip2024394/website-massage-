/**
 * Version Check System
 * Detects when a new version is deployed and prompts users to refresh
 */

// Current app version - INCREMENT THIS ON EVERY DEPLOYMENT
export const APP_VERSION = '2.1.0'; // Updated with stable review system

interface VersionInfo {
  version: string;
  timestamp: number;
}

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_KEY = 'app_version';
const LAST_CHECK_KEY = 'last_version_check';

/**
 * Check if a new version is available
 */
export async function checkForNewVersion(): Promise<boolean> {
  try {
    // Get stored version
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    // If no stored version, store current and return false
    if (!storedVersion) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return false;
    }
    
    // Compare versions
    if (storedVersion !== APP_VERSION) {
      console.log('🔄 New version detected:', { old: storedVersion, new: APP_VERSION });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Version check error:', error);
    return false;
  }
}

/**
 * Update stored version after refresh
 */
export function updateStoredVersion(): void {
  try {
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to update stored version:', error);
  }
}

/**
 * Force refresh the page and clear all caches
 */
export function forceRefresh(): void {
  try {
    // Update version before refresh
    updateStoredVersion();
    
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    // Hard reload
    window.location.reload();
  } catch (error) {
    console.error('Force refresh error:', error);
    window.location.reload();
  }
}

/**
 * Show refresh prompt to user
 */
export function showRefreshPrompt(onRefresh?: () => void): void {
  const message = 'A new version of the app is available! Please refresh to get the latest features and improvements.';
  
  // Create a custom notification banner
  const banner = document.createElement('div');
  banner.id = 'version-update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      text-align: center;
      z-index: 99999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="max-width: 600px; margin: 0 auto;">
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 500;">
          🎉 New Version Available!
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.95;">
          We've updated the app with new features and improvements.
        </p>
        <button id="refresh-now-btn" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 8px;
          transition: transform 0.2s;
        ">
          Refresh Now
        </button>
        <button id="dismiss-update-btn" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          Later
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Refresh button handler
  const refreshBtn = document.getElementById('refresh-now-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (onRefresh) {
        onRefresh();
      } else {
        forceRefresh();
      }
    });
  }
  
  // Dismiss button handler
  const dismissBtn = document.getElementById('dismiss-update-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      banner.remove();
      // Check again in 1 minute
      setTimeout(() => {
        checkAndNotify();
      }, 60 * 1000);
    });
  }
}

/**
 * Check for new version and notify user
 */
export async function checkAndNotify(): Promise<void> {
  const hasNewVersion = await checkForNewVersion();
  
  if (hasNewVersion) {
    showRefreshPrompt();
  }
}

/**
 * Initialize periodic version checking
 */
export function initVersionCheck(): void {
  // Check immediately on load
  setTimeout(() => {
    checkAndNotify();
  }, 2000); // Wait 2 seconds after page load
  
  // Check periodically
  setInterval(() => {
    checkAndNotify();
  }, VERSION_CHECK_INTERVAL);
  
  // Listen for visibility change to check when user returns to tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkAndNotify();
    }
  });
  
  console.log('✅ Version check initialized. Current version:', APP_VERSION);
}

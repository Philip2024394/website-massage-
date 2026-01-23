/**
 * Browser Compatibility Utilities
 * 
 * Ensures the application works across all major browsers in 2026:
 * - Chrome 73+
 * - Firefox 63+
 * - Safari 12.1+ (macOS, iOS, iPadOS)
 * - Edge 79+ (Chromium-based)
 * - Samsung Internet 10+
 * - Chrome Android 73+
 * - Firefox Android 63+
 */

export interface BrowserInfo {
  name: string;
  version: number;
  isSupported: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  requiresHTTPS: boolean;
}

/**
 * Detect browser information
 */
export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;
  const vendor = navigator.vendor || '';
  
  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  
  // Browser detection
  let name = 'Unknown';
  let version = 0;
  let isSupported = false;
  
  // Chrome (and Chrome-based browsers)
  if (/Chrome/.test(ua) && /Google Inc/.test(vendor)) {
    name = 'Chrome';
    const match = ua.match(/Chrome\/([0-9.]+)/);
    version = match ? parseInt(match[1]) : 0;
    isSupported = version >= 73;
  }
  // Samsung Internet
  else if (/SamsungBrowser/.test(ua)) {
    name = 'Samsung Internet';
    const match = ua.match(/SamsungBrowser\/([0-9.]+)/);
    version = match ? parseInt(match[1]) : 0;
    isSupported = version >= 10;
  }
  // Edge (Chromium-based)
  else if (/Edg/.test(ua)) {
    name = 'Edge';
    const match = ua.match(/Edg\/([0-9.]+)/);
    version = match ? parseInt(match[1]) : 0;
    isSupported = version >= 79;
  }
  // Firefox
  else if (/Firefox/.test(ua)) {
    name = 'Firefox';
    const match = ua.match(/Firefox\/([0-9.]+)/);
    version = match ? parseInt(match[1]) : 0;
    isSupported = version >= 63;
  }
  // Safari (must be checked after Chrome)
  else if (/Safari/.test(ua) && /Apple Computer/.test(vendor)) {
    name = isIOS ? 'Safari iOS' : 'Safari';
    const match = ua.match(/Version\/([0-9.]+)/);
    version = match ? parseFloat(match[1]) : 0;
    isSupported = version >= 12.1;
  }
  // Opera
  else if (/OPR/.test(ua)) {
    name = 'Opera';
    const match = ua.match(/OPR\/([0-9.]+)/);
    version = match ? parseInt(match[1]) : 0;
    isSupported = version >= 60;
  }
  
  // HTTPS requirement (stricter for Safari/iOS)
  const requiresHTTPS = name.includes('Safari') || name.includes('Chrome') || version >= 50;
  
  return {
    name,
    version,
    isSupported,
    isMobile,
    isIOS,
    isAndroid,
    requiresHTTPS
  };
}

/**
 * Check if geolocation is supported and properly configured
 */
export function checkGeolocationSupport(): {
  supported: boolean;
  error?: string;
  browserInfo: BrowserInfo;
} {
  const browserInfo = detectBrowser();
  
  // Check if geolocation API exists
  if (!navigator.geolocation) {
    return {
      supported: false,
      error: `Geolocation not supported in ${browserInfo.name}. Please update your browser.`,
      browserInfo
    };
  }
  
  // Check HTTPS requirement
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.startsWith('192.168.') ||
                   window.location.hostname.endsWith('.local');
  
  if (browserInfo.requiresHTTPS && !isSecure) {
    return {
      supported: false,
      error: `${browserInfo.name} requires HTTPS for location access. Please access the site via https://`,
      browserInfo
    };
  }
  
  // Check browser version
  if (!browserInfo.isSupported) {
    return {
      supported: false,
      error: `${browserInfo.name} ${browserInfo.version} is outdated. Please update to the latest version.`,
      browserInfo
    };
  }
  
  return {
    supported: true,
    browserInfo
  };
}

/**
 * Get optimal geolocation options for the current browser
 */
export function getGeolocationOptions(browserInfo?: BrowserInfo): PositionOptions {
  const info = browserInfo || detectBrowser();
  
  return {
    enableHighAccuracy: true,
    // iOS/Safari needs more time for GPS acquisition
    timeout: info.isIOS || info.name.includes('Safari') ? 30000 : 20000,
    // Always get fresh location (critical for Safari)
    maximumAge: 0
  };
}

/**
 * Request geolocation with browser-specific handling
 */
export async function requestLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    const check = checkGeolocationSupport();
    
    if (!check.supported) {
      reject(new Error(check.error || 'Geolocation not supported'));
      return;
    }
    
    const options = getGeolocationOptions(check.browserInfo);
    
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      options
    );
  });
}

/**
 * Format error message based on browser and error type
 */
export function formatGeolocationError(
  error: GeolocationPositionError,
  browserInfo?: BrowserInfo
): string {
  const info = browserInfo || detectBrowser();
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      if (info.isIOS) {
        return 'Location access denied. Go to Settings → Privacy & Security → Location Services → Safari → Allow';
      } else if (info.name === 'Chrome') {
        return 'Location access denied. Click the 🔒 icon in address bar → Site settings → Location → Allow';
      } else if (info.name === 'Firefox') {
        return 'Location access denied. Click the 🔒 icon in address bar → Clear permissions → Reload page';
      } else if (info.name === 'Safari') {
        return 'Location access denied. Safari → Preferences → Websites → Location → Allow for this site';
      }
      return 'Location access denied. Please enable location permissions in your browser settings.';
      
    case error.POSITION_UNAVAILABLE:
      if (info.isIOS) {
        return 'GPS unavailable. Ensure Location Services are ON in Settings → Privacy → Location Services';
      }
      return 'GPS position unavailable. Try: 1) Move to an open area, 2) Enable device GPS, 3) Restart browser';
      
    case error.TIMEOUT:
      if (info.isIOS || info.name.includes('Safari')) {
        return 'GPS timeout (30 seconds). Move to an area with clear sky view and try again.';
      }
      return 'GPS timeout (20 seconds). Move outdoors or near a window and try again.';
      
    default:
      return 'Unknown location error. Try refreshing the page or using a different browser.';
  }
}

/**
 * Check if browser needs special handling for localStorage/sessionStorage
 */
export function checkStorageSupport(): {
  localStorage: boolean;
  sessionStorage: boolean;
} {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    
    return {
      localStorage: true,
      sessionStorage: true
    };
  } catch (e) {
    // Safari private mode blocks storage
    return {
      localStorage: false,
      sessionStorage: false
    };
  }
}

/**
 * Safe localStorage wrapper with fallback
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      console.warn('localStorage not available (possibly Safari private mode)');
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Check if CustomEvent is supported (for older browsers)
 */
export function createCustomEvent<T = any>(
  eventName: string,
  detail?: T
): CustomEvent<T> {
  // Modern browsers
  if (typeof CustomEvent === 'function') {
    return new CustomEvent(eventName, { detail });
  }
  
  // IE11 and older Safari fallback
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, false, false, detail);
  return event as CustomEvent<T>;
}

/**
 * Get browser compatibility report
 */
export function getBrowserCompatibilityReport(): {
  browser: BrowserInfo;
  geolocation: ReturnType<typeof checkGeolocationSupport>;
  storage: ReturnType<typeof checkStorageSupport>;
  features: {
    fetch: boolean;
    promise: boolean;
    async: boolean;
    customEvent: boolean;
    intl: boolean;
  };
} {
  const browser = detectBrowser();
  const geolocation = checkGeolocationSupport();
  const storage = checkStorageSupport();
  
  return {
    browser,
    geolocation,
    storage,
    features: {
      fetch: typeof fetch === 'function',
      promise: typeof Promise === 'function',
      async: typeof (async () => {}) === 'function',
      customEvent: typeof CustomEvent === 'function',
      intl: typeof Intl === 'object' && typeof Intl.NumberFormat === 'function'
    }
  };
}

/**
 * Log browser compatibility info to console
 */
export function logBrowserInfo(): void {
  const report = getBrowserCompatibilityReport();
  
  console.group('🌐 Browser Compatibility Report');
  console.log('Browser:', report.browser.name, report.browser.version);
  console.log('Supported:', report.browser.isSupported ? '✅' : '❌');
  console.log('Platform:', report.browser.isMobile ? 'Mobile' : 'Desktop');
  if (report.browser.isIOS) console.log('iOS detected');
  if (report.browser.isAndroid) console.log('Android detected');
  console.log('Geolocation:', report.geolocation.supported ? '✅' : '❌', report.geolocation.error || '');
  console.log('Storage:', report.storage.localStorage ? '✅ localStorage' : '❌ localStorage');
  console.log('Features:', report.features);
  console.groupEnd();
}

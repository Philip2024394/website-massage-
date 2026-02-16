// App constants and configuration

/** Single source of truth for verified therapist/place badge image (ImageKit). */
export const VERIFIED_BADGE_IMAGE_URL = 'https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565';

export const APP_CONSTANTS = {
  DEFAULT_CONTACT_NUMBER: '6281392000050',
  DEFAULT_PAGE: 'landing' as const,
  GOOGLE_MAPS_SCRIPT_ID: 'google-maps-script',
} as const;

export const PAGES_WITH_FOOTER = ['home', 'detail', 'agent', 'serviceTerms', 'privacy'] as const;

export const STORAGE_KEYS = {
  USER_LOCATION: 'userLocation',
  LANGUAGE: 'language',
  GOOGLE_MAPS_API_KEY: 'googleMapsApiKey',
  APP_CONTACT_NUMBER: 'appContactNumber',
  SUPABASE_CONFIG: 'supabaseConfig',
} as const;

export type Page = 'landing' | 'auth' | 'home' | 'detail' | 'registrationChoice' | 'providerAuth' | 'therapistPortal' | 'placeDashboard' | 'agent' | 'agentAuth' | 'agentDashboard' | 'agentTerms' | 'serviceTerms' | 'privacy' | 'membership' | 'booking' | 'notifications' | 'hotelLogin' | 'hotelDashboard' | 'villaLogin' | 'villaDashboard' | 'supabaseSettings' | 'hotelVillaMenu' | 'coinHistory' | 'coin-history';

export type Language = 'en' | 'id';

export type LoggedInProvider = { id: number; type: 'therapist' | 'place' };

// Utility functions for localStorage operations
export const storageUtils = {
  getItem: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

// Google Maps utility with improved duplicate prevention. Do not load script when key is missing to avoid NoApiKeys/InvalidKey console errors.
export const loadGoogleMapsScript = (apiKey: string, onLoad?: () => void, onError?: () => void) => {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) {
    onError?.();
    return;
  }
  // Check if script already exists
  if (document.getElementById(APP_CONSTANTS.GOOGLE_MAPS_SCRIPT_ID)) {
    if ((window as any).google && (window as any).google.maps) {
      onLoad?.();
    }
    return;
  }
  if ((window as any).google && (window as any).google.maps) {
    onLoad?.();
    return;
  }
  const script = document.createElement('script');
  script.id = APP_CONSTANTS.GOOGLE_MAPS_SCRIPT_ID;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,geometry&loading=async`;
  script.async = true;
  script.defer = true;
  script.onload = () => onLoad?.();
  script.onerror = () => onError?.();
  document.head.appendChild(script);
};
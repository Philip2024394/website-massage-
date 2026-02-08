/**
 * Facebook-Style Silent Location Capture
 * 
 * Captures user GPS location for booking verification (NOT for city selection).
 * 
 * ⚠️ IMPORTANT: This uses GPS-only location detection.
 * - Used ONLY for spam verification in bookings
 * - Does NOT affect browsing city (selectedCity)
 * - Does NOT auto-select city from GPS
 * - Browsing city MUST be manually selected via CitySelectionPage
 * 
 * IP-based location intentionally disabled due to inaccuracy in Indonesia.
 */

import { logger } from '@/lib/logger.production';
import { getCustomerLocation } from '../lib/nearbyProvidersService';

export interface CapturedLocation {
  lat: number;
  lng: number;
  address?: string;
  timestamp: string;
  verified: boolean;
}

const STORAGE_KEY = 'silentLocationCapture';
const CAPTURE_EXPIRY_HOURS = 24; // Location expires after 24 hours

/**
 * Silently capture location in background (Facebook-style)
 */
export const captureSilentLocation = async (): Promise<CapturedLocation | null> => {
  try {
    logger.debug('🌍 Facebook-style: Silently capturing location...');
    
    // Check if we already have a recent capture
    const existing = getStoredLocation();
    if (existing && !isLocationExpired(existing)) {
      logger.debug('✓ Using cached location:', existing);
      return existing;
    }
    
    // Capture new location
    const location = await getCustomerLocation();
    
    if (location) {
      const captured: CapturedLocation = {
        lat: location.lat,
        lng: location.lng,
        address: 'Auto-detected location',
        timestamp: new Date().toISOString(),
        verified: true
      };
      
      // Store in localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
        logger.debug('💾 Location stored for chat system');
      } catch (e) {
        logger.warn('Failed to store location:', e);
      }
      
      return captured;
    }
    
    return null;
  } catch (error) {
    logger.debug('ℹ️ Silent location capture failed (normally):', error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Get stored location from localStorage
 */
export const getStoredLocation = (): CapturedLocation | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    logger.warn('Failed to retrieve stored location:', e);
  }
  return null;
};

/**
 * Check if location data is expired
 */
export const isLocationExpired = (location: CapturedLocation): boolean => {
  if (!location.timestamp) return true;
  
  const capturedTime = new Date(location.timestamp).getTime();
  const now = new Date().getTime();
  const hoursSince = (now - capturedTime) / (1000 * 60 * 60);
  
  return hoursSince > CAPTURE_EXPIRY_HOURS;
};

/**
 * Enhance location with Google Geocoding for better address
 */
export const enhanceLocation = async (
  location: { lat: number; lng: number; address?: string }
): Promise<CapturedLocation> => {
  try {
    const { GOOGLE_MAPS_API_KEY } = await import('../lib/appwrite.config');
    
    if (GOOGLE_MAPS_API_KEY) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}&language=en`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        const addressComponents = data.results[0].address_components;
        
        // Extract city/area for better display
        const cityComponent = addressComponents.find(comp =>
          comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
        );
        const areaComponent = addressComponents.find(comp =>
          comp.types.includes('sublocality') || comp.types.includes('sublocality_level_1')
        );
        
        let enhancedAddress = location.address;
        if (areaComponent && cityComponent) {
          enhancedAddress = `${areaComponent.long_name}, ${cityComponent.long_name}`;
        } else if (cityComponent) {
          enhancedAddress = cityComponent.long_name;
        } else {
          enhancedAddress = formattedAddress.split(',').slice(0, 2).join(', ');
        }
        
        return {
          lat: location.lat,
          lng: location.lng,
          address: enhancedAddress || formattedAddress,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return {
      lat: location.lat,
      lng: location.lng,
      address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      verified: false,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.warn('Location enhancement failed:', error);
    return {
      lat: location.lat,
      lng: location.lng,
      address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      verified: false,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Clear stored location
 */
export const clearStoredLocation = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    logger.debug('🗑️ Stored location cleared');
  } catch (e) {
    logger.warn('Failed to clear location:', e);
  }
};

/**
 * GEO-BASED DISTANCE UTILITIES
 * 
 * SOURCE OF TRUTH: Coordinates (lat/lng) only
 * NO string-based location matching
 */

import { findCityByCoordinates } from '../data/indonesianCities';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  
  const lat1Rad = (point1.lat * Math.PI) / 180;
  const lat2Rad = (point2.lat * Math.PI) / 180;
  const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
}

/**
 * Extract valid geopoint from therapist document
 * Returns null if invalid/missing coordinates
 */
export function extractGeopoint(therapist: any): { lat: number; lng: number } | null {
  try {
    // Check direct geopoint field
    if (therapist.geopoint && 
        typeof therapist.geopoint.lat === 'number' && 
        typeof therapist.geopoint.lng === 'number') {
      return {
        lat: therapist.geopoint.lat,
        lng: therapist.geopoint.lng
      };
    }
    
    // Fallback: parse coordinates field (legacy)
    if (therapist.coordinates) {
      let coords;
      if (typeof therapist.coordinates === 'string') {
        coords = JSON.parse(therapist.coordinates);
      } else {
        coords = therapist.coordinates;
      }
      
      if (coords && 
          typeof coords.lat === 'number' && 
          typeof coords.lng === 'number') {
        return {
          lat: coords.lat,
          lng: coords.lng
        };
      }
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Invalid geopoint for therapist:', therapist.name, error);
    return null;
  }
}

/**
 * Check if therapist is within radius of user location
 */
export function isWithinRadius(
  therapistGeopoint: { lat: number; lng: number },
  userLocation: { lat: number; lng: number },
  radiusMeters: number = 10000 // 10km default
): boolean {
  const distance = calculateDistance(therapistGeopoint, userLocation);
  return distance <= radiusMeters;
}

/** Max distance (km) to assign therapist to nearest app city; beyond this returns 'other'. */
const DEFAULT_MAX_DISTANCE_KM = 75;

/** Fallback city bounds when app city list is unavailable (e.g. some build/env). */
const FALLBACK_CITY_BOUNDS: Record<string, { lat: [number, number]; lng: [number, number] }> = {
  yogyakarta: { lat: [-7.9, -7.7], lng: [110.2, 110.5] },
  bandung: { lat: [-7.0, -6.8], lng: [107.5, 107.8] },
  jakarta: { lat: [-6.4, -6.0], lng: [106.7, 107.0] },
  denpasar: { lat: [-8.8, -8.5], lng: [115.1, 115.3] },
  ubud: { lat: [-8.6, -8.4], lng: [115.2, 115.3] },
  canggu: { lat: [-8.7, -8.6], lng: [115.1, 115.2] },
  surabaya: { lat: [-7.4, -7.2], lng: [112.6, 112.8] },
  semarang: { lat: [-7.1, -6.9], lng: [110.3, 110.5] }
};

/**
 * Auto-derive locationId from geopoint using the app's city list.
 * Ensures therapists are assigned to the same GPS locations used in the app
 * (dropdown/filter). Uses nearest city within maxDistance km; returns 'other' if none in range.
 * Falls back to hardcoded bounds if the city list lookup throws.
 */
export function deriveLocationIdFromGeopoint(
  geopoint: { lat: number; lng: number },
  maxDistanceKm: number = DEFAULT_MAX_DISTANCE_KM
): string {
  try {
    const city = findCityByCoordinates(geopoint.lat, geopoint.lng, maxDistanceKm);
    return city ? city.locationId : 'other';
  } catch {
    const { lat, lng } = geopoint;
    for (const [locationId, bounds] of Object.entries(FALLBACK_CITY_BOUNDS)) {
      if (lat >= bounds.lat[0] && lat <= bounds.lat[1] && lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
        return locationId;
      }
    }
    return 'other';
  }
}

/**
 * Validate therapist has required geopoint
 * BLOCKS display if geopoint missing
 */
export function validateTherapistGeopoint(therapist: any): {
  isValid: boolean;
  geopoint: { lat: number; lng: number } | null;
  error?: string;
} {
  const geopoint = extractGeopoint(therapist);
  
  if (!geopoint) {
    return {
      isValid: false,
      geopoint: null,
      error: 'Missing or invalid geopoint coordinates'
    };
  }
  
  // Validate coordinates are within Indonesia bounds
  const { lat, lng } = geopoint;
  if (lat < -11 || lat > 6 || lng < 95 || lng > 141) {
    return {
      isValid: false,
      geopoint: null,
      error: 'Coordinates outside Indonesia bounds'
    };
  }
  
  return {
    isValid: true,
    geopoint
  };
}
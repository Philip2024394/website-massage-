/**
 * City Filtering Utilities
 * 
 * CRITICAL RULE: If activeCity ≠ therapist.city → therapist MUST NEVER appear
 * 
 * This enforces strict city-based filtering throughout the application
 * to ensure users only see providers from their selected city.
 */

import { Therapist, Place } from '../types';

/**
 * Normalize city name for comparison
 * Handles variations like "Jakarta" vs "jakarta" vs "JAKARTA"
 */
export function normalizeCityName(city: string | undefined | null): string {
  if (!city) return '';
  return city.toLowerCase().trim();
}

/**
 * Check if a city name matches the active city
 * Returns true only if there's an EXACT match
 */
export function cityMatches(
  therapistCity: string | undefined | null,
  activeCity: string | undefined | null
): boolean {
  // If no active city filter, don't show anything (force selection)
  if (!activeCity) return false;
  
  // If therapist has no city, exclude them
  if (!therapistCity) return false;
  
  // Special case: "all" shows everything (admin mode only)
  if (activeCity === 'all') return true;
  
  // Exact match required
  const normalizedTherapistCity = normalizeCityName(therapistCity);
  const normalizedActiveCity = normalizeCityName(activeCity);
  
  return normalizedTherapistCity === normalizedActiveCity;
}

/**
 * Filter therapists by active city
 * STRICT: Only returns therapists that match the active city exactly
 */
export function filterTherapistsByCity(
  therapists: Therapist[],
  activeCity: string | undefined | null
): Therapist[] {
  if (!activeCity) {
    console.warn('⚠️ No active city provided - returning empty array');
    return [];
  }
  
  if (activeCity === 'all') {
    console.log('📍 City filter: "all" - showing all therapists');
    return therapists;
  }
  
  const filtered = therapists.filter(therapist => {
    // 🔒 GPS-AUTHORITATIVE: Prefer city (GPS-derived) → location_id → location (legacy fallback)
    // NOTE: therapist.location is LEGACY ONLY and should not be trusted for filtering
    const therapistCity = therapist.city || therapist.location_id || therapist.location;
    const matches = cityMatches(therapistCity, activeCity);
    
    if (!matches) {
      console.log(
        `❌ City mismatch: Excluding "${therapist.name}" (city: "${therapistCity}") from "${activeCity}"`
      );
    }
    
    return matches;
  });
  
  console.log(
    `✅ City filter (${activeCity}): ${filtered.length}/${therapists.length} therapists match`
  );
  
  return filtered;
}

/**
 * Filter places by active city
 * STRICT: Only returns places that match the active city exactly
 */
export function filterPlacesByCity(
  places: Place[],
  activeCity: string | undefined | null
): Place[] {
  if (!activeCity) {
    console.warn('⚠️ No active city provided - returning empty array');
    return [];
  }
  
  if (activeCity === 'all') {
    console.log('📍 City filter: "all" - showing all places');
    return places;
  }
  
  const filtered = places.filter(place => {
    // 🔒 GPS-AUTHORITATIVE: Prefer city (GPS-derived) → location (legacy fallback)
    // NOTE: place.location is LEGACY ONLY and should not be trusted for filtering
    const placeCity = place.city || place.location;
    const matches = cityMatches(placeCity, activeCity);
    
    if (!matches) {
      console.log(
        `❌ City mismatch: Excluding "${place.name}" (city: "${placeCity}") from "${activeCity}"`
      );
    }
    
    return matches;
  });
  
  console.log(
    `✅ City filter (${activeCity}): ${filtered.length}/${places.length} places match`
  );
  
  return filtered;
}

/**
 * Validate that a therapist belongs to the active city
 * Used for individual lookups (profile views, etc.)
 */
export function validateTherapistCity(
  therapist: Therapist | null | undefined,
  activeCity: string | undefined | null
): boolean {
  if (!therapist) return false;
  if (!activeCity) return false;
  
  const therapistCity = therapist.city || therapist.location;
  return cityMatches(therapistCity, activeCity);
}

/**
 * Validate that a place belongs to the active city
 * Used for individual lookups (profile views, etc.)
 */
export function validatePlaceCity(
  place: Place | null | undefined,
  activeCity: string | undefined | null
): boolean {
  if (!place) return false;
  if (!activeCity) return false;
  
  const placeCity = place.city || place.location;
  return cityMatches(placeCity, activeCity);
}

/**
 * Get a safe display name for debugging
 */
export function getProviderDisplayInfo(provider: Therapist | Place | any): string {
  const name = provider?.name || 'Unknown';
  const city = provider?.city || provider?.location || 'No city';
  const id = provider?.$id || provider?.id || 'No ID';
  return `${name} (${city}) [${id}]`;
}

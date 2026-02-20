/**
 * City Filtering Utilities
 * 
 * CRITICAL RULE: If activeCity ≠ therapist.city → therapist MUST NEVER appear
 * 
 * Matches against: locationId (e.g. "yogyakarta"), city name, and aliases
 * (e.g. "Jogja", "Yogya") so dropdown selection shows all therapists for that area.
 */

import { Therapist, Place } from '../types';
import { findCityByLocationIdOrName } from '../data/indonesianCities';
import { convertLocationStringToId } from './locationNormalizationV2';

/**
 * Normalize city name for comparison
 */
export function normalizeCityName(city: string | undefined | null): string {
  if (!city) return '';
  return String(city).toLowerCase().trim();
}

/**
 * Get all normalized values that count as a match for the active city
 * (locationId, official name, and aliases e.g. Yogyakarta → yogyakarta, jogja, yogya).
 * Uses both indonesianCities and convertLocationStringToId so display names (e.g. "Yogyakarta")
 * always match therapist city stored as locationId ("yogyakarta").
 */
function getMatchableCityValues(activeCity: string | undefined | null): Set<string> {
  if (!activeCity || activeCity === 'all') return new Set();
  const normalized = normalizeCityName(activeCity);
  const set = new Set<string>([normalized]);
  let city = findCityByLocationIdOrName(activeCity);
  // When stored value is "City, Country" (e.g. "Yogyakarta, Indonesia"), resolve by city part so therapist city "yogyakarta" still matches
  if (!city && activeCity.includes(',')) {
    const cityPart = activeCity.split(',')[0].trim();
    if (cityPart) city = findCityByLocationIdOrName(cityPart);
  }
  if (city) {
    set.add(normalizeCityName(city.locationId));
    set.add(normalizeCityName(city.name));
    (city.aliases || []).forEach(alias => set.add(normalizeCityName(alias)));
  }
  const canonicalId = convertLocationStringToId(activeCity);
  if (canonicalId && canonicalId !== 'all') set.add(normalizeCityName(canonicalId));
  // Also try canonical id of the part before comma (e.g. "Yogyakarta, Indonesia" -> "yogyakarta")
  if (activeCity.includes(',')) {
    const cityPart = activeCity.split(',')[0].trim();
    if (cityPart) {
      const partId = convertLocationStringToId(cityPart);
      if (partId && partId !== 'all') set.add(normalizeCityName(partId));
    }
  }
  return set;
}

/**
 * Check if a therapist/place city matches the active city (or its name/aliases)
 * Also matches when therapist city is "City, Country" by checking the city part.
 */
export function cityMatches(
  therapistCity: string | undefined | null,
  activeCity: string | undefined | null
): boolean {
  if (!activeCity) return false;
  if (!therapistCity) return false;
  if (activeCity === 'all') return true;
  const normalizedTherapist = normalizeCityName(therapistCity);
  const matchable = getMatchableCityValues(activeCity);
  if (matchable.has(normalizedTherapist)) return true;
  // Match "City, Country" format: use part before comma
  if (normalizedTherapist.includes(',')) {
    const cityPart = normalizedTherapist.split(',')[0].trim();
    if (matchable.has(cityPart)) return true;
  }
  return false;
}

/**
 * Filter therapists by active city
 * STRICT: Only returns therapists that match the active city exactly
 */
export function filterTherapistsByCity(
  therapists: Therapist[] | undefined | null,
  activeCity: string | undefined | null
): Therapist[] {
  if (!Array.isArray(therapists)) {
    return [];
  }
  if (!activeCity) {
    return [];
  }
  if (activeCity === 'all') {
    return therapists;
  }
  const filtered = therapists.filter(therapist => {
    // STRICT: locationId is canonical city slug (e.g. "yogyakarta"); primary_city when string; fallbacks for legacy
    const t = therapist as any;
    const therapistCity = typeof t.locationId === 'string' ? t.locationId : (typeof t.primary_city === 'string' ? t.primary_city : null) || therapist.city || t.location_id || therapist.location;
    return cityMatches(therapistCity, activeCity);
  });
  return filtered;
}

/**
 * Filter places by active city
 * STRICT: Only returns places that match the active city exactly
 */
export function filterPlacesByCity(
  places: Place[] | undefined | null,
  activeCity: string | undefined | null
): Place[] {
  if (!Array.isArray(places)) return [];
  if (!activeCity) return [];
  if (activeCity === 'all') return places;
  const filtered = places.filter(place => {
    // 🔒 GPS-AUTHORITATIVE: Prefer city (GPS-derived) → location (legacy fallback)
    // NOTE: place.location is LEGACY ONLY and should not be trusted for filtering
    const placeCity = place.city || place.location;
    return cityMatches(placeCity, activeCity);
  });
  return filtered;
}

/**
 * Filter hotels by active city (same logic as places)
 * STRICT: Only returns hotels that match the active city exactly (city/locationId from saved GPS).
 */
export function filterHotelsByCity(
  hotels: any[] | undefined | null,
  activeCity: string | undefined | null
): any[] {
  if (!Array.isArray(hotels)) return [];
  if (!activeCity) return [];
  if (activeCity === 'all') return hotels;
  return hotels.filter(hotel => {
    const hotelCity = hotel.city || (hotel as any).locationId || hotel.location;
    return cityMatches(hotelCity, activeCity);
  });
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

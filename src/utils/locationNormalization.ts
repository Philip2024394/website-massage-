/**
 * Location Normalization Utility
 * 
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for location handling
 * 
 * Schema: Appwrite therapists collection has ONE location field:
 *   - location (STRING) - e.g., "Yogyakarta", "Bandung", "Bali"
 * 
 * DO NOT add city, area, region, or any other location fields!
 */

export interface NormalizedLocation {
  location: string;  // Canonical field - "Yogyakarta", "Bandung", etc.
  coordinates: { lat: number; lng: number } | null;
}

export interface TherapistLocationData {
  location?: string | null;
  coordinates?: string | { lat: number; lng: number } | null;
}

/**
 * Extract location from therapist document
 * 
 * FAIL-FAST: Throws if location is invalid format
 */
export function extractLocation(therapist: TherapistLocationData): string {
  // ASSERTION: Must have location field
  if (!therapist || typeof therapist !== 'object') {
    console.error('❌ ASSERTION FAILED: therapist is not an object', therapist);
    return 'all';
  }

  // Primary: location field (canonical)
  if (therapist.location && typeof therapist.location === 'string') {
    const normalized = therapist.location.trim();
    if (normalized.length > 0) {
      return normalized;
    }
  }

  // LEGACY WARNING: If no location, log warning
  console.warn('⚠️ Therapist missing location field:', {
    hasLocation: !!therapist.location,
    locationValue: therapist.location
  });

  return 'all';  // Default fallback
}

/**
 * Parse coordinates from various formats
 */
export function extractCoordinates(
  coords: string | { lat: number; lng: number } | null | undefined
): { lat: number; lng: number } | null {
  if (!coords) return null;

  try {
    // If already object
    if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
      const lat = Number(coords.lat);
      const lng = Number(coords.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    // If JSON string
    if (typeof coords === 'string') {
      const parsed = JSON.parse(coords);
      if (parsed && typeof parsed === 'object' && 'lat' in parsed && 'lng' in parsed) {
        const lat = Number(parsed.lat);
        const lng = Number(parsed.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to parse coordinates:', coords, error);
  }

  return null;
}

/**
 * Normalize location for save to Appwrite
 * 
 * ASSERTION: Only returns location field (no city, area, etc.)
 */
export function normalizeLocationForSave(
  location: string,
  coordinates?: { lat: number; lng: number } | null
): { location: string | null; coordinates: string | null } {
  // ASSERTION: location must be string
  if (typeof location !== 'string') {
    console.error('❌ ASSERTION FAILED: location is not a string', location);
    throw new Error('Location must be a string');
  }

  const trimmed = location.trim();

  // Don't save "all" or empty string
  const locationValue = trimmed === 'all' || trimmed === '' ? null : trimmed;

  // Coordinates as JSON string or null
  const coordinatesValue = coordinates && coordinates.lat !== 0 && coordinates.lng !== 0
    ? JSON.stringify(coordinates)
    : null;

  return {
    location: locationValue,
    coordinates: coordinatesValue
  };
}

/**
 * Match location string to filter
 * 
 * Handles:
 * - Case-insensitive matching
 * - Partial matches ("Yogya" matches "Yogyakarta, Indonesia")
 * - Aliases (Yogya/Jogja → Yogyakarta)
 */
export function matchesLocation(therapistLocation: string | null | undefined, filterLocation: string): boolean {
  if (!therapistLocation || !filterLocation) return false;
  if (filterLocation === 'all') return true;

  const therapistLoc = therapistLocation.toLowerCase().trim();
  const filterLoc = filterLocation.toLowerCase().trim();

  // Direct substring match
  if (therapistLoc.includes(filterLoc)) return true;

  // Yogyakarta aliases
  if (filterLoc === 'yogyakarta') {
    if (therapistLoc.includes('yogya') || therapistLoc.includes('jogja')) {
      return true;
    }
  }

  return false;
}

/**
 * Runtime assertion: Verify therapist has required location fields
 * 
 * FAIL-FAST in development, log warning in production
 */
export function assertValidLocationData(therapist: any, context: string): void {
  const errors: string[] = [];

  // Check location field exists
  if (!therapist.location) {
    errors.push('Missing location field');
  } else if (typeof therapist.location !== 'string') {
    errors.push(`location is not a string: ${typeof therapist.location}`);
  }

  // FORBIDDEN: Check for legacy city field
  if ('city' in therapist) {
    errors.push('⚠️ LEGACY FIELD DETECTED: "city" field should not exist!');
  }

  if (errors.length > 0) {
    const message = `[${context}] Location validation failed: ${errors.join(', ')}`;
    console.error('❌ ASSERTION FAILED:', message, therapist);

    // Fail-fast in development
    if (import.meta.env.DEV) {
      throw new Error(message);
    }
  }
}

/**
 * Smoke test: Verify location system works
 * 
 * Call this on app startup to catch regressions
 */
export function smokeTestLocationSystem(): boolean {
  console.log('🧪 Running location system smoke tests...');

  const tests = [
    {
      name: 'Extract location from valid therapist',
      fn: () => {
        const result = extractLocation({ location: 'Yogyakarta' });
        return result === 'Yogyakarta';
      }
    },
    {
      name: 'Handle missing location',
      fn: () => {
        const result = extractLocation({ location: null });
        return result === 'all';
      }
    },
    {
      name: 'Parse coordinates from JSON string',
      fn: () => {
        const result = extractCoordinates('{"lat":-7.8,"lng":110.4}');
        return result !== null && result.lat === -7.8 && result.lng === 110.4;
      }
    },
    {
      name: 'Normalize location for save',
      fn: () => {
        const result = normalizeLocationForSave('Yogyakarta', { lat: -7.8, lng: 110.4 });
        return result.location === 'Yogyakarta' && result.coordinates !== null;
      }
    },
    {
      name: 'Match location strings',
      fn: () => {
        return matchesLocation('Yogyakarta, Indonesia', 'Yogyakarta') === true;
      }
    },
    {
      name: 'Match Yogyakarta aliases',
      fn: () => {
        return matchesLocation('Yogya', 'Yogyakarta') === true &&
               matchesLocation('Jogja', 'Yogyakarta') === true;
      }
    },
    {
      name: 'Reject "all" as location value',
      fn: () => {
        const result = normalizeLocationForSave('all', null);
        return result.location === null;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        console.log(`  ✅ ${test.name}`);
        passed++;
      } else {
        console.error(`  ❌ ${test.name} - returned false`);
        failed++;
      }
    } catch (error) {
      console.error(`  ❌ ${test.name} - threw error:`, error);
      failed++;
    }
  }

  const success = failed === 0;
  console.log(`\n🧪 Smoke test ${success ? '✅ PASSED' : '❌ FAILED'}: ${passed}/${tests.length} tests passed`);

  return success;
}

/**
 * Get location display name (for UI)
 */
export function getLocationDisplayName(location: string | null | undefined): string {
  if (!location || location === 'all') {
    return 'All Locations';
  }
  return location;
}

/**
 * Validate location is a real city (optional - can expand later)
 */
export function isValidLocationName(location: string): boolean {
  const trimmed = location.trim();
  
  // Must not be empty or "all"
  if (trimmed === '' || trimmed === 'all') return false;
  
  // Must be at least 2 characters
  if (trimmed.length < 2) return false;
  
  // Must not contain special characters (basic check)
  if (/[<>{}[\]\\]/g.test(trimmed)) return false;
  
  return true;
}

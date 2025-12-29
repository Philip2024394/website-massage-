/**
 * Location Normalization Utility - LocationID Architecture
 * 
 * CRITICAL: locationId is the CANONICAL KEY - NEVER use Appwrite $id
 * 
 * Schema:
 *   - locationId (STRING) - Canonical key: "yogyakarta", "bandung", etc.
 *   - location (STRING) - Display name: "Yogyakarta", "Bandung", etc.
 *   - coordinates (STRING) - JSON: {lat, lng, location}
 * 
 * BULLETPROOF RULES:
 * 1. All business logic uses locationId (slug format)
 * 2. Ignore Appwrite collection $id completely
 * 3. Dashboard dropdown saves locationId
 * 4. Homepage filtering uses locationId
 * 5. Fail-fast checks for missing locationId on live therapists
 */

/**
 * CANONICAL LOCATION IDs - Single source of truth
 */
export const LOCATION_IDS = {
  YOGYAKARTA: 'yogyakarta',
  BANDUNG: 'bandung',
  JAKARTA: 'jakarta',
  SURABAYA: 'surabaya',
  SEMARANG: 'semarang',
  SOLO: 'solo',
  MALANG: 'malang',
  DENPASAR: 'denpasar',
  MEDAN: 'medan',
  MAKASSAR: 'makassar',
  PALEMBANG: 'palembang',
  BALI: 'bali',
  ALL: 'all'
} as const;

/**
 * Location ID to display name mapping
 */
export const LOCATION_NAMES: Record<string, string> = {
  'yogyakarta': 'Yogyakarta',
  'bandung': 'Bandung',
  'jakarta': 'Jakarta',
  'surabaya': 'Surabaya',
  'semarang': 'Semarang',
  'solo': 'Solo',
  'malang': 'Malang',
  'denpasar': 'Denpasar',
  'medan': 'Medan',
  'makassar': 'Makassar',
  'palembang': 'Palembang',
  'bali': 'Bali',
  'all': 'All'
};

/**
 * Convert location string to canonical locationId
 * Handles aliases and normalization
 */
export function convertLocationStringToId(location: string): string {
  if (!location) return LOCATION_IDS.ALL;
  
  const normalized = location.toLowerCase().trim();
  
  // Yogyakarta aliases
  if (normalized === 'yogyakarta' || normalized === 'jogja' || normalized === 'yogya' || 
      normalized === 'djokja' || normalized === 'jogjakarta') {
    return LOCATION_IDS.YOGYAKARTA;
  }
  
  // Bandung aliases
  if (normalized === 'bandung' || normalized === 'bandoeng') {
    return LOCATION_IDS.BANDUNG;
  }
  
  // Jakarta aliases
  if (normalized === 'jakarta' || normalized === 'dki jakarta' || normalized === 'batavia') {
    return LOCATION_IDS.JAKARTA;
  }
  
  // Bali/Denpasar aliases
  if (normalized === 'denpasar' || normalized === 'bali') {
    return LOCATION_IDS.DENPASAR;
  }
  
  // Direct matches
  if (normalized === 'surabaya') return LOCATION_IDS.SURABAYA;
  if (normalized === 'semarang') return LOCATION_IDS.SEMARANG;
  if (normalized === 'solo' || normalized === 'surakarta') return LOCATION_IDS.SOLO;
  if (normalized === 'malang') return LOCATION_IDS.MALANG;
  if (normalized === 'medan') return LOCATION_IDS.MEDAN;
  if (normalized === 'makassar' || normalized === 'ujung pandang') return LOCATION_IDS.MAKASSAR;
  if (normalized === 'palembang') return LOCATION_IDS.PALEMBANG;
  if (normalized === 'all') return LOCATION_IDS.ALL;
  
  // If no match, return the normalized string as-is (for new locations)
  return normalized;
}

/**
 * Extract locationId from therapist document (CANONICAL KEY)
 * FAIL-FAST: Logs error if missing for live therapists
 */
export function extractLocationId(therapist: any): string {
  if (!therapist) return LOCATION_IDS.ALL;
  
  // PRIMARY: locationId field (canonical)
  if (therapist.locationId && typeof therapist.locationId === 'string') {
    const normalized = therapist.locationId.trim().toLowerCase();
    if (normalized && normalized !== '' && normalized !== 'null' && normalized !== 'undefined') {
      return normalized;
    }
  }
  
  // FALLBACK: Convert location string to locationId (migration support)
  if (therapist.location && typeof therapist.location === 'string') {
    const locationStr = therapist.location.trim();
    const locationId = convertLocationStringToId(locationStr);
    if (locationId !== LOCATION_IDS.ALL) {
      console.log(`🔄 Migrating location "${locationStr}" → locationId "${locationId}" for ${therapist.name || therapist.$id}`);
      return locationId;
    }
  }
  
  // FAIL-FAST: Log error for live therapists without locationId
  if (therapist.isLive) {
    console.error(`❌ MISSING locationId for LIVE therapist: ${therapist.name} (${therapist.$id})`);
  }
  
  return LOCATION_IDS.ALL;
}

/**
 * Extract location display name from therapist document
 */
export function extractLocation(therapist: any): string {
  if (!therapist) return 'all';
  
  // Get locationId first
  const locationId = extractLocationId(therapist);
  
  // Return display name from mapping
  return LOCATION_NAMES[locationId] || locationId;
}

/**
 * Normalize location data for saving to Appwrite
 * Returns: { location, locationId, coordinates }
 * INCLUDES locationId as canonical key
 */
export function normalizeLocationForSave(location: string, coordinates?: any): {
  location: string;
  locationId: string;
  coordinates: string | null;
} {
  const normalizedLocation = location.trim();
  const locationId = convertLocationStringToId(normalizedLocation);
  
  // FAIL-FAST: Prevent saving without valid locationId
  if (!locationId || locationId === '') {
    throw new Error(`❌ Cannot save: Invalid locationId for location "${location}"`);
  }
  
  // Parse coordinates
  let coordsString = null;
  if (coordinates) {
    const parsed = extractCoordinates(coordinates);
    if (parsed.lat !== null && parsed.lng !== null) {
      coordsString = JSON.stringify({
        lat: parsed.lat,
        lng: parsed.lng,
        location: normalizedLocation
      });
    }
  }
  
  console.log(`💾 Saving location: "${normalizedLocation}" → locationId: "${locationId}"`);
  
  return {
    location: normalizedLocation,
    locationId: locationId,  // ← CANONICAL KEY
    coordinates: coordsString
  };
}

/**
 * Check if therapist matches filter location (CANONICAL - uses locationId)
 * BULLETPROOF: Uses locationId comparison only
 */
export function matchesLocationId(therapist: any, filterLocationId: string): boolean {
  if (!therapist || !filterLocationId) return false;
  if (filterLocationId === LOCATION_IDS.ALL) return true;
  
  const therapistLocationId = extractLocationId(therapist);
  const filterLoc = filterLocationId.toLowerCase().trim();
  
  const matches = therapistLocationId === filterLoc;
  
  if (matches) {
    console.log(`✅ Location match: ${therapist.name || therapist.$id} (${therapistLocationId}) matches filter (${filterLoc})`);
  }
  
  return matches;
}

/**
 * LEGACY: Check if therapist location matches filter (backward compatibility)
 * MIGRATE TO: matchesLocationId
 */
export function matchesLocation(therapistLocation: string | undefined, filterLocation: string): boolean {
  if (!therapistLocation || !filterLocation) return false;
  if (filterLocation === 'all') return true;
  
  // Convert both to locationId and compare
  const therapistLocationId = convertLocationStringToId(therapistLocation);
  const filterLocationId = convertLocationStringToId(filterLocation);
  
  return therapistLocationId === filterLocationId;
}

/**
 * Extract coordinates from various formats
 */
export function extractCoordinates(coords: any): { lat: number | null; lng: number | null; location: string | null } {
  if (!coords) return { lat: null, lng: null, location: null };
  
  // If string, parse JSON
  if (typeof coords === 'string') {
    try {
      const parsed = JSON.parse(coords);
      return {
        lat: parsed.lat ?? null,
        lng: parsed.lng ?? null,
        location: parsed.location ?? null
      };
    } catch (e) {
      console.warn('⚠️ Failed to parse coordinates:', coords);
      return { lat: null, lng: null, location: null };
    }
  }
  
  // If object, extract directly
  if (typeof coords === 'object') {
    return {
      lat: coords.lat ?? null,
      lng: coords.lng ?? null,
      location: coords.location ?? null
    };
  }
  
  return { lat: null, lng: null, location: null };
}

/**
 * Assert therapist has valid locationId (FAIL-FAST)
 * Throws in dev, logs error in production
 */
export function assertValidLocationId(therapist: any, context: string): void {
  if (!therapist) {
    const msg = `${context}: Therapist is null/undefined`;
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg);
    } else {
      console.error(`❌ ${msg}`);
    }
    return;
  }
  
  const locationId = extractLocationId(therapist);
  
  // FAIL-FAST: Live therapists MUST have valid locationId
  if (therapist.isLive && (!locationId || locationId === LOCATION_IDS.ALL)) {
    const msg = `${context}: CRITICAL - Live therapist "${therapist.name}" (${therapist.$id}) has no valid locationId`;
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg);
    } else {
      console.error(`❌ ${msg}`);
    }
  }
  
  // Verify locationId field exists
  if (!therapist.locationId) {
    console.warn(`⚠️ ${context}: Therapist "${therapist.name}" (${therapist.$id}) missing locationId field (using fallback)`);
  }
}

/**
 * Assert therapist has valid location data (LEGACY)
 */
export function assertValidLocationData(therapist: any, context: string): void {
  if (!therapist) {
    const msg = `${context}: Therapist is null/undefined`;
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg);
    } else {
      console.warn(`⚠️ ${msg}`);
    }
    return;
  }
  
  // Use new locationId-based assertion
  assertValidLocationId(therapist, context);
  
  // FORBIDDEN: Check for legacy 'city' field
  if (therapist.city) {
    const msg = `${context}: FORBIDDEN - Therapist "${therapist.name}" (${therapist.$id}) has 'city' field. Use 'location' and 'locationId' only!`;
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg);
    } else {
      console.error(`❌ ${msg}`);
    }
  }
}

/**
 * Validate therapists array before rendering (SMOKE TEST)
 */
export function validateTherapistsBeforeRender(therapists: any[], context: string): void {
  if (!therapists || !Array.isArray(therapists)) {
    console.error(`❌ ${context}: therapists is not an array`, therapists);
    return;
  }
  
  const liveTherapists = therapists.filter(t => t.isLive);
  const missingLocationId = liveTherapists.filter(t => !extractLocationId(t) || extractLocationId(t) === LOCATION_IDS.ALL);
  
  if (missingLocationId.length > 0) {
    console.error(`❌ ${context}: ${missingLocationId.length}/${liveTherapists.length} live therapists missing locationId:`, 
      missingLocationId.map(t => ({ name: t.name, id: t.$id, location: t.location })));
  } else {
    console.log(`✅ ${context}: All ${liveTherapists.length} live therapists have valid locationId`);
  }
}

/**
 * Smoke test location system on startup
 */
export function smokeTestLocationSystem(): boolean {
  console.log('🧪 Running location system smoke tests...');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: convertLocationStringToId
  const tests = [
    { input: 'Yogyakarta', expected: 'yogyakarta' },
    { input: 'Jogja', expected: 'yogyakarta' },
    { input: 'Bandung', expected: 'bandung' },
    { input: 'Jakarta', expected: 'jakarta' },
  ];
  
  tests.forEach(test => {
    const result = convertLocationStringToId(test.input);
    if (result === test.expected) {
      passed++;
    } else {
      console.error(`❌ Test failed: "${test.input}" → "${result}" (expected "${test.expected}")`);
      failed++;
    }
  });
  
  // Test 2: normalizeLocationForSave
  try {
    const normalized = normalizeLocationForSave('Yogyakarta');
    if (normalized.locationId === 'yogyakarta' && normalized.location === 'Yogyakarta') {
      passed++;
    } else {
      console.error('❌ normalizeLocationForSave failed');
      failed++;
    }
  } catch (e) {
    console.error('❌ normalizeLocationForSave threw error:', e);
    failed++;
  }
  
  const totalTests = passed + failed;
  console.log(`🧪 Smoke tests: ${passed}/${totalTests} passed`);
  
  return failed === 0;
}

/**
 * Validate location name (for user input)
 */
export function isValidLocationName(location: string): boolean {
  if (!location || typeof location !== 'string') return false;
  const trimmed = location.trim();
  return trimmed.length > 0 && trimmed !== 'null' && trimmed !== 'undefined';
}

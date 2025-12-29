/**
 * Production Smoke Tests - Location System
 * 
 * Run these tests on application startup to catch regressions
 * Call smokeTestLocationSystem() in main.tsx or App.tsx
 */

import { 
  extractLocation, 
  extractCoordinates, 
  normalizeLocationForSave, 
  matchesLocation,
  assertValidLocationData,
  smokeTestLocationSystem,
  isValidLocationName
} from '../utils/locationNormalization';

/**
 * Test therapist data samples
 */
const VALID_THERAPIST = {
  location: 'Yogyakarta',
  coordinates: '{"lat":-7.8,"lng":110.4}'
};

const INVALID_THERAPIST_NO_LOCATION = {
  coordinates: '{"lat":-7.8,"lng":110.4}'
};

const LEGACY_THERAPIST_WITH_CITY = {
  city: 'Yogyakarta',  // FORBIDDEN - should trigger warning
  location: 'Yogyakarta',
  coordinates: '{"lat":-7.8,"lng":110.4}'
};

/**
 * Integration test: Dashboard → Save → Load flow
 */
function testDashboardSaveLoadFlow(): boolean {
  console.log('\n🧪 Test: Dashboard Save/Load Flow');
  
  try {
    // 1. User selects "Yogyakarta" from dropdown
    const selectedCity = 'Yogyakarta';
    const coordinates = { lat: -7.8, lng: 110.4 };
    
    // 2. Normalize for save
    const saveData = normalizeLocationForSave(selectedCity, coordinates);
    
    // 3. Verify save data structure
    if (saveData.location !== 'Yogyakarta') {
      console.error('  ❌ Save data location incorrect:', saveData.location);
      return false;
    }
    
    if (!saveData.coordinates) {
      console.error('  ❌ Save data coordinates missing');
      return false;
    }
    
    // 4. Simulate load from database (assume it saved correctly)
    const loadedTherapist = {
      location: saveData.location,
      coordinates: saveData.coordinates
    };
    
    // 5. Extract location on load
    const loadedLocation = extractLocation(loadedTherapist);
    
    // 6. Verify location persists
    if (loadedLocation !== selectedCity) {
      console.error('  ❌ Location did not persist:', { selected: selectedCity, loaded: loadedLocation });
      return false;
    }
    
    console.log('  ✅ Dashboard save/load flow works');
    return true;
    
  } catch (error) {
    console.error('  ❌ Dashboard flow threw error:', error);
    return false;
  }
}

/**
 * Integration test: Homepage filtering
 */
function testHomepageFiltering(): boolean {
  console.log('\n🧪 Test: Homepage Filtering');
  
  const therapists = [
    { name: 'Budi', location: 'Yogyakarta, Indonesia' },
    { name: 'Surtiningsih', location: 'Yogyakarta' },
    { name: 'Aditia', location: 'Bandung' },
    { name: 'NoLocation', location: null }
  ];
  
  try {
    // Test 1: Filter Yogyakarta
    const yogyaFilter = therapists.filter(t => matchesLocation(t.location, 'Yogyakarta'));
    if (yogyaFilter.length !== 2) {
      console.error('  ❌ Yogyakarta filter returned', yogyaFilter.length, 'expected 2');
      return false;
    }
    
    // Test 2: Filter Bandung
    const bandungFilter = therapists.filter(t => matchesLocation(t.location, 'Bandung'));
    if (bandungFilter.length !== 1) {
      console.error('  ❌ Bandung filter returned', bandungFilter.length, 'expected 1');
      return false;
    }
    
    // Test 3: Filter "all"
    const allFilter = therapists.filter(t => matchesLocation(t.location, 'all'));
    if (allFilter.length !== 4) {
      console.error('  ❌ "all" filter returned', allFilter.length, 'expected 4');
      return false;
    }
    
    // Test 4: Alias matching
    if (!matchesLocation('Yogya', 'Yogyakarta')) {
      console.error('  ❌ Alias "Yogya" did not match "Yogyakarta"');
      return false;
    }
    
    if (!matchesLocation('Jogja', 'Yogyakarta')) {
      console.error('  ❌ Alias "Jogja" did not match "Yogyakarta"');
      return false;
    }
    
    console.log('  ✅ Homepage filtering works');
    return true;
    
  } catch (error) {
    console.error('  ❌ Filtering threw error:', error);
    return false;
  }
}

/**
 * Integration test: Coordinate parsing
 */
function testCoordinateParsing(): boolean {
  console.log('\n🧪 Test: Coordinate Parsing');
  
  try {
    // Test 1: JSON string
    const coords1 = extractCoordinates('{"lat":-7.8,"lng":110.4}');
    if (!coords1 || coords1.lat !== -7.8 || coords1.lng !== 110.4) {
      console.error('  ❌ Failed to parse JSON string coordinates');
      return false;
    }
    
    // Test 2: Object
    const coords2 = extractCoordinates({ lat: -7.8, lng: 110.4 });
    if (!coords2 || coords2.lat !== -7.8 || coords2.lng !== 110.4) {
      console.error('  ❌ Failed to parse object coordinates');
      return false;
    }
    
    // Test 3: Null
    const coords3 = extractCoordinates(null);
    if (coords3 !== null) {
      console.error('  ❌ Null coordinates should return null');
      return false;
    }
    
    // Test 4: Invalid JSON
    const coords4 = extractCoordinates('invalid json');
    if (coords4 !== null) {
      console.error('  ❌ Invalid JSON should return null');
      return false;
    }
    
    console.log('  ✅ Coordinate parsing works');
    return true;
    
  } catch (error) {
    console.error('  ❌ Coordinate parsing threw error:', error);
    return false;
  }
}

/**
 * Regression test: Detect legacy city field
 */
function testLegacyCityFieldDetection(): boolean {
  console.log('\n🧪 Test: Legacy City Field Detection');
  
  try {
    // Should not throw in production, but should log warning
    const consoleErrorSpy = console.error;
    let errorLogged = false;
    
    console.error = (...args: any[]) => {
      if (args[0]?.includes?.('LEGACY FIELD DETECTED')) {
        errorLogged = true;
      }
      consoleErrorSpy.apply(console, args);
    };
    
    assertValidLocationData(LEGACY_THERAPIST_WITH_CITY, 'smoke-test');
    
    console.error = consoleErrorSpy;
    
    if (!errorLogged) {
      console.error('  ❌ Legacy city field was not detected!');
      return false;
    }
    
    console.log('  ✅ Legacy city field detection works');
    return true;
    
  } catch (error) {
    console.error('  ❌ Legacy detection threw unexpected error:', error);
    return false;
  }
}

/**
 * Edge case test: Empty and invalid locations
 */
function testEdgeCases(): boolean {
  console.log('\n🧪 Test: Edge Cases');
  
  try {
    // Test 1: Empty string
    if (isValidLocationName('')) {
      console.error('  ❌ Empty string should be invalid');
      return false;
    }
    
    // Test 2: "all"
    if (isValidLocationName('all')) {
      console.error('  ❌ "all" should be invalid');
      return false;
    }
    
    // Test 3: Single character
    if (isValidLocationName('Y')) {
      console.error('  ❌ Single character should be invalid');
      return false;
    }
    
    // Test 4: Special characters
    if (isValidLocationName('Yogya<script>')) {
      console.error('  ❌ Special characters should be invalid');
      return false;
    }
    
    // Test 5: Valid location
    if (!isValidLocationName('Yogyakarta')) {
      console.error('  ❌ "Yogyakarta" should be valid');
      return false;
    }
    
    // Test 6: Extract from undefined
    const result = extractLocation(undefined as any);
    if (result !== 'all') {
      console.error('  ❌ Undefined therapist should return "all"');
      return false;
    }
    
    console.log('  ✅ Edge cases handled correctly');
    return true;
    
  } catch (error) {
    console.error('  ❌ Edge case test threw error:', error);
    return false;
  }
}

/**
 * Run all production smoke tests
 * 
 * Returns true if all tests pass, false otherwise
 */
export function runProductionSmokeTests(): boolean {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 PRODUCTION SMOKE TESTS - Location System');
  console.log('='.repeat(80));
  
  const tests = [
    { name: 'Core utilities', fn: smokeTestLocationSystem },
    { name: 'Dashboard save/load flow', fn: testDashboardSaveLoadFlow },
    { name: 'Homepage filtering', fn: testHomepageFiltering },
    { name: 'Coordinate parsing', fn: testCoordinateParsing },
    { name: 'Legacy city field detection', fn: testLegacyCityFieldDetection },
    { name: 'Edge cases', fn: testEdgeCases }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        passed++;
      } else {
        console.error(`\n❌ Test suite "${test.name}" FAILED`);
        failed++;
      }
    } catch (error) {
      console.error(`\n❌ Test suite "${test.name}" threw error:`, error);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  const success = failed === 0;
  if (success) {
    console.log(`✅ ALL SMOKE TESTS PASSED: ${passed}/${tests.length}`);
  } else {
    console.error(`❌ SMOKE TESTS FAILED: ${passed} passed, ${failed} failed`);
  }
  console.log('='.repeat(80) + '\n');
  
  return success;
}

/**
 * Runtime assertion middleware - call before rendering therapists
 */
export function validateTherapistsBeforeRender(therapists: any[]): void {
  if (!Array.isArray(therapists)) {
    console.error('❌ ASSERTION: therapists is not an array');
    return;
  }
  
  for (const therapist of therapists) {
    // Check for location field
    if (!therapist.location) {
      console.warn('⚠️ Therapist missing location:', therapist.name || therapist.$id);
    }
    
    // Check for forbidden city field
    if ('city' in therapist) {
      console.error('❌ FORBIDDEN: Therapist has "city" field:', therapist.name || therapist.$id);
    }
  }
}

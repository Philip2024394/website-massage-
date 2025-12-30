// Test script to verify Yogyakarta filtering logic - inline implementation
console.log('🧪 Testing Yogyakarta Location Filtering Logic\n');

// Inline implementation of matchesLocation function
function matchesLocation(therapistLocation, filterLocation) {
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

// Test cases based on real data
const testCases = [
    // Should match yogyakarta
    { therapistLocation: 'Yogyakarta', filterLocation: 'yogyakarta', expected: true },
    { therapistLocation: 'yogyakarta', filterLocation: 'yogyakarta', expected: true },
    { therapistLocation: 'YOGYAKARTA', filterLocation: 'yogyakarta', expected: true },
    { therapistLocation: 'Yogya', filterLocation: 'yogyakarta', expected: true },
    { therapistLocation: 'yogya', filterLocation: 'yogyakarta', expected: true },
    { therapistLocation: 'Jogja', filterLocation: 'yogyakarta', expected: true },
    { therapistLocation: 'jogja', filterLocation: 'yogyakarta', expected: true },
    
    // Should NOT match yogyakarta
    { therapistLocation: 'Bali', filterLocation: 'yogyakarta', expected: false },
    { therapistLocation: 'Jakarta', filterLocation: 'yogyakarta', expected: false },
    { therapistLocation: 'Bandung', filterLocation: 'yogyakarta', expected: false },
    { therapistLocation: null, filterLocation: 'yogyakarta', expected: false },
    { therapistLocation: undefined, filterLocation: 'yogyakarta', expected: false },
    { therapistLocation: '', filterLocation: 'yogyakarta', expected: false },
];

let passedTests = 0;
let totalTests = testCases.length;

console.log('Test Results:');
console.log('=============\n');

testCases.forEach((test, index) => {
    const result = matchesLocation(test.therapistLocation, test.filterLocation);
    const passed = result === test.expected;
    
    if (passed) {
        passedTests++;
        console.log(`✅ Test ${index + 1}: PASS`);
    } else {
        console.log(`❌ Test ${index + 1}: FAIL`);
    }
    
    console.log(`   Location: "${test.therapistLocation}" → Filter: "${test.filterLocation}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result}\n`);
});

console.log('=============');
console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Yogyakarta filtering logic is working correctly.');
} else {
    console.log('⚠️ Some tests failed. There may be an issue with the filtering logic.');
}
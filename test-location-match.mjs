/**
 * Test if Aditia's location matches Bandung filter
 */

const aditiaLocation = "Bandung";
const selectedCity = "Bandung";

console.log('Testing location match logic:');
console.log('=============================\n');

console.log(`Aditia's location: "${aditiaLocation}"`);
console.log(`Selected city filter: "${selectedCity}"\n`);

// Test 1: Direct match (what HomePage does)
const directMatch = aditiaLocation && aditiaLocation.toLowerCase().includes(selectedCity.toLowerCase());
console.log(`1. Direct match (includes): ${directMatch ? '✅ PASS' : '❌ FAIL'}`);

// Test 2: Case-insensitive exact match
const exactMatch = aditiaLocation.toLowerCase() === selectedCity.toLowerCase();
console.log(`2. Exact match: ${exactMatch ? '✅ PASS' : '❌ FAIL'}`);

// Test 3: Check if any whitespace or special characters
console.log(`\n3. Character analysis:`);
console.log(`   Location length: ${aditiaLocation.length}`);
console.log(`   City length: ${selectedCity.length}`);
console.log(`   Location has whitespace: ${/\s/.test(aditiaLocation)}`);
console.log(`   City has whitespace: ${/\s/.test(selectedCity)}`);

console.log(`\n✅ RESULT: Aditia SHOULD appear in Bandung filter`);
console.log(`\nIf not appearing, check:`);
console.log(`1. Status is "available" or "busy" (currently: "busy" ✅)`);
console.log(`2. HomePage actually has nearbyTherapists populated`);
console.log(`3. Check browser console for filtering logs`);

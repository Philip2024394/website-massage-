/**
 * Test Aditia filtering logic exactly as HomePage does
 */

// Mock Aditia's data
const aditia = {
    $id: 'test-id',
    name: 'Aditia',
    email: 'indastreet29@gmail.com',
    status: 'busy',
    isLive: true,
    location: 'Bandung',
    city: null,
    coordinates: null,
    description: 'Test description',
    whatsappNumber: '+6281234567890',
    price60: 100
};

const selectedCity = 'Bandung';

console.log('Testing Aditia filtering logic:\n');
console.log('================================\n');

// Test 1: shouldTreatTherapistAsLive
const normalizedStatus = (aditia.status || '').toString().trim().toLowerCase();
const statusImpliesLive = normalizedStatus === 'available' || normalizedStatus === 'busy' || normalizedStatus === 'online';
const normalizedLiveFlag = aditia.isLive;
const explicitOffline = normalizedStatus === 'offline' || normalizedLiveFlag === false;

console.log('1️⃣  LIVE STATUS CHECK');
console.log(`   Status: "${normalizedStatus}"`);
console.log(`   statusImpliesLive: ${statusImpliesLive}`);
console.log(`   normalizedLiveFlag: ${normalizedLiveFlag}`);
console.log(`   explicitOffline: ${explicitOffline}`);

let treatedAsLive = false;
if (explicitOffline) {
    treatedAsLive = false;
} else if (normalizedLiveFlag === true) {
    treatedAsLive = true;
} else if (normalizedLiveFlag === null) {
    treatedAsLive = statusImpliesLive || normalizedStatus.length === 0;
} else {
    treatedAsLive = statusImpliesLive;
}

console.log(`   ➡️  treatedAsLive: ${treatedAsLive ? '✅ YES' : '❌ NO'}\n`);

// Test 2: City filtering
console.log('2️⃣  CITY FILTERING');
console.log(`   Selected city: "${selectedCity}"`);
console.log(`   Aditia location: "${aditia.location}"`);

const locationMatch = aditia.location && aditia.location.toLowerCase().includes(selectedCity.toLowerCase());
console.log(`   Location match: ${locationMatch ? '✅ YES' : '❌ NO'}\n`);

// Test 3: Final result
console.log('3️⃣  FINAL RESULT');
const shouldAppear = treatedAsLive && locationMatch;
console.log(`   Should Aditia appear in Bandung: ${shouldAppear ? '✅ YES' : '❌ NO'}`);

if (!shouldAppear) {
    console.log('\n❌ PROBLEM FOUND:');
    if (!treatedAsLive) {
        console.log('   - Aditia is not treated as live!');
        console.log(`   - Status: ${aditia.status}, isLive: ${aditia.isLive}`);
    }
    if (!locationMatch) {
        console.log('   - Location does not match!');
        console.log(`   - Location: "${aditia.location}", City: "${selectedCity}"`);
    }
} else {
    console.log('\n✅ All checks pass! Aditia SHOULD appear in Bandung.');
    console.log('   If not appearing on live site, check:');
    console.log('   1. Browser cache (hard refresh: Ctrl+Shift+R)');
    console.log('   2. Wait 2-3 minutes for deployment');
    console.log('   3. Check browser console for filtering logs');
    console.log('   4. Verify therapists are loaded (check Network tab)');
}

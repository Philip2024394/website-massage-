import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);

const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🔍 DEBUGGING ADITIA BANDUNG FILTERING ISSUE');
console.log('===========================================\n');

async function debugAditia() {
try {
  const result = await databases.listDocuments(
    databaseId,
    therapistsCollectionId,
    [Query.limit(500)]
  );

  const therapists = result.documents;
  const aditia = therapists.find(t => t.name === 'Aditia');
  
  if (!aditia) {
    console.log('❌ ADITIA NOT FOUND IN DATABASE');
    return;
  }

  console.log('👤 ADITIA\'S COMPLETE DATA:');
  console.log('---------------------------');
  console.log('Name:', aditia.name);
  console.log('Email:', aditia.email);
  console.log('Location:', `"${aditia.location}"`);
  console.log('LocationId:', `"${aditia.locationId}"`);
  console.log('IsLive:', aditia.isLive);
  console.log('Status:', aditia.status);
  console.log('Coordinates:', aditia.coordinates ? 'HAS COORDS' : 'NO COORDS');
  console.log('');

  // Test V2 filtering logic manually
  console.log('🧪 TESTING V2 FILTERING LOGIC:');
  console.log('-------------------------------');
  
  // Simulate convertLocationStringToId("Bandung")
  const selectedCity = "Bandung";
  const filterLocationId = selectedCity.toLowerCase(); // Simple conversion for test
  console.log(`Selected city: "${selectedCity}"`);
  console.log(`Filter locationId: "${filterLocationId}"`);
  console.log('');
  
  // Test matching logic
  console.log('🔍 MATCHING TESTS:');
  console.log('------------------');
  
  console.log('Test 1: Direct locationId match');
  console.log(`  aditia.locationId (${aditia.locationId}) === filterLocationId (${filterLocationId}): ${aditia.locationId === filterLocationId}`);
  
  console.log('Test 2: Case insensitive match');
  console.log(`  aditia.locationId.toLowerCase() (${aditia.locationId?.toLowerCase()}) === filterLocationId (${filterLocationId}): ${aditia.locationId?.toLowerCase() === filterLocationId}`);
  
  console.log('Test 3: Location string match');
  console.log(`  aditia.location.toLowerCase() (${aditia.location?.toLowerCase()}) includes filterLocationId (${filterLocationId}): ${aditia.location?.toLowerCase()?.includes(filterLocationId)}`);
  
  console.log('');
  
  // Check if Aditia should be considered "live"
  console.log('🟢 LIVE STATUS CHECK:');
  console.log('---------------------');
  console.log('isLive:', aditia.isLive);
  console.log('status:', aditia.status);
  console.log('Should appear in filtering:', aditia.isLive === true);
  console.log('');
  
  // Check all therapists in Bandung
  console.log('📍 ALL BANDUNG THERAPISTS:');
  console.log('--------------------------');
  const bandungTherapists = therapists.filter(t => 
    t.locationId === 'bandung' || 
    t.location?.toLowerCase().includes('bandung')
  );
  
  console.log(`Found ${bandungTherapists.length} therapists with Bandung location:`);
  bandungTherapists.forEach((t, index) => {
    console.log(`${index + 1}. ${t.name} - location: "${t.location}", locationId: "${t.locationId}", isLive: ${t.isLive}`);
  });
  console.log('');
  
  // Check live Bandung therapists specifically
  const liveBandungTherapists = bandungTherapists.filter(t => t.isLive === true);
  console.log('🟢 LIVE BANDUNG THERAPISTS:');
  console.log(`Found ${liveBandungTherapists.length} live therapists in Bandung:`);
  liveBandungTherapists.forEach((t, index) => {
    console.log(`${index + 1}. ${t.name} - SHOULD APPEAR IN BANDUNG FILTER`);
  });
  console.log('');
  
  // Analysis
  console.log('📊 ISSUE ANALYSIS:');
  console.log('------------------');
  if (aditia.isLive !== true) {
    console.log('❌ ISSUE FOUND: Aditia is NOT live (isLive !== true)');
    console.log('   This means he won\'t appear in homepage filtering');
    console.log('   Need to set isLive: true for Aditia');
  } else if (aditia.locationId !== 'bandung') {
    console.log('❌ ISSUE FOUND: Aditia\'s locationId is not "bandung"');
    console.log(`   Current locationId: "${aditia.locationId}"`);
    console.log('   Need to fix locationId');
  } else {
    console.log('✅ DATA LOOKS CORRECT - Issue might be in frontend filtering logic');
    console.log('   Check browser console for filtering errors');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}
}

// Run the debug function
debugAditia();
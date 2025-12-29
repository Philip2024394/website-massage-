import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);

const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🔍 FULL LOCATION SYSTEM SCAN');
console.log('============================\n');

// 1. Check therapist location data
console.log('1️⃣ THERAPIST LOCATION DATA AUDIT');
console.log('----------------------------------');

try {
  const result = await databases.listDocuments(
    databaseId,
    therapistsCollectionId,
    [Query.limit(500)]
  );

  const therapists = result.documents;
  console.log(`📊 Found ${therapists.length} therapists\n`);

  let hasLocationId = 0;
  let hasLocation = 0;
  let hasCoordinates = 0;
  let isLive = 0;
  let locationGroups = {};

  console.log('THERAPIST LOCATION BREAKDOWN:');
  console.log('----------------------------');
  
  therapists.forEach((therapist, index) => {
    const name = therapist.name || 'Unknown';
    const status = therapist.isLive ? '🟢 LIVE' : '⚫ INACTIVE';
    const location = therapist.location || 'NO LOCATION';
    const locationId = therapist.locationId || 'NO LOCATIONID';
    const coordinates = therapist.coordinates ? '✅ HAS COORDS' : '❌ NO COORDS';
    
    console.log(`${index + 1}. ${name} ${status}`);
    console.log(`   Location: "${location}"`);
    console.log(`   LocationId: "${locationId}"`);
    console.log(`   Coordinates: ${coordinates}`);
    console.log('');
    
    // Count statistics
    if (therapist.locationId) hasLocationId++;
    if (therapist.location) hasLocation++;
    if (therapist.coordinates) hasCoordinates++;
    if (therapist.isLive) isLive++;
    
    // Group by locationId
    const lid = therapist.locationId || 'no-locationid';
    if (!locationGroups[lid]) locationGroups[lid] = [];
    locationGroups[lid].push(name);
  });

  console.log('📈 STATISTICS SUMMARY:');
  console.log('---------------------');
  console.log(`Total Therapists: ${therapists.length}`);
  console.log(`✅ Have locationId: ${hasLocationId}/${therapists.length}`);
  console.log(`✅ Have location: ${hasLocation}/${therapists.length}`);
  console.log(`✅ Have coordinates: ${hasCoordinates}/${therapists.length}`);
  console.log(`🟢 Live therapists: ${isLive}/${therapists.length}`);
  console.log('');

  console.log('🗺️  LOCATION GROUPS:');
  console.log('-------------------');
  Object.keys(locationGroups).forEach(locationId => {
    const count = locationGroups[locationId].length;
    console.log(`${locationId}: ${count} therapists`);
    locationGroups[locationId].forEach(name => {
      console.log(`   - ${name}`);
    });
    console.log('');
  });

  // Check for any missing critical fields on LIVE therapists
  console.log('⚠️  CRITICAL ISSUES CHECK:');
  console.log('-------------------------');
  let criticalIssues = 0;
  
  therapists.forEach(therapist => {
    if (therapist.isLive) {
      if (!therapist.locationId) {
        console.log(`❌ LIVE therapist "${therapist.name}" missing locationId`);
        criticalIssues++;
      }
      if (!therapist.location) {
        console.log(`❌ LIVE therapist "${therapist.name}" missing location`);
        criticalIssues++;
      }
    }
  });
  
  if (criticalIssues === 0) {
    console.log('✅ NO CRITICAL ISSUES - All live therapists have proper location data');
  } else {
    console.log(`❌ FOUND ${criticalIssues} CRITICAL ISSUES`);
  }

} catch (error) {
  console.error('❌ Error fetching therapists:', error.message);
}

console.log('\n🔍 SCAN COMPLETE');
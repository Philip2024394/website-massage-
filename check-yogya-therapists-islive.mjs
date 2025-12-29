import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_28e3ab8862165ba3c79aed08c53ce08f19c2c72e0e8bb6e8c5e0ddf5e24cc4a2c4c1f6da78d69c6ae36fcc7f7eb3858e2e2d4c4d3b66da525f27597d7a9a30e4d9f7c1f04af8e68efa6e1e95f9b3c69f4fb1b72e3c9eac0dfc4b4a41bb9f99');

const databases = new Databases(client);

console.log('\n🔍 Checking isLive settings for Yogyakarta therapists...\n');

try {
  // Get all therapists
  const response = await databases.listDocuments(
    '68f76ee1000e64ca8d05',
    'therapists_collection_id',
    [Query.limit(500)]
  );

  // Filter Yogyakarta therapists
  const yogyaTherapists = response.documents.filter(t => 
    (t.location && t.location.toLowerCase().includes('yogya')) ||
    (t.city && t.city.toLowerCase().includes('yogya'))
  );

  console.log(`Found ${yogyaTherapists.length} Yogyakarta therapists\n`);

  // Analyze their isLive settings
  const statusGroups = {
    available: [],
    busy: [],
    offline: [],
    other: []
  };

  yogyaTherapists.forEach(t => {
    const status = (t.status || '').toLowerCase();
    const info = {
      name: t.name,
      status: t.status,
      isLive: t.isLive,
      location: t.location,
      city: t.city
    };

    if (status === 'available') statusGroups.available.push(info);
    else if (status === 'busy') statusGroups.busy.push(info);
    else if (status === 'offline') statusGroups.offline.push(info);
    else statusGroups.other.push(info);
  });

  console.log('📊 YOGYAKARTA THERAPISTS isLive SETTINGS:\n');

  console.log(`✅ AVAILABLE (${statusGroups.available.length}):`);
  statusGroups.available.forEach(t => {
    console.log(`   ${t.name}: isLive=${t.isLive}, location="${t.location || t.city}"`);
  });

  console.log(`\n⏱️ BUSY (${statusGroups.busy.length}):`);
  statusGroups.busy.forEach(t => {
    console.log(`   ${t.name}: isLive=${t.isLive}, location="${t.location || t.city}"`);
  });

  console.log(`\n⭕ OFFLINE (${statusGroups.offline.length}):`);
  statusGroups.offline.forEach(t => {
    console.log(`   ${t.name}: isLive=${t.isLive}, location="${t.location || t.city}"`);
  });

  if (statusGroups.other.length > 0) {
    console.log(`\n❓ OTHER STATUS (${statusGroups.other.length}):`);
    statusGroups.other.forEach(t => {
      console.log(`   ${t.name}: status="${t.status}", isLive=${t.isLive}`);
    });
  }

  // Calculate percentages
  const totalYogya = yogyaTherapists.length;
  const liveCount = yogyaTherapists.filter(t => t.isLive === true).length;
  const notLiveCount = yogyaTherapists.filter(t => t.isLive === false).length;
  const nullLiveCount = yogyaTherapists.filter(t => t.isLive === null || t.isLive === undefined).length;

  console.log('\n📈 SUMMARY:');
  console.log(`   Total Yogyakarta therapists: ${totalYogya}`);
  console.log(`   isLive=true: ${liveCount} (${(liveCount/totalYogya*100).toFixed(1)}%)`);
  console.log(`   isLive=false: ${notLiveCount} (${(notLiveCount/totalYogya*100).toFixed(1)}%)`);
  console.log(`   isLive=null/undefined: ${nullLiveCount} (${(nullLiveCount/totalYogya*100).toFixed(1)}%)`);

  console.log('\n🎯 RECOMMENDED SETTING FOR ALL THERAPISTS:');
  if (liveCount > totalYogya * 0.8) {
    console.log('   ✅ isLive should be TRUE for available, busy, AND offline');
    console.log('   ✅ Only set isLive=false when therapist explicitly deactivates account');
  } else {
    console.log('   ⚠️ Mixed settings detected - need consistent policy');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

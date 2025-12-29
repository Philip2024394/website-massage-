import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_28e3ab8862165ba3c79aed08c53ce08f19c2c72e0e8bb6e8c5e0ddf5e24cc4a2c4c1f6da78d69c6ae36fcc7f7eb3858e2e2d4c4d3b66da525f27597d7a9a30e4d9f7c1f04af8e68efa6e1e95f9b3c69f4fb1b72e3c9eac0dfc4b4a41bb9f99');

const databases = new Databases(client);

console.log('\n🔍 Diagnosing Aditia visibility in Bandung dropdown...\n');

// 1. Check Aditia's current profile
console.log('1️⃣ Fetching Aditia profile (indastreet29@gmail.com)...');
const therapists = await databases.listDocuments(
  '68f76ee1000e64ca8d05',
  'therapists_collection_id',
  [Query.equal('email', 'indastreet29@gmail.com'), Query.limit(1)]
);

if (therapists.documents.length === 0) {
  console.log('❌ Aditia not found!');
  process.exit(1);
}

const aditia = therapists.documents[0];
console.log('\n📋 Aditia Profile Data:');
console.log('   Name:', aditia.name);
console.log('   ID:', aditia.$id);
console.log('   Email:', aditia.email);
console.log('   Location field:', aditia.location || 'null');
console.log('   City field:', aditia.city || 'null');
console.log('   Status:', aditia.status);
console.log('   isLive:', aditia.isLive);
console.log('   Coordinates:', aditia.coordinates || 'null');

// 2. Test filtering logic (same as HomePage)
console.log('\n2️⃣ Testing HomePage filtering logic for "Bandung"...');

const selectedCity = 'Bandung';
const lowerCity = selectedCity.toLowerCase();

// Test location field
const locationMatch = aditia.location && aditia.location.toLowerCase().includes(lowerCity);
console.log(`   location="${aditia.location}" matches "Bandung"? ${locationMatch ? '✅ YES' : '❌ NO'}`);

// Test city field
const cityMatch = aditia.city && aditia.city.toLowerCase().includes(lowerCity);
console.log(`   city="${aditia.city}" matches "Bandung"? ${cityMatch ? '✅ YES' : '❌ NO'}`);

// Overall match
const shouldAppear = locationMatch || cityMatch;
console.log(`   Should appear in Bandung dropdown? ${shouldAppear ? '✅ YES' : '❌ NO'}`);

// 3. Check if treated as live
console.log('\n3️⃣ Checking live status logic...');
const treatedAsLive = (aditia.isLive === true) || (aditia.status === 'online');
console.log(`   isLive=${aditia.isLive}, status="${aditia.status}"`);
console.log(`   Treated as live? ${treatedAsLive ? '✅ YES' : '❌ NO'}`);

// 4. Fetch all Bandung therapists for comparison
console.log('\n4️⃣ Fetching all therapists with "Bandung" in location or city...');
const allTherapists = await databases.listDocuments(
  '68f76ee1000e64ca8d05',
  'therapists_collection_id',
  [Query.limit(500)]
);

const bandungTherapists = allTherapists.documents.filter(t => {
  const locMatch = t.location && t.location.toLowerCase().includes('bandung');
  const citMatch = t.city && t.city.toLowerCase().includes('bandung');
  return locMatch || citMatch;
});

console.log(`   Found ${bandungTherapists.length} therapists with Bandung location/city:`);
bandungTherapists.forEach((t, i) => {
  const live = (t.isLive === true) || (t.status === 'online');
  console.log(`   ${i + 1}. ${t.name} (${t.email})`);
  console.log(`      location="${t.location || 'null'}", city="${t.city || 'null'}"`);
  console.log(`      status="${t.status}", isLive=${t.isLive}, treated as live: ${live ? '✅' : '❌'}`);
});

// 5. Final verdict
console.log('\n📊 VERDICT:');
if (shouldAppear && treatedAsLive) {
  console.log('✅ Aditia SHOULD appear in Bandung dropdown');
  console.log('   - Has matching location: ✅');
  console.log('   - Is treated as live: ✅');
  console.log('   ⚠️ If not visible, check:');
  console.log('     1. Browser cache - hard refresh (Ctrl+Shift+R)');
  console.log('     2. Site deployment status (wait 2-3 min after git push)');
  console.log('     3. selectedCity value in dropdown (must be "Bandung" not "all")');
} else {
  console.log('❌ Aditia SHOULD NOT appear because:');
  if (!shouldAppear) console.log('   - No matching location/city field');
  if (!treatedAsLive) console.log('   - Not treated as live (status not online, isLive not true)');
}

console.log('\n');

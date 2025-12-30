// Test if therapists would match the Yogyakarta filter
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

// Copy of matchesLocation from utils
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

console.log('\n🧪 Testing HomePage filtering logic with actual Appwrite data...\n');

try {
    const response = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        [Query.limit(500)]
    );

    const allTherapists = response.documents;
    const selectedCity = 'yogyakarta'; // This is what the dropdown sends
    
    console.log(`📊 Total therapists: ${allTherapists.length}`);
    console.log(`🎯 Filter: "${selectedCity}"`);
    console.log('═'.repeat(60));
    
    // Apply the same filtering logic as HomePage.tsx
    const liveTherapists = allTherapists.filter(t => t.isLive);
    console.log(`\n✅ Live therapists: ${liveTherapists.length}`);
    
    const filteredTherapists = liveTherapists.filter(t => {
        if (selectedCity === 'all') return true;
        
        const matches = matchesLocation(t.location, selectedCity);
        return matches;
    });
    
    console.log(`🎯 Filtered for "${selectedCity}": ${filteredTherapists.length}\n`);
    
    if (filteredTherapists.length > 0) {
        console.log('📍 Matched therapists:');
        filteredTherapists.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t.name} - location: "${t.location}"`);
        });
    } else {
        console.log('❌ NO THERAPISTS MATCHED!\n');
        console.log('🔍 Let\'s check the location field values:');
        liveTherapists.slice(0, 5).forEach((t, i) => {
            const testMatch = matchesLocation(t.location, selectedCity);
            console.log(`   ${i + 1}. ${t.name}`);
            console.log(`      location: "${t.location}"`);
            console.log(`      matches: ${testMatch}`);
        });
    }
    
    console.log('\n✅ Done!\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

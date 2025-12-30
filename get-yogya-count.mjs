import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

console.log('\n🔍 Fetching Yogyakarta therapists from Appwrite...\n');

try {
    const response = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        [Query.limit(500)]
    );

    const allTherapists = response.documents;

    // Filter Yogyakarta therapists
    const yogyaTherapists = allTherapists.filter(t => {
        const location = (t.location || '').toLowerCase();
        const city = (t.city || '').toLowerCase();
        return location.includes('yogya') || location.includes('jogja') || 
               city.includes('yogya') || city.includes('jogja');
    });

    console.log('📊 RESULTS:');
    console.log('═'.repeat(60));
    console.log(`   Total therapists in database: ${allTherapists.length}`);
    console.log(`   Yogyakarta therapists: ${yogyaTherapists.length}`);
    console.log('═'.repeat(60));
    
    if (yogyaTherapists.length > 0) {
        console.log('\n📍 Yogyakarta Therapists:');
        yogyaTherapists.forEach((t, i) => {
            const liveStatus = t.isLive ? '🟢 Live' : '⭕ Offline';
            console.log(`   ${i + 1}. ${t.name} - ${liveStatus}`);
            console.log(`      ID: ${t.$id}`);
            console.log(`      Location: ${t.location || t.city || 'N/A'}`);
            console.log('');
        });
    }

    console.log('✅ Done!\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

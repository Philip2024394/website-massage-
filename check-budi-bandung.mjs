import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_655afe2b29f012a4dc55fbf4e3f54ec4e9c5a77c19b1beee3dba75fb5207e9ace0c1e4e1d8ecc92b1c6a86ce17d6a21b3bf6bbe6dce50dbbdf899bd7d50b36dafee57f99ac29d4b6e39e86a59e7f2b1c8a34c33e1cf8ce5e5da0829a42ee3e68e09c4ac8891f3d1a5bc0b2d19d6ba0c8b1c6e10d9fcdfb19cebb74e4df5c94');

const databases = new Databases(client);

async function checkBudiBandung() {
    console.log('🔍 Searching for Budi therapists in Bandung...\n');

    try {
        // Search for all therapists named Budi
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(500)]
        );

        const budiTherapists = response.documents.filter(t => 
            t.name && t.name.toLowerCase().includes('budi')
        );

        console.log(`Found ${budiTherapists.length} therapist(s) with "Budi" in name:\n`);

        budiTherapists.forEach((therapist, index) => {
            console.log(`--- Budi #${index + 1} ---`);
            console.log(`Document ID: ${therapist.$id}`);
            console.log(`Name: ${therapist.name}`);
            console.log(`Email: ${therapist.email || 'N/A'}`);
            console.log(`Location: ${therapist.location || 'NOT SET'}`);
            console.log(`IsLive: ${therapist.isLive}`);
            console.log(`Coordinates: ${therapist.coordinates || 'N/A'}`);
            console.log(`Created: ${therapist.$createdAt}`);
            console.log('');
        });

        // Check for Bandung Budi specifically
        const bandungBudi = budiTherapists.filter(t => 
            t.location && t.location.toLowerCase().includes('bandung')
        );

        console.log(`\n🎯 Budi therapists in Bandung: ${bandungBudi.length}`);
        
        if (bandungBudi.length > 1) {
            console.log('\n⚠️ DUPLICATE DETECTED! Multiple Budi in Bandung:');
            bandungBudi.forEach((therapist, index) => {
                console.log(`\n  Duplicate #${index + 1}:`);
                console.log(`  - ID: ${therapist.$id}`);
                console.log(`  - Email: ${therapist.email || 'N/A'}`);
                console.log(`  - Created: ${therapist.$createdAt}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkBudiBandung();

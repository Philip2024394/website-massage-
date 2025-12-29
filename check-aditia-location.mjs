import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_655afe2b29f012a4dc55fbf4e3f54ec4e9c5a77c19b1beee3dba75fb5207e9ace0c1e4e1d8ecc92b1c6a86ce17d6a21b3bf6bbe6dce50dbbdf899bd7d50b36dafee57f99ac29d4b6e39e86a59e7f2b1c8a34c33e1cf8ce5e5da0829a42ee3e68e09c4ac8891f3d1a5bc0b2d19d6ba0c8b1c6e10d9fcdfb19cebb74e4df5c94');

const databases = new Databases(client);

async function checkAditiaLocation() {
    console.log('🔍 Searching for Aditia with email indastreet29@gmail.com...\n');

    try {
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(500)]
        );

        // Search by email
        const aditiaByEmail = response.documents.find(t => 
            t.email === 'indastreet29@gmail.com'
        );

        if (aditiaByEmail) {
            console.log('✅ Found Aditia by email:\n');
            console.log(`Document ID: ${aditiaByEmail.$id}`);
            console.log(`Name: ${aditiaByEmail.name}`);
            console.log(`Email: ${aditiaByEmail.email}`);
            console.log(`Location: ${aditiaByEmail.location || 'NOT SET'}`);
            console.log(`IsLive: ${aditiaByEmail.isLive}`);
            console.log(`Coordinates: ${aditiaByEmail.coordinates || 'N/A'}`);
            console.log(`Created: ${aditiaByEmail.$createdAt}`);
            console.log(`Updated: ${aditiaByEmail.$updatedAt}`);
            
            if (aditiaByEmail.location) {
                const isBandung = aditiaByEmail.location.toLowerCase().includes('bandung');
                console.log(`\n🎯 Is in Bandung? ${isBandung ? 'YES ✅' : 'NO ❌'}`);
                console.log(`   Location value: "${aditiaByEmail.location}"`);
            } else {
                console.log('\n⚠️ WARNING: Location field is empty!');
            }
        } else {
            console.log('❌ No therapist found with email: indastreet29@gmail.com');
            
            // Search for any Aditia
            const allAditia = response.documents.filter(t => 
                t.name && t.name.toLowerCase().includes('aditia')
            );
            
            if (allAditia.length > 0) {
                console.log(`\nFound ${allAditia.length} therapist(s) with "Aditia" in name:`);
                allAditia.forEach((therapist, index) => {
                    console.log(`\n--- Aditia #${index + 1} ---`);
                    console.log(`ID: ${therapist.$id}`);
                    console.log(`Name: ${therapist.name}`);
                    console.log(`Email: ${therapist.email || 'N/A'}`);
                    console.log(`Location: ${therapist.location || 'NOT SET'}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAditiaLocation();

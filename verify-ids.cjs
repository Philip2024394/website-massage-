const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_66e1bc040ed8ecdedbf6cdb67dbb2bc4584ff4de4d28f859cb3f2f2f56cec35abc73f1f75fc67cf00a30ae49d8d6baa835f8e3b9e0db0eb81fe09c37de2ba6e4c9e63baa83b9195b2fa40bb4ab9cc49f44c9b13614d7b67e0f0e6ce3c96a11c8fd4af52a5a1deb4ff70406d15f53fad2e21f27fae51d4cc026b3a44c3c4cbae9');

const databases = new Databases(client);

async function verifyCollectionIds() {
    console.log('✅ VERIFYING UPDATED COLLECTION IDs...\n');
    
    const collections = [
        { name: 'Therapists', id: 'THERAPISTS_COLLECTION_ID' },
        { name: 'Places', id: 'PLACES_COLLECTION_ID' },
        { name: 'Bookings', id: 'BOOKINGS_COLLECTION_ID' }
    ];

    for (const collection of collections) {
        try {
            console.log(`Testing ${collection.name}...`);
            const response = await databases.listDocuments(
                '68f76ee1000e64ca8d05',
                collection.id,
                [Query.limit(5)]
            );
            console.log(`✅ SUCCESS! ${collection.name}: ${response.total} documents`);
            if (response.documents.length > 0) {
                const names = response.documents.slice(0, 3).map(d => d.name || d.$id);
                console.log(`   Samples: ${names.join(', ')}`);
            }
            console.log('');
        } catch (error) {
            console.log(`❌ FAILED! ${collection.name}: ${error.message}\n`);
        }
    }

    console.log('🎯 Configuration updated in lib/appwrite.config.ts');
    console.log('   Now restart your dev servers and test:');
    console.log('   1. Admin Dashboard → Premium Upgrade → Search for therapist');
    console.log('   2. Admin Dashboard → DB Diagnostics → Check all connections');
}

verifyCollectionIds();

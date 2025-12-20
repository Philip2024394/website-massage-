const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_66e1bc040ed8ecdedbf6cdb67dbb2bc4584ff4de4d28f859cb3f2f2f56cec35abc73f1f75fc67cf00a30ae49d8d6baa835f8e3b9e0db0eb81fe09c37de2ba6e4c9e63baa83b9195b2fa40bb4ab9cc49f44c9b13614d7b67e0f0e6ce3c96a11c8fd4af52a5a1deb4ff70406d15f53fad2e21f27fae51d4cc026b3a44c3c4cbae9');

const databases = new Databases(client);

async function testCollectionIds() {
    console.log('🔍 Testing collection IDs from config...\n');
    
    const testIds = [
        { name: 'therapists', id: 'therapists_collection_id' },
        { name: 'places', id: 'places_collection_id' },
        { name: 'bookings', id: 'bookings_collection_id' }
    ];

    for (const test of testIds) {
        try {
            console.log(`Testing "${test.name}" with ID: "${test.id}"`);
            const response = await databases.listDocuments(
                '68f76ee1000e64ca8d05',
                test.id,
                [Query.limit(1)]
            );
            console.log(`✅ SUCCESS! Found ${response.total} documents`);
            if (response.documents.length > 0) {
                console.log(`   Sample: ${response.documents[0].name || 'No name field'}`);
            }
            console.log(`   ACTUAL ID TO USE: "${test.id}"\n`);
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            console.log(`   This means "${test.id}" is NOT the correct collection ID\n`);
        }
    }

    console.log('\n📋 ALTERNATIVE: Common Appwrite collection ID patterns to try:');
    console.log('   - Collection IDs are usually lowercase with underscores');
    console.log('   - Examples: "therapists", "places", "bookings"');
    console.log('   - Or they have hex format: "6abc123def456789"');
    console.log('\n🔑 To find the REAL IDs:');
    console.log('   1. Go to: https://syd.cloud.appwrite.io/console');
    console.log('   2. Open Database: 68f76ee1000e64ca8d05');
    console.log('   3. Click each collection and copy the Collection ID from the URL');
    console.log('   4. Update lib/appwrite.config.ts with the real IDs');
}

testCollectionIds();

const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_66e1bc040ed8ecdedbf6cdb67dbb2bc4584ff4de4d28f859cb3f2f2f56cec35abc73f1f75fc67cf00a30ae49d8d6baa835f8e3b9e0db0eb81fe09c37de2ba6e4c9e63baa83b9195b2fa40bb4ab9cc49f44c9b13614d7b67e0f0e6ce3c96a11c8fd4af52a5a1deb4ff70406d15f53fad2e21f27fae51d4cc026b3a44c3c4cbae9');

const databases = new Databases(client);

async function tryCommonIds() {
    console.log('🔍 Trying common Appwrite collection ID patterns...\n');
    
    const patternsToTry = [
        // Simple lowercase
        { name: 'therapists', ids: ['therapists', 'Therapists', 'therapist'] },
        { name: 'places', ids: ['places', 'Places', 'massage_places'] },
        { name: 'bookings', ids: ['bookings', 'Bookings', 'booking'] }
    ];

    const working = {};

    for (const pattern of patternsToTry) {
        console.log(`\n📌 Testing ${pattern.name.toUpperCase()}...`);
        
        for (const id of pattern.ids) {
            try {
                const response = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    id,
                    [Query.limit(5)]
                );
                console.log(`✅ FOUND IT! Collection ID: "${id}"`);
                console.log(`   Total documents: ${response.total}`);
                if (response.documents.length > 0) {
                    const names = response.documents.map(d => d.name || d.title || d.$id).join(', ');
                    console.log(`   Samples: ${names.substring(0, 100)}${names.length > 100 ? '...' : ''}`);
                }
                working[pattern.name] = id;
                break; // Found it, stop trying other patterns
            } catch (error) {
                console.log(`   ❌ "${id}" - ${error.message.substring(0, 50)}`);
            }
        }
    }

    if (Object.keys(working).length > 0) {
        console.log('\n\n🎯 ============================================');
        console.log('   WORKING COLLECTION IDS FOUND!');
        console.log('============================================\n');
        console.log('Update lib/appwrite.config.ts with these IDs:\n');
        console.log('collections: {');
        if (working.therapists) {
            console.log(`    therapists: '${working.therapists}',  // ✅ WORKING`);
        }
        if (working.places) {
            console.log(`    places: '${working.places}',  // ✅ WORKING`);
        }
        if (working.bookings) {
            console.log(`    bookings: '${working.bookings}',  // ✅ WORKING`);
        }
        console.log('    // ... rest of collections');
        console.log('}\n');
    } else {
        console.log('\n\n❌ None of the common patterns worked.');
        console.log('You MUST get the IDs from Appwrite Console:');
        console.log('1. https://syd.cloud.appwrite.io/console');
        console.log('2. Database: 68f76ee1000e64ca8d05');
        console.log('3. Click each collection');
        console.log('4. Look at the URL or settings for Collection ID');
    }
}

tryCommonIds();

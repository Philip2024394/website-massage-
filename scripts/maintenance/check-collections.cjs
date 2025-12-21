const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_66e1bc040ed8ecdedbf6cdb67dbb2bc4584ff4de4d28f859cb3f2f2f56cec35abc73f1f75fc67cf00a30ae49d8d6baa835f8e3b9e0db0eb81fe09c37de2ba6e4c9e63baa83b9195b2fa40bb4ab9cc49f44c9b13614d7b67e0f0e6ce3c96a11c8fd4af52a5a1deb4ff70406d15f53fad2e21f27fae51d4cc026b3a44c3c4cbae9');

const databases = new Databases(client);

async function listAllCollections() {
    try {
        console.log('🔍 Fetching all collections from database: 68f76ee1000e64ca8d05');
        
        const response = await databases.listCollections('68f76ee1000e64ca8d05');
        
        console.log('\n✅ Found', response.collections.length, 'collections:\n');
        
        response.collections.forEach((collection, index) => {
            console.log(`${index + 1}. Name: "${collection.name}"`);
            console.log(`   ID: ${collection.$id}`);
            console.log(`   Documents: ${collection.documentSecurity ? 'Document-level security' : 'Collection-level security'}`);
            console.log('');
        });

        // Find therapists collection
        const therapistsCollection = response.collections.find(c => 
            c.name.toLowerCase().includes('therapist') || 
            c.$id.toLowerCase().includes('therapist')
        );

        if (therapistsCollection) {
            console.log('🎯 THERAPISTS COLLECTION FOUND:');
            console.log('   Name:', therapistsCollection.name);
            console.log('   ID:', therapistsCollection.$id);
            
            // Try to count documents
            try {
                const docs = await databases.listDocuments('68f76ee1000e64ca8d05', therapistsCollection.$id, []);
                console.log('   Total Documents:', docs.total);
            } catch (err) {
                console.log('   Unable to count documents:', err.message);
            }
        }

        // Find places collection  
        const placesCollection = response.collections.find(c => 
            c.name.toLowerCase().includes('place') && !c.name.toLowerCase().includes('facial')
        );

        if (placesCollection) {
            console.log('\n📍 PLACES COLLECTION FOUND:');
            console.log('   Name:', placesCollection.name);
            console.log('   ID:', placesCollection.$id);
            
            // Try to count documents
            try {
                const docs = await databases.listDocuments('68f76ee1000e64ca8d05', placesCollection.$id, []);
                console.log('   Total Documents:', docs.total);
            } catch (err) {
                console.log('   Unable to count documents:', err.message);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listAllCollections();

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_3ae65086afa0ef8e08f4b8dc25bf96e609bafe4aadf0eb0fa1b79e10c988e6e265f42f90caba0c92b7bea37b7a7f09b4be9e341c9de38b2c2fb92b96089154d5aed95ca64a98c856dd8f12bfda7e7e5e95f346a7bc7bedb80b069b9906bb15fea9ee80b5b6764e7c4d7de2ad1d2ff95a6a1e71e3d03d27d63e7af8a7d81ca5d6');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function testMessagesCollection() {
    console.log('🔍 Testing messages collection...\n');
    
    // Test different possible collection IDs
    const possibleCollectionIds = [
        'messages',
        'chat_messages',
        'chatMessages',
        'Messages',
        'message_collection'
    ];
    
    for (const collectionId of possibleCollectionIds) {
        try {
            console.log(`Testing: "${collectionId}"`);
            const response = await databases.listDocuments(databaseId, collectionId, []);
            console.log(`✅ SUCCESS! Collection "${collectionId}" exists!`);
            console.log(`   Documents found: ${response.documents.length}`);
            console.log(`   Total: ${response.total}\n`);
            return collectionId;
        } catch (error) {
            console.log(`❌ Collection "${collectionId}" not found: ${error.message}\n`);
        }
    }
    
    console.log('⚠️ None of the expected collection IDs were found!');
    console.log('\n📋 Listing all collections in database...\n');
    
    try {
        const collections = await databases.listCollections(databaseId);
        console.log(`Found ${collections.total} collections:`);
        collections.collections.forEach(col => {
            console.log(`  - ${col.$id} (${col.name})`);
        });
    } catch (error) {
        console.error('❌ Could not list collections:', error.message);
    }
}

testMessagesCollection().catch(console.error);

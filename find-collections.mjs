import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function findCollections() {
    try {
        console.log('🔍 Finding all collections...\n');
        
        const collections = await databases.listCollections('68f76ee1000e64ca8d05');
        
        console.log('📋 Available collections:\n');
        collections.collections.forEach((col, index) => {
            console.log(`${index + 1}. ${col.name}`);
            console.log(`   ID: ${col.$id}`);
            console.log('');
        });
        
        // Look for reviews collection
        const reviewsCol = collections.collections.find(c => 
            c.name.toLowerCase().includes('review') || 
            c.$id.toLowerCase().includes('review')
        );
        
        if (reviewsCol) {
            console.log('✅ Found Reviews Collection:');
            console.log(`   Name: ${reviewsCol.name}`);
            console.log(`   ID: ${reviewsCol.$id}`);
        } else {
            console.log('❌ No reviews collection found. You may need to create one.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findCollections();

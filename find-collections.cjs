const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function findCollections() {
    try {
        console.log('🔍 Finding all collections in database:', databaseId);
        console.log('=' .repeat(60));
        
        const response = await databases.listCollections(databaseId);
        
        console.log(`Found ${response.collections.length} collections:\n`);
        
        response.collections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}`);
            console.log(`   ID: ${collection.$id}`);
            console.log(`   Documents: ${collection.documentsCount || 'Unknown'}`);
            console.log(`   Enabled: ${collection.enabled}`);
            console.log('');
        });
        
        // Try to find therapist-related collections
        const therapistCollections = response.collections.filter(c => 
            c.name.toLowerCase().includes('therapist') || 
            c.$id.toLowerCase().includes('therapist') ||
            c.name.toLowerCase().includes('massage')
        );
        
        if (therapistCollections.length > 0) {
            console.log('🎯 Likely therapist collections:');
            therapistCollections.forEach(c => {
                console.log(`   - ${c.name} (${c.$id})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('not found')) {
            console.log('💡 Database ID might be wrong, or database doesn\'t exist');
        }
    }
}

findCollections();
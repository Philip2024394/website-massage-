const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function findCollectionId() {
    try {
        console.log('🔍 Connecting to Appwrite...\n');
        const response = await databases.listCollections('68f76ee1000e64ca8d05');
        
        console.log('📋 Available Collections:\n');
        response.collections.forEach(c => {
            console.log(`  - ${c.name.padEnd(40)} ID: ${c.$id}`);
        });
        
        const therapistCol = response.collections.find(c => 
            c.name.toLowerCase().includes('therapist') || c.$id.toLowerCase().includes('therapist')
        );
        
        if (therapistCol) {
            console.log('\n✅ FOUND THERAPIST COLLECTION:');
            console.log(`   Name: ${therapistCol.name}`);
            console.log(`   ID: ${therapistCol.$id}`);
            console.log('\n📝 Update lib/appwrite.config.ts line 15:');
            console.log(`   therapists: '${therapistCol.$id}',`);
            
            // Test fetching documents
            try {
                const docs = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    therapistCol.$id
                );
                console.log('\n📊 Collection Stats:');
                console.log(`   Total therapists: ${docs.total}`);
                console.log(`   Live therapists: ${docs.documents.filter(d => d.isLive).length}`);
            } catch (error) {
                console.error('\n⚠️ Could not fetch documents:', error.message);
            }
        } else {
            console.error('\n❌ Could not find therapist collection');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nMake sure node-appwrite is installed:');
        console.error('  npm install node-appwrite');
    }
}

findCollectionId();


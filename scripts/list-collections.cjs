const { Client, Databases, Account } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);
const databaseId = '68f76ee1000e64ca8d05';

async function listAllCollections() {
    try {
        console.log('🔧 Listing all available collections...');
        
        // Create anonymous session
        try {
            await account.createAnonymousSession();
            console.log('✅ Anonymous session created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Using existing anonymous session');
            }
        }

        // List all collections
        const response = await databases.listCollections(databaseId);
        
        console.log(`\n📁 Found ${response.collections.length} collections:\n`);
        
        response.collections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}`);
            console.log(`   ID: ${collection.$id}`);
            console.log(`   Permissions: ${JSON.stringify(collection.$permissions)}`);
            console.log(`   Attributes: ${collection.attributes.length} fields`);
            console.log('');
        });
        
        // Look specifically for therapist-related collections
        const therapistCollections = response.collections.filter(c => 
            c.name.toLowerCase().includes('therapist') || 
            c.name.toLowerCase().includes('massage')
        );
        
        if (therapistCollections.length > 0) {
            console.log('🎯 Therapist-related collections:');
            therapistCollections.forEach(collection => {
                console.log(`   • ${collection.name} (${collection.$id})`);
            });
        } else {
            console.log('❌ No therapist-related collections found');
            console.log('💡 You might need to create the therapist collection in Appwrite Console');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 401) {
            console.log('🔐 Authentication required');
        } else if (error.code === 404) {
            console.log('🔍 Database not found');
        }
    }
}

listAllCollections();
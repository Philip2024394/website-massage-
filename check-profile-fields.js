import { Client, Databases, Account } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function checkProfileFields() {
    try {
        console.log('🔍 Checking Surtiningsih profile fields...\n');
        
        // Create anonymous session
        try {
            await account.createAnonymousSession();
            console.log('✅ Anonymous session created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Using existing anonymous session');
            }
        }

        const profileId = '693cfadf003d16b9896a';
        
        const profile = await databases.getDocument(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            profileId
        );
        
        console.log('📋 Available fields in Surtiningsih\'s profile:');
        console.log('=' .repeat(50));
        
        Object.keys(profile).forEach(key => {
            console.log(`${key}: ${JSON.stringify(profile[key])}`);
        });
        
        console.log('\n🔍 Looking for existing user ID fields...');
        const userIdFields = Object.keys(profile).filter(key => 
            key.toLowerCase().includes('user') || 
            key.toLowerCase().includes('id')
        );
        
        if (userIdFields.length > 0) {
            console.log('Found potential user ID fields:');
            userIdFields.forEach(field => {
                console.log(`   ${field}: ${profile[field]}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkProfileFields();
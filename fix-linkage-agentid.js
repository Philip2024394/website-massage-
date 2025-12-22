import { Client, Databases, Account } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function fixProfileLinkage() {
    try {
        console.log('🔧 Fixing profile linkage using agentId field...\n');
        
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
        const userId = '693cfadf000997d3cd66';
        
        console.log(`📝 Updating Surtiningsih's profile using agentId field...`);
        
        // Use agentId field to store the userId temporarily
        const updatedProfile = await databases.updateDocument(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            profileId,
            {
                agentId: userId  // Using agentId field to store userId
            }
        );
        
        console.log('\n✅ SUCCESS! Profile updated with user linkage:');
        console.log('   Profile ID:', updatedProfile.$id);
        console.log('   Name:', updatedProfile.name);
        console.log('   Email:', updatedProfile.email);
        console.log('   Agent ID (userId):', updatedProfile.agentId);
        
        console.log('\n🔧 Now updating authentication code to check agentId field...');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 401) {
            console.log('\n🔐 Permission denied - need admin access to update');
            console.log('💡 Please update manually in Appwrite Console:');
            console.log(`   1. Go to therapist profile: ${profileId}`);
            console.log(`   2. Set agentId field to: ${userId}`);
        }
    }
}

fixProfileLinkage();
import { Client, Databases, Account } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function updateProfileLinkage() {
    try {
        console.log('🔧 Updating Surtiningsih profile with NEW user ID...\n');
        
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
        const newUserId = '693cfadf592b8aa00a21'; // NEW user ID
        
        console.log(`📝 Updating profile ${profileId}...`);
        console.log(`📝 Setting agentId to: ${newUserId}`);
        
        const updatedProfile = await databases.updateDocument(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            profileId,
            {
                agentId: newUserId  // Update with new userId
            }
        );
        
        console.log('\n✅ SUCCESS! Profile updated with NEW user linkage:');
        console.log('   Profile ID:', updatedProfile.$id);
        console.log('   Name:', updatedProfile.name);
        console.log('   Email:', updatedProfile.email);
        console.log('   Agent ID (userId):', updatedProfile.agentId);
        console.log('   Is Live:', updatedProfile.isLive);
        console.log('   Status:', updatedProfile.status);
        
        console.log('\n🎉 Profile now linked to new Appwrite user!');
        console.log('🔗 Try signing in: http://localhost:3001/signin');
        console.log('   Email: indastreet1@gmail.com');
        console.log('   User ID: 693cfadf592b8aa00a21');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateProfileLinkage();
import { Client, Databases, Account } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function linkTherapistProfile() {
    try {
        console.log('🔧 Linking Surtiningsih profile to Appwrite user...\n');
        
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
        
        console.log(`📝 Updating profile ${profileId} with userId ${userId}...`);
        
        const updatedProfile = await databases.updateDocument(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            profileId,
            {
                userId: userId
            }
        );
        
        console.log('\n✅ SUCCESS! Profile updated:');
        console.log('   Profile ID:', updatedProfile.$id);
        console.log('   Name:', updatedProfile.name);
        console.log('   Email:', updatedProfile.email);
        console.log('   User ID:', updatedProfile.userId);
        console.log('\n🎉 Authentication should now work!');
        console.log('🔗 Try signing in: http://localhost:3001/signin');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 401) {
            console.log('\n🔐 Permission denied - anonymous session cannot update documents');
            console.log('💡 Alternative solutions:');
            console.log('   1. Use admin API key (if available)');
            console.log('   2. Update via Appwrite Console manually');
            console.log('   3. Have user complete signup flow again with same email');
        }
    }
}

linkTherapistProfile();
import { Client, Databases, Account, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function testTherapistServiceQuery() {
    try {
        console.log('🔧 Testing the exact query therapistService.getByEmail() uses...\n');
        
        // Create anonymous session
        try {
            await account.createAnonymousSession();
            console.log('✅ Anonymous session created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Using existing anonymous session');
            }
        }

        const targetEmail = 'indastreet1@gmail.com';
        
        console.log(`🔍 Running Query.equal('email', '${targetEmail}')...`);
        
        // This is the exact query the therapist service uses
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            [Query.equal('email', targetEmail)]
        );
        
        console.log(`📊 Query returned ${response.documents.length} documents`);
        
        if (response.documents.length > 0) {
            const therapist = response.documents[0];
            console.log('\n✅ THERAPIST FOUND via Query.equal:');
            console.log('   Profile ID:', therapist.$id);
            console.log('   Name:', therapist.name);
            console.log('   Email:', therapist.email);
            console.log('   Status:', therapist.status);
            console.log('   Is Live:', therapist.isLive);
            console.log('   Agent ID:', therapist.agentId);
            
            console.log('\n🎉 The therapistService.getByEmail() SHOULD work!');
            console.log('   This suggests the issue might be:');
            console.log('   1. Different collection ID in config');
            console.log('   2. Caching issue');
            console.log('   3. Session state problem');
            
        } else {
            console.log('\n❌ NO RESULTS from Query.equal');
            console.log('   This means the Query.equal is not working as expected');
            
            // Try fallback search
            console.log('\n🔍 Trying fallback search...');
            const allResponse = await databases.listDocuments(
                DATABASE_ID,
                THERAPISTS_COLLECTION
            );
            
            const manualFind = allResponse.documents.find(doc => 
                doc.email === targetEmail
            );
            
            if (manualFind) {
                console.log('✅ Found via manual search - Query.equal might have indexing issues');
                console.log('   Profile:', manualFind.name, manualFind.email);
            } else {
                console.log('❌ Not found even via manual search');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testTherapistServiceQuery();
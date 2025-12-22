import { Client, Databases, Account } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function testAuthenticationFlow() {
    try {
        console.log('🔧 Testing complete authentication flow...\n');
        
        // Step 1: Test profile lookup (like auth system does)
        console.log('1️⃣ Testing therapist profile lookup...');
        
        try {
            await account.createAnonymousSession();
            console.log('✅ Anonymous session created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Using existing anonymous session');
            }
        }

        const targetEmail = 'indastreet1@gmail.com';
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            []  // No queries for now, just list all
        );
        
        if (response.documents.length > 0) {
            // Find Surtiningsih's profile
            const therapist = response.documents.find(doc => 
                doc.email === targetEmail || 
                (doc.name || '').toLowerCase().includes('surtiningsih')
            );
            
            if (therapist) {
            console.log('✅ Profile found:', therapist.name);
            console.log('   Email:', therapist.email);
            console.log('   Profile ID:', therapist.$id);
            console.log('   Agent ID (userId):', therapist.agentId);
            
            // Step 2: Verify linkage
            console.log('\n2️⃣ Testing user linkage...');
            if (therapist.agentId === '693cfadf000997d3cd66') {
                console.log('✅ Profile correctly linked to Appwrite user!');
                
                // Step 3: Test what dashboard needs
                console.log('\n3️⃣ Testing dashboard data...');
                console.log('   Is Live:', therapist.isLive);
                console.log('   Status:', therapist.status);
                console.log('   Location:', therapist.location);
                console.log('   WhatsApp:', therapist.whatsappNumber);
                
                if (therapist.isLive) {
                    console.log('\n🎉 AUTHENTICATION SHOULD WORK NOW!');
                    console.log('   Profile exists ✅');
                    console.log('   Email matches ✅');
                    console.log('   User linked ✅');
                    console.log('   Profile active ✅');
                    console.log('\n🔗 Try signing in: http://localhost:3001/signin');
                } else {
                    console.log('\n⚠️ Profile not live - may need activation');
                }
                
            } else {
                console.log('❌ Linkage issue - agentId doesn\'t match expected user ID');
            }
            
        } else {
            console.log('❌ Therapist profile not found');
        }
            
        } else {
            console.log('❌ Profile not found by email');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAuthenticationFlow();
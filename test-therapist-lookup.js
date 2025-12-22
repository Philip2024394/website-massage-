import { Client, Databases, Account, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function testTherapistLookup() {
    try {
        console.log('🔧 Testing therapist lookup for indastreet1@gmail.com...\n');
        
        // Create anonymous session (same as app does)
        try {
            await account.createAnonymousSession();
            console.log('✅ Anonymous session created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Using existing anonymous session');
            } else {
                console.log('⚠️ Session error:', error.message);
            }
        }

        // Test the exact same query that the auth system uses
        const targetEmail = 'indastreet1@gmail.com';
        const normalizedEmail = targetEmail.toLowerCase().trim();
        
        console.log(`\n🔍 Searching for therapist with email: "${normalizedEmail}"`);
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            [Query.equal('email', normalizedEmail)]
        );
        
        console.log(`📊 Query returned ${response.documents.length} documents`);
        
        if (response.documents.length > 0) {
            const therapist = response.documents[0];
            console.log('\n✅ THERAPIST FOUND:');
            console.log('   Profile ID:', therapist.$id);
            console.log('   Name:', therapist.name);
            console.log('   Email:', therapist.email);
            console.log('   Status:', therapist.status);
            console.log('   Is Live:', therapist.isLive);
            console.log('   User ID:', therapist.userId || 'NOT SET');
            
            // Check if userId matches
            if (therapist.userId === '693cfadf000997d3cd66') {
                console.log('\n🎉 PROFILE LINKAGE: ✅ CORRECT');
                console.log('   The profile is properly linked to the Appwrite user');
                console.log('   Authentication should work!');
            } else {
                console.log('\n❌ PROFILE LINKAGE: INCORRECT');
                console.log('   Expected userId: 693cfadf000997d3cd66');
                console.log('   Actual userId:', therapist.userId || 'NOT SET');
                console.log('   This is why sign-in fails!');
                
                // Show fix command
                console.log('\n🔧 TO FIX: Update the therapist profile with correct userId');
            }
            
        } else {
            console.log('\n❌ NO THERAPIST FOUND');
            console.log('   This means either:');
            console.log('   1. Profile doesn\'t exist');
            console.log('   2. Email doesn\'t match exactly');
            console.log('   3. Collection ID is wrong');
            
            // Try to list all therapists to see what's available
            console.log('\n🔍 Checking what therapists exist...');
            try {
                const allResponse = await databases.listDocuments(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION
                );
                
                console.log(`📋 Found ${allResponse.documents.length} total therapists:`);
                allResponse.documents.slice(0, 5).forEach((doc, index) => {
                    console.log(`   ${index + 1}. Name: ${doc.name || 'Unnamed'}, Email: ${doc.email || 'No email'}`);
                });
                
                // Look for similar emails
                const similarEmails = allResponse.documents.filter(doc => 
                    (doc.email || '').toLowerCase().includes('indastreet') ||
                    (doc.name || '').toLowerCase().includes('surtiningsih')
                );
                
                if (similarEmails.length > 0) {
                    console.log('\n🎯 Found similar profiles:');
                    similarEmails.forEach(doc => {
                        console.log(`   - ${doc.name}: ${doc.email}`);
                    });
                }
                
            } catch (listError) {
                console.log('❌ Could not list therapists:', listError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 404) {
            console.log('\n💡 Collection not found. Possible issues:');
            console.log('   1. Collection ID "therapists_collection_id" doesn\'t exist');
            console.log('   2. Collection permissions don\'t allow read access');
            console.log('   3. Database ID is incorrect');
        }
    }
}

testTherapistLookup();
const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function debugAuthFlow() {
  try {
    // Create anonymous session
    console.log('🔐 Creating anonymous session for testing...');
    await account.createAnonymousSession();
    
    const testEmail = 'indastreet1@gmail.com';
    
    // Test 1: List all documents in therapists collection
    console.log('\n📋 Test 1: Listing ALL therapist documents...');
    try {
      const allDocs = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        []
      );
      console.log(`   Found ${allDocs.total} total therapists`);
      console.log('   First few emails:', allDocs.documents.slice(0, 5).map(d => d.email));
    } catch (err) {
      console.error('   ❌ Error listing all docs:', err.message);
    }

    // Test 2: Query with array (like the service does)
    console.log('\n📋 Test 2: Query with Query.equal(\'email\', email) - NO ARRAY...');
    try {
      const result2 = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        [Query.equal('email', testEmail)]
      );
      console.log(`   ✅ Found ${result2.documents.length} documents`);
      if (result2.documents.length > 0) {
        console.log('   Profile:', {
          name: result2.documents[0].name,
          email: result2.documents[0].email,
          id: result2.documents[0].$id,
          agentId: result2.documents[0].agentId
        });
      }
    } catch (err) {
      console.error('   ❌ Error:', err.message);
    }

    // Test 3: Query with array syntax
    console.log('\n📋 Test 3: Query with Query.equal(\'email\', [email]) - WITH ARRAY...');
    try {
      const result3 = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        [Query.equal('email', [testEmail])]
      );
      console.log(`   ✅ Found ${result3.documents.length} documents`);
      if (result3.documents.length > 0) {
        console.log('   Profile:', {
          name: result3.documents[0].name,
          email: result3.documents[0].email,
          id: result3.documents[0].$id,
          agentId: result3.documents[0].agentId
        });
      }
    } catch (err) {
      console.error('   ❌ Error:', err.message);
    }

    // Test 4: Check collection permissions
    console.log('\n🔐 Test 4: Checking if authenticated users can read...');
    console.log('   Note: This test uses anonymous session, but real auth would use email/password session');
    console.log('   Collection should allow "Users" role to read for authenticated access');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

debugAuthFlow();

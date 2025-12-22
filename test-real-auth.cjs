const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function testAuthFlow() {
  try {
    console.log('🔐 TEST: Simulating Authenticated Access');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test 1: Create email session (like real sign-in)
    console.log('Step 1: Creating email/password session...');
    console.log('⚠️ NOTE: We need your password to test. Enter it when prompted.\n');
    
    // First delete any existing session
    try {
      await account.deleteSession('current');
    } catch (e) {
      // No session to delete
    }
    
    // Create session
    const email = 'indastreet1@gmail.com';
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Enter password for indastreet1@gmail.com: ', async (password) => {
      readline.close();
      
      try {
        console.log('\n🔐 Creating session...');
        const session = await account.createEmailPasswordSession(email, password);
        console.log('✅ Session created successfully!');
        console.log('   Session ID:', session.$id);
        console.log('   User ID:', session.userId);
        
        // Test 2: Get current user
        console.log('\n🔍 Getting current user...');
        const user = await account.get();
        console.log('✅ Current user:');
        console.log('   User ID:', user.$id);
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        
        // Test 3: Query therapists collection WITH authenticated session
        console.log('\n🔍 Querying therapists collection (authenticated)...');
        console.log('   Database: 68f76ee1000e64ca8d05');
        console.log('   Collection: therapists_collection_id');
        console.log('   Query: Query.equal(\'email\', \'' + email + '\')');
        
        const result = await databases.listDocuments(
          '68f76ee1000e64ca8d05',
          'therapists_collection_id',
          [Query.equal('email', email)]
        );
        
        console.log('\n✅ QUERY SUCCESSFUL!');
        console.log('   Found:', result.documents.length, 'therapist(s)');
        
        if (result.documents.length > 0) {
          const therapist = result.documents[0];
          console.log('\n📋 Therapist Profile:');
          console.log('   Name:', therapist.name);
          console.log('   Email:', therapist.email);
          console.log('   Profile ID:', therapist.$id);
          console.log('   agentId:', therapist.agentId);
          console.log('   User ID match:', therapist.agentId === user.$id ? '✅ YES' : '❌ NO');
          
          if (therapist.agentId !== user.$id) {
            console.log('\n❌ MISMATCH FOUND!');
            console.log('   agentId in database:', therapist.agentId);
            console.log('   User ID from session:', user.$id);
            console.log('\n💡 Updating agentId to match...');
            
            try {
              await databases.updateDocument(
                '68f76ee1000e64ca8d05',
                'therapists_collection_id',
                therapist.$id,
                { agentId: user.$id }
              );
              console.log('✅ agentId updated successfully!');
            } catch (updateErr) {
              console.error('❌ Failed to update:', updateErr.message);
            }
          } else {
            console.log('\n✅ Everything looks correct!');
            console.log('   Authentication should work now.');
          }
        } else {
          console.log('\n❌ NO THERAPIST FOUND!');
          console.log('   This should not happen if permission was added.');
          console.log('   Check Appwrite Console permissions again.');
        }
        
        // Clean up
        await account.deleteSession('current');
        console.log('\n✅ Test session deleted');
        
      } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        if (err.code) console.error('   Code:', err.code);
        if (err.type) console.error('   Type:', err.type);
        
        if (err.code === 401) {
          console.error('\n💡 This is likely a permission issue.');
          console.error('   Double-check Appwrite Console permissions:');
          console.error('   - Role: Users');
          console.error('   - Permission: READ (checked)');
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testAuthFlow();

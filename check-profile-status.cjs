const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function checkAndFixLinkage() {
  try {
    // Create anonymous session for database access
    console.log('🔐 Creating anonymous session...');
    await account.createAnonymousSession();
    
    // Check the profile
    console.log('🔍 Checking profile for indastreet1@gmail.com...');
    const profileResult = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', ['indastreet1@gmail.com'])]
    );

    if (profileResult.documents.length === 0) {
      console.log('❌ No profile found with email indastreet1@gmail.com');
      return;
    }

    const profile = profileResult.documents[0];
    console.log('\n✅ Profile Found:');
    console.log('   Name:', profile.name);
    console.log('   Email:', profile.email);
    console.log('   Profile ID:', profile.$id);
    console.log('   Current agentId:', profile.agentId || '(empty)');
    
    console.log('\n📋 Instructions:');
    console.log('1. Go to http://localhost:3003 (auth app)');
    console.log('2. Select "Massage Therapist"');
    console.log('3. Enter email: indastreet1@gmail.com');
    console.log('4. Enter the password');
    console.log('5. After sign-in, check the browser console');
    console.log('6. Look for "User ID:" in the console output');
    console.log('7. Run: node update-userid.cjs <user-id-from-console>');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAndFixLinkage();

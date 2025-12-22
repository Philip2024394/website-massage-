const { Client, Databases, Query, Account } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard-api-key-01JFQSZGBX5P9C69YB3HJ8CGGV');

const databases = new Databases(client);
const account = new Account(client);

async function checkLinkage() {
  try {
    // 1. Check profile
    console.log('🔍 Checking profile for indastreet1@gmail.com...');
    const profileResult = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', 'indastreet1@gmail.com')]
    );

    if (profileResult.documents.length === 0) {
      console.log('❌ No profile found!');
      return;
    }

    const profile = profileResult.documents[0];
    console.log('\n✅ Profile Found:');
    console.log('   Name:', profile.name);
    console.log('   Email:', profile.email);
    console.log('   Profile ID:', profile.$id);
    console.log('   agentId (user linkage):', profile.agentId || '(empty)');
    
    // 2. Check user accounts
    console.log('\n🔍 Checking Appwrite user accounts...');
    try {
      const users = await account.list([Query.equal('email', 'indastreet1@gmail.com')]);
      console.log('   Found users:', users.users.length);
      
      if (users.users.length > 0) {
        users.users.forEach((user, index) => {
          console.log(`\n   User ${index + 1}:`);
          console.log('     User ID:', user.$id);
          console.log('     Email:', user.email);
          console.log('     Status:', user.status);
          console.log('     Match:', profile.agentId === user.$id ? '✅ MATCHED' : '❌ NOT MATCHED');
        });
      }
    } catch (err) {
      console.log('   ℹ️ Cannot list users with this API key (normal)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLinkage();

const { Client, Databases, Account } = require('node-appwrite');

const newUserId = process.argv[2];

if (!newUserId) {
  console.log('Usage: node fix-agentid.cjs <user-id>');
  console.log('Example: node fix-agentid.cjs 694abcdef1234567890');
  process.exit(1);
}

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function updateAgentId() {
  try {
    console.log('🔧 Updating agentId for indastreet1@gmail.com...');
    console.log('   New User ID:', newUserId);
    
    await account.createAnonymousSession();
    
    await databases.updateDocument(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      '693cfadf003d16b9896a',
      { agentId: newUserId }
    );
    
    console.log('✅ agentId updated successfully!');
    console.log('✅ Now try signing in again.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAgentId();

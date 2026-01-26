// Direct Appwrite Infrastructure Test
// This simulates the exact calls made during validation

import { Client, Databases, Account } from 'appwrite';

// Initialize Appwrite client with the same config as the app
const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';
const CHAT_SESSIONS_COLLECTION = 'chat_sessions';

async function testRealInfrastructure() {
  console.log('🔬 DIRECT APPWRITE INFRASTRUCTURE TEST');
  console.log('═'.repeat(80));
  console.log(`Testing against: https://syd.cloud.appwrite.io/v1`);
  console.log(`Project ID: 68f23b11000d25eb3664`);
  console.log(`Database ID: ${DATABASE_ID}`);
  console.log('═'.repeat(80));

  // Test 1: chat_messages collection
  try {
    console.log(`\n🔍 Testing chat_messages collection: ${CHAT_MESSAGES_COLLECTION}`);
    const messagesCollection = await databases.getCollection(DATABASE_ID, CHAT_MESSAGES_COLLECTION);
    console.log(`✅ chat_messages EXISTS: ${messagesCollection.name} (${messagesCollection.attributes.length} attributes)`);
    
    // List actual attributes
    const attributes = messagesCollection.attributes.map(attr => attr.key);
    console.log(`📋 Available attributes: ${attributes.join(', ')}`);
    
    // Test basic query access
    const testQuery = await databases.listDocuments(DATABASE_ID, CHAT_MESSAGES_COLLECTION, [], 1);
    console.log(`✅ chat_messages QUERY ACCESS: ${testQuery.total} total documents`);
    
  } catch (error) {
    console.error(`❌ chat_messages FAILED:`, error);
    console.error(`Error Code: ${error.code}, Message: ${error.message}`);
  }

  // Test 2: chat_sessions collection  
  try {
    console.log(`\n🔍 Testing chat_sessions collection: ${CHAT_SESSIONS_COLLECTION}`);
    const sessionsCollection = await databases.getCollection(DATABASE_ID, CHAT_SESSIONS_COLLECTION);
    console.log(`✅ chat_sessions EXISTS: ${sessionsCollection.name} (${sessionsCollection.attributes.length} attributes)`);
    
    // List actual attributes
    const attributes = sessionsCollection.attributes.map(attr => attr.key);
    console.log(`📋 Available attributes: ${attributes.join(', ')}`);
    
    // Test basic query access
    const testQuery = await databases.listDocuments(DATABASE_ID, CHAT_SESSIONS_COLLECTION, [], 1);
    console.log(`✅ chat_sessions QUERY ACCESS: ${testQuery.total} total documents`);
    
  } catch (error) {
    console.error(`❌ chat_sessions FAILED:`, error);
    console.error(`Error Code: ${error.code}, Message: ${error.message}`);
  }

  // Test 3: Authentication status
  try {
    console.log(`\n🔍 Testing authentication status...`);
    const user = await account.get();
    console.log(`✅ USER AUTHENTICATED: ${user.$id} (${user.name || 'No name'})`);
  } catch (error) {
    console.log(`⚙️ ANONYMOUS SESSION: ${error.message}`);
  }

  // Test 4: Real-time subscription setup (without actually subscribing)
  console.log(`\n🔍 Testing realtime subscription channel...`);
  const subscriptionChannel = `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES_COLLECTION}.documents`;
  console.log(`🔗 Subscription Channel: ${subscriptionChannel}`);
  console.log(`📡 This is what the real-time subscription would use`);

  console.log('\n═'.repeat(80));
  console.log('🎯 TEST COMPLETE - Check above for any FAILED items');
  console.log('❌ Any failures indicate real infrastructure issues to fix');
  console.log('✅ All successes indicate working infrastructure');
  console.log('═'.repeat(80));
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = { testRealInfrastructure };
}

// Run if in browser
if (typeof window !== 'undefined') {
  window.testRealInfrastructure = testRealInfrastructure;
}
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_9c46e3b29b7f6b4043ff33b98b5e9c0c86f7c73a9b8d0b9e7b9c8d89b4e1d4e0e8c3f4a3d9c5b2f6e8a1c7b9d4e2f5a8b3c6d9e2f4a7b0c5d8e1f3a6b9c2d5e7f0a3b6c9d2e4f7a0b3c5d8e1f4a6b9c2e5f7a0b3d6e9f2a5c7b0d3e6f8a1c4b7d0e3f5a8b1c4d6e9f2a4b7c0d3e5f8a1b4c6d9e2f4a7b0c3d5e8f1a3b6c9d2e4f6a9b2c5d7e0f3a5b8c1d4e6f9a2b4c7d0e2f5a7b0c3d5e8');

const databases = new Databases(client);

async function findChatCollections() {
  console.log('🔍 SEARCHING FOR CHAT-RELATED COLLECTIONS');
  console.log('=' .repeat(50));
  
  const requiredForChat = [
    'messages',
    'admin_messages', 
    'chat_messages',
    'chat_rooms', 
    'chatRooms',
    'chat_audit_logs',
    'chatAuditLogs', 
    'chat_sessions',
    'chatSessions'
  ];
  
  const found = [];
  const missing = [];
  
  for (const collectionId of requiredForChat) {
    try {
      const collection = await databases.getCollection('68f76ee1000e64ca8d05', collectionId);
      console.log(`✅ FOUND: ${collectionId} (${collection.name})`);
      found.push({ id: collectionId, name: collection.name });
    } catch (error) {
      if (error.code === 404) {
        console.log(`❌ NOT FOUND: ${collectionId}`);
        missing.push(collectionId);
      } else if (error.code === 401) {
        console.log(`🔐 EXISTS: ${collectionId} (auth required)`);
        found.push({ id: collectionId, name: 'Authentication Required' });
      } else {
        console.log(`⚠️ ERROR: ${collectionId} - ${error.message}`);
        missing.push(collectionId);
      }
    }
  }
  
  console.log('\n📋 CHAT COLLECTIONS SUMMARY:');
  console.log('=' .repeat(30));
  console.log(`✅ FOUND: ${found.length}`);
  found.forEach(col => console.log(`   • ${col.id} → ${col.name}`));
  
  console.log(`\n❌ MISSING: ${missing.length}`);
  missing.forEach(id => console.log(`   • ${id}`));
  
  console.log('\n🔧 RECOMMENDED .ENV UPDATES:');
  if (found.find(col => col.id === 'admin_messages')) {
    console.log('VITE_MESSAGES_COLLECTION_ID=admin_messages');
  }
  
  const chatMessages = found.find(col => col.id === 'chat_messages' || col.id === 'chatMessages');
  if (chatMessages) {
    console.log(`VITE_CHAT_MESSAGES_COLLECTION_ID=${chatMessages.id}`);
  }
  
  const chatRooms = found.find(col => col.id === 'chat_rooms' || col.id === 'chatRooms');
  if (chatRooms) {
    console.log(`VITE_CHAT_ROOMS_COLLECTION_ID=${chatRooms.id}`);
  }
  
  if (missing.length > 0) {
    console.log('\n⚠️ MISSING COLLECTIONS MAY CAUSE CHAT FAILURES:');
    console.log('   Either create these collections in Appwrite or update the code to not require them');
  }
  
  if (found.length >= 1) {
    console.log('\n🎯 CHAT SHOULD WORK if at least basic messaging is supported');
  } else {
    console.log('\n🚨 CRITICAL: No chat collections found - chat window cannot function');
  }
}

findChatCollections();
const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function getAllIds() {
  try {
    console.log('📋 ALL IDs FOR: indastreet1@gmail.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await account.createAnonymousSession();
    
    const profile = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', 'indastreet1@gmail.com')]
    );
    
    if (profile.documents.length > 0) {
      const p = profile.documents[0];
      
      console.log('APPWRITE INFRASTRUCTURE:');
      console.log('  Project ID: 68f23b11000d25eb3664');
      console.log('  Database ID: 68f76ee1000e64ca8d05');
      console.log('  Collection ID: therapists_collection_id\n');
      
      console.log('THERAPIST PROFILE:');
      console.log('  Name:', p.name);
      console.log('  Email:', p.email);
      console.log('  Profile Document ID: ' + p.$id);
      console.log('  agentId (user linkage): ' + p.agentId);
      console.log('  Phone:', p.phone || '(not set)');
      console.log('  WhatsApp:', p.whatsappNumber || '(not set)');
      console.log('  Status:', p.status || '(not set)');
      console.log('  Location:', p.location || '(not set)');
      console.log('');
      
      console.log('NOTE:');
      console.log('  - Profile Document ID is for database queries');
      console.log('  - agentId should match Appwrite User ID for authentication');
      console.log('  - When you sign in, check browser console for "User ID"');
      console.log('  - That User ID must match agentId in database');
    } else {
      console.log('❌ No profile found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getAllIds();

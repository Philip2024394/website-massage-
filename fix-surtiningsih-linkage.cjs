const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function fixAndCompare() {
  try {
    console.log('🔐 Creating anonymous session...\n');
    await account.createAnonymousSession();
    
    // List all therapists
    console.log('📋 LISTING ALL THERAPISTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    const allTherapists = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      []
    );

    allTherapists.documents.forEach((therapist, index) => {
      console.log(`${index + 1}. ${therapist.name}`);
      console.log(`   Email: ${therapist.email}`);
      console.log(`   Profile ID: ${therapist.$id}`);
      console.log(`   agentId: ${therapist.agentId || '(empty)'}`);
      console.log('');
    });

    // Update Surtiningsih's agentId
    console.log('\n🔧 FIXING SURTININGSIH LINKAGE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const correctUserId = '693cfadf000997d3cd66';
    
    try {
      await databases.updateDocument(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        '693cfadf003d16b9896a',
        { agentId: correctUserId }
      );
      console.log('✅ Updated agentId to:', correctUserId);
      console.log('✅ Linkage fixed! Try signing in again.');
    } catch (updateError) {
      console.error('❌ Failed to update:', updateError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAndCompare();

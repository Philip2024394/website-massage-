const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function compareTherapists() {
  try {
    // Create anonymous session for database access
    console.log('🔐 Creating anonymous session...\n');
    await account.createAnonymousSession();
    
    // Check indastreet1@gmail.com (Surtiningsih)
    console.log('👤 CHECKING: indastreet1@gmail.com (Surtiningsih)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const surtiResult = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', ['indastreet1@gmail.com'])]
    );

    if (surtiResult.documents.length > 0) {
      const surti = surtiResult.documents[0];
      console.log('   Name:', surti.name);
      console.log('   Email:', surti.email);
      console.log('   Profile ID (document ID):', surti.$id);
      console.log('   agentId (user linkage):', surti.agentId || '(empty)');
      console.log('   User ID from settings:', '693cfadf000997d3cd66');
      console.log('   Match?', surti.agentId === '693cfadf000997d3cd66' ? '✅ YES' : '❌ NO - MISMATCH!');
    } else {
      console.log('   ❌ Not found');
    }

    // Find Budi
    console.log('\n👤 CHECKING: Budi (searching by name)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const budiResult = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.search('name', 'Budi')]
    );

    if (budiResult.documents.length > 0) {
      console.log(`   Found ${budiResult.documents.length} therapist(s) with "Budi" in name:\n`);
      budiResult.documents.forEach((therapist, index) => {
        console.log(`   ${index + 1}. ${therapist.name}`);
        console.log(`      Email: ${therapist.email}`);
        console.log(`      Profile ID: ${therapist.$id}`);
        console.log(`      agentId: ${therapist.agentId || '(empty)'}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No therapist found with "Budi" in name');
    }

    // Check if the agentId in database matches the user ID from settings
    console.log('\n🔍 DIAGNOSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (surtiResult.documents.length > 0) {
      const surti = surtiResult.documents[0];
      if (surti.agentId !== '693cfadf000997d3cd66') {
        console.log('❌ PROBLEM FOUND: agentId in database does NOT match user ID from settings!');
        console.log(`   Database has: ${surti.agentId}`);
        console.log(`   Settings show: 693cfadf000997d3cd66`);
        console.log('\n💡 SOLUTION: Update agentId to match the user ID from settings');
        console.log('   Run: node update-agentid.cjs 693cfadf000997d3cd66');
      } else {
        console.log('✅ agentId matches user ID - linkage is correct!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

compareTherapists();

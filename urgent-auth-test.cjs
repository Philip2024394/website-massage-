const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function testAuthenticatedAccess() {
  try {
    console.log('🔐 TEST 1: Anonymous Session Access');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Create anonymous session
    await account.createAnonymousSession();
    console.log('✅ Anonymous session created');
    
    // Try to read therapists
    const anonResult = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', 'indastreet1@gmail.com')]
    );
    
    console.log(`✅ Anonymous can read: ${anonResult.documents.length} therapist(s) found`);
    if (anonResult.documents.length > 0) {
      console.log('   Name:', anonResult.documents[0].name);
      console.log('   agentId:', anonResult.documents[0].agentId);
    }
    
    // Delete anonymous session
    await account.deleteSession('current');
    console.log('✅ Anonymous session deleted\n');
    
    console.log('🔐 TEST 2: Authenticated Session Access');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️ Cannot test with email/password from script without exposing credentials');
    console.log('⚠️ This test needs to be done from browser console\n');
    
    console.log('📋 BROWSER TEST INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Go to http://localhost:3001 and sign in');
    console.log('2. Open browser DevTools (F12) → Console tab');
    console.log('3. After sign-in redirects to therapist dashboard (3003)');
    console.log('4. Look for these log messages:');
    console.log('   - "✅ Authenticated user: indastreet1@gmail.com"');
    console.log('   - "🔍 Searching for therapist by email:"');
    console.log('   - "📋 Found therapists with email:"');
    console.log('   - If error: "❌ Error finding therapist by email:"\n');
    console.log('5. Copy all console output and send it\n');
    
    console.log('🔍 TEST 3: Collection Configuration Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Create new anonymous session for this test
    await account.createAnonymousSession();
    
    // Check collection info
    console.log('Database ID: 68f76ee1000e64ca8d05');
    console.log('Collection ID: therapists_collection_id');
    console.log('');
    
    // List all therapists to verify collection is accessible
    const allTherapists = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      []
    );
    
    console.log(`Total therapists in collection: ${allTherapists.total}`);
    console.log('Therapists:');
    allTherapists.documents.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.name} (${t.email}) - agentId: ${t.agentId || '(empty)'}`);
    });
    console.log('');
    
    console.log('🔍 TEST 4: Checking Current agentId for indastreet1@gmail.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const currentProfile = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', 'indastreet1@gmail.com')]
    );
    
    if (currentProfile.documents.length > 0) {
      const profile = currentProfile.documents[0];
      console.log('Current agentId in database:', profile.agentId);
      console.log('Expected user ID (from settings):', '693cfadf000997d3cd66');
      console.log('Match?', profile.agentId === '693cfadf000997d3cd66' ? '✅ YES' : '❌ NO');
    }
    
    console.log('\n🔍 TEST 5: Appwrite Collection Permissions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️ CRITICAL: Check collection permissions in Appwrite Console');
    console.log('');
    console.log('Go to: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05/collection-therapists_collection_id/settings');
    console.log('');
    console.log('Check Settings → Permissions:');
    console.log('  ✓ Should have: Role "Any" with READ permission (for home page display)');
    console.log('  ✓ Should have: Role "Users" with READ permission (for authenticated access)');
    console.log('');
    console.log('If "Users" role is missing → That\'s the problem!');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.type) console.error('   Type:', error.type);
    if (error.code) console.error('   Code:', error.code);
  }
}

testAuthenticatedAccess();

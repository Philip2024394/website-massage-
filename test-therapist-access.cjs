const { Client, Databases, Account } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);
const databaseId = '68f76ee1000e64ca8d05';

// Test both collection IDs
const collectionTests = [
    { name: 'Environment Variable ID', id: '676703b40009b9dd33de' },
    { name: 'Old Placeholder ID', id: '676703b40009b9dd33de' }
];

async function testTherapistAccess() {
    console.log('🔧 Testing Therapist Collection Access');
    console.log('Database ID:', databaseId);
    console.log('=' .repeat(60));
    
    // First try to create anonymous session
    try {
        console.log('🔄 Creating anonymous session...');
        const session = await account.createAnonymousSession();
        console.log('✅ Anonymous session created:', session.$id);
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Anonymous session already exists');
        } else {
            console.log('❌ Anonymous session failed:', error.message);
        }
    }
    
    // Test each collection ID
    for (const test of collectionTests) {
        console.log(`\n🔍 Testing: ${test.name} (${test.id})`);
        console.log('-'.repeat(40));
        
        try {
            const response = await databases.listDocuments(
                databaseId,
                test.id,
                [] // No queries - just list all
            );
            
            console.log(`✅ SUCCESS! Found ${response.documents.length} therapists`);
            
            if (response.documents.length > 0) {
                const sample = response.documents[0];
                console.log('📋 Sample therapist:');
                console.log(`   Name: ${sample.name || 'No name'}`);
                console.log(`   IsLive: ${sample.isLive}`);
                console.log(`   Status: ${sample.status || 'No status'}`);
                console.log(`   ID: ${sample.$id}`);
                
                // Check how many are live
                const liveCount = response.documents.filter(t => t.isLive === true).length;
                console.log(`🟢 Live therapists: ${liveCount}/${response.documents.length}`);
                
                if (liveCount === 0) {
                    console.log('⚠️  WARNING: No therapists have isLive=true');
                    console.log('   This explains why no cards show on homepage');
                }
            }
            
            // This collection ID works!
            console.log(`\n🎯 SOLUTION: Use collection ID "${test.id}"`);
            break;
            
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            
            if (error.message.includes('not found')) {
                console.log('   → Collection ID does not exist');
            } else if (error.message.includes('not authorized')) {
                console.log('   → Collection exists but lacks public read permissions');
                console.log('   → Need to add "Any" role with Read permission in Appwrite Console');
            }
        }
    }
}

testTherapistAccess();
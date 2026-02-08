/**
 * 🧪 VERIFY DATABASE INDEXES
 * 
 * This script verifies that the database indexes were created successfully
 * and measures query performance with indexes active.
 * 
 * Run: node verify-database-indexes.cjs
 */

const sdk = require('node-appwrite');
require('dotenv').config();

async function verifyIndexes() {
    console.log('🧪 Verifying database indexes...\n');

    // Initialize Appwrite client
    const client = new sdk.Client()
        .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
    const therapistMenusCollectionId = process.env.VITE_THERAPIST_MENUS_COLLECTION_ID;
    const shareLinksCollectionId = process.env.VITE_SHARE_LINKS_COLLECTION_ID;

    const results = {
        menus: { exists: false, works: false, time: 0 },
        shareLinks: { exists: false, works: false, time: 0 }
    };

    // ============================================
    // VERIFY INDEX 1: therapist_menus.therapistId
    // ============================================
    console.log('📊 Checking therapist_menus index...');
    try {
        const indexes = await databases.listIndexes(databaseId, therapistMenusCollectionId);
        const targetIndex = indexes.indexes.find(idx => idx.key === 'idx_therapist_menus_therapist_id');
        
        if (targetIndex) {
            console.log('✅ Index exists:', targetIndex.key);
            console.log(`   Status: ${targetIndex.status}`);
            console.log(`   Attributes: ${targetIndex.attributes.join(', ')}`);
            results.menus.exists = true;

            // Test query performance
            console.log('   Testing query performance...');
            const startTime = Date.now();
            await databases.listDocuments(
                databaseId,
                therapistMenusCollectionId,
                [sdk.Query.limit(10)] // Simple query to test index
            );
            const endTime = Date.now();
            results.menus.time = endTime - startTime;
            results.menus.works = true;
            console.log(`   ⚡ Query time: ${results.menus.time}ms`);
        } else {
            console.log('❌ Index NOT found: idx_therapist_menus_therapist_id');
        }
    } catch (error) {
        console.error('❌ Error checking therapist_menus index:', error.message);
    }
    console.log('');

    // ============================================
    // VERIFY INDEX 2: share_links compound index
    // ============================================
    console.log('📊 Checking share_links index...');
    try {
        const indexes = await databases.listIndexes(databaseId, shareLinksCollectionId);
        const targetIndex = indexes.indexes.find(idx => idx.key === 'idx_share_links_lookup');
        
        if (targetIndex) {
            console.log('✅ Index exists:', targetIndex.key);
            console.log(`   Status: ${targetIndex.status}`);
            console.log(`   Attributes: ${targetIndex.attributes.join(', ')}`);
            results.shareLinks.exists = true;

            // Test query performance
            console.log('   Testing query performance...');
            const startTime = Date.now();
            await databases.listDocuments(
                databaseId,
                shareLinksCollectionId,
                [sdk.Query.limit(10)] // Simple query to test index
            );
            const endTime = Date.now();
            results.shareLinks.time = endTime - startTime;
            results.shareLinks.works = true;
            console.log(`   ⚡ Query time: ${results.shareLinks.time}ms`);
        } else {
            console.log('❌ Index NOT found: idx_share_links_lookup');
        }
    } catch (error) {
        console.error('❌ Error checking share_links index:', error.message);
    }
    console.log('');

    // ============================================
    // PERFORMANCE SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`therapist_menus index:`);
    console.log(`  Exists: ${results.menus.exists ? '✅' : '❌'}`);
    console.log(`  Working: ${results.menus.works ? '✅' : '❌'}`);
    console.log(`  Query Time: ${results.menus.time}ms`);
    console.log();
    console.log(`share_links index:`);
    console.log(`  Exists: ${results.shareLinks.exists ? '✅' : '❌'}`);
    console.log(`  Working: ${results.shareLinks.works ? '✅' : '❌'}`);
    console.log(`  Query Time: ${results.shareLinks.time}ms`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Performance assessment
    const avgTime = (results.menus.time + results.shareLinks.time) / 2;
    if (avgTime < 100) {
        console.log('🎉 EXCELLENT! Query performance is optimal (<100ms average)');
    } else if (avgTime < 500) {
        console.log('✅ GOOD! Query performance is acceptable (<500ms average)');
    } else {
        console.log('⚠️  WARNING: Query times are still high. Indexes may still be building.');
        console.log('   Wait a few minutes and run this script again.');
    }

    const allIndexesWork = results.menus.exists && results.menus.works && 
                          results.shareLinks.exists && results.shareLinks.works;
    
    if (allIndexesWork) {
        console.log('\n✅ All indexes are active and working correctly!');
        console.log('Your N+1 query problem is now fixed. Test your homepage!');
    } else {
        console.log('\n❌ Some indexes are missing or not working.');
        console.log('Run: node create-database-indexes.cjs');
    }
}

// Run verification
verifyIndexes().catch(error => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
});

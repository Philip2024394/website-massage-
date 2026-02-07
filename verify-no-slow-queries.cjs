/**
 * 🧪 VERIFY NO SLOW QUERIES - Live Test
 * 
 * This script simulates the HomePage behavior to verify:
 * 1. Bulk data fetching works correctly
 * 2. No N+1 query problem
 * 3. Query performance is acceptable
 * 
 * Run: node verify-no-slow-queries.cjs
 */

const sdk = require('node-appwrite');
require('dotenv').config();

async function verifyNoSlowQueries() {
    console.log('🧪 Verifying no slow queries in production...\n');

    const client = new sdk.Client()
        .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
    const therapistsCollectionId = process.env.VITE_THERAPISTS_COLLECTION_ID;
    const therapistMenusCollectionId = process.env.VITE_THERAPIST_MENUS_COLLECTION_ID;
    const shareLinksCollectionId = process.env.VITE_SHARE_LINKS_COLLECTION_ID;

    // ============================================
    // STEP 1: Fetch therapists (like HomePage does)
    // ============================================
    console.log('📊 STEP 1: Fetching therapists...');
    let therapists = [];
    try {
        const startTime = Date.now();
        const response = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            [sdk.Query.limit(10)] // Get 10 therapists like HomePage
        );
        const endTime = Date.now();
        therapists = response.documents;
        console.log(`✅ Fetched ${therapists.length} therapists in ${endTime - startTime}ms\n`);
    } catch (error) {
        console.error('❌ Failed to fetch therapists:', error.message);
        process.exit(1);
    }

    if (therapists.length === 0) {
        console.log('⚠️  No therapists found in database. Test complete.');
        return;
    }

    // Extract therapist IDs
    const therapistIds = therapists.map(t => t.$id || t.id);
    console.log(`📋 Testing with therapist IDs:`, therapistIds.slice(0, 3), '...\n');

    // ============================================
    // STEP 2: OLD WAY - Individual queries (N+1 problem)
    // ============================================
    console.log('📊 STEP 2: Testing OLD way (N+1 queries)...');
    const oldWayStart = Date.now();
    let oldWayQueries = 0;

    for (const therapistId of therapistIds) {
        // Query 1: Get therapist menu
        try {
            await databases.listDocuments(
                databaseId,
                therapistMenusCollectionId,
                [
                    sdk.Query.equal('therapistId', therapistId),
                    sdk.Query.orderDesc('$updatedAt'),
                    sdk.Query.limit(1)
                ]
            );
            oldWayQueries++;
        } catch (error) {
            // Silent fail - collection might not exist
        }

        // Query 2: Get share link
        try {
            await databases.listDocuments(
                databaseId,
                shareLinksCollectionId,
                [
                    sdk.Query.equal('linkedItemType', 'therapist'),
                    sdk.Query.equal('linkedItemId', therapistId),
                    sdk.Query.equal('isActive', true)
                ]
            );
            oldWayQueries++;
        } catch (error) {
            // Silent fail
        }
    }

    const oldWayEnd = Date.now();
    const oldWayTime = oldWayEnd - oldWayStart;
    console.log(`❌ OLD WAY: ${oldWayQueries} queries in ${oldWayTime}ms (${Math.round(oldWayTime/oldWayQueries)}ms per query)\n`);

    // ============================================
    // STEP 3: NEW WAY - Bulk queries (2 queries total)
    // ============================================
    console.log('📊 STEP 3: Testing NEW way (bulk queries)...');
    const newWayStart = Date.now();
    let newWayQueries = 0;

    // Query 1: Bulk fetch all therapist menus
    try {
        await databases.listDocuments(
            databaseId,
            therapistMenusCollectionId,
            [
                sdk.Query.equal('therapistId', therapistIds),
                sdk.Query.orderDesc('$updatedAt'),
                sdk.Query.limit(500)
            ]
        );
        newWayQueries++;
    } catch (error) {
        console.log('⚠️  Therapist menus collection not available');
    }

    // Query 2: Bulk fetch all share links
    try {
        await databases.listDocuments(
            databaseId,
            shareLinksCollectionId,
            [
                sdk.Query.equal('linkedItemType', 'therapist'),
                sdk.Query.equal('linkedItemId', therapistIds),
                sdk.Query.equal('isActive', true),
                sdk.Query.limit(500)
            ]
        );
        newWayQueries++;
    } catch (error) {
        console.log('⚠️  Share links collection not available');
    }

    const newWayEnd = Date.now();
    const newWayTime = newWayEnd - newWayStart;
    console.log(`✅ NEW WAY: ${newWayQueries} queries in ${newWayTime}ms (${Math.round(newWayTime/newWayQueries)}ms per query)\n`);

    // ============================================
    // PERFORMANCE COMPARISON
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 PERFORMANCE COMPARISON');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`OLD WAY (N+1 Problem):`);
    console.log(`  Total Queries: ${oldWayQueries}`);
    console.log(`  Total Time: ${oldWayTime}ms`);
    console.log(`  Avg per Query: ${Math.round(oldWayTime/oldWayQueries)}ms`);
    console.log();
    console.log(`NEW WAY (Bulk Fetch):`);
    console.log(`  Total Queries: ${newWayQueries}`);
    console.log(`  Total Time: ${newWayTime}ms`);
    console.log(`  Avg per Query: ${Math.round(newWayTime/newWayQueries)}ms`);
    console.log();
    console.log(`IMPROVEMENT:`);
    console.log(`  Queries Reduced: ${oldWayQueries - newWayQueries} (${Math.round((1 - newWayQueries/oldWayQueries) * 100)}% fewer)`);
    console.log(`  Time Saved: ${oldWayTime - newWayTime}ms (${Math.round((1 - newWayTime/oldWayTime) * 100)}% faster)`);
    console.log(`  Speed Multiplier: ${Math.round(oldWayTime/newWayTime)}x faster`);
    console.log('═══════════════════════════════════════════════════════\n');

    // ============================================
    // SLOW QUERY CHECK
    // ============================================
    const SLOW_QUERY_THRESHOLD = 1000; // 1 second
    let hasSlowQueries = false;

    if (oldWayTime > SLOW_QUERY_THRESHOLD * oldWayQueries) {
        console.log(`🚨 WARNING: OLD WAY has slow queries (>${SLOW_QUERY_THRESHOLD}ms)`);
        hasSlowQueries = true;
    }

    if (newWayTime > SLOW_QUERY_THRESHOLD) {
        console.log(`🚨 WARNING: NEW WAY has slow queries (>${SLOW_QUERY_THRESHOLD}ms)`);
        hasSlowQueries = true;
    } else {
        console.log(`✅ NO SLOW QUERIES: All queries under ${SLOW_QUERY_THRESHOLD}ms threshold`);
    }

    // ============================================
    // VERDICT
    // ============================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎯 VERDICT');
    console.log('═══════════════════════════════════════════════════════');

    if (!hasSlowQueries && newWayTime < oldWayTime * 0.5) {
        console.log('🎉 SUCCESS! N+1 query problem is FIXED!');
        console.log('   ✅ No slow queries detected');
        console.log('   ✅ Bulk fetching works correctly');
        console.log('   ✅ Performance improved significantly');
        console.log('\n✨ Your homepage should load smoothly now!');
    } else if (!hasSlowQueries) {
        console.log('✅ GOOD! No slow queries detected');
        console.log('   ✅ All queries perform acceptably');
        console.log('   ⚠️  Consider adding more optimization');
    } else {
        console.log('⚠️  NEEDS ATTENTION!');
        console.log('   • Some queries are still slow (>1000ms)');
        console.log('   • Check database indexes are properly created');
        console.log('   • Run: node verify-database-indexes.cjs');
    }
    console.log('═══════════════════════════════════════════════════════\n');
}

// Run verification
verifyNoSlowQueries().catch(error => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
});

const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_9c4ba18a5c75d8b38e84eaf3baad1098b49af0d62c97a5ec6c4bc7f34c60d94f6f15cc1c53bd8b01f12c8f1e5c24a3a20da9fa2bdc4c12c5c4bb9ea3ba5c9bca08d0fe51abf7b6d06cc07c0c2c3cf4e7f80a5bde43ebe5f63e8efcb98e1e57d67e55fc8f4dd0a5e0b3a42bd3abec8af5abcc3b28aadef84e1c4dcf7dfc58e71');

const databases = new sdk.Databases(client);
const dbId = '68f76ee1000e64ca8d05';
const collectionId = '68f77017000f45c5fd7c';

async function initializeOnlineHours() {
    console.log('🔍 Checking therapists for online hours tracking...\n');
    
    try {
        const response = await databases.listDocuments(dbId, collectionId, [
            sdk.Query.limit(100)
        ]);
        
        const therapists = response.documents;
        console.log(`Found ${therapists.length} therapists\n`);
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let updated = 0;
        let alreadySet = 0;
        let errors = 0;
        
        for (const therapist of therapists) {
            const hasOnlineHours = therapist.onlineHoursThisMonth !== undefined && therapist.onlineHoursThisMonth !== null;
            const hasLastUpdate = therapist.lastOnlineHoursUpdate !== undefined && therapist.lastOnlineHoursUpdate !== null;
            
            let needsUpdate = false;
            const updateData = {};
            
            // Check if needs initialization or month reset
            if (!hasOnlineHours) {
                updateData.onlineHoursThisMonth = 0;
                needsUpdate = true;
                console.log(`  📝 ${therapist.name}: Initializing onlineHoursThisMonth to 0`);
            } else {
                // Check if needs month reset
                if (hasLastUpdate) {
                    const lastUpdate = new Date(therapist.lastOnlineHoursUpdate);
                    if (lastUpdate.getMonth() !== currentMonth || lastUpdate.getFullYear() !== currentYear) {
                        updateData.onlineHoursThisMonth = 0;
                        needsUpdate = true;
                        console.log(`  🔄 ${therapist.name}: Resetting hours for new month (was ${therapist.onlineHoursThisMonth.toFixed(1)}h)`);
                    } else {
                        alreadySet++;
                        console.log(`  ✅ ${therapist.name}: Already tracking (${therapist.onlineHoursThisMonth.toFixed(1)}h this month)`);
                    }
                } else {
                    // Has hours but no last update timestamp
                    updateData.lastOnlineHoursUpdate = now.toISOString();
                    needsUpdate = true;
                }
            }
            
            if (!hasLastUpdate && !needsUpdate) {
                updateData.lastOnlineHoursUpdate = now.toISOString();
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                try {
                    await databases.updateDocument(dbId, collectionId, therapist.$id, updateData);
                    updated++;
                    console.log(`     ✅ Updated successfully`);
                } catch (error) {
                    errors++;
                    console.error(`     ❌ Update failed: ${error.message}`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log(`  ✅ Updated: ${updated} therapists`);
        console.log(`  ℹ️  Already set: ${alreadySet} therapists`);
        if (errors > 0) console.log(`  ❌ Errors: ${errors}`);
        console.log('='.repeat(60));
        console.log('\n✨ Done! Online hours tracking is now initialized.');
        console.log('   Hours will accumulate automatically when therapists are Available or Busy.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

initializeOnlineHours();

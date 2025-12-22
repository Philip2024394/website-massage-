const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_9c4ba18a5c75d8b38e84eaf3baad1098b49af0d62c97a5ec6c4bc7f34c60d94f6f15cc1c53bd8b01f12c8f1e5c24a3a20da9fa2bdc4c12c5c4bb9ea3ba5c9bca08d0fe51abf7b6d06cc07c0c2c3cf4e7f80a5bde43ebe5f63e8efcb98e1e57d67e55fc8f4dd0a5e0b3a42bd3abec8af5abcc3b28aadef84e1c4dcf7dfc58e71');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function checkDiscountBadge() {
    try {
        console.log('\n🔍 Fetching therapist with ACTIVE discount badge...\n');
        
        // Get all therapists with discount data
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            [
                Query.greaterThan('discountPercentage', 0),
                Query.limit(100)
            ]
        );
        
        console.log(`📊 Found ${response.documents.length} therapist(s) with discount percentage > 0\n`);
        
        for (const therapist of response.documents) {
            const now = new Date();
            const endTime = therapist.discountEndTime ? new Date(therapist.discountEndTime) : null;
            const isExpired = endTime ? endTime < now : true;
            const timeLeft = endTime ? endTime.getTime() - now.getTime() : 0;
            
            console.log('━'.repeat(80));
            console.log(`👤 ${therapist.name} (ID: ${therapist.$id})`);
            console.log('━'.repeat(80));
            console.log(`  📧 Email: ${therapist.email || 'N/A'}`);
            console.log(`  💰 Discount Percentage: ${therapist.discountPercentage}%`);
            console.log(`  🚦 isDiscountActive (FLAG): ${therapist.isDiscountActive}`);
            console.log(`  ⏰ Discount End Time: ${therapist.discountEndTime || 'NOT SET'}`);
            
            if (endTime) {
                console.log(`  📅 Expires: ${endTime.toLocaleString()}`);
                console.log(`  🕐 Current Time: ${now.toLocaleString()}`);
                
                if (isExpired) {
                    console.log(`  ❌ STATUS: EXPIRED (ended ${Math.abs(timeLeft / 60000).toFixed(0)} minutes ago)`);
                } else {
                    const hoursLeft = Math.floor(timeLeft / 3600000);
                    const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
                    console.log(`  ✅ STATUS: ACTIVE (${hoursLeft}h ${minutesLeft}m remaining)`);
                }
            } else {
                console.log(`  ⚠️  STATUS: NO END TIME SET`);
            }
            
            // Check ALL conditions for badge to display
            console.log('\n  🔍 Badge Display Conditions:');
            console.log(`     ✓ discountPercentage > 0: ${therapist.discountPercentage > 0 ? '✅ YES' : '❌ NO'}`);
            console.log(`     ✓ discountEndTime exists: ${therapist.discountEndTime ? '✅ YES' : '❌ NO'}`);
            console.log(`     ✓ isDiscountActive === true: ${therapist.isDiscountActive === true ? '✅ YES' : '❌ NO'}`);
            console.log(`     ✓ Not expired: ${!isExpired ? '✅ YES' : '❌ NO'}`);
            
            const willDisplay = therapist.discountPercentage > 0 && 
                              therapist.discountEndTime && 
                              therapist.isDiscountActive === true && 
                              !isExpired;
            
            console.log(`\n  🎯 BADGE WILL DISPLAY: ${willDisplay ? '✅ YES' : '❌ NO'}`);
            
            if (!willDisplay) {
                console.log(`\n  ⚠️  ISSUE FOUND:`);
                if (therapist.discountPercentage <= 0) console.log(`     - Discount percentage is ${therapist.discountPercentage} (needs to be > 0)`);
                if (!therapist.discountEndTime) console.log(`     - No end time set`);
                if (therapist.isDiscountActive !== true) console.log(`     - isDiscountActive flag is "${therapist.isDiscountActive}" (needs to be true)`);
                if (isExpired) console.log(`     - Discount has expired`);
            }
            
            console.log('\n');
        }
        
        if (response.documents.length === 0) {
            console.log('ℹ️  No therapists found with discount percentage > 0');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('   Code:', error.code);
    }
}

checkDiscountBadge();

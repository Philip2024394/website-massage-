/**
 * Script to activate SafePass for specific therapists
 * 
 * Creates SafePass records in the safepass collection
 * 
 * Therapists to activate:
 * - Wiwid
 * - Umi sangadah
 * - Surtiningsih
 * - Winda
 */

const { Client, Databases, Query, ID } = require('node-appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';
const SAFEPASS_COLLECTION_ID = 'safepass';

// Therapist names to activate
const THERAPIST_NAMES = [
    'Wiwid',
    'Umi sangadah',
    'Surtiningsih',
    'Winda'
];

async function activateSafePass() {
    console.log('🚀 Starting SafePass activation...\n');
    
    try {
        // Fetch all therapists
        console.log('📋 Fetching therapists from database...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );
        
        console.log(`✅ Found ${response.documents.length} total therapists\n`);
        
        // Filter therapists by name
        const therapistsToActivate = response.documents.filter(therapist => {
            // Case-insensitive match, trimmed
            const name = therapist.name?.trim().toLowerCase();
            return THERAPIST_NAMES.some(targetName => 
                name === targetName.trim().toLowerCase()
            );
        });
        
        console.log(`🎯 Found ${therapistsToActivate.length} therapists to activate:\n`);
        therapistsToActivate.forEach(t => {
            console.log(`   - ${t.name} (ID: ${t.$id})`);
        });
        console.log('');
        
        if (therapistsToActivate.length === 0) {
            console.log('⚠️  No matching therapists found. Please check the names.');
            return;
        }
        
        // Create/Update SafePass records for each therapist
        let successCount = 0;
        let errorCount = 0;
        
        for (const therapist of therapistsToActivate) {
            try {
                console.log(`🔄 Activating SafePass for ${therapist.name}...`);
                
                // Check if SafePass record already exists
                const existingRecords = await databases.listDocuments(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    [
                        Query.equal('entityType', 'therapist'),
                        Query.equal('entityId', therapist.$id),
                        Query.limit(1)
                    ]
                );

                const now = new Date().toISOString();
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 YEAR validity

                const safePassData = {
                    entityType: 'therapist',
                    entityId: therapist.$id,
                    entityName: therapist.name,
                    hotelVillaSafePassStatus: 'active',
                    hasSafePassVerification: true,
                    safePassIssuedAt: now,
                    safePassExpiry: expiryDate.toISOString(),
                    safePassSubmittedAt: now
                };

                if (existingRecords.documents.length > 0) {
                    // Update existing record
                    await databases.updateDocument(
                        DATABASE_ID,
                        SAFEPASS_COLLECTION_ID,
                        existingRecords.documents[0].$id,
                        safePassData
                    );
                    console.log(`   ✅ SafePass record updated for ${therapist.name}\n`);
                } else {
                    // Create new record
                    await databases.createDocument(
                        DATABASE_ID,
                        SAFEPASS_COLLECTION_ID,
                        ID.unique(),
                        safePassData
                    );
                    console.log(`   ✅ SafePass record created for ${therapist.name}\n`);
                }
                
                successCount++;
            } catch (error) {
                console.error(`   ❌ Failed to activate SafePass for ${therapist.name}:`, error.message, '\n');
                errorCount++;
            }
        }
        
        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Successfully activated: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📋 Total processed: ${therapistsToActivate.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        if (successCount === therapistsToActivate.length) {
            console.log('🎉 All therapists successfully activated for SafePass!');
            console.log('📍 SafePass records created in "safepass" collection');
        }
        
    } catch (error) {
        console.error('❌ Error during activation:', error);
        throw error;
    }
}

// Run the script
activateSafePass()
    .then(() => {
        console.log('\n✨ Script completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });

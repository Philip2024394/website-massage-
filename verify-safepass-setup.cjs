/**
 * SafePass Verification Script
 * Checks Appwrite collection setup and therapist SafePass status
 */

const { Client, Databases, Query } = require('node-appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';
const SAFEPASS_COLLECTION_ID = 'safepass';

// Therapists to verify
const THERAPIST_NAMES = [
    'Wiwid',
    'Umi sangadah',
    'Surtiningsih',
    'Winda'
];

async function verifySafePassSetup() {
    console.log('🔍 Starting SafePass Verification...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // ===== STEP 1: Check SafePass Collection =====
        console.log('📋 STEP 1: Checking SafePass Collection...');
        let collectionExists = false;
        let collectionError = null;

        try {
            const safePassDocs = await databases.listDocuments(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                [Query.limit(1)]
            );
            collectionExists = true;
            console.log('   ✅ SafePass collection EXISTS');
            console.log(`   ℹ️  Total documents: ${safePassDocs.total || 0}`);
        } catch (error) {
            collectionExists = false;
            collectionError = error.message;
            console.log('   ❌ SafePass collection NOT FOUND or NOT ACCESSIBLE');
            console.log(`   ℹ️  Error: ${error.message}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // ===== STEP 2: Check Therapist Collection Permissions =====
        console.log('📋 STEP 2: Checking Therapist Collection...');
        
        try {
            const therapists = await databases.listDocuments(
                DATABASE_ID,
                THERAPISTS_COLLECTION_ID,
                [Query.limit(5)]
            );
            console.log(`   ✅ Therapist collection accessible`);
            console.log(`   ℹ️  Total therapists: ${therapists.total || 0}`);
        } catch (error) {
            console.log(`   ❌ Error accessing therapist collection: ${error.message}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // ===== STEP 3: Verify Requested Therapists =====
        console.log('📋 STEP 3: Checking SafePass Status for Requested Therapists...\n');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );

        const targetTherapists = response.documents.filter(therapist => {
            const name = therapist.name?.trim().toLowerCase();
            return THERAPIST_NAMES.some(targetName => 
                name === targetName.trim().toLowerCase()
            );
        });

        if (targetTherapists.length === 0) {
            console.log('   ⚠️  No matching therapists found in database\n');
        } else {
            console.log(`   Found ${targetTherapists.length} matching therapists:\n`);
            
            let activeSafePass = 0;
            let needsActivation = 0;

            for (const therapist of targetTherapists) {
                // Check SafePass collection for this therapist
                const safePassRecords = await databases.listDocuments(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    [
                        Query.equal('entityType', 'therapist'),
                        Query.equal('entityId', therapist.$id),
                        Query.limit(1)
                    ]
                );

                const hasSafePass = safePassRecords.documents.length > 0;
                const safePassRecord = hasSafePass ? safePassRecords.documents[0] : null;
                const isActive = safePassRecord?.hotelVillaSafePassStatus === 'active' && 
                                  safePassRecord?.hasSafePassVerification === true;

                console.log(`   👤 ${therapist.name}`);
                console.log(`      ID: ${therapist.$id}`);
                
                if (hasSafePass) {
                    console.log(`      SafePass Record: Found`);
                    console.log(`      Status: ${safePassRecord.hotelVillaSafePassStatus || 'NOT SET'}`);
                    console.log(`      Verification: ${safePassRecord.hasSafePassVerification ? 'YES ✓' : 'NO ✗'}`);
                    
                    if (isActive) {
                        console.log(`      ✅ SafePass ACTIVE\n`);
                        activeSafePass++;
                    } else {
                        console.log(`      ⚠️  SafePass NOT ACTIVE\n`);
                        needsActivation++;
                    }
                } else {
                    console.log(`      SafePass Record: Not Found`);
                    console.log(`      ⚠️  SafePass NOT ACTIVE`);
                    console.log(`      → Run activate-safepass.cjs to activate\n`);
                    needsActivation++;
                }
            }

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 SUMMARY');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`✅ Active SafePass: ${activeSafePass}`);
            console.log(`⚠️  Needs Activation: ${needsActivation}`);
            console.log(`📋 Total Found: ${targetTherapists.length}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // ===== STEP 4: Check SafePass Applications =====
        if (collectionExists) {
            console.log('📋 STEP 4: Checking SafePass Applications...\n');
            
            try {
                const applications = await databases.listDocuments(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    [Query.limit(100)]
                );

                if (applications.total === 0) {
                    console.log('   ℹ️  No SafePass applications found\n');
                } else {
                    console.log(`   Found ${applications.total} applications:\n`);
                    
                    const stats = {
                        pending: 0,
                        approved: 0,
                        active: 0,
                        rejected: 0
                    };

                    for (const app of applications.documents) {
                        stats[app.hotelVillaSafePassStatus] = (stats[app.hotelVillaSafePassStatus] || 0) + 1;
                    }

                    console.log(`   📊 Status Breakdown:`);
                    console.log(`      Pending: ${stats.pending}`);
                    console.log(`      Approved: ${stats.approved}`);
                    console.log(`      Active: ${stats.active}`);
                    console.log(`      Rejected: ${stats.rejected}\n`);

                    // Show recent applications
                    console.log(`   Recent Applications:`);
                    applications.documents.slice(0, 5).forEach(app => {
                        console.log(`      • ${app.entityName} (${app.entityType}) - ${app.hotelVillaSafePassStatus}`);
                    });
                }
            } catch (error) {
                console.log(`   ❌ Error reading SafePass applications: ${error.message}\n`);
            }

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

        // ===== FINAL RECOMMENDATIONS =====
        console.log('💡 RECOMMENDATIONS:\n');

        if (!collectionExists) {
            console.log('   ⚠️  SafePass collection not found!');
            console.log('   → Follow SAFEPASS_APPWRITE_SETUP.md to create the collection\n');
        } else {
            console.log('   ✅ SafePass collection is properly set up\n');
        }

        if (targetTherapists.length > 0) {
            // Count therapists without active SafePass records
            let needsActivationCount = 0;
            for (const therapist of targetTherapists) {
                const safePassRecords = await databases.listDocuments(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    [
                        Query.equal('entityType', 'therapist'),
                        Query.equal('entityId', therapist.$id),
                        Query.limit(1)
                    ]
                );

                const hasSafePass = safePassRecords.documents.length > 0;
                const safePassRecord = hasSafePass ? safePassRecords.documents[0] : null;
                const isActive = safePassRecord?.hotelVillaSafePassStatus === 'active' && 
                                  safePassRecord?.hasSafePassVerification === true;

                if (!isActive) {
                    needsActivationCount++;
                }
            }

            if (needsActivationCount > 0) {
                console.log('   ⚠️  Some therapists need SafePass activation');
                console.log('   → Run: node activate-safepass.cjs');
                console.log('   → Or use Admin Dashboard: /admin/safepass\n');
            } else {
                console.log('   ✅ All requested therapists have active SafePass\n');
            }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        throw error;
    }
}

// Run verification
verifySafePassSetup()
    .then(() => {
        console.log('✨ Verification complete!\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Verification failed:', error.message);
        console.error('\nPlease check:');
        console.error('1. APPWRITE_API_KEY environment variable is set');
        console.error('2. API key has proper permissions');
        console.error('3. Collection IDs are correct');
        console.error('4. Database ID is correct\n');
        process.exit(1);
    });

import { Client, Databases, Query } from 'node-appwrite';
import { convertLocationStringToId, LOCATION_IDS } from './utils/locationNormalizationV2.ts';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🔄 Starting locationId Migration...\n');

async function migrateLocationIds() {
    try {
        // Fetch all therapists
        const response = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            [Query.limit(500)]
        );

        console.log(`Found ${response.documents.length} therapists\n`);

        let updated = 0;
        let skipped = 0;
        let errors = 0;

        for (const therapist of response.documents) {
            try {
                // Skip if already has locationId
                if (therapist.locationId) {
                    console.log(`✅ ${therapist.name}: Already has locationId "${therapist.locationId}"`);
                    skipped++;
                    continue;
                }

                // Get location string
                const location = therapist.location;
                if (!location || typeof location !== 'string') {
                    console.warn(`⚠️  ${therapist.name}: No location field, skipping`);
                    skipped++;
                    continue;
                }

                // Convert to locationId
                const locationId = convertLocationStringToId(location);
                
                if (locationId === LOCATION_IDS.ALL) {
                    console.warn(`⚠️  ${therapist.name}: Could not map location "${location}" to locationId, skipping`);
                    skipped++;
                    continue;
                }

                // Update document
                await databases.updateDocument(
                    databaseId,
                    therapistsCollectionId,
                    therapist.$id,
                    {
                        locationId: locationId
                    }
                );

                console.log(`✅ ${therapist.name}: "${location}" → locationId: "${locationId}"`);
                updated++;

            } catch (error) {
                console.error(`❌ ${therapist.name}: Error - ${error.message}`);
                errors++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📝 Total: ${response.documents.length}`);

        if (errors === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration completed with errors');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
        process.exit(1);
    }
}

migrateLocationIds();

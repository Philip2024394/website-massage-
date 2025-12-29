/**
 * Bulk Update: Add Coordinates to Yogyakarta Therapists
 * Updates all therapists with null/invalid coordinates to Yogyakarta center coordinates
 */

import { Client, Databases } from 'node-appwrite';

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_2793aa5fac683c3da4f0b369e8901dcf4a29355726496b382cdc30fd5b4ed9ecd774abf76829c39d545b4fdeaf57f39a238a8624fa92f96e8d95b5c2a3c08d25f78b2b85730da937f9eb2c3b4afdbf74bde281b3b863976720cae10dde17b2181e2256b39e9a80be7de69c44774a4cc768ca4f8146c620394943b635d70e8c63');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

// Yogyakarta center coordinates (Malioboro area)
const YOGYAKARTA_COORDS = {
    lat: -7.7956,
    lng: 110.3695
};

// Bandung center coordinates
const BANDUNG_COORDS = {
    lat: -6.9175,
    lng: 107.6191
};

console.log('🔧 Starting bulk coordinate update for therapists...\n');
console.log('=' .repeat(80));

// Function to get appropriate coordinates based on location
function getCoordinatesForLocation(locationId, location) {
    if (locationId?.toLowerCase().includes('bandung') || location?.toLowerCase().includes('bandung')) {
        return BANDUNG_COORDS;
    }
    // Default to Yogyakarta
    return YOGYAKARTA_COORDS;
}

async function bulkUpdateCoordinates() {
    try {
        // Fetch therapists with invalid coordinates
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            []
        );

        const therapists = response.documents;
        console.log(`📋 Found ${therapists.length} therapists total\n`);

        const therapistsToUpdate = [];

        therapists.forEach(therapist => {
            const coordinates = therapist.coordinates;
            let needsUpdate = false;

            // Check if coordinates are null, "null", or {lat:0, lng:0}
            if (!coordinates || coordinates === 'null') {
                needsUpdate = true;
            } else if (typeof coordinates === 'string') {
                try {
                    const parsed = JSON.parse(coordinates);
                    if (!parsed || parsed.lat === 0 || parsed.lng === 0 || !parsed.lat || !parsed.lng) {
                        needsUpdate = true;
                    }
                } catch {
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                const coords = getCoordinatesForLocation(therapist.locationId, therapist.location);
                therapistsToUpdate.push({
                    id: therapist.$id,
                    name: therapist.name,
                    location: therapist.location,
                    locationId: therapist.locationId,
                    newCoordinates: coords
                });
            }
        });

        console.log(`🎯 Therapists needing coordinate updates: ${therapistsToUpdate.length}\n`);
        console.log('=' .repeat(80));

        if (therapistsToUpdate.length === 0) {
            console.log('✅ All therapists already have valid coordinates!');
            return;
        }

        // Confirm before updating
        console.log('\n⚠️  PREVIEW OF UPDATES:\n');
        therapistsToUpdate.forEach((t, idx) => {
            console.log(`${idx + 1}. ${t.name} (${t.location || t.locationId})`);
            console.log(`   → Will set coordinates to: lat=${t.newCoordinates.lat}, lng=${t.newCoordinates.lng}`);
        });

        console.log('\n' + '=' .repeat(80));
        console.log('⚠️  IMPORTANT: This will update coordinates in your live database!');
        console.log('=' .repeat(80));
        console.log('\n📝 To proceed with the update:');
        console.log('   1. Make sure you have your Appwrite API key ready');
        console.log('   2. Add it to this script at line 12 (setKey)');
        console.log('   3. Uncomment the update code below');
        console.log('\n💡 Tip: You can also update coordinates manually in Appwrite Console\n');

        // UPDATE CODE ENABLED
        console.log('\n🚀 Starting updates...\n');
        let successCount = 0;
        let errorCount = 0;

        for (const therapist of therapistsToUpdate) {
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    therapist.id,
                    {
                        coordinates: JSON.stringify(therapist.newCoordinates)
                    }
                );
                console.log(`✅ Updated ${therapist.name}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to update ${therapist.name}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '=' .repeat(80));
        console.log('📊 UPDATE SUMMARY');
        console.log('=' .repeat(80));
        console.log(`✅ Successfully updated: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📊 Total processed: ${successCount + errorCount}`);

    } catch (error) {
        console.error('\n❌ Error during bulk update:', error);
        if (error.code) {
            console.error('   Error Code:', error.code);
        }
        if (error.message) {
            console.error('   Message:', error.message);
        }
    }
}

bulkUpdateCoordinates();

/**
 * Fix place coordinates specifically - handle coordinate format requirements
 */

const { Client, Databases } = require('node-appwrite');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        places: 'places_collection_id'
    }
};

const YOGYAKARTA_COORDS_STRING = '{"lat":-7.7956,"lng":110.3695}';

console.log('🔧 FIXING PLACE COORDINATES FORMAT...\n');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const databases = new Databases(client);

async function fixPlaceCoordinates() {
    try {
        const placesResponse = await databases.listDocuments(
            config.databaseId,
            config.collections.places
        );

        console.log(`📍 Found ${placesResponse.documents.length} places to update...\n`);

        let updated = 0;
        let errors = 0;

        for (const place of placesResponse.documents) {
            try {
                console.log(`Updating: ${place.name}`);
                console.log(`   Current coordinates: ${JSON.stringify(place.coordinates)}`);
                
                // Only update coordinates field - avoid schema conflicts
                await databases.updateDocument(
                    config.databaseId,
                    config.collections.places,
                    place.$id,
                    {
                        coordinates: YOGYAKARTA_COORDS_STRING
                    }
                );
                
                updated++;
                console.log(`   ✅ Updated to: ${YOGYAKARTA_COORDS_STRING}\n`);
                
            } catch (error) {
                errors++;
                console.log(`   ❌ Error: ${error.message}\n`);
                
                // Try alternative coordinate formats
                if (error.message.includes('point')) {
                    try {
                        console.log('   🔄 Trying Point format...');
                        await databases.updateDocument(
                            config.databaseId,
                            config.collections.places,
                            place.$id,
                            {
                                coordinates: [110.3695, -7.7956] // GeoJSON format [lng, lat]
                            }
                        );
                        updated++;
                        errors--;
                        console.log(`   ✅ Updated with Point format\n`);
                    } catch (pointError) {
                        console.log(`   ❌ Point format also failed: ${pointError.message}\n`);
                    }
                }
            }
        }

        console.log('🎯 COORDINATE FIX SUMMARY:');
        console.log(`   ✅ Successfully updated: ${updated} places`);
        console.log(`   ❌ Failed updates: ${errors} places`);
        
        if (updated > 0) {
            console.log('\n🚀 SUCCESS! Places should now appear in Yogyakarta city filter!');
        }
        
        if (errors > 0) {
            console.log('\n🔧 For failed updates, you may need to:');
            console.log('   1. Check Appwrite Console for required fields');
            console.log('   2. Update schema to accept JSON string coordinates');
            console.log('   3. Or manually update via Appwrite Console');
        }
        
    } catch (error) {
        console.error('❌ Error fixing coordinates:', error.message);
    }
}

fixPlaceCoordinates();
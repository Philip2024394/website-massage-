/**
 * Update all therapist and place coordinates to Yogyakarta location
 * This will make all your existing data appear in city location filtering
 */

const { Client, Databases } = require('node-appwrite');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id',
        places: 'places_collection_id'
    }
};

// Yogyakarta coordinates (your primary city)
const YOGYAKARTA_COORDS = {
    lat: -7.7956,
    lng: 110.3695
};

console.log('🔧 UPDATING COORDINATES TO YOGYAKARTA...\n');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const databases = new Databases(client);

async function updateCoordinates() {
    let therapistsUpdated = 0;
    let placesUpdated = 0;
    
    try {
        // Update Therapists
        console.log('📍 Updating therapist coordinates...');
        const therapistsResponse = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists
        );

        for (const therapist of therapistsResponse.documents) {
            try {
                const coordinatesString = JSON.stringify(YOGYAKARTA_COORDS);
                
                await databases.updateDocument(
                    config.databaseId,
                    config.collections.therapists,
                    therapist.$id,
                    {
                        coordinates: coordinatesString,
                        location: therapist.location || 'Yogyakarta, Indonesia'
                    }
                );
                
                therapistsUpdated++;
                console.log(`   ✅ Updated: ${therapist.name} → ${coordinatesString}`);
            } catch (error) {
                console.log(`   ❌ Failed: ${therapist.name} - ${error.message}`);
            }
        }

        // Update Places
        console.log('\n📍 Updating place coordinates...');
        const placesResponse = await databases.listDocuments(
            config.databaseId,
            config.collections.places
        );

        for (const place of placesResponse.documents) {
            try {
                const coordinatesString = JSON.stringify(YOGYAKARTA_COORDS);
                
                await databases.updateDocument(
                    config.databaseId,
                    config.collections.places,
                    place.$id,
                    {
                        coordinates: coordinatesString,
                        location: place.location || 'Yogyakarta, Indonesia'
                    }
                );
                
                placesUpdated++;
                console.log(`   ✅ Updated: ${place.name} → ${coordinatesString}`);
            } catch (error) {
                console.log(`   ❌ Failed: ${place.name} - ${error.message}`);
            }
        }

        console.log('\n🎯 COORDINATE UPDATE SUMMARY:');
        console.log(`   Therapists: ${therapistsUpdated} updated`);
        console.log(`   Places: ${placesUpdated} updated`);
        console.log(`   All data now shows in "Yogyakarta" city filter! 🚀`);
        
    } catch (error) {
        console.error('❌ Error updating coordinates:', error.message);
        console.log('\n🔧 POSSIBLE ISSUES:');
        console.log('   1. API key needs update permissions');
        console.log('   2. Collection IDs may be incorrect');
        console.log('   3. Check your Appwrite Console permissions');
    }
}

updateCoordinates();
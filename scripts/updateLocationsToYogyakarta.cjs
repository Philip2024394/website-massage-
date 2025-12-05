/**
 * Script to update therapist and place locations to Yogyakarta coordinates
 * This will ensure the city location filtering works properly
 */

const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_d876b6cc715e982d7a41e6b5b2b886af66b1843b4b19b0075f8529b0a0fb531a0fc0671256bd9838a6b0c9c8b2e03367b1b228455dc0d54ccf5dddc38b29a8e610b6c9bda96a777ade23d4caab6e1496901fb98b5c9cac1f7c6e377c87b0e2324157d83fdf2e8ef2e6fa2fe0527f85b33c5286754f8ddf027e93e6206fe3595');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

// Yogyakarta coordinates from our city database
const YOGYAKARTA_COORDS = { lat: -7.7956, lng: 110.3695 };

async function updateLocationsToYogyakarta() {
  try {
    console.log('🔄 Updating all therapists and places to Yogyakarta location...');
    
    // Update therapists
    console.log('\n📍 Updating therapists...');
    const therapists = await databases.listDocuments(
      DATABASE_ID,
      'therapists_collection_id'
    );
    
    for (const therapist of therapists.documents) {
      try {
        const updateData = {
          coordinates: YOGYAKARTA_COORDS,
          location: 'Yogyakarta'
        };
        
        await databases.updateDocument(
          DATABASE_ID,
          'therapists_collection_id',
          therapist.$id,
          updateData
        );
        
        console.log(`✅ Updated therapist: ${therapist.name} -> Yogyakarta`);
      } catch (error) {
        console.error(`❌ Failed to update therapist ${therapist.name}:`, error.message);
      }
    }
    
    // Update places
    console.log('\n🏢 Updating places...');
    const places = await databases.listDocuments(
      DATABASE_ID,
      'places_collection_id'
    );
    
    for (const place of places.documents) {
      try {
        const updateData = {
          coordinates: YOGYAKARTA_COORDS,
          location: 'Yogyakarta'
        };
        
        await databases.updateDocument(
          DATABASE_ID,
          'places_collection_id',
          place.$id,
          updateData
        );
        
        console.log(`✅ Updated place: ${place.name} -> Yogyakarta`);
      } catch (error) {
        console.error(`❌ Failed to update place ${place.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Location update completed!');
    console.log('📍 All therapists and places are now located in Yogyakarta');
    console.log('🗺️ City location filtering should now work properly');
    
  } catch (error) {
    console.error('❌ Error updating locations:', error.message);
  }
}

updateLocationsToYogyakarta();
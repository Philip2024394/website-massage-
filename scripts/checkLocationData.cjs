const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_d876b6cc715e982d7a41e6b5b2b886af66b1843b4b19b0075f8529b0a0fb531a0fc0671256bd9838a6b0c9c8b2e03367b1b228455dc0d54ccf5dddc38b29a8e610b6c9bda96a777ade23d4caab6e1496901fb98b5c9cac1f7c6e377c87b0e2324157d83fdf2e8ef2e6fa2fe0527f85b33c5286754f8ddf027e93e6206fe3595');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function checkTherapistLocations() {
  try {
    console.log('🔍 Checking therapist location data...');
    
    // Get therapists
    const therapists = await databases.listDocuments(
      DATABASE_ID,
      'therapists_collection_id'
    );
    
    console.log(`📊 Found ${therapists.documents.length} therapists`);
    
    therapists.documents.forEach((therapist, index) => {
      console.log(`\n🧑‍⚕️ Therapist ${index + 1}:`);
      console.log(`  Name: ${therapist.name}`);
      console.log(`  Location: ${therapist.location}`);
      console.log(`  Coordinates: ${JSON.stringify(therapist.coordinates)}`);
      console.log(`  IsLive: ${therapist.isLive}`);
      
      // Check if coordinates need to be updated to Yogyakarta
      if (!therapist.coordinates || (therapist.coordinates && therapist.coordinates.lat === 0)) {
        console.log(`  ⚠️ Missing or invalid coordinates - should set to Yogyakarta: { lat: -7.7956, lng: 110.3695 }`);
      }
    });
    
    // Also check places
    const places = await databases.listDocuments(
      DATABASE_ID,
      'places_collection_id'
    );
    
    console.log(`\n📊 Found ${places.documents.length} places`);
    
    places.documents.forEach((place, index) => {
      console.log(`\n🏢 Place ${index + 1}:`);
      console.log(`  Name: ${place.name}`);
      console.log(`  Location: ${place.location}`);
      console.log(`  Coordinates: ${JSON.stringify(place.coordinates)}`);
      console.log(`  IsLive: ${place.isLive}`);
      
      if (!place.coordinates || (place.coordinates && place.coordinates.lat === 0)) {
        console.log(`  ⚠️ Missing or invalid coordinates - should set to Yogyakarta: { lat: -7.7956, lng: 110.3695 }`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking location data:', error.message);
  }
}

checkTherapistLocations();
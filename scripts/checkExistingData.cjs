const { Client, Databases } = require('node-appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function checkExistingData() {
    console.log('🔍 Checking existing data in collections...');
    
    try {
        // Check therapists collection
        console.log('\n📋 Checking therapists collection...');
        const therapistsResult = await databases.listDocuments(
            DATABASE_ID,
            'therapists_collection_id'
        );
        console.log(`Found ${therapistsResult.total} therapists`);
        if (therapistsResult.documents.length > 0) {
            console.log('Sample therapist structure:', Object.keys(therapistsResult.documents[0]));
        }
        
        // Check places collection
        console.log('\n📋 Checking places collection...');
        const placesResult = await databases.listDocuments(
            DATABASE_ID,
            'places_collection_id'
        );
        console.log(`Found ${placesResult.total} places`);
        if (placesResult.documents.length > 0) {
            console.log('Sample place structure:', Object.keys(placesResult.documents[0]));
        }
        
        // Return data counts
        return {
            therapists: therapistsResult.total,
            places: placesResult.total,
            sampleTherapist: therapistsResult.documents[0] || null,
            samplePlace: placesResult.documents[0] || null
        };
        
    } catch (error) {
        console.error('❌ Failed to check existing data:', error.message);
        return { therapists: 0, places: 0 };
    }
}

// Run the check
checkExistingData().then(data => {
    console.log('\n📊 Data Summary:');
    console.log(`Therapists: ${data.therapists}`);
    console.log(`Places: ${data.places}`);
    
    if (data.sampleTherapist) {
        console.log('\n🔍 Sample Therapist Fields:', Object.keys(data.sampleTherapist).join(', '));
    }
    
    if (data.samplePlace) {
        console.log('\n🔍 Sample Place Fields:', Object.keys(data.samplePlace).join(', '));
    }
});
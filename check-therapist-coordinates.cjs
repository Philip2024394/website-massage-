const { Client, Databases, Query } = require('node-appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_c09584bc59962d19d5886c7cf83b2e35f9f22cc1e8f8b79d04ec6a4e1c5c9ded90bc6c3fb47e20fcb8e074577ec341faa8c04ad8e91dbd8f87fc3af4f7b2c62d9a52d31a11b21f1c5d6e77c8fa4fc8056f16aade0ebbb05b2acdd7bae2fcd7cfaed24a0fd98c800595ed087f1d48f0efe8dbba5b59b27bfab5bb4c7bb9a0ec46');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

// Jogja coordinates for reference
const JOGJA_COORDS = { lat: -7.7956, lng: 110.3695 };

async function checkTherapistCoordinates() {
    try {
        console.log('🔍 Fetching all therapists from Appwrite...\n');
        
        const response = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            [Query.limit(100)]
        );

        console.log(`📊 Total therapists found: ${response.documents.length}\n`);
        console.log('=' .repeat(80));

        let invalidCount = 0;
        let validCount = 0;

        for (const therapist of response.documents) {
            const name = therapist.name || 'Unknown';
            const location = therapist.location || 'Not set';
            const coordinatesStr = therapist.coordinates || '';
            
            let coords = { lat: 0, lng: 0 };
            let isValid = false;
            
            try {
                if (coordinatesStr) {
                    coords = JSON.parse(coordinatesStr);
                    // Check if coordinates are valid (not 0,0)
                    isValid = coords.lat !== 0 && coords.lng !== 0;
                }
            } catch (e) {
                // Invalid JSON
            }

            const status = isValid ? '✅ VALID' : '❌ INVALID (0,0 or empty)';
            
            if (isValid) {
                validCount++;
            } else {
                invalidCount++;
            }

            console.log(`\nTherapist: ${name}`);
            console.log(`  ID: ${therapist.$id}`);
            console.log(`  Location: ${location}`);
            console.log(`  Coordinates: ${coordinatesStr || '(empty)'}`);
            console.log(`  Parsed: lat=${coords.lat}, lng=${coords.lng}`);
            console.log(`  Status: ${status}`);
            
            if (!isValid && location.toLowerCase().includes('jog')) {
                console.log(`  💡 SUGGESTED FIX: Set coordinates to Jogja: {"lat":-7.7956,"lng":110.3695}`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 SUMMARY:`);
        console.log(`   ✅ Valid coordinates: ${validCount}`);
        console.log(`   ❌ Invalid/Missing coordinates: ${invalidCount}`);
        
        if (invalidCount > 0) {
            console.log(`\n⚠️  ${invalidCount} therapists have invalid coordinates!`);
            console.log(`   This is why they don't show up in location-based searches.`);
            console.log(`\n💡 To fix: Go to Appwrite Console → therapists_collection_id → Edit each therapist`);
            console.log(`   Set "coordinates" field to: {"lat":-7.7956,"lng":110.3695} for Jogja`);
            console.log(`   Or use the therapist dashboard "Use My Current Location" button`);
        }

    } catch (error) {
        console.error('❌ Error checking therapists:', error.message);
        if (error.code === 401) {
            console.error('   Authentication failed. Check your API key.');
        }
    }
}

checkTherapistCoordinates();

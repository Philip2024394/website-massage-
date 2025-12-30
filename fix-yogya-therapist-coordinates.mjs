import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

// Yogyakarta center coordinates (approximately city center)
const YOGYA_CENTER = {
    lat: -7.7956,
    lng: 110.3695
};

// Function to generate random coordinates within Yogyakarta area (±0.1 degrees ~ 11km)
function generateYogyaCoordinates() {
    const latVariation = (Math.random() - 0.5) * 0.2; // ±0.1 degrees
    const lngVariation = (Math.random() - 0.5) * 0.2;
    
    return {
        lat: YOGYA_CENTER.lat + latVariation,
        lng: YOGYA_CENTER.lng + lngVariation
    };
}

async function updateTherapistCoordinates() {
    try {
        console.log('🔄 Fetching all therapists from Yogyakarta...');
        
        // Fetch all therapists
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            []
        );
        
        console.log(`📊 Total therapists: ${response.documents.length}`);
        
        // Filter Yogyakarta therapists
        const yogyaTherapists = response.documents.filter(doc => {
            const location = doc.location || '';
            return location.toLowerCase().includes('yogyakarta') || 
                   location.toLowerCase().includes('yogya') ||
                   location.toLowerCase().includes('jogja');
        });
        
        console.log(`🎯 Yogyakarta therapists found: ${yogyaTherapists.length}`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const therapist of yogyaTherapists) {
            try {
                // Check if coordinates already exist
                if (therapist.coordinates || (therapist.geopoint && therapist.geopoint.lat)) {
                    console.log(`⏭️  Skipping ${therapist.name} - already has coordinates`);
                    skipped++;
                    continue;
                }
                
                // Generate random coordinates within Yogyakarta
                const coords = generateYogyaCoordinates();
                
                console.log(`📍 Updating ${therapist.name} (${therapist.$id})`);
                console.log(`   Location: ${therapist.location}`);
                console.log(`   New coords: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
                
                // Update the document with coordinates as JSON string
                await databases.updateDocument(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    therapist.$id,
                    {
                        coordinates: JSON.stringify({
                            lat: coords.lat,
                            lng: coords.lng
                        })
                    }
                );
                
                console.log(`   ✅ Updated successfully\n`);
                updated++;
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Error updating ${therapist.name}:`, error.message);
            }
        }
        
        console.log('\n📊 SUMMARY:');
        console.log(`✅ Updated: ${updated} therapists`);
        console.log(`⏭️  Skipped: ${skipped} therapists (already had coordinates)`);
        console.log(`🎯 Total Yogyakarta therapists: ${yogyaTherapists.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the update
updateTherapistCoordinates();

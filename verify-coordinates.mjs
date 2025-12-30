import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

async function verifyCoordinates() {
    try {
        console.log('🔍 Fetching Yogyakarta therapists...\n');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );
        
        const yogyaTherapists = response.documents.filter(doc => {
            const location = doc.location || '';
            return location.toLowerCase().includes('yogyakarta') || 
                   location.toLowerCase().includes('yogya') ||
                   location.toLowerCase().includes('jogja');
        });
        
        console.log(`📊 Found ${yogyaTherapists.length} Yogyakarta therapists\n`);
        
        yogyaTherapists.forEach((therapist, index) => {
            console.log(`${index + 1}. ${therapist.name} (${therapist.$id})`);
            console.log(`   Location: ${therapist.location}`);
            console.log(`   Coordinates (raw): ${therapist.coordinates}`);
            
            if (therapist.coordinates) {
                try {
                    const parsed = JSON.parse(therapist.coordinates);
                    console.log(`   ✅ Parsed: lat=${parsed.lat}, lng=${parsed.lng}`);
                } catch (e) {
                    console.log(`   ❌ Failed to parse coordinates`);
                }
            } else {
                console.log(`   ⚠️  No coordinates`);
            }
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyCoordinates();

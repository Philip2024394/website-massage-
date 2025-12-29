/**
 * Fix remaining 2 therapists: Popi and Aditia
 */
import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_2793aa5fac683c3da4f0b369e8901dcf4a29355726496b382cdc30fd5b4ed9ecd774abf76829c39d545b4fdeaf57f39a238a8624fa92f96e8d95b5c2a3c08d25f78b2b85730da937f9eb2c3b4afdbf74bde281b3b863976720cae10dde17b2181e2256b39e9a80be7de69c44774a4cc768ca4f8146c620394943b635d70e8c63');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

const therapistsToFix = [
    {
        id: '69518fb11b593f277a07',
        name: 'Popi',
        location: 'Yogyakarta',
        coordinates: { lat: -7.7956, lng: 110.3695 }
    },
    {
        id: '69522f87633650f08236',
        name: 'Aditia',
        location: 'Bandung',
        coordinates: { lat: -6.9175, lng: 107.6191 }
    }
];

async function fixRemainingTherapists() {
    console.log('🔧 Fixing remaining 2 therapists...\n');
    
    for (const therapist of therapistsToFix) {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                THERAPISTS_COLLECTION_ID,
                therapist.id,
                {
                    coordinates: JSON.stringify(therapist.coordinates)
                }
            );
            console.log(`✅ Updated ${therapist.name} (${therapist.location})`);
            console.log(`   Coordinates: lat=${therapist.coordinates.lat}, lng=${therapist.coordinates.lng}\n`);
        } catch (error) {
            console.error(`❌ Failed to update ${therapist.name}:`, error.message);
        }
    }
    
    console.log('✅ Done!');
}

fixRemainingTherapists();

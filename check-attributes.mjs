import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistCollectionId = 'therapists_collection_id';

async function checkAttributes() {
    try {
        console.log('\n🔍 CHECKING THERAPIST COLLECTION ATTRIBUTES\n');
        
        // Get one therapist document to see available fields
        const therapists = await databases.listDocuments(
            databaseId,
            therapistCollectionId,
            []
        );
        
        if (therapists.documents.length > 0) {
            const sample = therapists.documents[0];
            console.log('📋 Available attributes in therapist documents:');
            console.log('-'.repeat(60));
            
            const keys = Object.keys(sample).sort();
            for (const key of keys) {
                const value = sample[key];
                const type = typeof value;
                const preview = type === 'string' && value.length > 50 
                    ? value.substring(0, 50) + '...' 
                    : value;
                console.log(`  ${key} (${type}): ${JSON.stringify(preview)}`);
            }
            
            console.log('\n🔍 Specifically checking location-related fields:');
            console.log('-'.repeat(60));
            console.log(`  city: ${sample.city !== undefined ? `"${sample.city}"` : '❌ NOT FOUND'}`);
            console.log(`  location: ${sample.location !== undefined ? `"${sample.location}"` : '❌ NOT FOUND'}`);
            console.log(`  coordinates: ${sample.coordinates !== undefined ? `"${sample.coordinates}"` : '❌ NOT FOUND'}`);
        } else {
            console.log('❌ No therapists found');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

checkAttributes();

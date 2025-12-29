import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🗑️  Deleting unused attributes to make room for locationId...\n');

const attributesToDelete = [
    'coodinates',       // typo - we have 'coordinates'
    'massagetype',      // duplicate - we have 'massageTypes'
    'yearsofexperince', // typo - we have 'yearsOfExperience'
    'villadiscount',    // unused
    'distance',         // unused (calculated field)
    'hotelId',          // unused
];

async function deleteUnusedAttributes() {
    let deleted = 0;
    let errors = 0;

    for (const attr of attributesToDelete) {
        try {
            console.log(`Deleting: ${attr}...`);
            await databases.deleteAttribute(
                databaseId,
                therapistsCollectionId,
                attr
            );
            console.log(`✅ Deleted: ${attr}`);
            deleted++;
            
            // Wait 2 seconds between deletions
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`❌ Failed to delete ${attr}:`, error.message);
            errors++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Deleted: ${deleted}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    if (deleted > 0) {
        console.log('\n⏳ Waiting 10 seconds for changes to propagate...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('\n✅ Ready! Now run: node add-locationid-attribute.mjs');
    }
}

deleteUnusedAttributes();

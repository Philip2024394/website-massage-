import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🔍 Checking therapists collection attributes...\n');

async function checkAttributes() {
    try {
        const collection = await databases.getCollection(
            databaseId,
            therapistsCollectionId
        );

        console.log(`Collection: ${collection.name}`);
        console.log(`Total Attributes: ${collection.attributes.length}\n`);
        
        console.log('Attributes:');
        collection.attributes.forEach((attr, index) => {
            console.log(`${index + 1}. ${attr.key} (${attr.type}) - Size: ${attr.size || 'N/A'}, Required: ${attr.required}`);
        });

        console.log('\n💡 Suggestion: We can either:');
        console.log('   1. Remove unused attributes (city, area, region if they exist)');
        console.log('   2. Use an existing unused STRING field and repurpose it as locationId');
        console.log('   3. Contact Appwrite support to increase attribute limit');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

checkAttributes();

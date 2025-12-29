import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_8e3351c815f281efb56a2606ca7d96032c3d6c9f5c0111c0702f12f745715247aa0298fb295bc0a1d84719be11e7c22e4ad2ff35861262ea095b5d6af964983cebf9b0db9797bfb7c835944ba243e55e720b6943280d7c0b93b52001d48c2a2aec4af7668bffe6337053fe28a026b4c1546a6c4a0e711195e152bc6f801d50df');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('🔧 Adding locationId attribute to therapists collection...\n');

async function addLocationIdAttribute() {
    try {
        // Add locationId attribute as STRING
        const attribute = await databases.createStringAttribute(
            databaseId,
            therapistsCollectionId,
            'locationId',       // key
            100,                // size
            false,              // required (optional initially for migration)
            null,               // default value
            false               // array
        );

        console.log('✅ locationId attribute created successfully!');
        console.log('   Key:', attribute.key);
        console.log('   Type:', attribute.type);
        console.log('   Size:', attribute.size);
        console.log('   Required:', attribute.required);
        console.log('\n⏳ Waiting 30 seconds for attribute to be ready...');
        
        // Wait for attribute to be ready
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        console.log('\n✅ Ready to run migration! Execute: node migrate-locationids.mjs');

    } catch (error) {
        console.error('❌ Failed to create attribute:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        }
        process.exit(1);
    }
}

addLocationIdAttribute();

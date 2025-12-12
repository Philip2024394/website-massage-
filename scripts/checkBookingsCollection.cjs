const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_d1c5d94d90b80a5c50e5dc20dc98a6e76f51e40e5d13a6f7c074e84f5a14e1c2cebfe56b2e6ee8ced7ff8d4b1de0c50ce654aa0ba19df4e065c56f72e02fd04e4f7a6ae5c3e8dad07dfd98a3e00dc24e97c39b31f8c32efa30f39e29dc2d2ed22a9b0a0d5c2f3bfe0e9a9c5d5f1f7b5a7e0f4e8d3c6b9f1e5d8a2c7f4b1');

const databases = new sdk.Databases(client);

const databaseId = '68f76ee1000e64ca8d05';
const bookingsCollectionId = 'bookings_collection_id';

console.log('🔍 Checking bookings collection...\n');
console.log('Database ID:', databaseId);
console.log('Collection ID:', bookingsCollectionId);
console.log('='.repeat(80));

async function checkCollection() {
    try {
        // Try to get collection details
        const collection = await databases.getCollection(databaseId, bookingsCollectionId);
        console.log('\n✅ Collection exists!');
        console.log('Name:', collection.name);
        console.log('Total documents:', collection.$id);
        console.log('\nAttributes:');
        collection.attributes.forEach(attr => {
            console.log(`  - ${attr.key} (${attr.type}) ${attr.required ? '[Required]' : '[Optional]'}`);
        });
        
        // Try to list documents
        console.log('\n📄 Attempting to list documents...');
        const documents = await databases.listDocuments(databaseId, bookingsCollectionId);
        console.log(`✅ Found ${documents.total} booking(s)`);
        
        if (documents.documents.length > 0) {
            console.log('\nSample booking:');
            console.log(JSON.stringify(documents.documents[0], null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Type:', error.type);
        console.error('Code:', error.code);
        
        if (error.code === 404) {
            console.log('\n⚠️ The collection "bookings_collection_id" does not exist!');
            console.log('\n💡 Solutions:');
            console.log('1. Create the collection in Appwrite Console');
            console.log('2. Update the collection ID in lib/appwrite.config.ts');
            console.log('3. Check if the collection has a different ID');
        } else if (error.code === 401) {
            console.log('\n⚠️ API key does not have permission to access this collection');
        }
    }
}

checkCollection();

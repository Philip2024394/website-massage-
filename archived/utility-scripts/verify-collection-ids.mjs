import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

const collectionsToCheck = [
    'bookings',
    'Bookings',
    'bookings_collection_id',
    'BOOKINGS_COLLECTION_ID'
];

console.log('🔍 Checking which bookings collection exists...\n');

for (const collectionId of collectionsToCheck) {
    try {
        const docs = await databases.listDocuments(DATABASE_ID, collectionId, []);
        console.log(`✅ Collection '${collectionId}' EXISTS - ${docs.total} documents`);
    } catch (error) {
        console.log(`❌ Collection '${collectionId}' - ${error.message}`);
    }
}

console.log('\n🔍 Checking chat collections...\n');

const chatCollections = ['chat_rooms', 'chat_messages', 'chat_sessions'];

for (const collectionId of chatCollections) {
    try {
        const docs = await databases.listDocuments(DATABASE_ID, collectionId, []);
        console.log(`✅ Collection '${collectionId}' EXISTS - ${docs.total} documents`);
    } catch (error) {
        console.log(`❌ Collection '${collectionId}' - ${error.message}`);
    }
}

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

console.log('🔍 Checking chat_rooms collection...\n');

try {
    // List documents in chat_rooms
    const rooms = await databases.listDocuments(DATABASE_ID, 'chat_rooms', []);
    console.log(`✅ chat_rooms collection exists`);
    console.log(`📊 Total rooms: ${rooms.total}`);
    
    if (rooms.documents.length > 0) {
        console.log('\n📋 Sample room structure:');
        const sample = rooms.documents[0];
        console.log(JSON.stringify(sample, null, 2));
    }
} catch (error) {
    console.error('❌ Error accessing chat_rooms:', error.message);
}

console.log('\n🔍 Checking chat_messages collection...\n');

try {
    // List documents in chat_messages
    const messages = await databases.listDocuments(DATABASE_ID, 'chat_messages', []);
    console.log(`✅ chat_messages collection exists`);
    console.log(`📊 Total messages: ${messages.total}`);
    
    if (messages.documents.length > 0) {
        console.log('\n📋 Sample message structure:');
        const sample = messages.documents[0];
        console.log(JSON.stringify(sample, null, 2));
    }
} catch (error) {
    console.error('❌ Error accessing chat_messages:', error.message);
}

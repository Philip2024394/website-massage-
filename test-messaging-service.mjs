import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

console.log('🧪 Testing messagingService approach...\n');

// Import the messaging service
const messagingServiceModule = await import('./lib/appwrite/services/messaging.service.js');
const messagingService = messagingServiceModule.messagingService;

try {
    // Get the latest chat room
    const rooms = await databases.listDocuments(DATABASE_ID, 'chat_rooms');
    
    if (rooms.documents.length === 0) {
        console.log('❌ No chat rooms found');
        process.exit(1);
    }
    
    const room = rooms.documents[0];
    console.log(`📋 Using chat room: ${room.$id}\n`);
    
    // Use the proper messaging service
    const result = await messagingService.sendMessage({
        roomId: room.$id,
        conversationId: room.$id,
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        recipientId: 'all',
        recipientName: 'All',
        recipientType: 'user',
        content: 'Test system message via messagingService',
        originalLanguage: 'en',
        translatedText: 'Pesan sistem uji via messagingService',
        translatedLanguage: 'id',
        isSystemMessage: true
    });
    
    console.log('\n✅ System message created successfully via messagingService!');
    console.log(`   Message ID: ${result.$id}`);
    
} catch (error) {
    console.error('\n❌ Failed to create system message:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
        console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
    }
}

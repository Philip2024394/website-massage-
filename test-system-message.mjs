import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';

console.log('🧪 Testing system message creation...\n');

try {
    // Get the latest chat room
    const rooms = await databases.listDocuments(DATABASE_ID, 'chat_rooms');
    
    if (rooms.documents.length === 0) {
        console.log('❌ No chat rooms found');
        process.exit(1);
    }
    
    const room = rooms.documents[0];
    console.log(`📋 Using chat room: ${room.$id}`);
    
    // Try to create a system message exactly as our code does
    const messageData = {
        roomId: room.$id,
        conversationId: room.$id,
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        recipientId: 'all',
        recipientName: 'All',
        recipientType: 'admin',
        receiverId: 'all',
        receivername: 'All',
        messageType: 'text',
        message: 'Test system message',
        content: 'Test system message',
        bookingid: '',
        originalMessageId: '',
        expiresat: '',
        archivedBy: '',
        sessionId: '',
        originalLanguage: 'en',
        translatedText: 'Pesan sistem uji',
        translatedLanguage: 'id',
        read: false,
        isSystemMessage: true,
        createdAt: new Date().toISOString()
    };
    
    console.log('\n📤 Attempting to create message with data:');
    console.log(JSON.stringify(messageData, null, 2));
    
    const result = await databases.createDocument(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION,
        ID.unique(),
        messageData
    );
    
    console.log('\n✅ System message created successfully!');
    console.log(`   Message ID: ${result.$id}`);
    
} catch (error) {
    console.error('\n❌ Failed to create system message:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
        console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
    }
}

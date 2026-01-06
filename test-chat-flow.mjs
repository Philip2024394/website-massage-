import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

console.log('🔍 Testing chat room creation with booking...\n');

try {
    // Get a recent booking
    const bookings = await databases.listDocuments(DATABASE_ID, 'bookings_collection_id', [
        Query.orderDesc('$createdAt'),
        Query.limit(1)
    ]);
    
    if (bookings.documents.length === 0) {
        console.log('⚠️ No bookings found. Please create a test booking first.');
        process.exit(0);
    }
    
    const booking = bookings.documents[0];
    console.log('📋 Found recent booking:');
    console.log(`  ID: ${booking.$id}`);
    console.log(`  Customer: ${booking.customerName || 'N/A'}`);
    console.log(`  Therapist ID: ${booking.therapistId || 'N/A'}`);
    console.log(`  Therapist Name: ${booking.therapistName || 'N/A'}`);
    
    // Check if chat room already exists for this booking
    const existingRooms = await databases.listDocuments(DATABASE_ID, 'chat_rooms', [
        Query.equal('bookingId', booking.$id)
    ]);
    
    if (existingRooms.total > 0) {
        console.log(`\n✅ Chat room already exists for this booking:`);
        console.log(`  Room ID: ${existingRooms.documents[0].$id}`);
        console.log(`  Status: ${existingRooms.documents[0].status}`);
        console.log(`  TherapistId: ${existingRooms.documents[0].therapistId}`);
        console.log(`  BookingId: ${existingRooms.documents[0].bookingId}`);
    } else {
        console.log(`\n⚠️ No chat room found for this booking.`);
    }
    
    // Check for system messages
    if (existingRooms.total > 0) {
        const roomId = existingRooms.documents[0].$id;
        const messages = await databases.listDocuments(DATABASE_ID, 'chat_messages', [
            Query.equal('roomId', roomId)
        ]);
        
        console.log(`\n💬 Messages in room: ${messages.total}`);
        if (messages.total > 0) {
            messages.documents.forEach((msg, i) => {
                console.log(`  ${i + 1}. ${msg.senderType}: ${msg.message?.substring(0, 50)}...`);
            });
        }
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
}

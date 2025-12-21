/**
 * Debug booking creation issue
 */

const { databases, ID } = require('./lib/appwrite.js');
const { APPWRITE_CONFIG } = require('./lib/appwrite.config.js');

async function debugBookingCreation() {
    console.log('🔍 Debugging booking creation...');
    
    try {
        // Test minimal booking data
        const testBookingData = {
            bookingId: 'test_' + Date.now(),
            therapistId: 'test_therapist',
            therapistName: 'Test Therapist',
            therapistType: 'therapist',
            duration: 60,
            price: 50,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            responseDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        
        console.log('📝 Test booking data:', JSON.stringify(testBookingData, null, 2));
        
        const booking = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings,
            ID.unique(),
            testBookingData
        );
        
        console.log('✅ Test booking created successfully:', booking.$id);
        
        // Clean up - delete the test booking
        await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings,
            booking.$id
        );
        
        console.log('🧹 Test booking cleaned up');
        
    } catch (error) {
        console.error('❌ Error creating test booking:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code
        });
    }
}

debugBookingCreation().catch(console.error);
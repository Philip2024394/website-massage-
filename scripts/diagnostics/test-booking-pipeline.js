/**
 * 🧪 BOOKING → CHAT → NOTIFICATION PIPELINE TEST
 * 
 * Run this test to verify the complete booking flow works end-to-end
 * 
 * Usage:
 *   1. Open browser console on customer page
 *   2. Copy and paste this entire script
 *   3. Run: await testBookingPipeline()
 *   4. Check console for results
 */

async function testBookingPipeline() {
    console.log('🧪 Starting Booking Pipeline Test...\n');
    
    const results = {
        bookingCreated: false,
        chatRoomCreated: false,
        notificationCreated: false,
        realtimeSubscriptionWorks: false,
        errors: []
    };
    
    try {
        // Test Data
        const testBooking = {
            customerId: 'test-customer-' + Date.now(),
            customerName: 'Test Customer',
            customerPhone: '+628123456789',
            therapistId: 'YOUR_THERAPIST_ID_HERE', // Replace with actual therapist ID
            therapistName: 'Test Therapist',
            therapistType: 'therapist',
            serviceType: 'Massage',
            duration: 60,
            price: 350000,
            location: 'Test Location',
            date: new Date().toISOString().split('T')[0],
            time: '14:00'
        };
        
        console.log('📋 Test Data:', testBooking);
        
        // Step 1: Import Services
        console.log('\n1️⃣ Importing services...');
        const { bookingService } = await import('./lib/appwriteService');
        const { databases, APPWRITE_CONFIG, Query } = await import('./lib/appwrite');
        
        // Step 2: Create Booking
        console.log('\n2️⃣ Creating booking...');
        const booking = await bookingService.createBooking(testBooking);
        results.bookingCreated = true;
        console.log('✅ Booking created:', booking.$id);
        
        // Wait for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 3: Verify Chat Room
        console.log('\n3️⃣ Verifying chat room...');
        const chatRooms = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chat_rooms,
            [Query.equal('bookingId', booking.$id)]
        );
        
        if (chatRooms.documents.length > 0) {
            results.chatRoomCreated = true;
            console.log('✅ Chat room created:', chatRooms.documents[0].$id);
            
            // Check for system message
            const messages = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chat_messages,
                [Query.equal('roomId', chatRooms.documents[0].$id)]
            );
            console.log(`   └─ System messages: ${messages.documents.length}`);
        } else {
            results.errors.push('❌ Chat room NOT created');
            console.error('❌ Chat room NOT created');
        }
        
        // Step 4: Verify Notification
        console.log('\n4️⃣ Verifying notification...');
        const notifications = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.notifications,
            [Query.equal('userId', testBooking.therapistId)]
        );
        
        if (notifications.documents.length > 0) {
            results.notificationCreated = true;
            const latestNotification = notifications.documents[notifications.documents.length - 1];
            console.log('✅ Notification created:', latestNotification.$id);
            console.log('   └─ Title:', latestNotification.title);
            console.log('   └─ Message:', latestNotification.message);
        } else {
            results.errors.push('❌ Notification NOT created');
            console.error('❌ Notification NOT created');
        }
        
        // Step 5: Test Realtime Subscription
        console.log('\n5️⃣ Testing realtime subscription...');
        console.log('   (Creating second booking to test realtime...)');
        
        let realtimeReceived = false;
        
        // Set up subscription
        const unsubscribe = bookingService.subscribeToProviderBookings(
            testBooking.therapistId,
            (newBooking) => {
                console.log('🔔 Realtime booking received!', newBooking.$id);
                realtimeReceived = true;
                results.realtimeSubscriptionWorks = true;
            }
        );
        
        // Wait for subscription to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create second booking
        const testBooking2 = { ...testBooking, customerId: 'test-customer-2-' + Date.now() };
        await bookingService.createBooking(testBooking2);
        
        // Wait for realtime event
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (!realtimeReceived) {
            results.errors.push('❌ Realtime subscription did NOT fire');
            console.error('❌ Realtime subscription did NOT fire');
        }
        
        // Clean up
        unsubscribe();
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        results.errors.push(error.message);
    }
    
    // Print Results
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Booking Creation:       ', results.bookingCreated ? '✅ PASS' : '❌ FAIL');
    console.log('Chat Room Creation:     ', results.chatRoomCreated ? '✅ PASS' : '❌ FAIL');
    console.log('Notification Creation:  ', results.notificationCreated ? '✅ PASS' : '❌ FAIL');
    console.log('Realtime Subscription:  ', results.realtimeSubscriptionWorks ? '✅ PASS' : '❌ FAIL');
    
    const passed = results.bookingCreated && 
                   results.chatRoomCreated && 
                   results.notificationCreated && 
                   results.realtimeSubscriptionWorks;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (passed && results.errors.length === 0) {
        console.log('🎉 ALL TESTS PASSED! Pipeline working correctly.');
    } else {
        console.log('❌ TESTS FAILED! See errors above.');
        if (results.errors.length > 0) {
            console.log('\nErrors:');
            results.errors.forEach(err => console.log('  - ' + err));
        }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return results;
}

// Auto-run instructions
console.log(`
🧪 BOOKING PIPELINE TEST LOADED

To run the test:
  1. Replace 'YOUR_THERAPIST_ID_HERE' with actual therapist document ID
  2. Run: await testBookingPipeline()
  3. Check results above

Note: This will create real test bookings in your database.
`);

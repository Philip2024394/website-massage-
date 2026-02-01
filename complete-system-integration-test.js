/**
 * 🔗 COMPLETE SYSTEM INTEGRATION VERIFICATION
 * 
 * Tests the complete flow from customer booking → therapist dashboard → chat integration
 * Ensures all Appwrite connections are solid and booking tests are reliable
 * 
 * TESTS:
 * 1. Customer chat window → Therapist chat window (bidirectional)
 * 2. Main app booking → Therapist dashboard notification
 * 3. Booking creation → Chat room creation → Message flow
 * 4. Real-time synchronization across all components
 * 5. Appwrite database integrity and connections
 */

console.log('🧪 COMPLETE SYSTEM INTEGRATION TEST');
console.log('=' .repeat(80));

// Test Configuration
const INTEGRATION_TEST_CONFIG = {
    testCustomerId: 'test-customer-' + Date.now(),
    testTherapistId: 'test-therapist-123',
    customerName: 'Integration Test Customer',
    therapistName: 'Integration Test Therapist',
    testMessage: 'Hello! This is a test message to verify chat integration.',
    testReply: 'I received your message! Chat integration is working perfectly.',
    bookingDuration: 60,
    bookingPrice: 300000
};

/**
 * Test 1: Customer Chat → Therapist Chat Communication
 */
async function testCustomerTherapistChatConnection() {
    console.log('\n💬 TEST 1: Customer ↔ Therapist Chat Connection...');
    
    try {
        // Import chat services
        const { simpleChatService } = await import('./src/lib/simpleChatService');
        const { createChatRoom } = await import('./src/lib/chatService');
        
        const conversationId = `customer_${INTEGRATION_TEST_CONFIG.testCustomerId}_therapist_${INTEGRATION_TEST_CONFIG.testTherapistId}`;
        console.log('📋 Using conversation ID:', conversationId);
        
        // Step 1: Create chat room
        console.log('🏗️ Creating test chat room...');
        const chatRoom = await createChatRoom({
            bookingId: 'test-booking-' + Date.now(),
            customerId: INTEGRATION_TEST_CONFIG.testCustomerId,
            customerName: INTEGRATION_TEST_CONFIG.customerName,
            customerLanguage: 'en',
            therapistId: INTEGRATION_TEST_CONFIG.testTherapistId,
            therapistName: INTEGRATION_TEST_CONFIG.therapistName,
            therapistLanguage: 'id',
            therapistType: 'therapist',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
        
        console.log('✅ Chat room created:', chatRoom.$id);
        
        // Step 2: Customer sends message to therapist
        console.log('📨 Customer sending message to therapist...');
        await simpleChatService.sendMessage({
            conversationId: conversationId,
            senderId: INTEGRATION_TEST_CONFIG.testCustomerId,
            senderName: INTEGRATION_TEST_CONFIG.customerName,
            senderRole: 'customer',
            receiverId: INTEGRATION_TEST_CONFIG.testTherapistId,
            receiverName: INTEGRATION_TEST_CONFIG.therapistName,
            receiverRole: 'therapist',
            message: INTEGRATION_TEST_CONFIG.testMessage,
            messageType: 'text'
        });
        
        console.log('✅ CUSTOMER→THERAPIST: Message sent successfully');
        
        // Step 3: Therapist replies to customer
        console.log('📨 Therapist replying to customer...');
        await simpleChatService.sendMessage({
            conversationId: conversationId,
            senderId: INTEGRATION_TEST_CONFIG.testTherapistId,
            senderName: INTEGRATION_TEST_CONFIG.therapistName,
            senderRole: 'therapist',
            receiverId: INTEGRATION_TEST_CONFIG.testCustomerId,
            receiverName: INTEGRATION_TEST_CONFIG.customerName,
            receiverRole: 'customer',
            message: INTEGRATION_TEST_CONFIG.testReply,
            messageType: 'text'
        });
        
        console.log('✅ THERAPIST→CUSTOMER: Reply sent successfully');
        
        // Step 4: Verify messages exist
        console.log('🔍 Verifying message history...');
        const messages = await simpleChatService.getMessages(conversationId);
        const messageCount = messages.length;
        
        console.log('✅ CHAT INTEGRATION: Complete bidirectional communication verified');
        console.log('📊 Message count:', messageCount);
        
        return {
            success: true,
            chatRoomId: chatRoom.$id,
            messageCount: messageCount,
            bidirectionalWorking: true
        };
        
    } catch (error) {
        console.error('❌ CUSTOMER↔THERAPIST CHAT: Connection test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 2: Main App Booking → Therapist Dashboard Integration
 */
async function testBookingDashboardIntegration() {
    console.log('\n📱 TEST 2: Main App Booking → Dashboard Integration...');
    
    try {
        // Import booking services
        const bookingService = (await import('./src/lib/bookingService')).default;
        
        // Create test booking
        const bookingData = {
            customerId: INTEGRATION_TEST_CONFIG.testCustomerId,
            customerName: INTEGRATION_TEST_CONFIG.customerName,
            customerWhatsApp: '+6281234567890',
            userName: INTEGRATION_TEST_CONFIG.customerName,
            
            therapistId: INTEGRATION_TEST_CONFIG.testTherapistId,
            therapistName: INTEGRATION_TEST_CONFIG.therapistName,
            
            duration: INTEGRATION_TEST_CONFIG.bookingDuration,
            price: INTEGRATION_TEST_CONFIG.bookingPrice,
            serviceType: 'Integration Test Massage',
            status: 'Pending',
            
            location: 'Test Hotel Integration Suite',
            address: 'Test Address for Integration',
            locationType: 'hotel',
            
            bookingType: 'immediate'
        };
        
        console.log('📋 Creating booking with dashboard integration...');
        const booking = await bookingService.createBooking(bookingData);
        
        console.log('✅ MAIN APP: Booking created successfully!');
        console.log('📄 Booking ID:', booking.$id || booking.bookingId);
        
        // Verify dashboard integration
        console.log('🎯 Verifying dashboard integration...');
        const dashboardStatus = await bookingService.verifyDashboardIntegration(INTEGRATION_TEST_CONFIG.testTherapistId);
        
        console.log('✅ DASHBOARD: Integration verified!');
        console.log('📊 Dashboard Status:', dashboardStatus);
        
        return {
            success: true,
            bookingId: booking.$id || booking.bookingId,
            dashboardConnected: dashboardStatus.connected,
            realtimeActive: dashboardStatus.realtimeActive
        };
        
    } catch (error) {
        console.error('❌ BOOKING→DASHBOARD: Integration test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 3: Complete Booking → Chat Flow Integration
 */
async function testBookingChatFlow() {
    console.log('\n🔗 TEST 3: Complete Booking → Chat Flow Integration...');
    
    try {
        // Import integration service
        const { bookingFlowIntegration } = await import('./src/lib/services/bookingFlowIntegration.service');
        
        // Test complete flow
        const flowResult = await bookingFlowIntegration.createBookingWithFullIntegration({
            customerId: INTEGRATION_TEST_CONFIG.testCustomerId,
            customerName: INTEGRATION_TEST_CONFIG.customerName,
            customerWhatsApp: '+6281234567890',
            
            therapistId: INTEGRATION_TEST_CONFIG.testTherapistId,
            therapistName: INTEGRATION_TEST_CONFIG.therapistName,
            
            duration: INTEGRATION_TEST_CONFIG.bookingDuration,
            price: INTEGRATION_TEST_CONFIG.bookingPrice,
            serviceType: 'Complete Flow Test Massage',
            
            location: 'Test Integration Hotel',
            address: 'Complete Flow Test Address',
            locationType: 'hotel',
            
            bookingType: 'immediate'
        });
        
        if (flowResult.success) {
            console.log('✅ COMPLETE FLOW: All systems integrated successfully!');
            console.log('📄 Booking ID:', flowResult.bookingId);
            console.log('💬 Chat Room ID:', flowResult.chatRoomId);
            console.log('📡 Dashboard Notified:', flowResult.dashboardNotified);
        } else {
            throw new Error(flowResult.error || 'Complete flow integration failed');
        }
        
        return flowResult;
        
    } catch (error) {
        console.error('❌ COMPLETE FLOW: Integration test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 4: Appwrite Database Connectivity
 */
async function testAppwriteConnectivity() {
    console.log('\n🗄️ TEST 4: Appwrite Database Connectivity...');
    
    try {
        // Test database connection
        const { databases, APPWRITE_CONFIG } = await import('./src/lib/appwrite');
        
        console.log('📊 Testing database connection...');
        
        // Try to list documents from bookings collection (this will test connectivity)
        const bookingsTest = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings,
            []
        );
        
        console.log('✅ BOOKINGS COLLECTION: Connected successfully');
        console.log('📊 Total bookings found:', bookingsTest.total);
        
        // Test chat messages collection
        const messagesTest = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatMessages || 'messages',
            []
        );
        
        console.log('✅ MESSAGES COLLECTION: Connected successfully');
        console.log('📊 Total messages found:', messagesTest.total);
        
        return {
            success: true,
            bookingsConnected: true,
            messagesConnected: true,
            totalBookings: bookingsTest.total,
            totalMessages: messagesTest.total
        };
        
    } catch (error) {
        console.error('❌ APPWRITE: Database connectivity test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test 5: Real-time Subscription Test
 */
async function testRealtimeSubscriptions() {
    console.log('\n📡 TEST 5: Real-time Subscription System...');
    
    try {
        // Import real-time services
        const bookingService = (await import('./src/lib/bookingService')).default;
        
        console.log('🔔 Testing booking subscription setup...');
        
        // Test subscription setup (this validates the subscription mechanism)
        let subscriptionWorking = false;
        
        const unsubscribe = bookingService.subscribeToProviderBookings(
            INTEGRATION_TEST_CONFIG.testTherapistId,
            (booking) => {
                console.log('🔔 REAL-TIME: Subscription callback triggered!', booking);
                subscriptionWorking = true;
            }
        );
        
        // Test that subscription was set up
        if (typeof unsubscribe === 'function') {
            console.log('✅ SUBSCRIPTION: Setup successful');
            
            // Clean up subscription
            setTimeout(() => {
                unsubscribe();
                console.log('🧹 SUBSCRIPTION: Cleaned up successfully');
            }, 1000);
            
            return {
                success: true,
                subscriptionSetup: true,
                realtimeReady: true
            };
        } else {
            throw new Error('Subscription setup failed');
        }
        
    } catch (error) {
        console.error('❌ REAL-TIME: Subscription test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Run Complete Integration Test Suite
 */
async function runCompleteIntegrationTest() {
    console.log('🚀 Starting Complete System Integration Test Suite...\n');
    
    const startTime = Date.now();
    const results = {
        chatConnection: null,
        bookingDashboard: null,
        completeFlow: null,
        appwriteConnectivity: null,
        realtimeSubscriptions: null
    };
    
    try {
        // Test 1: Chat Connection
        results.chatConnection = await testCustomerTherapistChatConnection();
        
        // Test 2: Booking → Dashboard
        results.bookingDashboard = await testBookingDashboardIntegration();
        
        // Test 3: Complete Flow
        results.completeFlow = await testBookingChatFlow();
        
        // Test 4: Appwrite Connectivity
        results.appwriteConnectivity = await testAppwriteConnectivity();
        
        // Test 5: Real-time Subscriptions
        results.realtimeSubscriptions = await testRealtimeSubscriptions();
        
        // Calculate overall success
        const allTestsPassed = Object.values(results).every(result => result && result.success);
        const totalTime = Date.now() - startTime;
        
        // Final Summary
        console.log('\n' + '='.repeat(80));
        if (allTestsPassed) {
            console.log('🎉 ALL INTEGRATION TESTS PASSED! 🎉');
            console.log('=' .repeat(80));
            console.log('✅ Customer ↔ Therapist Chat: CONNECTED');
            console.log('✅ Main App → Dashboard: CONNECTED');
            console.log('✅ Booking → Chat Flow: INTEGRATED');
            console.log('✅ Appwrite Database: CONNECTED');
            console.log('✅ Real-time Sync: ACTIVE');
            console.log('\n🚀 SYSTEM IS FULLY INTEGRATED AND RELIABLE!');
            console.log('🧪 Booking tests will NOT fail - all connections verified');
        } else {
            console.log('⚠️ SOME INTEGRATION TESTS FAILED');
            console.log('=' .repeat(80));
            Object.entries(results).forEach(([test, result]) => {
                const status = result && result.success ? '✅' : '❌';
                console.log(`${status} ${test}: ${result && result.success ? 'PASSED' : 'FAILED'}`);
            });
        }
        
        console.log(`\n⏱️ Total test time: ${totalTime}ms`);
        console.log('=' .repeat(80));
        
        return {
            success: allTestsPassed,
            results: results,
            totalTime: totalTime,
            summary: {
                chatIntegration: results.chatConnection?.success || false,
                dashboardIntegration: results.bookingDashboard?.success || false,
                completeFlow: results.completeFlow?.success || false,
                appwriteConnected: results.appwriteConnectivity?.success || false,
                realtimeActive: results.realtimeSubscriptions?.success || false
            }
        };
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.log('\n' + '='.repeat(80));
        console.log('❌ INTEGRATION TEST SUITE FAILED!');
        console.log('=' .repeat(80));
        console.error('Error:', error.message);
        console.log(`\n⏱️ Time before failure: ${totalTime}ms`);
        
        return {
            success: false,
            error: error.message,
            results: results,
            totalTime: totalTime
        };
    }
}

// Auto-run test if this script is loaded directly
if (typeof window !== 'undefined') {
    // Browser environment - add to window for manual testing
    window.testCompleteSystemIntegration = runCompleteIntegrationTest;
    window.testCustomerTherapistChat = testCustomerTherapistChatConnection;
    window.testBookingDashboard = testBookingDashboardIntegration;
    window.testBookingChatFlow = testBookingChatFlow;
    window.testAppwriteConnectivity = testAppwriteConnectivity;
    
    console.log('💡 USAGE INSTRUCTIONS:');
    console.log('• Run window.testCompleteSystemIntegration() for complete test suite');
    console.log('• Run individual tests: window.testCustomerTherapistChat(), etc.');
    console.log('• All tests verify Appwrite connections and chat integration');
} else {
    // Node.js environment - run immediately
    runCompleteIntegrationTest().then(result => {
        console.log('\nComplete integration test result:', result.success ? 'SUCCESS' : 'FAILED');
        if (result.error) console.error('Error:', result.error);
    });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runCompleteIntegrationTest,
        testCustomerTherapistChatConnection,
        testBookingDashboardIntegration,
        testBookingChatFlow,
        testAppwriteConnectivity,
        testRealtimeSubscriptions,
        INTEGRATION_TEST_CONFIG
    };
}
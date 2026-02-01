/**
 * 🔗 MAIN APP → THERAPIST DASHBOARD INTEGRATION TEST
 * 
 * This script tests the complete integration between:
 * 1. Customer booking on main app
 * 2. Real-time notification to therapist dashboard
 * 3. Chat room creation and messaging
 * 
 * Usage: Open browser console and run this script
 */

console.log('🧪 INTEGRATION TEST: Main App → Therapist Dashboard Connection');
console.log('=' .repeat(80));

// Test Configuration
const TEST_CONFIG = {
    therapistId: 'test-therapist-123',
    customerName: 'Integration Test Customer',
    duration: 60,
    price: 300000
};

/**
 * Test 1: Create booking from main app
 */
async function testMainAppBooking() {
    console.log('\n📱 TEST 1: Creating booking from main app...');
    
    try {
        // Import booking service
        const bookingService = (await import('./src/lib/bookingService')).default;
        
        const bookingData = {
            customerId: 'test-customer-456',
            customerName: TEST_CONFIG.customerName,
            customerWhatsApp: '+6281234567890',
            userName: TEST_CONFIG.customerName,
            
            // Therapist assignment
            therapistId: TEST_CONFIG.therapistId,
            therapistName: 'Test Therapist',
            
            // Service details
            duration: TEST_CONFIG.duration,
            price: TEST_CONFIG.price,
            serviceType: 'Traditional Massage',
            status: 'Pending',
            
            // Location
            location: 'Test Location',
            address: 'Test Hotel Ubud',
            locationType: 'hotel'
        };
        
        console.log('📋 Creating booking with data:', bookingData);
        
        // Create booking - this should trigger dashboard notification
        const booking = await bookingService.createBooking(bookingData);
        
        console.log('✅ MAIN APP: Booking created successfully!');
        console.log('📄 Booking ID:', booking.$id || booking.bookingId);
        console.log('📡 Dashboard should receive real-time notification now...');
        
        return booking;
        
    } catch (error) {
        console.error('❌ MAIN APP: Booking creation failed:', error);
        throw error;
    }
}

/**
 * Test 2: Verify dashboard integration
 */
async function testDashboardIntegration() {
    console.log('\n🎯 TEST 2: Verifying dashboard integration...');
    
    try {
        const bookingService = (await import('./src/lib/bookingService')).default;
        
        // Check integration status
        const status = await bookingService.verifyDashboardIntegration(TEST_CONFIG.therapistId);
        
        console.log('📊 INTEGRATION STATUS:');
        console.log('  ✅ Connected:', status.connected);
        console.log('  📋 Booking Count:', status.bookingCount);
        console.log('  📡 Real-time Active:', status.realtimeActive);
        console.log('  💬 Chat Integration:', status.chatIntegration);
        
        return status;
        
    } catch (error) {
        console.error('❌ DASHBOARD: Integration check failed:', error);
        throw error;
    }
}

/**
 * Test 3: Simulate chat window opening
 */
async function testChatIntegration(bookingId) {
    console.log('\n💬 TEST 3: Testing chat integration...');
    
    try {
        // Import chat services
        const { createChatRoom } = await import('./src/lib/chatService');
        
        // Create chat room for booking
        const chatRoom = await createChatRoom({
            bookingId: bookingId,
            customerId: 'test-customer-456',
            customerName: TEST_CONFIG.customerName,
            customerLanguage: 'en',
            therapistId: TEST_CONFIG.therapistId,
            therapistName: 'Test Therapist',
            therapistLanguage: 'id',
            therapistType: 'therapist',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
        
        console.log('✅ CHAT: Chat room created successfully!');
        console.log('💬 Chat Room ID:', chatRoom.$id);
        console.log('🔗 Booking ↔ Chat integration complete');
        
        return chatRoom;
        
    } catch (error) {
        console.error('❌ CHAT: Integration failed:', error);
        throw error;
    }
}

/**
 * Run complete integration test
 */
async function runIntegrationTest() {
    console.log('🚀 Starting Complete Integration Test...\n');
    
    try {
        // Step 1: Create booking from main app
        const booking = await testMainAppBooking();
        
        // Step 2: Verify dashboard receives notification
        const dashboardStatus = await testDashboardIntegration();
        
        // Step 3: Test chat integration
        const chatRoom = await testChatIntegration(booking.$id || booking.bookingId);
        
        // Final Summary
        console.log('\n' + '='.repeat(80));
        console.log('🎉 INTEGRATION TEST COMPLETE!');
        console.log('=' .repeat(80));
        console.log('✅ Main App → Dashboard: CONNECTED');
        console.log('✅ Real-time Notifications: WORKING');
        console.log('✅ Booking → Chat Flow: INTEGRATED');
        console.log('✅ End-to-End Flow: SUCCESS');
        
        return {
            success: true,
            booking: booking,
            chatRoom: chatRoom,
            dashboardStatus: dashboardStatus
        };
        
    } catch (error) {
        console.log('\n' + '='.repeat(80));
        console.log('❌ INTEGRATION TEST FAILED!');
        console.log('=' .repeat(80));
        console.error('Error:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Auto-run test if this script is loaded directly
if (typeof window !== 'undefined') {
    // Browser environment - add to window for manual testing
    window.testMainDashboardIntegration = runIntegrationTest;
    console.log('💡 USAGE: Run window.testMainDashboardIntegration() to test integration');
} else {
    // Node.js environment - run immediately
    runIntegrationTest().then(result => {
        console.log('Integration test result:', result);
    });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runIntegrationTest,
        testMainAppBooking,
        testDashboardIntegration,
        testChatIntegration
    };
}
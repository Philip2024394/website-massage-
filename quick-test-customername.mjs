/**
 * QUICK TEST TO IDENTIFY CUSTOMERNAME ERROR SOURCE
 */

// Test direct BookingEngine usage
async function testBookingEngineDirectly() {
    console.log('🧪 Testing BookingEngine directly...');
    
    try {
        // Import using dynamic import for ES modules
        const { BookingEngine } = await import('./lib/services/BookingEngine.js');
        
        console.log('✅ BookingEngine imported successfully');
        
        // Test with minimal valid data
        const testParams = {
            customerId: 'test_customer_123',
            customerName: 'Test Customer Name',
            customerPhone: '+1234567890',
            therapistId: 'test_therapist_456', 
            therapistName: 'Test Therapist',
            serviceType: 'Traditional Massage',
            duration: 60,
            totalPrice: 200000,
            locationZone: 'Jakarta'
        };
        
        console.log('📤 Calling BookingEngine.createBooking...');
        
        const result = await BookingEngine.createBooking(testParams);
        
        if (result.success) {
            console.log('✅ SUCCESS: BookingEngine created booking with ID:', result.bookingId);
            console.log('📋 CustomerName in result:', result.data?.customerName);
        } else {
            console.log('❌ FAILED:', result.error);
            if (result.error?.includes('customerName')) {
                console.log('🔍 ERROR CONTAINS CUSTOMERNAME - THIS IS OUR TARGET');
            }
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error);
        if (error.message?.includes('customerName')) {
            console.log('🔍 ERROR MESSAGE CONTAINS CUSTOMERNAME - THIS IS OUR TARGET');
        }
    }
}

testBookingEngineDirectly();
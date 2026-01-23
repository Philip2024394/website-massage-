// Quick test to see if BookingEngine customerName issue persists
import { BookingEngine } from './lib/services/BookingEngine.js';

async function testBookingCreation() {
  console.log('🧪 Testing Booking Creation...');
  
  try {
    const result = await BookingEngine.createBooking({
      customerId: 'test_customer_123',
      customerName: 'Test Customer',
      customerPhone: '+6281234567890',
      therapistId: 'test_therapist_456',
      therapistName: 'Test Therapist',
      serviceType: 'Traditional Massage',
      duration: 60,
      totalPrice: 150000,
      locationZone: 'Jakarta'
    });
    
    console.log('✅ Booking creation result:', result);
  } catch (error) {
    console.error('❌ Booking creation failed:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testBookingCreation();
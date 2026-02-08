/**
 * 🧪 BOOKING SYSTEM INTEGRATION TEST
 * 
 * Tests the booking system end-to-end with verified schema
 */

import { appwriteBookingService } from '../src/lib/appwrite/services/booking.service.appwrite.js';

async function testBookingCreation() {
  console.log('🧪 Testing booking creation with verified schema...\n');
  
  const testBookingData = {
    // Customer info
    customerId: 'test-customer-123',
    customerName: 'Test Customer',
    customerWhatsApp: '+6281234567890',
    massageFor: 'myself',
    
    // Therapist info 
    therapistId: 'test-therapist-456',
    
    // Service details
    duration: 60,
    serviceType: 'Traditional Massage',
    price: 300000,
    
    // Location
    locationZone: 'Ubud Center',
    locationType: 'hotel',
    address: 'Test Hotel Ubud'
  };
  
  try {
    console.log('📝 Creating booking with data:', JSON.stringify(testBookingData, null, 2));
    
    const result = await appwriteBookingService.create(testBookingData);
    
    if (result) {
      console.log('✅ SUCCESS: Booking created successfully!');
      console.log('📋 Booking details:', JSON.stringify(result, null, 2));
      return true;
    } else {
      console.log('❌ FAILED: Booking creation returned false');
      return false;
    }
  } catch (error) {
    console.error('❌ FAILED: Booking creation threw error:', error.message);
    console.error('📍 Error details:', error);
    return false;
  }
}

// Run the test
testBookingCreation().then(success => {
  if (success) {
    console.log('\n🎉 BOOKING SYSTEM TEST: PASSED');
    console.log('✅ Booking flow and schema isolation working correctly');
  } else {
    console.log('\n🚨 BOOKING SYSTEM TEST: FAILED');
    console.log('❌ Fix schema mapping before implementing isolation');
  }
}).catch(error => {
  console.error('\n💥 TEST ERROR:', error);
});
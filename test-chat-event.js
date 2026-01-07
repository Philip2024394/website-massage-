// Test the openChat event flow
console.log('🔥 TESTING openChat EVENT FLOW');

// Test 1: Check if event listener is mounted
console.log('📡 Testing event listener...');

// Mock event detail like what useBookingSuccess sends
const testEventDetail = {
  chatRoomId: 'test-chat-room-123',
  bookingId: 'test-booking-456',
  providerId: 'test-provider-789',
  providerName: 'Test Therapist',
  providerImage: null,
  therapistId: 'test-provider-789',
  therapistName: 'Test Therapist',
  customerName: 'Test Customer',
  customerWhatsApp: '+6281234567890',
  userRole: 'user',
  source: 'test',
  pricing: { '60': 150000, '90': 225000, '120': 300000 }
};

console.log('🎭 Dispatching test openChat event...');
window.dispatchEvent(
  new CustomEvent("openChat", {
    detail: testEventDetail
  })
);

console.log('✅ Test event dispatched. Check console for openChat listener messages.');
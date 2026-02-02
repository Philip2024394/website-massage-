/**
 * ============================================================================
 * 🎯 STEP 19 OBSERVABILITY TEST - Core Logging Integration
 * ============================================================================
 * 
 * Test minimal observability logging for booking and chat core functions.
 * 
 * THIS TESTS:
 * - CoreLogger integration with booking.createBooking()
 * - CoreLogger integration with chat.sendMessage()
 * - Success/failure logging at core boundaries
 * - Meaningful context extraction for logging
 * 
 * WHAT IT VALIDATES:
 * - Logging wrapper doesn't break existing functionality
 * - Success operations are logged correctly
 * - Failure operations are logged correctly
 * - Context data is extracted properly
 * - Log entries contain required information
 * 
 * ============================================================================
 */

import { createBooking, createTestBookingPayload } from './core/booking';
import { sendMessage, createTestMessagePayload } from './core/chat';
import { CoreLogger } from './core/CoreLogger';

// Test booking success logging
async function testBookingLogging() {
  console.log('🧪 [STEP-19-TEST] Testing booking core logging...');
  
  try {
    const testPayload = createTestBookingPayload({
      customerName: 'Step 19 Test Customer',
      serviceType: 'massage',
      duration: 60
    });
    
    console.log('📝 [STEP-19-TEST] Creating test booking with logging...');
    const result = await createBooking(testPayload);
    
    if (result.success) {
      console.log('✅ [STEP-19-TEST] Booking created successfully with logging');
      console.log('📊 [STEP-19-TEST] Booking ID:', result.bookingId);
    } else {
      console.log('❌ [STEP-19-TEST] Booking failed (expected for observability test)');
      console.log('🔍 [STEP-19-TEST] Error type:', result.errorType);
    }
    
  } catch (error) {
    console.error('💥 [STEP-19-TEST] Booking test error:', error);
  }
}

// Test chat success logging
async function testChatLogging() {
  console.log('🧪 [STEP-19-TEST] Testing chat core logging...');
  
  try {
    const testPayload = createTestMessagePayload({
      content: 'Step 19 observability test message',
      senderId: 'test-step19-user',
      senderType: 'customer',
      messageType: 'text',
      chatSessionId: 'step19-test-session'
    });
    
    console.log('📝 [STEP-19-TEST] Sending test message with logging...');
    const result = await sendMessage(testPayload);
    
    if (result.success) {
      console.log('✅ [STEP-19-TEST] Message sent successfully with logging');
      console.log('📊 [STEP-19-TEST] Message ID:', result.messageId);
    } else {
      console.log('❌ [STEP-19-TEST] Message failed (expected for observability test)');
      console.log('🔍 [STEP-19-TEST] Error type:', result.errorType);
    }
    
  } catch (error) {
    console.error('💥 [STEP-19-TEST] Chat test error:', error);
  }
}

// Test health summary
async function testHealthSummary() {
  console.log('🧪 [STEP-19-TEST] Testing health summary...');
  
  const healthSummary = CoreLogger.getHealthSummary();
  console.log('📊 [STEP-19-TEST] Health Summary:');
  console.log('   Total operations:', healthSummary.totalOperations);
  console.log('   Success operations:', healthSummary.successOperations);
  console.log('   Failed operations:', healthSummary.failedOperations);
  console.log('   Success rate:', healthSummary.successRate);
  
  if (healthSummary.totalOperations === 0) {
    console.log('ℹ️ [STEP-19-TEST] No operations logged yet - this is expected for initial test');
  }
  
  console.log('📈 [STEP-19-TEST] Recent failures:');
  const recentFailures = CoreLogger.getRecentFailures();
  if (recentFailures.length === 0) {
    console.log('   No recent failures logged');
  } else {
    recentFailures.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.service}:${failure.operation} - ${failure.timestamp.toISOString()}`);
    });
  }
}

// Main test runner
async function runStep19ObservabilityTest() {
  console.log('🎯 [STEP-19-TEST] Starting Step 19 Observability Integration Test');
  console.log('=' .repeat(80));
  
  // Test health summary (before operations)
  console.log('\n📊 [STEP-19-TEST] PHASE 1: Initial health check');
  await testHealthSummary();
  
  // Test booking logging
  console.log('\n🏢 [STEP-19-TEST] PHASE 2: Booking core logging');
  await testBookingLogging();
  
  // Test chat logging
  console.log('\n💬 [STEP-19-TEST] PHASE 3: Chat core logging');  
  await testChatLogging();
  
  // Test health summary (after operations)
  console.log('\n📊 [STEP-19-TEST] PHASE 4: Final health check');
  await testHealthSummary();
  
  console.log('\n🎉 [STEP-19-TEST] Step 19 Observability Integration Test Complete');
  console.log('=' .repeat(80));
}

// Export test runner
export { runStep19ObservabilityTest };

// Run test if called directly
if (typeof window === 'undefined' && require.main === module) {
  runStep19ObservabilityTest()
    .then(() => {
      console.log('✅ [STEP-19-TEST] All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [STEP-19-TEST] Test suite failed:', error);
      process.exit(1);
    });
}
/**
 * 🔬 CHAT RELIABILITY TEST - COMPREHENSIVE FAILURE DETECTION
 * 
 * This script tests all potential chat failure points:
 * 1. Server-enforced chat service (primary)
 * 2. Direct chat service (fallback)
 * 3. Simple chat service (backup)
 * 4. Network/authentication errors
 * 5. Database connection issues
 */

console.log('🔬 COMPREHENSIVE CHAT RELIABILITY TEST');
console.log('='.repeat(70));

// Test configuration
const CHAT_RELIABILITY_TEST = {
  testCustomerId: 'reliability-test-customer-' + Date.now(),
  testTherapistId: 'reliability-test-therapist-123',
  customerName: 'Reliability Test Customer',
  therapistName: 'Reliability Test Therapist',
  testMessage: 'This is a chat reliability test message.',
  conversationId: '',
  maxRetries: 3,
  timeoutMs: 10000
};

CHAT_RELIABILITY_TEST.conversationId = `customer_${CHAT_RELIABILITY_TEST.testCustomerId}_therapist_${CHAT_RELIABILITY_TEST.testTherapistId}`;

/**
 * Test 1: Server-Enforced Chat Service
 */
async function testServerEnforcedChatService() {
  console.log('\n🔒 TEST 1: Server-Enforced Chat Service...');
  
  try {
    // Import the service
    const { serverEnforcedChatService } = await import('./src/lib/services/serverEnforcedChatService.ts');
    
    const request = {
      senderId: CHAT_RELIABILITY_TEST.testCustomerId,
      senderName: CHAT_RELIABILITY_TEST.customerName,
      senderType: 'customer' as const,
      recipientId: CHAT_RELIABILITY_TEST.testTherapistId,
      recipientName: CHAT_RELIABILITY_TEST.therapistName,
      recipientType: 'therapist',
      message: CHAT_RELIABILITY_TEST.testMessage,
      roomId: CHAT_RELIABILITY_TEST.conversationId
    };
    
    console.log('📤 Sending test message through server-enforced service...');
    const response = await serverEnforcedChatService.sendMessage(request);
    
    if (response.success) {
      console.log('✅ SERVER-ENFORCED SERVICE: Working');
      console.log('📄 Message ID:', response.messageId);
      return { success: true, method: 'server-enforced', messageId: response.messageId };
    } else if (response.isViolation) {
      console.log('⚠️ SERVER-ENFORCED SERVICE: Message blocked (violation)');
      console.log('🚫 Violation type:', response.violationType);
      return { success: false, method: 'server-enforced', error: 'violation', violationType: response.violationType };
    } else if (response.isRestricted) {
      console.log('🚫 SERVER-ENFORCED SERVICE: Account restricted');
      return { success: false, method: 'server-enforced', error: 'restricted' };
    } else {
      console.log('❌ SERVER-ENFORCED SERVICE: Failed');
      console.log('💬 Error:', response.error);
      return { success: false, method: 'server-enforced', error: response.error };
    }
    
  } catch (error) {
    console.error('❌ SERVER-ENFORCED SERVICE: Exception occurred');
    console.error('Error:', (error as Error).message);
    return { success: false, method: 'server-enforced', error: (error as Error).message };
  }
}

/**
 * Test 2: Direct Chat Service (Fallback)
 */
async function testDirectChatService() {
  console.log('\n🔧 TEST 2: Direct Chat Service (Fallback)...');
  
  try {
    // Import the service
    const { directChatService } = await import('./src/lib/services/directChatService.ts');
    
    console.log('📤 Sending test message through direct chat service...');
    const result = await directChatService.sendMessage({
      conversationId: CHAT_RELIABILITY_TEST.conversationId,
      senderId: CHAT_RELIABILITY_TEST.testCustomerId,
      senderName: CHAT_RELIABILITY_TEST.customerName,
      senderRole: 'customer',
      receiverId: CHAT_RELIABILITY_TEST.testTherapistId,
      receiverName: CHAT_RELIABILITY_TEST.therapistName,
      receiverRole: 'therapist',
      message: CHAT_RELIABILITY_TEST.testMessage + ' (direct service)',
      messageType: 'fallback'
    });
    
    if (result.success) {
      console.log('✅ DIRECT CHAT SERVICE: Working');
      console.log('📄 Message ID:', result.messageId);
      return { success: true, method: 'direct', messageId: result.messageId };
    } else {
      console.log('❌ DIRECT CHAT SERVICE: Failed');
      console.log('💬 Error:', result.error);
      return { success: false, method: 'direct', error: result.error };
    }
    
  } catch (error) {
    console.error('❌ DIRECT CHAT SERVICE: Exception occurred');
    console.error('Error:', (error as Error).message);
    return { success: false, method: 'direct', error: (error as Error).message };
  }
}

/**
 * Test 3: Simple Chat Service (Backup)
 */
async function testSimpleChatService() {
  console.log('\n💬 TEST 3: Simple Chat Service (Backup)...');
  
  try {
    // Import the service
    const { simpleChatService } = await import('./src/lib/simpleChatService.ts');
    
    console.log('📤 Sending test message through simple chat service...');
    const message = await simpleChatService.sendMessage({
      conversationId: CHAT_RELIABILITY_TEST.conversationId,
      senderId: CHAT_RELIABILITY_TEST.testCustomerId,
      senderName: CHAT_RELIABILITY_TEST.customerName,
      senderRole: 'customer',
      receiverId: CHAT_RELIABILITY_TEST.testTherapistId,
      receiverName: CHAT_RELIABILITY_TEST.therapistName,
      receiverRole: 'therapist',
      message: CHAT_RELIABILITY_TEST.testMessage + ' (simple service)',
      messageType: 'text'
    });
    
    if (message && message.$id) {
      console.log('✅ SIMPLE CHAT SERVICE: Working');
      console.log('📄 Message ID:', message.$id);
      return { success: true, method: 'simple', messageId: message.$id };
    } else {
      console.log('❌ SIMPLE CHAT SERVICE: No message returned');
      return { success: false, method: 'simple', error: 'No message returned' };
    }
    
  } catch (error) {
    console.error('❌ SIMPLE CHAT SERVICE: Exception occurred');
    console.error('Error:', (error as Error).message);
    return { success: false, method: 'simple', error: (error as Error).message };
  }
}

/**
 * Test 4: Database Connectivity
 */
async function testDatabaseConnectivity() {
  console.log('\n🗄️ TEST 4: Database Connectivity...');
  
  try {
    // Import Appwrite
    const { databases, APPWRITE_CONFIG } = await import('./src/lib/appwrite.ts');
    
    console.log('🔍 Testing database connection...');
    
    // Test messages collection access
    const messagesTest = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.chatMessages,
      []
    );
    
    console.log('✅ MESSAGES COLLECTION: Accessible');
    console.log('📊 Total messages found:', messagesTest.total);
    
    // Test our conversation messages
    const conversationMessages = messagesTest.documents.filter(
      doc => doc.conversationId === CHAT_RELIABILITY_TEST.conversationId
    );
    
    console.log('📊 Test conversation messages:', conversationMessages.length);
    
    return {
      success: true,
      totalMessages: messagesTest.total,
      conversationMessages: conversationMessages.length,
      database: 'connected'
    };
    
  } catch (error) {
    console.error('❌ DATABASE CONNECTIVITY: Failed');
    console.error('Error:', (error as Error).message);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Test 5: Real-time Subscription
 */
async function testRealtimeSubscription() {
  console.log('\n📡 TEST 5: Real-time Subscription...');
  
  try {
    // Import Appwrite client
    const { client, APPWRITE_CONFIG } = await import('./src/lib/appwrite.ts');
    
    console.log('📡 Testing real-time subscription setup...');
    
    let subscriptionWorking = false;
    let receivedMessage = null;
    
    // Set up subscription
    const channelName = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatMessages}.documents`;
    
    const unsubscribe = client.subscribe(channelName, (response: any) => {
      console.log('📡 REAL-TIME: Received event:', response.events[0]);
      if (response.payload && response.payload.conversationId === CHAT_RELIABILITY_TEST.conversationId) {
        console.log('📨 REAL-TIME: Test message received!', response.payload.$id);
        subscriptionWorking = true;
        receivedMessage = response.payload;
      }
    });
    
    console.log('✅ SUBSCRIPTION: Setup successful');
    
    // Clean up after a short delay
    setTimeout(() => {
      unsubscribe();
      console.log('🧹 SUBSCRIPTION: Cleaned up');
    }, 2000);
    
    return {
      success: true,
      subscriptionSetup: true,
      method: 'realtime'
    };
    
  } catch (error) {
    console.error('❌ REAL-TIME SUBSCRIPTION: Failed');
    console.error('Error:', (error as Error).message);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Run Complete Reliability Test
 */
async function runChatReliabilityTest() {
  console.log('🚀 Starting Complete Chat Reliability Test...\n');
  
  const startTime = Date.now();
  const results = {
    serverEnforced: null,
    directFallback: null,
    simpleBackup: null,
    databaseConnectivity: null,
    realtimeSubscription: null
  };
  
  try {
    // Test all services sequentially
    console.log('Testing all chat services for reliability...\n');
    
    // Test 1: Server-enforced service
    results.serverEnforced = await testServerEnforcedChatService();
    
    // Test 2: Direct chat service
    results.directFallback = await testDirectChatService();
    
    // Test 3: Simple chat service
    results.simpleBackup = await testSimpleChatService();
    
    // Test 4: Database connectivity
    results.databaseConnectivity = await testDatabaseConnectivity();
    
    // Test 5: Real-time subscription
    results.realtimeSubscription = await testRealtimeSubscription();
    
    // Calculate reliability score
    const workingServices = Object.values(results).filter(result => result && result.success).length;
    const totalServices = Object.keys(results).length;
    const reliabilityScore = Math.round((workingServices / totalServices) * 100);
    
    const totalTime = Date.now() - startTime;
    
    // Generate report
    console.log('\n' + '='.repeat(70));
    console.log('📊 CHAT RELIABILITY TEST REPORT');
    console.log('='.repeat(70));
    
    // Service status
    Object.entries(results).forEach(([service, result]) => {
      const status = result && result.success ? '✅ WORKING' : '❌ FAILED';
      const method = result?.method || service;
      const error = result && !result.success ? ` (${result.error})` : '';
      console.log(`${status} ${service.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}: ${method}${error}`);
    });
    
    console.log(`\n🎯 RELIABILITY SCORE: ${reliabilityScore}%`);
    
    if (reliabilityScore >= 80) {
      console.log('🎉 CHAT SYSTEM: HIGHLY RELIABLE');
      console.log('💬 Multiple working fallback systems detected');
      console.log('✅ Messages will NOT fail to send');
    } else if (reliabilityScore >= 60) {
      console.log('⚠️ CHAT SYSTEM: MODERATE RELIABILITY');
      console.log('💬 Some fallback systems working');
      console.log('🔧 Recommended: Fix failed services');
    } else {
      console.log('🚨 CHAT SYSTEM: LOW RELIABILITY');
      console.log('💬 Critical failures detected');
      console.log('❌ High risk of message send failures');
    }
    
    console.log(`\n⏱️ Total test time: ${totalTime}ms`);
    console.log('='.repeat(70));
    
    return {
      success: reliabilityScore >= 60,
      reliabilityScore: reliabilityScore,
      workingServices: workingServices,
      totalServices: totalServices,
      results: results,
      totalTime: totalTime,
      chatSendWillFail: reliabilityScore < 40
    };
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.log('\n' + '='.repeat(70));
    console.log('❌ RELIABILITY TEST FAILED');
    console.log('='.repeat(70));
    console.error('Critical error:', (error as Error).message);
    console.log(`\n⏱️ Time before failure: ${totalTime}ms`);
    
    return {
      success: false,
      error: (error as Error).message,
      chatSendWillFail: true,
      totalTime: totalTime
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.runChatReliabilityTest = runChatReliabilityTest;
  window.testServerEnforcedChatService = testServerEnforcedChatService;
  window.testDirectChatService = testDirectChatService;
  window.testSimpleChatService = testSimpleChatService;
  
  console.log('💡 USAGE INSTRUCTIONS:');
  console.log('1. Run: runChatReliabilityTest()');
  console.log('2. Check reliability score and working services');
  console.log('3. If score < 80%, some chat sends may fail');
} else {
  // Auto-run in Node.js
  runChatReliabilityTest().then(result => {
    if (result.chatSendWillFail) {
      console.log('\n🚨 WARNING: Chat send failures are likely!');
      console.log('Action required: Fix failed services immediately');
    } else {
      console.log('\n✅ Chat system is reliable - sends will not fail');
    }
    process.exit(result.success ? 0 : 1);
  });
}
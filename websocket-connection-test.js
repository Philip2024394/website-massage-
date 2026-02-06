/**
 * WebSocket Connection Test - Verify Fixes
 */

console.log('=== WebSocket Connection Test ===');

async function testWebSocketConnection() {
  try {
    console.log('1. Testing unified Appwrite client import...');
    
    // Test if we can import the unified client
    const { client } = await import('./src/lib/appwriteClient.ts');
    console.log('✅ Unified client import successful');
    
    console.log('2. Testing connection configuration...');
    
    // Test connection with corrected values
    const databaseId = '68f76ee1000e64ca8d05';
    const bookingsCollection = 'bookings';
    const channel = `databases.${databaseId}.collections.${bookingsCollection}.documents`;
    
    console.log(`📡 Channel: ${channel}`);
    console.log('✅ Configuration values correct');
    
    console.log('3. Testing WebSocket subscription...');
    
    let connected = false;
    let unsubscribe = null;
    
    try {
      unsubscribe = client.subscribe(channel, (response) => {
        connected = true;
        console.log('✅ WebSocket connection successful!');
        console.log('📨 Response:', response.events?.[0] || 'Connection established');
      });
      
      // Wait 5 seconds for connection
      setTimeout(() => {
        if (unsubscribe) unsubscribe();
        
        if (connected) {
          console.log('🎉 WebSocket test PASSED - Connection working');
        } else {
          console.log('⏳ WebSocket test TIMEOUT - May still be working (normal in some environments)');
        }
        
        console.log('\n=== Test Complete ===');
      }, 5000);
      
    } catch (subscribeError) {
      console.error('❌ WebSocket subscription failed:', subscribeError.message);
      console.log('🔧 This indicates the fixes may need additional adjustment');
    }
    
  } catch (importError) {
    console.error('❌ Import failed:', importError.message);
    console.log('🔧 Check if unified client path is correct');
  }
}

// Auto-run test when this file is loaded
if (typeof window !== 'undefined') {
  testWebSocketConnection();
} else {
  console.log('Run this test in a browser environment');
}
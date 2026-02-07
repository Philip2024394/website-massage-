// 🔌 BROWSER CONSOLE WEBSOCKET TEST
// Copy and paste this into your browser console to test WebSocket connection

(async function testWebSocket() {
    console.log('🔍 BROWSER WEBSOCKET TEST');
    console.log('========================');
    
    try {
        // Import the Appwrite client
        const { appwriteClient } = await import('./lib/appwrite/client.ts');
        console.log('✅ Appwrite client imported');
        
        let connected = false;
        
        console.log('🔌 Testing WebSocket connection...');
        
        const unsubscribe = appwriteClient.subscribe('files', (response) => {
            console.log('✅ WebSocket connection WORKING!', response);
            connected = true;
            unsubscribe();
        });
        
        // Wait 3 seconds
        setTimeout(() => {
            if (!connected) {
                console.error('❌ WebSocket connection TIMEOUT');
                console.log('This explains why you\'re seeing "WebSocket realtime connection timeout detected"');
                console.log('');
                console.log('🔧 TROUBLESHOOTING STEPS:');
                console.log('1. Check if you\'re behind a corporate firewall');
                console.log('2. Try using a different network (mobile hotspot)');
                console.log('3. Check browser developer tools Network tab for WebSocket connections');
                console.log('4. Verify Appwrite project settings in console');
            } else {
                console.log('✅ WebSocket test completed successfully');
            }
            unsubscribe();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
})();
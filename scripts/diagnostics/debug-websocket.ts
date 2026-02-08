/**
 * 🔌 WEBSOCKET CONNECTION DIAGNOSTIC
 * 
 * Manual test for WebSocket realtime connection issues
 * Run this in browser console to debug connection problems
 */

console.log('🔍 WEBSOCKET DIAGNOSTIC STARTING...');
console.log('=====================================');

async function testWebSocketConnection() {
    try {
        // 1. Test basic Appwrite client availability
        console.log('1. 📦 Testing Appwrite client availability...');
        if (!(window as any).Appwrite) {
            console.error('❌ Appwrite SDK not loaded');
            return;
        }
        console.log('✅ Appwrite SDK loaded');

        // 2. Create client instance
        console.log('\n2. 🔧 Creating client instance...');
        const { Client } = (window as any).Appwrite;
        const client = new Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');
        
        console.log('✅ Client configured');

        // 3. Test simple subscription
        console.log('\n3. 🔌 Testing WebSocket subscription...');
        
        let connected = false;
        const timeout = setTimeout(() => {
            if (!connected) {
                console.error('❌ WebSocket connection timeout after 10 seconds');
            }
        }, 10000);

        // Try multiple subscription types
        const subscriptionTypes = ['account', 'files', 'buckets'];
        
        for (const type of subscriptionTypes) {
            try {
                console.log(`   Testing ${type} subscription...`);
                const unsubscribe = client.subscribe(type, (response: any) => {
                    console.log(`✅ WebSocket connection successful via ${type}:`, response);
                    connected = true;
                    clearTimeout(timeout);
                    unsubscribe();
                });
                
                // Wait 2 seconds for this type before trying next
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (connected) break;
                
            } catch (error: any) {
                console.warn(`   ⚠️ ${type} subscription failed:`, error.message);
            }
        }

        if (!connected) {
            console.error('\n❌ ALL SUBSCRIPTION TYPES FAILED');
            console.log('   This indicates a fundamental WebSocket connection issue');
            console.log('   Possible causes:');
            console.log('   - Network/firewall blocking WebSocket connections');
            console.log('   - Appwrite project configuration issue');
            console.log('   - Invalid endpoint or project ID');
        }

    } catch (error: any) {
        console.error('❌ DIAGNOSTIC ERROR:', error.message);
        console.log('   Stack trace:', error.stack);
    }
}

// Auto-run the test
testWebSocketConnection().then(() => {
    console.log('\n🏁 WEBSOCKET DIAGNOSTIC COMPLETE');
    console.log('=====================================');
});

export {}; // Make this a module
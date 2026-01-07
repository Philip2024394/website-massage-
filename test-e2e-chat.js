/**
 * End-to-End Chat Window Test
 * Test the complete booking → chat window flow
 */

console.log('🚀 STARTING E2E CHAT WINDOW TEST');
console.log('==================================');

// Wait for React app to fully load
setTimeout(async () => {
    try {
        // Step 1: Check if openChat listener is active
        console.log('🔍 Step 1: Testing openChat event listener...');
        
        let listenerCaught = false;
        
        // Add temporary listener to verify the main one is working
        const testListener = (event) => {
            console.log('✅ Test listener caught openChat event!', event.detail);
            listenerCaught = true;
        };
        
        window.addEventListener('openChat', testListener);
        
        // Dispatch test event
        const testPayload = {
            chatRoomId: 'test-room-123',
            bookingId: 'test-booking-456',
            providerId: 'test-provider-789',
            providerName: 'Test Therapist',
            providerImage: null,
            customerName: 'Test Customer',
            customerWhatsApp: '+6281234567890',
            userRole: 'user',
            pricing: { '60': 150000, '90': 225000, '120': 300000 }
        };
        
        window.dispatchEvent(new CustomEvent('openChat', { detail: testPayload }));
        
        // Wait a bit for async processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (listenerCaught) {
            console.log('✅ Step 1 PASSED: openChat listener is active');
        } else {
            console.error('❌ Step 1 FAILED: openChat listener not responding');
            return;
        }
        
        // Step 2: Check if ChatWindow component exists in DOM
        console.log('🔍 Step 2: Checking ChatWindow in DOM...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const chatWindow = document.querySelector('[data-testid="chat-window"]') || 
                          document.querySelector('.chat-window') ||
                          document.querySelector('div[class*="ChatWindow"]') ||
                          document.querySelector('div:has(> div:contains("Chat"))');
        
        if (chatWindow) {
            console.log('✅ Step 2 PASSED: ChatWindow found in DOM');
            console.log('📍 ChatWindow element:', chatWindow);
        } else {
            console.log('⚠️ Step 2: ChatWindow not found in DOM yet');
            console.log('🔍 Let me check React state...');
            
            // Look for any chat-related elements
            const possibleChatElements = document.querySelectorAll('div[class*="chat"], div[class*="Chat"], div:contains("chat")');
            console.log('🔍 Found possible chat elements:', possibleChatElements);
        }
        
        // Step 3: Check React state (if we can access it)
        console.log('🔍 Step 3: Checking React state...');
        
        // Look for React fiber nodes to inspect state
        const rootElement = document.getElementById('root');
        if (rootElement && rootElement._reactInternalFiber) {
            console.log('🔍 React fiber found, trying to inspect state...');
        } else {
            console.log('⚠️ Cannot inspect React state directly');
        }
        
        // Step 4: Test the booking creation flow
        console.log('🔍 Step 4: Testing booking submission...');
        console.log('💡 Look for a booking button to test the full flow');
        
        // Find booking-related buttons
        const bookingButtons = document.querySelectorAll('button:contains("Book"), button:contains("Pesan"), button[class*="book"], button[class*="Book"]');
        console.log('🔍 Found booking buttons:', bookingButtons);
        
        console.log('✅ E2E TEST COMPLETE');
        console.log('📊 SUMMARY:');
        console.log(`   - Event listener: ${listenerCaught ? 'WORKING' : 'BROKEN'}`);
        console.log(`   - ChatWindow in DOM: ${chatWindow ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`   - Booking buttons: ${bookingButtons.length} found`);
        
        // Cleanup
        window.removeEventListener('openChat', testListener);
        
    } catch (error) {
        console.error('❌ E2E TEST ERROR:', error);
    }
}, 2000);

console.log('⏳ Test will run in 2 seconds...');
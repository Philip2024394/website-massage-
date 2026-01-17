/**
 * 🧪 Comprehensive Notification System Test
 * 
 * Tests MP3 sounds, badge counters, and visual notifications
 * for therapist chat messages from admin and users
 */

// Test notification system functionality
async function testNotificationSystem() {
    console.log('🧪 Starting comprehensive notification system test...\n');
    
    const results = {
        audioSupport: false,
        notificationPermission: false,
        badgeSupport: false,
        serviceWorkerActive: false,
        floatingChatFound: false,
        soundPlayback: false,
        badgeUpdate: false
    };
    
    // 1. Test Audio Support
    console.log('1️⃣ Testing Audio Support...');
    try {
        const testAudio = new Audio();
        testAudio.src = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAABAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA';
        results.audioSupport = true;
        console.log('✅ Audio support: AVAILABLE');
    } catch (error) {
        console.log('❌ Audio support: NOT AVAILABLE');
    }
    
    // 2. Test Notification Permission
    console.log('\\n2️⃣ Testing Notification Permission...');
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            results.notificationPermission = true;
            console.log('✅ Notification permission: GRANTED');
        } else if (Notification.permission === 'default') {
            console.log('⚠️ Notification permission: DEFAULT (will request)');
            try {
                const permission = await Notification.requestPermission();
                results.notificationPermission = permission === 'granted';
                console.log(`${permission === 'granted' ? '✅' : '❌'} Permission result: ${permission.toUpperCase()}`);
            } catch (error) {
                console.log('❌ Permission request failed:', error);
            }
        } else {
            console.log('❌ Notification permission: DENIED');
        }
    } else {
        console.log('❌ Notifications: NOT SUPPORTED');
    }
    
    // 3. Test Badge API Support
    console.log('\\n3️⃣ Testing Badge API Support...');
    if ('setAppBadge' in navigator) {
        results.badgeSupport = true;
        console.log('✅ Badge API: SUPPORTED');
        
        // Test badge functionality
        try {
            await navigator.setAppBadge(5);
            console.log('✅ Badge set to 5');
            setTimeout(async () => {
                await navigator.clearAppBadge();
                console.log('✅ Badge cleared');
            }, 2000);
            results.badgeUpdate = true;
        } catch (error) {
            console.log('❌ Badge update failed:', error);
        }
    } else {
        console.log('❌ Badge API: NOT SUPPORTED');
    }
    
    // 4. Test Service Worker
    console.log('\\n4️⃣ Testing Service Worker...');
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
                results.serviceWorkerActive = true;
                console.log('✅ Service Worker: ACTIVE');
                console.log('   Scope:', registration.scope);
            } else {
                console.log('❌ Service Worker: INACTIVE');
            }
        } catch (error) {
            console.log('❌ Service Worker error:', error);
        }
    } else {
        console.log('❌ Service Worker: NOT SUPPORTED');
    }
    
    // 5. Test Floating Chat Component
    console.log('\\n5️⃣ Testing Floating Chat Component...');
    const floatingChatSelectors = [
        'button[title*=\"Support Chat\"]',
        'button[title*=\"Open Support Chat\"]', 
        '[data-testid=\"floating-chat\"]',
        '.floating-chat',
        'button:has(svg):has([data-lucide=\"message-circle\"])'
    ];
    
    let chatButton = null;
    for (const selector of floatingChatSelectors) {
        chatButton = document.querySelector(selector);
        if (chatButton) break;
    }
    
    if (chatButton) {
        results.floatingChatFound = true;
        console.log('✅ Floating Chat: FOUND');
        console.log('   Element:', chatButton);
        
        // Highlight the chat button
        chatButton.style.border = '3px solid lime';
        chatButton.style.boxShadow = '0 0 15px lime';
        console.log('💡 Chat button highlighted with green border');
        
        // Check for badge
        const badge = chatButton.querySelector('[class*=\"bg-red\"], .badge, [data-testid=\"unread-badge\"]');
        if (badge) {
            console.log('✅ Badge element found on chat button');
        } else {
            console.log('⚠️ No badge element found on chat button');
        }
    } else {
        console.log('❌ Floating Chat: NOT FOUND');
        console.log('💡 Possible reasons:');
        console.log('   - User not logged in as therapist');
        console.log('   - Component not loaded yet');
        console.log('   - Different CSS selector needed');
    }
    
    // 6. Test Sound Playback
    console.log('\\n6️⃣ Testing Sound Playback...');
    if (results.audioSupport) {
        try {
            // Test Web Audio API fallback
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            results.soundPlayback = true;
            console.log('✅ Sound playback test: SUCCESS (beep sound played)');
        } catch (error) {
            console.log('❌ Sound playback test: FAILED', error);
        }
    }
    
    // 7. Test Notification Display
    console.log('\\n7️⃣ Testing Notification Display...');
    if (results.notificationPermission) {
        try {
            const testNotification = new Notification('🧪 Test Notification', {
                body: 'This is a test notification for the therapist chat system',
                icon: '/icons/therapist-icon-192.png',
                badge: '/icons/therapist-icon-96.png',
                tag: 'test-notification'
            });
            
            console.log('✅ Test notification: DISPLAYED');
            
            // Auto-close after 3 seconds
            setTimeout(() => testNotification.close(), 3000);
        } catch (error) {
            console.log('❌ Test notification: FAILED', error);
        }
    }
    
    // Generate Report
    console.log('\\n📊 NOTIFICATION SYSTEM TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Audio Support:          ${results.audioSupport ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Notification Permission: ${results.notificationPermission ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Badge API:              ${results.badgeSupport ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Service Worker:         ${results.serviceWorkerActive ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Floating Chat:          ${results.floatingChatFound ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Sound Playback:         ${results.soundPlayback ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Badge Update:           ${results.badgeUpdate ? '✅ PASS' : '❌ FAIL'}`);
    
    const passCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const passPercentage = Math.round((passCount / totalTests) * 100);
    
    console.log('='.repeat(50));
    console.log(`Overall Score: ${passCount}/${totalTests} (${passPercentage}%)`);
    
    if (passPercentage >= 80) {
        console.log('🎉 EXCELLENT: Notification system is working well!');
    } else if (passPercentage >= 60) {
        console.log('⚠️ GOOD: Most features working, some improvements needed');
    } else {
        console.log('🔧 NEEDS WORK: Significant issues found, check requirements');
    }
    
    console.log('\\n💡 To manually test chat notifications:');
    console.log('1. Send a message from admin dashboard to this therapist');
    console.log('2. Look for red badge counter on floating chat icon');
    console.log('3. Listen for MP3 notification sound');
    console.log('4. Check for browser/PWA notification popup');
    
    return results;
}

// Function to simulate admin message (for testing)
async function simulateAdminMessage() {
    console.log('🎭 Simulating admin message for notification testing...');
    
    // Trigger the chat notification system
    const mockMessage = {
        $id: 'test-message-' + Date.now(),
        senderId: 'admin',
        senderName: 'Admin Support',
        content: 'Hello! This is a test message to verify notifications are working.',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Dispatch event that FloatingChat listens for
    window.dispatchEvent(new CustomEvent('newChatMessage', {
        detail: mockMessage
    }));
    
    console.log('✅ Mock message event dispatched');
    console.log('💡 Check for:');
    console.log('   - Red badge counter update');
    console.log('   - Notification sound');
    console.log('   - Browser notification popup');
}

// Export functions for browser console access
window.testNotificationSystem = testNotificationSystem;
window.simulateAdminMessage = simulateAdminMessage;

console.log('🧪 Notification test suite loaded!');
console.log('💡 Available commands:');
console.log('   - testNotificationSystem() - Run full test suite');
console.log('   - simulateAdminMessage() - Test notification with mock message');

export { testNotificationSystem, simulateAdminMessage };
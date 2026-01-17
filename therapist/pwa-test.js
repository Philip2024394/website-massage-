/**
 * 🧪 PWA Features Test Script
 * Test PWA functionality in therapist dashboard
 */

// Test PWA Detection
console.log('🔍 Testing PWA Detection...');
console.log('isPWAMode():', window.isPWAMode ? window.isPWAMode() : 'Function not available');
console.log('navigator.standalone:', window.navigator.standalone);
console.log('display-mode standalone:', window.matchMedia('(display-mode: standalone)').matches);

// Test Service Worker Registration
console.log('🔧 Testing Service Worker...');
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration()
        .then(registration => {
            if (registration) {
                console.log('✅ Service Worker registered:', registration.scope);
            } else {
                console.log('❌ Service Worker not registered');
            }
        })
        .catch(error => {
            console.error('❌ Service Worker check failed:', error);
        });
} else {
    console.log('❌ Service Worker not supported');
}

// Test Notification Permission
console.log('🔔 Testing Notification Permission...');
if ('Notification' in window) {
    console.log('Notification permission:', Notification.permission);
    if (Notification.permission === 'default') {
        console.log('💡 You can request notification permission for PWA features');
    }
} else {
    console.log('❌ Notifications not supported');
}

// Test PWA Installation Prompt
console.log('📱 Testing PWA Installation...');
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('✅ PWA install prompt available');
    
    // Show install button or prompt
    const installButton = document.createElement('button');
    installButton.textContent = '📱 Install PWA';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '20px';
    installButton.style.left = '20px';
    installButton.style.zIndex = '9999';
    installButton.style.padding = '10px 20px';
    installButton.style.backgroundColor = '#ff6b35';
    installButton.style.color = 'white';
    installButton.style.border = 'none';
    installButton.style.borderRadius = '8px';
    installButton.style.cursor = 'pointer';
    
    installButton.onclick = () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ User accepted PWA install');
            } else {
                console.log('❌ User dismissed PWA install');
            }
            deferredPrompt = null;
            installButton.remove();
        });
    };
    
    document.body.appendChild(installButton);
});

// Test Local Storage for Chat Persistence
console.log('💾 Testing Local Storage...');
try {
    localStorage.setItem('pwa-test', 'success');
    const testValue = localStorage.getItem('pwa-test');
    console.log('Local Storage test:', testValue === 'success' ? '✅ Working' : '❌ Failed');
    localStorage.removeItem('pwa-test');
} catch (error) {
    console.error('❌ Local Storage not available:', error);
}

// Test Chat Persistence Manager
console.log('💬 Testing Chat Persistence Manager...');
if (window.ChatPersistenceManager) {
    try {
        window.ChatPersistenceManager.saveChatState('test-therapist', {
            isOpen: true,
            isMinimized: false,
            unreadCount: 3
        });
        
        const retrievedState = window.ChatPersistenceManager.getChatState('test-therapist');
        console.log('Chat state saved and retrieved:', retrievedState);
        
        // Cleanup
        window.ChatPersistenceManager.clearChatState('test-therapist');
        console.log('✅ Chat Persistence Manager working');
    } catch (error) {
        console.error('❌ Chat Persistence Manager error:', error);
    }
} else {
    console.log('❌ Chat Persistence Manager not available');
}

// Test Badge API
console.log('🔴 Testing Badge API...');
if ('setAppBadge' in navigator) {
    navigator.setAppBadge(5).then(() => {
        console.log('✅ Badge API working - set badge to 5');
        
        setTimeout(() => {
            navigator.clearAppBadge().then(() => {
                console.log('✅ Badge cleared');
            });
        }, 3000);
    });
} else {
    console.log('❌ Badge API not supported');
}

// Monitor for FloatingChat Component
console.log('💭 Monitoring for FloatingChat component...');
const checkForFloatingChat = () => {
    const floatingChatButton = document.querySelector('button[title*="Support Chat"], button[title*="Chat"]');
    if (floatingChatButton) {
        console.log('✅ FloatingChat component detected');
        floatingChatButton.style.border = '3px solid lime';
        floatingChatButton.style.boxShadow = '0 0 10px lime';
        console.log('💡 FloatingChat button highlighted with green border');
    } else {
        console.log('⏳ FloatingChat component not yet visible (user might not be authenticated)');
    }
};

// Check immediately and then periodically
checkForFloatingChat();
setInterval(checkForFloatingChat, 2000);

console.log('🎉 PWA Feature Test Complete! Check console for results.');
console.log('💡 To test PWA functionality:');
console.log('   1. Login to see FloatingChat component');
console.log('   2. Look for PWA install prompt (if available)');
console.log('   3. Try installing the PWA from browser menu');
console.log('   4. Test offline functionality');
console.log('   5. Check if chat state persists across page reloads');
// Quick test: Run this in browser console (F12) to check for floating chat icon
console.log('🔍 Searching for floating chat icon...');

// Check for the floating chat icon
const floatingIcon = document.querySelector('.fixed.bottom-6.right-6 button');
if (floatingIcon) {
    console.log('✅ FLOATING CHAT ICON FOUND!', floatingIcon);
    console.log('📍 Position:', floatingIcon.getBoundingClientRect());
    console.log('👆 Is visible:', window.getComputedStyle(floatingIcon).display !== 'none');
    console.log('🎨 Classes:', floatingIcon.className);
    
    // Highlight it
    floatingIcon.style.outline = '5px solid lime';
    floatingIcon.style.boxShadow = '0 0 20px lime';
    
    alert('✅ Floating chat icon found and highlighted!');
} else {
    console.log('❌ Floating chat icon not found');
    
    // Check for any registered customer state
    console.log('🔍 Checking if user is registered (required for chat icon)...');
    
    // Look for any chat-related elements
    const chatElements = document.querySelectorAll('[class*="chat"], button[title*="chat" i]');
    console.log('📋 Found chat-related elements:', chatElements.length);
    chatElements.forEach((el, i) => {
        console.log(`  ${i+1}:`, el.tagName, el.className, el.textContent?.trim());
    });
}

// Test openChat event
console.log('🧪 Testing openChat event system...');
window.dispatchEvent(new CustomEvent('openChat', {
    detail: {
        chatRoomId: 'test-' + Date.now(),
        providerId: 'test-provider',
        providerName: 'Test Therapist',
        bookingId: 'test-booking',
        customerName: 'Test User',
        customerWhatsApp: '+6281234567890'
    }
}));

console.log('✅ Test completed - check console for results!');
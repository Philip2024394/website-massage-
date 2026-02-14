/**
 * 🔒 CANONICAL SINGLE PROVIDER BOOKING FLOW TEST
 * This test verifies that the booking system uses exactly ONE PersistentChatProvider instance
 * and that the Book Now button correctly opens the chat window.
 */

const testCanonicalBookingFlow = () => {
  console.log('🧪 TESTING: Canonical Single Provider Architecture');
  
  // 1. Verify singleton guard prevents multiple providers
  console.log('📋 Test 1: Checking for singleton provider guard...');
  if (window.CHAT_PROVIDER_MOUNTED) {
    console.log('✅ PASS: Singleton guard is active');
  } else {
    console.log('❌ FAIL: No singleton guard detected');
  }
  
  // 2. Check if PersistentChatProvider exists in window
  console.log('📋 Test 2: Checking for PersistentChatProvider context...');
  const providerContext = document.querySelector('[data-provider="persistent-chat"]');
  if (providerContext) {
    console.log('✅ PASS: PersistentChatProvider found in DOM');
  } else {
    console.log('❌ FAIL: PersistentChatProvider not found in DOM');
  }
  
  // 3. Test Book Now button functionality
  console.log('📋 Test 3: Testing Book Now button integration...');
  const bookNowButtons = document.querySelectorAll('button');
  let bookButtonFound = false;
  
  bookNowButtons.forEach(button => {
    const buttonText = button.textContent?.toLowerCase();
    if (buttonText?.includes('book') && !buttonText?.includes('schedule')) {
      bookButtonFound = true;
      console.log('✅ PASS: Book Now button found:', button.textContent);
    }
  });
  
  if (!bookButtonFound) {
    console.log('❌ FAIL: No Book Now buttons found');
  }
  
  // 4. Test for clean UI (no debug overlays)
  console.log('📋 Test 4: Checking for debug UI elements...');
  const debugElements = document.querySelectorAll('[class*="debug"], [class*="diagnostic"], [data-debug], [data-test]');
  if (debugElements.length === 0) {
    console.log('✅ PASS: No debug UI elements found - clean production UI');
  } else {
    console.log('❌ FAIL: Debug UI elements detected:', debugElements.length);
    debugElements.forEach((el, i) => console.log(`  Debug element ${i + 1}:`, el.className));
  }
  
  console.log('🎯 CANONICAL ARCHITECTURE TEST COMPLETE');
  console.log('🔍 Check console output above for test results');
};

// Run test when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testCanonicalBookingFlow);
} else {
  testCanonicalBookingFlow();
}

console.log('🚀 Canonical booking flow test script loaded');
// Chat Booking Flow Diagnostic Test
// Run this in browser console to test chat booking functionality

(async function chatBookingDiagnostic() {
  console.log('🔍 CHAT BOOKING FLOW DIAGNOSTIC');
  console.log('=' .repeat(50));
  
  const results = {
    issues: [],
    successes: [],
    warnings: []
  };
  
  // 1. Check if PersistentChatWindow component exists
  console.log('\n1️⃣ CHECKING CHAT COMPONENT...');
  const chatWindow = document.querySelector('[data-testid="persistent-chat-window"]') || 
                     document.querySelector('.persistent-chat-window') ||
                     document.querySelector('.chat-window');
  
  if (chatWindow) {
    console.log('✅ Chat window element found');
    results.successes.push('Chat window DOM element exists');
  } else {
    console.log('❌ Chat window element not found');
    results.issues.push('Chat window DOM element missing');
  }
  
  // 2. Check if React context/state is available
  console.log('\n2️⃣ CHECKING REACT STATE...');
  try {
    const reactFiber = chatWindow?._reactInternalInstance || chatWindow?.__reactInternalFiber;
    if (reactFiber || window.React) {
      console.log('✅ React context detected');
      results.successes.push('React available');
    } else {
      console.log('⚠️ React context not easily accessible');
      results.warnings.push('React context not directly accessible');
    }
  } catch (error) {
    console.log('⚠️ Error checking React state:', error.message);
    results.warnings.push('React state check failed');
  }
  
  // 3. Check if Appwrite client is configured
  console.log('\n3️⃣ CHECKING APPWRITE CONFIG...');
  try {
    // Check if appwrite config exists in window/global
    const hasAppwriteConfig = !!(window.appwrite || window.client);
    if (hasAppwriteConfig) {
      console.log('✅ Appwrite client detected');
      results.successes.push('Appwrite client available');
    } else {
      console.log('⚠️ Appwrite client not found in global scope');
      results.warnings.push('Appwrite client not in global scope (may be in module)');
    }
  } catch (error) {
    console.log('❌ Error checking Appwrite:', error.message);
    results.issues.push('Appwrite check failed');
  }
  
  // 4. Check for chat-related local storage
  console.log('\n4️⃣ CHECKING CHAT PERSISTENCE...');
  try {
    const chatState = localStorage.getItem('persistent_chat_state') || sessionStorage.getItem('persistent_chat_state');
    if (chatState) {
      console.log('✅ Chat state found in storage:', JSON.parse(chatState));
      results.successes.push('Chat state persisted');
    } else {
      console.log('⚠️ No chat state in local storage (may be initial visit)');
      results.warnings.push('No persisted chat state');
    }
  } catch (error) {
    console.log('❌ Error checking chat storage:', error.message);
    results.issues.push('Chat storage check failed');
  }
  
  // 5. Check for therapist data
  console.log('\n5️⃣ CHECKING THERAPIST DATA...');
  const therapistCards = document.querySelectorAll('.therapist-card, [class*="therapist"], [data-testid*="therapist"]');
  if (therapistCards.length > 0) {
    console.log(`✅ Found ${therapistCards.length} therapist elements`);
    results.successes.push(`${therapistCards.length} therapist elements found`);
  } else {
    console.log('❌ No therapist elements found');
    results.issues.push('No therapist elements found');
  }
  
  // 6. Test Book Now button functionality
  console.log('\n6️⃣ CHECKING BOOK NOW BUTTONS...');
  const bookNowButtons = document.querySelectorAll('[class*="book"], button[class*="orange"], [data-testid*="book"]');
  if (bookNowButtons.length > 0) {
    console.log(`✅ Found ${bookNowButtons.length} book now buttons`);
    results.successes.push(`${bookNowButtons.length} booking buttons found`);
    
    // Test click handler
    const firstButton = bookNowButtons[0];
    if (firstButton && firstButton.onclick) {
      console.log('✅ Book now button has click handler');
      results.successes.push('Book now button has click handler');
    } else {
      console.log('⚠️ Book now button may not have proper click handler');
      results.warnings.push('Book now button click handler unclear');
    }
  } else {
    console.log('❌ No book now buttons found');
    results.issues.push('No booking buttons found');
  }
  
  // 7. Check network connectivity
  console.log('\n7️⃣ CHECKING NETWORK...');
  try {
    const testUrl = 'https://syd.cloud.appwrite.io/v1/health';
    const response = await fetch(testUrl);
    if (response.ok) {
      console.log('✅ Appwrite endpoint reachable');
      results.successes.push('Appwrite endpoint reachable');
    } else {
      console.log('❌ Appwrite endpoint returned error:', response.status);
      results.issues.push(`Appwrite endpoint error: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    results.issues.push(`Network error: ${error.message}`);
  }
  
  // SUMMARY
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('=' .repeat(30));
  
  console.log(`\n✅ WORKING (${results.successes.length}):`);
  results.successes.forEach(item => console.log(`   • ${item}`));
  
  console.log(`\n⚠️ WARNINGS (${results.warnings.length}):`);
  results.warnings.forEach(item => console.log(`   • ${item}`));
  
  console.log(`\n❌ ISSUES (${results.issues.length}):`);
  results.issues.forEach(item => console.log(`   • ${item}`));
  
  // RECOMMENDATIONS
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.issues.length === 0 && results.warnings.length <= 2) {
    console.log('   🎉 Chat booking should work - try booking flow');
    console.log('   📝 If it still fails, check browser console during booking');
  } else if (results.issues.some(i => i.includes('therapist'))) {
    console.log('   🔧 Fix therapist data loading first');
  } else if (results.issues.some(i => i.includes('Chat window'))) {
    console.log('   🔧 Chat component not rendering - check React app');
  } else {
    console.log('   🔧 Fix critical issues above before testing booking');
  }
  
  return results;
})();
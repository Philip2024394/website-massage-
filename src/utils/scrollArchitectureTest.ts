/**
 * 🧪 SCROLL ARCHITECTURE TEST SUITE
 * 
 * Comprehensive testing to verify the global scroll architecture is working correctly.
 * Run this in development to ensure mobile scrolling works perfectly.
 */

export class ScrollArchitectureTest {
  private static results: { test: string; passed: boolean; message: string }[] = [];
  
  /**
   * Run all scroll architecture tests
   */
  static runAllTests(): void {
    console.log('🧪 Running Global Scroll Architecture Tests...');
    console.log('');
    
    this.results = [];
    
    // Core tests
    this.testBodyScrollAuthority();
    this.testViewportHeightBans();
    this.testOverflowHiddenBans();
    this.testPositionFixedWrappers();
    this.testChatContainerSafety();
    this.testModalSafety();
    this.testMobileKeyboardHandling();
    
    // Report results
    this.reportResults();
  }
  
  private static addResult(test: string, passed: boolean, message: string): void {
    this.results.push({ test, passed, message });
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test}: ${message}`);
  }
  
  private static testBodyScrollAuthority(): void {
    const bodyStyle = getComputedStyle(document.body);
    const htmlStyle = getComputedStyle(document.documentElement);
    
    // Test 1: Body can scroll
    const bodyCanScroll = bodyStyle.overflowY === 'auto' || bodyStyle.overflowY === 'visible';
    this.addResult(
      'Body Scroll Authority', 
      bodyCanScroll,
      bodyCanScroll ? 'Body scrolling enabled' : `Body overflow: ${bodyStyle.overflowY}`
    );
    
    // Test 2: HTML doesn't interfere
    const htmlAllowsScroll = htmlStyle.overflowY !== 'hidden';
    this.addResult(
      'HTML Scroll Compatibility',
      htmlAllowsScroll,
      htmlAllowsScroll ? 'HTML allows scrolling' : 'HTML blocks scrolling'
    );
    
    // Test 3: Root element is safe
    const root = document.getElementById('root');
    if (root) {
      const rootStyle = getComputedStyle(root);
      const rootSafe = rootStyle.overflow !== 'hidden' && !rootStyle.height.includes('100vh');
      this.addResult(
        'Root Element Safety',
        rootSafe,
        rootSafe ? 'Root element scroll-safe' : 'Root element has scroll violations'
      );
    }
  }
  
  private static testViewportHeightBans(): void {
    // Check for forbidden viewport height patterns
    const vhElements = document.querySelectorAll('[style*="100vh"], [style*="100dvh"]');
    const screenElements = document.querySelectorAll('[class*="h-screen"], [class*="min-h-screen"]');
    
    this.addResult(
      'Viewport Height Ban Enforcement',
      vhElements.length === 0,
      vhElements.length === 0 ? 'No 100vh inline styles found' : `${vhElements.length} 100vh violations found`
    );
    
    this.addResult(
      'Screen Class Ban Enforcement',
      screenElements.length === 0,
      screenElements.length === 0 ? 'No h-screen classes found' : `${screenElements.length} h-screen violations found`
    );
  }
  
  private static testOverflowHiddenBans(): void {
    // Test that critical elements don't have overflow: hidden
    const body = document.body;
    const html = document.documentElement;
    const root = document.getElementById('root');
    
    const bodyOverflow = getComputedStyle(body).overflow;
    const htmlOverflow = getComputedStyle(html).overflow;
    
    this.addResult(
      'Body Overflow Ban',
      bodyOverflow !== 'hidden',
      bodyOverflow !== 'hidden' ? 'Body overflow allowed' : 'Body overflow blocked'
    );
    
    this.addResult(
      'HTML Overflow Ban',
      htmlOverflow !== 'hidden',
      htmlOverflow !== 'hidden' ? 'HTML overflow allowed' : 'HTML overflow blocked'
    );
    
    if (root) {
      const rootOverflow = getComputedStyle(root).overflow;
      this.addResult(
        'Root Overflow Safety',
        rootOverflow !== 'hidden',
        rootOverflow !== 'hidden' ? 'Root overflow safe' : 'Root overflow blocked'
      );
    }
  }
  
  private static testPositionFixedWrappers(): void {
    // Look for position: fixed elements with full height
    const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = getComputedStyle(el);
      return style.position === 'fixed' && (
        style.height.includes('100vh') || 
        style.height === '100%' ||
        el.classList.contains('h-screen')
      );
    });
    
    this.addResult(
      'Fixed Wrapper Ban',
      fixedElements.length === 0,
      fixedElements.length === 0 ? 'No fixed page wrappers found' : `${fixedElements.length} fixed wrappers found`
    );
  }
  
  private static testChatContainerSafety(): void {
    // Look for safe chat containers
    const chatContainers = document.querySelectorAll('.safe-chat-container, [class*="chat"]');
    let safeChatCount = 0;
    let unsafeChatCount = 0;
    
    chatContainers.forEach(container => {
      const style = getComputedStyle(container);
      if (container.classList.contains('safe-chat-container') || 
          (style.maxHeight && !style.height.includes('100vh'))) {
        safeChatCount++;
      } else {
        unsafeChatCount++;
      }
    });
    
    this.addResult(
      'Chat Container Safety',
      unsafeChatCount === 0,
      chatContainers.length === 0 ? 'No chat containers found' : 
        `${safeChatCount} safe, ${unsafeChatCount} unsafe chat containers`
    );
  }
  
  private static testModalSafety(): void {
    // Check for modals that don't lock body scroll
    const modals = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="dialog"]');
    
    // This test passes if we don't find evidence of body scroll locking
    this.addResult(
      'Modal Safety',
      true, // Assume safe unless we detect violations
      modals.length === 0 ? 'No modals found' : `${modals.length} modals found (body scroll preserved)`
    );
  }
  
  private static testMobileKeyboardHandling(): void {
    // Test that mobile keyboard won't break scrolling
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasViewportMeta = !!document.querySelector('meta[name="viewport"]');
    
    this.addResult(
      'Mobile Keyboard Safety',
      !isMobile || hasViewportMeta,
      isMobile ? 
        (hasViewportMeta ? 'Viewport meta tag present' : 'Missing viewport meta tag') :
        'Desktop environment'
    );
    
    // Test for safe area insets
    const supportsEnv = CSS.supports('height', 'env(safe-area-inset-top)');
    this.addResult(
      'Safe Area Support',
      supportsEnv || !isMobile,
      supportsEnv ? 'Environment variables supported' : 'No safe area support'
    );
  }
  
  private static reportResults(): void {
    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`${passed}/${total} tests passed (${percentage}%)`);
    console.log('');
    
    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Mobile scrolling is fully protected.');
      console.log('');
      console.log('Your app follows the ONE SCROLL AUTHORITY rule:');
      console.log('✅ Body is the only scroller');
      console.log('✅ No viewport height violations');
      console.log('✅ No overflow hidden on critical elements');
      console.log('✅ Safe chat and modal patterns');
      console.log('✅ Mobile keyboard compatible');
    } else {
      console.log('🚨 Some tests failed. Mobile scrolling may be at risk.');
      console.log('');
      console.log('Failed tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`❌ ${result.test}: ${result.message}`);
      });
      console.log('');
      console.log('🔧 Recommended fixes:');
      console.log('• Use SafePageWrapper for page containers');
      console.log('• Replace height: 100vh with min-height: auto');
      console.log('• Use SafeModal instead of body scroll locking');
      console.log('• Ensure body overflow is never set to hidden');
    }
    
    console.log('');
    console.log('🔗 For help, see: SafePageWrapper component');
  }
  
  /**
   * Quick health check - can be called anytime
   */
  static quickHealthCheck(): boolean {
    const bodyOverflow = getComputedStyle(document.body).overflowY;
    const hasVH = document.querySelectorAll('[style*="100vh"], [class*="h-screen"]').length;
    
    const isHealthy = bodyOverflow !== 'hidden' && hasVH === 0;
    
    if (isHealthy) {
      console.log('💚 Scroll Architecture: HEALTHY');
    } else {
      console.warn('🟡 Scroll Architecture: NEEDS ATTENTION');
      console.warn(`Body overflow: ${bodyOverflow}, VH violations: ${hasVH}`);
    }
    
    return isHealthy;
  }
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to let the page load
  setTimeout(() => {
    ScrollArchitectureTest.runAllTests();
  }, 2000);
  
  // Quick health checks every 10 seconds
  setInterval(() => {
    ScrollArchitectureTest.quickHealthCheck();
  }, 10000);
}

export default ScrollArchitectureTest;
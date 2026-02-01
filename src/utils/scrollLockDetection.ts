// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * 🧪 SCROLL LOCK DETECTION - Development Only
 * Permanent detection system to catch scroll-breaking code instantly
 */

import { ScrollArchitectureTest } from './scrollArchitectureTest';

export const initScrollLockDetection = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🔒 Global Scroll Architecture - Development Mode Active');
  console.log('   Body is the ONLY scroller on mobile');
  console.log('   Monitoring for scroll lock violations...');
  
  // Run comprehensive tests
  setTimeout(() => {
    console.log('');
    console.log('🧪 Running initial scroll architecture validation...');
    ScrollArchitectureTest.runAllTests();
  }, 1000);
  
  // Monitor body overflow changes
  let lastBodyOverflow = '';
  
  const checkScrollLock = () => {
    const bodyOverflow = getComputedStyle(document.body).overflow;
    const bodyOverflowY = getComputedStyle(document.body).overflowY;
    const htmlOverflow = getComputedStyle(document.documentElement).overflow;
    
    // Alert on body scroll lock
    if (bodyOverflow === 'hidden' || bodyOverflowY === 'hidden') {
      console.warn('⚠️ SCROLL LOCK DETECTED ON BODY');
      console.warn('   This WILL break mobile scrolling');
      console.warn('   Stack trace for debug:', new Error().stack);
    }
    
    // Alert on html scroll lock
    if (htmlOverflow === 'hidden') {
      console.warn('⚠️ SCROLL LOCK DETECTED ON HTML');
      console.warn('   This violates global scroll authority');
    }
    
    // Alert on viewport height usage
    const elementsWithVH = document.querySelectorAll('[style*="100vh"], [class*="h-screen"], [class*="min-h-screen"]');
    if (elementsWithVH.length > 0 && lastBodyOverflow !== bodyOverflow) {
      console.warn(`⚠️ ${elementsWithVH.length} VIEWPORT HEIGHT VIOLATIONS DETECTED`);
      console.warn('   Elements using forbidden height patterns:', elementsWithVH);
    }
    
    lastBodyOverflow = bodyOverflow;
  };
  
  // Check immediately and every 2 seconds
  checkScrollLock();
  setInterval(checkScrollLock, 2000);
  
  // Monitor for dynamic style changes
  const observer = new MutationObserver(() => {
    checkScrollLock();
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  // Console commands for manual testing
  (window as any).scrollDebug = {
    testBodyLock: () => {
      document.// REMOVED: body.style.overflow = "hidden" - violates global scroll architecture;
      console.log('🧪 Testing body lock (should trigger warning)');
      setTimeout(() => {
        document.body.style.overflow = '';
        console.log('🧪 Body lock removed');
      }, 1000);
    },
    
    showScrollState: () => {
      console.log('📊 Current Scroll State:');
      console.log('   Body overflow:', getComputedStyle(document.body).overflow);
      console.log('   Body overflowY:', getComputedStyle(document.body).overflowY);
      console.log('   HTML overflow:', getComputedStyle(document.documentElement).overflow);
      console.log('   VH elements:', document.querySelectorAll('[style*="100vh"], [class*="h-screen"]').length);
    },
    
    enforceRules: () => {
      // Remove all forbidden patterns
      document.querySelectorAll('[style*="100vh"]').forEach(el => {
        (el as HTMLElement).style.height = 'auto';
        console.log('🔧 Fixed 100vh element:', el);
      });
      
      document.querySelectorAll('[class*="h-screen"], [class*="min-h-screen"]').forEach(el => {
        el.classList.remove(...Array.from(el.classList).filter(c => c.includes('h-screen')));
        console.log('🔧 Removed h-screen classes from:', el);
      });
      
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
        console.log('🔧 Restored body scroll');
      }
      
      console.log('✅ Global scroll rules enforced');
    }
  };
  
  console.log('🎮 Debug commands available:');
  console.log('   scrollDebug.testBodyLock() - Test violation detection');
  console.log('   scrollDebug.showScrollState() - Show current state');  
  console.log('   scrollDebug.enforceRules() - Fix violations automatically');
};
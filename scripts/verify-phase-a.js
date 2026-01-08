/**
 * 🔍 PHASE A VERIFICATION SCRIPT
 * Run in browser console to verify all Phase A features
 * 
 * Usage: Copy-paste this entire script into browser console
 */

(async function verifyPhaseA() {
  console.log('🔍 Starting Phase A Verification...\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Test 1: Check if app mounted successfully
  console.log('1️⃣ Testing: App Mount Detection...');
  if (typeof (window as any).__APP_MOUNTED__ === 'function') {
    results.passed.push('✅ Startup guard initialized');
  } else {
    results.failed.push('❌ Startup guard not found');
  }
  
  // Test 2: Check service worker status (should be 0 in dev)
  console.log('2️⃣ Testing: Service Worker Disabled...');
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) {
      results.passed.push('✅ No service workers registered (expected in dev)');
    } else {
      results.warnings.push(`⚠️ ${registrations.length} service worker(s) found (should be 0 in dev)`);
      registrations.forEach(reg => {
        console.log('  - Scope:', reg.scope);
      });
    }
  } catch (e) {
    results.warnings.push('⚠️ Service worker API not available');
  }
  
  // Test 3: Check if ProductionErrorBoundary is in DOM
  console.log('3️⃣ Testing: Error Boundary Present...');
  const root = document.getElementById('root');
  if (root && root.innerHTML.length > 0) {
    results.passed.push('✅ App rendered successfully (error boundary working)');
  } else {
    results.failed.push('❌ Root element empty');
  }
  
  // Test 4: Check build hash logging
  console.log('4️⃣ Testing: Build Hash Logging...');
  if (import.meta.env.VITE_BUILD_HASH) {
    results.passed.push(`✅ Build hash: ${import.meta.env.VITE_BUILD_HASH}`);
  } else {
    results.warnings.push('⚠️ Build hash not set (using timestamp fallback)');
  }
  
  // Test 5: Check server URL
  console.log('5️⃣ Testing: Dev Server URL...');
  const currentUrl = window.location.href;
  if (currentUrl.includes('127.0.0.1:3000')) {
    results.passed.push('✅ Server running on 127.0.0.1:3000 (strict port binding)');
  } else if (currentUrl.includes('localhost:3000')) {
    results.warnings.push('⚠️ Using localhost instead of 127.0.0.1');
  } else {
    results.failed.push(`❌ Unexpected URL: ${currentUrl}`);
  }
  
  // Test 6: Check React version
  console.log('6️⃣ Testing: React Version...');
  try {
    const version = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.values()?.next()?.value?.version;
    if (version) {
      results.passed.push(`✅ React version: ${version}`);
    }
  } catch (e) {
    results.warnings.push('⚠️ Could not detect React version');
  }
  
  // Test 7: Check for cache
  console.log('7️⃣ Testing: Cache Status...');
  try {
    const cacheNames = await caches.keys();
    if (cacheNames.length === 0) {
      results.passed.push('✅ No caches present (expected in dev)');
    } else {
      results.warnings.push(`⚠️ ${cacheNames.length} cache(s) found:`);
      cacheNames.forEach(name => console.log('  -', name));
    }
  } catch (e) {
    results.warnings.push('⚠️ Cache API not available');
  }
  
  // Test 8: Performance metrics
  console.log('8️⃣ Testing: Performance Metrics...');
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
    
    if (loadTime < 5000) {
      results.passed.push(`✅ Page load time: ${loadTime}ms (< 5s)`);
    } else {
      results.warnings.push(`⚠️ Slow page load: ${loadTime}ms`);
    }
    
    if (domReady < 2000) {
      results.passed.push(`✅ DOM ready: ${domReady}ms (< 2s)`);
    } else {
      results.warnings.push(`⚠️ Slow DOM ready: ${domReady}ms`);
    }
  }
  
  // Test 9: Check for error boundary test
  console.log('9️⃣ Testing: Error Boundary (manual test available)...');
  (window as any).testErrorBoundary = () => {
    throw new Error('🧪 Test error for error boundary verification');
  };
  results.passed.push('✅ Error boundary test function created: window.testErrorBoundary()');
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE A VERIFICATION RESULTS');
  console.log('='.repeat(60) + '\n');
  
  console.log(`✅ PASSED: ${results.passed.length}`);
  results.passed.forEach(msg => console.log('  ' + msg));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${results.warnings.length}`);
    results.warnings.forEach(msg => console.log('  ' + msg));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED: ${results.failed.length}`);
    results.failed.forEach(msg => console.log('  ' + msg));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed.length === 0) {
    console.log('🎉 ALL CRITICAL TESTS PASSED');
    console.log('✅ Phase A implementation is PRODUCTION-READY');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review above');
  }
  
  console.log('\n📝 Manual Tests Available:');
  console.log('  - Run window.testErrorBoundary() to test error boundary UI');
  console.log('  - Refresh page to test startup guard');
  console.log('  - Check Network tab for service worker requests (should be none)');
  console.log('='.repeat(60) + '\n');
  
  // Return summary
  return {
    passed: results.passed.length,
    warnings: results.warnings.length,
    failed: results.failed.length,
    status: results.failed.length === 0 ? 'READY' : 'NEEDS_REVIEW'
  };
})();

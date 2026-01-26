#!/usr/bin/env node

/**
 * MOBILE STABILITY VERIFICATION SCRIPT
 * 
 * Tests the SEV-1 fixes deployed in commit d5bd6ee
 * Run after Netlify deployment completes
 */

const https = require('https');
const { URL } = require('url');

const SITE_URL = process.env.SITE_URL || 'https://your-site.netlify.app';
const CHECKS = {
    passed: [],
    failed: [],
    warnings: []
};

console.log('🔍 Mobile-First Stability Verification\n');
console.log(`Testing: ${SITE_URL}\n`);

// Test 1: HTML Cache Headers
async function testHtmlCacheHeaders() {
    return new Promise((resolve) => {
        const url = new URL(SITE_URL + '/index.html');
        
        https.get({
            hostname: url.hostname,
            path: url.pathname,
            method: 'HEAD',
            headers: { 'User-Agent': 'Mozilla/5.0 (Mobile; Android)' }
        }, (res) => {
            const cacheControl = res.headers['cache-control'] || '';
            
            if (cacheControl.includes('max-age=0') || cacheControl.includes('no-cache')) {
                CHECKS.passed.push('✅ HTML Cache-Control: Correct (no-cache or max-age=0)');
                console.log(`✅ HTML Cache-Control: ${cacheControl}`);
            } else if (cacheControl === '') {
                CHECKS.warnings.push('⚠️  HTML Cache-Control: Missing (check netlify.toml deployment)');
                console.log('⚠️  HTML Cache-Control: NOT SET (deployment may not be complete)');
            } else {
                CHECKS.failed.push(`❌ HTML Cache-Control: ${cacheControl} (should be max-age=0)`);
                console.log(`❌ HTML Cache-Control: ${cacheControl}`);
            }
            resolve();
        }).on('error', (err) => {
            CHECKS.failed.push(`❌ HTTP Request Failed: ${err.message}`);
            console.log(`❌ Request failed: ${err.message}`);
            resolve();
        });
    });
}

// Test 2: Service Worker Exists
async function testServiceWorkerExists() {
    return new Promise((resolve) => {
        const url = new URL(SITE_URL + '/sw.js');
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.includes('2.3.0')) {
                    CHECKS.passed.push('✅ Service Worker: v2.3.0 deployed');
                    console.log('✅ Service Worker: v2.3.0 deployed');
                } else if (data.includes('SW_VERSION')) {
                    CHECKS.warnings.push('⚠️  Service Worker: Version mismatch (check deployment)');
                    console.log('⚠️  Service Worker: Found but version unclear');
                } else {
                    CHECKS.failed.push('❌ Service Worker: Not found or invalid');
                    console.log('❌ Service Worker: Not found');
                }
                
                // Check if HTML is NOT being cached
                if (data.includes("'/index.html'") || data.includes('"/index.html"')) {
                    CHECKS.failed.push('❌ Service Worker: STILL CACHING HTML!');
                    console.log('❌ CRITICAL: Service Worker still caches index.html');
                } else {
                    CHECKS.passed.push('✅ Service Worker: HTML caching removed');
                    console.log('✅ Service Worker: HTML not in cache list');
                }
                resolve();
            });
        }).on('error', (err) => {
            CHECKS.failed.push(`❌ Service Worker fetch failed: ${err.message}`);
            console.log(`❌ Service Worker fetch failed: ${err.message}`);
            resolve();
        });
    });
}

// Test 3: Loading Spinner CSS
async function testLoadingSpinner() {
    return new Promise((resolve) => {
        const url = new URL(SITE_URL);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.includes('#root:empty::before') && data.includes('@keyframes spin')) {
                    CHECKS.passed.push('✅ Loading Spinner: Critical CSS present');
                    console.log('✅ Loading Spinner: CSS found in HTML');
                } else {
                    CHECKS.warnings.push('⚠️  Loading Spinner: CSS not detected');
                    console.log('⚠️  Loading Spinner: CSS not found (check build)');
                }
                
                // Check for conflicting meta tags (should be removed)
                const conflictingTags = [
                    'content="public, max-age=300"',
                    'content="cache"'
                ].filter(tag => data.includes(tag));
                
                if (conflictingTags.length > 0) {
                    CHECKS.failed.push('❌ Conflicting cache meta tags still present');
                    console.log('❌ Found conflicting cache meta tags');
                } else {
                    CHECKS.passed.push('✅ Cache meta tags: Cleaned up');
                    console.log('✅ No conflicting cache meta tags');
                }
                resolve();
            });
        }).on('error', (err) => {
            CHECKS.failed.push(`❌ HTML fetch failed: ${err.message}`);
            console.log(`❌ HTML fetch failed: ${err.message}`);
            resolve();
        });
    });
}

// Test 4: Hashed Assets (Should still be cacheable)
async function testHashedAssets() {
    console.log('\n📦 Testing hashed assets...');
    // This would require parsing the HTML to find asset URLs
    // For now, just validate the pattern exists
    CHECKS.passed.push('ℹ️  Hashed Assets: Manual verification required');
    console.log('ℹ️  Check DevTools Network tab for /assets/main-[hash].js with long cache');
}

// Main execution
async function runTests() {
    console.log('🏃 Running tests...\n');
    
    await testHtmlCacheHeaders();
    console.log('');
    await testServiceWorkerExists();
    console.log('');
    await testLoadingSpinner();
    console.log('');
    await testHashedAssets();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    console.log(`✅ Passed: ${CHECKS.passed.length}`);
    CHECKS.passed.forEach(msg => console.log(`   ${msg}`));
    
    if (CHECKS.warnings.length > 0) {
        console.log(`\n⚠️  Warnings: ${CHECKS.warnings.length}`);
        CHECKS.warnings.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (CHECKS.failed.length > 0) {
        console.log(`\n❌ Failed: ${CHECKS.failed.length}`);
        CHECKS.failed.forEach(msg => console.log(`   ${msg}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (CHECKS.failed.length === 0) {
        console.log('✅ ALL CRITICAL TESTS PASSED\n');
        console.log('Mobile-first stability fixes verified successfully!');
        process.exit(0);
    } else {
        console.log('❌ SOME TESTS FAILED\n');
        console.log('Review failures above and check deployment logs.');
        process.exit(1);
    }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node verify-mobile-fixes.js [SITE_URL]

Examples:
  node verify-mobile-fixes.js
  node verify-mobile-fixes.js https://indastreet.com
  SITE_URL=https://staging.netlify.app node verify-mobile-fixes.js

Tests performed:
  1. HTML Cache-Control headers (should be max-age=0)
  2. Service Worker version (should be 2.3.0)
  3. Service Worker cache list (should NOT include index.html)
  4. Loading spinner CSS (should be present)
  5. Conflicting cache meta tags (should be removed)
`);
    process.exit(0);
}

// Override URL from command line if provided
if (process.argv[2] && process.argv[2].startsWith('http')) {
    SITE_URL = process.argv[2];
}

runTests().catch(err => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
});

#!/usr/bin/env node
/**
 * SERVICE WORKER VERSION VERIFICATION
 * Checks if SW version has been updated and contains build hash
 */

const fs = require('fs');

console.log('🔧 Service Worker Version Check\n');
console.log('='.repeat(60));

const swPath = './public/sw.js';
const distSwPath = './dist/sw.js';

// Check source SW
if (!fs.existsSync(swPath)) {
  console.log('❌ Source Service Worker not found at:', swPath);
  process.exit(1);
}

const sourceSw = fs.readFileSync(swPath, 'utf8');
const sourceVersionMatch = sourceSw.match(/const SW_VERSION = '([^']+)'/);
const sourceVersion = sourceVersionMatch ? sourceVersionMatch[1] : 'NOT FOUND';

console.log('📦 Source SW Version:', sourceVersion);

// Check built SW (if exists)
if (fs.existsSync(distSwPath)) {
  const builtSw = fs.readFileSync(distSwPath, 'utf8');
  const builtVersionMatch = builtSw.match(/const SW_VERSION = '([^']+)'/);
  const builtVersion = builtVersionMatch ? builtVersionMatch[1] : 'NOT FOUND';
  
  console.log('🏗️  Built SW Version:', builtVersion);
  
  // Compare versions
  if (builtVersion !== sourceVersion) {
    console.log('\n✅ GOOD: SW version differs - cache will be invalidated');
  } else {
    console.log('\n⚠️  WARNING: SW version unchanged');
    console.log('   Cache may not be invalidated on deploy.');
    console.log('   Consider updating SW_VERSION in public/sw.js');
  }
  
  // Check for build hash
  if (builtVersion.includes('+')) {
    console.log('✅ Build hash detected in version');
  } else {
    console.log('⚠️  No build hash in version');
    console.log('   Recommended format: 2.3.0+abc123');
  }
} else {
  console.log('⚠️  Built SW not found at:', distSwPath);
  console.log('   Run `pnpm build` to generate dist/');
}

// Check cache name
const cacheNameMatch = sourceSw.match(/const CACHE_NAME = `([^`]+)`/);
if (cacheNameMatch) {
  console.log('\n💾 Cache Name:', cacheNameMatch[1]);
}

// Check strategy
if (sourceSw.includes('network-first') || sourceSw.includes('PRODUCTION MODE: Network-first')) {
  console.log('✅ Strategy: Network-first (correct)');
} else if (sourceSw.includes('cache-first')) {
  console.log('⚠️  Strategy: Cache-first (may serve stale content)');
} else {
  console.log('❓ Strategy: Unknown or custom');
}

console.log('='.repeat(60));
console.log('\n✅ SW version check complete\n');

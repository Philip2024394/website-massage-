#!/usr/bin/env node
/**
 * BUILD VERIFICATION SCRIPT
 * Ensures production build meets quality standards before deployment
 * 
 * Checks:
 * 1. dist/ folder exists
 * 2. index.html generated
 * 3. Hashed JS files present (cache-busting)
 * 4. Service Worker version valid
 * 5. Critical CSS present
 * 6. No development URLs in production
 * 7. TypeScript compilation successful
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting build verification...\n');

let errors = [];
let warnings = [];

// 1. Check dist/ exists
console.log('📁 Checking dist/ folder...');
if (!fs.existsSync('./dist')) {
  errors.push('dist/ folder not found! Run `pnpm build` first.');
} else {
  console.log('✅ dist/ folder exists');
}

// 2. Check index.html exists
console.log('\n📄 Checking index.html...');
const indexPath = './dist/index.html';
if (!fs.existsSync(indexPath)) {
  errors.push('dist/index.html not found!');
} else {
  console.log('✅ index.html generated');
  
  // Read index.html for further checks
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // 5. Check critical CSS present
  console.log('\n🎨 Checking critical CSS...');
  if (!indexContent.includes('#root:empty::before')) {
    warnings.push('Critical CSS loading spinner missing! Users may see blank screens on slow connections.');
  } else {
    console.log('✅ Critical CSS present');
  }
  
  // 6. Check no development URLs
  console.log('\n🔒 Checking for development URLs...');
  const devUrls = ['localhost', '127.0.0.1', 'http://localhost', 'http://127.0.0.1'];
  const foundDevUrls = devUrls.filter(url => indexContent.includes(url));
  if (foundDevUrls.length > 0) {
    errors.push(`Development URLs found in production build: ${foundDevUrls.join(', ')}`);
  } else {
    console.log('✅ No development URLs found');
  }
}

// 3. Check for hashed JS files (cache-busting)
console.log('\n🔥 Checking cache-busting (hashed files)...');
const assetsDir = './dist/assets';
if (!fs.existsSync(assetsDir)) {
  errors.push('dist/assets/ folder not found!');
} else {
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  const hashedFiles = jsFiles.filter(f => /\.[a-f0-9]{8}\.js$/.test(f));
  
  if (hashedFiles.length === 0) {
    errors.push('No hashed JS files found! Cache-busting may not work correctly.');
  } else {
    console.log(`✅ Found ${hashedFiles.length} hashed JS files`);
    console.log(`   Sample: ${hashedFiles[0]}`);
  }
  
  // Check CSS files too
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
  const hashedCss = cssFiles.filter(f => /\.[a-f0-9]{8}\.css$/.test(f));
  if (hashedCss.length > 0) {
    console.log(`✅ Found ${hashedCss.length} hashed CSS files`);
  }
}

// 4. Check Service Worker version
console.log('\n🔧 Checking Service Worker...');
const swPath = './dist/sw.js';
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  const versionMatch = swContent.match(/const SW_VERSION = '([^']+)'/);
  
  if (versionMatch) {
    const version = versionMatch[1];
    console.log(`✅ SW Version: ${version}`);
    
    // Check if contains build hash (format: 2.3.0+hash)
    if (!version.includes('+') && !version.includes('-')) {
      warnings.push('SW version does not contain build hash! Cache may not be properly invalidated on new deploys.');
    }
  } else {
    warnings.push('Could not detect SW version!');
  }
  
  // Check if SW is properly configured
  if (!swContent.includes('network-first') && !swContent.includes('PRODUCTION MODE')) {
    warnings.push('SW may not be using network-first strategy!');
  }
} else {
  warnings.push('Service Worker (sw.js) not found in dist/');
}

// 7. Check TypeScript compilation (if tsc is available)
console.log('\n📘 Checking TypeScript...');
try {
  const { execSync } = require('child_process');
  execSync('pnpm tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  errors.push('TypeScript compilation failed! Run `pnpm tsc --noEmit` for details.');
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 BUILD VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('📦 Build is ready for production deployment.\n');
  process.exit(0);
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning}`);
  });
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });
  console.log('\n❌ Build verification FAILED!');
  console.log('Fix the errors above before deploying.\n');
  process.exit(1);
}

if (warnings.length > 0 && errors.length === 0) {
  console.log('\n⚠️  Build passed with warnings.');
  console.log('Consider addressing warnings before production deploy.\n');
  process.exit(0);
}

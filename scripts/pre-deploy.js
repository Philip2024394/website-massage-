#!/usr/bin/env node
/**
 * PRE-DEPLOYMENT VERIFICATION SUITE
 * Runs all critical checks before production deploy
 * 
 * Exit codes:
 * 0 = All checks passed, safe to deploy
 * 1 = Critical checks failed, DO NOT deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('\n🚀 PRE-DEPLOYMENT VERIFICATION SUITE');
console.log('='.repeat(70));
console.log('Running comprehensive checks before production deploy...\n');

const checks = [
  {
    name: 'TypeScript Compilation',
    cmd: 'pnpm tsc --noEmit',
    critical: true,
    description: 'Ensures no type errors in codebase'
  },
  {
    name: 'Build Generation',
    cmd: 'pnpm build',
    critical: true,
    description: 'Generates production build in dist/'
  },
  {
    name: 'Build Verification',
    cmd: 'node scripts/verify-build.js',
    critical: true,
    description: 'Validates build output quality'
  },
  {
    name: 'Service Worker Version',
    cmd: 'node scripts/verify-sw-version.js',
    critical: false,
    description: 'Checks SW version for cache invalidation'
  }
];

let passed = 0;
let failed = 0;
let warnings = 0;

for (const check of checks) {
  console.log(`\n${'▶'.repeat(3)} ${check.name}`);
  console.log(`   ${check.description}`);
  console.log(`   Command: ${check.cmd}`);
  
  try {
    const output = execSync(check.cmd, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ PASSED');
    
    // Show output if it contains warnings or important info
    if (output.includes('⚠️') || output.includes('WARNING')) {
      console.log('\n   Output:');
      console.log(output.split('\n').map(line => '   ' + line).join('\n'));
      warnings++;
    }
    
    passed++;
  } catch (error) {
    if (check.critical) {
      console.log('❌ FAILED (CRITICAL)');
      console.log('\n   Error output:');
      console.log(error.stdout || error.message);
      failed++;
    } else {
      console.log('⚠️  FAILED (Non-critical)');
      console.log('\n   Warning output:');
      console.log(error.stdout || error.message);
      warnings++;
    }
  }
}

// Print final summary
console.log('\n' + '='.repeat(70));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log(`✅ Passed: ${passed}/${checks.length}`);
console.log(`❌ Failed: ${failed}/${checks.length}`);
console.log(`⚠️  Warnings: ${warnings}`);

if (failed > 0) {
  console.log('\n❌ PRE-DEPLOYMENT CHECKS FAILED!');
  console.log('🚫 DO NOT DEPLOY TO PRODUCTION');
  console.log('Fix the critical errors above before deploying.\n');
  process.exit(1);
}

if (warnings > 0) {
  console.log('\n⚠️  All critical checks passed with warnings.');
  console.log('📦 Safe to deploy, but consider addressing warnings.\n');
}

if (failed === 0 && warnings === 0) {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('🚀 Ready for production deployment.');
  console.log('📦 Run: git push origin main\n');
}

process.exit(0);

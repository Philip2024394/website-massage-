#!/usr/bin/env node

/**
 * 🔍 THERAPIST SIDEBAR NAVIGATION VERIFICATION
 * 
 * Verifies all 15 sidebar menu items are properly connected to their pages:
 * 1. Menu item exists in TherapistLayout.tsx
 * 2. Navigation handler exists in TherapistDashboard.tsx
 * 3. Route case exists in AppRouter.tsx
 * 4. Component page file exists
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const MENU_ITEMS = [
  { 
    id: 'status', 
    handler: 'onNavigateToStatus', 
    routeCase: 'therapist-status',
    componentFile: 'src/pages/therapist/TherapistOnlineStatusPage.tsx'
  },
  { 
    id: 'therapist-how-it-works', 
    handler: 'onNavigateToHowItWorks', 
    routeCase: 'therapist-how-it-works',
    componentFile: 'src/pages/therapist/HowItWorksPage.tsx'
  },
  { 
    id: 'dashboard', 
    handler: 'SELF', // Dashboard stays on same page
    routeCase: 'dashboard',
    componentFile: 'src/pages/therapist/TherapistDashboard.tsx'
  },
  { 
    id: 'bookings', 
    handler: 'onNavigateToBookings', 
    routeCase: 'therapist-bookings',
    componentFile: 'src/pages/therapist/TherapistBookingsPage.tsx'
  },
  { 
    id: 'customers', 
    handler: 'onNavigate', 
    routeCase: 'customers',
    componentFile: 'src/pages/therapist/TherapistCustomersPage.tsx'
  },
  { 
    id: 'send-discount', 
    handler: 'onNavigate', 
    routeCase: 'send-discount',
    componentFile: 'src/pages/therapist/SendDiscountPage.tsx'
  },
  { 
    id: 'earnings', 
    handler: 'onNavigateToEarnings', 
    routeCase: 'therapist-earnings',
    componentFile: 'src/pages/therapist/TherapistEarningsPage.tsx'
  },
  { 
    id: 'payment', 
    handler: 'onNavigateToPayment', 
    routeCase: 'therapist-payment',
    componentFile: 'src/pages/therapist/TherapistPaymentInfoPage.tsx'
  },
  { 
    id: 'payment-status', 
    handler: 'onNavigateToPaymentStatus', 
    routeCase: 'therapist-payment-status',
    componentFile: 'src/pages/therapist/TherapistPaymentStatusPage.tsx'
  },
  { 
    id: 'commission-payment', 
    handler: 'onNavigateToCommission', 
    routeCase: 'therapist-commission',
    componentFile: 'src/pages/therapist/CommissionPayment.tsx'
  },
  { 
    id: 'custom-menu', 
    handler: 'onNavigateToMenu', 
    routeCase: 'therapist-menu',
    componentFile: 'src/pages/therapist/TherapistMenuPage.tsx'
  },
  { 
    id: 'analytics', 
    handler: 'onNavigate', 
    routeCase: 'analytics',
    componentFile: 'src/pages/therapist/TherapistAnalyticsPage.tsx'
  },
  { 
    id: 'therapist-hotel-villa-safe-pass', 
    handler: 'onNavigate', 
    routeCase: 'therapist-hotel-villa-safe-pass',
    componentFile: 'src/pages/therapist/TherapistHotelVillaSafePassPage.tsx'
  },
  { 
    id: 'notifications', 
    handler: 'onNavigateToNotifications', 
    routeCase: 'therapist-notifications',
    componentFile: 'src/pages/therapist/TherapistNotificationsPage.tsx'
  },
  { 
    id: 'legal', 
    handler: 'onNavigateToLegal', 
    routeCase: 'therapist-legal',
    componentFile: 'src/pages/therapist/TherapistLegalPage.tsx'
  }
];

// ============================================================================
// VERIFICATION LOGIC
// ============================================================================

let passedTests = 0;
let totalTests = 0;
let failures = [];

console.log('\n🔍 THERAPIST SIDEBAR NAVIGATION VERIFICATION');
console.log('═══════════════════════════════════════════════════════════\n');

// Read source files
const layoutFile = fs.readFileSync('src/components/therapist/TherapistLayout.tsx', 'utf8');
const dashboardFile = fs.readFileSync('src/pages/therapist/TherapistDashboard.tsx', 'utf8');
const routerFile = fs.readFileSync('src/AppRouter.tsx', 'utf8');

MENU_ITEMS.forEach((item, index) => {
  console.log(`\n📋 [${index + 1}/15] Testing: ${item.id}`);
  console.log('─────────────────────────────────────────────────────');
  
  let itemPassed = true;
  
  // Test 1: Menu item exists in TherapistLayout
  totalTests++;
  const menuItemRegex = new RegExp(`{\\s*id:\\s*['"]${item.id}['"]`, 'g');
  if (menuItemRegex.test(layoutFile)) {
    console.log('  ✅ Menu item defined in TherapistLayout.tsx');
    passedTests++;
  } else {
    console.log('  ❌ Menu item NOT found in TherapistLayout.tsx');
    failures.push(`${item.id}: Missing menu item definition`);
    itemPassed = false;
  }
  
  // Test 2: Navigation handler exists in TherapistDashboard
  totalTests++;
  const handlerRegex = new RegExp(`case\\s+['"]${item.id}['"]`, 'g');
  if (handlerRegex.test(dashboardFile)) {
    console.log('  ✅ Navigation handler exists in TherapistDashboard.tsx');
    passedTests++;
  } else {
    console.log('  ❌ Navigation handler NOT found in TherapistDashboard.tsx');
    failures.push(`${item.id}: Missing navigation handler`);
    itemPassed = false;
  }
  
  // Test 3: Route case exists in AppRouter
  totalTests++;
  const routeRegex = new RegExp(`case\\s+['"]${item.routeCase}['"]`, 'g');
  if (routeRegex.test(routerFile)) {
    console.log(`  ✅ Route case '${item.routeCase}' exists in AppRouter.tsx`);
    passedTests++;
  } else {
    console.log(`  ❌ Route case '${item.routeCase}' NOT found in AppRouter.tsx`);
    failures.push(`${item.id}: Missing route case '${item.routeCase}'`);
    itemPassed = false;
  }
  
  // Test 4: Component file exists
  totalTests++;
  const componentPath = path.resolve(item.componentFile);
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ Component file exists: ${item.componentFile}`);
    passedTests++;
  } else {
    console.log(`  ❌ Component file NOT found: ${item.componentFile}`);
    failures.push(`${item.id}: Missing component file`);
    itemPassed = false;
  }
  
  if (itemPassed) {
    console.log('  🎯 Status: FULLY CONNECTED ✅');
  } else {
    console.log('  ⚠️  Status: CONNECTION ISSUES ❌');
  }
});

// ============================================================================
// FINAL REPORT
// ============================================================================

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('📊 FINAL VERIFICATION REPORT');
console.log('═══════════════════════════════════════════════════════════\n');

const score = Math.round((passedTests / totalTests) * 100);

console.log(`🎯 Overall Score: ${passedTests}/${totalTests} tests passed (${score}%)\n`);

if (failures.length === 0) {
  console.log('✅ PERFECT! All sidebar menu items are properly connected!\n');
  console.log('🎉 Navigation System Status:');
  console.log('   • All 15 menu items defined');
  console.log('   • All navigation handlers implemented');
  console.log('   • All route cases configured');
  console.log('   • All component files exist');
  console.log('\n✨ Therapist dashboard navigation is production-ready!\n');
  process.exit(0);
} else {
  console.log('⚠️  Issues Found:\n');
  failures.forEach((failure, i) => {
    console.log(`   ${i + 1}. ${failure}`);
  });
  console.log('\n💡 Fix these issues to complete the navigation system.\n');
  process.exit(1);
}

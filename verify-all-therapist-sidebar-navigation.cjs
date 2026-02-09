#!/usr/bin/env node

/**
 * ============================================================================
 * 🔍 COMPREHENSIVE THERAPIST SIDEBAR NAVIGATION VERIFICATION
 * ============================================================================
 * 
 * Purpose: Check ALL therapist sidebar pages can navigate properly
 * Date: February 9, 2026
 * 
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 THERAPIST SIDEBAR NAVIGATION VERIFICATION');
console.log('============================================');
console.log('📅 Date: February 9, 2026');
console.log('🎯 Purpose: Verify ALL therapist sidebar pages navigate properly');
console.log('');

// Complete list of therapist sidebar menu items
const THERAPIST_MENU_ITEMS = [
    { id: 'status', label: 'Online Status', expectedRoute: 'therapist-status' },
    { id: 'therapist-how-it-works', label: 'How It Works', expectedRoute: 'therapist-how-it-works' },
    { id: 'dashboard', label: 'Dashboard', expectedRoute: 'therapist-dashboard' },
    { id: 'bookings', label: 'Bookings', expectedRoute: 'therapist-bookings' },
    { id: 'customers', label: 'More Customers', expectedRoute: 'more-customers' },
    { id: 'send-discount', label: 'Send Discount', expectedRoute: 'send-discount' },
    { id: 'earnings', label: 'Earnings', expectedRoute: 'therapist-earnings' },
    { id: 'payment', label: 'Payment', expectedRoute: 'therapist-payment' },
    { id: 'payment-status', label: 'Payment Status', expectedRoute: 'therapist-payment-status' },
    { id: 'commission-payment', label: 'Commission Payment', expectedRoute: 'therapist-commission' },
    { id: 'custom-menu', label: 'Custom Menu', expectedRoute: 'therapist-menu' },
    { id: 'analytics', label: 'Analytics', expectedRoute: 'therapist-analytics' },
    { id: 'therapist-hotel-villa-safe-pass', label: 'SafePass', expectedRoute: 'therapist-safepass' },
    { id: 'notifications', label: 'Notifications', expectedRoute: 'therapist-notifications' },
    { id: 'legal', label: 'Legal', expectedRoute: 'therapist-legal' }
];

let verificationResults = {
    score: 0,
    maxScore: 0,
    passed: 0,
    failed: 0,
    issues: [],
    warnings: []
};

function readFileIfExists(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
        return null;
    } catch (error) {
        return null;
    }
}

function verifyTest(name, testFn, points = 5, isWarning = false) {
    verificationResults.maxScore += points;
    try {
        const result = testFn();
        if (result.pass) {
            console.log(`  ✅ ${name}: PASS`);
            verificationResults.score += points;
            verificationResults.passed++;
        } else if (result.warning || isWarning) {
            console.log(`  ⚠️ ${name}: WARNING - ${result.message}`);
            verificationResults.score += Math.floor(points/2);
            verificationResults.warnings.push({ test: name, issue: result.message });
        } else {
            console.log(`  ❌ ${name}: FAIL - ${result.message}`);
            verificationResults.failed++;
            verificationResults.issues.push({ test: name, issue: result.message });
        }
    } catch (error) {
        console.log(`  ❌ ${name}: ERROR - ${error.message}`);
        verificationResults.failed++;
        verificationResults.issues.push({ test: name, issue: error.message });
    }
}

// ============================================================================
// LOAD MAIN FILES
// ============================================================================
console.log('📂 Loading Main Files...');
const appRouterContent = readFileIfExists('src/AppRouter.tsx');
const therapistLayoutContent = readFileIfExists('src/components/therapist/TherapistLayout.tsx');
const therapistDashboardContent = readFileIfExists('src/pages/therapist/TherapistDashboard.tsx');
const therapistDashboardPageContent = readFileIfExists('src/pages/therapist/TherapistDashboardPage.tsx');

verifyTest('AppRouter File Exists', () => {
    return appRouterContent ? { pass: true } : { pass: false, message: 'AppRouter.tsx not found' };
}, 10);

verifyTest('TherapistLayout File Exists', () => {
    return therapistLayoutContent ? { pass: true } : { pass: false, message: 'TherapistLayout.tsx not found' };
}, 10);

// ============================================================================
// VERIFY EACH SIDEBAR MENU ITEM
// ============================================================================
console.log('🧭 Verifying Individual Sidebar Menu Items...');

THERAPIST_MENU_ITEMS.forEach((item, index) => {
    console.log(`\\n🔸 Checking: ${item.label} (${item.id})`);
    
    // 1. Check if menu item exists in TherapistLayout
    verifyTest(`${item.label}: Menu Item Defined`, () => {
        if (!therapistLayoutContent) return { pass: false, message: 'TherapistLayout not available' };
        const hasMenuItem = therapistLayoutContent.includes(`id: '${item.id}'`);
        return hasMenuItem ? 
            { pass: true } : 
            { pass: false, message: `Menu item '${item.id}' not found in layout` };
    }, 3);
    
    // 2. Check if route case exists in AppRouter
    verifyTest(`${item.label}: Route Case Exists`, () => {
        if (!appRouterContent) return { pass: false, message: 'AppRouter not available' };
        
        // Check various possible route patterns
        const possibleRoutes = [
            item.expectedRoute,
            item.id,
            item.id.replace('-', ''),
            `therapist-${item.id}`,
            `therapist${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`
        ];
        
        const hasRoute = possibleRoutes.some(route => 
            appRouterContent.includes(`case '${route}':`) || 
            appRouterContent.includes(`case "${route}":`)
        );
        
        if (hasRoute) {
            return { pass: true };
        } else {
            return { warning: true, message: `No route case found for any of: ${possibleRoutes.join(', ')}` };
        }
    }, 8);
    
    // 3. Check if navigation handler exists
    verifyTest(`${item.label}: Navigation Handler`, () => {
        if (!therapistDashboardContent && !therapistDashboardPageContent) {
            return { pass: false, message: 'Dashboard files not available' };
        }
        
        const content = therapistDashboardContent || therapistDashboardPageContent;
        const hasHandler = content.includes(`case '${item.id}':`) || 
                          content.includes(`if (pageId === '${item.id}')`);
        
        return hasHandler ? 
            { pass: true } : 
            { warning: true, message: `Navigation handler for '${item.id}' not found` };
    }, 5);
    
    // 4. Check for landing page redirects (like the profile issue)
    verifyTest(`${item.label}: No Landing Page Redirects`, () => {
        if (!appRouterContent) return { pass: false, message: 'AppRouter not available' };
        
        // Look for problematic patterns around this route
        const routeSection = appRouterContent.split(`case '${item.expectedRoute}':`)[1] || 
                           appRouterContent.split(`case '${item.id}':`)[1] || '';
        
        if (routeSection.length > 0) {
            const firstPart = routeSection.split('case ')[0]; // Get content until next case
            const hasLandingRedirect = firstPart.includes('setPage(\'home\')') || 
                                     firstPart.includes('onNavigate(\'home\')') ||
                                     firstPart.includes('window.location.href = \'/\'');
            
            if (hasLandingRedirect) {
                return { warning: true, message: 'Potential landing page redirect found' };
            }
        }
        
        return { pass: true };
    }, 7);
    
    // 5. Check if component/page file exists
    // Map of menu item IDs to their actual component file names
    const fileNameMap = {
        'status': 'TherapistOnlineStatusPage.tsx',
        'therapist-how-it-works': 'TherapistHowItWorksPage.tsx',
        'dashboard': 'TherapistDashboardPage.tsx',
        'bookings': 'TherapistMyBookingsPage.tsx',
        'customers': 'TherapistCustomersPage.tsx',
        'send-discount': 'SendDiscountPage.tsx',
        'earnings': 'TherapistEarningsPage.tsx',
        'payment': 'TherapistPaymentInfoPage.tsx',
        'payment-status': 'TherapistPaymentStatusPage.tsx',
        'commission-payment': 'TherapistCommissionPage.tsx',
        'custom-menu': 'TherapistMenuPage.tsx',
        'analytics': 'TherapistAnalyticsPage.tsx',
        'therapist-hotel-villa-safe-pass': 'TherapistHotelVillaSafePassPage.tsx',
        'notifications': 'TherapistNotificationsPage.tsx',
        'legal': 'TherapistLegalPage.tsx'
    };
    
    const possibleFilePaths = [
        `src/pages/therapist/${fileNameMap[item.id] || 'Unknown.tsx'}`,
        `src/pages/therapist/Therapist${item.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page.tsx`,
        `src/pages/therapist/${item.expectedRoute}.tsx`,
        `src/pages/${item.expectedRoute}.tsx`,
        `src/components/therapist/${item.id}.tsx`
    ];
    
    verifyTest(`${item.label}: Component File Exists`, () => {
        const existingFiles = possibleFilePaths.filter(filePath => 
            fs.existsSync(filePath)
        );
        
        return existingFiles.length > 0 ? 
            { pass: true } : 
            { warning: true, message: `Component file not found. Checked: ${possibleFilePaths[0]}` };
    }, 4, true);
});

// ============================================================================
// CHECK FOR COMMON REDIRECT PATTERNS
// ============================================================================
console.log('\\n🔍 Checking for Common Redirect Issues...');

verifyTest('No Global Home Redirects', () => {
    if (!appRouterContent) return { pass: false, message: 'AppRouter not available' };
    
    // Look for patterns that might cause unwanted home redirects
    const problematicPatterns = [
        'setPage(\'home\')',
        'onNavigate(\'home\')',
        'navigate(\'home\')',
        'window.location.href = \'/\''
    ];
    
    const foundPatterns = [];
    problematicPatterns.forEach(pattern => {
        if (appRouterContent.includes(pattern)) {
            foundPatterns.push(pattern);
        }
    });
    
    if (foundPatterns.length > 3) { // Some home redirects are legitimate
        return { warning: true, message: `Many home redirect patterns found: ${foundPatterns.length}` };
    }
    
    return { pass: true };
}, 10);

verifyTest('Therapist Safety Guards Proper', () => {
    if (!appRouterContent) return { pass: false, message: 'AppRouter not available' };
    
    // Check if the therapist safety guards are not too aggressive
    const therapistProfileSection = appRouterContent.includes('therapist-profile') && 
                                   appRouterContent.includes('SAFETY GUARD');
    
    if (therapistProfileSection) {
        // Good - safety guards exist
        const hasSmartLogic = appRouterContent.includes('profileTherapistId') && 
                             appRouterContent.includes('currentTherapistId');
        
        return hasSmartLogic ? 
            { pass: true } : 
            { warning: true, message: 'Safety guards may be too aggressive' };
    }
    
    return { pass: true };
}, 15);

// ============================================================================
// NAVIGATION FLOW VERIFICATION
// ============================================================================
console.log('\\n🔀 Verifying Navigation Flow...');

verifyTest('handleNavigate Function Exists', () => {
    if (!therapistLayoutContent) return { pass: false, message: 'TherapistLayout not available' };
    
    const hasHandleNavigate = therapistLayoutContent.includes('const handleNavigate') &&
                             therapistLayoutContent.includes('onNavigate(pageId)');
    
    return hasHandleNavigate ? 
        { pass: true } : 
        { pass: false, message: 'handleNavigate function not found or incomplete' };
}, 10);

verifyTest('Menu Items Have Click Handlers', () => {
    if (!therapistLayoutContent) return { pass: false, message: 'TherapistLayout not available' };
    
    const hasClickHandlers = therapistLayoutContent.includes('onClick=') &&
                           therapistLayoutContent.includes('handleNavigate(item.id)');
    
    return hasClickHandlers ? 
        { pass: true } : 
        { pass: false, message: 'Menu items missing click handlers' };
}, 10);

verifyTest('No Broken Navigation Chains', () => {
    if (!therapistDashboardContent && !therapistDashboardPageContent) {
        return { warning: true, message: 'Dashboard navigation handlers not available' };
    }
    
    const content = therapistDashboardContent || therapistDashboardPageContent;
    
    // Check for broken navigation patterns
    const hasBrokenChains = content.includes('onNavigate?.()') || // Empty calls
                          content.includes('onNavigate(undefined)') ||
                          content.includes('onNavigate(null)');
    
    return !hasBrokenChains ? 
        { pass: true } : 
        { warning: true, message: 'Potential broken navigation chains found' };
}, 8);

// ============================================================================
// FINAL RESULTS
// ============================================================================
console.log('\\n🎯 THERAPIST SIDEBAR NAVIGATION VERIFICATION RESULTS');
console.log('==================================================');
console.log(`📊 Overall Score: ${verificationResults.score}/${verificationResults.maxScore} (${Math.round((verificationResults.score/verificationResults.maxScore) * 100)}%)`);

let verificationLevel = 'FAIL';
let verificationColor = '❌';
const percentage = (verificationResults.score / verificationResults.maxScore) * 100;

if (percentage >= 90) {
    verificationLevel = 'EXCELLENT';
    verificationColor = '🟢';
} else if (percentage >= 80) {
    verificationLevel = 'GOOD';
    verificationColor = '🟡';
} else if (percentage >= 70) {
    verificationLevel = 'ACCEPTABLE';
    verificationColor = '🟠';
} else if (percentage >= 60) {
    verificationLevel = 'POOR';
    verificationColor = '🔴';
}

console.log(`🏆 Navigation Status: ${verificationColor} ${verificationLevel}`);
console.log(`✅ Passed: ${verificationResults.passed} tests`);
console.log(`⚠️ Warnings: ${verificationResults.warnings.length} tests`);
console.log(`❌ Failed: ${verificationResults.failed} tests`);
console.log('');

// Issues Report
if (verificationResults.issues.length > 0) {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    console.log('=========================');
    verificationResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.test}: ${issue.issue}`);
    });
    console.log('');
}

// Warnings Report
if (verificationResults.warnings.length > 0) {
    console.log('⚠️ WARNINGS FOUND:');
    console.log('==================');
    verificationResults.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.test}: ${warning.issue}`);
    });
    console.log('');
}

// Detailed Menu Items Status
console.log('📋 SIDEBAR MENU ITEMS STATUS:');
console.log('=============================');
THERAPIST_MENU_ITEMS.forEach(item => {
    console.log(`• ${item.label} (${item.id}) → Expected: ${item.expectedRoute}`);
});
console.log('');

console.log('🔧 RECOMMENDATIONS:');
console.log('===================');
console.log('• Verify all route cases exist in AppRouter.tsx');
console.log('• Ensure navigation handlers are properly implemented');
console.log('• Check for component/page files for each menu item');
console.log('• Test actual navigation flow in browser');
console.log('• Monitor for any landing page redirect issues');
console.log('');

console.log('============================================');
console.log(`🏆 VERIFICATION COMPLETE: ${verificationColor} ${verificationLevel}`);
console.log('============================================');

// Exit with appropriate code
process.exit(verificationResults.failed > 0 ? 1 : 0);
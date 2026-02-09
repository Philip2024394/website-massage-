#!/usr/bin/env node

/**
 * ============================================================================
 * 🔍 COMPREHENSIVE THERAPIST NAVIGATION AUDIT - GOLD STANDARD COMPLIANCE
 * ============================================================================
 * 
 * Critical Issue: Therapist side drawer pages diverting to landing page
 * Standards: Uber/Facebook Navigation Gold Standards
 * Date: February 9, 2026
 * 
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE THERAPIST NAVIGATION AUDIT');
console.log('============================================');
console.log('📅 Date: February 9, 2026');
console.log('🎯 Issue: Side drawer pages diverting to landing page');
console.log('📋 Standards: Uber/Facebook Gold Standard Navigation');
console.log('');

// Audit configuration
const auditConfig = {
    therapistLayoutFile: 'src/components/therapist/TherapistLayout.tsx',
    appRouterFile: 'src/AppRouter.tsx',
    therapistRoutesFile: 'src/router/routes/therapistRoutes.tsx',
    hookFiles: [
        'src/hooks/useNavigation.ts',
        'src/hooks/useURLRouting.ts'
    ],
    therapistPages: [
        'src/pages/therapist/TherapistDashboard.tsx',
        'src/pages/therapist/TherapistDashboardPage.tsx',
        'src/pages/therapist/TherapistOnlineStatus.tsx',
        'src/pages/therapist/TherapistBookingsPage.tsx',
        'src/pages/therapist/TherapistEarningsPage.tsx',
        'src/pages/therapist/TherapistChatPage.tsx',
        'src/pages/therapist/TherapistMenu.tsx',
        'src/pages/therapist/TherapistMenuPage.tsx',
        'src/pages/therapist/TherapistNotifications.tsx',
        'src/pages/therapist/TherapistNotificationsPage.tsx'
    ]
};

let auditResults = {
    score: 0,
    maxScore: 0,
    passed: 0,
    warned: 0,
    failed: 0,
    criticalIssues: [],
    navigationIssues: [],
    routingProblems: [],
    compliance: {
        uberStandards: { score: 0, max: 50 },
        facebookStandards: { score: 0, max: 50 },
        navigationIntegrity: { score: 0, max: 50 },
        routingStability: { score: 0, max: 50 }
    }
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

function auditTest(name, testFn, points = 5, category = 'general') {
    auditResults.maxScore += points;
    try {
        const result = testFn();
        if (result.pass) {
            console.log(`  ✅ ${name}: PASS (${points} pts)`);
            auditResults.score += points;
            auditResults.passed++;
            auditResults.compliance[category] = auditResults.compliance[category] || { score: 0, max: 0 };
            auditResults.compliance[category].score += points;
        } else if (result.warning) {
            console.log(`  ⚠️ ${name}: WARNING (${Math.floor(points/2)} pts) - ${result.message}`);
            auditResults.score += Math.floor(points/2);
            auditResults.warned++;
            auditResults.navigationIssues.push({ test: name, issue: result.message, severity: 'warning' });
        } else {
            console.log(`  ❌ ${name}: FAIL (0 pts) - ${result.message}`);
            auditResults.failed++;
            auditResults.criticalIssues.push({ test: name, issue: result.message, severity: 'critical' });
        }
    } catch (error) {
        console.log(`  ❌ ${name}: ERROR (0 pts) - ${error.message}`);
        auditResults.failed++;
        auditResults.criticalIssues.push({ test: name, issue: error.message, severity: 'error' });
    }
    
    if (auditResults.compliance[category]) {
        auditResults.compliance[category].max += points;
    }
}

// ============================================================================
// 1. THERAPIST LAYOUT NAVIGATION AUDIT
// ============================================================================
console.log('🧭 Auditing Therapist Layout Navigation...');
const therapistLayoutContent = readFileIfExists(auditConfig.therapistLayoutFile);

auditTest('TherapistLayout File Exists', () => {
    return therapistLayoutContent ? 
        { pass: true } : 
        { pass: false, message: 'TherapistLayout.tsx not found' };
}, 10, 'navigationIntegrity');

if (therapistLayoutContent) {
    auditTest('Menu Items Configuration', () => {
        const hasMenuItems = therapistLayoutContent.includes('menuItems') && 
                           therapistLayoutContent.includes('id:') &&
                           therapistLayoutContent.includes('label:');
        return hasMenuItems ? 
            { pass: true } : 
            { pass: false, message: 'Menu items not properly configured' };
    }, 10, 'navigationIntegrity');

    auditTest('Navigation Handler Implementation', () => {
        const hasHandler = therapistLayoutContent.includes('handleNavigate') && 
                          therapistLayoutContent.includes('onNavigate');
        return hasHandler ? 
            { pass: true } : 
            { pass: false, message: 'Navigation handler missing or incomplete' };
    }, 15, 'navigationIntegrity');

    auditTest('Menu Item Click Events', () => {
        const hasClickEvents = therapistLayoutContent.includes('onClick') && 
                              therapistLayoutContent.includes('handleNavigate(item.id)');
        return hasClickEvents ? 
            { pass: true } : 
            { pass: false, message: 'Menu item click events not properly bound' };
    }, 15, 'navigationIntegrity');

    // Check for specific navigation patterns that might cause landing page redirects
    auditTest('Landing Page Redirect Prevention', () => {
        const hasLandingRedirect = therapistLayoutContent.includes('window.location.href = \'/\'') ||
                                  therapistLayoutContent.includes('navigate(\'/\')') ||
                                  therapistLayoutContent.includes('setPage(\'home\')') ||
                                  therapistLayoutContent.includes('setPage(\'landing\')');
        return !hasLandingRedirect ? 
            { pass: true } : 
            { warning: true, message: 'Potential landing page redirect found in layout' };
    }, 20, 'navigationIntegrity');

    // Check for proper menu item definitions
    const menuItemMatches = therapistLayoutContent.match(/\{\s*id:\s*['"](.*?)['"],\s*label:/g);
    if (menuItemMatches) {
        const menuItemIds = menuItemMatches.map(match => {
            const idMatch = match.match(/id:\s*['"](.*?)['"]/);
            return idMatch ? idMatch[1] : null;
        }).filter(Boolean);
        
        console.log(`    📋 Found ${menuItemIds.length} menu items: ${menuItemIds.join(', ')}`);
        
        auditTest('Menu Item Coverage', () => {
            const expectedItems = ['status', 'dashboard', 'bookings', 'earnings', 'chat', 'notifications'];
            const missingItems = expectedItems.filter(item => !menuItemIds.includes(item));
            return missingItems.length === 0 ? 
                { pass: true } : 
                { warning: true, message: `Missing menu items: ${missingItems.join(', ')}` };
        }, 10, 'uberStandards');
    }
}

// ============================================================================
// 2. APP ROUTER NAVIGATION AUDIT
// ============================================================================
console.log('🔀 Auditing App Router Navigation Logic...');
const appRouterContent = readFileIfExists(auditConfig.appRouterFile);

if (appRouterContent) {
    auditTest('Therapist Route Cases', () => {
        const therapistRoutes = [
            'therapist-dashboard',
            'therapist-status', 
            'therapist-bookings',
            'therapist-earnings',
            'therapist-chat',
            'therapist-notifications'
        ];
        
        const missingRoutes = therapistRoutes.filter(route => 
            !appRouterContent.includes(`case '${route}'`)
        );
        
        return missingRoutes.length === 0 ? 
            { pass: true } : 
            { pass: false, message: `Missing route cases: ${missingRoutes.join(', ')}` };
    }, 20, 'routingStability');

    auditTest('Default Route Handling', () => {
        const hasDefaultCase = appRouterContent.includes('default:') && 
                               !appRouterContent.includes('default:\n        return renderRoute(HomePage');
        return hasDefaultCase ? 
            { pass: true } : 
            { warning: true, message: 'Default case might redirect to home/landing page' };
    }, 15, 'routingStability');

    auditTest('Route Fallback Prevention', () => {
        const hasFallbackPrevention = !appRouterContent.includes('setPage(\'home\')') ||
                                     appRouterContent.includes('// Prevent fallback');
        return hasFallbackPrevention ? 
            { pass: true } : 
            { pass: false, message: 'Routes may have automatic home page fallbacks' };
    }, 20, 'routingStability');

    // Check for therapist-specific routing logic
    auditTest('Therapist Authentication Check', () => {
        const hasAuthCheck = appRouterContent.includes('therapist') && 
                            (appRouterContent.includes('requiresAuth') || 
                             appRouterContent.includes('user.role') ||
                             appRouterContent.includes('userType'));
        return hasAuthCheck ? 
            { pass: true } : 
            { warning: true, message: 'Therapist authentication checks may be missing' };
    }, 10, 'uberStandards');
}

// ============================================================================
// 3. THERAPIST ROUTES CONFIGURATION AUDIT
// ============================================================================
console.log('📂 Auditing Therapist Routes Configuration...');
const therapistRoutesContent = readFileIfExists(auditConfig.therapistRoutesFile);

if (therapistRoutesContent) {
    auditTest('Route Component Mapping', () => {
        const hasComponents = therapistRoutesContent.includes('component:') &&
                             therapistRoutesContent.includes('import');
        return hasComponents ? 
            { pass: true } : 
            { pass: false, message: 'Route components not properly mapped' };
    }, 15, 'routingStability');

    auditTest('Route Path Definitions', () => {
        const hasPathDefinitions = therapistRoutesContent.includes('path:') &&
                                  therapistRoutesContent.includes('/therapist');
        return hasPathDefinitions ? 
            { pass: true } : 
            { pass: false, message: 'Route paths not properly defined' };
    }, 10, 'routingStability');
}

// ============================================================================
// 4. NAVIGATION HOOKS AUDIT
// ============================================================================
console.log('🎣 Auditing Navigation Hooks...');
auditConfig.hookFiles.forEach(hookFile => {
    const hookContent = readFileIfExists(hookFile);
    if (hookContent) {
        const hookName = path.basename(hookFile);
        
        auditTest(`${hookName} Navigation Logic`, () => {
            const hasNavigationLogic = hookContent.includes('navigate') || 
                                      hookContent.includes('setPage') ||
                                      hookContent.includes('onNavigate');
            return hasNavigationLogic ? 
                { pass: true } : 
                { warning: true, message: `${hookName} may not handle navigation properly` };
        }, 8, 'navigationIntegrity');
        
        auditTest(`${hookName} Landing Page Check`, () => {
            const hasLandingLogic = hookContent.includes('home') || 
                                   hookContent.includes('landing') ||
                                   hookContent.includes('MainLandingPage');
                                   
            // We want controlled landing logic, not automatic redirects
            return !hookContent.includes('setPage(\'home\')') ? 
                { pass: true } : 
                { warning: true, message: `${hookName} may cause landing page redirects` };
        }, 10, 'navigationIntegrity');
    }
});

// ============================================================================
// 5. THERAPIST PAGE COMPONENTS AUDIT
// ============================================================================
console.log('📄 Auditing Therapist Page Components...');
let existingPages = 0;
auditConfig.therapistPages.forEach(pagePath => {
    const pageContent = readFileIfExists(pagePath);
    if (pageContent) {
        existingPages++;
        const pageName = path.basename(pagePath);
        
        auditTest(`${pageName} Navigation Props`, () => {
            const hasNavProps = pageContent.includes('onNavigate') || 
                              pageContent.includes('navigation') ||
                              pageContent.includes('TherapistLayout');
            return hasNavProps ? 
                { pass: true } : 
                { warning: true, message: `${pageName} may not handle navigation properly` };
        }, 5, 'navigationIntegrity');
        
        auditTest(`${pageName} Layout Integration`, () => {
            const hasLayoutIntegration = pageContent.includes('TherapistLayout') ||
                                        pageContent.includes('TherapistPageWrapper');
            return hasLayoutIntegration ? 
                { pass: true } : 
                { warning: true, message: `${pageName} may not use consistent layout` };
        }, 5, 'uberStandards');
    }
});

console.log(`    📊 Found ${existingPages} existing therapist pages`);

// ============================================================================
// 6. CRITICAL NAVIGATION PATTERN ANALYSIS
// ============================================================================
console.log('🔍 Analyzing Critical Navigation Patterns...');

// Check for common redirect patterns that could cause landing page issues
const criticalFiles = [
    auditConfig.therapistLayoutFile,
    auditConfig.appRouterFile,
    'src/App.tsx',
    'src/AppRouter.tsx'
].filter(file => readFileIfExists(file));

let redirectPatterns = [];
criticalFiles.forEach(filePath => {
    const content = readFileIfExists(filePath);
    if (content) {
        const fileName = path.basename(filePath);
        
        // Look for potential redirect patterns
        if (content.includes('window.location.href = \'/\'')) {
            redirectPatterns.push(`${fileName}: Direct window location redirect to root`);
        }
        
        if (content.includes('setPage(\'home\')') || content.includes('setPage("home")')) {
            redirectPatterns.push(`${fileName}: Page state set to home`);
        }
        
        if (content.includes('navigate(\'/\')') || content.includes('navigate("/")')) {
            redirectPatterns.push(`${fileName}: Router navigation to root`);
        }
        
        if (content.includes('onBack') && content.includes('home')) {
            redirectPatterns.push(`${fileName}: Back button may redirect to home`);
        }
    }
});

auditTest('Landing Page Redirect Pattern Analysis', () => {
    return redirectPatterns.length === 0 ? 
        { pass: true } : 
        { pass: false, message: `Found ${redirectPatterns.length} potential redirect patterns: ${redirectPatterns.join('; ')}` };
}, 25, 'routingStability');

// ============================================================================
// 7. GOLD STANDARD COMPLIANCE CHECKS
// ============================================================================
console.log('🏅 Checking Gold Standard Compliance...');

auditTest('Uber Navigation Standards', () => {
    const uberCompliance = auditResults.compliance.uberStandards.score / 
                          Math.max(auditResults.compliance.uberStandards.max, 1);
    return uberCompliance >= 0.8 ? 
        { pass: true } : 
        { warning: true, message: `Uber standards at ${Math.round(uberCompliance * 100)}% (need 80%+)` };
}, 20, 'uberStandards');

auditTest('Facebook Navigation Standards', () => {
    const facebookCompliance = auditResults.compliance.facebookStandards.score / 
                              Math.max(auditResults.compliance.facebookStandards.max, 1);
    return facebookCompliance >= 0.8 ? 
        { pass: true } : 
        { warning: true, message: `Facebook standards at ${Math.round(facebookCompliance * 100)}% (need 80%+)` };
}, 20, 'facebookStandards');

auditTest('Navigation Consistency', () => {
    const consistencyScore = auditResults.compliance.navigationIntegrity.score / 
                            Math.max(auditResults.compliance.navigationIntegrity.max, 1);
    return consistencyScore >= 0.9 ? 
        { pass: true } : 
        { warning: true, message: `Navigation consistency at ${Math.round(consistencyScore * 100)}% (need 90%+)` };
}, 15, 'navigationIntegrity');

// ============================================================================
// FINAL AUDIT REPORT
// ============================================================================
console.log('');
console.log('🎯 COMPREHENSIVE NAVIGATION AUDIT RESULTS');
console.log('==========================================');
console.log(`📊 Overall Score: ${auditResults.score}/${auditResults.maxScore} (${Math.round((auditResults.score/auditResults.maxScore) * 100)}%)`);

// Determine compliance level
let complianceLevel = 'FAIL';
let complianceColor = '❌';
const percentage = (auditResults.score / auditResults.maxScore) * 100;

if (percentage >= 90) {
    complianceLevel = 'GOLD';
    complianceColor = '🥇';
} else if (percentage >= 80) {
    complianceLevel = 'SILVER';
    complianceColor = '🥈';
} else if (percentage >= 70) {
    complianceLevel = 'BRONZE';
    complianceColor = '🥉';
}

console.log(`🏆 Compliance Level: ${complianceColor} ${complianceLevel}`);
console.log(`✅ Passed: ${auditResults.passed} tests`);
console.log(`⚠️  Warnings: ${auditResults.warned} tests`);
console.log(`❌ Failed: ${auditResults.failed} tests`);
console.log('');

console.log('📊 CATEGORY BREAKDOWN:');
Object.entries(auditResults.compliance).forEach(([category, data]) => {
    const score = Math.round((data.score / Math.max(data.max, 1)) * 100);
    const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
    console.log(`  ${status} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${score}%`);
});
console.log('');

// Critical Issues Report
if (auditResults.criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    console.log('========================');
    auditResults.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.test}: ${issue.issue}`);
    });
    console.log('');
}

// Navigation Issues Report
if (auditResults.navigationIssues.length > 0) {
    console.log('⚠️  NAVIGATION ISSUES:');
    console.log('=====================');
    auditResults.navigationIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.test}: ${issue.issue}`);
    });
    console.log('');
}

// Specific Landing Page Redirect Analysis
console.log('🔍 LANDING PAGE REDIRECT ANALYSIS:');
console.log('==================================');
if (redirectPatterns.length > 0) {
    console.log('❌ FOUND POTENTIAL REDIRECT CAUSES:');
    redirectPatterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern}`);
    });
} else {
    console.log('✅ No obvious redirect patterns detected');
}
console.log('');

// Recommendations
console.log('🔧 RECOMMENDED FIXES:');
console.log('====================');

if (auditResults.failed > 0) {
    console.log('🔴 HIGH PRIORITY:');
    console.log('  • Fix missing route cases in AppRouter');
    console.log('  • Implement proper navigation handlers');
    console.log('  • Remove automatic landing page redirects');
    console.log('  • Add authentication checks for therapist routes');
}

if (auditResults.warned > 0) {
    console.log('🟡 MEDIUM PRIORITY:');
    console.log('  • Improve navigation consistency');
    console.log('  • Add proper error handling for failed routes');
    console.log('  • Implement navigation state management');
    console.log('  • Add navigation debugging tools');
}

console.log('🟢 BEST PRACTICES:');
console.log('  • Use consistent navigation patterns');
console.log('  • Implement proper route guards');
console.log('  • Add navigation analytics');
console.log('  • Test navigation on all devices');
console.log('');

console.log('============================================');
console.log(`🏆 AUDIT COMPLETE: ${complianceColor} ${complianceLevel} STANDARD`);
console.log('============================================');

// Exit with appropriate code
process.exit(auditResults.failed > 0 ? 1 : 0);
#!/usr/bin/env node

/**
 * ============================================================================
 * 🔍 THERAPIST PROFILE ROUTING VERIFICATION TOOL
 * ============================================================================
 * 
 * Purpose: Verify therapist profile page routing and mapping is correct
 * Date: February 9, 2026
 * 
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 THERAPIST PROFILE ROUTING VERIFICATION');
console.log('==========================================');
console.log('📅 Date: February 9, 2026');
console.log('🎯 Purpose: Verify therapist profile page routing and mapping');
console.log('');

let verificationResults = {
    score: 0,
    maxScore: 0,
    passed: 0,
    failed: 0,
    issues: []
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

function verifyTest(name, testFn, points = 10) {
    verificationResults.maxScore += points;
    try {
        const result = testFn();
        if (result.pass) {
            console.log(`  ✅ ${name}: PASS`);
            verificationResults.score += points;
            verificationResults.passed++;
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
// 1. PROFILE ROUTES CONFIGURATION
// ============================================================================
console.log('📂 Verifying Profile Routes Configuration...');
const profileRoutesContent = readFileIfExists('src/router/routes/profileRoutes.tsx');

verifyTest('profileRoutes.tsx File Exists', () => {
    return profileRoutesContent ? 
        { pass: true } : 
        { pass: false, message: 'profileRoutes.tsx not found' };
}, 15);

if (profileRoutesContent) {
    verifyTest('TherapistProfilePage Import', () => {
        const hasDirectImport = profileRoutesContent.includes("import TherapistProfilePage from '../../pages/TherapistProfilePage'");
        return hasDirectImport ? 
            { pass: true } : 
            { pass: false, message: 'TherapistProfilePage not properly imported' };
    }, 10);

    verifyTest('therapistProfile Route Configuration', () => {
        const hasTherapistProfile = profileRoutesContent.includes('therapistProfile:') &&
                                   profileRoutesContent.includes("path: '/profile/therapist/:id'") &&
                                   profileRoutesContent.includes('component: TherapistProfilePage');
        return hasTherapistProfile ? 
            { pass: true } : 
            { pass: false, message: 'therapistProfile route not properly configured' };
    }, 15);

    verifyTest('Legacy therapist Route Support', () => {
        const hasLegacyRoute = profileRoutesContent.includes('therapist:') &&
                              profileRoutesContent.includes("path: '/therapist/:id'") &&
                              profileRoutesContent.includes('component: TherapistProfilePage');
        return hasLegacyRoute ? 
            { pass: true } : 
            { pass: false, message: 'Legacy therapist route not configured' };
    }, 10);
}

// ============================================================================
// 2. APP ROUTER THERAPIST-PROFILE CASE
// ============================================================================
console.log('🔀 Verifying AppRouter therapist-profile Case...');
const appRouterContent = readFileIfExists('src/AppRouter.tsx');

if (appRouterContent) {
    verifyTest('profileRoutes Import in AppRouter', () => {
        const hasImport = appRouterContent.includes("import { profileRoutes } from './router/routes/profileRoutes'");
        return hasImport ? 
            { pass: true } : 
            { pass: false, message: 'profileRoutes not imported in AppRouter' };
    }, 10);

    verifyTest('therapist-profile Case Exists', () => {
        const hasCase = appRouterContent.includes("case 'therapist-profile':");
        return hasCase ? 
            { pass: true } : 
            { pass: false, message: 'therapist-profile case not found in AppRouter' };
    }, 15);

    verifyTest('Component Reference in AppRouter', () => {
        const hasComponentRef = appRouterContent.includes('profileRoutes.therapistProfile.component');
        return hasComponentRef ? 
            { pass: true } : 
            { pass: false, message: 'profileRoutes.therapistProfile.component not referenced' };
    }, 10);

    verifyTest('URL Pattern Matching', () => {
        const hasUrlPattern = appRouterContent.includes('/(?:therapist-profile|profile\\/therapist)\\/([a-z0-9-]+)/') ||
                             appRouterContent.includes('therapist-profile/') ||
                             appRouterContent.includes('profile/therapist/');
        return hasUrlPattern ? 
            { pass: true } : 
            { pass: false, message: 'URL pattern matching not found or incorrect' };
    }, 15);

    verifyTest('TherapistProfileWithFetch Fallback', () => {
        const hasFallback = appRouterContent.includes('TherapistProfileWithFetch') &&
                           appRouterContent.includes('<TherapistProfileWithFetch');
        return hasFallback ? 
            { pass: true } : 
            { pass: false, message: 'TherapistProfileWithFetch fallback not implemented' };
    }, 10);

    verifyTest('Appwrite Integration', () => {
        const hasAppwriteIntegration = appRouterContent.includes('databases.getDocument') &&
                                      appRouterContent.includes('COLLECTIONS.THERAPISTS');
        return hasAppwriteIntegration ? 
            { pass: true } : 
            { pass: false, message: 'Appwrite integration for therapist fetching not found' };
    }, 10);

    verifyTest('Error Handling', () => {
        const hasErrorHandling = appRouterContent.includes('Profile Not Found') &&
                               appRouterContent.includes('Unable to load therapist profile');
        return hasErrorHandling ? 
            { pass: true } : 
            { pass: false, message: 'Proper error handling not implemented' };
    }, 10);
}

// ============================================================================
// 3. THERAPIST PROFILE PAGE COMPONENT
// ============================================================================
console.log('📄 Verifying TherapistProfilePage Component...');
const therapistProfileContent = readFileIfExists('src/pages/TherapistProfilePage.tsx');

verifyTest('TherapistProfilePage Component Exists', () => {
    return therapistProfileContent ? 
        { pass: true } : 
        { pass: false, message: 'TherapistProfilePage.tsx not found' };
}, 15);

if (therapistProfileContent) {
    verifyTest('Component Export', () => {
        const hasExport = therapistProfileContent.includes('export default TherapistProfilePage');
        return hasExport ? 
            { pass: true } : 
            { pass: false, message: 'TherapistProfilePage not properly exported' };
    }, 10);

    verifyTest('Props Interface', () => {
        const hasInterface = therapistProfileContent.includes('TherapistProfilePageProps') &&
                           therapistProfileContent.includes('therapist: any') &&
                           therapistProfileContent.includes('onBack: () => void');
        return hasInterface ? 
            { pass: true } : 
            { pass: false, message: 'Props interface not properly defined' };
    }, 10);

    verifyTest('Component Implementation', () => {
        const hasImplementation = therapistProfileContent.includes('React.FC<TherapistProfilePageProps>') &&
                                therapistProfileContent.includes('const TherapistProfilePage');
        return hasImplementation ? 
            { pass: true } : 
            { pass: false, message: 'Component not properly implemented' };
    }, 10);

    verifyTest('Error Handling in Component', () => {
        const hasErrorHandling = therapistProfileContent.includes('if (!therapist)') &&
                                therapistProfileContent.includes('Component Load Error');
        return hasErrorHandling ? 
            { pass: true } : 
            { pass: false, message: 'Component error handling not implemented' };
    }, 10);

    verifyTest('Display Name', () => {
        const hasDisplayName = therapistProfileContent.includes("TherapistProfilePage.displayName = 'TherapistProfilePage'");
        return hasDisplayName ? 
            { pass: true } : 
            { pass: false, message: 'Display name not set' };
    }, 5);
}

// ============================================================================
// 4. SHARED THERAPIST PROFILE SUPPORT
// ============================================================================
console.log('🔗 Verifying Shared Profile Support...');
const sharedProfileContent = readFileIfExists('src/features/shared-profiles/SharedTherapistProfile.tsx');

verifyTest('SharedTherapistProfile Component Exists', () => {
    return sharedProfileContent ? 
        { pass: true } : 
        { pass: false, message: 'SharedTherapistProfile.tsx not found' };
}, 10);

if (appRouterContent) {
    verifyTest('shared-therapist-profile Case', () => {
        const hasSharedCase = appRouterContent.includes("case 'shared-therapist-profile':");
        return hasSharedCase ? 
            { pass: true } : 
            { pass: false, message: 'shared-therapist-profile case not found' };
    }, 10);

    verifyTest('SharedTherapistProfileDirect Import', () => {
        const hasDirectImport = appRouterContent.includes("import SharedTherapistProfileDirect from");
        return hasDirectImport ? 
            { pass: true } : 
            { pass: false, message: 'SharedTherapistProfileDirect not imported' };
    }, 10);
}

// ============================================================================
// 5. URL ROUTING PATTERNS
// ============================================================================
console.log('🌐 Verifying URL Pattern Support...');
if (appRouterContent) {
    verifyTest('Hash Router Support', () => {
        const hasHashSupport = appRouterContent.includes('window.location.hash') &&
                              appRouterContent.includes('hashForId.startsWith');
        return hasHashSupport ? 
            { pass: true } : 
            { pass: false, message: 'Hash router support not implemented' };
    }, 10);

    verifyTest('SEO-Friendly URL Support', () => {
        const hasSeoSupport = appRouterContent.includes('/profile/therapist/') ||
                             appRouterContent.includes('profile\\/therapist');
        return hasSeoSupport ? 
            { pass: true } : 
            { pass: false, message: 'SEO-friendly URL support not implemented' };
    }, 10);

    verifyTest('ID Extraction Logic', () => {
        const hasIdExtraction = appRouterContent.includes('urlId.split') &&
                              appRouterContent.includes('idWithoutName');
        return hasIdExtraction ? 
            { pass: true } : 
            { pass: false, message: 'ID extraction logic not implemented' };
    }, 10);
}

// ============================================================================
// FINAL VERIFICATION REPORT
// ============================================================================
console.log('');
console.log('🎯 THERAPIST PROFILE ROUTING VERIFICATION RESULTS');
console.log('================================================');
console.log(`📊 Overall Score: ${verificationResults.score}/${verificationResults.maxScore} (${Math.round((verificationResults.score/verificationResults.maxScore) * 100)}%)`);

let verificationLevel = 'FAIL';
let verificationColor = '❌';
const percentage = (verificationResults.score / verificationResults.maxScore) * 100;

if (percentage >= 95) {
    verificationLevel = 'EXCELLENT';
    verificationColor = '🟢';
} else if (percentage >= 85) {
    verificationLevel = 'GOOD';
    verificationColor = '🟡';
} else if (percentage >= 70) {
    verificationLevel = 'ACCEPTABLE';
    verificationColor = '🟠';
}

console.log(`🏆 Verification Status: ${verificationColor} ${verificationLevel}`);
console.log(`✅ Passed: ${verificationResults.passed} tests`);
console.log(`❌ Failed: ${verificationResults.failed} tests`);
console.log('');

if (verificationResults.issues.length > 0) {
    console.log('🚨 ISSUES FOUND:');
    console.log('================');
    verificationResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.test}: ${issue.issue}`);
    });
    console.log('');
}

console.log('📋 ROUTING CONFIGURATION SUMMARY:');
console.log('=================================');
console.log('✅ Expected Routes:');
console.log('   • /therapist-profile/:id → therapist-profile case → TherapistProfilePage');
console.log('   • /profile/therapist/:id → therapist-profile case → TherapistProfilePage'); 
console.log('   • Hash: /#/therapist-profile/:id → therapist-profile case → TherapistProfilePage');
console.log('   • Shared: /share/therapist/:id → shared-therapist-profile case → SharedTherapistProfile');
console.log('');
console.log('✅ Component Flow:');
console.log('   1. AppRouter receives therapist-profile page');
console.log('   2. Extracts ID from URL (with name suffix support)');
console.log('   3. Finds therapist in memory OR fetches from Appwrite');
console.log('   4. Renders TherapistProfilePage with therapist data');
console.log('   5. TherapistProfilePage displays profile with TherapistProfileBase');
console.log('');
console.log('✅ Fallback Mechanisms:');
console.log('   • Memory lookup first (fast path)');
console.log('   • Appwrite fetch for cold starts');
console.log('   • Error page for missing profiles');
console.log('   • Graceful degradation for missing data');
console.log('');

console.log('============================================');
console.log(`🏆 VERIFICATION COMPLETE: ${verificationColor} ${verificationLevel}`);
console.log('============================================');

// Exit with appropriate code
process.exit(verificationResults.failed > 0 ? 1 : 0);
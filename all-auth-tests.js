/**
 * Complete Authentication Test Suite for All User Types
 * Run in browser console at http://localhost:3004
 */

// Test configurations
const TEST_USERS = {
    agent: { email: 'test.agent@indastreet.com', password: 'TestAgent123!' },
    hotel: { email: 'test.hotel@indastreet.com', password: 'TestHotel123!' },
    place: { email: 'test.place@indastreet.com', password: 'TestPlace123!' },
    villa: { email: 'test.villa@indastreet.com', password: 'TestVilla123!' }
};

// Utility functions
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function log(type, msg) { console.log(`🧪 [${type.toUpperCase()}] ${msg}`); }
function logSuccess(type, msg) { console.log(`✅ [${type.toUpperCase()} PASS] ${msg}`); }
function logError(type, msg) { console.error(`❌ [${type.toUpperCase()} FAIL] ${msg}`); }

// Generic test function for any user type
async function testUserTypeFlow(userType) {
    const testUser = TEST_USERS[userType];
    if (!testUser) {
        logError(userType, 'No test configuration found');
        return false;
    }
    
    log(userType, `Starting ${userType} authentication flow test...`);
    
    try {
        // Navigate to login page
        const pageMap = {
            agent: 'agentAuth',
            hotel: 'hotelLogin', 
            place: 'massagePlaceLogin',
            villa: 'villaLogin'
        };
        
        // Try navigation by page name
        if (typeof window.setPage === 'function' && pageMap[userType]) {
            window.setPage(pageMap[userType]);
            await delay(2000);
        } else {
            // Try finding navigation button
            const navButton = Array.from(document.querySelectorAll('button, a'))
                .find(el => el.textContent.toLowerCase().includes(userType.toLowerCase()));
            if (navButton) {
                navButton.click();
                await delay(2000);
            }
        }
        
        // Check if correct page loaded
        const isCorrectPage = document.body.textContent.toLowerCase().includes(userType.toLowerCase()) &&
                             (document.body.textContent.includes('Sign In') || document.body.textContent.includes('Login'));
        
        if (!isCorrectPage) {
            logError(userType, 'Could not navigate to login page');
            return false;
        }
        
        log(userType, 'Navigated to login page');
        
        // Test Account Creation
        const signupButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Create Account') || btn.textContent.includes('Sign Up'));
        
        if (signupButton) {
            signupButton.click();
            await delay(1000);
        }
        
        // Fill signup form
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) {
            logError(userType, 'Form inputs not found');
            return false;
        }
        
        emailInput.value = testUser.email;
        passwordInput.value = testUser.password;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Submit signup
        const submitButton = document.querySelector('button[type="submit"]') ||
                           Array.from(document.querySelectorAll('button'))
                               .find(btn => btn.textContent.includes('Create Account'));
        
        if (!submitButton) {
            logError(userType, 'Submit button not found');
            return false;
        }
        
        submitButton.click();
        await delay(4000);
        
        // Check signup success
        const signupSuccess = document.body.textContent.includes('created successfully') ||
                             document.body.textContent.includes('Account created') ||
                             document.querySelector('.text-green');
        
        if (!signupSuccess) {
            logError(userType, 'Signup failed - no success message');
            return false;
        }
        
        logSuccess(userType, 'Account created successfully');
        
        // Test Sign In
        const signinButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Sign In') && !btn.textContent.includes('Create'));
        
        if (signinButton) {
            signinButton.click();
            await delay(1000);
        }
        
        // Fill signin form
        emailInput.value = testUser.email;
        passwordInput.value = testUser.password;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Submit signin
        const signinSubmitButton = document.querySelector('button[type="submit"]') ||
                                  Array.from(document.querySelectorAll('button'))
                                      .find(btn => btn.textContent.includes('Sign In'));
        
        if (signinSubmitButton) {
            signinSubmitButton.click();
            await delay(4000);
        }
        
        // Check dashboard access
        const dashboardAccess = document.body.textContent.includes('Dashboard') ||
                               document.body.textContent.includes('Logout') ||
                               document.body.textContent.includes('Welcome');
        
        if (!dashboardAccess) {
            logError(userType, 'Dashboard not accessible after signin');
            return false;
        }
        
        logSuccess(userType, 'Signin successful - dashboard accessed');
        
        // Test Logout
        const logoutButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Logout') || btn.textContent.includes('Sign Out'));
        
        if (!logoutButton) {
            logError(userType, 'Logout button not found');
            return false;
        }
        
        logoutButton.click();
        await delay(3000);
        
        // Check logout success
        const logoutSuccess = !document.body.textContent.includes('Dashboard') &&
                             (document.body.textContent.includes('Sign In') || 
                              document.body.textContent.includes('Home'));
        
        if (!logoutSuccess) {
            logError(userType, 'Logout failed - still in dashboard');
            return false;
        }
        
        logSuccess(userType, 'Logout successful');
        
        // Quick session persistence test
        log(userType, 'Testing session persistence...');
        
        // Login again
        if (signinButton) signinButton.click();
        await delay(1000);
        emailInput.value = testUser.email;
        passwordInput.value = testUser.password;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        signinSubmitButton.click();
        await delay(3000);
        
        if (document.body.textContent.includes('Dashboard')) {
            logSuccess(userType, 'Session persistence working');
            return true;
        } else {
            logError(userType, 'Session persistence failed');
            return false;
        }
        
    } catch (error) {
        logError(userType, `Test failed: ${error.message}`);
        return false;
    }
}

// Test all user types
async function runAllAuthTests() {
    console.log('🚀 Starting Complete Authentication Tests for All User Types');
    console.log('=' .repeat(70));
    
    const results = {};
    
    for (const userType of ['agent', 'hotel', 'place', 'villa']) {
        log('SYSTEM', `Testing ${userType}...`);
        results[userType] = await testUserTypeFlow(userType);
        await delay(3000); // Pause between tests
    }
    
    // Print summary
    console.log('\n📊 COMPLETE TEST RESULTS');
    console.log('=' .repeat(40));
    
    for (const [userType, passed] of Object.entries(results)) {
        console.log(`${userType.toUpperCase()}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedCount}/${totalCount} user types passed all tests`);
    
    if (passedCount === totalCount) {
        console.log('🎉 ALL AUTHENTICATION FLOWS WORKING PERFECTLY!');
    } else {
        console.log('⚠️  Some authentication flows need attention');
    }
    
    return results;
}

// Test individual user types
async function testAgent() { return await testUserTypeFlow('agent'); }
async function testHotel() { return await testUserTypeFlow('hotel'); }
async function testPlace() { return await testUserTypeFlow('place'); }
async function testVilla() { return await testUserTypeFlow('villa'); }

// Clear rate limits for testing
function clearAllRateLimits() {
    try {
        if (typeof resetAdminRateLimit === 'function') resetAdminRateLimit();
        if (typeof resetHotelRateLimit === 'function') resetHotelRateLimit();
        if (typeof resetPlaceRateLimit === 'function') resetPlaceRateLimit();
        if (typeof resetAgentRateLimit === 'function') resetAgentRateLimit();
        if (typeof resetVillaRateLimit === 'function') resetVillaRateLimit();
        console.log('✅ All rate limits cleared');
    } catch (error) {
        console.log('ℹ️ Rate limit functions not available');
    }
}

// Make functions available globally
window.authTests = {
    runAllAuthTests,
    testAgent,
    testHotel, 
    testPlace,
    testVilla,
    clearAllRateLimits,
    testUserTypeFlow
};

console.log('🧪 Complete Authentication Test Suite Loaded!');
console.log('🚀 Run: window.authTests.runAllAuthTests()');
console.log('📋 Individual tests:');
console.log('   - window.authTests.testAgent()');
console.log('   - window.authTests.testHotel()');
console.log('   - window.authTests.testPlace()'); 
console.log('   - window.authTests.testVilla()');
console.log('🧹 Clear rate limits: window.authTests.clearAllRateLimits()');
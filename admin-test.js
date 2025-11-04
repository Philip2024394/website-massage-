/**
 * Browser Console Test Script for Admin Authentication
 * 
 * Instructions:
 * 1. Open http://localhost:3004 in browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Run the functions one by one as instructed
 */

// Test configuration
const ADMIN_TEST_EMAIL = 'test.admin@indastreet.com';
const ADMIN_TEST_PASSWORD = 'TestAdmin123!';

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
    console.log(`🧪 [TEST] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [PASS] ${message}`);
}

function logError(message) {
    console.error(`❌ [FAIL] ${message}`);
}

// Test functions
async function testAdminSignup() {
    log('Starting Admin Signup Test...');
    
    try {
        // Navigate to admin login page
        if (typeof window.setPage === 'function') {
            window.setPage('adminLogin');
        } else {
            // Try alternative navigation methods
            const adminButton = Array.from(document.querySelectorAll('button, a'))
                .find(el => el.textContent.includes('Admin') || el.textContent.includes('admin'));
            if (adminButton) {
                adminButton.click();
            } else {
                logError('Could not navigate to admin login page');
                return false;
            }
        }
        
        await delay(2000);
        
        // Check if admin login page is visible
        const isAdminPage = document.body.textContent.includes('Admin') && 
                           (document.body.textContent.includes('Sign In') || document.body.textContent.includes('Login'));
        
        if (!isAdminPage) {
            logError('Admin login page not found');
            return false;
        }
        
        logSuccess('Navigated to admin login page');
        
        // Switch to signup mode
        const signupButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Create Account') || btn.textContent.includes('Sign Up'));
        
        if (signupButton) {
            signupButton.click();
            await delay(1000);
            logSuccess('Switched to signup mode');
        }
        
        // Fill form
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) {
            logError('Email or password input not found');
            return false;
        }
        
        // Clear and fill inputs
        emailInput.value = '';
        passwordInput.value = '';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        emailInput.value = ADMIN_TEST_EMAIL;
        passwordInput.value = ADMIN_TEST_PASSWORD;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        logSuccess('Filled signup form');
        
        // Submit form
        const submitButton = document.querySelector('button[type="submit"]') ||
                           Array.from(document.querySelectorAll('button'))
                               .find(btn => btn.textContent.includes('Create Account'));
        
        if (!submitButton) {
            logError('Submit button not found');
            return false;
        }
        
        submitButton.click();
        logSuccess('Submitted signup form');
        
        // Wait for response
        await delay(5000);
        
        // Check for success
        const hasSuccess = document.body.textContent.includes('created successfully') ||
                          document.body.textContent.includes('Account created') ||
                          document.querySelector('.text-green');
        
        if (hasSuccess) {
            logSuccess('Admin account created successfully!');
            return true;
        } else {
            logError('No success message found after signup');
            return false;
        }
        
    } catch (error) {
        logError(`Admin signup failed: ${error.message}`);
        return false;
    }
}

async function testAdminSignin() {
    log('Starting Admin Signin Test...');
    
    try {
        // Switch to signin mode
        const signinButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Sign In') && !btn.textContent.includes('Create'));
        
        if (signinButton) {
            signinButton.click();
            await delay(1000);
            logSuccess('Switched to signin mode');
        }
        
        // Fill form
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) {
            logError('Email or password input not found');
            return false;
        }
        
        emailInput.value = '';
        passwordInput.value = '';
        emailInput.value = ADMIN_TEST_EMAIL;
        passwordInput.value = ADMIN_TEST_PASSWORD;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        logSuccess('Filled signin form');
        
        // Submit form
        const submitButton = document.querySelector('button[type="submit"]') ||
                           Array.from(document.querySelectorAll('button'))
                               .find(btn => btn.textContent.includes('Sign In'));
        
        if (!submitButton) {
            logError('Submit button not found');
            return false;
        }
        
        submitButton.click();
        logSuccess('Submitted signin form');
        
        // Wait for dashboard
        await delay(5000);
        
        // Check if dashboard is loaded
        const isDashboard = document.body.textContent.includes('Dashboard') ||
                           document.body.textContent.includes('Admin Panel') ||
                           document.body.textContent.includes('Logout');
        
        if (isDashboard) {
            logSuccess('Admin signin successful - dashboard loaded!');
            return true;
        } else {
            logError('Dashboard not loaded after signin');
            return false;
        }
        
    } catch (error) {
        logError(`Admin signin failed: ${error.message}`);
        return false;
    }
}

async function testAdminLogout() {
    log('Starting Admin Logout Test...');
    
    try {
        // Find logout button
        const logoutButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Logout') || btn.textContent.includes('Sign Out'));
        
        if (!logoutButton) {
            logError('Logout button not found');
            return false;
        }
        
        logoutButton.click();
        logSuccess('Clicked logout button');
        
        await delay(3000);
        
        // Check if redirected to home
        const isHome = !document.body.textContent.includes('Dashboard') &&
                      (document.body.textContent.includes('Sign In') || 
                       document.body.textContent.includes('Login') ||
                       document.body.textContent.includes('Home'));
        
        if (isHome) {
            logSuccess('Admin logout successful - redirected to home!');
            return true;
        } else {
            logError('Logout did not redirect properly');
            return false;
        }
        
    } catch (error) {
        logError(`Admin logout failed: ${error.message}`);
        return false;
    }
}

async function testAdminSessionPersistence() {
    log('Starting Admin Session Persistence Test...');
    
    try {
        // First login again
        await testAdminSignin();
        
        // Simulate navigation away and back
        log('Simulating page navigation...');
        
        // Try to trigger navigation to home and back
        if (typeof window.setPage === 'function') {
            window.setPage('home');
            await delay(2000);
            window.setPage('adminLogin');
            await delay(2000);
        }
        
        // Check if still logged in
        const stillLoggedIn = document.body.textContent.includes('Dashboard') ||
                             !document.body.textContent.includes('Sign In');
        
        if (stillLoggedIn) {
            logSuccess('Admin session persistence working!');
            return true;
        } else {
            logError('Session not persisted');
            return false;
        }
        
    } catch (error) {
        logError(`Session persistence test failed: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runAdminTests() {
    log('🚀 Starting Complete Admin Authentication Tests');
    console.log('=' .repeat(50));
    
    const results = {
        signup: false,
        signin: false,
        logout: false,
        persistence: false
    };
    
    // Run tests in sequence
    results.signup = await testAdminSignup();
    await delay(2000);
    
    if (results.signup) {
        results.signin = await testAdminSignin();
        await delay(2000);
        
        if (results.signin) {
            results.logout = await testAdminLogout();
            await delay(2000);
            
            results.persistence = await testAdminSessionPersistence();
        }
    }
    
    // Print results
    console.log('\n📊 ADMIN TEST RESULTS');
    console.log('=' .repeat(30));
    console.log(`Signup: ${results.signup ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Signin: ${results.signin ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Logout: ${results.logout ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Persistence: ${results.persistence ? '✅ PASS' : '❌ FAIL'}`);
    
    const passed = Object.values(results).filter(Boolean).length;
    console.log(`\nOverall: ${passed}/4 tests passed`);
    
    return results;
}

// Make functions available globally
window.adminTests = {
    runAdminTests,
    testAdminSignup,
    testAdminSignin,
    testAdminLogout,
    testAdminSessionPersistence
};

console.log('🧪 Admin Test Suite Loaded!');
console.log('Run: window.adminTests.runAdminTests()');
console.log('Or run individual tests:');
console.log('- window.adminTests.testAdminSignup()');
console.log('- window.adminTests.testAdminSignin()');
console.log('- window.adminTests.testAdminLogout()');
console.log('- window.adminTests.testAdminSessionPersistence()');
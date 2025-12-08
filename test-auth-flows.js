/**
 * Authentication Flow Test Script
 * Tests all login pages for account creation, sign-in, dashboard access, and session persistence
 */

// Test configurations
const TEST_USERS = {
    admin: {
        email: 'test.admin@indastreet.com',
        password: 'TestAdmin123!'
    },
    therapist: {
        email: 'test.therapist@indastreet.com', 
        password: 'TestTherapist123!'
    },
    agent: {
        email: 'test.agent@indastreet.com',
        password: 'TestAgent123!'
    },
    hotel: {
        email: 'test.hotel@indastreet.com',
        password: 'TestHotel123!'
    },
    place: {
        email: 'test.place@indastreet.com',
        password: 'TestPlace123!'
    },
    villa: {
        email: 'test.villa@indastreet.com',
        password: 'TestVilla123!'
    }
};

// Test status tracking
const testResults = {
    admin: { signup: false, signin: false, dashboard: false, logout: false, persistence: false },
    therapist: { signup: false, signin: false, dashboard: false, logout: false, persistence: false },
    agent: { signup: false, signin: false, dashboard: false, logout: false, persistence: false },
    hotel: { signup: false, signin: false, dashboard: false, logout: false, persistence: false },
    place: { signup: false, signin: false, dashboard: false, logout: false, persistence: false },
    villa: { signup: false, signin: false, dashboard: false, logout: false, persistence: false }
};

// Utility functions for testing
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logTestResult(userType, step, success, error = null) {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${userType.toUpperCase()} ${step}: ${success ? 'PASSED' : 'FAILED'}`);
    if (error) {
        console.error(`   Error: ${error}`);
    }
    testResults[userType][step] = success;
}

// Test navigation helpers
function navigateToLoginPage(userType) {
    const routes = {
        admin: () => window.location.hash = '#admin-login',
        therapist: () => window.location.hash = '#therapist-login', 
        agent: () => window.location.hash = '#agent-login',
        hotel: () => window.location.hash = '#hotel-login',
        place: () => window.location.hash = '#place-login',
        villa: () => window.location.hash = '#villa-login'
    };
    
    if (routes[userType]) {
        routes[userType]();
        return true;
    }
    return false;
}

// Form interaction helpers
function fillLoginForm(email, password, isSignUp = false) {
    try {
        // Find email input
        const emailInput = document.querySelector('input[type="email"]') || 
                          document.querySelector('input[placeholder*="email" i]');
        if (!emailInput) throw new Error('Email input not found');
        
        // Find password input
        const passwordInput = document.querySelector('input[type="password"]') || 
                             document.querySelector('input[placeholder*="password" i]');
        if (!passwordInput) throw new Error('Password input not found');
        
        // Clear and fill inputs
        emailInput.value = '';
        passwordInput.value = '';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        emailInput.value = email;
        passwordInput.value = password;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        return true;
    } catch (error) {
        console.error('Error filling form:', error);
        return false;
    }
}

function toggleSignUpMode(enable = true) {
    try {
        // Look for toggle buttons
        const signUpButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Create Account') || btn.textContent.includes('Sign Up'));
        const signInButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Sign In') && !btn.textContent.includes('Create'));
        
        if (enable && signUpButton) {
            signUpButton.click();
            return true;
        } else if (!enable && signInButton) {
            signInButton.click();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error toggling sign up mode:', error);
        return false;
    }
}

function submitForm() {
    try {
        // Find submit button
        const submitButton = document.querySelector('button[type="submit"]') ||
                           Array.from(document.querySelectorAll('button'))
                               .find(btn => btn.textContent.includes('Create Account') || 
                                          btn.textContent.includes('Sign In'));
        
        if (!submitButton) throw new Error('Submit button not found');
        
        submitButton.click();
        return true;
    } catch (error) {
        console.error('Error submitting form:', error);
        return false;
    }
}

// Test individual user type
async function testUserType(userType) {
    console.log(`\n🧪 Testing ${userType.toUpperCase()} Authentication Flow`);
    console.log('='.repeat(50));
    
    const testUser = TEST_USERS[userType];
    if (!testUser) {
        console.error(`❌ No test configuration for ${userType}`);
        return;
    }
    
    try {
        // Step 1: Navigate to login page
        console.log(`📱 Step 1: Navigating to ${userType} login page...`);
        if (!navigateToLoginPage(userType)) {
            logTestResult(userType, 'signup', false, 'Navigation failed');
            return;
        }
        
        await delay(2000); // Wait for page to load
        
        // Step 2: Test account creation
        console.log(`📝 Step 2: Testing ${userType} account creation...`);
        
        // Switch to sign up mode
        toggleSignUpMode(true);
        await delay(1000);
        
        // Fill signup form
        if (!fillLoginForm(testUser.email, testUser.password, true)) {
            logTestResult(userType, 'signup', false, 'Failed to fill signup form');
            return;
        }
        
        // Submit signup form
        if (!submitForm()) {
            logTestResult(userType, 'signup', false, 'Failed to submit signup form');
            return;
        }
        
        // Wait for response
        await delay(3000);
        
        // Check for success message or automatic switch to sign-in
        const hasSuccessMessage = document.body.textContent.includes('Account created successfully') ||
                                 document.body.textContent.includes('created successfully') ||
                                 document.querySelector('.text-green');
        
        logTestResult(userType, 'signup', hasSuccessMessage, hasSuccessMessage ? null : 'No success message found');
        
        // Step 3: Test sign in
        console.log(`🔐 Step 3: Testing ${userType} sign in...`);
        
        // Switch to sign in mode if not already
        toggleSignUpMode(false);
        await delay(1000);
        
        // Fill signin form
        if (!fillLoginForm(testUser.email, testUser.password, false)) {
            logTestResult(userType, 'signin', false, 'Failed to fill signin form');
            return;
        }
        
        // Submit signin form
        if (!submitForm()) {
            logTestResult(userType, 'signin', false, 'Failed to submit signin form');
            return;
        }
        
        // Wait for response and check for dashboard navigation
        await delay(3000);
        
        const isDashboardVisible = window.location.href.includes('dashboard') ||
                                  document.body.textContent.includes('Dashboard') ||
                                  document.body.textContent.includes('Welcome') ||
                                  document.querySelector('[data-testid="dashboard"]');
        
        logTestResult(userType, 'signin', isDashboardVisible, isDashboardVisible ? null : 'Dashboard not visible after signin');
        
        // Step 4: Test dashboard access and logout button
        if (isDashboardVisible) {
            console.log(`🏠 Step 4: Testing ${userType} dashboard functionality...`);
            
            // Check for logout button
            const logoutButton = Array.from(document.querySelectorAll('button'))
                .find(btn => btn.textContent.includes('Logout') || btn.textContent.includes('Sign Out'));
            
            logTestResult(userType, 'dashboard', !!logoutButton, logoutButton ? null : 'Logout button not found');
            
            // Step 5: Test logout
            if (logoutButton) {
                console.log(`🚪 Step 5: Testing ${userType} logout...`);
                
                logoutButton.click();
                await delay(2000);
                
                // Check if redirected to home/login page
                const isLoggedOut = window.location.href.includes('home') ||
                                   !window.location.href.includes('dashboard') ||
                                   document.body.textContent.includes('Sign In') ||
                                   document.body.textContent.includes('Login');
                
                logTestResult(userType, 'logout', isLoggedOut, isLoggedOut ? null : 'Logout did not redirect properly');
            }
        }
        
        // Step 6: Test session persistence (navigate away and back)
        console.log(`🔄 Step 6: Testing ${userType} session persistence...`);
        
        // First login again
        navigateToLoginPage(userType);
        await delay(1000);
        
        fillLoginForm(testUser.email, testUser.password, false);
        submitForm();
        await delay(3000);
        
        // Navigate to home
        window.location.hash = '#home';
        await delay(2000);
        
        // Navigate back to dashboard
        navigateToLoginPage(userType);
        await delay(2000);
        
        // Check if still logged in (should auto-redirect to dashboard or show logged-in state)
        const persistenceWorking = window.location.href.includes('dashboard') ||
                                  document.body.textContent.includes('Dashboard') ||
                                  !document.body.textContent.includes('Sign In');
        
        logTestResult(userType, 'persistence', persistenceWorking, persistenceWorking ? null : 'Session not persisted');
        
    } catch (error) {
        console.error(`❌ Error testing ${userType}:`, error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Authentication Flow Tests');
    console.log('=' .repeat(60));
    
    const userTypes = ['admin', 'therapist', 'agent', 'hotel', 'place', 'villa'];
    
    for (const userType of userTypes) {
        await testUserType(userType);
        await delay(2000); // Brief pause between user type tests
    }
    
    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('=' .repeat(40));
    
    for (const [userType, results] of Object.entries(testResults)) {
        console.log(`\n${userType.toUpperCase()}:`);
        console.log(`  Signup: ${results.signup ? '✅' : '❌'}`);
        console.log(`  Signin: ${results.signin ? '✅' : '❌'}`);
        console.log(`  Dashboard: ${results.dashboard ? '✅' : '❌'}`);
        console.log(`  Logout: ${results.logout ? '✅' : '❌'}`);
        console.log(`  Persistence: ${results.persistence ? '✅' : '❌'}`);
        
        const passed = Object.values(results).filter(Boolean).length;
        const total = Object.keys(results).length;
        console.log(`  Overall: ${passed}/${total} tests passed`);
    }
}

// Make functions available globally for manual testing
window.testAuth = {
    runAllTests,
    testUserType,
    navigateToLoginPage,
    fillLoginForm,
    submitForm,
    testResults,
    TEST_USERS
};

console.log('🧪 Authentication Test Suite Loaded!');
console.log('Run window.testAuth.runAllTests() to start comprehensive testing');
console.log('Or test individual user types with window.testAuth.testUserType("admin")');
// Updated Therapist Authentication Test Script
// Paste this into browser console on http://localhost:3007/

console.log('🧪 Testing Therapist Authentication - Updated Fix...');

// Test function for therapist account creation with both fixes
async function testTherapistAuthComplete() {
    try {
        console.group('🔵 Complete Therapist Authentication Test');
        
        // Import the auth function (assumes it's available globally)
        const { therapistAuth } = window;
        
        if (!therapistAuth) {
            console.error('❌ therapistAuth not found. Make sure you\'re on a page that loads the auth module.');
            console.log('💡 Try navigating to the therapist login page first');
            return;
        }
        
        // Test data
        const testEmail = `test-therapist-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        console.log('🔵 Testing therapist sign up with all fixes...', { email: testEmail });
        console.log('✅ Fixes applied: specialization + availability fields');
        
        // Test sign up
        const signUpResult = await therapistAuth.signUp(testEmail, testPassword);
        
        if (signUpResult.success) {
            console.log('✅ Therapist sign up successful!', signUpResult);
            console.log('🎉 Both specialization and availability fixes working!');
            
            // Test sign in
            console.log('🔵 Testing therapist sign in...');
            const signInResult = await therapistAuth.signIn(testEmail, testPassword);
            
            if (signInResult.success) {
                console.log('✅ Therapist sign in successful!', signInResult);
                console.log('🎉 Complete therapist authentication flow works!');
                
                return {
                    signUp: signUpResult,
                    signIn: signInResult,
                    success: true,
                    message: 'All therapist authentication tests passed!'
                };
            } else {
                console.error('❌ Therapist sign in failed:', signInResult.error);
                return {
                    signUp: signUpResult,
                    signIn: signInResult,
                    success: false,
                    error: 'Sign in failed'
                };
            }
        } else {
            console.error('❌ Therapist sign up failed:', signUpResult.error);
            
            // Check for specific missing attribute errors
            if (signUpResult.error) {
                if (signUpResult.error.includes('specialization')) {
                    console.error('🚨 SPECIALIZATION ERROR STILL EXISTS!');
                }
                if (signUpResult.error.includes('availability')) {
                    console.error('🚨 AVAILABILITY ERROR STILL EXISTS!');
                }
                if (signUpResult.error.includes('Missing required attribute')) {
                    console.error('🚨 OTHER MISSING ATTRIBUTE ERROR!');
                    console.error('Check the error message for which attribute is missing');
                }
            }
            
            return {
                signUp: signUpResult,
                success: false,
                error: signUpResult.error
            };
        }
        
    } catch (error) {
        console.error('💥 Test execution error:', error);
        return {
            success: false,
            error: error.message,
            exception: true
        };
    } finally {
        console.groupEnd();
    }
}

// Quick test for specific missing attributes
async function testMissingAttributes() {
    console.group('🔍 Testing for Missing Required Attributes');
    
    try {
        // This should reveal any missing required attributes
        const result = await testTherapistAuthComplete();
        
        if (result.success) {
            console.log('✅ No missing attribute errors found!');
        } else if (result.error && result.error.includes('Missing required attribute')) {
            const match = result.error.match(/Missing required attribute "([^"]+)"/);
            if (match) {
                console.error(`🎯 Missing attribute identified: ${match[1]}`);
                console.error('This attribute needs to be added to therapist auth function');
            }
        }
        
        return result;
    } catch (error) {
        console.error('Test failed:', error);
        return { success: false, error: error.message };
    } finally {
        console.groupEnd();
    }
}

// Auto-run if auth is available, otherwise provide instructions
if (typeof window !== 'undefined' && window.therapistAuth) {
    testTherapistAuthComplete();
} else {
    console.log('📋 Instructions:');
    console.log('1. Navigate to the therapist login page: http://localhost:3007/therapist-login');
    console.log('2. Run: testTherapistAuthComplete()');
    console.log('3. Or run: testMissingAttributes() to check for missing attributes');
    console.log('4. Or manually test account creation through the UI');
}

// Make test functions available globally
if (typeof window !== 'undefined') {
    window.testTherapistAuthComplete = testTherapistAuthComplete;
    window.testMissingAttributes = testMissingAttributes;
    
    console.log('🛠️ Available functions:');
    console.log('  - testTherapistAuthComplete() - Full authentication test');
    console.log('  - testMissingAttributes() - Check for missing attributes');
}
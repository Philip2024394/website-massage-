// Final Therapist Authentication Test Script
// Paste this into browser console on http://localhost:3008/

console.log('🧪 Testing Therapist Authentication - Final Fix...');

// Test function for therapist account creation with all fixes applied
async function testTherapistAuthFinal() {
    try {
        console.group('🔵 Final Therapist Authentication Test');
        
        // Import the auth function (assumes it's available globally)
        const { therapistAuth } = window;
        
        if (!therapistAuth) {
            console.error('❌ therapistAuth not found. Make sure you\'re on a page that loads the auth module.');
            console.log('💡 Try navigating to the therapist login page first');
            return;
        }
        
        // Test data
        const testEmail = `test-therapist-final-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        console.log('🔵 Testing therapist sign up with ALL fixes...', { email: testEmail });
        console.log('✅ Fixes applied:');
        console.log('  - Added specialization field');
        console.log('  - Added availability field');
        console.log('  - Removed createdAt field (unknown attribute)');
        
        // Test sign up
        const signUpResult = await therapistAuth.signUp(testEmail, testPassword);
        
        if (signUpResult.success) {
            console.log('✅ Therapist sign up successful!', signUpResult);
            console.log('🎉 All attribute fixes working correctly!');
            
            // Test sign in
            console.log('🔵 Testing therapist sign in...');
            const signInResult = await therapistAuth.signIn(testEmail, testPassword);
            
            if (signInResult.success) {
                console.log('✅ Therapist sign in successful!', signInResult);
                console.log('🎉 Complete therapist authentication flow works perfectly!');
                
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
            
            // Check for specific attribute errors
            if (signUpResult.error) {
                if (signUpResult.error.includes('specialization')) {
                    console.error('🚨 SPECIALIZATION ERROR STILL EXISTS!');
                }
                if (signUpResult.error.includes('availability')) {
                    console.error('🚨 AVAILABILITY ERROR STILL EXISTS!');
                }
                if (signUpResult.error.includes('createdAt')) {
                    console.error('🚨 CREATED_AT ERROR STILL EXISTS!');
                }
                if (signUpResult.error.includes('Unknown attribute')) {
                    console.error('🚨 UNKNOWN ATTRIBUTE ERROR!');
                    const match = signUpResult.error.match(/Unknown attribute: "([^"]+)"/);
                    if (match) {
                        console.error(`🎯 Unknown attribute: ${match[1]}`);
                        console.error('This attribute should be removed from therapist auth function');
                    }
                }
                if (signUpResult.error.includes('Missing required attribute')) {
                    console.error('🚨 MISSING REQUIRED ATTRIBUTE ERROR!');
                    const match = signUpResult.error.match(/Missing required attribute "([^"]+)"/);
                    if (match) {
                        console.error(`🎯 Missing attribute: ${match[1]}`);
                        console.error('This attribute should be added to therapist auth function');
                    }
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

// Quick diagnostic for any remaining attribute issues
async function diagnoseAttributeErrors() {
    console.group('🔍 Diagnosing Therapist Attribute Errors');
    
    const result = await testTherapistAuthFinal();
    
    if (result.success) {
        console.log('✅ No attribute errors found! Therapist auth is working perfectly.');
    } else if (result.error) {
        console.log('📋 Error Analysis:');
        
        // Parse specific error types
        if (result.error.includes('Unknown attribute')) {
            console.error('🔥 UNKNOWN ATTRIBUTE found - remove from auth function');
        }
        if (result.error.includes('Missing required attribute')) {
            console.error('🔥 MISSING REQUIRED ATTRIBUTE found - add to auth function');
        }
        if (result.error.includes('Invalid document structure')) {
            console.error('🔥 DOCUMENT STRUCTURE ERROR - check field formats');
        }
        
        console.log('Full error:', result.error);
    }
    
    console.groupEnd();
    return result;
}

// Auto-run if auth is available, otherwise provide instructions
if (typeof window !== 'undefined' && window.therapistAuth) {
    testTherapistAuthFinal();
} else {
    console.log('📋 Instructions:');
    console.log('1. Navigate to therapist login page: http://localhost:3008/therapist-login');
    console.log('2. Run: testTherapistAuthFinal()');
    console.log('3. Or run: diagnoseAttributeErrors() to check for remaining issues');
    console.log('4. Or manually test account creation through the UI');
}

// Make test functions available globally
if (typeof window !== 'undefined') {
    window.testTherapistAuthFinal = testTherapistAuthFinal;
    window.diagnoseAttributeErrors = diagnoseAttributeErrors;
    
    console.log('🛠️ Available functions:');
    console.log('  - testTherapistAuthFinal() - Complete final authentication test');
    console.log('  - diagnoseAttributeErrors() - Detailed error analysis');
}
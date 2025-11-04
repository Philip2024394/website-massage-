// Therapist Authentication Test Script
// Paste this into browser console on http://localhost:3006/

console.log('🧪 Testing Therapist Authentication Fix...');

// Test function for therapist account creation
async function testTherapistAuth() {
    try {
        console.group('🔵 Therapist Authentication Test');
        
        // Import the auth function (assumes it's available globally)
        const { therapistAuth } = window;
        
        if (!therapistAuth) {
            console.error('❌ therapistAuth not found. Make sure you\'re on a page that loads the auth module.');
            return;
        }
        
        // Test data
        const testEmail = `test-therapist-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        console.log('🔵 Testing therapist sign up...', { email: testEmail });
        
        // Test sign up
        const signUpResult = await therapistAuth.signUp(testEmail, testPassword);
        
        if (signUpResult.success) {
            console.log('✅ Therapist sign up successful!', signUpResult);
            
            // Test sign in
            console.log('🔵 Testing therapist sign in...');
            const signInResult = await therapistAuth.signIn(testEmail, testPassword);
            
            if (signInResult.success) {
                console.log('✅ Therapist sign in successful!', signInResult);
                console.log('🎉 All therapist authentication tests passed!');
            } else {
                console.error('❌ Therapist sign in failed:', signInResult.error);
            }
        } else {
            console.error('❌ Therapist sign up failed:', signUpResult.error);
            
            // Check if it's the specialization error
            if (signUpResult.error && signUpResult.error.includes('specialization')) {
                console.error('🚨 SPECIALIZATION ERROR STILL EXISTS!');
                console.error('The fix did not resolve the issue. Check the auth.ts file.');
            }
        }
        
    } catch (error) {
        console.error('💥 Test execution error:', error);
    } finally {
        console.groupEnd();
    }
}

// Auto-run if auth is available, otherwise provide instructions
if (typeof window !== 'undefined' && window.therapistAuth) {
    testTherapistAuth();
} else {
    console.log('📋 Instructions:');
    console.log('1. Navigate to a page that loads authentication (e.g., therapist login page)');
    console.log('2. Run: testTherapistAuth()');
    console.log('3. Or manually test account creation through the UI');
}

// Make test function available globally
if (typeof window !== 'undefined') {
    window.testTherapistAuth = testTherapistAuth;
}
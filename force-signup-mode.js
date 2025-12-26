// Force signup mode on current AuthPage
// Run this in the browser console to switch to signup mode

// Method 1: Navigate to signup URL
console.log('Method 1: Navigate to signup URL');
window.location.href = '/signup';

// Method 2: If on AuthPage, try to trigger signup mode via URL hash
console.log('Method 2: Use URL hash to force signup');
window.location.hash = '#signup';

// Method 3: Programmatically force signup state (if React DevTools available)
console.log('Method 3: Force signup state (requires React DevTools)');
console.log('Look for AuthPage component and change mode prop to "signup"');

console.log('\n=== THERAPIST ACCOUNT CREATION STEPS ===');
console.log('1. Select "Massage Therapist" from the dropdown');
console.log('2. Enter your email address');
console.log('3. Create a strong password (you can see it now!)');
console.log('4. Check the terms and conditions box');
console.log('5. Click "Create Account"');
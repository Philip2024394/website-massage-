/*
 * QUICK CONSOLE COMMANDS FOR CLEARING PENDING BOOKINGS
 * 
 * Copy and paste these commands in your browser console (F12 > Console)
 * to quickly clear pending booking locks for testing.
 */

// 🔥 QUICK CLEAR ALL - Run this first
console.log('🧹 Clearing all pending booking locks...');
localStorage.removeItem('pending_booking');
sessionStorage.removeItem('pending_booking');
localStorage.removeItem('bookingLock');
sessionStorage.removeItem('bookingLock');
console.log('✅ All local locks cleared! You can now test booking buttons.');

// 🔍 CHECK CURRENT STATE - Run this to see what's stored
console.log('📋 Current booking lock status:');
console.log('localStorage pending_booking:', localStorage.getItem('pending_booking'));
console.log('sessionStorage pending_booking:', sessionStorage.getItem('pending_booking'));
console.log('localStorage bookingLock:', localStorage.getItem('bookingLock'));

// 🗄️ CLEAR ALL STORAGE (NUCLEAR OPTION) - Only if needed
// localStorage.clear();
// sessionStorage.clear();
// console.log('💥 All browser storage cleared!');

console.log('');
console.log('🎯 NOW TRY TESTING:');
console.log('1. Refresh the page');
console.log('2. Try clicking booking buttons');
console.log('3. Should work without "pending booking" errors');
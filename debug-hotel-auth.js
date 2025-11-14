// Debug Hotel Login Authentication State
// This will help us understand why the hotel dashboard is blank

console.log('🔍 DEBUGGING HOTEL DASHBOARD BLANK PAGE');
console.log('='.repeat(50));

// Check localStorage for authentication states
console.log('📱 LocalStorage Authentication States:');
Object.keys(localStorage).forEach(key => {
    if (key.includes('hotel') || key.includes('logged') || key.includes('user') || key.includes('auth')) {
        console.log(`${key}:`, localStorage.getItem(key));
    }
});

// Check if hotel authentication variables are set
console.log('🏨 Hotel Authentication Variables:');
console.log('isHotelLoggedIn:', window.isHotelLoggedIn || 'undefined');
console.log('loggedInUser:', window.loggedInUser || 'undefined');

// If using React, you can also add this to your component
// Add this to HotelDashboardPage component props logging
console.log('🎯 Component Props Received:');
console.log('hotelId:', window.hotelId || 'check component props');

console.log('='.repeat(50));
console.log('🔧 Possible Issues:');
console.log('1. isHotelLoggedIn not set to true');
console.log('2. loggedInUser.type not set to "hotel"');  
console.log('3. Multiple auth states active (contamination)');
console.log('4. Authentication state not persisting after login');
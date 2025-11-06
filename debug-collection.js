// Debug script to test Appwrite collection access
// Run this in browser console to test collection ID

console.log('🔧 DEBUG: Testing Appwrite Collection Access');

// Test the collection ID
const COLLECTION_ID = 'places_collection_id';
console.log('🔧 Collection ID:', COLLECTION_ID);

// Check if APPWRITE_CONFIG is accessible
if (window.APPWRITE_CONFIG) {
    console.log('🔧 APPWRITE_CONFIG found:', window.APPWRITE_CONFIG);
} else {
    console.log('🔧 APPWRITE_CONFIG not found in window');
}

// Check localStorage for session data
const sessionData = localStorage.getItem('app_session');
if (sessionData) {
    console.log('🔧 Session data:', JSON.parse(sessionData));
} else {
    console.log('🔧 No session data found');
}

// Check if places data is available
const placesData = localStorage.getItem('app_places');
if (placesData) {
    console.log('🔧 Places data:', JSON.parse(placesData));
} else {
    console.log('🔧 No places data found');
}

console.log('🔧 DEBUG: Test complete');
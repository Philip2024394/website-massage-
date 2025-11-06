// Place Profile Data Persistence Utility
// Use this in browser console to check saved profile data

const checkPlaceProfileData = (placeId = 'temp') => {
    const profileKey = `massage_place_profile_${placeId}`;
    const savedData = localStorage.getItem(profileKey);
    
    if (savedData) {
        console.log('✅ Found saved profile data:');
        console.log(JSON.parse(savedData));
        return true;
    } else {
        console.log('❌ No saved profile data found');
        return false;
    }
};

const clearPlaceProfileData = (placeId = 'temp') => {
    const profileKey = `massage_place_profile_${placeId}`;
    localStorage.removeItem(profileKey);
    console.log('🗑️ Cleared profile data for:', profileKey);
};

// Add to window for console access
window.checkPlaceProfileData = checkPlaceProfileData;
window.clearPlaceProfileData = clearPlaceProfileData;

console.log('🔧 Place profile data utilities loaded!');
console.log('Use checkPlaceProfileData() or clearPlaceProfileData() in console');
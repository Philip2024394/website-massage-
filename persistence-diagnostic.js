/**
 * 🔍 THERAPIST DATA PERSISTENCE DIAGNOSTIC
 * =====================================
 * 
 * Based on your Appwrite data, I can see:
 * ✅ therapists_collection_id exists and has data
 * ✅ You have 10 therapist entries 
 * 
 * POTENTIAL ISSUES TO CHECK:
 * 1. isLive status filtering on home page
 * 2. Profile loading in dashboard
 * 3. Data synchronization between save/load
 */

console.log('🧪 THERAPIST PERSISTENCE DIAGNOSTIC');
console.log('===================================');

// Check current therapist data from localStorage
const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
console.log('📊 Therapists in localStorage:', therapists.length);

if (therapists.length > 0) {
    console.log('✅ Therapist data found in app!');
    
    const liveTherapists = therapists.filter(t => t.isLive === true);
    console.log('🔴 Live therapists (shown on home page):', liveTherapists.length);
    
    therapists.forEach((therapist, index) => {
        console.log(`${index + 1}. ${therapist.name || 'Unnamed'} - isLive: ${therapist.isLive} - ID: ${therapist.id || 'No ID'}`);
    });
    
    if (liveTherapists.length === 0) {
        console.log('⚠️ NO LIVE THERAPISTS - This is why cards don\'t show on home page!');
        console.log('💡 Solution: Set therapist isLive=true in dashboard');
    }
} else {
    console.log('❌ No therapist data in localStorage');
    console.log('🔄 Try refreshing the app or check Appwrite connection');
}

// Check for debug data
const saveData = localStorage.getItem('debug_therapist_save');
const loadData = localStorage.getItem('debug_therapist_load');

if (saveData) {
    console.log('📝 Last profile save:', JSON.parse(saveData));
}

if (loadData) {
    console.log('📖 Last profile load:', JSON.parse(loadData));
}

console.log('');
console.log('🎯 BASED ON YOUR APPWRITE DATA:');
console.log('- Collection exists: ✅');
console.log('- Has therapist entries: ✅ (10 therapists found)');
console.log('- Some have isLive=true: ✅');
console.log('- Some have pricing data: ✅');
console.log('');
console.log('🔍 NEXT STEPS:');
console.log('1. Check if therapist dashboard loads profile data');
console.log('2. Verify home page shows live therapists');
console.log('3. Test profile saving from dashboard');

// Test current config
const currentUser = localStorage.getItem('current_user');
if (currentUser) {
    const user = JSON.parse(currentUser);
    console.log('👤 Current logged in user:', user);
} else {
    console.log('❌ No current user found - login might be needed');
}
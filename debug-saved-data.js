// 🔍 DEBUGGING SCRIPT - Check Saved Data
// Copy and paste this into browser console (F12)

console.log('🔍 DEBUGGING: Checking saved therapist data...');

// 1. Check if localStorage works
try {
    localStorage.setItem('debug_test', 'working');
    const test = localStorage.getItem('debug_test');
    console.log('✅ LocalStorage working:', test === 'working');
    localStorage.removeItem('debug_test');
} catch (e) {
    console.log('❌ LocalStorage error:', e);
}

// 2. Check for local database
const localDB = localStorage.getItem('localDatabase');
console.log('📊 Local database exists:', !!localDB);

if (localDB) {
    try {
        const data = JSON.parse(localDB);
        console.log('📊 Database content:');
        console.log('   - Therapists count:', data.therapists?.length || 0);
        console.log('   - Places count:', data.places?.length || 0);
        console.log('   - Last updated:', data.lastUpdated);
        
        // Show therapist details
        if (data.therapists && data.therapists.length > 0) {
            console.log('👨‍⚕️ Saved therapists:');
            data.therapists.forEach((t, i) => {
                console.log(`   ${i + 1}. ${t.name} - ${t.location} - Active: ${t.isActive}`);
                console.log(`      Created: ${t.createdAt}`);
                console.log(`      ID: ${t.id}`);
            });
        } else {
            console.log('❌ No therapists found in database');
        }
    } catch (e) {
        console.log('❌ Error parsing database:', e);
    }
} else {
    console.log('❌ No local database found');
}

// 3. Check for debug save info
const debugInfo = localStorage.getItem('debug_therapist_save');
if (debugInfo) {
    try {
        const parsed = JSON.parse(debugInfo);
        console.log('🗂️ Last save attempt:');
        console.log('   - Time:', parsed.timestamp);
        console.log('   - Therapist ID:', parsed.therapistId);
        console.log('   - Save function available:', parsed.onSaveExists);
        console.log('   - Data keys:', Object.keys(parsed.saveData || {}));
    } catch (e) {
        console.log('❌ Error parsing debug info:', e);
    }
} else {
    console.log('📝 No debug save info found');
}

// 4. Check last save status
const lastSaveSuccess = localStorage.getItem('lastSaveSuccess');
const lastSaveTime = localStorage.getItem('lastSaveTime');
const lastSaveError = localStorage.getItem('lastSaveError');

console.log('📝 Last save status:');
console.log('   - Success:', lastSaveSuccess);
console.log('   - Time:', lastSaveTime);
console.log('   - Error:', lastSaveError);

// 5. Check current user session
const userSession = localStorage.getItem('userSession');
if (userSession) {
    try {
        const session = JSON.parse(userSession);
        console.log('👤 Current session:');
        console.log('   - User type:', session.userType);
        console.log('   - User ID:', session.userId || session.id);
        console.log('   - Email:', session.email);
    } catch (e) {
        console.log('❌ Error parsing session:', e);
    }
} else {
    console.log('❌ No user session found');
}

console.log('🎯 Debug complete. Check results above.');
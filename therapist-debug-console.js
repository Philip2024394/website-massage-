/* 
THERAPIST DEBUG CONSOLE HELPER
Copy and paste this into browser console (F12) to debug therapist issues
*/

window.therapistDebug = {
    // Check if therapist save was successful
    checkLastSave: () => {
        const saveData = localStorage.getItem('debug_therapist_save');
        if (saveData) {
            console.log('📋 Last Save Attempt:', JSON.parse(saveData));
            return JSON.parse(saveData);
        } else {
            console.log('❌ No save attempt found');
            return null;
        }
    },
    
    // Check if therapist profile was loaded
    checkLastLoad: () => {
        const loadData = localStorage.getItem('debug_therapist_load');
        if (loadData) {
            console.log('📖 Last Profile Load:', JSON.parse(loadData));
            return JSON.parse(loadData);
        } else {
            console.log('❌ No profile load found');
            return null;
        }
    },
    
    // Check therapists in app state
    checkTherapists: () => {
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        console.log('👥 Total Therapists in App:', therapists.length);
        console.log('🔴 Live Therapists:', therapists.filter(t => t.isLive === true));
        console.log('⚪ Inactive Therapists:', therapists.filter(t => t.isLive === false));
        return therapists;
    },
    
    // Find specific therapist by ID or name
    findTherapist: (identifier) => {
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        const found = therapists.find(t => 
            t.id === identifier || 
            t.$id === identifier || 
            t.name.toLowerCase().includes(identifier.toLowerCase())
        );
        if (found) {
            console.log('✅ Found Therapist:', found);
        } else {
            console.log('❌ Therapist not found:', identifier);
        }
        return found;
    },
    
    // Force therapist to go live (emergency fix)
    forceLive: (identifier) => {
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        const updated = therapists.map(t => {
            if (t.id === identifier || t.$id === identifier || t.name.toLowerCase().includes(identifier.toLowerCase())) {
                console.log('🔄 Setting therapist to live:', t.name);
                return { ...t, isLive: true };
            }
            return t;
        });
        localStorage.setItem('app_therapists', JSON.stringify(updated));
        console.log('✅ Force live update complete. Refresh page to see changes.');
        return updated;
    },
    
    // Clear all debug data and start fresh
    clearDebugData: () => {
        localStorage.removeItem('debug_therapist_save');
        localStorage.removeItem('debug_therapist_load');
        console.log('🧹 Debug data cleared');
    },
    
    // Full diagnostic report
    fullDiagnostic: () => {
        console.log('🔍 FULL THERAPIST DIAGNOSTIC REPORT');
        console.log('=====================================');
        
        // Check save data
        const saveData = therapistDebug.checkLastSave();
        
        // Check load data  
        const loadData = therapistDebug.checkLastLoad();
        
        // Check therapist state
        const therapists = therapistDebug.checkTherapists();
        
        // Summary
        console.log('\n📊 SUMMARY:');
        console.log('- Save attempts:', saveData ? '✅ Found' : '❌ None');
        console.log('- Profile loads:', loadData ? '✅ Found' : '❌ None');
        console.log('- Total therapists:', therapists.length);
        console.log('- Live therapists:', therapists.filter(t => t.isLive === true).length);
        
        // Recommendations
        if (saveData && !loadData) {
            console.log('\n⚠️ ISSUE: Save found but no load - profile may not be persisting');
        }
        if (therapists.filter(t => t.isLive === true).length === 0) {
            console.log('\n⚠️ ISSUE: No live therapists found - check isLive status');
        }
        
        return {
            saveData,
            loadData,
            therapists,
            liveCount: therapists.filter(t => t.isLive === true).length
        };
    }
};

// Auto-run diagnostic
console.log('🛠️ Therapist Debug Helper Loaded');
console.log('Available commands:');
console.log('- therapistDebug.fullDiagnostic() - Complete diagnostic');
console.log('- therapistDebug.checkTherapists() - Check therapist state');
console.log('- therapistDebug.findTherapist("name") - Find specific therapist');
console.log('- therapistDebug.forceLive("id") - Force therapist live (emergency)');
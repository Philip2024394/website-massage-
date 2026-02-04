// Emergency Backend Fix
// Paste this in browser console to fix missing therapist data

console.log('🚨 [EMERGENCY FIX] Diagnosing therapist loading issue...');

// Check if React state has therapist data
const checkTherapistState = () => {
    // Look for therapist cards or containers
    const therapistCards = document.querySelectorAll('[class*="therapist"], [data-therapist], .therapist-card');
    const homePage = document.querySelector('[class*="home"], [class*="landing"]');
    
    console.log('🔍 Found therapist elements:', therapistCards.length);
    console.log('🔍 Home page container:', !!homePage);
    
    if (therapistCards.length === 0 && homePage) {
        console.warn('⚠️ ISSUE: No therapist cards found on home page');
        return false;
    }
    
    return therapistCards.length > 0;
};

// Add mock therapist data for testing
const addMockTherapists = () => {
    console.log('🧪 [MOCK DATA] Adding sample therapists for testing...');
    
    // Try to trigger data refresh
    try {
        // Dispatch custom events that the app listens for
        window.dispatchEvent(new CustomEvent('refreshData', {
            detail: { source: 'manual-fix', type: 'therapists' }
        }));
        
        window.dispatchEvent(new CustomEvent('refresh-therapists', {
            detail: { source: 'emergency-fix' }
        }));
        
        console.log('✅ Dispatched refresh events');
        
    } catch (error) {
        console.error('❌ Failed to dispatch events:', error);
    }
};

// Force re-initialize data fetching
const forceDataRefresh = async () => {
    console.log('🔄 [FORCE REFRESH] Attempting to re-trigger data fetch...');
    
    try {
        // Try to access the data fetching service directly
        const { therapistService } = await import('/src/lib/appwrite/services/therapist.service.js');
        console.log('✅ Therapist service imported');
        
        const therapists = await therapistService.getTherapists();
        console.log('📊 Therapists fetched:', therapists?.length || 0);
        
        if (therapists && therapists.length > 0) {
            console.log('✅ SUCCESS: Therapists loaded from backend');
            console.log('👥 Sample:', therapists.slice(0, 3).map(t => ({
                name: t.name,
                location: t.location,
                id: t.$id
            })));
            
            // Try to trigger UI update
            window.dispatchEvent(new CustomEvent('therapistsLoaded', {
                detail: { therapists, source: 'manual-refresh' }
            }));
            
            return therapists;
        } else {
            console.warn('⚠️ No therapists returned from service');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Force refresh failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            type: error.type
        });
        
        // Show specific error guidance
        if (error.code === 404) {
            console.error('💡 SOLUTION: Collection not found - check .env VITE_THERAPISTS_COLLECTION_ID');
        } else if (error.code === 401) {
            console.error('💡 SOLUTION: Authentication error - check project ID and permissions');
        }
        
        return null;
    }
};

// Check current state
const hasTherapists = checkTherapistState();
console.log('📊 Current state - Has therapists:', hasTherapists);

// If no therapists, try to fix
if (!hasTherapists) {
    console.log('🛠️ [AUTO FIX] No therapists detected, attempting fixes...');
    
    addMockTherapists();
    
    // Try force refresh after short delay
    setTimeout(async () => {
        const result = await forceDataRefresh();
        if (result) {
            console.log('🎉 [SUCCESS] Therapist data loaded successfully');
        } else {
            console.log('❌ [FAILED] Could not load therapist data - check Appwrite configuration');
            
            // Show troubleshooting info
            console.log('\n📋 TROUBLESHOOTING CHECKLIST:');
            console.log('1. Run: node check-collection-status.cjs');
            console.log('2. Check browser Network tab for failed requests');
            console.log('3. Verify .env VITE_THERAPISTS_COLLECTION_ID exists in Appwrite');
            console.log('4. Check Appwrite console for collection permissions');
        }
    }, 2000);
} else {
    console.log('✅ [OK] Therapists are showing correctly');
}

// Make functions available globally
window.forceDataRefresh = forceDataRefresh;
window.checkTherapistState = checkTherapistState;

console.log('💡 Available functions: forceDataRefresh(), checkTherapistState()');
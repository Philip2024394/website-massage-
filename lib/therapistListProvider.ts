/**
 * Therapist List Provider
 * Dynamically fetches Yogyakarta therapists for review initialization
 */

// Cached list of Yogyakarta therapists to avoid repeated fetches
let cachedYogyaTherapists: Array<{ id: string; name: string }> | null = null;

/**
 * Get all Yogyakarta therapists from therapist data
 * This function looks for therapists in the global context or returns a default list
 */
export function getYogyakartaTherapists(): Array<{ id: string; name: string }> {
    // If we have cached data, return it
    if (cachedYogyaTherapists) {
        return cachedYogyaTherapists;
    }
    
    // Try to get therapists from window context (populated by App.tsx)
    if (typeof window !== 'undefined' && (window as any).__YOGYAKARTA_THERAPISTS__) {
        cachedYogyaTherapists = (window as any).__YOGYAKARTA_THERAPISTS__;
        console.log(`✅ Loaded ${cachedYogyaTherapists.length} Yogyakarta therapists from global context`);
        return cachedYogyaTherapists;
    }
    
    // Fallback to hardcoded list (UPDATE THIS WHEN NEW YOGYAKARTA THERAPISTS JOIN)
    // To add a new therapist: 
    // 1. Find their ID in Appwrite therapists collection  
    // 2. Add { id: 'THEIR_ID', name: 'Their Name' } to this list
    // 3. Redeploy the app
    const fallbackList = [
        { id: '692467a3001f6f05aaa1', name: 'Budi' },
        { id: '69499239000c90bfd283', name: 'ww' },
        { id: '694a02cd0036089583db', name: 'ww' },
        { id: '694ed78e002b0c06171e', name: 'Wiwid' },
        // { id: 'WINDA_ID_HERE', name: 'Winda' } // TODO: Add Winda's ID from Appwrite
    ];
    
    console.log(`⚠️ Using fallback list of ${fallbackList.length} Yogyakarta therapists`);
    console.log('💡 To dynamically load therapists, call updateYogyakartaTherapists() with your therapist data');
    return fallbackList;
}

/**
 * Update the cached list of Yogyakarta therapists
 * Call this when new therapist data is loaded
 */
export function updateYogyakartaTherapists(therapists: any[]) {
    const yogyaTherapists = therapists
        .filter(t => {
            const location = (t.location || t.city || '').toLowerCase();
            return location.includes('yogya') || location.includes('jogja');
        })
        .map(t => ({
            id: t.$id || t.id,
            name: t.name
        }));
    
    cachedYogyaTherapists = yogyaTherapists;
    
    // Store in window for global access
    if (typeof window !== 'undefined') {
        (window as any).__YOGYAKARTA_THERAPISTS__ = yogyaTherapists;
    }
    
    console.log(`✅ Updated Yogyakarta therapists cache: ${yogyaTherapists.length} therapists`);
    yogyaTherapists.forEach(t => console.log(`   - ${t.name} (${t.id})`));
    
    return yogyaTherapists;
}

/**
 * Check if a therapist should have auto-reviews initialized
 */
export function shouldInitializeReviews(therapistId: string, location?: string): boolean {
    // Check if therapist is in Yogyakarta
    if (location) {
        const locationLower = location.toLowerCase();
        const isYogya = locationLower.includes('yogya') || locationLower.includes('jogja');
        if (isYogya) return true;
    }
    
    // Check against known Yogyakarta therapists
    const yogyaTherapists = getYogyakartaTherapists();
    return yogyaTherapists.some(t => t.id === therapistId);
}

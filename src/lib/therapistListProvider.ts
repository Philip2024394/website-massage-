/**
 * Therapist List Provider
 * Dynamically fetches Yogyakarta therapists for review initialization
 */

import { logger } from '@/lib/logger.production';

// Cached list of Yogyakarta therapists to avoid repeated fetches
let cachedYogyaTherapists: Array<{ id: string; name: string }> | null = null;

/**
 * Get all Yogyakarta therapists from therapist data
 * This function looks for therapists in the global context or returns empty array
 */
export function getYogyakartaTherapists(): Array<{ id: string; name: string }> {
    // If we have cached data, return it
    if (cachedYogyaTherapists) {
        return cachedYogyaTherapists;
    }
    
    // Try to get therapists from window context (populated by App.tsx)
    if (typeof window !== 'undefined' && (window as any).__YOGYAKARTA_THERAPISTS__) {
        cachedYogyaTherapists = (window as any).__YOGYAKARTA_THERAPISTS__;
        logger.debug(`✅ Loaded ${cachedYogyaTherapists?.length || 0} Yogyakarta therapists from global context`);
        return cachedYogyaTherapists || [];
    }
    
    // 🚨 CRITICAL FIX: Return empty array instead of fallback to prevent overriding real data
    // Fallback should only be used if Appwrite fetch fails completely
    logger.debug(`⚠️ No Yogyakarta therapists loaded yet - returning empty array`);
    logger.debug('💡 Therapists will be populated when updateYogyakartaTherapists() is called with fetched data');
    return [];
}

/**
 * Update the cached list of Yogyakarta therapists
 * Call this when new therapist data is loaded
 */
export function updateYogyakartaTherapists(therapists: any[]) {
    const yogyaTherapists = therapists
        .filter(t => {
            const location = (t.location || '').toLowerCase();
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
    
    logger.debug(`✅ Updated Yogyakarta therapists cache: ${yogyaTherapists.length} therapists`);
    yogyaTherapists.forEach(t => logger.debug(`   - ${t.name} (${t.id})`));
    
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

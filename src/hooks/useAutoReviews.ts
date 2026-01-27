/**
 * Hook to manage auto-updating reviews for specific therapists
 */

import { useEffect, useRef } from 'react';
import { autoReviewService } from '../lib/autoReviewService';
import { useLanguageContext } from '../context/LanguageContext';
import { getYogyakartaTherapists } from '../lib/therapistListProvider';

export const useAutoReviews = () => {
    const isInitialized = useRef(false);
    const { language } = useLanguageContext();
    const lastTherapistCount = useRef(0);
    
    // Convert 'gb' to 'en' for consistency
    const currentLanguage: 'en' | 'id' = language === 'gb' ? 'en' : language as 'en' | 'id';
    
    const initializeAutoReviews = () => {
        // SAFETY CHECK 1: Only run in development mode
        if (import.meta.env.PROD) {
            console.log('🚫 Auto-reviews disabled in production');
            return;
        }
        
        // SAFETY CHECK 2: Never run on landing page
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
            console.log('🚫 Auto-reviews disabled on landing page');
            return;
        }
        
        // Get dynamic list of Yogyakarta therapists
        const YOGYAKARTA_THERAPISTS = getYogyakartaTherapists();
        
        console.log(`🚀 [DEV ONLY] Starting auto-review system for Yogyakarta therapists [${currentLanguage.toUpperCase()}]...`);
        console.log(`📋 Will initialize ${YOGYAKARTA_THERAPISTS.length} therapists:`, YOGYAKARTA_THERAPISTS);
        
        // Only reinitialize if therapist count has changed (meaning real data arrived)
        if (YOGYAKARTA_THERAPISTS.length !== lastTherapistCount.current) {
            console.log(`🔄 Therapist count changed from ${lastTherapistCount.current} to ${YOGYAKARTA_THERAPISTS.length} - reinitializing auto reviews`);
            
            // Stop existing auto reviews
            if (lastTherapistCount.current > 0) {
                console.log('🛑 Stopping existing auto-review processes...');
                // We don't have the old list, so just reset the service
                autoReviewService.stopAllAutoReviews?.();
            }
            
            // Start auto-reviews for all Yogyakarta therapists with current language
            YOGYAKARTA_THERAPISTS.forEach(therapist => {
                console.log(`🔄 Starting reviews for ${therapist.name} (${therapist.id}) [${currentLanguage.toUpperCase()}]`);
                autoReviewService.startAutoReviews(therapist.id, therapist.name, currentLanguage);
            });
            
            lastTherapistCount.current = YOGYAKARTA_THERAPISTS.length;
            console.log('✅ Auto-review system initialization complete!');
        }
    };
    
    useEffect(() => {
        initializeAutoReviews();
        isInitialized.current = true;
        
        // Listen for therapist data updates
        const handleTherapistUpdate = () => {
            console.log('🔄 Therapist data updated - reinitializing auto reviews...');
            initializeAutoReviews();
        };
        
        // Listen for therapist data refresh events
        window.addEventListener('refreshTherapistData', handleTherapistUpdate);
        
        // Also check periodically for data changes (fallback mechanism)
        const checkInterval = setInterval(() => {
            const currentTherapists = getYogyakartaTherapists();
            if (currentTherapists.length !== lastTherapistCount.current && currentTherapists.length > 0) {
                console.log('🔄 Detected therapist data change - reinitializing auto reviews...');
                initializeAutoReviews();
            }
        }, 2000); // Check every 2 seconds
        
        // Cleanup function
        return () => {
            console.log('🛑 Stopping auto-review system...');
            const YOGYAKARTA_THERAPISTS = getYogyakartaTherapists();
            YOGYAKARTA_THERAPISTS.forEach(therapist => {
                autoReviewService.stopAutoReviews(therapist.id);
            });
            window.removeEventListener('refreshTherapistData', handleTherapistUpdate);
            clearInterval(checkInterval);
            isInitialized.current = false;
        };
    }, [currentLanguage]);
    
    return {
        startAutoReviews: (therapistId: string, therapistName: string, lang?: 'en' | 'id') => {
            autoReviewService.startAutoReviews(therapistId, therapistName, lang || currentLanguage);
        },
        stopAutoReviews: (therapistId: string) => {
            autoReviewService.stopAutoReviews(therapistId);
        }
    };
};
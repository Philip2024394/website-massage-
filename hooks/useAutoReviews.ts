/**
 * Hook to manage auto-updating reviews for specific therapists
 */

import { useEffect, useRef } from 'react';
import { autoReviewService } from '../lib/autoReviewService';
import { useLanguageContext } from '../context/LanguageContext';

const YOGYAKARTA_THERAPISTS = [
    { id: '692467a3001f6f05aaa1', name: 'Budi' },
    { id: '69499239000c90bfd283', name: 'ww' },
    { id: '694a02cd0036089583db', name: 'ww' },
    { id: '694ed78e002b0c06171e', name: 'Wiwid' } // Updated to match profile page ID
];

export const useAutoReviews = () => {
    const isInitialized = useRef(false);
    const { language } = useLanguageContext();
    
    // Convert 'gb' to 'en' for consistency
    const currentLanguage: 'en' | 'id' = language === 'gb' ? 'en' : language as 'en' | 'id';
    
    useEffect(() => {
        if (!isInitialized.current) {
            console.log(`🚀 Starting auto-review system for Yogyakarta therapists [${currentLanguage.toUpperCase()}]...`);
            console.log(`📋 Will initialize ${YOGYAKARTA_THERAPISTS.length} therapists:`, YOGYAKARTA_THERAPISTS);
            
            // Start auto-reviews for all Yogyakarta therapists with current language
            YOGYAKARTA_THERAPISTS.forEach(therapist => {
                console.log(`🔄 Starting reviews for ${therapist.name} (${therapist.id}) [${currentLanguage.toUpperCase()}]`);
                autoReviewService.startAutoReviews(therapist.id, therapist.name, currentLanguage);
            });
            
            isInitialized.current = true;
            console.log('✅ Auto-review system initialization complete!');
            
            // Cleanup function
            return () => {
                console.log('🛑 Stopping auto-review system...');
                YOGYAKARTA_THERAPISTS.forEach(therapist => {
                    autoReviewService.stopAutoReviews(therapist.id);
                });
                isInitialized.current = false;
            };
        }
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
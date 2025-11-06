import { useCallback } from 'react';
import { adminTranslationService } from '../lib/translationService';

/**
 * Hook to automatically translate therapist data when saved
 * This should be used in therapist registration/edit forms
 */
export const useAutoTranslateTherapist = () => {
    /**
     * Auto-translate and save therapist data
     * Call this function after successfully saving therapist data
     */
    const translateTherapistData = useCallback(async (
        therapistId: string,
        data: {
            description?: string;
            massageTypes?: string;
            location?: string;
            name?: string;
        },
        sourceLanguage: 'en' | 'id' = 'en'
    ) => {
        try {
            console.log('🔄 Auto-translating therapist data:', { therapistId, sourceLanguage });
            
            const result = await adminTranslationService.translateAndSaveTherapistData(
                therapistId,
                data,
                sourceLanguage
            );

            if (result.success) {
                console.log('✅ Auto-translation completed successfully');
                return {
                    success: true,
                    translatedData: result.translatedData
                };
            } else {
                console.warn('⚠️ Auto-translation failed:', result.error);
                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            console.error('❌ Auto-translation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }, []);

    /**
     * Detect the language of text (simple heuristic)
     * Returns 'id' if Indonesian words are detected, otherwise 'en'
     */
    const detectLanguage = useCallback((text: string): 'en' | 'id' => {
        if (!text) return 'en';
        
        const indonesianWords = [
            'dan', 'atau', 'yang', 'dengan', 'untuk', 'dalam', 'dari', 'pada', 'ke', 'di',
            'pijat', 'terapis', 'massage', 'berpengalaman', 'profesional', 'layanan',
            'tersedia', 'rumah', 'spa', 'relaksasi', 'aromaterapi', 'refleksi'
        ];
        
        const words = text.toLowerCase().split(/\s+/);
        const indonesianWordCount = words.filter(word => 
            indonesianWords.some(idWord => word.includes(idWord))
        ).length;
        
        // If more than 20% of words are Indonesian, consider it Indonesian
        return (indonesianWordCount / words.length) > 0.2 ? 'id' : 'en';
    }, []);

    /**
     * Smart auto-translate function that detects language and translates
     */
    const smartTranslateTherapist = useCallback(async (
        therapistId: string,
        data: {
            description?: string;
            massageTypes?: string;
            location?: string;
            name?: string;
        }
    ) => {
        // Detect source language from description (most reliable indicator)
        const sourceLanguage = data.description ? detectLanguage(data.description) : 'en';
        
        return await translateTherapistData(therapistId, data, sourceLanguage);
    }, [translateTherapistData, detectLanguage]);

    return {
        translateTherapistData,
        smartTranslateTherapist,
        detectLanguage
    };
};

/**
 * Example usage in a therapist form:
 * 
 * const { smartTranslateTherapist } = useAutoTranslateTherapist();
 * 
 * const handleSaveTherapist = async (therapistData) => {
 *   try {
 *     // 1. Save therapist data first
 *     const savedTherapist = await therapistService.save(therapistData);
 *     
 *     // 2. Auto-translate and save translations
 *     const translationResult = await smartTranslateTherapist(
 *       savedTherapist.id,
 *       {
 *         description: therapistData.description,
 *         location: therapistData.location,
 *         massageTypes: therapistData.massageTypes
 *       }
 *     );
 *     
 *     if (translationResult.success) {
 *       console.log('Therapist data saved and translated successfully!');
 *     } else {
 *       console.warn('Translation failed, but therapist data was saved');
 *     }
 *   } catch (error) {
 *     console.error('Error saving therapist:', error);
 *   }
 * };
 */
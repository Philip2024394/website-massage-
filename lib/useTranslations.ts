import { useState, useEffect, useCallback } from 'react';
import { translationsService } from './appwriteService';
import { translations as fallbackTranslations } from '../translations/index';

const CACHE_KEY = 'indostreet_translations';
const CACHE_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

const getCachedTranslations = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return data;
    } catch {
        return null;
    }
};

const cacheTranslations = (data: any) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error caching translations:', error);
    }
};

export function useTranslations(language?: 'en' | 'id') {
    // Get stored language preference if no language is provided
    const getStoredLanguage = (): 'en' | 'id' => {
        try {
            const stored = localStorage.getItem('app_language');
            return (stored === 'id' || stored === 'en') ? stored : 'en';
        } catch {
            return 'en';
        }
    };
    
    const currentLanguage = language || getStoredLanguage();
    
    const [translations, setTranslations] = useState(fallbackTranslations);
    const [loading, setLoading] = useState(false);

    const loadTranslations = useCallback(async () => {
        try {
            // Check cache first
            const cached = getCachedTranslations();
            if (cached && cached[currentLanguage]) {
                setTranslations(cached);
                setLoading(false);
                return;
            }

            // Load from Appwrite
            const appwriteTranslations = await translationsService.getAll();
            
            if (appwriteTranslations && appwriteTranslations[currentLanguage] && Object.keys(appwriteTranslations[currentLanguage]).length > 0) {
                setTranslations(appwriteTranslations);
                cacheTranslations(appwriteTranslations);
            } else {
                // Use fallback translations when Appwrite is empty
                setTranslations(fallbackTranslations);
                cacheTranslations(fallbackTranslations);
            }
        } catch (error) {
            console.error('Error loading translations, using fallback:', error);
            // Continue with fallback translations already set
        } finally {
            setLoading(false);
        }
    }, [currentLanguage]);

    useEffect(() => {
        loadTranslations();
    }, [loadTranslations]);

    // Fix: Check if translations have actual content, not just if they exist
    const hasTranslationContent = (obj: any) => obj && Object.keys(obj).length > 0;
    
    // TEMPORARY: Force Indonesian fallback for testing
    let finalTranslations;
    if (currentLanguage === 'id') {
        finalTranslations = (fallbackTranslations as any).id || fallbackTranslations.en;
        console.log(`🔧 FORCED Indonesian fallback. Keys:`, Object.keys(finalTranslations || {}));
        console.log(`🔧 FORCED Home section:`, finalTranslations?.home ? Object.keys(finalTranslations.home) : 'no home');
    } else {
        finalTranslations = 
            (hasTranslationContent(translations[currentLanguage]) ? translations[currentLanguage] : null) ||
            (hasTranslationContent(translations.en) ? translations.en : null) ||
            (hasTranslationContent((fallbackTranslations as any)[currentLanguage]) ? (fallbackTranslations as any)[currentLanguage] : null) ||
            fallbackTranslations.en ||
            fallbackTranslations;
    }
    
    console.log(`🧭 useTranslations Debug for ${currentLanguage}:`);
    console.log(`  📦 translations[${currentLanguage}] exists:`, !!translations[currentLanguage]);
    console.log(`  📦 translations[${currentLanguage}] keys:`, translations[currentLanguage] ? Object.keys(translations[currentLanguage]) : 'none');
    console.log(`  📦 translations[${currentLanguage}] has content:`, hasTranslationContent(translations[currentLanguage]));
    console.log(`  🏠 translations[${currentLanguage}].home exists:`, !!(translations[currentLanguage] && translations[currentLanguage].home));
    console.log(`  📦 fallbackTranslations[${currentLanguage}] exists:`, !!((fallbackTranslations as any)[currentLanguage]));
    console.log(`  📦 fallbackTranslations[${currentLanguage}] keys:`, (fallbackTranslations as any)[currentLanguage] ? Object.keys((fallbackTranslations as any)[currentLanguage]) : 'none');
    console.log(`  📦 fallbackTranslations[${currentLanguage}] has content:`, hasTranslationContent((fallbackTranslations as any)[currentLanguage]));
    console.log(`  🏠 fallbackTranslations[${currentLanguage}].home exists:`, !!((fallbackTranslations as any)[currentLanguage] && (fallbackTranslations as any)[currentLanguage].home));
    console.log(`  ✅ Final translation keys:`, Object.keys(finalTranslations || {}));
    console.log(`  🏠 Final translation has home:`, !!(finalTranslations && finalTranslations.home));
    console.log(`  🎯 Translation source: ${hasTranslationContent(translations[currentLanguage]) ? 'Appwrite' : hasTranslationContent((fallbackTranslations as any)[currentLanguage]) ? 'Fallback' : 'Default'}`);

    // Helper function to get nested translation values
    const getNestedValue = (obj: any, path: string): string => {
        if (!obj) return path; // Return key if no translations
        
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return path; // Return key if path not found
            }
        }
        
        return typeof current === 'string' ? current : path;
    };

    return {
        t: (key: string) => {
            const result = getNestedValue(finalTranslations, key);
            console.log(`🔑 Translation lookup: "${key}" => "${result}" (from ${Object.keys(finalTranslations || {}).length} keys)`);
            if (key.includes('home.')) {
                console.log(`🏠 Home section debug:`, finalTranslations?.home ? Object.keys(finalTranslations.home) : 'no home section');
            }
            return result;
        },
        loading,
        refresh: loadTranslations,
        hasLanguage: !!(translations[currentLanguage] && Object.keys(translations[currentLanguage]).length > 0),
        // Add debug info
        debug: {
            requestedLanguage: currentLanguage,
            availableLanguages: Object.keys(translations),
            hasRequestedLang: !!(translations[currentLanguage]),
            fallbackUsed: !translations[currentLanguage],
            translationKeys: translations[currentLanguage] ? Object.keys(translations[currentLanguage]) : [],
            hasHomeKey: !!(translations[currentLanguage] && translations[currentLanguage].home)
        }
    };
}

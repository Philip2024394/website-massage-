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

export function useTranslations(language: 'en' | 'id' = 'en') {
    console.log(`🚀 useTranslations called with language: ${language}`);
    
    const [translations, setTranslations] = useState(fallbackTranslations);
    const [loading, setLoading] = useState(false);

    console.log(`🔍 fallbackTranslations check:`, {
        fallbackExists: !!fallbackTranslations,
        fallbackKeys: Object.keys(fallbackTranslations),
        hasEnglish: !!fallbackTranslations.en,
        hasIndonesian: !!fallbackTranslations.id,
        englishKeys: fallbackTranslations.en ? Object.keys(fallbackTranslations.en) : 'none',
        indonesianKeys: fallbackTranslations.id ? Object.keys(fallbackTranslations.id) : 'none'
    });

    const loadTranslations = useCallback(async () => {
        try {
            console.log(`🌐 Loading translations for language: ${language}`);
            
            // Check cache first
            const cached = getCachedTranslations();
            if (cached && cached[language]) {
                console.log(`✅ Found cached translations for ${language}`);
                setTranslations(cached);
                setLoading(false);
                return;
            }

            console.log(` Loading translations from Appwrite for ${language}...`);
            // Load from Appwrite
            const appwriteTranslations = await translationsService.getAll();
            
            if (appwriteTranslations && appwriteTranslations[language] && Object.keys(appwriteTranslations[language]).length > 0) {
                console.log(`✅ Loaded ${Object.keys(appwriteTranslations[language]).length} keys for ${language} from Appwrite`);
                console.log(`🔧 Available translation keys for ${language}:`, Object.keys(appwriteTranslations[language]));
                setTranslations(appwriteTranslations);
                cacheTranslations(appwriteTranslations);
            } else {
                console.log(`⚠️ No translations found for ${language} in Appwrite, using fallback`);
                console.log(`📁 Available fallback keys for ${language}:`, Object.keys((fallbackTranslations as any)[language] || {}));
                console.log(`🏠 Fallback has landing?`, !!((fallbackTranslations as any)[language]?.landing));
                // FIXED: Use fallback translations when Appwrite is empty
                // Don't merge with empty appwriteTranslations - just use fallback
                setTranslations(fallbackTranslations);
                cacheTranslations(fallbackTranslations);
                console.log(`🔄 Using fallback translation keys for ${language}:`, Object.keys((fallbackTranslations as any)[language] || {}));
            }
        } catch (error) {
            console.error('Error loading translations, using fallback:', error);
            // Continue with fallback translations already set
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        loadTranslations();
    }, [loadTranslations]);

    // Fix: Check if translations have actual content, not just if they exist
    const hasTranslationContent = (obj: any) => obj && Object.keys(obj).length > 0;
    
    // TEMPORARY: Force Indonesian fallback for testing
    let finalTranslations;
    if (language === 'id') {
        finalTranslations = (fallbackTranslations as any).id || fallbackTranslations.en;
        console.log(`🔧 FORCED Indonesian fallback. Keys:`, Object.keys(finalTranslations || {}));
        console.log(`🔧 FORCED Home section:`, finalTranslations?.home ? Object.keys(finalTranslations.home) : 'no home');
    } else {
        finalTranslations = 
            (hasTranslationContent(translations[language]) ? translations[language] : null) ||
            (hasTranslationContent(translations.en) ? translations.en : null) ||
            (hasTranslationContent((fallbackTranslations as any)[language]) ? (fallbackTranslations as any)[language] : null) ||
            fallbackTranslations.en ||
            fallbackTranslations;
    }
    
    console.log(`🧭 useTranslations Debug for ${language}:`);
    console.log(`  📦 translations[${language}] exists:`, !!translations[language]);
    console.log(`  📦 translations[${language}] keys:`, translations[language] ? Object.keys(translations[language]) : 'none');
    console.log(`  📦 translations[${language}] has content:`, hasTranslationContent(translations[language]));
    console.log(`  🏠 translations[${language}].home exists:`, !!(translations[language] && translations[language].home));
    console.log(`  📦 fallbackTranslations[${language}] exists:`, !!((fallbackTranslations as any)[language]));
    console.log(`  📦 fallbackTranslations[${language}] keys:`, (fallbackTranslations as any)[language] ? Object.keys((fallbackTranslations as any)[language]) : 'none');
    console.log(`  📦 fallbackTranslations[${language}] has content:`, hasTranslationContent((fallbackTranslations as any)[language]));
    console.log(`  🏠 fallbackTranslations[${language}].home exists:`, !!((fallbackTranslations as any)[language] && (fallbackTranslations as any)[language].home));
    console.log(`  ✅ Final translation keys:`, Object.keys(finalTranslations || {}));
    console.log(`  🏠 Final translation has home:`, !!(finalTranslations && finalTranslations.home));
    console.log(`  🎯 Translation source: ${hasTranslationContent(translations[language]) ? 'Appwrite' : hasTranslationContent((fallbackTranslations as any)[language]) ? 'Fallback' : 'Default'}`);

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
        hasLanguage: !!(translations[language] && Object.keys(translations[language]).length > 0),
        // Add debug info
        debug: {
            requestedLanguage: language,
            availableLanguages: Object.keys(translations),
            hasRequestedLang: !!(translations[language]),
            fallbackUsed: !translations[language],
            translationKeys: translations[language] ? Object.keys(translations[language]) : [],
            hasHomeKey: !!(translations[language] && translations[language].home)
        }
    };
}

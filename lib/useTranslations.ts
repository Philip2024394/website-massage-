import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { LanguageContext } from '../context/LanguageContext';
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

export function useTranslations(language?: 'en' | 'id' | 'gb') {
    // Allow implicit language from context when param not provided
    const ctx = useContext(LanguageContext);
    // Get stored language preference if no language is provided
    const getStoredLanguage = (): 'en' | 'id' | 'gb' => {
        try {
            const stored = window.localStorage.getItem('app_language');
            return (stored === 'id' || stored === 'en' || stored === 'gb') ? (stored as any) : 'id';
        } catch {
            return 'id';
        }
    };
    
    const currentLanguage = language || ctx.language || getStoredLanguage();
    // Normalize 'gb' to 'en' for dictionary selection while preserving requested language
    const normalizedLang = currentLanguage === 'gb' ? 'en' : currentLanguage;
    
    const [translations, setTranslations] = useState(fallbackTranslations);
    const [loading, setLoading] = useState(false);

    const loadTranslations = useCallback(async () => {
        try {
            console.log('🔄 useTranslations: Loading translations for language:', currentLanguage);
            
            // Check for cached translations first
            const cached = getCachedTranslations();
            if (cached && cached[normalizedLang]) {
                console.log('✅ useTranslations: Using cached translations for', normalizedLang);
                setTranslations(cached);
                setLoading(false);
                return;
            }

            // Load from Appwrite
            console.log('🌐 useTranslations: Fetching translations from Appwrite...');
            const appwriteTranslations = await translationsService.getAll();
            
            if (appwriteTranslations && appwriteTranslations[normalizedLang] && Object.keys(appwriteTranslations[normalizedLang]).length > 0) {
                console.log('✅ useTranslations: Using Appwrite translations for', normalizedLang);
                setTranslations(appwriteTranslations);
                cacheTranslations(appwriteTranslations);
            } else {
                // Use fallback translations when Appwrite is empty
                console.log('⚠️ useTranslations: Appwrite empty, using fallback translations for', normalizedLang);
                setTranslations(fallbackTranslations);
                cacheTranslations(fallbackTranslations);
            }
        } catch (error) {
            console.error('❌ useTranslations: Error loading translations, using fallback:', error);
            // Continue with fallback translations already set
        } finally {
            setLoading(false);
        }
    }, [normalizedLang]);

    // Track last fetch time to prevent rate limiting (429 errors)
    const lastFetchRef = useRef<{ [key: string]: number }>({});
    const RATE_LIMIT_MS = 3000; // Minimum 3 seconds between fetches

    useEffect(() => {
        const now = Date.now();
        const lastFetch = lastFetchRef.current[normalizedLang] || 0;
        const timeSinceLastFetch = now - lastFetch;
        
        if (timeSinceLastFetch < RATE_LIMIT_MS) {
            console.log(`⏱️ useTranslations: Rate limit - skipping fetch for ${normalizedLang} (${timeSinceLastFetch}ms < ${RATE_LIMIT_MS}ms)`);
            return;
        }
        
        console.log('🔄 useTranslations: Language changed, reloading translations for:', currentLanguage);
        lastFetchRef.current[normalizedLang] = now;
        loadTranslations();
    }, [normalizedLang, loadTranslations, currentLanguage]);

    // Fix: Check if translations have actual content, not just if they exist
    const hasTranslationContent = (obj: any) => obj && Object.keys(obj).length > 0;
    
    // Select appropriate translations based on current language
    let finalTranslations = 
        (hasTranslationContent(translations[normalizedLang]) ? translations[normalizedLang] : null) ||
        (hasTranslationContent((fallbackTranslations as any)[normalizedLang]) ? (fallbackTranslations as any)[normalizedLang] : null) ||
        (hasTranslationContent(translations.en) ? translations.en : null) ||
        fallbackTranslations.en ||
        fallbackTranslations;
    
    console.log(`🧭 useTranslations Debug for requested=${currentLanguage}, normalized=${normalizedLang}:`);
    console.log(`  📦 translations[${normalizedLang}] exists:`, !!translations[normalizedLang]);
    console.log(`  📦 translations[${normalizedLang}] keys:`, translations[normalizedLang] ? Object.keys(translations[normalizedLang]) : 'none');
    console.log(`  📦 translations[${normalizedLang}] has content:`, hasTranslationContent(translations[normalizedLang]));
    console.log(`  🏠 translations[${normalizedLang}].home exists:`, !!(translations[normalizedLang] && translations[normalizedLang].home));
    console.log(`  📦 fallbackTranslations[${normalizedLang}] exists:`, !!((fallbackTranslations as any)[normalizedLang]));
    console.log(`  📦 fallbackTranslations[${normalizedLang}] keys:`, (fallbackTranslations as any)[normalizedLang] ? Object.keys((fallbackTranslations as any)[normalizedLang]) : 'none');
    console.log(`  📦 fallbackTranslations[${normalizedLang}] has content:`, hasTranslationContent((fallbackTranslations as any)[normalizedLang]));
    console.log(`  🏠 fallbackTranslations[${normalizedLang}].home exists:`, !!((fallbackTranslations as any)[normalizedLang] && (fallbackTranslations as any)[normalizedLang].home));
    console.log(`  ✅ Final translation keys:`, Object.keys(finalTranslations || {}));
    console.log(`  🏠 Final translation has home:`, !!(finalTranslations && finalTranslations.home));
    const srcLang = currentLanguage === 'gb' ? 'en' : currentLanguage;
    console.log(`  🎯 Translation source: ${hasTranslationContent(translations[srcLang]) ? 'Appwrite' : hasTranslationContent((fallbackTranslations as any)[srcLang]) ? 'Fallback' : 'Default'}`);

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
        // Expose the active language dictionary for object-style access
        dict: finalTranslations,
        loading,
        refresh: loadTranslations,
        hasLanguage: !!(translations[normalizedLang] && Object.keys(translations[normalizedLang]).length > 0),
        // Add debug info
        debug: {
            requestedLanguage: currentLanguage,
            normalizedLanguage: normalizedLang,
            availableLanguages: Object.keys(translations),
            hasRequestedLang: !!(translations[normalizedLang]),
            fallbackUsed: !translations[normalizedLang],
            translationKeys: translations[normalizedLang] ? Object.keys(translations[normalizedLang]) : [],
            hasHomeKey: !!(translations[normalizedLang] && translations[normalizedLang].home)
        }
    };
}

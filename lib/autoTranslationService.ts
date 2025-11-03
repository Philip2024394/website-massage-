import { translationsService } from './appwriteService';
import { translations as fallbackTranslations } from '../translations/index';

// All supported languages
export const ALL_LANGUAGES = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'pl', name: 'Polski' },
    { code: 'sv', name: 'Svenska' },
    { code: 'da', name: 'Dansk' },
];

// Basic languages for admin/business features
export const BASIC_LANGUAGES = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
];

// Translation scope configuration - defines which keys get which languages
export const TRANSLATION_SCOPES = {
    // Tourist-facing pages: Full 20 languages
    TOURIST: {
        languages: ALL_LANGUAGES,
        keyPrefixes: [
            'landing',           // Landing page
            'hotelVillaMenu',   // Hotel/Villa live menu
            'home',             // Home page (for tourists)
            'booking',          // Booking process
            'search',           // Search functionality
            'therapist',        // Therapist profiles
            'massage',          // Massage types/services
            'location',         // Location services
            'payment'           // Payment (tourist-facing)
        ]
    },
    
    // Business/Admin areas: Only English + Indonesian
    BUSINESS: {
        languages: BASIC_LANGUAGES,
        keyPrefixes: [
            'admin',            // Admin dashboard
            'dashboard',        // All dashboards
            'agent',            // Agent features
            'provider',         // Provider features
            'member',           // Membership features
            'auth',             // Authentication
            'profile',          // Profile management
            'analytics',        // Analytics/reports
            'settings',         // Settings pages
            'management'        // Management features
        ]
    }
};

// Supported languages (keeping for backward compatibility)
export const SUPPORTED_LANGUAGES = ALL_LANGUAGES;

// Language code mapping for translation APIs
const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    'id': 'id',      // Indonesian
    'en': 'en',      // English
    'zh': 'zh',      // Chinese (Simplified)
    'ja': 'ja',      // Japanese
    'ko': 'ko',      // Korean
    'es': 'es',      // Spanish
    'fr': 'fr',      // French
    'de': 'de',      // German
    'it': 'it',      // Italian
    'pt': 'pt',      // Portuguese
    'ru': 'ru',      // Russian
    'ar': 'ar',      // Arabic
    'hi': 'hi',      // Hindi
    'th': 'th',      // Thai
    'vi': 'vi',      // Vietnamese
    'nl': 'nl',      // Dutch
    'tr': 'tr',      // Turkish
    'pl': 'pl',      // Polish
    'sv': 'sv',      // Swedish
    'da': 'da',      // Danish
};

/**
 * Free translation service using MyMemory API
 * Rate limit: 1000 characters per day for anonymous usage
 * For production, consider using paid services like Google Translate API
 */
async function translateText(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
        const apiLang = LANGUAGE_CODE_MAP[targetLang] || targetLang;
        const sourceApiLang = LANGUAGE_CODE_MAP[sourceLang] || sourceLang;
        
        // Skip translation if source and target are the same
        if (sourceApiLang === apiLang) {
            return text;
        }

        // Use MyMemory API (free tier)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceApiLang}|${apiLang}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        } else {
            console.warn(`Translation failed for ${text} to ${targetLang}:`, data);
            return text; // Return original text if translation fails
        }
    } catch (error) {
        console.error(`Translation error for ${text} to ${targetLang}:`, error);
        return text; // Return original text if translation fails
    }
}

/**
 * Flatten nested translation objects into dot notation keys
 */
function flattenTranslations(obj: any, prefix: string = ''): { [key: string]: string } {
    const flattened: { [key: string]: string } = {};
    
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flattenTranslations(value, newKey));
        } else {
            flattened[newKey] = String(value);
        }
    }
    
    return flattened;
}

/**
 * Add delay between API calls to respect rate limits
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const autoTranslationService = {
    /**
     * Helper function to determine which languages a key should be translated to
     */
    getLanguagesForKey(key: string): Array<{code: string, name: string}> {
        // Check if key matches tourist scope
        for (const prefix of TRANSLATION_SCOPES.TOURIST.keyPrefixes) {
            if (key.startsWith(prefix + '.') || key === prefix) {
                return TRANSLATION_SCOPES.TOURIST.languages;
            }
        }
        
        // Check if key matches business scope
        for (const prefix of TRANSLATION_SCOPES.BUSINESS.keyPrefixes) {
            if (key.startsWith(prefix + '.') || key === prefix) {
                return TRANSLATION_SCOPES.BUSINESS.languages;
            }
        }
        
        // Default to basic languages for unclassified keys
        return TRANSLATION_SCOPES.BUSINESS.languages;
    },

    /**
     * Translate all existing translations with scope-based language selection
     */
    async translateAllLanguages(sourceLanguage: string = 'en'): Promise<void> {
        console.log('🌐 Starting scope-based automatic translation process...');
        
        try {
            // Get source translations (flatten them)
            const sourceTranslations = flattenTranslations(fallbackTranslations[sourceLanguage as keyof typeof fallbackTranslations]);
            const totalKeys = Object.keys(sourceTranslations).length;
            
            console.log(`📊 Processing ${totalKeys} translation keys with scope-based language selection...`);
            console.log(`🎯 Tourist pages (20 languages): ${TRANSLATION_SCOPES.TOURIST.keyPrefixes.join(', ')}`);
            console.log(`🏢 Business pages (2 languages): ${TRANSLATION_SCOPES.BUSINESS.keyPrefixes.join(', ')}`);
            
            let translatedCount = 0;
            let totalTranslationsNeeded = 0;
            
            // First, calculate total translations needed
            for (const [key] of Object.entries(sourceTranslations)) {
                const languagesForKey = this.getLanguagesForKey(key);
                totalTranslationsNeeded += languagesForKey.length;
            }
            
            console.log(`🔢 Total translations needed: ${totalTranslationsNeeded}`);
            
            for (const [key, text] of Object.entries(sourceTranslations)) {
                const languagesForKey = this.getLanguagesForKey(key);
                const scope = languagesForKey.length === 20 ? 'TOURIST' : 'BUSINESS';
                
                console.log(`🔄 Translating "${key}" (${scope} scope) to ${languagesForKey.length} languages...`);
                
                for (const language of languagesForKey) {
                    try {
                        // Skip source language
                        if (language.code === sourceLanguage) {
                            await translationsService.set(language.code, key, text);
                            translatedCount++;
                            console.log(`📝 [${translatedCount}/${totalTranslationsNeeded}] ${language.code}.${key}: "${text}" (source)`);
                            continue;
                        }
                        
                        // Translate the text
                        const translatedText = await translateText(text, language.code, sourceLanguage);
                        
                        // Store in Appwrite
                        await translationsService.set(language.code, key, translatedText);
                        
                        translatedCount++;
                        console.log(`✅ [${translatedCount}/${totalTranslationsNeeded}] ${language.code}.${key}: "${text}" → "${translatedText}"`);
                        
                        // Add delay to respect API rate limits (500ms between requests)
                        await delay(500);
                        
                    } catch (error) {
                        console.error(`❌ Failed to translate ${key} to ${language.code}:`, error);
                        // Store original text as fallback
                        try {
                            await translationsService.set(language.code, key, text);
                            translatedCount++;
                            console.log(`📝 [${translatedCount}/${totalTranslationsNeeded}] ${language.code}.${key}: "${text}" (fallback)`);
                        } catch (storeError) {
                            console.error(`❌ Failed to store fallback for ${key}:`, storeError);
                        }
                    }
                }
            }
            
            console.log('🎉 Scope-based translation process completed!');
            
        } catch (error) {
            console.error('❌ Translation process failed:', error);
            throw error;
        }
    },

    /**
     * Translate a single key to appropriate languages based on scope
     */
    async translateSingleKey(key: string, sourceText: string, sourceLanguage: string = 'en'): Promise<void> {
        console.log(`🔄 Translating single key "${key}" with scope-based language selection...`);
        
        const languagesForKey = this.getLanguagesForKey(key);
        const scope = languagesForKey.length === 20 ? 'TOURIST' : 'BUSINESS';
        
        console.log(`🎯 Key "${key}" scope: ${scope} (${languagesForKey.length} languages)`);
        
        for (const language of languagesForKey) {
            try {
                // Skip source language
                if (language.code === sourceLanguage) {
                    await translationsService.set(language.code, key, sourceText);
                    console.log(`📝 ${language.code}.${key}: "${sourceText}" (source)`);
                    continue;
                }
                
                const translatedText = await translateText(sourceText, language.code, sourceLanguage);
                await translationsService.set(language.code, key, translatedText);
                
                console.log(`✅ ${language.code}.${key}: "${sourceText}" → "${translatedText}"`);
                await delay(500); // Rate limiting
                
            } catch (error) {
                console.error(`❌ Failed to translate ${key} to ${language.code}:`, error);
                // Store original as fallback
                try {
                    await translationsService.set(language.code, key, sourceText);
                    console.log(`📝 ${language.code}.${key}: "${sourceText}" (fallback)`);
                } catch (storeError) {
                    console.error(`❌ Failed to store fallback for ${key}:`, storeError);
                }
            }
        }
    },

    /**
     * Get translation progress/statistics
     */
    async getTranslationStats(): Promise<{
        totalKeys: number;
        totalLanguages: number;
        completedTranslations: number;
        completionPercentage: number;
    }> {
        try {
            const sourceTranslations = flattenTranslations(fallbackTranslations.en);
            const totalKeys = Object.keys(sourceTranslations).length;
            const totalLanguages = SUPPORTED_LANGUAGES.length;
            const expectedTotal = totalKeys * totalLanguages;
            
            // Get current translations from Appwrite
            const appwriteTranslations = await translationsService.getAll();
            let completedTranslations = 0;
            
            if (appwriteTranslations) {
                for (const lang of SUPPORTED_LANGUAGES) {
                    if (appwriteTranslations[lang.code]) {
                        completedTranslations += Object.keys(appwriteTranslations[lang.code]).length;
                    }
                }
            }
            
            return {
                totalKeys,
                totalLanguages,
                completedTranslations,
                completionPercentage: Math.round((completedTranslations / expectedTotal) * 100)
            };
        } catch (error) {
            console.error('Error getting translation stats:', error);
            return {
                totalKeys: 0,
                totalLanguages: 0,
                completedTranslations: 0,
                completionPercentage: 0
            };
        }
    },

    /**
     * Sync existing local translations to Appwrite (without translation)
     */
    async syncLocalTranslations(): Promise<void> {
        console.log('📤 Syncing local translations to Appwrite...');
        
        try {
            await translationsService.syncFromLocal(fallbackTranslations);
            console.log('✅ Local translations synced successfully!');
        } catch (error) {
            console.error('❌ Failed to sync local translations:', error);
            throw error;
        }
    }
};
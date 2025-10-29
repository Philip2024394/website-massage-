/**
 * Translation Service for Chat Messages
 * Auto-translates between English and Indonesian
 * 
 * Uses LibreTranslate (free, self-hosted option) or Google Translate API
 * For production: Recommended to use Google Cloud Translation API for better quality
 */

// Simple translation cache to avoid duplicate API calls
const translationCache = new Map<string, string>();

/**
 * Translates text between English and Indonesian
 * @param text - Text to translate
 * @param fromLang - Source language
 * @param toLang - Target language
 * @returns Translated text
 */
export async function translateText(
    text: string,
    fromLang: 'en' | 'id',
    toLang: 'en' | 'id'
): Promise<string> {
    // If same language, return original
    if (fromLang === toLang) {
        return text;
    }

    // Check cache first
    const cacheKey = `${fromLang}-${toLang}-${text}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    try {
        // Option 1: Use LibreTranslate (Free, requires instance)
        // const translated = await translateWithLibreTranslate(text, fromLang, toLang);
        
        // Option 2: Use MyMemory Translation API (Free, no API key needed, 5000 chars/day)
        const translated = await translateWithMyMemory(text, fromLang, toLang);
        
        // Option 3: Google Cloud Translation (Production - uncomment when ready)
        // const translated = await translateWithGoogle(text, fromLang, toLang);
        
        // Cache the result
        translationCache.set(cacheKey, translated);
        
        return translated;
    } catch (error) {
        console.error('Translation error:', error);
        // Return original text if translation fails
        return text;
    }
}

/**
 * MyMemory Translation API (Free tier)
 * 5000 characters per day, no API key needed
 * Good for development and low-volume production
 */
async function translateWithMyMemory(
    text: string,
    fromLang: 'en' | 'id',
    toLang: 'en' | 'id'
): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData.translatedText) {
        return data.responseData.translatedText;
    }
    
    throw new Error('Translation failed');
}

/**
 * Google Translate API (Backup - Not used yet)
 * Uncomment when you have Google Cloud API key
 * Cost: ~$20 per 1M characters
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
// async function translateWithGoogle(
//     text: string,
//     fromLang: 'en' | 'id',
//     toLang: 'en' | 'id'
// ): Promise<string> {
//     const apiKey = (import.meta as any).env?.VITE_GOOGLE_TRANSLATE_API_KEY;
    
//     if (!apiKey) {
//         throw new Error('Google Translate API key not configured');
//     }
    
//     const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
//     const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             q: text,
//             source: fromLang,
//             target: toLang,
//             format: 'text'
//         })
//     });
    
//     const data = await response.json();
    
//     if (data.data && data.data.translations && data.data.translations[0]) {
//         return data.data.translations[0].translatedText;
//     }
    
//     throw new Error('Google translation failed');
// }


/**
 * LibreTranslate (Self-hosted or public instance)
 * Free and open-source
 * Requires running instance
 */
// async function translateWithLibreTranslate(
//     text: string,
//     fromLang: 'en' | 'id',
//     toLang: 'en' | 'id'
// ): Promise<string> {
//     // Use public instance or your own self-hosted instance
//     const endpoint = 'https://libretranslate.com/translate';
    
//     const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             q: text,
//             source: fromLang,
//             target: toLang,
//             format: 'text'
//         })
//     });
    
//     const data = await response.json();
    
//     if (data.translatedText) {
//         return data.translatedText;
//     }
    
//     throw new Error('LibreTranslate failed');
// }

/**
 * Clear translation cache (useful for memory management)
 */
export function clearTranslationCache() {
    translationCache.clear();
}

/**
 * Get cache size (for monitoring)
 */
export function getTranslationCacheSize(): number {
    return translationCache.size;
}

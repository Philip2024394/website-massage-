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

/**
 * Admin Dashboard Translation Functions
 * Auto-translate and save therapist profile data
 */

// Import Appwrite for saving translations
import { Client, Databases } from 'appwrite';

class AdminTranslationService {
    private client: Client;
    private databases: Databases;
    private databaseId: string;

    constructor() {
        this.client = new Client();
        this.databases = new Databases(this.client);
        
        // Initialize Appwrite client
        this.client
            .setEndpoint((import.meta as any).env?.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
            .setProject((import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '');
            
        this.databaseId = (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || '';
    }

    /**
     * Auto-translate therapist profile data and save both languages
     * @param therapistId - Therapist ID to update
     * @param data - Profile data to translate
     * @param sourceLanguage - Original language of the data
     */
    async translateAndSaveTherapistData(
        therapistId: string,
        data: {
            description?: string;
            massageTypes?: string;
            location?: string;
            name?: string;
        },
        sourceLanguage: 'en' | 'id' = 'en'
    ): Promise<{
        success: boolean;
        translatedData?: any;
        error?: string;
    }> {
        try {
            const targetLanguage: 'en' | 'id' = sourceLanguage === 'en' ? 'id' : 'en';
            const translatedData: any = {};

            // Keep original data
            if (data.description) {
                translatedData[`description_${sourceLanguage}`] = data.description;
            }
            if (data.location) {
                translatedData[`location_${sourceLanguage}`] = data.location;  
            }
            if (data.name) {
                translatedData[`name_${sourceLanguage}`] = data.name;
            }

            // Translate description
            if (data.description) {
                try {
                    const translatedDesc = await translateText(data.description, sourceLanguage, targetLanguage);
                    translatedData[`description_${targetLanguage}`] = translatedDesc;
                } catch (error) {
                    console.warn('Failed to translate description:', error);
                    translatedData[`description_${targetLanguage}`] = this.getFallbackTranslation(data.description, targetLanguage);
                }
            }

            // Translate location
            if (data.location) {
                try {
                    const translatedLocation = await translateText(data.location, sourceLanguage, targetLanguage);
                    translatedData[`location_${targetLanguage}`] = translatedLocation;
                } catch (error) {
                    console.warn('Failed to translate location:', error);
                    translatedData[`location_${targetLanguage}`] = this.getFallbackTranslation(data.location, targetLanguage);
                }
            }

            // Translate massage types (stored as JSON string)
            if (data.massageTypes) {
                try {
                    const massageTypesArray = JSON.parse(data.massageTypes);
                    const translatedTypes: string[] = [];
                    
                    for (const type of massageTypesArray) {
                        try {
                            const translatedType = await translateText(type, sourceLanguage, targetLanguage);
                            translatedTypes.push(translatedType);
                        } catch (error) {
                            translatedTypes.push(this.getFallbackTranslation(type, targetLanguage));
                        }
                    }
                    
                    translatedData[`massageTypes_${sourceLanguage}`] = data.massageTypes; // Keep original JSON
                    translatedData[`massageTypes_${targetLanguage}`] = JSON.stringify(translatedTypes);
                } catch (error) {
                    console.warn('Failed to parse or translate massage types:', error);
                    translatedData[`massageTypes_${sourceLanguage}`] = data.massageTypes;
                    translatedData[`massageTypes_${targetLanguage}`] = data.massageTypes; // Use original as fallback
                }
            }

            // Update therapist in database with translated data
            const therapistsCollectionId = (import.meta as any).env?.VITE_APPWRITE_THERAPISTS_COLLECTION_ID || 'therapists';
            
            await this.databases.updateDocument(
                this.databaseId,
                therapistsCollectionId,
                therapistId,
                translatedData
            );

            console.log('✅ Successfully translated and saved therapist data:', {
                therapistId,
                sourceLanguage,
                targetLanguage,
                translatedFields: Object.keys(translatedData)
            });

            return {
                success: true,
                translatedData
            };

        } catch (error) {
            console.error('❌ Error in translateAndSaveTherapistData:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Fallback translations for common massage-related terms
     */
    private getFallbackTranslation(text: string, targetLanguage: 'en' | 'id'): string {
        const massageTranslations = {
            en: {
                'Pijat Swedia': 'Swedish Massage',
                'Pijat Jaringan Dalam': 'Deep Tissue Massage', 
                'Pijat Batu Panas': 'Hot Stone Massage',
                'Pijat Aromaterapi': 'Aromatherapy Massage',
                'Pijat Refleksi': 'Reflexology Massage',
                'Pijat Thailand': 'Thai Massage',
                'Pijat Prenatal': 'Prenatal Massage',
                'Pijat Olahraga': 'Sports Massage',
                'Terapis pijat profesional': 'Professional massage therapist',
                'Berpengalaman dalam berbagai teknik pijat': 'Experienced in various massage techniques',
                'Tersedia untuk layanan rumah': 'Available for home service',
                'Denpasar': 'Denpasar',
                'Ubud': 'Ubud',
                'Canggu': 'Canggu',
                'Seminyak': 'Seminyak',
                'Kuta': 'Kuta'
            },
            id: {
                'Swedish Massage': 'Pijat Swedia',
                'Deep Tissue Massage': 'Pijat Jaringan Dalam',
                'Hot Stone Massage': 'Pijat Batu Panas', 
                'Aromatherapy Massage': 'Pijat Aromaterapi',
                'Reflexology Massage': 'Pijat Refleksi',
                'Thai Massage': 'Pijat Thailand',
                'Prenatal Massage': 'Pijat Prenatal',
                'Sports Massage': 'Pijat Olahraga',
                'Professional massage therapist': 'Terapis pijat profesional',
                'Experienced in various massage techniques': 'Berpengalaman dalam berbagai teknik pijat',
                'Available for home service': 'Tersedia untuk layanan rumah',
                'Denpasar': 'Denpasar',
                'Ubud': 'Ubud', 
                'Canggu': 'Canggu',
                'Seminyak': 'Seminyak',
                'Kuta': 'Kuta'
            }
        };

        const translations = massageTranslations[targetLanguage];
        
        // Check for exact matches first
        if (translations[text as keyof typeof translations]) {
            return translations[text as keyof typeof translations];
        }

        // Check for partial matches
        for (const [key, value] of Object.entries(translations)) {
            if (text.toLowerCase().includes(key.toLowerCase())) {
                return text.replace(new RegExp(key, 'gi'), value);
            }
        }

        // Return original text if no translation found
        return text;
    }

    /**
     * Bulk translate all existing therapists (one-time migration)
     */
    async translateAllExistingTherapists(): Promise<{
        success: boolean;
        processed: number;
        errors: string[];
    }> {
        try {
            const therapistsCollectionId = (import.meta as any).env?.VITE_APPWRITE_THERAPISTS_COLLECTION_ID || 'therapists';
            
            // Get all therapists
            const response = await this.databases.listDocuments(
                this.databaseId,
                therapistsCollectionId
            );

            const errors: string[] = [];
            let processed = 0;

            for (const therapist of response.documents) {
                try {
                    // Check if already has translations
                    if (therapist.description_id && therapist.description_en) {
                        console.log(`Skipping therapist ${therapist.name} - already translated`);
                        continue;
                    }

                    // Determine source language (assume English if no Indonesian version exists)
                    const sourceLanguage: 'en' | 'id' = therapist.description_id ? 'id' : 'en';
                    
                    const result = await this.translateAndSaveTherapistData(
                        therapist.$id,
                        {
                            description: therapist.description,
                            location: therapist.location,
                            massageTypes: therapist.massageTypes,
                            name: therapist.name
                        },
                        sourceLanguage
                    );

                    if (result.success) {
                        processed++;
                        console.log(`✅ Translated therapist: ${therapist.name}`);
                    } else {
                        errors.push(`Failed to translate ${therapist.name}: ${result.error}`);
                    }

                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error) {
                    const errorMsg = `Error processing therapist ${therapist.name}: ${error}`;
                    errors.push(errorMsg);
                    console.error(errorMsg);
                }
            }

            return {
                success: errors.length === 0,
                processed,
                errors
            };

        } catch (error) {
            return {
                success: false,
                processed: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
}

// Export singleton instance
export const adminTranslationService = new AdminTranslationService();

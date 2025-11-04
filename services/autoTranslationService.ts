/**
 * Auto-Translation Service using Google Translate API
 * Translates text to multiple languages and stores in Appwrite
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

// Google Translate API configuration
// Add VITE_GOOGLE_TRANSLATE_API_KEY to your .env file
const GOOGLE_TRANSLATE_API_KEY = (import.meta as any).env?.VITE_GOOGLE_TRANSLATE_API_KEY || '';
const GOOGLE_TRANSLATE_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';

// Supported languages - Only English and Indonesian
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  id: 'Indonesian'
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Appwrite collection for translations
const TRANSLATIONS_COLLECTION_ID = COLLECTIONS.TRANSLATIONS;

export interface TranslationEntry {
  $id?: string;
  key: string; // Unique key for the text (e.g., "bookingPage.guestName")
  en: string;  // Source text in English
  id?: string; // Indonesian translation
  lastUpdated?: string;
  autoTranslated?: boolean;
}

class AutoTranslationService {
  /**
   * Translate text using Google Translate API
   */
  async translateText(
    text: string,
    targetLanguage: LanguageCode,
    sourceLanguage: LanguageCode = 'en'
  ): Promise<string> {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn('Google Translate API key not configured');
      return text; // Return original text if no API key
    }

    try {
      const url = `${GOOGLE_TRANSLATE_ENDPOINT}?key=${GOOGLE_TRANSLATE_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error(`Translation error for ${targetLanguage}:`, error);
      return text; // Fallback to original text
    }
  }

  /**
   * Translate text to all supported languages
   */
  async translateToAllLanguages(
    key: string,
    englishText: string
  ): Promise<TranslationEntry> {
    console.log(`Translating: "${key}" - "${englishText}"`);

    const translations: TranslationEntry = {
      key,
      en: englishText,
      autoTranslated: true,
      lastUpdated: new Date().toISOString()
    };

    // Translate to each language (excluding English)
    const languageCodes = Object.keys(SUPPORTED_LANGUAGES).filter(
      lang => lang !== 'en'
    ) as LanguageCode[];

    for (const lang of languageCodes) {
      try {
        const translated = await this.translateText(englishText, lang);
        translations[lang] = translated;
        console.log(`  ✓ ${lang}: ${translated}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ✗ Failed to translate to ${lang}:`, error);
        translations[lang] = englishText; // Fallback to English
      }
    }

    return translations;
  }

  /**
   * Check if translation exists in Appwrite
   */
  async getTranslation(key: string): Promise<TranslationEntry | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TRANSLATIONS_COLLECTION_ID,
        [Query.equal('key', key)]
      );

      if (response.documents.length > 0) {
        return response.documents[0] as unknown as TranslationEntry;
      }

      return null;
    } catch (error) {
      console.error('Error fetching translation from Appwrite:', error);
      return null;
    }
  }

  /**
   * Save translation to Appwrite
   */
  async saveTranslation(translation: TranslationEntry): Promise<void> {
    try {
      // Check if translation already exists
      const existing = await this.getTranslation(translation.key);

      if (existing) {
        // Update existing translation
        await databases.updateDocument(
          DATABASE_ID,
          TRANSLATIONS_COLLECTION_ID,
          existing.$id!,
          translation
        );
        console.log(`Updated translation in Appwrite: ${translation.key}`);
      } else {
        // Create new translation
        await databases.createDocument(
          DATABASE_ID,
          TRANSLATIONS_COLLECTION_ID,
          ID.unique(),
          translation
        );
        console.log(`Saved new translation to Appwrite: ${translation.key}`);
      }
    } catch (error) {
      console.error('Error saving translation to Appwrite:', error);
      throw error;
    }
  }

  /**
   * Get or create translation (main method to use)
   */
  async getOrTranslate(key: string, englishText: string): Promise<TranslationEntry> {
    // First, check if translation exists in Appwrite
    const existing = await this.getTranslation(key);

    if (existing) {
      console.log(`Using cached translation for: ${key}`);
      return existing;
    }

    // Translation doesn't exist, auto-translate it
    console.log(`Translating new text: ${key}`);
    const translated = await this.translateToAllLanguages(key, englishText);

    // Save to Appwrite for future use
    await this.saveTranslation(translated);

    return translated;
  }

  /**
   * Bulk translate an object of key-value pairs
   */
  async bulkTranslate(
    textMap: Record<string, string>,
    keyPrefix: string = ''
  ): Promise<Record<string, TranslationEntry>> {
    const results: Record<string, TranslationEntry> = {};

    for (const [key, text] of Object.entries(textMap)) {
      const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;
      results[key] = await this.getOrTranslate(fullKey, text);
    }

    return results;
  }

  /**
   * Get all translations for a specific language
   */
  async getAllTranslationsForLanguage(
    language: LanguageCode
  ): Promise<Record<string, string>> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TRANSLATIONS_COLLECTION_ID,
        [Query.limit(1000)] // Adjust limit as needed
      );

      const translations: Record<string, string> = {};

      for (const doc of response.documents) {
        const entry = doc as unknown as TranslationEntry;
        translations[entry.key] = entry[language] || entry.en;
      }

      return translations;
    } catch (error) {
      console.error('Error fetching all translations:', error);
      return {};
    }
  }

  /**
   * Update manual translation (override auto-translation)
   */
  async updateManualTranslation(
    key: string,
    language: LanguageCode,
    translatedText: string
  ): Promise<void> {
    try {
      const existing = await this.getTranslation(key);

      if (!existing) {
        throw new Error(`Translation key "${key}" not found`);
      }

      const updates = {
        [language]: translatedText,
        autoTranslated: false, // Mark as manually edited
        lastUpdated: new Date().toISOString()
      };

      await databases.updateDocument(
        DATABASE_ID,
        TRANSLATIONS_COLLECTION_ID,
        existing.$id!,
        updates
      );

      console.log(`Manually updated ${language} translation for: ${key}`);
    } catch (error) {
      console.error('Error updating manual translation:', error);
      throw error;
    }
  }

  /**
   * Delete translation
   */
  async deleteTranslation(key: string): Promise<void> {
    try {
      const existing = await this.getTranslation(key);

      if (existing) {
        await databases.deleteDocument(
          DATABASE_ID,
          TRANSLATIONS_COLLECTION_ID,
          existing.$id!
        );
        console.log(`Deleted translation: ${key}`);
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      throw error;
    }
  }
}

export const autoTranslationService = new AutoTranslationService();
export default autoTranslationService;

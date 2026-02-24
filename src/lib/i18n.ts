import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '../translations/index';
import { autoTranslationService } from './autoTranslationService';

// All supported languages
const SUPPORTED_LANGUAGES = [
  'en', 'id', // Base languages
  'th', 'vi', 'ms', 'tl', // Southeast Asian
  'zh', 'ja', 'ko', // East Asian
  'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'nl', 'tr', 'pl', 'sv', 'da' // Other major languages
];

// Define initial resource structure from existing translations
const resources: any = {
  en: translations.en || {},
  id: translations.id || {},
};

// Get stored language preference or default to Indonesian
const getStoredLanguage = (): string => {
  try {
    const stored = window.localStorage.getItem('app_language');
    return SUPPORTED_LANGUAGES.includes(stored || '') ? stored! : 'id';
  } catch {
    return 'id';
  }
};

/**
 * Load translations for a specific language
 * For languages without pre-translated content, uses English as fallback
 * This provides instant language switching with graceful degradation
 */
export async function loadLanguageResources(languageCode: string): Promise<void> {
  // Skip if already loaded
  if (i18n.hasResourceBundle(languageCode, 'common')) {
    console.log(`✅ Language ${languageCode} already loaded`);
    return;
  }

  try {
    console.log(`🌐 Loading translations for ${languageCode}...`);
    
    // For base languages (en, id), use existing translations
    if (languageCode === 'en' || languageCode === 'id') {
      i18n.addResourceBundle(languageCode, 'common', translations[languageCode as keyof typeof translations]);
      console.log(`✅ Loaded base language: ${languageCode}`);
      return;
    }

    // For other languages, use English as fallback for instant loading
    // In production, you would have pre-translated files or use a translation service
    console.log(`📝 Using English fallback for ${languageCode} (instant loading)`);
    
    // Add English resources as fallback
    i18n.addResourceBundle(languageCode, 'common', translations.en, true, true);
    
    console.log(`✅ Language ${languageCode} loaded (using English fallback for untranslated strings)`);
    
    // Optional: Queue background translation for future visits
    // This doesn't block the UI
    queueBackgroundTranslation(languageCode);
    
  } catch (error) {
    console.error(`❌ Failed to load language ${languageCode}:`, error);
    // Fallback to English
    i18n.addResourceBundle(languageCode, 'common', translations.en, true, true);
  }
}

/**
 * Queue translation loading in background (non-blocking)
 * This can be used to pre-translate content for future visits
 */
function queueBackgroundTranslation(languageCode: string): void {
  // This is a placeholder for background translation
  // In production, this could:
  // 1. Fetch pre-translated files from CDN
  // 2. Use a translation service API
  // 3. Load from IndexedDB cache
  // 4. Schedule translation during idle time
  
  console.log(`📋 Background translation queued for ${languageCode} (not implemented yet)`);
  
  // Example: You could implement lazy loading here
  // setTimeout(() => {
  //   // Load translations from API or CDN
  // }, 1000);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'en', // Missing keys in id fall back to English
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    debug: false, // Set to true for debugging
  });

export default i18n;

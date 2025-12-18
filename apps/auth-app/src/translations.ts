// Auth app translations - imports from root translations
import { translations as rootTranslations } from '../../../translations';

export const translations = rootTranslations;

// Helper function to get translated text
export const t = (key: string, lang: 'en' | 'id' = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${lang}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// Get language from localStorage
export const getStoredLanguage = (): 'en' | 'id' => {
  try {
    const stored = localStorage.getItem('app_language');
    return (stored === 'en' || stored === 'id') ? stored : 'id'; // Default to Indonesian
  } catch {
    return 'id';
  }
};

// Set language in localStorage
export const setStoredLanguage = (lang: 'en' | 'id') => {
  try {
    localStorage.setItem('app_language', lang);
  } catch (error) {
    console.error('Failed to store language:', error);
  }
};

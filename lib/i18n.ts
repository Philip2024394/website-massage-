import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '../translations/index';

// Define resource structure from existing translations
const resources = {
  en: translations.en || {},
  id: translations.id || {},
};

// Get stored language preference or default to Indonesian
const getStoredLanguage = (): 'en' | 'id' => {
  try {
    const stored = window.localStorage.getItem('app_language');
    return (stored === 'id' || stored === 'en') ? (stored as 'en' | 'id') : 'id';
  } catch {
    return 'id';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    debug: false, // Set to true for debugging
  });

export default i18n;

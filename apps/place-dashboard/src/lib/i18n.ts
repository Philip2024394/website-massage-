import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '../../../translations/index';

/**
 * PLACE DASHBOARD i18n Configuration (Massage Places)
 * - Languages: English (EN) + Indonesian (ID)
 * - Default: Indonesian
 * - User can switch via header icon
 * - Persists to localStorage
 */

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
      escapeValue: false,
    },
    debug: false,
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '../../../translations/index';

/**
 * ADMIN DASHBOARD i18n Configuration
 * - Language: English ONLY (no switching)
 * - Cannot be changed by user
 * - Maintains professional environment
 */

const resources = {
  en: translations.en || {},
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    debug: false,
  });

export default i18n;

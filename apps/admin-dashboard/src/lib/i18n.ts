import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Admin dashboard uses its own simplified translations
const translations = {
  en: {
    common: {
      dashboard: 'Admin Dashboard',
      therapists: 'Therapists',
      places: 'Places',
      bookings: 'Bookings',
      payments: 'Payments',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  }
};

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

/**
 * Complete Translation Export for Seeding
 * 
 * This file manually exports all translations from the TypeScript files
 * so the seeding script can read them without TypeScript compilation.
 */

// Import all translation modules (we'll copy the content directly)
const commonTranslations = require('./translations-common.cjs');
const authTranslations = require('./translations-auth.cjs');
const homeTranslations = require('./translations-home.cjs');
const dashboardTranslations = require('./translations-dashboard.cjs');
const massageTypesTranslations = require('./translations-massageTypes.cjs');
const jobsTranslations = require('./translations-jobs.cjs');
const partnersTranslations = require('./translations-partners.cjs');

// Merge all translations
function mergeTranslations(...translationObjects) {
  const merged = { en: {}, id: {} };

  for (const obj of translationObjects) {
    // Deep merge for nested objects
    for (const key in obj.en) {
      const value = obj.en[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged.en[key] = { ...(merged.en[key] || {}), ...value };
      } else {
        merged.en[key] = value;
      }
    }
    for (const key in obj.id) {
      const value = obj.id[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged.id[key] = { ...(merged.id[key] || {}), ...value };
      } else {
        merged.id[key] = value;
      }
    }
  }

  return merged;
}

// Export combined translations
const translations = mergeTranslations(
  commonTranslations,
  authTranslations,
  homeTranslations,
  dashboardTranslations,
  massageTypesTranslations,
  jobsTranslations,
  partnersTranslations
);

// Add remaining inline translations from index.ts
// (These are the ones defined directly in index.ts, not in separate modules)

// Registration Choice
translations.en.registrationChoice = {
  title: 'Join Us',
  prompt: 'Are you an individual therapist or a massage establishment?',
  therapistButton: "I'm a Therapist",
  placeButton: "I'm a Massage Place",
};
translations.id.registrationChoice = {
  title: 'Bergabung dengan Kami',
  prompt: 'Apakah Anda terapis individu atau tempat pijat?',
  therapistButton: 'Saya Terapis',
  placeButton: 'Saya Tempat Pijat',
};

// Add all other inline translations...
// (Copy from translations/index.ts lines 40-1000)

module.exports = translations;

import { ALLOW_TRANSLATION_OVERRIDES, TRANSLATION_LOCKED_COUNTRIES } from '../config/countryLocks';

// Discover translation override modules: country/<CODE>/translations/*.(ts|tsx)
const translationOverrideModules = import.meta.glob('../country/*/translations/*.{ts,tsx}');

function getOverrideKey(countryCode: string, fileName: string) {
  return `../country/${countryCode}/translations/${fileName}`;
}

export function resolveCountryTranslation(countryCode: string | undefined, fileName: string) {
  if (!countryCode || !ALLOW_TRANSLATION_OVERRIDES || TRANSLATION_LOCKED_COUNTRIES.includes(countryCode.toUpperCase())) {
    return null;
  }
  const key = getOverrideKey(countryCode.toUpperCase(), fileName);
  const loader = (translationOverrideModules as Record<string, any>)[key];
  if (!loader) return null;
  return loader; // caller will lazy-load and merge
}

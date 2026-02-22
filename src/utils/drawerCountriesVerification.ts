/**
 * Verification: ensures all side-drawer countries are connected to Appwrite and
 * open the correct country social page. Use in dev or tests.
 *
 * Connection chain:
 * 1. useDrawerCountries() → fetchDrawerCountries() (Appwrite) or DRAWER_COUNTRIES_LIST (static)
 * 2. For each country, hasCountryPage = COUNTRY_PAGE_IDS.has(country.id)
 * 3. navigateTo = getSafeDrawerPage(country.id) → must be a valid Page with an AppRouter case
 * 4. onNavigate(navigateTo) → state.setPage(navigateTo) → AppRouter renders country social page
 */

import { COUNTRY_PAGE_IDS, DRAWER_COUNTRIES_LIST } from '../constants/drawerCountries';
import { getSafeDrawerPage, DRAWER_PAGE_IDS } from '../config/drawerConfig';

const COUNTRY_SOCIAL_PAGES: ReadonlySet<string> = new Set([
  'indonesia', 'uk', 'malaysia', 'singapore', 'thailand', 'philippines',
  'vietnam', 'united-states', 'australia', 'germany',
]);

/**
 * Verifies that every country in the drawer list resolves to a valid social page id
 * (either as-is or via alias, e.g. united-kingdom → uk).
 */
export function verifyDrawerCountriesConnection(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const country of DRAWER_COUNTRIES_LIST) {
    if (!COUNTRY_PAGE_IDS.has(country.id)) {
      errors.push(`Country "${country.id}" is in the drawer but not in COUNTRY_PAGE_IDS; it will not open a social page.`);
      continue;
    }
    const pageId = getSafeDrawerPage(country.id);
    if (pageId === 'home') {
      errors.push(`Country "${country.id}" resolves to "home" via getSafeDrawerPage; add to DRAWER_PAGE_IDS and ALIASES if it should open a social page.`);
      continue;
    }
    if (!DRAWER_PAGE_IDS.includes(pageId as any)) {
      errors.push(`Country "${country.id}" resolves to "${pageId}" which is not in DRAWER_PAGE_IDS.`);
    }
    if (!COUNTRY_SOCIAL_PAGES.has(pageId)) {
      errors.push(`Country "${country.id}" resolves to "${pageId}" which is not a known country social page.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

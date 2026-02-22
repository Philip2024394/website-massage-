/**
 * Countries shown in the side drawer under "IndaStreet Countries".
 * Must match the countries on the main landing page (MainLandingPage COUNTRIES).
 * Each country links to its country landing page; only Indonesia has a dedicated page for now.
 */
export const DRAWER_COUNTRIES_LIST = [
  { id: 'indonesia' as const, code: 'ID', name: 'Indonesia', nameId: 'Indonesia', flag: '🇮🇩' },
  { id: 'malaysia' as const, code: 'MY', name: 'Malaysia', nameId: 'Malaysia', flag: '🇲🇾' },
  { id: 'singapore' as const, code: 'SG', name: 'Singapore', nameId: 'Singapore', flag: '🇸🇬' },
  { id: 'thailand' as const, code: 'TH', name: 'Thailand', nameId: 'Thailand', flag: '🇹🇭' },
  { id: 'philippines' as const, code: 'PH', name: 'Philippines', nameId: 'Philippines', flag: '🇵🇭' },
  { id: 'vietnam' as const, code: 'VN', name: 'Vietnam', nameId: 'Vietnam', flag: '🇻🇳' },
  { id: 'united-kingdom' as const, code: 'GB', name: 'United Kingdom', nameId: 'United Kingdom', flag: '🇬🇧' },
  { id: 'united-states' as const, code: 'US', name: 'United States', nameId: 'United States', flag: '🇺🇸' },
  { id: 'australia' as const, code: 'AU', name: 'Australia', nameId: 'Australia', flag: '🇦🇺' },
  { id: 'germany' as const, code: 'DE', name: 'Germany', nameId: 'Germany', flag: '🇩🇪' },
] as const;

/**
 * All country ids that have an in-app social page. Used by the side drawer:
 * when a country is in this set, clicking it opens the country social page (IndonesiaLandingPage with that country name).
 * When fetched from Appwrite, country id is derived from code in countries.service (e.g. GB → united-kingdom);
 * drawerConfig ALIASES map united-kingdom → uk for navigation. Ensure Appwrite country documents use
 * code: ID, MY, SG, TH, PH, VN, GB, US, AU, DE and active: true. Run scripts/seed-drawer-countries.ts to seed.
 */
export const COUNTRY_PAGE_IDS: Set<string> = new Set([
  'indonesia', 'malaysia', 'singapore', 'thailand', 'philippines', 'vietnam',
  'united-kingdom', 'united-states', 'australia', 'germany',
]);

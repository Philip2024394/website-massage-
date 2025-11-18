export type SupportedLang = 'en' | 'id' | 'zh-CN' | 'ru' | 'ja' | 'ko';

// Basic country->language defaults; expand as you add locales
const COUNTRY_TO_LANG: Record<string, SupportedLang> = {
  ID: 'id',
  SG: 'en',
  MY: 'en',
  AU: 'en',
  US: 'en',
  GB: 'en',
  PH: 'en',
  CN: 'zh-CN',
  HK: 'zh-CN',
  TW: 'zh-CN',
  RU: 'ru',
  JP: 'ja',
  KR: 'ko'
};

function normalize(code?: string): SupportedLang | undefined {
  if (!code) return undefined;
  const lc = code.toLowerCase();
  if (lc.startsWith('id')) return 'id';
  if (lc.startsWith('en')) return 'en';
  if (lc.startsWith('zh')) return 'zh-CN';
  if (lc.startsWith('ru')) return 'ru';
  if (lc.startsWith('ja')) return 'ja';
  if (lc.startsWith('ko')) return 'ko';
  return undefined;
}

export function resolveDefaultLanguage(
  supported: SupportedLang[],
  storedPreference: SupportedLang | null | undefined,
  navigatorLanguages: readonly string[] | undefined,
  countryCode?: string
): SupportedLang {
  // 1) Respect stored preference if supported
  if (storedPreference && supported.includes(storedPreference)) {
    return storedPreference;
  }

  // 2) Use browser preferred languages
  if (navigatorLanguages && navigatorLanguages.length) {
    for (const lang of navigatorLanguages) {
      const n = normalize(lang);
      if (n && supported.includes(n)) return n;
    }
  }

  // 3) Use country hint
  if (countryCode) {
    const cc = countryCode.toUpperCase();
    const byCountry = COUNTRY_TO_LANG[cc];
    if (byCountry && supported.includes(byCountry)) return byCountry;
  }

  // 4) Fallback to first supported (en)
  return (supported[0] || 'en');
}

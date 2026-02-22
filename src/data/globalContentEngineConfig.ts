/**
 * Global Social Content Engine — country configs, variety categories, service keywords.
 * See docs/GLOBAL-SOCIAL-CONTENT-ENGINE-SPEC.md.
 */

/** Primary language and tone per country */
export interface CountryContentConfig {
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  primaryLanguage: string;
  /** Tone description for copy generation */
  tone: 'friendly_helpful' | 'professional_informative' | 'formal_respectful';
  /** Example search phrases in local language (for SEO) */
  searchPhraseExamples: string[];
}

export const COUNTRY_CONTENT_CONFIGS: Record<string, CountryContentConfig> = {
  Indonesia: {
    country: 'Indonesia',
    countryCode: 'ID',
    primaryLanguage: 'Bahasa Indonesia',
    tone: 'friendly_helpful',
    searchPhraseExamples: [
      'pijat bandung',
      'massage jakarta',
      'spa bali',
      'pijat panggilan',
      'facial jakarta',
      'layanan pijat ke rumah',
    ],
  },
  UK: {
    country: 'United Kingdom',
    countryCode: 'GB',
    primaryLanguage: 'English',
    tone: 'professional_informative',
    searchPhraseExamples: [
      'massage London',
      'spa Manchester',
      'facial Birmingham',
      'mobile massage UK',
      'deep tissue London',
    ],
  },
  'Middle East': {
    country: 'Middle East',
    countryCode: 'AE', // placeholder; can be SA, QA, etc.
    primaryLanguage: 'English',
    tone: 'formal_respectful',
    searchPhraseExamples: [
      'spa Dubai',
      'massage Riyadh',
      'beauty treatment',
      'wellness Abu Dhabi',
    ],
  },
};

/** Variety categories — never repeat same twice in a row */
export const VARIETY_CATEGORIES = [
  'education',
  'tips',
  'benefits',
  'myths',
  'comparisons',
  'trends',
  'local recommendations',
  'questions',
] as const;

export type VarietyCategory = (typeof VARIETY_CATEGORIES)[number];

/** Required: each post must include exactly one service keyword */
export const SERVICE_KEYWORDS = [
  'massage',
  'spa',
  'facial',
  'beauty',
  'home service',
] as const;

export type ServiceKeyword = (typeof SERVICE_KEYWORDS)[number];

/** Cities per country (for city logic). Indonesia uses indonesiaSeoDataset. */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Indonesia: [], // filled from indonesiaSeoDataset at runtime
  UK: [
    'London',
    'Manchester',
    'Birmingham',
    'Leeds',
    'Liverpool',
    'Bristol',
    'Edinburgh',
    'Glasgow',
    'Cardiff',
    'Southampton',
  ],
  'Middle East': ['Dubai', 'Abu Dhabi', 'Riyadh', 'Doha', 'Kuwait City', 'Muscat', 'Bahrain'],
};

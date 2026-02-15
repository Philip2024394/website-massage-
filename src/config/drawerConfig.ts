/**
 * Home page drawer config – single source of truth for drawer navigation.
 * Keeps drawer links safe from broken routes: only ids listed here may be used
 * as fallback pages. When adding a link:
 * 1. Add the page id to DRAWER_PAGE_IDS (and to Page in pageTypes.ts if new).
 * 2. Add a matching case in AppRouter.tsx.
 */

import type { Page } from '../types/pageTypes';

/** Page ids the drawer is allowed to navigate to (must have routes in AppRouter). */
export const DRAWER_PAGE_IDS = [
  'home',
  'createAccount',
  'login',
  'indastreet-partners',
  'partnership-application',
  'massage-jobs',
  'how-it-works',
  'about',
  'company',
  'contact',
  'hotels-and-villas',
  'blog',
  'indastreet-news',
  'massage-bali',
  'massage-types',
  'facial-types',
  'balinese-massage',
  'deep-tissue-massage',
  'faq',
  'verifiedProBadge',
  'simple-signup',
  'simpleSignup',
  'website-management',
  'admin',
  'adminDashboard',
  'agentPortal',
] as const satisfies readonly Page[];

export type DrawerPageId = (typeof DRAWER_PAGE_IDS)[number];

/** Data-driven nav items: one array defines links; id must be in DRAWER_PAGE_IDS. */
export const DRAWER_NAV_ITEMS: ReadonlyArray<{
  id: DrawerPageId;
  labelKey: string;
  icon: 'Home' | 'Users' | 'Briefcase' | 'HelpCircle' | 'Info' | 'Building' | 'Phone' | 'Hotel' | 'BookOpen' | 'Heart' | 'Sparkles';
  sectionBreak?: boolean;
  labelOverride?: string;
}> = [
  { id: 'indastreet-partners', labelKey: 'partners', icon: 'Home' },
  { id: 'partnership-application', labelKey: 'joinIndaStreet', icon: 'Users' },
  { id: 'massage-jobs', labelKey: 'massageJobs', icon: 'Briefcase' },
  { id: 'how-it-works', labelKey: 'howItWorks', icon: 'HelpCircle' },
  { id: 'about', labelKey: 'aboutUs', icon: 'Info' },
  { id: 'company', labelKey: 'companyProfile', icon: 'Building' },
  { id: 'contact', labelKey: 'contact', icon: 'Phone' },
  { id: 'hotels-and-villas', labelKey: 'hotelsVillas', icon: 'Hotel' },
  { id: 'blog', labelKey: 'blog', icon: 'BookOpen' },
  { id: 'indastreet-news', labelKey: 'indastreetNews', icon: 'BookOpen' },
  { id: 'massage-bali', labelKey: 'massageInBali', icon: 'Heart', sectionBreak: true },
  { id: 'massage-types', labelKey: 'massageDirectory', icon: 'BookOpen' },
  { id: 'facial-types', labelKey: 'facialDirectory', icon: 'BookOpen' },
  { id: 'balinese-massage', labelKey: 'balineseMassage', icon: 'Heart' },
  { id: 'deep-tissue-massage', labelKey: 'deepTissueMassage', icon: 'Heart' },
  { id: 'faq', labelKey: 'faq', icon: 'HelpCircle' },
  { id: 'verifiedProBadge', labelKey: 'faq', icon: 'Sparkles', labelOverride: 'Massage Therapist Standards' },
  { id: 'simple-signup', labelKey: 'joinAsProvider', icon: 'Users', labelOverride: 'Sign Up' },
  { id: 'website-management', labelKey: 'websitePartners', icon: 'Home' },
];

/** Set for O(1) lookup when validating before navigate. */
export const DRAWER_FALLBACK_PAGES = new Set<string>(DRAWER_PAGE_IDS);

/**
 * Normalize drawer target: map known aliases to the canonical page id.
 * Use before onNavigate so both 'simpleSignup' and 'simple-signup' work.
 */
const ALIASES: Record<string, DrawerPageId> = {
  'simpleSignup': 'simple-signup',
  'agentPortal': 'admin',
  'agent-portal': 'admin',
  'adminDashboard': 'admin',
};

/**
 * Returns a safe page id for the drawer: allowed and canonical.
 * If not allowed, returns 'home'.
 */
export function getSafeDrawerPage(fallbackPage: string): Page {
  const normalized = ALIASES[fallbackPage] ?? fallbackPage;
  return DRAWER_FALLBACK_PAGES.has(normalized) ? (normalized as Page) : 'home';
}

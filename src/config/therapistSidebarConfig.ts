/**
 * THERAPIST SIDE DRAWER – SAFE LOCK CONFIG
 *
 * Single source of truth for sidebar menu item ids and their canonical Page routes.
 * Prevents broken links: every sidebar click resolves to a page that exists in AppRouter
 * and in useURLRouting pageToPath. Do not add an id here without adding the route in
 * AppRouter and the path in useURLRouting.
 *
 * When adding a new sidebar link:
 * 1. Add a case in AppRouter.tsx for the canonical page id.
 * 2. Add pageToPath and path→page handling in useURLRouting.ts.
 * 3. Add the mapping below (sidebarId → canonicalPage).
 */

import type { Page } from '../types/pageTypes';

/** Sidebar menu item ids (as used in TherapistLayout menuItems). */
export const THERAPIST_SIDEBAR_IDS = [
  'status',
  'therapist-how-it-works',
  'dashboard',
  'bookings',
  'customers',
  'send-discount',
  'earnings',
  'payment',
  'payment-status',
  'commission-payment',
  'custom-menu',
  'analytics',
  'therapist-hotel-villa-safe-pass',
  'notifications',
  'legal',
] as const;

export type TherapistSidebarId = (typeof THERAPIST_SIDEBAR_IDS)[number];

/**
 * Map sidebar id → canonical Page (must exist in AppRouter and useURLRouting).
 * Prevents landing-page redirect: short ids like 'status' and 'notifications'
 * become therapist-status / therapist-notifications so URL and router match.
 */
export const THERAPIST_SIDEBAR_TO_PAGE: Record<string, Page> = {
  status: 'therapist-status',
  'therapist-how-it-works': 'therapist-how-it-works',
  dashboard: 'therapist-dashboard',
  bookings: 'therapist-bookings',
  customers: 'customers', // AppRouter accepts both 'customers' and 'therapist-customers'
  'send-discount': 'send-discount',
  earnings: 'therapist-earnings',
  payment: 'therapist-payment',
  'payment-status': 'therapist-payment-status',
  'commission-payment': 'therapist-commission-payment',
  'custom-menu': 'therapist-menu',
  analytics: 'therapist-analytics',
  'therapist-hotel-villa-safe-pass': 'therapist-hotel-villa-safe-pass',
  notifications: 'therapist-notifications',
  legal: 'therapist-legal',
};

const SIDEBAR_IDS_SET = new Set<string>(THERAPIST_SIDEBAR_IDS);

/**
 * Resolve sidebar click to canonical Page. Use before calling onNavigate(page).
 * If the id is unknown, returns 'therapist-status' so we never send a broken page.
 */
export function getTherapistSidebarPage(sidebarId: string): Page {
  const canonical = THERAPIST_SIDEBAR_TO_PAGE[sidebarId];
  if (canonical) return canonical;
  if (SIDEBAR_IDS_SET.has(sidebarId)) return sidebarId as Page;
  return 'therapist-status';
}

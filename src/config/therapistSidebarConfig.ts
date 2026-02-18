/**
 * THERAPIST SIDE DRAWER & FAB – SAFE LOCK CONFIG
 *
 * Single source of truth for sidebar menu item ids, FAB action ids, and their canonical Page routes.
 * Prevents broken links: every sidebar/FAB click resolves to a page that exists in AppRouter
 * and in useURLRouting pageToPath.
 *
 * When adding a new sidebar link:
 * 1. Add a case in AppRouter.tsx for the canonical page id.
 * 2. Add pageToPath and path→page handling in useURLRouting.ts.
 * 3. Add the mapping in THERAPIST_SIDEBAR_TO_PAGE (sidebarId → canonicalPage).
 *
 * When adding a new FAB action:
 * 1. Add the mapping in THERAPIST_SIDEBAR_TO_PAGE (FAB id → canonicalPage).
 * 2. Add the id to FAB_ACTION_IDS below (safeguard: runtime check).
 */

import type { Page } from '../types/pageTypes';

/** FAB quick action ids (used by FloatingActionButton). Only kept dashboard pages. */
export const FAB_ACTION_IDS = [
  'bookings',
  'status',
  'notifications',
  'dashboard',
  'analytics',
] as const;

/** Sidebar menu item ids – only kept pages: status, how-it-works, dashboard, bookings, notifications, menu, analytics, safe-pass, legal, job-applications. */
export const THERAPIST_SIDEBAR_IDS = [
  'status',
  'therapist-how-it-works',
  'dashboard',
  'bookings',
  'custom-menu',
  'analytics',
  'therapist-hotel-villa-safe-pass',
  'notifications',
  'legal',
  'job-applications',
] as const;

export type TherapistSidebarId = (typeof THERAPIST_SIDEBAR_IDS)[number];

/**
 * Map sidebar id → canonical Page (must exist in AppRouter and useURLRouting).
 * Prevents landing-page redirect: short ids like 'status' and 'notifications'
 * become therapist-status / therapist-notifications so URL and router match.
 */
export const THERAPIST_SIDEBAR_TO_PAGE: Record<string, Page> = {
  status: 'therapist-status',
  'quick-booking-check': 'therapist-bookings',
  'therapist-how-it-works': 'therapist-how-it-works',
  dashboard: 'dashboard',
  bookings: 'therapist-bookings',
  'custom-menu': 'therapist-menu',
  analytics: 'therapist-analytics',
  'therapist-hotel-villa-safe-pass': 'therapist-hotel-villa-safe-pass',
  notifications: 'therapist-notifications',
  legal: 'therapist-legal',
  'job-applications': 'therapist-job-applications',
};

const SIDEBAR_IDS_SET = new Set<string>(THERAPIST_SIDEBAR_IDS);

/**
 * Resolve sidebar/FAB click to canonical Page. Use before calling onNavigate(page).
 * If the id is unknown, returns 'therapist-status' so we never send a broken page.
 */
export function getTherapistSidebarPage(sidebarId: string): Page {
  const canonical = THERAPIST_SIDEBAR_TO_PAGE[sidebarId];
  if (canonical) return canonical;
  if (SIDEBAR_IDS_SET.has(sidebarId)) return sidebarId as Page;
  return 'therapist-status';
}

/**
 * Safeguard: verify all FAB action ids resolve to a valid page (not fallback).
 * Run in dev to catch broken FAB links when adding new actions.
 */
export function assertFabActionsResolve(): void {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV !== true) return;
  const fallback: Page = 'therapist-status';
  for (const id of FAB_ACTION_IDS) {
    const resolved = getTherapistSidebarPage(id);
    if (resolved === fallback && id !== 'status') {
      console.warn(
        `[therapistSidebarConfig] FAB action "${id}" resolves to fallback (therapist-status). ` +
          `Add "${id}" to THERAPIST_SIDEBAR_TO_PAGE and ensure AppRouter + useURLRouting handle it.`
      );
    }
  }
}

// Run safeguard in dev when config is loaded
assertFabActionsResolve();

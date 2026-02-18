/**
 * Shared membership benefits for all country-specific membership pages.
 * Conversion-focused copy; used in Stage 3 of the membership flow.
 */

export const MEMBERSHIP_BENEFITS = [
  'Admin assistant support',
  'Booking management dashboard',
  'Analytics & reporting',
  'Full access to all platform tools and features',
  'Support and onboarding resources',
] as const;

export const MEMBERSHIP_BENEFITS_DESCRIPTIONS: Record<string, string> = {
  'Admin assistant support': 'Dedicated help with profile setup, bookings, and platform questions.',
  'Booking management dashboard': 'View, accept, and manage all your bookings in one place.',
  'Analytics & reporting': 'Track earnings, popular services, and performance over time.',
  'Full access to all platform tools and features': 'No limits — use everything we offer to grow your business.',
  'Support and onboarding resources': 'Guides, FAQs, and direct support to get you started quickly.',
};

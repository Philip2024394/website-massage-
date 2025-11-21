// Country override protection settings
// If a country code is listed in LOCKED_COUNTRIES, overrides will be ignored and base pages will render.
// Toggle ALLOW_OVERRIDES to globally enable/disable all country overrides (handy for emergency freeze).

export const LOCKED_COUNTRIES: string[] = [
  // Example: Protect UK while page overrides are under review
  'GB'
];

export const ALLOW_OVERRIDES: boolean = true;

// Drawer-specific safety locks (independent of page overrides).
// If a country code is listed here, its drawer override will be ignored.
export const DRAWER_LOCKED_COUNTRIES: string[] = [
  // Add country codes you want to freeze drawer overrides for.
];

// Global flag to enable/disable all drawer overrides quickly.
export const ALLOW_DRAWER_OVERRIDES: boolean = true;

// Service override safety locks (prevent country-specific service logic loading)
export const SERVICE_LOCKED_COUNTRIES: string[] = [];
export const ALLOW_SERVICE_OVERRIDES: boolean = true;

// Translation override safety locks
export const TRANSLATION_LOCKED_COUNTRIES: string[] = [];
export const ALLOW_TRANSLATION_OVERRIDES: boolean = true;

// Country override protection settings
// If a country code is listed in LOCKED_COUNTRIES, overrides will be ignored and base pages will render.
// Toggle ALLOW_OVERRIDES to globally enable/disable all country overrides (handy for emergency freeze).

export const LOCKED_COUNTRIES: string[] = [
  // Example: Protect UK while overrides are under review
  'GB'
];

export const ALLOW_OVERRIDES: boolean = true;

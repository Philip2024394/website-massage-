import React from 'react';
import { LOCKED_COUNTRIES, ALLOW_OVERRIDES } from '../config/countryLocks';

export type CountryCode = string; // e.g. 'ID', 'GB'

// Map of all override pages under country/<CODE>/pages/*.tsx
// Vite will include matching files at build time. Missing countries simply won't match.
const overrideModules = import.meta.glob('../country/*/pages/*.tsx');

function getOverrideKey(country: CountryCode, pageFile: string) {
  // pageFile: e.g. 'MarketplacePage' => expects '../country/ID/pages/MarketplacePage.tsx'
  return `../country/${country}/pages/${pageFile}.tsx`;
}

export function hasCountryOverride(country: CountryCode | undefined, pageFile: string): boolean {
  if (!country || !ALLOW_OVERRIDES) return false;
  if (LOCKED_COUNTRIES.includes(country)) return false;
  const key = getOverrideKey(country, pageFile);
  return Object.prototype.hasOwnProperty.call(overrideModules, key);
}

export function lazyCountryOverride<T = any>(country: CountryCode | undefined, pageFile: string) {
  if (!country || !ALLOW_OVERRIDES) return null as unknown as React.LazyExoticComponent<React.ComponentType<T>> | null;
  if (LOCKED_COUNTRIES.includes(country)) return null as unknown as React.LazyExoticComponent<React.ComponentType<T>> | null;
  const key = getOverrideKey(country, pageFile);
  const loader = (overrideModules as Record<string, any>)[key];
  if (!loader) return null as unknown as React.LazyExoticComponent<React.ComponentType<T>> | null;
  // The override module should export default React component compatible with the base page props
  return React.lazy(loader) as React.LazyExoticComponent<React.ComponentType<T>>;
}

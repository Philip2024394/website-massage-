import { ALLOW_SERVICE_OVERRIDES, SERVICE_LOCKED_COUNTRIES } from '../config/countryLocks';
import { marketplaceService } from './marketplaceService';

// Discover override modules: country/<CODE>/services/*ServiceOverride.(ts|tsx)
const serviceOverrideModules = import.meta.glob('../country/*/services/*ServiceOverride.{ts,tsx}');

function getOverrideKey(countryCode: string, baseServiceName: string) {
  // Example: marketplaceService -> MarketplaceServiceOverride.ts (pascal) OR marketplaceServiceOverride.ts (lower)
  // We'll standardize on lowercase original name + 'Override': marketplaceServiceOverride.ts
  return `../country/${countryCode}/services/${baseServiceName}Override.ts`;
}

export interface MarketplaceServiceLike {
  listProductsByCountry: (countryCode?: string) => Promise<any[]>;
  getProductById: (id: string) => Promise<any | null>;
  getSellerById: (id: string) => Promise<any | null>;
  devCreateTestProduct?: (opts: any) => Promise<any>;
}

export function resolveMarketplaceService(countryCode?: string): MarketplaceServiceLike {
  const code = (countryCode || '').toUpperCase();
  if (!code || !ALLOW_SERVICE_OVERRIDES || SERVICE_LOCKED_COUNTRIES.includes(code)) return marketplaceService;
  const key = getOverrideKey(code, 'marketplaceService');
  const loader = (serviceOverrideModules as Record<string, any>)[key];
  if (!loader) return marketplaceService;
  return loader() as Promise<{ default: MarketplaceServiceLike }> // Lazy module returns promise
    .then(mod => mod.default || marketplaceService)
    .catch(() => marketplaceService) as unknown as MarketplaceServiceLike; // Type cast for simplicity
}

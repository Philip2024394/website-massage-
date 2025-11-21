import React from 'react';
import { AppDrawer } from './AppDrawer';
import type { ComponentProps } from 'react';
import { DRAWER_LOCKED_COUNTRIES, ALLOW_DRAWER_OVERRIDES } from '../config/countryLocks';
import { useCountryContext } from '../context/CountryContext';

// Dynamically discover country-specific drawer override components located at:
//   country/<CODE>/drawer/AppDrawerOverride.tsx
// Each override must export a default React component with the same props as AppDrawer.
const drawerOverrideModules = import.meta.glob('../country/*/drawer/AppDrawerOverride.tsx');

function getOverrideKey(countryCode: string) {
  return `../country/${countryCode}/drawer/AppDrawerOverride.tsx`;
}

export interface CountryAppDrawerProps extends ComponentProps<typeof AppDrawer> {
  countryCode?: string | null;
}

const CountryAppDrawer: React.FC<CountryAppDrawerProps> = ({ countryCode, ...rest }) => {
  const { activeCountry } = useCountryContext();
  const code = (countryCode || activeCountry || '').toUpperCase();
  const isLocked = !ALLOW_DRAWER_OVERRIDES || !code || DRAWER_LOCKED_COUNTRIES.includes(code);
  if (!isLocked) {
    const key = getOverrideKey(code);
    const loader = (drawerOverrideModules as Record<string, any>)[key];
    if (loader) {
      const LazyOverride = React.lazy(loader);
      return (
        <React.Suspense fallback={null}>
          <LazyOverride countryCode={code} {...rest} />
        </React.Suspense>
      );
    }
  }
  return <AppDrawer {...rest} />;
};

export default CountryAppDrawer;
/**
 * Fetches countries for the side drawer from Appwrite.
 * Falls back to static DRAWER_COUNTRIES_LIST when Appwrite is unavailable or empty.
 *
 * Connection: each country with id in COUNTRY_PAGE_IDS opens the country social page
 * via getSafeDrawerPage(country.id) → onNavigate(page). AppRouter has a case for each
 * (indonesia, uk, malaysia, singapore, thailand, philippines, vietnam, united-states, australia, germany).
 */

import { useState, useEffect } from 'react';
import { fetchDrawerCountries, type DrawerCountryItem } from '../lib/appwrite/services/countries.service';
import { DRAWER_COUNTRIES_LIST } from '../constants/drawerCountries';
import { verifyDrawerCountriesConnection } from '../utils/drawerCountriesVerification';

const staticFallback: DrawerCountryItem[] = DRAWER_COUNTRIES_LIST.map((c) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  nameId: c.nameId,
  flag: c.flag,
  linkedWebsite: undefined,
}));

export function useDrawerCountries(): {
  countries: DrawerCountryItem[];
  loading: boolean;
  fromAppwrite: boolean;
} {
  const [countries, setCountries] = useState<DrawerCountryItem[]>(staticFallback);
  const [loading, setLoading] = useState(true);
  const [fromAppwrite, setFromAppwrite] = useState(false);

  useEffect(() => {
    if (import.meta.env?.DEV) {
      const { ok, errors } = verifyDrawerCountriesConnection();
      if (!ok && errors.length > 0) {
        console.warn('[useDrawerCountries] Drawer countries connection check failed:', errors);
      }
    }

    let cancelled = false;
    setLoading(true);
    fetchDrawerCountries()
      .then((list) => {
        if (cancelled) return;
        if (list.length > 0) {
          setCountries(list);
          setFromAppwrite(true);
        } else {
          setCountries(staticFallback);
          setFromAppwrite(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCountries(staticFallback);
          setFromAppwrite(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, loading, fromAppwrite };
}

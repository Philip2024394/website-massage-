/**
 * Fetches countries for the side drawer from Appwrite.
 * Falls back to static DRAWER_COUNTRIES_LIST when Appwrite is unavailable or empty.
 */

import { useState, useEffect } from 'react';
import { fetchDrawerCountries, type DrawerCountryItem } from '../lib/appwrite/services/countries.service';
import { DRAWER_COUNTRIES_LIST } from '../constants/drawerCountries';

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

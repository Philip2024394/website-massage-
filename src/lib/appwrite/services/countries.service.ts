/**
 * Countries – fetch active countries from Appwrite for side drawer and linked websites.
 *
 * APPWRITE COLLECTION: countries (same database as app).
 * Create via: APPWRITE_API_KEY=... npx ts-node scripts/setup-countries-collection.ts
 *
 * Used by: AppDrawer "IndaStreet Countries", MainLandingPage country selector.
 * linkedWebsite: optional URL for the country's linked website (opens in new tab when set).
 */

import { databases, Query } from '../../appwrite';
import { APPWRITE_CONFIG } from '../../appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections?.countries;

export interface DrawerCountryItem {
  id: string;
  code: string;
  name: string;
  nameId: string;
  flag: string;
  linkedWebsite?: string;
}

interface CountryDoc {
  $id: string;
  code: string;
  name: string;
  flag: string;
  description?: string;
  language?: string;
  languages?: string;
  active?: boolean;
  dialCode?: string;
  currency?: string;
  timezone?: string;
  cities?: string;
  totalTherapists?: number;
  totalBookings?: number;
  linkedWebsite?: string;
}

function slugFromCode(code: string): string {
  const map: Record<string, string> = {
    ID: 'indonesia',
    MY: 'malaysia',
    SG: 'singapore',
    TH: 'thailand',
    PH: 'philippines',
    VN: 'vietnam',
    GB: 'united-kingdom',
    US: 'united-states',
    AU: 'australia',
    DE: 'germany',
  };
  return map[code] || code.toLowerCase();
}

function mapDocToItem(doc: CountryDoc): DrawerCountryItem {
  return {
    id: slugFromCode(doc.code),
    code: doc.code || '',
    name: doc.name || '',
    nameId: doc.name || '',
    flag: doc.flag || '',
    linkedWebsite: doc.linkedWebsite && doc.linkedWebsite.trim() ? doc.linkedWebsite.trim() : undefined,
  };
}

/**
 * Fetches active countries from Appwrite for the side drawer.
 * Returns empty array if collection is missing or request fails (caller should use static fallback).
 */
export async function fetchDrawerCountries(): Promise<DrawerCountryItem[]> {
  if (!COLLECTION_ID || !DATABASE_ID) {
    return [];
  }
  try {
    const response = await databases.listDocuments<CountryDoc>(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('active', true), Query.orderAsc('name'), Query.limit(50)]
    );
    const docs = response.documents || [];
    return docs.map(mapDocToItem);
  } catch (err: any) {
    const msg = err?.message || String(err);
    const is404 = msg.includes('404') || err?.code === 404;
    if (import.meta.env?.DEV) {
      console.warn(
        '[Countries]',
        is404
          ? 'Collection "countries" not found. Run scripts/setup-countries-collection.ts or create it in Appwrite Console.'
          : 'Could not fetch countries from Appwrite:',
        msg
      );
    }
    return [];
  }
}

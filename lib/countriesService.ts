import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

export interface CountryDoc {
  $id: string;
  isoCode?: string;
  code?: string;
  name: string;
  countryName?: string;
  currencyCode?: string;
  currency?: string;
  currencySymbol?: string;
  active?: boolean;
  dialCode?: string;
  continent?: string;
  capitalCity?: string;
  defaultLat?: string | number;
  defaultLng?: number;
  defaultCity?: string;
  showMarketplace?: boolean;
  supportsPlaces?: boolean;
  supportsTherapists?: boolean;
  bookingCurrencyLock?: boolean;
  notes?: string;
}

export async function getCountryByIso(isoCode: string): Promise<CountryDoc | null> {
  const cc = (isoCode || '').toUpperCase();
  if (!cc) return null;
  try {
    // Prefer isoCode, fallback to code if needed
    let list = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COUNTRIES, [
      Query.equal('isoCode', [cc]),
      Query.limit(1)
    ]);
    if (list.total === 0) {
      list = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COUNTRIES, [
        Query.equal('code', [cc]),
        Query.limit(1)
      ]);
    }
    return list.total > 0 ? (list.documents[0] as CountryDoc) : null;
  } catch (e) {
    console.error('[countriesService] getCountryByIso failed:', e);
    return null;
  }
}

export async function listActiveCountries(): Promise<CountryDoc[]> {
  try {
    const list = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COUNTRIES, [
      Query.equal('active', [true]),
      Query.limit(200)
    ]);
    return (list.documents || []) as CountryDoc[];
  } catch (e) {
    console.error('[countriesService] listActiveCountries failed:', e);
    return [];
  }
}

export function coerceCoords(doc: CountryDoc): { lat?: number; lng?: number; city?: string } {
  const lat = typeof doc.defaultLat === 'string' ? parseFloat(doc.defaultLat) : doc.defaultLat;
  const lng = typeof doc.defaultLng === 'number' ? doc.defaultLng : undefined;
  const city = doc.defaultCity;
  return { lat: isFinite(Number(lat)) ? Number(lat) : undefined, lng, city };
}

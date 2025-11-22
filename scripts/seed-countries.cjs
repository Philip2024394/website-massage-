#!/usr/bin/env node
// Upsert initial countries into Appwrite `countries` collection.
// Reads connection and target IDs from environment variables.

/*
Required env vars:
  APPWRITE_ENDPOINT
  APPWRITE_PROJECT_ID
  APPWRITE_API_KEY
  DATABASE_ID
  COUNTRIES_COLLECTION_ID

Optional:
  DRY_RUN=true|false (default true)
*/

const { Client, Databases, Query } = require('node-appwrite');

const DRY_RUN = (process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false';

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const SEED = [
  // isoCode, name, dialCode, currencyCode, currencySymbol, coords
  { isoCode: 'ID', name: 'Indonesia', dialCode: '+62', currencyCode: 'IDR', currencySymbol: 'Rp', lat: -6.200000, lng: 106.816666, city: 'Jakarta', continent: 'AS' },
  { isoCode: 'MY', name: 'Malaysia', dialCode: '+60', currencyCode: 'MYR', currencySymbol: 'RM', lat: 3.139003, lng: 101.686852, city: 'Kuala Lumpur', continent: 'AS' },
  { isoCode: 'SG', name: 'Singapore', dialCode: '+65', currencyCode: 'SGD', currencySymbol: '$', lat: 1.352083, lng: 103.819839, city: 'Singapore', continent: 'AS' },
  { isoCode: 'AU', name: 'Australia', dialCode: '+61', currencyCode: 'AUD', currencySymbol: '$', lat: -33.868820, lng: 151.209290, city: 'Sydney', continent: 'OC' },
  { isoCode: 'GB', name: 'United Kingdom', dialCode: '+44', currencyCode: 'GBP', currencySymbol: '£', lat: 51.507351, lng: -0.127758, city: 'London', continent: 'EU' },
  { isoCode: 'US', name: 'United States', dialCode: '+1', currencyCode: 'USD', currencySymbol: '$', lat: 40.712776, lng: -74.005974, city: 'New York', continent: 'NA' },
  { isoCode: 'EU', name: 'European Union (Euro)', dialCode: '+00', currencyCode: 'EUR', currencySymbol: '€', lat: 50.110924, lng: 8.682127, city: 'Frankfurt', continent: 'EU' },
];

async function upsertCountry(databases, databaseId, collectionId, payload)() {
  // Try to find by isoCode (preferred unique key)
  const list = await databases.listDocuments(databaseId, collectionId, [
    Query.equal('isoCode', [payload.isoCode])
  ]);

  const docBase = {
    // Align to your collection fields; set duplicates for compatibility
    isoCode: payload.isoCode,
    code: payload.isoCode,
    name: payload.name,
    countryName: payload.name,
    dialCode: payload.dialCode,
    currencyCode: payload.currencyCode,
    currency: payload.currencyCode,
    currencySymbol: payload.currencySymbol,
    continent: payload.continent,
    defaultCity: payload.city,
    // Note: your current schema has defaultLat as string and defaultLng as double
    // Send types accordingly to avoid validation errors
    defaultLat: String(payload.lat),
    defaultLng: Number(payload.lng),
    active: true,
    supportsTherapists: true,
    supportsPlaces: true,
    showMarketplace: true,
    bookingCurrencyLock: true,
  };

  if (list.total > 0) {
    const doc = list.documents[0];
    if (DRY_RUN) {
      console.log(`[seed-countries] would update ${doc.$id} (${payload.isoCode}):`, docBase);
      return { action: 'update', id: doc.$id };
    }
    await databases.updateDocument(databaseId, collectionId, doc.$id, docBase);
    console.log(`[seed-countries] updated ${doc.$id} (${payload.isoCode})`);
    return { action: 'update', id: doc.$id };
  }

  if (DRY_RUN) {
    console.log(`[seed-countries] would create (${payload.isoCode}):`, docBase);
    return { action: 'create' };
  }
  const created = await databases.createDocument(databaseId, collectionId, 'unique()', docBase);
  console.log(`[seed-countries] created ${created.$id} (${payload.isoCode})`);
  return { action: 'create', id: created.$id };
}

async function main() {
  try {
    const endpoint = required('APPWRITE_ENDPOINT');
    const projectId = required('APPWRITE_PROJECT_ID');
    const apiKey = required('APPWRITE_API_KEY');
    const databaseId = required('DATABASE_ID');
    const collectionId = required('COUNTRIES_COLLECTION_ID');

    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const databases = new Databases(client);

    console.log(`[seed-countries] Starting (dryRun=${DRY_RUN}). Database=${databaseId} Collection=${collectionId}`);
    for (const c of SEED) {
      try {
        await upsertCountry(databases, databaseId, collectionId, c)();
      } catch (e) {
        console.error(`[seed-countries] failed for ${c.isoCode}:`, e?.message || e);
      }
    }
    console.log('[seed-countries] Done');
  } catch (e) {
    console.error('Fatal:', e?.message || e);
    process.exit(1);
  }
}

main();

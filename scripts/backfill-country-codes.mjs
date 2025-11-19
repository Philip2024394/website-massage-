#!/usr/bin/env node
import { Client, Databases, Query } from 'node-appwrite';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const log = (...args) => console.log('[backfill-country-codes]', ...args);

const required = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
};

const DRY_RUN = (process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false';

const COUNTRY_MAP = Object.freeze({
  'indonesia': 'ID',
  'malaysia': 'MY',
  'singapore': 'SG',
  'australia': 'AU',
  'united kingdom': 'GB',
  'great britain': 'GB',
  'uk': 'GB',
  'ireland': 'IE',
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'china': 'CN',
  'japan': 'JP',
  'russia': 'RU',
  'south korea': 'KR',
  'korea, republic of': 'KR',
  'republic of korea': 'KR',
  'france': 'FR',
  'germany': 'DE',
  'india': 'IN',
  'italy': 'IT',
  'mexico': 'MX',
  'brazil': 'BR',
  'canada': 'CA',
  'spain': 'ES',
  'netherlands': 'NL',
  'portugal': 'PT',
  'belgium': 'BE',
  'sweden': 'SE',
  'switzerland': 'CH',
  'poland': 'PL',
  'austria': 'AT',
  'czechia': 'CZ',
  'czech republic': 'CZ',
  'ind': 'IN',
});

function normalizeCountryName(input) {
  if (!input || typeof input !== 'string') return null;
  return input.trim().toLowerCase();
}

function deriveCountryCodeFromDoc(doc) {
  const existing = (doc.countryCode || doc.country_code || doc.countrycode);
  if (existing && typeof existing === 'string' && existing.length === 2) {
    return { code: existing.toUpperCase(), reason: 'already_set' };
  }

  const rawName = doc.country || doc.addressCountry || doc.locationCountry || null;
  let name = normalizeCountryName(rawName);

  // Try parsing from address string if no explicit field
  if (!name && typeof doc.address === 'string' && doc.address.includes(',')) {
    const parts = doc.address.split(',').map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    name = normalizeCountryName(last);
  }

  if (!name) return { code: null, reason: 'no_country_hint' };

  // Direct map
  if (COUNTRY_MAP[name]) return { code: COUNTRY_MAP[name], reason: 'from_map' };

  // Heuristic: match if any map key is contained in name (e.g., "jakarta, indonesia")
  for (const key of Object.keys(COUNTRY_MAP)) {
    if (name.includes(key)) return { code: COUNTRY_MAP[key], reason: 'from_contains' };
  }

  return { code: null, reason: `unmapped_country:${name}` };
}

async function processCollection(databases, databaseId, collectionId) {
  let totalUpdated = 0;
  let cursor = null;
  const pageSize = 100;

  while (true) {
    const queries = [Query.limit(pageSize)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const page = await databases.listDocuments(databaseId, collectionId, queries);
    if (!page || !page.documents || page.documents.length === 0) break;

    for (const doc of page.documents) {
      const { code, reason } = deriveCountryCodeFromDoc(doc);
      if (!code || reason === 'already_set') {
        continue;
      }
      log(`Doc ${doc.$id}: set countryCode=${code} (${reason})`);
      if (!DRY_RUN) {
        try {
          await databases.updateDocument(databaseId, collectionId, doc.$id, { countryCode: code });
          totalUpdated++;
        } catch (e) {
          console.error(`Update failed for ${doc.$id}:`, e?.message || e);
          // Avoid rate limits burst
          await sleep(50);
        }
      }
    }

    cursor = page.documents[page.documents.length - 1].$id;
    // Avoid API hammering
    await sleep(100);
  }

  return totalUpdated;
}

async function main() {
  try {
    const endpoint = required('APPWRITE_ENDPOINT');
    const projectId = required('APPWRITE_PROJECT_ID');
    const apiKey = required('APPWRITE_API_KEY');
    const databaseId = required('DATABASE_ID');

    const therapistsCol = process.env.THERAPISTS_COLLECTION_ID || '';
    const placesCol = process.env.PLACES_COLLECTION_ID || '';
    if (!therapistsCol && !placesCol) {
      throw new Error('Provide THERAPISTS_COLLECTION_ID and/or PLACES_COLLECTION_ID');
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);
    log(`Starting backfill (dryRun=${DRY_RUN}). Database=${databaseId}`);

    let updated = 0;
    if (therapistsCol) {
      log(`Processing therapists collection: ${therapistsCol}`);
      updated += await processCollection(databases, databaseId, therapistsCol);
    }
    if (placesCol) {
      log(`Processing places collection: ${placesCol}`);
      updated += await processCollection(databases, databaseId, placesCol);
    }

    log(`Done. Updated ${updated} documents.${DRY_RUN ? ' (dry run)' : ''}`);
  } catch (e) {
    console.error('Fatal:', e?.message || e);
    process.exit(1);
  }
}

main();

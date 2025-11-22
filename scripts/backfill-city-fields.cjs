#!/usr/bin/env node
/**
 * Backfill city, countryCode, country fields for therapists & places.
 *
 * Usage:
 *   node scripts/backfill-city-fields.cjs
 *
 * Requirements:
 *   - Set APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY env vars OR use existing config import.
 *   - Collections must have added attributes: city (string), countryCode (string), country (string).
 */

import { Client, Databases, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config.js';

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DB_ID = APPWRITE_CONFIG.databaseId;
const THERAPISTS = APPWRITE_CONFIG.collections.therapists;
const PLACES = APPWRITE_CONFIG.collections.places;

// Derive city from location string: take first comma part, trim
const deriveCity = (location) => {
  if (!location || typeof location !== 'string') return '';
  const first = location.split(',')[0].trim();
  // Basic cleanup: remove numbers or postal codes at end
  return first.replace(/\d{5,}$/,'').trim();
};

async function backfill(collectionId) {
  console.log(`\n➡ Backfilling collection: ${collectionId}`);
  let page = 0;
  const limit = 100;
  let totalUpdated = 0;
  while (true) {
    const docs = await databases.listDocuments(DB_ID, collectionId, [Query.limit(limit), Query.offset(page * limit)]);
    if (!docs.documents.length) break;
    for (const doc of docs.documents) {
      const city = doc.city && doc.city.trim() ? doc.city.trim() : deriveCity(doc.location);
      const countryCode = doc.countryCode || (doc.location_countryCode || '');
      const country = doc.country || (doc.location_country || '');
      // Skip if city already set and countryCode present
      if (doc.city && doc.countryCode) continue;
      try {
        await databases.updateDocument(DB_ID, collectionId, doc.$id, { city, countryCode, country });
        totalUpdated++;
        console.log(`✅ Updated ${collectionId} doc ${doc.$id}: city='${city}' countryCode='${countryCode}'`);
      } catch (e) {
        console.warn(`⚠️ Failed updating ${doc.$id}:`, e.message);
      }
    }
    page++;
  }
  console.log(`✔ Finished ${collectionId}. Documents updated: ${totalUpdated}`);
}

(async () => {
  try {
    await backfill(THERAPISTS);
    await backfill(PLACES);
    console.log('\n🎉 Backfill complete');
  } catch (e) {
    console.error('❌ Backfill error:', e);
    process.exit(1);
  }
})();

#!/usr/bin/env node
/**
 * Audit: Why 0 therapists in Yogyakarta when Appwrite has ~60?
 *
 * 1. Fetches therapists from Appwrite (baseline: limit 200, no filters).
 * 2. Applies same city-matching logic as the app (Yogyakarta = yogyakarta, Jogja, Yogya, etc.).
 * 3. Reports: total in Appwrite, how many match Yogyakarta, sample of city/location values.
 *
 * Run:
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/audit-yogyakarta-therapists.ts
 *
 * Requires .env or env: APPWRITE_API_KEY; optional: VITE_APPWRITE_*, VITE_THERAPISTS_COLLECTION_ID
 */

import { config } from 'dotenv';
config();

import { Client, Databases, Query } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const collectionId = process.env.VITE_THERAPISTS_COLLECTION_ID || 'therapists_collection_id';
const apiKey = process.env.APPWRITE_API_KEY;

// Same matchable values as app for "Yogyakarta" (from indonesianCities: locationId, name, aliases)
const YOGYAKARTA_MATCHABLE = new Set(
  [
    'yogyakarta',
    'jogja',
    'yogya',
    'cultural capital',
    'di yogyakarta',
    'daerah istimewa yogyakarta',
    'yogyakarta, indonesia',
    'jogja, indonesia',
  ].map((s) => s.toLowerCase().trim())
);

function normalize(s: string | undefined | null): string {
  if (s == null || s === '') return '';
  return String(s).toLowerCase().trim();
}

function therapistCityMatchesYogyakarta(doc: any): boolean {
  const cityRaw = doc.city ?? doc.locationId ?? doc.location_id ?? doc.location ?? '';
  const cityNorm = normalize(cityRaw);
  if (!cityNorm) return false;
  if (YOGYAKARTA_MATCHABLE.has(cityNorm)) return true;
  const cityPart = cityNorm.includes(',') ? cityNorm.split(',')[0].trim() : cityNorm;
  return YOGYAKARTA_MATCHABLE.has(cityPart);
}

async function runAudit(): Promise<void> {
  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required. Set in .env or: APPWRITE_API_KEY=... pnpm tsx scripts/audit-yogyakarta-therapists.ts');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  console.log('\n——— Audit: Why 0 therapists in Yogyakarta? ———\n');
  console.log('Config:', { databaseId, collectionId, endpoint: endpoint?.slice(0, 30) + '...' });

  try {
    // 1) Baseline query (no filters) – same as app when VITE_THERAPIST_FILTER_STEP=0
    const res = await databases.listDocuments(databaseId, collectionId, [Query.limit(200)]);
    const total = res.total ?? 0;
    const documents = (res.documents ?? []) as any[];

    console.log('\n1) Appwrite baseline (limit 200, no filters):');
    console.log('   result.total:', total);
    console.log('   result.documents.length:', documents.length);

    if (documents.length === 0) {
      console.log('\n   → No documents returned. Possible causes: wrong DATABASE_ID/COLLECTION_ID, permissions (Read for Any/Users), or collection empty.');
      return;
    }

    // 2) How many match Yogyakarta (same logic as filterTherapistsByCity)
    const matchingYogyakarta = documents.filter((d) => therapistCityMatchesYogyakarta(d));
    const notMatching = documents.filter((d) => !therapistCityMatchesYogyakarta(d));

    console.log('\n2) City filter (Yogyakarta = yogyakarta, Jogja, Yogya, DI Yogyakarta, etc.):');
    console.log('   Matching Yogyakarta:', matchingYogyakarta.length);
    console.log('   Not matching (other/missing city):', notMatching.length);

    // 3) Unique city/location values in DB (why some don’t match)
    const cityValues = new Map<string, number>();
    for (const d of documents) {
      const cityRaw = d.city ?? d.locationId ?? d.location_id ?? d.location ?? '(empty)';
      const key = String(cityRaw).trim() || '(empty)';
      cityValues.set(key, (cityValues.get(key) || 0) + 1);
    }
    const sorted = [...cityValues.entries()].sort((a, b) => b[1] - a[1]);
    console.log('\n3) City/location values in Appwrite (value → count):');
    sorted.slice(0, 25).forEach(([val, count]) => console.log('   ', JSON.stringify(val), '→', count));
    if (sorted.length > 25) console.log('   ... and', sorted.length - 25, 'more');

    // 4) Sample of non-matching docs (so we see what to fix)
    if (notMatching.length > 0) {
      console.log('\n4) Sample of therapists NOT matching Yogyakarta (first 10):');
      notMatching.slice(0, 10).forEach((d) => {
        const city = d.city ?? d.locationId ?? d.location_id ?? d.location ?? '(empty)';
        console.log('   ', d.name || d.$id, '| city:', JSON.stringify(city), '| locationId:', JSON.stringify(d.locationId), '| location:', JSON.stringify(d.location));
      });
    }

    // 5) Verdict
    console.log('\n5) Verdict:');
    if (documents.length === 0) {
      console.log('   Appwrite returns 0 therapists. Fix: IDs, permissions, or use baseline query (no filters).');
    } else if (matchingYogyakarta.length === 0) {
      console.log('   App has', documents.length, 'therapists from Appwrite but 0 match Yogyakarta.');
      console.log('   → Therapist profiles use city/location values that don’t match (see list above).');
      console.log('   → Fix: Set therapist.city or locationId to one of: Yogyakarta, yogyakarta, Jogja, Yogya, DI Yogyakarta.');
    } else {
      console.log('   App should show', matchingYogyakarta.length, 'therapists in Yogyakarta. If UI still shows 0, check selectedCity/activeCity and client-side filter.');
    }
    console.log('\n————————————————————————————————————————————\n');
  } catch (e: any) {
    console.error('❌ Audit failed:', e?.message || e);
    process.exit(1);
  }
}

runAudit();

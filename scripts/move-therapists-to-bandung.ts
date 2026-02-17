#!/usr/bin/env node
/**
 * Move specific therapists (Sari, Darius) to Bandung location if not already there.
 * Updates: city, locationId, location to Bandung so they appear in Bandung listing.
 *
 * Run:
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/move-therapists-to-bandung.ts
 * Dry run (no writes):
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/move-therapists-to-bandung.ts --dry-run
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

const TARGET_NAMES = ['Sari', 'Darius'];
const BANDUNG_LOCATION_ID = 'bandung';
const BANDUNG_DISPLAY = 'Bandung';

function normalizeName(name: string): string {
  return (name || '').trim().toLowerCase();
}

function isTargetTherapist(name: string): boolean {
  const n = normalizeName(name);
  return TARGET_NAMES.some(t => n === normalizeName(t));
}

function isAlreadyInBandung(doc: any): boolean {
  const city = (doc.city || doc.locationId || doc.location || '').toString().toLowerCase().trim();
  return city === BANDUNG_LOCATION_ID || city === 'bandung';
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('🔍 DRY RUN – no documents will be updated.\n');

  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required. Set it in .env or: APPWRITE_API_KEY=... pnpm tsx scripts/move-therapists-to-bandung.ts');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  try {
    const res = await databases.listDocuments(databaseId, collectionId, [Query.limit(500)]);
    const docs = (res.documents || []) as any[];
    const matches = docs.filter(d => isTargetTherapist(d.name || ''));
    const toMove = matches.filter(d => !isAlreadyInBandung(d));

    console.log('Therapists to move to Bandung (Sari, Darius):');
    if (toMove.length === 0) {
      console.log('  None – either not found or already in Bandung.');
      matches.forEach(m => console.log(`  - ${m.name} (${m.$id}) – already in ${m.city || m.locationId || m.location || '?'}`));
      return;
    }

    // Only set attributes that exist on the collection (Appwrite rejects unknown attributes like "city").
    // App filters by city || locationId || location_id || location – setting location + locationId is enough for Bandung listing.
    const updatePayload = {
      location: BANDUNG_DISPLAY,
      locationId: BANDUNG_LOCATION_ID,
    };

    for (const doc of toMove) {
      const id = doc.$id;
      console.log(`  Moving: ${doc.name} (${id}) from "${doc.city || doc.locationId || doc.location || '?'}" → Bandung`);
      if (!dryRun) {
        await databases.updateDocument(databaseId, collectionId, id, updatePayload);
        console.log(`    ✅ Updated.`);
      }
    }

    if (dryRun) console.log('\nRun without --dry-run to apply updates.');
  } catch (e: any) {
    console.error('❌ Error:', e?.message || e);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
/**
 * Move specific therapists to target locations by name.
 * Example: Diamond → Bali, Parrot → Bandung.
 *
 * Run:
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/move-therapists-by-name.ts
 * Dry run (no writes):
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/move-therapists-by-name.ts --dry-run
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

/** name (case-insensitive) → { locationId, locationDisplay } */
const MOVES: Record<string, { locationId: string; locationDisplay: string }> = {
  Diamond: { locationId: 'bali', locationDisplay: 'Bali' },
  Parrot: { locationId: 'bandung', locationDisplay: 'Bandung' },
  Budiarti: { locationId: 'bandung', locationDisplay: 'Bandung' },
  Hedi: { locationId: 'bandung', locationDisplay: 'Bandung' },
  Salimah: { locationId: 'jakarta', locationDisplay: 'Jakarta' },
  Umi: { locationId: 'bandung', locationDisplay: 'Bandung' },
  Nurbani: { locationId: 'bandung', locationDisplay: 'Bandung' },
  "Nurbani's": { locationId: 'bandung', locationDisplay: 'Bandung' },
  Adi: { locationId: 'jakarta', locationDisplay: 'Jakarta' },
  Yulianti: { locationId: 'bandung', locationDisplay: 'Bandung' },
  Yani: { locationId: 'bandung', locationDisplay: 'Bandung' },
  Nurchajati: { locationId: 'bandung', locationDisplay: 'Bandung' },
};

function normalizeName(name: string): string {
  return (name || '').trim().toLowerCase();
}

function getTargetLocation(doc: any): { locationId: string; locationDisplay: string } | null {
  const name = (doc.name || '').trim();
  const nameNorm = normalizeName(name);
  for (const [key, value] of Object.entries(MOVES)) {
    const keyNorm = normalizeName(key);
    if (nameNorm === keyNorm || nameNorm.startsWith(keyNorm + ' ') || nameNorm.endsWith(' ' + keyNorm) || nameNorm.includes(' ' + keyNorm + ' ')) {
      return value as { locationId: string; locationDisplay: string };
    }
  }
  return null;
}

function currentLocation(doc: any): string {
  return (doc.city || doc.locationId || doc.location || '').toString().trim() || '?';
}

function isAlreadyAtTarget(doc: any, target: { locationId: string }): boolean {
  const loc = (doc.city || doc.locationId || doc.location || '').toString().toLowerCase().trim();
  return loc === target.locationId.toLowerCase();
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('🔍 DRY RUN – no documents will be updated.\n');

  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required. Set it in .env or: APPWRITE_API_KEY=... pnpm tsx scripts/move-therapists-by-name.ts');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  try {
    const seenIds = new Set<string>();
    const toMove: { doc: any; target: { locationId: string; locationDisplay: string } }[] = [];

    for (const [name, target] of Object.entries(MOVES)) {
      try {
        const res = await databases.listDocuments(databaseId, collectionId, [Query.search('name', name), Query.limit(20)]);
        const docs = (res.documents || []) as any[];
        for (const doc of docs) {
          if (seenIds.has(doc.$id)) continue;
          if (!getTargetLocation(doc)) continue;
          if (isAlreadyAtTarget(doc, target)) continue;
          seenIds.add(doc.$id);
          toMove.push({ doc, target });
        }
      } catch (_) {
        // search not available or failed – fallback to full list
      }
    }

    if (toMove.length === 0) {
      const res = await databases.listDocuments(databaseId, collectionId, [Query.limit(1000)]);
      const docs = (res.documents || []) as any[];
      for (const doc of docs) {
        const target = getTargetLocation(doc);
        if (target && !isAlreadyAtTarget(doc, target) && !seenIds.has(doc.$id)) {
          seenIds.add(doc.$id);
          toMove.push({ doc, target });
        }
      }
    }

    console.log('Therapists to move (by name → location):');
    Object.entries(MOVES).forEach(([name, loc]) => console.log(`  ${name} → ${loc.locationDisplay}`));
    console.log('');

    if (toMove.length === 0) {
      console.log('  None – either not found or already at target location.');
      return;
    }

    for (const { doc, target } of toMove) {
      const id = doc.$id;
      console.log(`  Moving: ${doc.name} (${id}) from "${currentLocation(doc)}" → ${target.locationDisplay}`);
      if (!dryRun) {
        await databases.updateDocument(databaseId, collectionId, id, {
          location: target.locationDisplay,
          locationId: target.locationId,
        });
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

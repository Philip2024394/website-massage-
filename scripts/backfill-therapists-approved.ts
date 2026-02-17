#!/usr/bin/env node
/**
 * Backfill therapists collection: set approved = true on documents where it is missing or false.
 *
 * Required because Default = true on the attribute often does NOT apply to existing documents.
 * Query.equal('approved', true) does not match null → those therapists disappear from the list.
 *
 * Run (apply updates):
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/backfill-therapists-approved.ts
 *
 * Dry run (report only, no writes):
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/backfill-therapists-approved.ts --dry-run
 *
 * Requires: .env or env APPWRITE_API_KEY, optional VITE_APPWRITE_*, VITE_THERAPISTS_COLLECTION_ID
 */

import { config } from 'dotenv';
config();

import { Client, Databases, Query } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const collectionId = process.env.VITE_THERAPISTS_COLLECTION_ID || 'therapists_collection_id';
const apiKey = process.env.APPWRITE_API_KEY;

function needsBackfill(doc: any): boolean {
  const v = doc.approved;
  if (v === true) return false;
  if (v === false) return true;
  return true; // null, undefined, missing
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required. Set in .env or: APPWRITE_API_KEY=... pnpm tsx scripts/backfill-therapists-approved.ts');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  console.log('🔧 Backfill therapists: set approved = true where missing/false');
  console.log(`   Mode: ${dryRun ? 'DRY-RUN (no updates)' : 'APPLY (will update)'}\n`);

  try {
    const res = await databases.listDocuments(databaseId, collectionId, [Query.limit(500)]);
    const docs = (res.documents || []) as any[];
    const toUpdate = docs.filter(needsBackfill);
    const alreadyOk = docs.filter((d) => d.approved === true);

    console.log(`📊 Total documents: ${docs.length}`);
    console.log(`   Already approved=true: ${alreadyOk.length}`);
    console.log(`   Need backfill (missing/false): ${toUpdate.length}\n`);

    if (toUpdate.length === 0) {
      console.log('✅ Nothing to backfill.');
      return;
    }

    if (dryRun) {
      console.log('DRY-RUN: Would set approved=true for:');
      toUpdate.slice(0, 10).forEach((d) => console.log(`   - ${d.$id}  ${(d.name || d.id || '').toString().slice(0, 40)}`));
      if (toUpdate.length > 10) console.log(`   ... and ${toUpdate.length - 10} more.`);
      console.log('\nRun without --dry-run to apply.');
      return;
    }

    let updated = 0;
    for (const doc of toUpdate) {
      try {
        await databases.updateDocument(databaseId, collectionId, doc.$id, { approved: true });
        updated++;
        console.log(`   ✓ ${doc.$id}`);
      } catch (e) {
        console.error(`   ✗ ${doc.$id}`, (e as Error).message);
      }
    }
    console.log(`\n✅ Updated ${updated} document(s).`);
  } catch (e) {
    console.error('❌ Error:', (e as Error).message);
    process.exit(1);
  }
}

main();

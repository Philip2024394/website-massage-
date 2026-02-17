#!/usr/bin/env node
/**
 * Query therapists from Appwrite by location and status (real-time API).
 * Use for: "how many therapists in [location]?" or "show therapists in [location]".
 *
 * Run:
 *   APPWRITE_API_KEY=your_key pnpm tsx scripts/query-therapists-appwrite.ts [location] [count|list]
 * Example:
 *   pnpm tsx scripts/query-therapists-appwrite.ts Yogyakarta count
 *   pnpm tsx scripts/query-therapists-appwrite.ts Jakarta list
 *
 * Requires .env or env: APPWRITE_API_KEY, (optional) VITE_APPWRITE_*, VITE_THERAPISTS_COLLECTION_ID
 */

import { config } from 'dotenv';
config(); // load .env

import { Client, Databases, Query } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const databaseId = process.env.COIN_SHOP_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const collectionId = process.env.VITE_THERAPISTS_COLLECTION_ID || 'therapists_collection_id';
const apiKey = process.env.APPWRITE_API_KEY;

async function queryTherapists(location: string, mode: 'count' | 'list'): Promise<void> {
  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required. Set it in .env or: APPWRITE_API_KEY=... pnpm tsx scripts/query-therapists-appwrite.ts ...');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  // Match location; status "active" per instructions (DB may store "available" – try both for real data)
  const locationNorm = location.trim();

  async function runQuery(attr: 'location' | 'city', statusVal: string): Promise<{ total: number; documents: any[] }> {
    const q = [
      Query.limit(500),
      Query.equal(attr, locationNorm),
    ];
    if (statusVal) q.push(Query.equal('status', statusVal));
    const res = await databases.listDocuments(databaseId, collectionId, q);
    return { total: res.total, documents: (res.documents || []) as any[] };
  }

  try {
    // Try location + active, then location + available, then city + available
    let total = 0;
    let documents: any[] = [];
    for (const statusVal of ['active', 'available', '']) {
      try {
        const r = await runQuery('location', statusVal);
        if (r.total > 0 || statusVal === '') {
          total = r.total;
          documents = r.documents;
          break;
        }
      } catch {
        continue;
      }
    }
    if (total === 0 && documents.length === 0) {
      try {
        const r = await runQuery('city', 'available');
        total = r.total;
        documents = r.documents;
      } catch {
        // ignore
      }
    }

    if (mode === 'count') {
      console.log(JSON.stringify({ location: locationNorm, count: total }));
      return;
    }
    const names = documents.map((d) => d.name || d.$id || '—').filter(Boolean);
    console.log(JSON.stringify({ location: locationNorm, count: total, names }));
  } catch (e: any) {
    console.error('❌ Query failed:', e?.message || e);
    process.exit(1);
  }
}

const location = process.argv[2] || 'Yogyakarta';
const mode = (process.argv[3] || 'count').toLowerCase() === 'list' ? 'list' : 'count';
queryTherapists(location, mode);

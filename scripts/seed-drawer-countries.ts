#!/usr/bin/env node
/**
 * Seeds the Appwrite countries collection with the 10 drawer countries so the
 * side drawer can show them from Appwrite and each opens the correct country social page.
 *
 * Uses the same database and collection id as the app (see src/lib/appwrite.config.ts).
 * Run: APPWRITE_API_KEY=your_key npx ts-node scripts/seed-drawer-countries.ts
 */

import { config } from 'dotenv';
config();

import { Client, Databases, Query, ID } from 'node-appwrite';

const APPWRITE_CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05',
  collectionId: '699a58950004864d1bf2', // Must match APPWRITE_CONFIG.collections.countries in app
  apiKey: process.env.APPWRITE_API_KEY,
};

const DRAWER_COUNTRIES = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
];

async function main() {
  if (!APPWRITE_CONFIG.apiKey) {
    console.error('❌ APPWRITE_API_KEY environment variable is required');
    console.log('\nRun: APPWRITE_API_KEY=your_key npx ts-node scripts/seed-drawer-countries.ts');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey);

  const databases = new Databases(client);

  console.log('🌍 Seeding drawer countries into Appwrite...\n');

  try {
    const existing = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collectionId,
      [Query.equal('active', true), Query.limit(50)]
    );
    const existingCodes = new Set((existing.documents || []).map((d: any) => (d.code || '').trim().toUpperCase()));

    let created = 0;
    let skipped = 0;

    for (const country of DRAWER_COUNTRIES) {
      const codeUpper = country.code.trim().toUpperCase();
      if (existingCodes.has(codeUpper)) {
        console.log(`   ⏭️  ${country.code} ${country.name} – already exists`);
        skipped++;
        continue;
      }

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        ID.unique(),
        {
          code: country.code,
          name: country.name,
          flag: country.flag,
          active: true,
        }
      );
      console.log(`   ✅ ${country.code} ${country.name} – created`);
      created++;
      existingCodes.add(codeUpper);
    }

    console.log(`\n✅ Done. Created: ${created}, skipped (already exist): ${skipped}.`);
    console.log('   Side drawer will show these from Appwrite; each opens the country social page.');
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('404') || error?.code === 404) {
      console.error('❌ Countries collection not found. Ensure the collection exists and its id is 699a58950004864d1bf2 in app config.');
      console.log('   Create it via: APPWRITE_API_KEY=... npx ts-node scripts/setup-countries-collection.ts');
      console.log('   Then set the collection id in src/lib/appwrite.config.ts to the new collection $id, or use this script with that id.');
    } else {
      console.error('❌ Error:', msg);
    }
    process.exit(1);
  }
}

main();

/**
 * MIGRATION: Ensure all live therapists have menu coverage
 *
 * Goal: No therapist profile may appear without a menu.
 * - Therapists with therapist_menus doc → use their real menu
 * - Therapists with profile price60/90/120 → use profile prices (sample menu fills services)
 * - Therapists with neither → display uses sample menu (computed on-the-fly)
 *
 * This script:
 * 1. Fetches all live therapists (isLive=true)
 * 2. For each, checks therapist_menus and profile prices
 * 3. Reports status
 * 4. Optional (--apply): Sets default profile prices (150/200/250) for those with
 *    neither menu nor profile prices, so cards show a "from" price
 *
 * Run: pnpm tsx scripts/migrate-live-therapist-menus.ts
 * Apply: pnpm tsx scripts/migrate-live-therapist-menus.ts --apply
 *
 * Note: Requires Appwrite API key for updates. Set VITE_APPWRITE_API_KEY or run
 * from Appwrite Function / backend with service credentials.
 */

import { Client, Databases, Query, ID } from 'appwrite';

const client = new Client();
const databases = new Databases(client);

const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';
const THERAPIST_MENUS_COLLECTION = 'therapist_menus';
const ENDPOINT = 'https://syd.cloud.appwrite.io/v1';

client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);

const DEFAULT_PRICE60 = '150';
const DEFAULT_PRICE90 = '200';
const DEFAULT_PRICE120 = '250';

function hasProfilePrices(t: any): boolean {
  const p60 = t.price60 != null && t.price60 !== '' && Number(t.price60) > 0;
  const p90 = t.price90 != null && t.price90 !== '' && Number(t.price90) > 0;
  const p120 = t.price120 != null && t.price120 !== '' && Number(t.price120) > 0;
  return p60 || p90 || p120;
}

async function main() {
  const apply = process.argv.includes('--apply');
  console.log('🚀 Live Therapist Menu Migration');
  console.log(`   Mode: ${apply ? 'APPLY (will update)' : 'DRY-RUN (report only)'}\n`);

  try {
    // Fetch all therapists
    const therapistsResp = await databases.listDocuments(
      DATABASE_ID,
      THERAPISTS_COLLECTION,
      [Query.limit(500)]
    );
    const all = therapistsResp.documents;
    const live = all.filter((t: any) => t.isLive === true && !t.isDeleted);

    console.log(`📊 Total therapists: ${all.length}`);
    console.log(`📊 Live therapists (isLive=true): ${live.length}\n`);

    let withMenu = 0;
    let withProfilePrices = 0;
    let withNeither: any[] = [];

    for (const t of live) {
      const therapistId = t.$id;
      let hasMenu = false;

      try {
        const menuResp = await databases.listDocuments(
          DATABASE_ID,
          THERAPIST_MENUS_COLLECTION,
          [Query.equal('therapistId', therapistId), Query.limit(1)]
        );
        const menuDoc = menuResp.documents[0];
        if (menuDoc?.menuData) {
          try {
            const parsed = JSON.parse(menuDoc.menuData);
            const items = Array.isArray(parsed) ? parsed : [];
            const validItems = items.filter(
              (s: any) => s && (s.serviceName || s.name) && (s.price60 || s.price90 || s.price120)
            );
            hasMenu = validItems.length > 0;
          } catch {
            hasMenu = false;
          }
        }
      } catch {
        hasMenu = false;
      }

      const hasPrices = hasProfilePrices(t);

      if (hasMenu) withMenu++;
      if (hasPrices) withProfilePrices++;
      if (!hasMenu && !hasPrices) {
        withNeither.push({ id: therapistId, name: t.name || 'Unnamed' });
      }
    }

    console.log('📋 Results:');
    console.log(`   ✅ With therapist_menus (valid items): ${withMenu}`);
    console.log(`   ✅ With profile prices (price60/90/120): ${withProfilePrices}`);
    console.log(`   ⚠️  With neither (will use sample menu on display): ${withNeither.length}`);

    if (withNeither.length > 0) {
      console.log('\n   Therapists with neither menu nor profile prices:');
      withNeither.forEach((t) => console.log(`      - ${t.name} (${t.id})`));

      if (apply && withNeither.length > 0) {
        console.log('\n🔄 Applying default profile prices (150/200/250) to therapists with neither...');
        for (const t of withNeither) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              THERAPISTS_COLLECTION,
              t.id,
              {
                price60: DEFAULT_PRICE60,
                price90: DEFAULT_PRICE90,
                price120: DEFAULT_PRICE120
              }
            );
            console.log(`   ✅ Updated ${t.name} (${t.id})`);
          } catch (e) {
            console.error(`   ❌ Failed ${t.name} (${t.id}):`, e);
          }
        }
        console.log('\n✅ Migration complete.');
      } else if (!apply && withNeither.length > 0) {
        console.log('\n💡 Run with --apply to set default profile prices for these therapists.');
      }
    } else {
      console.log('\n✅ All live therapists have menu coverage (menu or profile prices).');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

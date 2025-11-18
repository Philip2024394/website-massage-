/*
 Verifies existence of core Appwrite collections and writes a status report.

 Usage (PowerShell):
 $env:APPWRITE_ENDPOINT="https://syd.cloud.appwrite.io/v1"
 $env:APPWRITE_PROJECT_ID="68f23b11000d25eb3664"
 $env:APPWRITE_DATABASE_ID="68f76ee1000e64ca8d05"
 $env:APPWRITE_API_KEY="<api_key_with_databases.*>"
 node scripts/verify-core-collections.js
*/

const fs = require('fs');
const path = require('path');
const { Client, Databases } = require('node-appwrite');

(async () => {
  const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
  const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
  const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
  const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

  if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY is required. Set it in env variables.');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  const collectionsToCheck = [
    // Core actors
    'admins_collection_id',
    'therapists_collection_id',
    'places_collection_id',
    'users_collection_id',
    'agents_collection_id',
    'hotels_collection_id',

    // Bookings and reviews
    'bookings_collection_id',
    'hotel_bookings',
    'reviews_collection_id',
    'notifications_collection_id',

    // Catalog / pricing / content
    'massage_types_collection_id',
    'membership_pricing_collection_id',
    'image_assets',
    'login_backgrounds',
    'custom_links_collection_id',
    'translations_collection_id',

    // Finance / commissions / analytics / attributes
    'commission_records',
    'analytics_events',
    'attributes',

    // Jobs
    'therapist_job_listings',
    'employer_job_postings',

    // Affiliate + agents extras
    'affiliate_clicks',
    'affiliate_attributions',
    'agent_visits_collection_id',
    'monthly_agent_metrics_collection_id',
  ];

  const results = {
    projectId: APPWRITE_PROJECT_ID,
    databaseId: APPWRITE_DATABASE_ID,
    endpoint: APPWRITE_ENDPOINT,
    generatedAt: new Date().toISOString(),
    collections: [],
  };

  console.log('🔎 Verifying core collections...');
  for (const id of collectionsToCheck) {
    let status = { id, exists: false };
    try {
      const col = await databases.getCollection(APPWRITE_DATABASE_ID, id);
      status.exists = true;
      status.name = col.name;
      status.documentSecurity = col.documentSecurity;
      status.enabled = col.enabled;
      status.$id = col.$id;
      status.$createdAt = col.$createdAt;
      status.$updatedAt = col.$updatedAt;
      console.log(` ✅ ${id} → ${col.name}`);
    } catch (err) {
      const msg = (err && err.message) || String(err);
      status.error = msg;
      console.log(` ⚠️  ${id} → not found (${msg})`);
    }
    results.collections.push(status);
  }

  const outDir = path.resolve(__dirname, '..', 'reports');
  const outFile = path.join(outDir, 'appwrite-collections.json');
  try {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n📝 Report written to: ${outFile}`);
  } catch (e) {
    console.error('❌ Failed to write report:', e);
    process.exit(1);
  }
})();

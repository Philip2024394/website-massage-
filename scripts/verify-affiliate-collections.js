/**
 * Verify Affiliate Collections
 * Lists collection existence and basic attributes for:
 *  - affiliate_clicks
 *  - affiliate_attributions
 * Run: node scripts/verify-affiliate-collections.js
 */

import { Client, Databases } from 'node-appwrite';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const CLICKS_ID = 'affiliate_clicks';
const ATTRS_ID = 'affiliate_attributions';

async function getAttributes(databases, collectionId) {
  try {
    const col = await databases.getCollection(APPWRITE_DATABASE_ID, collectionId);
    // Appwrite SDK doesn't return attributes directly; try listing a dummy index call to assert existence
    return { id: col.$id, name: col.name, enabled: col.enabled, documentSecurity: col.documentSecurity };
  } catch (e) {
    return { error: e.message || String(e) };
  }
}

async function main() {
  if (!APPWRITE_API_KEY) {
    console.error('❌ Missing APPWRITE_API_KEY env. Set it and re-run.');
    process.exit(1);
  }

  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY);
  const databases = new Databases(client);

  console.log('🔎 Verifying collections in database:', APPWRITE_DATABASE_ID);

  const clicks = await getAttributes(databases, CLICKS_ID);
  const atts = await getAttributes(databases, ATTRS_ID);

  console.log('\n— affiliate_clicks —');
  console.log(clicks);

  console.log('\n— affiliate_attributions —');
  console.log(atts);

  if (clicks.error || atts.error) {
    process.exitCode = 1;
  } else {
    console.log('\n✅ Verification complete');
  }
}

main();

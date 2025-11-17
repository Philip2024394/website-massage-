/**
 * Appwrite Affiliate Collections Setup Script
 *
 * Creates two collections:
 *  - affiliate_clicks
 *  - affiliate_attributions
 *
 * Run with:
 *   node scripts/setup-affiliate-collections.js
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

// Appwrite Configuration (override with env if needed)
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const APPWRITE_DATABASE_ID = process.env.COIN_SHOP_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_API_KEY_HERE';

// Collection IDs
const CLICKS_ID = 'affiliate_clicks';
const ATTRS_ID = 'affiliate_attributions';

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function ensureCollection(collectionId, name, permissions) {
  try {
    const col = await databases.getCollection(APPWRITE_DATABASE_ID, collectionId);
    console.log(`ℹ️  Collection exists: ${collectionId}`);
    return col;
  } catch (e) {
    if (e.code !== 404) throw e;
    console.log(`📦 Creating collection: ${collectionId}`);
    const col = await databases.createCollection(
      APPWRITE_DATABASE_ID,
      collectionId,
      name,
      permissions,
      true,  // documentSecurity
      true   // enabled
    );
    console.log(`✅ Created: ${collectionId}`);
    return col;
  }
}

async function ensureStringAttribute(collectionId, key, size, required = false, array = false) {
  try {
    await databases.createStringAttribute(APPWRITE_DATABASE_ID, collectionId, key, size, required, null, array);
    console.log(`  ✅ Attribute(string) ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  Attribute ${key} exists`);
    else throw e;
  }
}

async function ensureFloatAttribute(collectionId, key, required = false, array = false) {
  try {
    await databases.createFloatAttribute(APPWRITE_DATABASE_ID, collectionId, key, required, null, null, null, array);
    console.log(`  ✅ Attribute(float) ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  Attribute ${key} exists`);
    else throw e;
  }
}

async function ensureDatetimeAttribute(collectionId, key, required = false, array = false) {
  try {
    await databases.createDatetimeAttribute(APPWRITE_DATABASE_ID, collectionId, key, required, null, array);
    console.log(`  ✅ Attribute(datetime) ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  Attribute ${key} exists`);
    else throw e;
  }
}

async function ensureEnumAttribute(collectionId, key, elements, required = false, array = false) {
  try {
    await databases.createEnumAttribute(APPWRITE_DATABASE_ID, collectionId, key, elements, required, null, array);
    console.log(`  ✅ Attribute(enum) ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  Attribute ${key} exists`);
    else throw e;
  }
}

async function ensureIndex(collectionId, key, type, attributes, orders) {
  try {
    await databases.createIndex(APPWRITE_DATABASE_ID, collectionId, key, type, attributes, orders);
    console.log(`  🔍 Index ${key} created`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  Index ${key} exists`);
    else throw e;
  }
}

async function setupClicks() {
  console.log(`\n🚀 Setting up ${CLICKS_ID}`);
  await ensureCollection(CLICKS_ID, 'Affiliate Clicks', [
    Permission.create(Role.any()),
    Permission.read(Role.any()),
  ]);

  await ensureStringAttribute(CLICKS_ID, 'affiliateCode', 64, true);
  await ensureStringAttribute(CLICKS_ID, 'path', 512, true);
  await ensureStringAttribute(CLICKS_ID, 'referrer', 512, false);
  await ensureStringAttribute(CLICKS_ID, 'userAgent', 500, false);
  await ensureDatetimeAttribute(CLICKS_ID, 'createdAt', true);

  console.log('  ⏳ Waiting a moment before creating indexes...');
  await new Promise(r => setTimeout(r, 5000));

  await ensureIndex(CLICKS_ID, 'idx_code_time', 'key', ['affiliateCode', 'createdAt'], ['ASC', 'DESC']);
  await ensureIndex(CLICKS_ID, 'idx_createdAt', 'key', ['createdAt'], ['DESC']);
}

async function setupAttributions() {
  console.log(`\n🚀 Setting up ${ATTRS_ID}`);
  await ensureCollection(ATTRS_ID, 'Affiliate Attributions', [
    Permission.create(Role.any()),
    Permission.read(Role.any()),
    Permission.update(Role.any()),
  ]);

  await ensureStringAttribute(ATTRS_ID, 'bookingId', 100, true);
  await ensureStringAttribute(ATTRS_ID, 'providerId', 100, true);
  await ensureStringAttribute(ATTRS_ID, 'providerName', 255, false);
  await ensureEnumAttribute(ATTRS_ID, 'providerType', ['therapist', 'place'], true);
  await ensureStringAttribute(ATTRS_ID, 'affiliateCode', 64, true);
  await ensureFloatAttribute(ATTRS_ID, 'commissionRate', true);
  await ensureFloatAttribute(ATTRS_ID, 'commissionAmount', true);
  await ensureEnumAttribute(ATTRS_ID, 'commissionStatus', ['pending', 'approved', 'paid'], true);
  await ensureStringAttribute(ATTRS_ID, 'source', 64, false);
  await ensureStringAttribute(ATTRS_ID, 'venueId', 100, false);
  await ensureStringAttribute(ATTRS_ID, 'venueName', 255, false);
  await ensureStringAttribute(ATTRS_ID, 'venueType', 20, false);
  await ensureDatetimeAttribute(ATTRS_ID, 'createdAt', true);

  console.log('  ⏳ Waiting a moment before creating indexes...');
  await new Promise(r => setTimeout(r, 5000));

  await ensureIndex(ATTRS_ID, 'idx_code_time', 'key', ['affiliateCode', 'createdAt'], ['ASC', 'DESC']);
  await ensureIndex(ATTRS_ID, 'idx_provider_status', 'key', ['providerId', 'commissionStatus', 'createdAt'], ['ASC', 'ASC', 'DESC']);
  await ensureIndex(ATTRS_ID, 'idx_status_time', 'key', ['commissionStatus', 'createdAt'], ['ASC', 'DESC']);
}

async function main() {
  console.log('\n🏁 Appwrite Affiliate Collections Setup');
  console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`Project:  ${APPWRITE_PROJECT_ID}`);
  console.log(`Database: ${APPWRITE_DATABASE_ID}`);

  if (!APPWRITE_API_KEY || APPWRITE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('\n❌ Missing APPWRITE_API_KEY. Set it in your environment.');
    console.error('   PowerShell:  $env:APPWRITE_API_KEY = "<your-key>"');
    process.exit(1);
  }

  try {
    await setupClicks();
    await setupAttributions();
    console.log('\n✅ Affiliate collections ready!');
  } catch (e) {
    console.error('\n❌ Setup failed:', e?.message || e);
    process.exit(1);
  }
}

main();

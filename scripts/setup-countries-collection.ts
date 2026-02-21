#!/usr/bin/env node

import { config } from 'dotenv';
config(); // load .env so APPWRITE_API_KEY is available

/**
 * Countries Collection Setup for Appwrite
 *
 * Creates the countries collection and attributes for:
 * - Admin dashboard Country Management
 * - Main app side drawer "IndaStreet Countries" with linked websites
 *
 * REQUIRED ATTRIBUTES (must match src/config/appwriteSchema.ts COUNTRIES):
 * - code (string, 10, required)
 * - name (string, 255, required)
 * - flag (string, 20, required)
 * - description (string, 500, optional)
 * - language (string, 20, optional)
 * - languages (string, 2000, optional) – JSON array of language codes
 * - active (boolean, optional, default true)
 * - dialCode (string, 10, optional)
 * - currency (string, 10, optional)
 * - timezone (string, 100, optional)
 * - cities (string, 10000, optional) – JSON array of city objects
 * - totalTherapists (integer, optional)
 * - totalBookings (integer, optional)
 * - linkedWebsite (string, 500, optional) – URL for country's linked website
 *
 * Run: APPWRITE_API_KEY=your_key npx ts-node scripts/setup-countries-collection.ts
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const APPWRITE_CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05',
  apiKey: process.env.APPWRITE_API_KEY,
};

const COLLECTION_ID = 'countries';

async function main() {
  if (!APPWRITE_CONFIG.apiKey) {
    console.error('❌ APPWRITE_API_KEY environment variable is required');
    console.log('\nGet your API key from:');
    console.log(`https://cloud.appwrite.io/console/project-${APPWRITE_CONFIG.projectId}/overview/keys`);
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey);

  const databases = new Databases(client);

  console.log('🌍 Setting up Countries collection...\n');

  try {
    const collection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      COLLECTION_ID,
      'Countries',
      [
        Permission.read(Role.any()),
        Permission.create(Role.team('admin')),
        Permission.update(Role.team('admin')),
        Permission.delete(Role.team('admin')),
      ]
    );
    console.log('✅ Collection', COLLECTION_ID, 'created');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'code', 10, true);
    console.log('   code (string, 10, required)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'name', 255, true);
    console.log('   name (string, 255, required)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'flag', 20, true);
    console.log('   flag (string, 20, required)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'description', 500, false);
    console.log('   description (string, 500, optional)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'language', 20, false);
    console.log('   language (string, 20, optional)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'languages', 2000, false);
    console.log('   languages (string, 2000, optional – JSON array)');

    await databases.createBooleanAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'active', false, true);
    console.log('   active (boolean, optional, default true)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'dialCode', 10, false);
    console.log('   dialCode (string, 10, optional)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'currency', 10, false);
    console.log('   currency (string, 10, optional)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'timezone', 100, false);
    console.log('   timezone (string, 100, optional)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'cities', 10000, false);
    console.log('   cities (string, 10000, optional – JSON array)');

    await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'totalTherapists', false);
    console.log('   totalTherapists (integer, optional)');

    await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'totalBookings', false);
    console.log('   totalBookings (integer, optional)');

    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, collection.$id, 'linkedWebsite', 500, false);
    console.log('   linkedWebsite (string, 500, optional – country linked website URL)');

    console.log('\n✅ Countries collection and attributes created successfully.');
    console.log('   - Main app drawer can list countries and open linkedWebsite when set.');
    console.log('   - Admin Country Management can CRUD countries and set linked websites.');
  } catch (error: any) {
    if (error?.code === 409 || error?.message?.includes('already exists')) {
      console.log('⚠️ Collection', COLLECTION_ID, 'already exists. Skipping creation.');
      console.log('   To add missing attributes, create them manually in Appwrite Console.');
      process.exit(0);
    }
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

main();

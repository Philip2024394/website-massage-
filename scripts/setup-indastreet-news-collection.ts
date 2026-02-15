#!/usr/bin/env node

/**
 * Indastreet News Collection Setup for Appwrite
 *
 * Creates the indastreet_news collection and attributes so the Indastreet News page
 * can display items from Appwrite. If the collection already exists, this script
 * will fail (run once).
 *
 * REQUIRED ATTRIBUTES (must match src/config/appwriteSchema.ts INDASTREET_NEWS):
 * - headline (string, 500, required)
 * - excerpt (string, 2000, required)
 * - date (string, 50, required)
 * - category (enum, required): techniques | producers | places-opening | places-closing | good-news | negative | headlines
 * - imageSrc (string, 1000, optional)
 * - published (boolean, optional, default true)
 * - order (integer, optional)
 *
 * Run: APPWRITE_API_KEY=your_key npx ts-node scripts/setup-indastreet-news-collection.ts
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const APPWRITE_CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05',
  apiKey: process.env.APPWRITE_API_KEY,
};

const COLLECTION_ID = 'indastreet_news';

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

  console.log('📰 Setting up Indastreet News collection...\n');

  try {
    const collection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      COLLECTION_ID,
      'Indastreet News',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ Collection', COLLECTION_ID, 'created');

    await databases.createStringAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'headline',
      500,
      true
    );
    console.log('   headline (string, 500, required)');

    await databases.createStringAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'excerpt',
      2000,
      true
    );
    console.log('   excerpt (string, 2000, required)');

    await databases.createStringAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'date',
      50,
      true
    );
    console.log('   date (string, 50, required)');

    await databases.createEnumAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'category',
      ['techniques', 'producers', 'places-opening', 'places-closing', 'good-news', 'negative', 'headlines'],
      true
    );
    console.log('   category (enum, required)');

    await databases.createStringAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'imageSrc',
      1000,
      false
    );
    console.log('   imageSrc (string, 1000, optional)');

    await databases.createBooleanAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'published',
      false,
      true
    );
    console.log('   published (boolean, optional, default true)');

    await databases.createIntegerAttribute(
      APPWRITE_CONFIG.databaseId,
      collection.$id,
      'order',
      false
    );
    console.log('   order (integer, optional)');

    // Seed a few sample documents so the page displays real data
    console.log('\n📝 Seeding sample news documents...');
    const samples = [
      {
        headline: 'New lymphatic drainage technique gains traction in spas across Asia',
        excerpt: 'Therapy centres and skin clinics are adopting updated lymphatic drainage protocols. Experts say the technique supports recovery and wellness demand.',
        date: 'Nov 10, 2025',
        category: 'techniques',
        published: true,
      },
      {
        headline: 'Wellness chain opens three new massage and facial locations',
        excerpt: 'A major operator has announced the opening of three new sites, creating jobs for therapists and skin clinic staff in the region.',
        date: 'Nov 8, 2025',
        category: 'places-opening',
        published: true,
      },
      {
        headline: 'Indastreet News is now live',
        excerpt: 'The latest massage and skin clinic news — techniques, producers, places opening and closing, and industry headlines.',
        date: new Date().toISOString().slice(0, 10),
        category: 'headlines',
        published: true,
      },
    ];

    for (const doc of samples) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        collection.$id,
        ID.unique(),
        doc
      );
    }
    console.log('✅ Seeded', samples.length, 'sample documents');

    console.log('\n✅ Indastreet News collection is ready. The Indastreet News page will now display items from Appwrite.');
  } catch (err: any) {
    if (err?.code === 409 || err?.message?.includes('already exists')) {
      console.log('ℹ️ Collection', COLLECTION_ID, 'already exists. No changes made.');
      process.exit(0);
    }
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  }
}

main();

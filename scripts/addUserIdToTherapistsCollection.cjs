#!/usr/bin/env node
/**
 * Migration Script: Add userId attribute to therapists collection
 *
 * Requirements:
 *  - APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
 *  - APPWRITE_PROJECT=<projectId>
 *  - APPWRITE_API_KEY=<API key with collections.write permission>
 *  - THERAPISTS_COLLECTION_ID=therapists_collection_id (override if different)
 *  - DATABASE_ID=68f76ee1000e64ca8d05 (override via env if changed)
 *
 * Usage:
 *  node scripts/addUserIdToTherapistsCollection.cjs
 *
 * After success set VITE_INCLUDE_USER_ID=1 in your .env (or cross-env) to start writing userId in signup.
 */
const { Client, Databases } = require('node-appwrite');

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const project = process.env.APPWRITE_PROJECT || '68f23b11000d25eb3664';
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.DATABASE_ID || '68f76ee1000e64ca8d05';
const therapistsCollectionId = process.env.THERAPISTS_COLLECTION_ID || 'therapists_collection_id';

if (!apiKey) {
  console.error('❌ Missing APPWRITE_API_KEY environment variable');
  process.exit(1);
}

(async () => {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey);

  const databases = new Databases(client);

  console.log('🔧 Starting migration: add userId attribute');
  console.log('📦 Database:', databaseId);
  console.log('🗂️ Collection:', therapistsCollectionId);

  try {
    // Try to create string attribute 'userId'. If it already exists, catch and continue.
    const attrOptions = {
      key: 'userId',
      type: 'string',
      size: 64,
      required: false,
      default: ''
    };

    console.log('🛠️ Creating attribute:', attrOptions);
    const result = await databases.createStringAttribute(databaseId, therapistsCollectionId, attrOptions.key, attrOptions.size, attrOptions.required, attrOptions.default);
    console.log('✅ Attribute creation requested. Status (may be pending):', result);
  } catch (err) {
    if (err && err.message && err.message.includes('already exists')) {
      console.log('ℹ️ Attribute userId already exists, continuing.');
    } else {
      console.error('❌ Failed to create userId attribute:', err.message || err);
      process.exit(1);
    }
  }

  // Poll attribute readiness (optional)
  let attempts = 0;
  const maxAttempts = 10;
  const delay = ms => new Promise(r => setTimeout(r, ms));

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const collection = await databases.getCollection(databaseId, therapistsCollectionId);
      const userIdAttr = (collection.attributes || []).find(a => a.key === 'userId');
      if (userIdAttr) {
        console.log('🔍 Attribute state:', userIdAttr);
        if (userIdAttr.status === 'available') {
          console.log('🎉 userId attribute is available. Migration complete.');
          console.log('👉 Set VITE_INCLUDE_USER_ID=1 to start using it in signup.');
          process.exit(0);
        }
      } else {
        console.log('⌛ userId attribute not listed yet (attempt', attempts, ')');
      }
    } catch (pollErr) {
      console.warn('⚠️ Poll attempt failed:', pollErr.message || pollErr);
    }
    await delay(1500);
  }
  console.log('⚠️ Finished polling without confirmed availability. It may still become available shortly.');
  process.exit(0);
})();

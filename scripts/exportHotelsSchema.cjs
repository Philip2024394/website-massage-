#!/usr/bin/env node
// Exports HOTELS collection schema from Appwrite into schema/hotels.json
// Requires env: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, DATABASE_ID, HOTELS_COLLECTION_ID

import fs from 'fs';
import path from 'path';
import { Client, Databases } from 'node-appwrite';

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  DATABASE_ID,
  HOTELS_COLLECTION_ID
} = process.env;

function ensure(value, name) {
  if (!value) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
  return value;
}

ensure(APPWRITE_ENDPOINT, 'APPWRITE_ENDPOINT');
ensure(APPWRITE_PROJECT_ID, 'APPWRITE_PROJECT_ID');
ensure(APPWRITE_API_KEY, 'APPWRITE_API_KEY');
ensure(DATABASE_ID, 'DATABASE_ID');
ensure(HOTELS_COLLECTION_ID, 'HOTELS_COLLECTION_ID');

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
  try {
    const collection = await databases.getCollection(DATABASE_ID, HOTELS_COLLECTION_ID);
    const outPath = path.join(process.cwd(), 'schema', 'hotels.json');
    const payload = {
      collectionId: collection.$id,
      name: collection.name,
      attributes: collection.attributes || [],
      indexes: collection.indexes || [],
      exportedAt: new Date().toISOString()
    };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`✅ Exported HOTELS schema to ${outPath}`);
  } catch (err) {
    console.error('❌ Failed to export HOTELS schema:', err.message || err);
    process.exit(1);
  }
}

run();
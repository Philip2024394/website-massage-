// Script: checkPlaceSchema.ts
// Purpose: Fetch Appwrite place collection schema and list attributes to verify currency field absence.
// Usage:
//   Set environment variables before running:
//     APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY, APPWRITE_DATABASE_ID, APPWRITE_PLACES_COLLECTION_ID
//   Then run:
//     npx ts-node scripts/checkPlaceSchema.ts
//   Or if using tsx:
//     npx tsx scripts/checkPlaceSchema.ts

import { Client, Databases } from 'appwrite';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  try {
    const endpoint = requireEnv('APPWRITE_ENDPOINT');
    const project = requireEnv('APPWRITE_PROJECT');
    const apiKey = requireEnv('APPWRITE_API_KEY');
    const databaseId = requireEnv('APPWRITE_DATABASE_ID');
    const placesCollectionId = requireEnv('APPWRITE_PLACES_COLLECTION_ID');

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(apiKey);

    const databases = new Databases(client);

    console.log('🔍 Fetching collection schema for places...');
    const collection = await databases.getCollection(databaseId, placesCollectionId);

    const attributes: any[] = (collection as any).attributes || [];
    console.log(`✅ Attributes (${attributes.length}):`);
    for (const attr of attributes) {
      console.log(` - ${attr.key} (${attr.type})${attr.required ? ' [required]' : ''}`);
    }

    const hasCurrency = attributes.some(a => a.key === 'currency' || a.key === 'currencyCode');
    if (hasCurrency) {
      console.warn('⚠️ Currency-related attribute exists. Ensure sign-up payload matches its exact key.');
    } else {
      console.log('✅ No currency or currencyCode attribute. Payload MUST NOT include these fields.');
    }

    console.log('\nℹ️ If sign-up still fails, recheck error message and confirm collection ID values are correct.');
  } catch (err: any) {
    console.error('❌ Schema check failed:', err.message);
    process.exit(1);
  }
}

main();

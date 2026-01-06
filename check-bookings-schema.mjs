#!/usr/bin/env node

/**
 * Check Bookings Collection Schema
 * This script lists all attributes in the bookings collection
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

// Try both collection IDs
const collections = [
  { name: 'bookings', id: 'bookings' },
  { name: 'bookings_collection_id', id: 'bookings_collection_id' }
];

async function checkSchema() {
  console.log('🔍 Checking bookings collection schemas...\n');

  for (const col of collections) {
    try {
      console.log(`\n📋 Checking collection: ${col.name} (ID: ${col.id})`);
      console.log('─'.repeat(60));

      const collection = await databases.getCollection(databaseId, col.id);

      console.log(`✅ Collection exists!`);
      console.log(`   Name: ${collection.name}`);
      console.log(`   Total Attributes: ${collection.attributes?.length || 0}`);

      if (collection.attributes && collection.attributes.length > 0) {
        console.log('\n📝 Attributes:');
        collection.attributes.forEach((attr) => {
          const required = attr.required ? '✓ REQUIRED' : '  optional';
          const type = attr.type || attr.format || 'unknown';
          const size = attr.size ? ` (size: ${attr.size})` : '';
          console.log(`   [${required}] ${attr.key} → ${type}${size}`);
        });

        // Check for userId specifically
        const hasUserId = collection.attributes.some(attr => attr.key === 'userId');
        if (hasUserId) {
          console.log('\n✅ userId attribute EXISTS in this collection');
        } else {
          console.log('\n❌ userId attribute MISSING in this collection');
          console.log('   → This is why bookings are failing!');
        }
      }
    } catch (error) {
      console.log(`❌ Collection not found: ${col.id}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('💡 Recommendation:');
  console.log('   If userId is missing, you need to add it to the collection.');
  console.log('   Run this in Appwrite Console:');
  console.log('   1. Go to Databases → Collections → bookings_collection_id');
  console.log('   2. Click "Add Attribute" → String');
  console.log('   3. Key: userId');
  console.log('   4. Size: 100');
  console.log('   5. Required: Yes');
  console.log('═'.repeat(60));
}

checkSchema().catch(console.error);

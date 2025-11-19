/**
 * Check what collections exist in your Appwrite database
 * Run with: node check-collections.cjs
 */

const { Client, Databases } = require('node-appwrite');

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function checkCollections() {
  try {
    console.log('Fetching all collections from database...\n');
    const response = await databases.listCollections(databaseId);
    
    console.log(`Found ${response.total} collections:\n`);
    console.log('ID'.padEnd(30) + 'Name');
    console.log('='.repeat(60));
    
    response.collections.forEach(col => {
      console.log(col.$id.padEnd(30) + col.name);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\nLooking for marketplace collections...\n');
    
    const marketplaceCollections = response.collections.filter(col => 
      col.name.toLowerCase().includes('marketplace') || 
      col.name.toLowerCase().includes('seller') ||
      col.name.toLowerCase().includes('product')
    );
    
    if (marketplaceCollections.length > 0) {
      console.log('Found potential marketplace collections:');
      marketplaceCollections.forEach(col => {
        console.log(`  - ${col.name} (ID: ${col.$id})`);
      });
      console.log('\n✓ Update these IDs in lib/appwrite.config.ts:');
      console.log('  marketplaceSellers: \'...\',');
      console.log('  marketplaceProducts: \'...\',');
    } else {
      console.log('✗ No marketplace collections found.');
      console.log('\nYou need to create them in Appwrite Console:');
      console.log('https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05');
      console.log('\nCreate these collections:');
      console.log('  1. Collection ID: marketplace_sellers');
      console.log('  2. Collection ID: marketplace_products');
      console.log('  3. Collection ID: admin_notifications');
    }
    
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    console.log('\nMake sure you have the correct permissions or use an API key.');
  }
}

checkCollections();

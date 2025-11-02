/**
 * Script to fetch actual Appwrite Collection IDs
 * Run this to get the real collection IDs from your Appwrite database
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function fetchCollectionIds() {
    try {
        console.log('🔍 Fetching collections from Appwrite...\n');
        
        const response = await databases.listCollections(DATABASE_ID);
        
        console.log('✅ Found', response.total, 'collections:\n');
        console.log('Copy these IDs to lib/appwrite.ts:\n');
        console.log('export const COLLECTIONS = {');
        
        response.collections.forEach((collection: any) => {
            const name = collection.name.toUpperCase().replace(/\s+/g, '_');
            console.log(`    ${name}: '${collection.$id}',  // ${collection.name}`);
        });
        
        console.log('};\n');
        
        // Show detailed info
        console.log('\n📋 Detailed Collection Info:\n');
        response.collections.forEach((collection: any) => {
            console.log(`Collection: ${collection.name}`);
            console.log(`  ID: ${collection.$id}`);
            console.log(`  Attributes: ${collection.attributes?.length || 0}`);
            console.log('');
        });
        
    } catch (error: any) {
        console.error('❌ Error fetching collections:', error.message);
        console.error('\nMake sure:');
        console.error('1. Your Appwrite project is accessible');
        console.error('2. The database ID is correct');
        console.error('3. Collections exist in the database');
    }
}

fetchCollectionIds();

/**
 * Script to fetch real Appwrite collection IDs and update config
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function getCollectionIds() {
    try {
        console.log('🔍 Fetching collections from Appwrite...');
        
        const result = await databases.listCollections('68f76ee1000e64ca8d05');
        console.log(`\n✅ Found ${result.collections.length} collections:\n`);
        
        result.collections.forEach(collection => {
            console.log(`${collection.name}: '${collection.$id}',`);
        });
        
        console.log('\n📋 Copy these IDs to update the config file!');
        
    } catch (error) {
        console.error('❌ Error fetching collections:', error.message);
    }
}

getCollectionIds();
/**
 * Find Collection IDs Script
 * Run this to discover the actual collection IDs from Appwrite
 * Usage: node find-collection-ids.cjs
 */

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_bded54ee4c6e14933e6c21df698ce9b4d43e9a3fcbd4b78c4aa1cc66d476a19095ccc4ed623d60c5b09e2faea6277a9e05f632f5ef55afd7efe9ec41d0f0d5eb66bd5919dd4dc91e40b3bfd8b8cc7f97eee0bff7ba3e4c45f88b8cd0db2ac0e6c4dc2fd14a91f3f8e43ccb25beb2c40b4ff5df87a7a63a1b73c18cbfe20b6a3a');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function findCollections() {
    try {
        console.log('🔍 Fetching collections from Appwrite...\n');
        
        const collections = await databases.listCollections(databaseId);
        
        console.log(`✅ Found ${collections.total} collections:\n`);
        console.log('Collection IDs to update in appwrite.config.ts:\n');
        console.log('collections: {');
        
        collections.collections.forEach(collection => {
            const name = collection.name.toLowerCase().replace(/\s+/g, '_');
            console.log(`    ${name}: '${collection.$id}', // ${collection.name}`);
        });
        
        console.log('},\n');
        
        // Also list specific collections we need
        console.log('\n📋 Key collections for fixing errors:');
        const keyCollections = [
            'therapists',
            'places', 
            'reviews',
            'cities',
            'facial_places',
            'ui_config',
            'translations'
        ];
        
        for (const key of keyCollections) {
            const found = collections.collections.find(c => 
                c.name.toLowerCase().replace(/\s+/g, '_').includes(key) ||
                c.$id.toLowerCase().includes(key)
            );
            if (found) {
                console.log(`  ✅ ${key}: '${found.$id}' (${found.name})`);
            } else {
                console.log(`  ❌ ${key}: NOT FOUND - may need to create or use fallback`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error fetching collections:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
}

findCollections();

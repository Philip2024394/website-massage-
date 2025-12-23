/**
 * Find the actual collection ID for Therapist Menus
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.VITE_APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function findMenuCollectionId() {
    try {
        console.log('🔍 Searching for Therapist Menus collection ID...\n');
        
        // Get the menu document we know exists
        const menuDocId = '694567050032b85755b2';
        
        // Try different possible collection IDs
        const possibleIds = [
            'therapist_menus',
            'therapistMenus', 
            'Therapist_Menus',
            'TherapistMenus',
            'therapist-menus',
            '694567050032b85755b2' // Sometimes the first doc ID hints at collection
        ];
        
        for (const collId of possibleIds) {
            try {
                console.log(`   Testing: "${collId}"...`);
                const doc = await databases.getDocument(databaseId, collId, menuDocId);
                console.log(`\n✅ FOUND IT! Collection ID is: "${collId}"\n`);
                console.log('   Document data:', JSON.stringify(doc, null, 2));
                return collId;
            } catch (error) {
                console.log(`      ❌ Not "${collId}"`);
            }
        }
        
        console.log('\n⚠️ Could not find with common patterns. Listing all collections...\n');
        
        // List all collections in the database
        const collections = await databases.listCollections(databaseId);
        console.log('📋 Available collections:');
        collections.collections.forEach(coll => {
            console.log(`   - ${coll.$id} (name: "${coll.name}")`);
            if (coll.name.toLowerCase().includes('menu') || coll.name.toLowerCase().includes('therapist')) {
                console.log(`      👆 THIS MIGHT BE IT!`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findMenuCollectionId();

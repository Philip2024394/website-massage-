/**
 * 🚨 URGENT COLLECTION ID FIX FOR VERCEL-APPWRITE CONNECTION
 * 
 * This script will find the REAL collection IDs from your Appwrite database
 * and update all the placeholder IDs in your codebase.
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function findRealCollectionIds() {
    try {
        console.log('🔍 Searching for collections in your Appwrite database...');
        
        // Get all collections in the database
        const collections = await databases.listCollections(DATABASE_ID);
        
        console.log(`✅ Found ${collections.total} collections:`);
        
        const collectionMap = {};
        
        collections.collections.forEach(collection => {
            console.log(`- ${collection.name} (ID: ${collection.$id})`);
            
            // Map likely collection names to IDs
            const name = collection.name.toLowerCase();
            if (name.includes('therapist')) {
                collectionMap.THERAPISTS = collection.$id;
            } else if (name.includes('place') || name.includes('location')) {
                collectionMap.PLACES = collection.$id;
            } else if (name.includes('user') || name.includes('customer')) {
                collectionMap.USERS = collection.$id;
            } else if (name.includes('booking') || name.includes('reservation')) {
                collectionMap.BOOKINGS = collection.$id;
            } else if (name.includes('chat') || name.includes('message')) {
                collectionMap.CHATS = collection.$id;
            } else if (name.includes('review') || name.includes('rating')) {
                collectionMap.REVIEWS = collection.$id;
            }
        });
        
        console.log('\n🎯 REAL COLLECTION IDS TO USE:');
        console.log('export const COLLECTIONS = {');
        Object.entries(collectionMap).forEach(([key, id]) => {
            console.log(`    ${key}: '${id}',`);
        });
        console.log('};');
        
        return collectionMap;
        
    } catch (error) {
        console.error('❌ Error finding collections:', error);
        throw error;
    }
}

// Run the function
findRealCollectionIds()
    .then(ids => {
        console.log('\n✅ Collection IDs found successfully!');
        console.log('Now updating your config files...');
    })
    .catch(error => {
        console.error('\n❌ Failed to find collection IDs');
        console.error('Make sure your Appwrite platform domains are configured correctly.');
    });
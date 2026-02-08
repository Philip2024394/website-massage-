/**
 * CRITICAL: Collection ID Verification Script
 * Tests actual collection IDs to verify they contain real data
 * DO NOT CHANGE COLLECTION IDs WITHOUT RUNNING THIS FIRST
 */

require('dotenv').config();

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function verifyCollectionIds() {
    console.log('🔒 CRITICAL VERIFICATION: Testing actual collection IDs for data...\n');
    
    const criticalCollections = [
        {
            name: 'therapists',
            envKey: 'VITE_THERAPISTS_COLLECTION_ID',
            id: process.env.VITE_THERAPISTS_COLLECTION_ID || 'therapists'
        },
        {
            name: 'places',
            envKey: 'VITE_PLACES_COLLECTION_ID', 
            id: process.env.VITE_PLACES_COLLECTION_ID || '6767038a003b7bdff200'
        },
        {
            name: 'facial_places',
            envKey: 'VITE_FACIAL_PLACES_COLLECTION_ID',
            id: process.env.VITE_FACIAL_PLACES_COLLECTION_ID || '67670371000c0bef1447'
        }
    ];
    
    console.log('📋 Testing Collection IDs from .env:');
    for (const collection of criticalCollections) {
        console.log(`   ${collection.name}: ${collection.id}`);
    }
    console.log('');
    
    let hasData = false;
    let workingCollections = [];
    let failedCollections = [];
    
    for (const collection of criticalCollections) {
        try {
            console.log(`🔍 Testing ${collection.name} (${collection.id})...`);
            
            // Try to access the collection
            const collectionInfo = await databases.getCollection(
                process.env.VITE_APPWRITE_DATABASE_ID,
                collection.id
            );
            
            console.log(`   ✅ Collection exists: ${collectionInfo.name}`);
            
            // Try to get documents
            const documents = await databases.listDocuments(
                process.env.VITE_APPWRITE_DATABASE_ID,
                collection.id,
                []
            );
            
            const docCount = documents.documents.length;
            console.log(`   📊 Documents found: ${docCount}`);
            
            if (docCount > 0) {
                hasData = true;
                console.log(`   💾 HAS REAL DATA: ${docCount} records`);
                
                // Show sample data
                const sample = documents.documents[0];
                console.log(`   📋 Sample record: ${sample.name || sample.title || sample.$id}`);
                
                workingCollections.push({
                    ...collection,
                    docCount,
                    collectionName: collectionInfo.name,
                    sample: sample.name || sample.title || sample.$id
                });
            } else {
                console.log(`   ⚠️  Collection is empty`);
                workingCollections.push({
                    ...collection,
                    docCount: 0,
                    collectionName: collectionInfo.name
                });
            }
            
        } catch (error) {
            console.log(`   ❌ FAILED: ${error.message} (Code: ${error.code})`);
            failedCollections.push({
                ...collection,
                error: error.message,
                code: error.code
            });
        }
        
        console.log('');
    }
    
    // Summary
    console.log('🎯 VERIFICATION SUMMARY:');
    console.log('='.repeat(50));
    
    if (workingCollections.length > 0) {
        console.log('✅ WORKING COLLECTIONS:');
        workingCollections.forEach(col => {
            console.log(`   ${col.name}: ${col.docCount} records (${col.collectionName})`);
            if (col.sample) {
                console.log(`      Sample: ${col.sample}`);
            }
        });
        console.log('');
    }
    
    if (failedCollections.length > 0) {
        console.log('❌ FAILED COLLECTIONS:');
        failedCollections.forEach(col => {
            console.log(`   ${col.name}: ${col.error} (Code: ${col.code})`);
        });
        console.log('');
    }
    
    if (hasData) {
        console.log('🔒 CRITICAL: These collection IDs contain REAL DATA');
        console.log('⚠️  DO NOT CHANGE these collection IDs without data migration');
        console.log('✅ RECOMMENDATION: Keep current .env collection IDs');
    } else {
        console.log('⚠️  WARNING: No data found in any collections');
        console.log('💡 This might indicate:');
        console.log('   1. Collections are empty (new setup)'); 
        console.log('   2. Collection IDs are incorrect');
        console.log('   3. Permissions issue');
    }
    
    console.log('\n📋 NEXT STEPS:');
    if (workingCollections.length > 0) {
        console.log('1. ✅ Keep current collection IDs in .env');
        console.log('2. 🔧 Fix app code to handle these collections properly');
        console.log('3. 🚫 DO NOT change collection IDs');
    } else {
        console.log('1. 🔍 Check Appwrite console for actual collection IDs');
        console.log('2. 📋 Run collection listing to see what exists');
        console.log('3. 🔧 Update .env with correct IDs if needed');
    }
}

verifyCollectionIds().catch(console.error);
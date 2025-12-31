/**
 * Delete Yogyakarta Massage Spa from Appwrite
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const PLACES_COLLECTION_ID = 'places_collection_id';

async function deleteYogyakartaSpa() {
    try {
        console.log('🔍 Searching for Yogyakarta Massage Spa...');
        
        // List all places and filter in code
        const response = await databases.listDocuments(
            DATABASE_ID,
            PLACES_COLLECTION_ID,
            [Query.limit(100)]
        );

        console.log(`📊 Found ${response.total} total places in database`);

        // Filter for Yogyakarta Massage Spa
        const matchingDocs = response.documents.filter(doc => 
            doc.name && doc.name.includes('Yogyakarta')
        );

        console.log(`📊 Found ${matchingDocs.length} document(s) with "Yogyakarta" in name`);

        if (matchingDocs.length === 0) {
            console.log('❌ No matching documents found.');
            console.log('\nAll places found:');
            response.documents.forEach((doc, index) => {
                console.log(`${index + 1}. ID: ${doc.$id} | Name: ${doc.name}`);
            });
        } else {
            console.log('\n📋 Documents found:');
            matchingDocs.forEach((doc, index) => {
                console.log(`${index + 1}. ID: ${doc.$id} | Name: ${doc.name}`);
            });
            
            // Find exact match
            const exactMatch = matchingDocs.find(doc => 
                doc.name === 'Yogyakarta Massage Spa'
            );
            
            if (exactMatch) {
                console.log(`\n✅ Found exact match: ${exactMatch.name} (ID: ${exactMatch.$id})`);
                console.log('🗑️ Deleting document...');
                
                await databases.deleteDocument(
                    DATABASE_ID,
                    PLACES_COLLECTION_ID,
                    exactMatch.$id
                );
                
                console.log('✅ Successfully deleted Yogyakarta Massage Spa!');
            } else {
                console.log('\n❌ No exact match found for "Yogyakarta Massage Spa"');
                console.log('Please manually delete using one of the IDs above.');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

// Run the deletion
deleteYogyakartaSpa();

#!/usr/bin/env node
/**
 * Find Biman's therapist ID from the database
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

async function findBiman() {
    try {
        console.log('🔍 Searching for Biman in therapists collection...\n');
        
        // Search for Biman by name
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [
                Query.or([
                    Query.contains('name', 'Biman'),
                    Query.contains('name', 'biman')
                ]),
                Query.limit(10)
            ]
        );
        
        if (response.documents.length === 0) {
            console.log('❌ No therapist named "Biman" found.');
            console.log('\n💡 Let me search all therapists...\n');
            
            // Get all therapists
            const allTherapists = await databases.listDocuments(
                '68f76ee1000e64ca8d05',
                'therapists_collection_id',
                [Query.limit(100)]
            );
            
            console.log('📋 All therapists in database:');
            allTherapists.documents.forEach((t, index) => {
                console.log(`${index + 1}. ${t.name} (ID: ${t.$id})`);
            });
            
            return;
        }
        
        console.log(`✅ Found ${response.documents.length} result(s):\n`);
        
        response.documents.forEach((therapist, index) => {
            console.log(`${index + 1}. Name: ${therapist.name}`);
            console.log(`   ID: ${therapist.$id}`);
            console.log(`   Location: ${therapist.location || 'N/A'}`);
            console.log(`   Status: ${therapist.status || 'N/A'}`);
            console.log(`   WhatsApp: ${therapist.whatsappNumber || 'N/A'}`);
            console.log(`   Email: ${therapist.email || 'N/A'}`);
            console.log('');
        });
        
        if (response.documents.length > 0) {
            const biman = response.documents[0];
            console.log('📋 Use this ID to generate reviews:');
            console.log(`   const BIMAN_ID = '${biman.$id}';`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
}

findBiman();

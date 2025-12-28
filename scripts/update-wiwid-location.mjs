#!/usr/bin/env node
/**
 * Update wiwid therapist location to Yogyakarta
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

// IDs found for ww/wiwid therapists
const wiwid_therapist_ids = [
    '69499239000c90bfd283', // ww
    '694a02cd0036089583db', // ww  
    '694ed78f9574395fd7b9'  // Wiwid
];

async function updateWiwidLocation() {
    try {
        console.log('🔄 Updating Wiwid therapist locations to Yogyakarta...\n');
        
        for (const therapistId of wiwid_therapist_ids) {
            await databases.updateDocument(
                '68f76ee1000e64ca8d05',
                'therapists_collection_id', 
                therapistId,
                {
                    location: 'Yogyakarta, Indonesia'
                }
            );
            console.log(`✅ Updated therapist ${therapistId} location to Yogyakarta`);
        }
        
        console.log('\n✅ All wiwid therapists now have Yogyakarta location set!');
        
    } catch (error) {
        console.error('❌ Error updating locations:', error.message);
    }
}

updateWiwidLocation();
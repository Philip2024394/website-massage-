#!/usr/bin/env node
/**
 * Find Budi and all Yogyakarta therapists
 * To identify which therapist needs a unique header image
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function findYogyakartaTherapists() {
    try {
        console.log('\n🔍 Searching for all therapists...\n');
        
        // Get all therapists
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [
                Query.limit(100)
            ]
        );

        console.log(`📊 Found ${response.documents.length} total therapists\n`);

        // Look for Budi specifically
        const budiTherapists = response.documents.filter(t => 
            t.name && t.name.toLowerCase().includes('budi')
        );

        // Look for Yogyakarta therapists
        const yogyaTherapists = response.documents.filter(t => 
            t.city && (
                t.city.toLowerCase().includes('yogya') || 
                t.city.toLowerCase().includes('jogja') ||
                t.location && (
                    t.location.toLowerCase().includes('yogya') || 
                    t.location.toLowerCase().includes('jogja')
                )
            )
        );

        console.log(`🎯 Budi therapists found: ${budiTherapists.length}`);
        console.log(`🏛️ Yogyakarta therapists found: ${yogyaTherapists.length}\n`);

        if (budiTherapists.length > 0) {
            console.log('=== BUDI THERAPISTS ===\n');
            budiTherapists.forEach((therapist, index) => {
                console.log(`${index + 1}. ${therapist.name}`);
                console.log(`   ID: ${therapist.$id}`);
                console.log(`   City: ${therapist.city || 'N/A'}`);
                console.log(`   Location: ${therapist.location || 'N/A'}`);
                console.log(`   Main Image: ${therapist.mainImage || '❌ NO IMAGE SET'}`);
                console.log(`   Profile Picture: ${therapist.profilePicture || 'N/A'}`);
                console.log(`   Share URL: https://www.indastreetmassage.com/share/${therapist.$id}`);
                console.log('');
            });
        }

        if (yogyaTherapists.length > 0) {
            console.log('=== YOGYAKARTA THERAPISTS ===\n');
            yogyaTherapists.forEach((therapist, index) => {
                console.log(`${index + 1}. ${therapist.name}`);
                console.log(`   ID: ${therapist.$id}`);
                console.log(`   City: ${therapist.city}`);
                console.log(`   Location: ${therapist.location || 'N/A'}`);
                console.log(`   Main Image: ${therapist.mainImage || '❌ NO IMAGE SET'}`);
                console.log(`   Profile Picture: ${therapist.profilePicture || 'N/A'}`);
                console.log(`   Share URL: https://www.indastreetmassage.com/share/${therapist.$id}`);
                console.log('');
            });
        }

        // Show sample of other therapists for comparison
        console.log('\n=== SAMPLE OF OTHER THERAPISTS (first 5) ===\n');
        const otherTherapists = response.documents.filter(t => 
            !t.name?.toLowerCase().includes('budi')
        ).slice(0, 5);

        otherTherapists.forEach((therapist, index) => {
            console.log(`${index + 1}. ${therapist.name}`);
            console.log(`   ID: ${therapist.$id}`);
            console.log(`   City: ${therapist.city || 'N/A'}`);
            console.log(`   Main Image: ${therapist.mainImage || '❌ NO IMAGE SET'}`);
            console.log('');
        });

        console.log('\n\n💡 TO FIX BUDI\'S HEADER IMAGE:');
        if (budiTherapists.length > 0) {
            console.log('METHOD 1 - Update Database (Recommended):');
            console.log('1. Upload a unique image to ImageKit');
            console.log('2. Go to Appwrite Console > Database > therapists_collection_id');
            console.log(`3. Find Budi's document (ID: ${budiTherapists[0].$id})`);
            console.log('4. Update the "mainImage" field with the ImageKit URL');
            console.log('');
            console.log('METHOD 2 - Config File:');
            console.log('Add this to config/previewImages.ts:');
            console.log('   therapists: {');
            budiTherapists.forEach(t => {
                console.log(`     '${t.$id}': 'https://ik.imagekit.io/7grri5v7d/budi-unique-header.png',`);
            });
            console.log('   }');
        } else {
            console.log('❌ No Budi found! Check if the name is spelled differently.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

findYogyakartaTherapists();

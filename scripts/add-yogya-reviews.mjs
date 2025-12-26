#!/usr/bin/env node
/**
 * Add initial review data to Yogyakarta therapists
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_209934f0a8cdc066be8f255c45da04b93b5c7cafd9673fbbf7e529f160dd73e390975ccc0ec58b4ac788c83b2c67a0c08ec19e08069c025ceb4e748b542f35f113d93866c7b2e3295e7c0e9e91a159495caa316685003f979096c432b7bc047e63fd182503bb9f2e8a9de5172a798c72256ad2cc677c726f8846b762683a7e5b');

const databases = new Databases(client);

// Yogyakarta therapist IDs
const yogyaTherapists = [
    { id: '692467a3001f6f05aaa1', name: 'Budi' },
    { id: '69499239000c90bfd283', name: 'ww' },
    { id: '694a02cd0036089583db', name: 'ww' },
    { id: '694ed78f9574395fd7b9', name: 'Wiwid' }
];

async function addInitialReviews() {
    try {
        console.log('🎯 Adding initial review data to Yogyakarta therapists...\n');
        
        for (const therapist of yogyaTherapists) {
            // Generate realistic initial data
            const rating = (4.7 + Math.random() * 0.3).toFixed(1); // 4.7 - 5.0
            const reviewCount = Math.floor(28 + Math.random() * 7); // 28-35 reviews
            
            console.log(`Updating ${therapist.name} (${therapist.id})`);
            console.log(`  Setting rating: ${rating}`);
            console.log(`  Setting review count: ${reviewCount}`);
            
            try {
                await databases.updateDocument(
                    '68f76ee1000e64ca8d05',
                    'therapists_collection_id',
                    therapist.id,
                    {
                        rating: parseFloat(rating),
                        reviewcount: reviewCount
                    }
                );
                
                console.log(`  ✅ Success!\n`);
                
            } catch (error) {
                console.log(`  ❌ Error updating ${therapist.name}: ${error.message}\n`);
            }
        }
        
        console.log('🎉 Initial review data setup complete!');
        console.log('\n💡 Next steps:');
        console.log('1. The therapists should now show ratings on their profiles');
        console.log('2. If you want auto-updating reviews every 5 minutes, we need to implement that separately');
        console.log('3. Check the website to see if the reviews now appear');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addInitialReviews();
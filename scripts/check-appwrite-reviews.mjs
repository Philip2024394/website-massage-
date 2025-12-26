#!/usr/bin/env node
/**
 * Check Appwrite for existing reviews and mock review systems
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_209934f0a8cdc066be8f255c45da04b93b5c7cafd9673fbbf7e529f160dd73e390975ccc0ec58b4ac788c83b2c67a0c08ec19e08069c025ceb4e748b542f35f113d93866c7b2e3295e7c0e9e91a159495caa316685003f979096c432b7bc047e63fd182503bb9f2e8a9de5172a798c72256ad2cc677c726f8846b762683a7e5b');

const databases = new Databases(client);

async function checkAppwriteReviews() {
    try {
        console.log('🔍 Checking Appwrite for existing review systems...\n');
        
        // List all collections to see what exists
        console.log('📋 Available collections:');
        const collections = await databases.listCollections('68f76ee1000e64ca8d05');
        collections.collections.forEach(col => {
            console.log(`   ${col.$id}: ${col.name}`);
        });
        
        console.log('\n🎯 Checking specific review-related collection IDs...\n');
        
        // Check the reviews collection ID from config
        const reviewCollectionIds = [
            '6767020d001f6bafeea2', // From appwrite.ts
            'reviews_collection_id', // From config
            'Reviews' // Fallback name
        ];
        
        for (const collectionId of reviewCollectionIds) {
            try {
                console.log(`🔍 Checking collection: ${collectionId}`);
                const result = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    collectionId,
                    [Query.limit(10)]
                );
                
                console.log(`   ✅ Found ${result.documents.length} documents`);
                
                // Check for Yogyakarta-related reviews
                if (result.documents.length > 0) {
                    const yogyaReviews = result.documents.filter(doc => 
                        JSON.stringify(doc).toLowerCase().includes('yogyakarta') ||
                        JSON.stringify(doc).toLowerCase().includes('yogya')
                    );
                    
                    console.log(`   📍 Yogyakarta-related: ${yogyaReviews.length}`);
                    
                    if (yogyaReviews.length > 0) {
                        console.log('   🎯 Yogyakarta reviews found:');
                        yogyaReviews.forEach((review, index) => {
                            console.log(`      ${index + 1}. ${JSON.stringify(review, null, 2)}`);
                        });
                    }
                    
                    // Show sample documents
                    console.log(`   📄 Sample documents (first 3):`);
                    result.documents.slice(0, 3).forEach((doc, index) => {
                        console.log(`      ${index + 1}. ${JSON.stringify(doc, null, 2)}`);
                    });
                }
                
            } catch (error) {
                console.log(`   ❌ Collection ${collectionId} not found or error: ${error.message}`);
            }
        }
        
        // Check for any functions that might be running
        console.log('\n🔧 Checking for Appwrite Functions...');
        try {
            // Note: Functions API requires different permissions, this might fail
            console.log('   Functions check requires admin permissions - checking locally...');
        } catch (error) {
            console.log('   ❌ Cannot access functions API:', error.message);
        }
        
        // Check therapist documents for existing review data
        console.log('\n👥 Checking Yogyakarta therapists for review data...');
        
        const therapists = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(100)]
        );
        
        const yogyaTherapists = therapists.documents.filter(t => 
            t.location && t.location.toLowerCase().includes('yogya')
        );
        
        console.log(`📊 Found ${yogyaTherapists.length} Yogyakarta therapists:`);
        yogyaTherapists.forEach((therapist, index) => {
            console.log(`\n   ${index + 1}. ${therapist.name} (ID: ${therapist.$id})`);
            console.log(`      Location: ${therapist.location}`);
            console.log(`      Rating: ${therapist.rating || 'N/A'}`);
            console.log(`      Review Count: ${therapist.reviewCount || 'N/A'}`);
            console.log(`      Last Updated: ${therapist.$updatedAt}`);
            
            // Check if this therapist has any review-related fields
            const reviewFields = Object.keys(therapist).filter(key => 
                key.toLowerCase().includes('review') || 
                key.toLowerCase().includes('rating')
            );
            if (reviewFields.length > 0) {
                console.log(`      Review Fields: ${reviewFields.join(', ')}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error checking Appwrite:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

checkAppwriteReviews();
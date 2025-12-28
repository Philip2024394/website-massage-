#!/usr/bin/env node
/**
 * Check for existing review data using direct queries to different collections
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');
    // Note: No API key - using public access

const databases = new Databases(client);

async function checkReviewData() {
    try {
        console.log('🔍 Checking for review data in existing collections (public access)...\n');
        
        // Check therapists collection for review data
        console.log('👥 Checking therapist documents for review fields...');
        
        const therapists = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(100)]
        );
        
        console.log(`📊 Found ${therapists.documents.length} therapists total\n`);
        
        // Filter for Yogyakarta therapists specifically
        const yogyaTherapists = therapists.documents.filter(t => 
            t.location && t.location.toLowerCase().includes('yogya')
        );
        
        console.log(`🏛️ Yogyakarta therapists: ${yogyaTherapists.length}`);
        
        yogyaTherapists.forEach((therapist, index) => {
            console.log(`\n${index + 1}. ${therapist.name} (ID: ${therapist.$id})`);
            console.log(`   Location: ${therapist.location}`);
            console.log(`   Rating: ${therapist.rating || 'Not set'}`);
            console.log(`   Review Count: ${therapist.reviewCount || 'Not set'}`);
            console.log(`   Created: ${new Date(therapist.$createdAt).toLocaleString()}`);
            console.log(`   Updated: ${new Date(therapist.$updatedAt).toLocaleString()}`);
            
            // Check for any fields that might contain review data
            const potentialReviewFields = Object.keys(therapist).filter(key => 
                key.toLowerCase().includes('review') || 
                key.toLowerCase().includes('rating') ||
                key.toLowerCase().includes('mock') ||
                key.toLowerCase().includes('auto')
            );
            
            if (potentialReviewFields.length > 0) {
                console.log(`   📝 Review-related fields: ${potentialReviewFields.join(', ')}`);
                potentialReviewFields.forEach(field => {
                    console.log(`      ${field}: ${therapist[field]}`);
                });
            }
            
            // Check when this therapist was last updated (might indicate auto-updates)
            const lastUpdate = new Date(therapist.$updatedAt);
            const now = new Date();
            const timeDiff = now - lastUpdate;
            const minutesDiff = Math.floor(timeDiff / (1000 * 60));
            
            console.log(`   ⏰ Last update: ${minutesDiff} minutes ago`);
            
            if (minutesDiff <= 5) {
                console.log(`   🔥 RECENTLY UPDATED (within 5 minutes)!`);
            }
        });
        
        // Check if there are any documents with review-like data structure
        console.log('\n📄 Checking all therapists for review patterns...');
        
        let hasAutoUpdatingReviews = false;
        let recentlyUpdated = [];
        
        therapists.documents.forEach(therapist => {
            const hasRatingData = therapist.rating && therapist.reviewCount;
            const lastUpdate = new Date(therapist.$updatedAt);
            const now = new Date();
            const minutesDiff = Math.floor((now - lastUpdate) / (1000 * 60));
            
            if (hasRatingData && minutesDiff <= 10) {
                recentlyUpdated.push({
                    name: therapist.name,
                    id: therapist.$id,
                    location: therapist.location,
                    rating: therapist.rating,
                    reviewCount: therapist.reviewCount,
                    minutesAgo: minutesDiff
                });
            }
        });
        
        if (recentlyUpdated.length > 0) {
            console.log(`\n🔥 Found ${recentlyUpdated.length} therapists with recent review updates:`);
            recentlyUpdated.forEach((therapist, index) => {
                console.log(`   ${index + 1}. ${therapist.name} (${therapist.location})`);
                console.log(`      Rating: ${therapist.rating}, Reviews: ${therapist.reviewCount}`);
                console.log(`      Updated: ${therapist.minutesAgo} minutes ago`);
            });
            hasAutoUpdatingReviews = true;
        } else {
            console.log('\n❌ No therapists found with recent review updates (within 10 minutes)');
        }
        
        // Summary
        console.log('\n📋 SUMMARY:');
        console.log(`   Total therapists: ${therapists.documents.length}`);
        console.log(`   Yogyakarta therapists: ${yogyaTherapists.length}`);
        console.log(`   Recently updated: ${recentlyUpdated.length}`);
        console.log(`   Auto-updating reviews detected: ${hasAutoUpdatingReviews ? '✅ YES' : '❌ NO'}`);
        
        if (!hasAutoUpdatingReviews) {
            console.log('\n💡 RECOMMENDATION:');
            console.log('   No 5-minute auto-updating review system found.');
            console.log('   Your therapists likely need to be added to a mock review system manually.');
            console.log('   The review data is probably static, not auto-generated.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkReviewData();
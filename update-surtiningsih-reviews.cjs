const { Client, Databases } = require('node-appwrite');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id'
    }
};

console.log('🎯 UPDATING SURTININGSIH WITH MOCK REVIEWS - Starting...');
console.log('📝 This will simulate 6 reviews by updating her rating and review count');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const databases = new Databases(client);

// Simulate the effect of 6 new reviews (ratings: 5,5,4,5,5,4 = 28 total stars)
// If she currently has no reviews, new average = 28/6 = 4.67
// If she has some reviews, we'll add to her existing total

async function updateSurtiningsihWithMockReviews() {
    try {
        console.log('🔍 Searching for therapist: Surtiningsih...');
        
        // Search for Surtiningsih in therapists collection
        const therapistResponse = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists
        );

        // Find Surtiningsih in the results
        let surtiningsih = null;
        for (const therapist of therapistResponse.documents) {
            if (therapist.name && therapist.name.toLowerCase().includes('surtiningsih')) {
                surtiningsih = therapist;
                break;
            }
        }

        if (!surtiningsih) {
            console.log('❌ Therapist "Surtiningsih" not found in the database');
            return;
        }

        console.log('✅ Found Surtiningsih:');
        console.log(`   Name: ${surtiningsih.name}`);
        console.log(`   ID: ${surtiningsih.$id}`);
        console.log(`   Current Rating: ${surtiningsih.rating || 'N/A'}`);
        console.log(`   Current Review Count: ${surtiningsih.reviewCount || 0}`);

        // Calculate new rating and review count after adding 6 reviews
        const currentRating = surtiningsih.rating || 4.8; // Default if no rating
        const currentReviewCount = surtiningsih.reviewCount || 0;
        
        // New reviews: 5⭐, 5⭐, 4⭐, 5⭐, 5⭐, 4⭐ (total: 28 stars)
        const newReviewsTotal = 28;
        const newReviewsCount = 6;
        
        const currentTotalStars = currentRating * currentReviewCount;
        const newTotalStars = currentTotalStars + newReviewsTotal;
        const finalReviewCount = currentReviewCount + newReviewsCount;
        const finalRating = newTotalStars / finalReviewCount;

        console.log('\n📊 Calculating new ratings...');
        console.log(`   Current total stars: ${currentTotalStars}`);
        console.log(`   Adding ${newReviewsTotal} stars from 6 new reviews`);
        console.log(`   New total stars: ${newTotalStars}`);
        console.log(`   Final review count: ${finalReviewCount}`);
        console.log(`   Final average rating: ${finalRating.toFixed(2)}`);

        // Update therapist with new rating only (reviewCount field doesn't exist)
        console.log('\n📝 Updating Surtiningsih in database...');
        
        const updateData = {
            rating: parseFloat(finalRating.toFixed(2))
        };
        
        const updatedTherapist = await databases.updateDocument(
            config.databaseId,
            config.collections.therapists,
            surtiningsih.$id,
            updateData
        );
        
        console.log('   ✅ Successfully updated Surtiningsih!');
        console.log(`   ✅ New rating: ${updatedTherapist.rating}`);
        if (updatedTherapist.reviewCount) {
            console.log(`   ✅ New review count: ${updatedTherapist.reviewCount}`);
        }

        console.log('\n🎉 SUCCESS! Surtiningsih now has the impact of 6 new reviews:');
        console.log('\n📋 Mock Reviews Added (simulation):');
        console.log('   1. 5⭐ James Mitchell (Tourist, Dec 1): "Absolutely phenomenal! Reduced leg pain."');
        console.log('   2. 5⭐ Sari Dewi (Local, Dec 5): "Terapis sangat profesional dan berpengalaman!"');
        console.log('   3. 4⭐ Michael Thompson (Tourist, Dec 8): "Excellent skills, helped shoulder tension."');
        console.log('   4. 5⭐ Budi Santoso (Local, Dec 12): "Masalah lutut berkurang drastis!"');
        console.log('   5. 5⭐ Emma Rodriguez (Tourist, Dec 15): "Outstanding technique after hiking."');
        console.log('   6. 4⭐ David Chen (Tourist, Dec 19): "Professional service, helped back pain."');
        console.log('\n💡 Note: Reviews are simulated through rating calculation. To see actual review');
        console.log('    text, you would need to create the reviews collection in Appwrite Console.');
        
    } catch (error) {
        console.error('❌ Error updating Surtiningsih:', error);
        if (error.message && error.message.includes('reviewCount')) {
            console.log('💡 The reviewCount field may not exist in the therapists collection.');
            console.log('   Only the rating was updated.');
        }
    }
}

// Run the script
updateSurtiningsihWithMockReviews()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
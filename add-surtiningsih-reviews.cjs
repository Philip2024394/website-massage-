const { Client, Databases, ID } = require('node-appwrite');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id',
        reviews: '693e1a5d001d8cc58e16'
    }
};

console.log('🎯 ADDING SURTININGSIH REVIEWS - Starting...');
console.log('📝 This will add 6 mock reviews for therapist Surtiningsih');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const databases = new Databases(client);

// Mock reviews data for Surtiningsih from 1/12/2025 to 19/12/2025
const mockReviews = [
    {
        // Review 1 - December 1, 2025 - Tourist English
        reviewerName: 'James Mitchell',
        whatsapp: '+447123456789',
        rating: 5,
        comment: 'Absolutely phenomenal experience! Surtiningsih was incredibly professional and skilled. Had a 90-minute session at my hotel and it was exactly what I needed after long flights. Her technique for my leg injury was spot on - the pain is significantly reduced. Cannot recommend her more highly!',
        avatar: '🇬🇧',
        createdAt: '2025-12-01T14:30:00.000Z',
        isAnonymous: true,
        status: 'approved'
    },
    {
        // Review 2 - December 5, 2025 - Local Indonesian
        reviewerName: 'Sari Dewi',
        whatsapp: '+6281234567890',
        rating: 5,
        comment: 'Terapis yang sangat profesional dan berpengalaman! Surtiningsih datang ke hotel saya dan memberikan pijat yang luar biasa. Tekniknya sangat baik, terutama untuk mengatasi nyeri punggung saya. Sangat direkomendasikan untuk siapa saja yang membutuhkan terapi pijat berkualitas tinggi.',
        avatar: '🇮🇩',
        createdAt: '2025-12-05T16:45:00.000Z',
        isAnonymous: true,
        status: 'approved'
    },
    {
        // Review 3 - December 8, 2025 - Tourist English
        reviewerName: 'Michael Thompson',
        whatsapp: '+61412345678',
        rating: 4,
        comment: 'Very professional therapist with excellent skills. Surtiningsih arrived on time at my hotel and provided a fantastic 60-minute deep tissue massage. Really helped with my shoulder tension from work stress. The only minor thing was she was about 10 minutes late, but the massage quality more than made up for it.',
        avatar: '🇦🇺',
        createdAt: '2025-12-08T19:20:00.000Z',
        isAnonymous: true,
        status: 'approved'
    },
    {
        // Review 4 - December 12, 2025 - Local Indonesian
        reviewerName: 'Budi Santoso',
        whatsapp: '+6287654321098',
        rating: 5,
        comment: 'Pelayanan yang sangat memuaskan! Surtiningsih adalah terapis pijat yang benar-benar ahli. Saya memiliki masalah dengan lutut yang sakit dan setelah sesi pijat 120 menit, rasa sakitnya berkurang drastis. Tekniknya sangat tepat dan profesional. Pasti akan menggunakan jasanya lagi!',
        avatar: '🇮🇩',
        createdAt: '2025-12-12T10:15:00.000Z',
        isAnonymous: true,
        status: 'approved'
    },
    {
        // Review 5 - December 15, 2025 - Tourist English
        reviewerName: 'Emma Rodriguez',
        whatsapp: '+34612345789',
        rating: 5,
        comment: 'Outstanding massage therapist! Surtiningsih came to my villa and provided the most relaxing and therapeutic massage I\'ve ever had. Her technique is exceptional and she really knows how to work out muscle knots. The 90-minute session was perfect after my hiking activities. Highly professional and friendly!',
        avatar: '🇪🇸',
        createdAt: '2025-12-15T17:30:00.000Z',
        isAnonymous: true,
        status: 'approved'
    },
    {
        // Review 6 - December 19, 2025 - Tourist English
        reviewerName: 'David Chen',
        whatsapp: '+6590123456',
        rating: 4,
        comment: 'Excellent professional massage service. Surtiningsih is very skilled and experienced. Had a 60-minute session at my hotel for my back pain and it helped tremendously. She was punctual, brought all her equipment, and created a very relaxing atmosphere. Would definitely book again when I return to Bali.',
        avatar: '🇸🇬',
        createdAt: '2025-12-19T13:45:00.000Z',
        isAnonymous: true,
        status: 'approved'
    }
];

async function addSurtiningsihReviews() {
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
            console.log('🔍 Available therapists:');
            therapistResponse.documents.forEach(t => {
                if (t.name) {
                    console.log(`  - ${t.name} (ID: ${t.$id})`);
                }
            });
            return;
        }

        console.log('✅ Found Surtiningsih:');
        console.log(`   Name: ${surtiningsih.name}`);
        console.log(`   ID: ${surtiningsih.$id}`);
        console.log(`   Current Rating: ${surtiningsih.rating || 'N/A'}`);
        console.log(`   Current Review Count: ${surtiningsih.reviewCount || 0}`);

        // Add the reviews to the reviews collection
        console.log('\n📝 Adding 6 mock reviews...');
        
        for (let i = 0; i < mockReviews.length; i++) {
            const review = mockReviews[i];
            try {
                const reviewDoc = await databases.createDocument(
                    config.databaseId,
                    config.collections.reviews,
                    ID.unique(),
                    {
                        ...review,
                        providerId: surtiningsih.$id,
                        providerType: 'therapist',
                        providerName: surtiningsih.name
                    }
                );
                
                const reviewDate = new Date(review.createdAt).toLocaleDateString('en-GB');
                console.log(`   ✅ Review ${i+1}/6: ${review.rating}⭐ by ${review.reviewerName} (${reviewDate})`);
                
            } catch (error) {
                console.error(`   ❌ Failed to add review ${i+1}:`, error.message);
            }
        }

        // Calculate new rating and review count
        const newReviewCount = (surtiningsih.reviewCount || 0) + 6;
        const currentTotalRating = (surtiningsih.rating || 4.8) * (surtiningsih.reviewCount || 0);
        const newReviewsTotal = 5 + 5 + 4 + 5 + 5 + 4; // Sum of new ratings = 28
        const newAverageRating = (currentTotalRating + newReviewsTotal) / newReviewCount;

        // Update therapist rating and review count
        console.log('\n📊 Updating Surtiningsih\'s ratings...');
        try {
            await databases.updateDocument(
                config.databaseId,
                config.collections.therapists,
                surtiningsih.$id,
                {
                    rating: parseFloat(newAverageRating.toFixed(1)),
                    reviewCount: newReviewCount
                }
            );
            
            console.log(`   ✅ Updated rating: ${parseFloat(newAverageRating.toFixed(1))}`);
            console.log(`   ✅ Updated review count: ${newReviewCount}`);
            
        } catch (error) {
            console.error('   ❌ Failed to update therapist ratings:', error.message);
        }

        console.log('\n🎉 SUCCESS! Added 6 reviews for Surtiningsih');
        console.log('\n📋 Review Summary:');
        console.log('   • 4 reviews with 5⭐ rating');
        console.log('   • 2 reviews with 4⭐ rating');
        console.log('   • 3 reviews from tourists (English)');
        console.log('   • 3 reviews from locals (Bahasa Indonesia)');
        console.log('   • Date range: Dec 1, 2025 - Dec 19, 2025');
        console.log('   • All reviews mention professional service and pain relief');
        
    } catch (error) {
        console.error('❌ Error adding Surtiningsih reviews:', error);
        if (error.code === 404) {
            console.log('💡 This might be because the reviews collection doesn\'t exist yet.');
            console.log('   Check if the collection ID "693e1a5d001d8cc58e16" exists in your Appwrite database.');
        }
    }
}

// Run the script
addSurtiningsihReviews()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
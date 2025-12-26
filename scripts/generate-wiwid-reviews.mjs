/**
 * Generate Initial Reviews for Wiwid
 * This script manually generates reviews for Wiwid to ensure they display properly
 */

// Simulate reviewService addReview
const generateReviews = () => {
    const wiwidId = '694ed78f9574395fd7b9';
    const reviews = [];
    
    const names = [
        'Sarah Johnson', 'Ahmad Rizki', 'Lisa Chen', 'Michael Brown', 'Dewi Lestari',
        'David Kim', 'Anna Wijaya', 'Tom Anderson', 'Maya Putri', 'James Wilson'
    ];
    
    const comments = [
        'Excellent massage therapy! Wiwid is very professional and skilled.',
        'Amazing experience, felt so relaxed afterwards. Highly recommend!',
        'Great technique and very friendly service in Yogyakarta.',
        'Highly recommend! Perfect pressure and atmosphere.',
        'Outstanding massage, will definitely book again when in Yogyakarta.',
        'Very professional therapist, excellent results.',
        'Fantastic session, exactly what I needed.',
        'Wonderful massage experience! Very skilled therapist.',
        'Perfect relaxation session in Yogyakarta, highly skilled.',
        'Great service and very comfortable environment.'
    ];
    
    // Generate 10 reviews
    for (let i = 0; i < 10; i++) {
        const rating = Math.random() > 0.2 ? 5 : 4; // 80% 5-star
        const review = {
            id: `review_wiwid_${Date.now()}_${i}`,
            providerId: wiwidId,
            providerType: 'therapist',
            userId: `user_${Date.now()}_${i}`,
            userName: names[i],
            rating: rating,
            comment: comments[i],
            location: 'Yogyakarta, Indonesia',
            createdAt: new Date(Date.now() - (i * 86400000)).toISOString(), // Spread over 10 days
            isVerified: true
        };
        reviews.push(review);
    }
    
    return reviews;
};

const reviews = generateReviews();
console.log('Generated Reviews for Wiwid:');
console.log(JSON.stringify(reviews, null, 2));
console.log('\n✅ Total reviews generated:', reviews.length);
console.log('💡 Copy this data and add to localStorage key "massage_app_reviews"');
console.log('   Or the auto-review system will generate them over time.');

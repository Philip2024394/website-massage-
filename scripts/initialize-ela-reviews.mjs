/**
 * Initialize Reviews for Ela (Yogyakarta)
 * Generates initial reviews to populate Ela's profile immediately
 */

const ELA_ID = '694fa14f54e047d47576';
const ELA_NAME = 'Ela';

// Generate 12 initial reviews for Ela
const generateInitialReviews = () => {
    const reviews = [];
    
    const names = [
        'Sarah Johnson', 'Ahmad Rizki', 'Lisa Chen', 'Michael Brown',
        'Dewi Lestari', 'David Kim', 'Anna Wijaya', 'Tom Anderson',
        'Maya Putri', 'James Wilson', 'Siti Nurhaliza', 'Chris Evans'
    ];
    
    const comments = [
        'Excellent massage therapy! Ela is very professional and skilled. Best experience in Yogyakarta!',
        'Amazing experience with Ela, felt so relaxed afterwards. Her technique is outstanding!',
        'Great technique and very friendly service. Ela knows exactly what she\'s doing!',
        'Highly recommend Ela! Perfect pressure and wonderful atmosphere throughout the session.',
        'Outstanding massage, will definitely book again. Ela is a true professional!',
        'Very professional therapist, excellent results. My back pain is completely gone!',
        'Fantastic session, exactly what I needed after a long day of travel.',
        'Wonderful massage experience! Ela is a very skilled and attentive therapist.',
        'Perfect relaxation session in Yogyakarta. Ela exceeded all expectations!',
        'Great service and very comfortable environment. Ela is simply the best!',
        'Ela\'s massage technique is incredible. I felt completely rejuvenated and stress-free.',
        'Best therapist in Yogyakarta! Ela\'s professionalism and skill are unmatched.'
    ];
    
    // Generate reviews spread over the past 3 weeks
    for (let i = 0; i < 12; i++) {
        const rating = Math.random() > 0.15 ? 5 : 4; // 85% 5-star, 15% 4-star
        const daysAgo = Math.floor(Math.random() * 21); // Random day within 3 weeks
        
        const review = {
            id: `review_ela_${Date.now()}_${i}`,
            providerId: ELA_ID,
            providerType: 'therapist',
            userId: `user_${Date.now()}_${i}`,
            userName: names[i],
            rating: rating,
            comment: comments[i],
            location: 'Yogyakarta, Indonesia',
            createdAt: new Date(Date.now() - (daysAgo * 86400000)).toISOString(),
            isVerified: true
        };
        reviews.push(review);
    }
    
    // Sort by date (newest first)
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return reviews;
};

const reviews = generateInitialReviews();

console.log('\n✅ Generated Initial Reviews for Ela (Yogyakarta)\n');
console.log('='.repeat(60));
console.log(`Therapist: ${ELA_NAME}`);
console.log(`ID: ${ELA_ID}`);
console.log(`Total Reviews: ${reviews.length}`);
console.log(`Average Rating: ${(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ⭐`);
console.log('='.repeat(60));

console.log('\n📋 Reviews Preview:\n');
reviews.slice(0, 3).forEach((review, index) => {
    console.log(`${index + 1}. ${review.userName} - ${review.rating}⭐`);
    console.log(`   "${review.comment}"`);
    console.log(`   Date: ${new Date(review.createdAt).toLocaleDateString()}\n`);
});

console.log('\n📦 Full JSON Data:\n');
console.log(JSON.stringify(reviews, null, 2));

console.log('\n\n💡 To add these reviews to the app:');
console.log('1. Open your browser to http://localhost:3000');
console.log('2. Open Developer Console (F12)');
console.log('3. Run this command:');
console.log('\n----------------------------------------');
console.log(`const elaReviews = ${JSON.stringify(reviews)};`);
console.log(`const existingReviews = JSON.parse(localStorage.getItem('massage_app_reviews') || '[]');`);
console.log(`const mergedReviews = [...existingReviews, ...elaReviews];`);
console.log(`localStorage.setItem('massage_app_reviews', JSON.stringify(mergedReviews));`);
console.log(`console.log('✅ Added ${reviews.length} reviews for Ela!');`);
console.log(`window.location.reload();`);
console.log('----------------------------------------\n');

console.log('✨ Or simply reload the page - auto-reviews will generate them automatically!\n');

import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const BIMAN_ID = '694fa81cd8ff39b89351';

// Sample reviews for Biman
const reviews = [
    {
        customerName: 'John D.',
        rating: 5,
        comment: 'Biman is exceptional! His deep tissue massage was exactly what I needed for my chronic back pain. Very professional and skilled. Highly recommend!',
        avatar: 'https://i.pravatar.cc/150?img=11',
        date: new Date('2024-12-26').toISOString()
    },
    {
        customerName: 'Rachel T.',
        rating: 5,
        comment: 'Best massage therapist in Yogyakarta! Biman really knows his craft and was able to identify and work on my problem areas. Very satisfied!',
        avatar: 'https://i.pravatar.cc/150?img=5',
        date: new Date('2024-12-24').toISOString()
    },
    {
        customerName: 'Mark S.',
        rating: 5,
        comment: 'Outstanding service! Biman was punctual, professional, and his massage technique is top-notch. I felt amazing after the session.',
        avatar: 'https://i.pravatar.cc/150?img=13',
        date: new Date('2024-12-22').toISOString()
    },
    {
        customerName: 'Sophie L.',
        rating: 5,
        comment: 'Wonderful experience! Biman has strong hands and really knows how to work out the knots. Very attentive and professional throughout.',
        avatar: 'https://i.pravatar.cc/150?img=9',
        date: new Date('2024-12-20').toISOString()
    },
    {
        customerName: 'Daniel K.',
        rating: 5,
        comment: 'Highly skilled therapist! Biman\'s expertise in traditional and sports massage is evident. He helped me recover from a sports injury quickly.',
        avatar: 'https://i.pravatar.cc/150?img=14',
        date: new Date('2024-12-18').toISOString()
    },
    {
        customerName: 'Emma W.',
        rating: 5,
        comment: 'Absolutely fantastic! Biman was very professional and his massage technique was perfect. I felt completely relaxed and rejuvenated.',
        avatar: 'https://i.pravatar.cc/150?img=1',
        date: new Date('2024-12-16').toISOString()
    },
    {
        customerName: 'Robert M.',
        rating: 5,
        comment: 'Excellent massage! Biman has great technique and really listens to what you need. His deep pressure work is incredible.',
        avatar: 'https://i.pravatar.cc/150?img=12',
        date: new Date('2024-12-14').toISOString()
    },
    {
        customerName: 'Nina P.',
        rating: 5,
        comment: 'Best massage I\'ve had in years! Biman is very skilled and attentive. He customized the massage to my specific needs perfectly.',
        avatar: 'https://i.pravatar.cc/150?img=8',
        date: new Date('2024-12-12').toISOString()
    },
    {
        customerName: 'Thomas H.',
        rating: 5,
        comment: 'Professional and skilled! Biman\'s massage helped tremendously with my neck and shoulder tension. Will definitely book again!',
        avatar: 'https://i.pravatar.cc/150?img=15',
        date: new Date('2024-12-10').toISOString()
    },
    {
        customerName: 'Linda R.',
        rating: 5,
        comment: 'Amazing therapist! Biman is very knowledgeable and his technique is excellent. I felt so much better after just one session.',
        avatar: 'https://i.pravatar.cc/150?img=10',
        date: new Date('2024-12-08').toISOString()
    },
    {
        customerName: 'Chris B.',
        rating: 5,
        comment: 'Outstanding service from start to finish! Biman is professional, punctual, and incredibly skilled. Highly recommend him!',
        avatar: 'https://i.pravatar.cc/150?img=16',
        date: new Date('2024-12-06').toISOString()
    },
    {
        customerName: 'Julia F.',
        rating: 5,
        comment: 'Fantastic massage! Biman has a great understanding of muscle anatomy and really knows how to release tension. Very satisfied!',
        avatar: 'https://i.pravatar.cc/150?img=3',
        date: new Date('2024-12-04').toISOString()
    }
];

async function generateBimanReviews() {
    try {
        console.log('🎯 Generating reviews for Biman...\n');
        console.log(`Therapist ID: ${BIMAN_ID}\n`);
        
        for (const review of reviews) {
            try {
                const reviewData = {
                    therapistId: BIMAN_ID,
                    customerName: review.customerName,
                    rating: review.rating,
                    comment: review.comment,
                    avatar: review.avatar,
                    createdAt: review.date,
                    providerId: BIMAN_ID,
                    providerType: 'therapist',
                    status: 'approved'
                };
                
                const result = await databases.createDocument(
                    '68f76ee1000e64ca8d05',
                    '6767020d001f6bafeea2', // reviews collection ID
                    ID.unique(),
                    reviewData
                );
                
                console.log(`✅ Added review from ${review.customerName} (Rating: ${review.rating}⭐)`);
            } catch (error) {
                console.error(`❌ Failed to add review from ${review.customerName}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully generated ${reviews.length} reviews for Biman!`);
        console.log('\n📋 Next steps:');
        console.log('1. Check the reviews in Appwrite Console');
        console.log('2. Refresh your app to see the new reviews');
        console.log('3. Verify they appear on Biman\'s profile page');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

generateBimanReviews();

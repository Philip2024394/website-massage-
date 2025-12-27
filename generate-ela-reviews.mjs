import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const ELA_ID = '694fa14f54e047d47576';

// Sample reviews for Ela
const reviews = [
    {
        customerName: 'Sarah M.',
        rating: 5,
        comment: 'Ela is absolutely wonderful! Her massage technique is perfect and she really knows how to release tension. Very professional and friendly. Highly recommend!',
        avatar: 'https://i.pravatar.cc/150?img=1',
        date: new Date('2024-12-20').toISOString()
    },
    {
        customerName: 'David K.',
        rating: 5,
        comment: 'Best massage I\'ve had in Yogyakarta! Ela arrived on time, was very professional, and her deep tissue technique was exactly what I needed for my back pain.',
        avatar: 'https://i.pravatar.cc/150?img=12',
        date: new Date('2024-12-18').toISOString()
    },
    {
        customerName: 'Amanda R.',
        rating: 5,
        comment: 'Amazing experience! Ela\'s skills are top-notch. She asked about my problem areas and focused on them perfectly. I felt completely relaxed and rejuvenated afterward.',
        avatar: 'https://i.pravatar.cc/150?img=5',
        date: new Date('2024-12-15').toISOString()
    },
    {
        customerName: 'Michael T.',
        rating: 5,
        comment: 'Ela is extremely skilled and professional. She has a great understanding of anatomy and knows exactly where to apply pressure. Will definitely book again!',
        avatar: 'https://i.pravatar.cc/150?img=14',
        date: new Date('2024-12-12').toISOString()
    },
    {
        customerName: 'Lisa P.',
        rating: 5,
        comment: 'Fantastic massage! Ela was punctual, brought all her equipment, and created a very relaxing atmosphere. Her technique is excellent and I felt amazing afterwards.',
        avatar: 'https://i.pravatar.cc/150?img=9',
        date: new Date('2024-12-10').toISOString()
    },
    {
        customerName: 'James W.',
        rating: 5,
        comment: 'Highly professional and skilled therapist. Ela\'s massage helped tremendously with my shoulder tension. Great communication and perfect pressure. 5 stars!',
        avatar: 'https://i.pravatar.cc/150?img=13',
        date: new Date('2024-12-08').toISOString()
    },
    {
        customerName: 'Emma S.',
        rating: 5,
        comment: 'Ela is wonderful! Very gentle yet effective. She made me feel comfortable and relaxed throughout the entire session. The best massage experience in Yogyakarta!',
        avatar: 'https://i.pravatar.cc/150?img=10',
        date: new Date('2024-12-05').toISOString()
    },
    {
        customerName: 'Robert L.',
        rating: 5,
        comment: 'Exceptional service! Ela is extremely professional and her massage technique is outstanding. She really helped with my lower back pain. Highly recommend!',
        avatar: 'https://i.pravatar.cc/150?img=15',
        date: new Date('2024-12-02').toISOString()
    }
];

async function generateElaReviews() {
    try {
        console.log(`\n🎯 Generating ${reviews.length} reviews for Ela (ID: ${ELA_ID})...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const review of reviews) {
            try {
                await databases.createDocument(
                    '68f76ee1000e64ca8d05',
                    'therapist_reviews_id',
                    ID.unique(),
                    {
                        therapistId: ELA_ID,
                        therapistName: 'Ela',
                        customerName: review.customerName,
                        rating: review.rating,
                        comment: review.comment,
                        avatar: review.avatar,
                        createdAt: review.date,
                        approved: true,
                        location: 'Yogyakarta'
                    }
                );
                console.log(`✅ Created review from ${review.customerName}`);
                successCount++;
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`❌ Error creating review from ${review.customerName}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Successfully created: ${successCount} reviews`);
        console.log(`   ❌ Failed: ${errorCount} reviews`);
        console.log(`\n🎉 Done! Ela now has ${successCount} reviews in Yogyakarta.`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

generateElaReviews();

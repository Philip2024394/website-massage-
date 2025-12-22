import { Client, Databases, Account, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistCollectionId = '676703b40009b9dd33de';

async function createTherapistProfile() {
    try {
        console.log('🔧 Creating therapist profile for indastreet1@gmail.com...');
        
        // Create anonymous session for database access
        try {
            console.log('🔄 Creating anonymous session...');
            await account.createAnonymousSession();
            console.log('✅ Anonymous session created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Using existing anonymous session');
            } else {
                console.log('⚠️ Session error (continuing anyway):', error.message);
            }
        }

        // Check if therapist already exists
        const response = await databases.listDocuments(databaseId, therapistCollectionId);
        const existing = response.documents.find(doc => doc.email === 'indastreet1@gmail.com');
        
        if (existing) {
            console.log('✅ Therapist profile already exists!');
            console.log('   ID:', existing.$id);
            console.log('   Name:', existing.name);
            console.log('   Email:', existing.email);
            console.log('   UserID:', existing.userId);
            return;
        }
        
        console.log('📝 Creating new therapist profile...');
        
        // Create therapist document with Appwrite user ID
        const therapistData = {
            email: 'indastreet1@gmail.com',
            userId: '693cfadf000997d3cd66', // Appwrite user ID for indastreet1@gmail.com
            name: 'IndaStreet Demo Therapist',
            specialization: 'Traditional Balinese',
            yearsOfExperience: 5,
            isLicensed: true,
            location: 'Denpasar, Bali',
            status: 'active',
            verified: true,
            availableToday: true,
            category: 'therapist',
            membershipTier: 'premium',
            
            // Contact information
            phone: '+62-812-3456-7890',
            whatsapp: '+62-812-3456-7890',
            
            // Profile details
            bio: 'Experienced traditional Balinese massage therapist specializing in deep tissue and relaxation techniques.',
            description: 'Professional massage therapist with 5 years experience in traditional Balinese massage techniques.',
            profilePicture: 'https://via.placeholder.com/400x300?text=Therapist+Profile',
            
            // Location data
            coordinates: JSON.stringify({ lat: -8.6705, lng: 115.2126 }),
            city: 'Denpasar',
            
            // Services offered
            massageTypes: JSON.stringify(['Traditional Balinese', 'Deep Tissue', 'Relaxation', 'Swedish']),
            languages: JSON.stringify(['English', 'Indonesian']),
            
            // Pricing structure
            pricing: JSON.stringify({
                '60': { price: 150000, currency: 'IDR' },
                '90': { price: 200000, currency: 'IDR' },
                '120': { price: 250000, currency: 'IDR' }
            }),
            
            // Analytics data
            analytics: JSON.stringify({
                impressions: 0,
                views: 0,
                profileViews: 0,
                whatsapp_clicks: 0,
                whatsappClicks: 0,
                phone_clicks: 0,
                directions_clicks: 0,
                bookings: 25
            }),
            
            // Timestamps
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const result = await databases.createDocument(
            databaseId,
            therapistCollectionId,
            ID.unique(),
            therapistData
        );
        
        console.log('\n✅ SUCCESS! Therapist profile created:');
        console.log('   Profile ID:', result.$id);
        console.log('   Name:', result.name);
        console.log('   Email:', result.email);
        console.log('   User ID:', result.userId);
        console.log('   Status:', result.status);
        console.log('   Location:', result.location);
        console.log('');
        console.log('🎉 You can now sign in to the therapist dashboard!');
        console.log('🔗 Try: http://localhost:3001/signin');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        if (error.code === 401) {
            console.log('🔐 Authentication required. This script needs proper permissions.');
        } else if (error.code === 404) {
            console.log('🔍 Collection not found - check collection ID');
        } else if (error.code === 409) {
            console.log('📝 Document may already exist');
        }
        console.log('\n📋 ALTERNATIVE SOLUTION:');
        console.log('1. Go to: http://localhost:3001/signup');
        console.log('2. Use a NEW email address (e.g., indastreet2@gmail.com)');
        console.log('3. Complete the full signup process');
        console.log('4. This will create both account AND therapist profile');
    }
}

createTherapistProfile();
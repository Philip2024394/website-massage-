const { Client, Databases, ID } = require('node-appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

// Sample therapists with correct schema based on existing data
const sampleTherapists = [
    {
        $id: ID.unique(),
        // Required core fields
        specialization: 'Traditional Balinese',
        yearsOfExperience: 8,
        isLicensed: true,
        location: 'Denpasar, Bali',
        hourlyRate: 150000,
        name: 'Ayu Prameswari',
        id: ID.unique(),
        therapistId: ID.unique(),
        hotelId: null, // Required field
        
        // Contact info
        email: 'ayu@example.com',
        whatsappNumber: '+62812345678',
        phoneNumber: '+62812345678',
        
        // Location data
        city: 'Denpasar',
        coordinates: { lat: -8.6705, lng: 115.2126 },
        countryCode: 'ID',
        country: 'Indonesia',
        
        // Profile info
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/therapist1.jpg',
        mainImage: 'https://ik.imagekit.io/7grri5v7d/therapist1.jpg',
        description: 'Experienced Balinese massage therapist with 8 years of expertise in traditional techniques.',
        
        // Services
        massageTypes: ['Traditional Balinese', 'Deep Tissue', 'Swedish'],
        languages: ['Indonesian', 'English'],
        
        // Pricing
        pricing: { hourly: 150000 },
        price60: 150000,
        price90: 225000,
        price120: 300000,
        
        // Status
        isLive: true,
        isOnline: true,
        available: true,
        busy: false,
        status: 'available',
        
        // Analytics & ratings
        rating: 4.8,
        reviewcount: 24,
        analytics: { views: 0, bookings: 0 },
        
        // System fields
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        $id: ID.unique(),
        // Required core fields
        specialization: 'Hot Stone',
        yearsOfExperience: 12,
        isLicensed: true,
        location: 'Ubud, Bali',
        hourlyRate: 200000,
        name: 'Made Sutrisno',
        id: ID.unique(),
        therapistId: ID.unique(),
        hotelId: null, // Required field
        
        // Contact info
        email: 'made@example.com',
        whatsappNumber: '+62812345679',
        phoneNumber: '+62812345679',
        
        // Location data
        city: 'Ubud',
        coordinates: { lat: -8.5069, lng: 115.2625 },
        countryCode: 'ID',
        country: 'Indonesia',
        
        // Profile info
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/therapist2.jpg',
        mainImage: 'https://ik.imagekit.io/7grri5v7d/therapist2.jpg',
        description: 'Expert in hot stone and traditional Balinese massage with 12 years experience.',
        
        // Services
        massageTypes: ['Hot Stone', 'Traditional Balinese', 'Reflexology'],
        languages: ['Indonesian', 'English', 'Japanese'],
        
        // Pricing
        pricing: { hourly: 200000 },
        price60: 200000,
        price90: 300000,
        price120: 400000,
        
        // Status
        isLive: true,
        isOnline: true,
        available: true,
        busy: false,
        status: 'available',
        
        // Analytics & ratings
        rating: 4.9,
        reviewcount: 36,
        analytics: { views: 0, bookings: 0 },
        
        // System fields
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

async function addTestTherapists() {
    console.log('🚀 Adding test therapists...');
    
    try {
        for (const therapist of sampleTherapists) {
            try {
                const created = await databases.createDocument(
                    DATABASE_ID,
                    'therapists_collection_id',
                    therapist.$id,
                    therapist
                );
                console.log(`✅ Added therapist: ${therapist.name} in ${therapist.city}`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Therapist ${therapist.name} already exists, skipping...`);
                } else {
                    console.error(`❌ Failed to add therapist ${therapist.name}:`, error.message);
                }
            }
        }
        
        console.log('🎉 Test therapists setup completed!');
        
    } catch (error) {
        console.error('❌ Test therapists setup failed:', error.message);
        process.exit(1);
    }
}

// Run the setup
addTestTherapists();
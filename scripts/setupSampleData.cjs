const { Client, Databases, ID } = require('node-appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

// Sample therapist data
const sampleTherapists = [
    {
        $id: ID.unique(),
        name: 'Ayu Prameswari',
        email: 'ayu@example.com',
        phoneNumber: '+62812345678',
        city: 'Denpasar',
        coordinates: { lat: -8.6705, lng: 115.2126 },
        massageTypes: ['Traditional Balinese', 'Deep Tissue', 'Swedish'],
        specialization: 'Traditional Balinese', // Required field
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/therapist1.jpg',
        isActive: true,
        experience: '8 years',
        yearsOfExperience: 8, // Required field
        pricing: { hourly: 150000 },
        ratings: { average: 4.8, count: 24 },
        availability: { isAvailable: true },
        hourlyRate: 150000, // Required field
        isLicensed: true, // Required field
        therapistId: ID.unique(), // Required field
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        $id: ID.unique(),
        name: 'Made Sutrisno',
        email: 'made@example.com',
        phoneNumber: '+62812345679',
        city: 'Ubud',
        coordinates: { lat: -8.5069, lng: 115.2625 },
        massageTypes: ['Hot Stone', 'Traditional Balinese', 'Reflexology'],
        specialization: 'Hot Stone', // Required field
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/therapist2.jpg',
        isActive: true,
        experience: '12 years',
        yearsOfExperience: 12, // Required field
        pricing: { hourly: 200000 },
        ratings: { average: 4.9, count: 36 },
        availability: { isAvailable: true },
        hourlyRate: 200000, // Required field
        isLicensed: true, // Required field
        therapistId: ID.unique(), // Required field
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        $id: ID.unique(),
        name: 'Sari Dewi',
        email: 'sari@example.com',
        phoneNumber: '+62812345680',
        city: 'Seminyak',
        coordinates: { lat: -8.6882, lng: 115.1729 },
        massageTypes: ['Swedish', 'Aromatherapy', 'Pregnancy Massage'],
        specialization: 'Swedish', // Required field
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/therapist3.jpg',
        isActive: true,
        experience: '6 years',
        yearsOfExperience: 6, // Required field
        pricing: { hourly: 175000 },
        ratings: { average: 4.7, count: 18 },
        availability: { isAvailable: true },
        hourlyRate: 175000, // Required field
        isLicensed: true, // Required field
        therapistId: ID.unique(), // Required field
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Sample place data
const samplePlaces = [
    {
        $id: ID.unique(),
        name: 'Bali Healing Spa',
        email: 'info@balihealingspa.com',
        phoneNumber: '+62361234567',
        city: 'Sanur',
        coordinates: { lat: -8.6781, lng: 115.2623 },
        address: 'Jl. Danau Tamblingan 89, Sanur',
        massageTypes: ['Traditional Balinese', 'Hot Stone', 'Couple Massage'],
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/spa1.jpg',
        isActive: true,
        pricing: { massage60min: 250000, massage90min: 350000 },
        ratings: { average: 4.8, count: 42 },
        facilities: ['Private Rooms', 'Jacuzzi', 'Steam Room'],
        operatingHours: { open: '09:00', close: '21:00' },
        openingTime: '09:00', // Required field
        closingTime: '21:00', // Required field
        category: 'Spa', // Required field
        placeId: ID.unique(), // Required field
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        $id: ID.unique(),
        name: 'Zen Garden Wellness',
        email: 'contact@zengarden.com',
        phoneNumber: '+62361234568',
        city: 'Canggu',
        coordinates: { lat: -8.6482, lng: 115.1386 },
        address: 'Jl. Pantai Batu Bolong 21, Canggu',
        massageTypes: ['Deep Tissue', 'Thai Massage', 'Reflexology'],
        profilePicture: 'https://ik.imagekit.io/7grri5v7d/spa2.jpg',
        isActive: true,
        pricing: { massage60min: 200000, massage90min: 300000 },
        ratings: { average: 4.6, count: 28 },
        facilities: ['Garden Setting', 'Organic Products', 'Yoga Studio'],
        operatingHours: { open: '08:00', close: '20:00' },
        openingTime: '08:00', // Required field
        closingTime: '20:00', // Required field
        category: 'Wellness Center', // Required field
        placeId: ID.unique(), // Required field
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

async function setupSampleData() {
    console.log('🚀 Starting sample data setup...');
    
    try {
        // Add sample therapists
        console.log('📝 Adding sample therapists...');
        for (const therapist of sampleTherapists) {
            try {
                const created = await databases.createDocument(
                    DATABASE_ID,
                    'therapists_collection_id',
                    therapist.$id,
                    therapist
                );
                console.log(`✅ Added therapist: ${therapist.name}`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Therapist ${therapist.name} already exists, skipping...`);
                } else {
                    console.error(`❌ Failed to add therapist ${therapist.name}:`, error.message);
                }
            }
        }
        
        // Add sample places
        console.log('📝 Adding sample places...');
        for (const place of samplePlaces) {
            try {
                const created = await databases.createDocument(
                    DATABASE_ID,
                    'places_collection_id',
                    place.$id,
                    place
                );
                console.log(`✅ Added place: ${place.name}`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Place ${place.name} already exists, skipping...`);
                } else {
                    console.error(`❌ Failed to add place ${place.name}:`, error.message);
                }
            }
        }
        
        console.log('🎉 Sample data setup completed!');
        
    } catch (error) {
        console.error('❌ Sample data setup failed:', error.message);
        process.exit(1);
    }
}

// Run the setup
setupSampleData();
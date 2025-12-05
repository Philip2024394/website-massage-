/**
 * Seed Sample Facial Places Data to Appwrite
 * 
 * This script creates sample facial spa data for testing
 * Run: node scripts/seedFacialPlaces.cjs
 */

const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_3db08db4a50d72fb31b43c00ef46fe1a8a8af8d7be5fd60fb76fec7e9bd57fcc7b7e69f97b31d6ff67adefa12eea01ab4b77c7b68c0b88ffefda4d332b3be9fae54f5e8da86c8e01dc1d0f56fee8e6caf6a99ab831cfbf5816e3a1ada06e53c2f75c1c5dcb91a4e906330ed8a56f1bd0e2fc3dea9f26e2fd4b8e4bdc9e2bbc80'); // Replace with your API key

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'facial_places_collection';

const sampleFacialPlaces = [
    {
        facialPlaceId: 'facial_ubud_001',
        collectionName: 'facial_places',
        category: 'Luxury Spa',
        name: 'Bali Glow Facial Spa - Ubud',
        description: 'Premium facial treatments in the heart of Ubud. Specializing in anti-aging therapies, brightening treatments, and organic skincare. Our expert aestheticians use only natural, locally-sourced ingredients combined with modern techniques for radiant, youthful skin.',
        address: 'Jl. Raya Ubud No. 88, Ubud, Gianyar, Bali 80571',
        websiteurl: 'https://baliglowfacial.com',
        facialservices: JSON.stringify([
            'Deep Cleansing Facial',
            'Anti-Aging Treatment',
            'Brightening Facial',
            'Acne Treatment',
            'Hydrating Facial',
            'Organic Facial'
        ]),
        facialtypes: JSON.stringify([
            'Anti-Aging',
            'Brightening',
            'Hydrating',
            'Acne Treatment',
            'Collagen Facial',
            'Vitamin C Facial'
        ]),
        prices: JSON.stringify({
            '60': 250,
            '90': 350,
            '120': 450
        }),
        facialtimes: JSON.stringify(['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00']),
        openclosetime: '09:00 - 20:00',
        statusonline: 'live',
        discounted: false,
        starrate: '4.8',
        popularityScore: 4.8,
        averageSessionDuration: 90,
        equipmentList: JSON.stringify([
            'LED Light Therapy',
            'Microdermabrasion',
            'Oxygen Machine',
            'Ultrasonic Scrubber',
            'High Frequency Device'
        ]),
        dateadded: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
    },
    {
        facialPlaceId: 'facial_seminyak_001',
        collectionName: 'facial_places',
        category: 'Modern Spa',
        name: 'Radiance Skin Studio - Seminyak',
        description: 'Contemporary facial spa offering cutting-edge treatments. Expert in Korean skincare techniques, LED therapy, and customized facial programs. Located in trendy Seminyak with a modern, relaxing atmosphere.',
        address: 'Jl. Kayu Aya No. 45, Seminyak, Kuta, Badung, Bali 80361',
        websiteurl: 'https://radianceseminyak.com',
        facialservices: JSON.stringify([
            'Korean Facial',
            'LED Light Therapy',
            'Oxygen Facial',
            'Chemical Peel',
            'Microneedling',
            'Gold Facial'
        ]),
        facialtypes: JSON.stringify([
            'LED Light Therapy',
            'Oxygen Facial',
            'Gold Facial',
            'Chemical Peel',
            'Microdermabrasion',
            'Korean Facial'
        ]),
        prices: JSON.stringify({
            '60': 300,
            '90': 400,
            '120': 500
        }),
        facialtimes: JSON.stringify(['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00']),
        openclosetime: '10:00 - 21:00',
        statusonline: 'live',
        discounted: true,
        starrate: '4.9',
        popularityScore: 4.9,
        averageSessionDuration: 75,
        equipmentList: JSON.stringify([
            'LED Panel',
            'Oxygen Jet',
            'RF Device',
            'Cryo Facial Machine',
            'Dermapen'
        ]),
        dateadded: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
    },
    {
        facialPlaceId: 'facial_canggu_001',
        collectionName: 'facial_places',
        category: 'Organic Spa',
        name: 'Natural Beauty Haven - Canggu',
        description: 'Eco-friendly facial spa using 100% organic and natural products. Specializing in sensitive skin treatments, herbal facials, and traditional Balinese beauty rituals. Perfect for health-conscious clients seeking gentle, effective treatments.',
        address: 'Jl. Pantai Batu Bolong No. 22, Canggu, North Kuta, Badung, Bali 80351',
        websiteurl: 'https://naturalbeautycanggu.com',
        facialservices: JSON.stringify([
            'Organic Facial',
            'Herbal Treatment',
            'Sensitive Skin Care',
            'Natural Brightening',
            'Aromatherapy Facial',
            'Lulur Facial'
        ]),
        facialtypes: JSON.stringify([
            'Organic Facial',
            'Herbal Facial',
            'Sensitive Skin',
            'Lulur Facial',
            'Aromatherapy',
            'Natural Brightening'
        ]),
        prices: JSON.stringify({
            '60': 200,
            '90': 280,
            '120': 360
        }),
        facialtimes: JSON.stringify(['09:00', '11:00', '13:00', '15:00', '17:00', '19:00']),
        openclosetime: '09:00 - 20:00',
        statusonline: 'live',
        discounted: false,
        starrate: '4.7',
        popularityScore: 4.7,
        averageSessionDuration: 80,
        equipmentList: JSON.stringify([
            'Facial Steamer',
            'Hot Stone Set',
            'Aromatherapy Diffuser',
            'Natural Jade Roller',
            'Gua Sha Tools'
        ]),
        dateadded: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
    }
];

async function seedFacialPlaces() {
    console.log('🌸 Starting to seed facial places...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const place of sampleFacialPlaces) {
        try {
            const document = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                place
            );
            console.log(`✅ Created: ${place.name} (ID: ${document.$id})`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error creating ${place.name}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} facial places`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('\n✨ Seeding complete!');
}

// Run the seeder
seedFacialPlaces().catch(console.error);

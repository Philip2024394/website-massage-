const { Client, Databases, ID } = require('node-appwrite');

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_API_KEY = 'standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212';
const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'facial_places_collection';

// Uploaded image URL from Appwrite bucket
const MAIN_IMAGE_URL = 'https://syd.cloud.appwrite.io/v1/storage/buckets/6932f43700113926eb80/files/6933fa9f001092a7c897/view?project=68f23b11000d25eb3664';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

/**
 * Create facial place document
 */
async function createFacialPlace() {
    try {
        console.log('🚀 Creating facial place document...');
        console.log('   Collection:', COLLECTION_ID);
        console.log('   Database:', DATABASE_ID);
        console.log('');

        // Minimal required fields based on collection schema
        const facialPlace = {
            facialPlaceId: 'FP-' + Date.now(),
            collectionName: 'facial_places',
            category: 'spa',
            name: 'Microdermabrasion Spa Bali',
            mainImage: MAIN_IMAGE_URL,
            description: 'Premium microdermabrasion treatments with advanced technology. Experience deep exfoliation and skin rejuvenation.',
            address: 'Jl. Sunset Road No. 123, Kuta, Bali 80361',
            lastUpdate: new Date().toISOString()
        };

        console.log('📝 Document data:');
        console.log('   Name:', facialPlace.name);
        console.log('   Category:', facialPlace.category);
        console.log('   Main Image:', facialPlace.mainImage);
        console.log('');

        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            facialPlace
        );

        console.log('✅ Facial place created successfully!');
        console.log('');
        console.log('📋 Document Details:');
        console.log('   Document ID:', response.$id);
        console.log('   Name:', response.name);
        console.log('   Category:', response.category);
        console.log('   Image URL:', response.mainImage);
        console.log('');
        console.log('🎉 SUCCESS! The facial place is now in Appwrite.');
        console.log('   Refresh your browser to see it on the facial directory page.');
        console.log('');

        return response;
    } catch (error) {
        console.error('');
        console.error('❌ ERROR creating facial place:', error.message);
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response, null, 2));
        }
        console.error('');
        throw error;
    }
}

// Run the script
createFacialPlace()
    .then(() => {
        console.log('✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    });

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function discoverCollections() {
    console.log('🔍 Discovering actual collections in the database...');
    console.log('===================================================');
    console.log(`📊 Project: 68f23b11000d25eb3664`);
    console.log(`📊 Database: ${databaseId}`);
    console.log();
    
    // Common collection names to try
    const possibleCollections = [
        'therapists',
        'therapist',
        'Therapists',
        'Therapist',
        'therapists_collection',
        'therapists_collection_id',
        'places',
        'place',
        'Places',
        'Place',
        'places_collection',
        'places_collection_id',
        'bookings',
        'booking',
        'Bookings',
        'Booking',
        'bookings_collection_id',
        'reviews',
        'Reviews', 
        'review',
        'Review',
        'reviews_collection_id',
        'messages',
        'Messages',
        'message',
        'Message',
        'chat_messages',
        'ChatMessages',
        'chatMessages',
        'chat_rooms',
        'ChatRooms',
        'chatRooms',
        // More based on your config
        'Users',
        'users',
        'Notifications',
        'notifications'
    ];
    
    console.log('Testing common collection names...\n');
    
    const foundCollections = [];
    
    for (const collectionId of possibleCollections) {
        try {
            const response = await databases.listDocuments(
                databaseId,
                collectionId,
                []
            );
            
            console.log(`✅ "${collectionId}": ${response.documents.length} documents`);
            foundCollections.push({
                id: collectionId,
                count: response.documents.length,
                documents: response.documents
            });
            
            // Show sample document structure for therapists/places
            if ((collectionId.toLowerCase().includes('therapist') || collectionId.toLowerCase().includes('place')) && response.documents.length > 0) {
                const sample = response.documents[0];
                const nameField = sample.name || sample.therapistName || sample.placeName || sample.title || 'No name found';
                console.log(`   📄 Sample: ${nameField}`);
                
                if (sample.coordinate && sample.coordinate.lat) {
                    console.log(`   📍 Has coordinates: ${sample.coordinate.lat}, ${sample.coordinate.lng}`);
                }
            }
            
        } catch (error) {
            // Skip 404s silently, log other errors
            if (error.code !== 404) {
                console.log(`⚠️  "${collectionId}": ${error.message} (Code: ${error.code})`);
            }
        }
    }
    
    console.log(`\n📈 SUMMARY: Found ${foundCollections.length} accessible collections`);
    
    if (foundCollections.length > 0) {
        console.log('\n🎯 RECOMMENDED .env CONFIGURATION:');
        console.log('================================');
        
        for (const collection of foundCollections) {
            const name = collection.id;
            if (name.toLowerCase().includes('therapist')) {
                console.log(`VITE_THERAPISTS_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('place')) {
                console.log(`VITE_PLACES_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('booking')) {
                console.log(`VITE_BOOKINGS_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('review')) {
                console.log(`VITE_REVIEWS_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('message')) {
                console.log(`VITE_CHAT_MESSAGES_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('room')) {
                console.log(`VITE_CHAT_ROOMS_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('notification')) {
                console.log(`VITE_NOTIFICATIONS_COLLECTION_ID=${name}`);
            } else if (name.toLowerCase().includes('user')) {
                console.log(`VITE_USERS_COLLECTION_ID=${name}`);
            }
        }
        
        console.log('\n✅ Update your .env file with these real collection names!');
    } else {
        console.log('\n❌ No collections found. Check database permissions or API key.');
    }
}

discoverCollections().catch(console.error);
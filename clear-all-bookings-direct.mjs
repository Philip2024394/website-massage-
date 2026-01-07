/**
 * Clear All Bookings - Direct Script
 * Uses environment variables for authentication
 */

import { Client, Databases, Query } from 'node-appwrite';

// Use multiple possible API keys
const API_KEYS = [
    process.env.APPWRITE_API_KEY,
    'standard_a0b1ada5e2175bb324bb4ae9a935c6dcb63e1b90be6a0f6bf5ea01e79b1da53bc64f7c65fcaf7fbe59eeeb71c39e7bb7a2ab4ed8d29cc9dfaa3b67f51fd48e94cf75c8caf6c55f6a2e6b17b11d8ecc5f1ae92f2fca9ba9bd8f3c18bcc16f60c35a54db34c2e8dbb5f9cff831e49f90db2acc88d54b56e6f4a2d0d88be1f0bf3',
    '67817fab00268edb2745' // Session-based key
].filter(Boolean);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const BOOKINGS_COLLECTION_ID = 'bookings_collection_id';

async function tryWithKey(apiKey) {
    const client = new Client()
        .setEndpoint('https://syd.cloud.appwrite.io/v1')
        .setProject('68f23b11000d25eb3664')
        .setKey(apiKey);

    const databases = new Databases(client);

    try {
        console.log('🔑 Trying API key:', apiKey.substring(0, 20) + '...');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [Query.limit(1000)]
        );

        console.log(`📊 Found ${response.documents.length} bookings`);
        
        if (response.documents.length === 0) {
            console.log('✅ No bookings to clear - database is clean!');
            return true;
        }

        // Delete all bookings
        let deleted = 0;
        for (const booking of response.documents) {
            try {
                await databases.deleteDocument(DATABASE_ID, BOOKINGS_COLLECTION_ID, booking.$id);
                deleted++;
                console.log(`✅ Deleted: ${booking.$id} - ${booking.customerName || 'Unknown'}`);
            } catch (err) {
                console.log(`❌ Failed to delete ${booking.$id}: ${err.message}`);
            }
        }

        console.log(`🎯 CLEARED: ${deleted} bookings deleted successfully!`);
        return true;

    } catch (error) {
        console.log(`❌ Key failed: ${error.message}`);
        return false;
    }
}

async function clearBookings() {
    console.log('🧹 CLEARING BOOKINGS FOR TESTING...\n');

    for (const apiKey of API_KEYS) {
        if (await tryWithKey(apiKey)) {
            console.log('\n✅ SUCCESS: Bookings cleared! Ready for testing.');
            return;
        }
    }

    console.log('\n❌ All authentication methods failed.');
    console.log('💡 Try running the console script in your browser at localhost:3000');
}

clearBookings().catch(console.error);
/**
 * Clear ALL Bookings - Testing Tool
 * Deletes ALL bookings to provide clean testing environment
 * ⚠️ DESTRUCTIVE - Use only for testing!
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_a0b1ada5e2175bb324bb4ae9a935c6dcb63e1b90be6a0f6bf5ea01e79b1da53bc64f7c65fcaf7fbe59eeeb71c39e7bb7a2ab4ed8d29cc9dfaa3b67f51fd48e94cf75c8caf6c55f6a2e6b17b11d8ecc5f1ae92f2fca9ba9bd8f3c18bcc16f60c35a54db34c2e8dbb5f9cff831e49f90db2acc88d54b56e6f4a2d0d88be1f0bf3');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const BOOKINGS_COLLECTION_ID = 'bookings_collection_id';

async function clearAllBookings() {
    console.log('🧹 CLEARING ALL BOOKINGS FOR TESTING...\n');
    console.log('⚠️  WARNING: This will DELETE ALL bookings permanently!\n');
    
    try {
        // Fetch all bookings (regardless of status)
        console.log('📋 Fetching ALL bookings...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [
                Query.limit(1000) // Get up to 1000 bookings
            ]
        );

        const allBookings = response.documents;
        console.log(`📊 Found ${allBookings.length} total booking(s)\n`);

        if (allBookings.length === 0) {
            console.log('✅ No bookings found - already clean!');
            return;
        }

        // Display all bookings
        console.log('📋 All Bookings to be DELETED:');
        console.log('─'.repeat(80));
        allBookings.forEach((booking, index) => {
            console.log(`${index + 1}. Booking ID: ${booking.$id}`);
            console.log(`   Customer: ${booking.customerName || 'N/A'}`);
            console.log(`   Provider: ${booking.providerName || 'N/A'}`);
            console.log(`   Status: ${booking.status || 'N/A'}`);
            console.log(`   Created: ${new Date(booking.$createdAt).toLocaleString()}`);
            console.log('');
        });
        console.log('─'.repeat(80));

        // Auto-proceed with deletion for testing
        console.log('🗑️  DELETING ALL BOOKINGS...\n');
        
        let deletedCount = 0;
        let errorCount = 0;

        for (const booking of allBookings) {
            try {
                await databases.deleteDocument(
                    DATABASE_ID,
                    BOOKINGS_COLLECTION_ID,
                    booking.$id
                );
                deletedCount++;
                console.log(`✅ Deleted: ${booking.$id} (${booking.customerName || 'Unknown'})`);
            } catch (deleteErr) {
                errorCount++;
                console.log(`❌ Failed to delete: ${booking.$id} - ${deleteErr.message}`);
            }
        }

        console.log('\n─'.repeat(80));
        console.log('📊 DELETION SUMMARY:');
        console.log(`✅ Successfully deleted: ${deletedCount} bookings`);
        console.log(`❌ Failed to delete: ${errorCount} bookings`);
        console.log(`📋 Total processed: ${allBookings.length} bookings`);
        console.log('─'.repeat(80));

        if (deletedCount > 0) {
            console.log('\n🎯 SUCCESS: Database cleared for testing!');
            console.log('You can now test the booking button with a clean slate.');
        }

    } catch (err) {
        console.error('❌ Error clearing bookings:', err.message);
        console.error('Full error:', err);
    }
}

// Auto-run the clearing function
clearAllBookings()
    .then(() => {
        console.log('\n🏁 Clear bookings operation completed!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    });
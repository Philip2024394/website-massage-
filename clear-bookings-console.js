/**
 * Clear All Bookings - Console Script
 * Run this in browser console on localhost:3000 where auth is established
 * 
 * INSTRUCTIONS:
 * 1. Go to http://localhost:3000 
 * 2. Open browser console (F12)
 * 3. Paste this entire script
 * 4. Press Enter
 */

(async function clearAllBookingsConsole() {
    console.log('🧹 CLEARING ALL BOOKINGS FOR TESTING...');
    console.log('⚠️ WARNING: This will DELETE ALL bookings permanently!');
    
    try {
        // Import Appwrite from global scope (should be available on main app)
        const { Client, Databases, Query } = Appwrite;
        
        // Initialize client with same config as main app
        const client = new Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');

        const databases = new Databases(client);
        
        const DATABASE_ID = '68f76ee1000e64ca8d05';
        const BOOKINGS_COLLECTION_ID = 'bookings_collection_id';

        // Check authentication status
        const account = new Appwrite.Account(client);
        try {
            const user = await account.get();
            console.log('✅ Authenticated as:', user.email || 'Anonymous');
        } catch (authErr) {
            console.log('ℹ️ Auth status:', authErr.message);
        }

        // Fetch all bookings
        console.log('📋 Fetching all bookings...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [Query.limit(1000)]
        );

        const allBookings = response.documents;
        console.log(`📊 Found ${allBookings.length} bookings to delete`);

        if (allBookings.length === 0) {
            console.log('✅ No bookings found - database is clean!');
            return;
        }

        // Show what will be deleted
        console.log('📋 Bookings to delete:');
        allBookings.forEach((booking, index) => {
            console.log(`${index + 1}. ${booking.$id} - ${booking.customerName || 'N/A'} (${booking.status || 'N/A'})`);
        });

        // Delete all bookings
        console.log('🗑️ Starting deletion...');
        let deleted = 0;
        let failed = 0;

        for (const booking of allBookings) {
            try {
                await databases.deleteDocument(DATABASE_ID, BOOKINGS_COLLECTION_ID, booking.$id);
                deleted++;
                console.log(`✅ Deleted: ${booking.$id}`);
            } catch (err) {
                failed++;
                console.log(`❌ Failed: ${booking.$id} - ${err.message}`);
            }
        }

        console.log('─'.repeat(50));
        console.log(`🎯 SUMMARY: Deleted ${deleted}, Failed ${failed}`);
        
        if (deleted > 0) {
            console.log('✅ SUCCESS: Database cleared for testing!');
            console.log('You can now test the booking button.');
        } else {
            console.log('❌ No bookings were deleted. Check permissions.');
        }

    } catch (error) {
        console.error('❌ Script error:', error.message);
        console.error('💡 Make sure you are on localhost:3000 with Appwrite loaded');
    }
})();
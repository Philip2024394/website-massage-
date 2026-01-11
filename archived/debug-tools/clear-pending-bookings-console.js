/**
 * BROWSER CONSOLE SCRIPT - Clear Pending Bookings
 * 
 * HOW TO USE:
 * 1. Make sure you're logged in as admin (indastreet1@gmail.com)
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire file
 * 4. Press Enter
 * 5. Choose action when prompted
 */

(async function clearPendingBookings() {
    console.log('🧹 CLEAR PENDING BOOKINGS TOOL\n');
    
    // Check if Appwrite is loaded
    if (typeof window.appwriteSdk === 'undefined') {
        console.error('❌ Appwrite SDK not loaded. Make sure you\'re on the app page.');
        return;
    }

    const { databases } = window.appwriteSdk;
    const DATABASE_ID = '68f76ee1000e64ca8d05';
    const BOOKINGS_COLLECTION_ID = 'bookings_collection_id';

    try {
        // Fetch pending bookings
        console.log('📋 Fetching pending bookings...');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [
                window.appwriteSdk.Query.equal('status', 'Pending'),
                window.appwriteSdk.Query.limit(100)
            ]
        );

        const pendingBookings = response.documents;
        console.log(`\n📊 Found ${pendingBookings.length} pending booking(s)\n`);

        if (pendingBookings.length === 0) {
            console.log('✅ No pending bookings to clear!');
            return;
        }

        // Display bookings
        console.log('📋 PENDING BOOKINGS:');
        console.log('─'.repeat(80));
        pendingBookings.forEach((booking, index) => {
            console.log(`${index + 1}. ID: ${booking.$id}`);
            console.log(`   Customer: ${booking.customerName || 'N/A'} (${booking.customerWhatsApp || 'N/A'})`);
            console.log(`   Provider: ${booking.providerName || 'N/A'}`);
            console.log(`   Duration: ${booking.duration || 'N/A'} min | Price: ${booking.price || 'N/A'}K`);
            console.log(`   Created: ${new Date(booking.createdAt).toLocaleString()}`);
            console.log('');
        });
        console.log('─'.repeat(80));

        // Prompt for action
        const action = prompt(
            `Found ${pendingBookings.length} pending booking(s).\n\n` +
            'Choose action:\n' +
            '1 = DELETE all (permanent)\n' +
            '2 = CANCEL all (recommended)\n' +
            '3 = Cancel specific booking by number\n' +
            'Any other = Exit\n\n' +
            'Enter choice:'
        );

        if (action === '1') {
            // DELETE
            const confirm = prompt(`⚠️ DELETE ${pendingBookings.length} bookings PERMANENTLY?\nType "DELETE" to confirm:`);
            if (confirm !== 'DELETE') {
                console.log('❌ Cancelled - safety check failed');
                return;
            }

            console.log('\n🗑️  DELETING pending bookings...');
            let count = 0;
            
            for (const booking of pendingBookings) {
                try {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        BOOKINGS_COLLECTION_ID,
                        booking.$id
                    );
                    console.log(`✅ Deleted: ${booking.customerName} - ${booking.$id}`);
                    count++;
                } catch (error) {
                    console.error(`❌ Failed: ${booking.$id}`, error.message);
                }
            }
            
            console.log(`\n✅ DELETED ${count}/${pendingBookings.length} booking(s)`);

        } else if (action === '2') {
            // CANCEL ALL
            console.log('\n🚫 CANCELLING all pending bookings...');
            let count = 0;
            
            for (const booking of pendingBookings) {
                try {
                    await databases.updateDocument(
                        DATABASE_ID,
                        BOOKINGS_COLLECTION_ID,
                        booking.$id,
                        {
                            status: 'Cancelled',
                            cancelledAt: new Date().toISOString(),
                            cancelledBy: 'admin-console'
                        }
                    );
                    console.log(`✅ Cancelled: ${booking.customerName} - ${booking.$id}`);
                    count++;
                } catch (error) {
                    console.error(`❌ Failed: ${booking.$id}`, error.message);
                }
            }
            
            console.log(`\n✅ CANCELLED ${count}/${pendingBookings.length} booking(s)`);

        } else if (action === '3') {
            // CANCEL SPECIFIC
            const bookingNum = parseInt(prompt('Enter booking number (1-' + pendingBookings.length + '):'));
            
            if (isNaN(bookingNum) || bookingNum < 1 || bookingNum > pendingBookings.length) {
                console.log('❌ Invalid booking number');
                return;
            }

            const booking = pendingBookings[bookingNum - 1];
            
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    BOOKINGS_COLLECTION_ID,
                    booking.$id,
                    {
                        status: 'Cancelled',
                        cancelledAt: new Date().toISOString(),
                        cancelledBy: 'admin-console'
                    }
                );
                console.log(`\n✅ Cancelled booking: ${booking.customerName} - ${booking.$id}`);
            } catch (error) {
                console.error(`\n❌ Failed to cancel:`, error.message);
            }

        } else {
            console.log('\n👋 Exited without changes');
            return;
        }

        console.log('\n✅ Done! You can now create new test bookings.');
        console.log('💡 Refresh the page if needed.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 401 || error.message.includes('authorized')) {
            console.error('\n💡 Make sure you\'re logged in as admin (indastreet1@gmail.com)');
        }
    }
})();

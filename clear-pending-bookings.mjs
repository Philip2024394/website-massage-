/**
 * Clear Pending Bookings - Development Tool
 * Deletes or updates all pending bookings to allow testing
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_a0b1ada5e2175bb324bb4ae9a935c6dcb63e1b90be6a0f6bf5ea01e79b1da53bc64f7c65fcaf7fbe59eeeb71c39e7bb7a2ab4ed8d29cc9dfaa3b67f51fd48e94cf75c8caf6c55f6a2e6b17b11d8ecc5f1ae92f2fca9ba9bd8f3c18bcc16f60c35a54db34c2e8dbb5f9cff831e49f90db2acc88d54b56e6f4a2d0d88be1f0bf3');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const BOOKINGS_COLLECTION_ID = 'bookings_collection_id';

async function clearPendingBookings() {
    console.log('🧹 Clearing pending bookings...\n');
    
    try {
        // Fetch all pending bookings
        console.log('📋 Fetching pending bookings...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [
                Query.equal('status', 'Pending'),
                Query.limit(100)
            ]
        );

        const pendingBookings = response.documents;
        console.log(`📊 Found ${pendingBookings.length} pending booking(s)\n`);

        if (pendingBookings.length === 0) {
            console.log('✅ No pending bookings to clear!');
            return;
        }

        // Display pending bookings
        console.log('📋 Pending Bookings:');
        console.log('─'.repeat(80));
        pendingBookings.forEach((booking, index) => {
            console.log(`${index + 1}. Booking ID: ${booking.$id}`);
            console.log(`   Customer: ${booking.customerName || 'N/A'}`);
            console.log(`   WhatsApp: ${booking.customerWhatsApp || 'N/A'}`);
            console.log(`   Provider: ${booking.providerName || 'N/A'}`);
            console.log(`   Created: ${booking.createdAt || 'N/A'}`);
            console.log(`   Status: ${booking.status}`);
            console.log('');
        });
        console.log('─'.repeat(80));

        // Choose action
        console.log('\n🔧 Choose action:');
        console.log('1. DELETE all pending bookings (permanent)');
        console.log('2. CANCEL all pending bookings (change status to "Cancelled")');
        console.log('3. EXIT without changes');
        
        const action = process.argv[2] || '2'; // Default to cancel if no argument
        
        if (action === '1') {
            // DELETE bookings
            console.log('\n🗑️  DELETING all pending bookings...');
            let deletedCount = 0;
            
            for (const booking of pendingBookings) {
                try {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        BOOKINGS_COLLECTION_ID,
                        booking.$id
                    );
                    console.log(`✅ Deleted: ${booking.$id}`);
                    deletedCount++;
                } catch (error) {
                    console.error(`❌ Failed to delete ${booking.$id}:`, error.message);
                }
            }
            
            console.log(`\n✅ Deleted ${deletedCount}/${pendingBookings.length} booking(s)`);
            
        } else if (action === '2') {
            // CANCEL bookings
            console.log('\n🚫 CANCELLING all pending bookings...');
            let cancelledCount = 0;
            
            for (const booking of pendingBookings) {
                try {
                    await databases.updateDocument(
                        DATABASE_ID,
                        BOOKINGS_COLLECTION_ID,
                        booking.$id,
                        {
                            status: 'Cancelled',
                            cancelledAt: new Date().toISOString(),
                            cancelledBy: 'admin-script'
                        }
                    );
                    console.log(`✅ Cancelled: ${booking.$id}`);
                    cancelledCount++;
                } catch (error) {
                    console.error(`❌ Failed to cancel ${booking.$id}:`, error.message);
                }
            }
            
            console.log(`\n✅ Cancelled ${cancelledCount}/${pendingBookings.length} booking(s)`);
            
        } else {
            console.log('\n👋 Exiting without changes...');
            return;
        }

        console.log('\n✅ Done! You can now create new test bookings.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 401) {
            console.error('\n💡 Tip: Make sure your APPWRITE_API_KEY is set correctly');
        }
    }
}

// Show usage if --help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node clear-pending-bookings.mjs [action]

Actions:
  1 - DELETE all pending bookings (permanent)
  2 - CANCEL all pending bookings (default - changes status to "Cancelled")
  3 - EXIT without changes

Examples:
  node clear-pending-bookings.mjs         # Cancel pending bookings
  node clear-pending-bookings.mjs 1       # Delete pending bookings
  node clear-pending-bookings.mjs 2       # Cancel pending bookings
  node clear-pending-bookings.mjs 3       # Exit without changes
    `);
    process.exit(0);
}

clearPendingBookings();

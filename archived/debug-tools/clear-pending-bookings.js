/**
 * TESTING UTILITY: Clear All Pending Bookings
 * 
 * This script clears all pending bookings from:
 * 1. Appwrite database (bookings collection)
 * 2. Local storage (pending_booking items)
 * 3. Session storage (pending booking locks)
 * 
 * Use this for testing when you need to reset booking state
 */

import { databases } from './lib/appwrite';
import { APPWRITE_CONFIG } from './lib/appwrite.config';
import { Query } from 'appwrite';

async function clearAllPendingBookings() {
    console.log('🧹 Starting to clear all pending bookings...');
    
    try {
        // 1. Clear from Appwrite database
        console.log('📋 Fetching all pending bookings from database...');
        
        const pendingBookings = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings || 'bookings',
            [
                Query.equal('status', 'Pending'),
                Query.limit(100) // Get up to 100 pending bookings
            ]
        );

        console.log(`📊 Found ${pendingBookings.documents.length} pending bookings`);

        // Delete each pending booking
        for (const booking of pendingBookings.documents) {
            try {
                await databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings || 'bookings',
                    booking.$id
                );
                console.log(`✅ Deleted booking: ${booking.$id} (${booking.customerName || 'Unknown'})`);
            } catch (deleteError) {
                console.error(`❌ Failed to delete booking ${booking.$id}:`, deleteError);
            }
        }

        // 2. Clear local storage
        console.log('🧽 Clearing local storage...');
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('pending_booking');
            console.log('✅ Cleared localStorage pending_booking');
        }

        // 3. Clear session storage
        console.log('🧽 Clearing session storage...');
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('pending_booking');
            console.log('✅ Cleared sessionStorage pending_booking');
        }

        console.log('🎉 All pending bookings cleared successfully!');
        console.log('🔄 You can now test booking functionality freely.');
        
        return {
            success: true,
            deletedCount: pendingBookings.documents.length,
            message: `Cleared ${pendingBookings.documents.length} pending bookings`
        };

    } catch (error) {
        console.error('❌ Error clearing pending bookings:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to clear pending bookings'
        };
    }
}

// Export for use in other files
export { clearAllPendingBookings };

// If running directly in console, execute immediately
if (typeof window !== 'undefined') {
    // Make function available globally for console testing
    window.clearAllPendingBookings = clearAllPendingBookings;
    console.log('💡 Run clearAllPendingBookings() in browser console to clear all pending bookings');
}
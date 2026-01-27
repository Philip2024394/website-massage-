import { databases, account } from '../lib/appwrite';
import { Query } from 'appwrite';
import { sessionCache } from '../lib/sessionCache';
import { VALIDATED_COLLECTIONS, DATABASE_ID } from '../lib/appwrite-collection-validator';

class BookingExpirationService {
  private intervalId: NodeJS.Timeout | null = null;
  private checkIntervalMs = 60000; // Check every minute

  start() {
    if (this.intervalId) {
      console.log('Booking expiration service already running');
      return;
    }

    console.log('Starting booking expiration service...');
    this.checkExpiredBookings(); // Run immediately
    this.intervalId = setInterval(() => {
      this.checkExpiredBookings();
    }, this.checkIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Booking expiration service stopped');
    }
  }

  private async checkExpiredBookings() {
    try {
      // Check cache first to avoid repeated 401 errors
      const cached = sessionCache.get();
      if (cached && !cached.hasSession) {
        // No session cached - skip
        return;
      }

      // Check if user is already logged in
      // Note: Anonymous sessions are disabled in this project
      try {
        const currentUser = cached?.hasSession ? cached.user : await account.get();
        if (!cached?.hasSession) {
          sessionCache.set(true, currentUser);
        }
        console.log('✅ Using existing user session for booking checks:', currentUser.email);
      } catch {
        // No authenticated session - cache this and skip booking checks
        sessionCache.setNoSession();
        return;
      }

      const now = new Date().toISOString();
      
      // ✅ Use validated collection ID (blocks numeric hashes)
      const bookingsCollectionId = VALIDATED_COLLECTIONS.bookings;
      console.log('🔍 Checking expired bookings with collection ID:', bookingsCollectionId);

      // Query for pending bookings only (responseDeadline field doesn't exist in schema)
      const expiredBookings = await databases.listDocuments(
        DATABASE_ID,
        bookingsCollectionId,
        [
          Query.equal('status', 'pending')
          // Note: responseDeadline query removed - field not in schema
        ]
      );

      if (expiredBookings.documents.length > 0) {
        console.log(`Found ${expiredBookings.documents.length} expired booking(s)`);

        for (const booking of expiredBookings.documents) {
          await this.handleExpiredBooking(booking);
        }
      }
    } catch (error) {
      console.error('Error checking expired bookings:', error);
    }
  }

  private async handleExpiredBooking(booking: any) {
    try {
      console.log(`⏰ Handling expired booking: ${booking.$id}`);
      console.log(`📋 Booking details:`, {
        id: booking.$id,
        therapistId: booking.therapistId,
        therapistType: booking.therapistType,
        status: booking.status,
        createdAt: booking.createdAt
      });

      // Validate booking data
      if (!booking.$id) {
        console.error('❌ Invalid booking - missing ID');
        return;
      }

      if (booking.status === 'expired') {
        console.log(`ℹ️ Booking ${booking.$id} already marked as expired`);
        return;
      }

      // Update booking status to expired
      await databases.updateDocument(
        DATABASE_ID,
        VALIDATED_COLLECTIONS.bookings,
        booking.$id,
        {
          status: 'expired'
          // Note: No expiredAt field - we use createdAt + timeout to track expiration
        }
      );

      console.log(`✅ Marked booking ${booking.$id} as expired`);

      // Release the provider (therapist or place) if they're still marked as busy with this booking
      try {
        // Validate provider ID exists and is not null/undefined
        if (!booking.therapistId || booking.therapistId === 'null' || booking.therapistId === 'undefined') {
          console.log(`⚠️ Skipping provider release - invalid provider ID: ${booking.therapistId}`);
          return;
        }

        // Determine which collection to use based on therapistType
        const isTherapist = booking.therapistType === 'therapist';
        const isPlace = booking.therapistType === 'place';
        
        if (!isTherapist && !isPlace) {
          console.log(`⚠️ Unknown therapistType: ${booking.therapistType} for booking ${booking.$id}`);
          return;
        }

        const collectionId = isTherapist ? 
          VALIDATED_COLLECTIONS.therapists : 
          VALIDATED_COLLECTIONS.places;

        console.log(`🔍 Releasing ${booking.therapistType} ${booking.therapistId} from expired booking`);

        const provider = await databases.getDocument(
          DATABASE_ID,
          collectionId,
          booking.therapistId
        );

        if (provider.currentBookingId === booking.$id) {
          await databases.updateDocument(
            DATABASE_ID,
            collectionId,
            booking.therapistId,
            {
              status: 'Available',
              currentBookingId: null
            }
          );
          console.log(`✅ Released ${booking.therapistType} ${booking.therapistId} from expired booking`);
        } else {
          console.log(`ℹ️ ${booking.therapistType} ${booking.therapistId} was not assigned to this booking`);
        }
      } catch (error: any) {
        if (error.code === 404) {
          console.log(`⚠️ ${booking.therapistType || 'Provider'} ${booking.therapistId} not found - may have been deleted`);
        } else {
          console.error(`❌ Error releasing ${booking.therapistType || 'provider'} ${booking.therapistId}:`, error);
        }
      }

      // Broadcast to all available therapists
      await this.broadcastBookingToAll(booking);

    } catch (error) {
      console.error(`Error handling expired booking ${booking.$id}:`, error);
    }
  }

  private async broadcastBookingToAll(booking: any) {
    try {
      console.log(`🔍 Broadcasting booking ${booking.$id} to ALL therapists (Available AND Busy)...`);
      
      // Get ALL therapists with status Available OR Busy (exclude Closed/Restricted)
      const eligibleTherapists = await databases.listDocuments(
        DATABASE_ID,
        VALIDATED_COLLECTIONS.therapists,
        [Query.or([
          Query.equal('status', 'Available'),
          Query.equal('status', 'Busy')
        ])]
      );

      // Also get total therapist count for debugging
      const totalTherapists = await databases.listDocuments(
        DATABASE_ID,
        VALIDATED_COLLECTIONS.therapists,
        []
      );

      console.log(`📊 Therapist Status: ${eligibleTherapists.documents.length} eligible (Available + Busy) out of ${totalTherapists.documents.length} total`);

      if (eligibleTherapists.documents.length === 0) {
        console.log('⚠️ No eligible therapists to broadcast to - all therapists may be offline or restricted');
        return;
      }

      console.log(`📢 Broadcasting expired booking ${booking.$id} to ${eligibleTherapists.documents.length} therapist(s) - FIRST TO ACCEPT GETS THE BOOKING`);

      // In a real app, you'd send WhatsApp messages or notifications here
      // For now, we'll just log it
      for (const therapist of eligibleTherapists.documents) {
        console.log(`📱 Notifying therapist ${therapist.$id}: ${therapist.name} (Status: ${therapist.status})`);
        // TODO: Implement actual WhatsApp/notification sending
        // Example: sendWhatsAppMessage(therapist.phone, message);
      }

      // Update booking to indicate it was broadcast
      await databases.updateDocument(
        DATABASE_ID,
        VALIDATED_COLLECTIONS.bookings,
        booking.$id,
        {
          broadcast: true,
          broadcastAt: new Date().toISOString(),
          broadcastCount: eligibleTherapists.documents.length
        }
      );

    } catch (error) {
      console.error('Error broadcasting booking:', error);
    }
  }
}

export const bookingExpirationService = new BookingExpirationService();

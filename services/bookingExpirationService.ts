import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

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
      const now = new Date().toISOString();

      // Query for pending bookings with expired deadlines
      const expiredBookings = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        [
          Query.equal('status', 'pending'),
          Query.lessThan('responseDeadline', now)
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
      console.log(`Handling expired booking: ${booking.$id}`);

      // Update booking status to expired
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        booking.$id,
        {
          status: 'expired',
          expiredAt: new Date().toISOString()
        }
      );

      // Release the original therapist if they're still marked as busy with this booking
      try {
        const therapist = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.therapists,
          booking.therapistId
        );

        if (therapist.currentBookingId === booking.$id) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            booking.therapistId,
            {
              status: 'Available',
              currentBookingId: null
            }
          );
        }
      } catch (error) {
        console.error(`Error releasing therapist ${booking.therapistId}:`, error);
      }

      // Broadcast to all available therapists
      await this.broadcastBookingToAll(booking);

    } catch (error) {
      console.error(`Error handling expired booking ${booking.$id}:`, error);
    }
  }

  private async broadcastBookingToAll(booking: any) {
    try {
      // Get all available therapists
      const availableTherapists = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.therapists,
        [Query.equal('status', 'Available')]
      );

      if (availableTherapists.documents.length === 0) {
        console.log('No available therapists to broadcast to');
        return;
      }

      console.log(`Broadcasting booking ${booking.$id} to ${availableTherapists.documents.length} therapist(s)`);

      // In a real app, you'd send WhatsApp messages or notifications here
      // For now, we'll just log it
      for (const therapist of availableTherapists.documents) {
        console.log(`Notifying therapist ${therapist.$id}: ${therapist.name}`);
        // TODO: Implement actual WhatsApp/notification sending
        // Example: sendWhatsAppMessage(therapist.phone, message);
      }

      // Update booking to indicate it was broadcast
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        booking.$id,
        {
          broadcast: true,
          broadcastAt: new Date().toISOString(),
          broadcastCount: availableTherapists.documents.length
        }
      );

    } catch (error) {
      console.error('Error broadcasting booking:', error);
    }
  }
}

export const bookingExpirationService = new BookingExpirationService();

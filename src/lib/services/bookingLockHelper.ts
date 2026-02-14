/**
 * Helpers for place/therapist booking lock: prevent other users from starting
 * a new booking while one is in progress (PENDING, response deadline not yet passed).
 */

import { databases } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { Query } from 'appwrite';

// Schema uses 'pending_accept' (booking.service.appwrite) or 'pending' (lifecycle); check both via two queries if needed.
const PENDING_STATUSES = ['pending_accept', 'pending'];

/**
 * Returns true if the provider (therapist or place) has an active PENDING booking
 * whose response deadline has not yet passed. Used to lock the place so only one
 * customer can be in the 5-minute booking flow at a time.
 */
export async function hasActivePendingBookingForProvider(providerId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    for (const status of PENDING_STATUSES) {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [
          Query.equal('therapistId', providerId),
          Query.equal('status', status),
          Query.greaterThan('responseDeadline', now),
          Query.limit(1),
        ]
      );
      if ((result.documents?.length ?? 0) > 0) return true;
    }
    return false;
  } catch (err) {
    console.warn('[BookingLockHelper] hasActivePendingBookingForProvider failed', { providerId, err });
    return false; // fail open: allow booking on error
  }
}

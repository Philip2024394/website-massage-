/**
 * Syncs therapist profile status with active booking countdown.
 * When the 5-minute response countdown starts, therapist is set to Busy so others
 * don't book the same slot. When the booking is accepted, declined, or expired,
 * status is set back to Available.
 * Called from PersistentChatProvider only; not from bookingLifecycleService.
 */

import { therapistService } from '../lib/appwriteService';
import { logger } from './logger';

/**
 * Set therapist status to Busy when the 5-minute countdown has started (booking created, PENDING).
 * Fire-and-forget; errors are logged only.
 */
export function setTherapistBusyForCountdown(therapistId: string): void {
  if (!therapistId) return;
  therapistService
    .update(therapistId, { status: 'busy', availability: 'Busy' })
    .then(() => {
      logger.debug('[TherapistStatus] Set therapist to Busy for countdown', { therapistId });
    })
    .catch((err) => {
      logger.warn('[TherapistStatus] Failed to set therapist Busy', { therapistId, error: err });
    });
}

/**
 * Set therapist status back to Available after booking ends (accepted, declined, or expired).
 * Fire-and-forget; errors are logged only.
 */
export function setTherapistAvailableAfterBooking(therapistId: string): void {
  if (!therapistId) return;
  therapistService
    .update(therapistId, { status: 'available', availability: 'Available' })
    .then(() => {
      logger.debug('[TherapistStatus] Set therapist to Available after booking', { therapistId });
    })
    .catch((err) => {
      logger.warn('[TherapistStatus] Failed to set therapist Available', { therapistId, error: err });
    });
}

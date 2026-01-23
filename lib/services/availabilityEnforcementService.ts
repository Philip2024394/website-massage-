/**
 * 🔒 AVAILABILITY ENFORCEMENT SERVICE
 * Strict enforcement of therapist availability rules
 * 
 * Account Statuses:
 * - AVAILABLE: Can accept Book Now and Scheduled bookings
 * - BUSY: Can accept Scheduled bookings only (NOT Book Now)
 * - CLOSED: Can accept Scheduled bookings only (NOT Book Now)
 * - RESTRICTED: Cannot accept ANY bookings
 * 
 * Rules are enforced at both UI and API level - NO OVERRIDE ALLOWED
 */

import { BookingType } from './bookingLifecycleService';

// ============================================================================
// THERAPIST AVAILABILITY STATUS ENUM
// ============================================================================

export enum TherapistAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',    // Can accept all booking types
  BUSY = 'BUSY',              // Scheduled only - NO Book Now
  CLOSED = 'CLOSED',          // Scheduled only - NO Book Now
  RESTRICTED = 'RESTRICTED',  // Cannot accept ANY bookings
}

// ============================================================================
// AVAILABILITY CHECK RESULT
// ============================================================================

export interface AvailabilityCheckResult {
  allowed: boolean;
  reason?: string;
  userMessage?: string;
  allowScheduled?: boolean;
}

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================

const SYSTEM_MESSAGES = {
  BUSY_BOOK_NOW: `⚠️ This therapist is currently BUSY and not available for Book Now.

Please check back later or search for another therapist with GREEN "Available" status.

You may also place a scheduled booking instead.`,

  CLOSED_BOOK_NOW: `⚠️ This therapist is currently OFFLINE and not available for Book Now.

Please check back later or search for another therapist with GREEN "Available" status.

You may also place a scheduled booking instead.`,

  RESTRICTED: `⚠️ This therapist is not in service and cannot accept any bookings at this time.

Please search for another therapist with GREEN "Available" status.`,

  INVALID_STATUS: `⚠️ Unable to verify therapist availability.
Please try again later or select another therapist.`,
};

// ============================================================================
// AVAILABILITY ENFORCEMENT SERVICE
// ============================================================================

export const availabilityEnforcementService = {
  /**
   * Check if a booking type is allowed for a given availability status
   * @param availabilityStatus - The therapist's current availability status
   * @param bookingType - The type of booking being attempted
   * @returns AvailabilityCheckResult with allowed status and messages
   */
  canBook(
    availabilityStatus: TherapistAvailabilityStatus | string | undefined,
    bookingType: BookingType
  ): AvailabilityCheckResult {
    // Normalize status to uppercase
    const status = (availabilityStatus || '').toUpperCase() as TherapistAvailabilityStatus;
    
    // Handle RESTRICTED - cannot accept ANY bookings
    if ((status as any) === TherapistAvailabilityStatus.RESTRICTED) {
      return {
        allowed: false,
        reason: 'RESTRICTED_STATUS',
        userMessage: SYSTEM_MESSAGES.RESTRICTED,
        allowScheduled: false,
      };
    }

    // Handle BOOK_NOW requests
    if (bookingType === BookingType.BOOK_NOW) {
      // BUSY - cannot accept Book Now
      if (status === TherapistAvailabilityStatus.BUSY) {
        return {
          allowed: false,
          reason: 'BUSY_BOOK_NOW_BLOCKED',
          userMessage: SYSTEM_MESSAGES.BUSY_BOOK_NOW,
          allowScheduled: true,
        };
      }

      // CLOSED - cannot accept Book Now
      if (status === TherapistAvailabilityStatus.CLOSED) {
        return {
          allowed: false,
          reason: 'CLOSED_BOOK_NOW_BLOCKED',
          userMessage: SYSTEM_MESSAGES.CLOSED_BOOK_NOW,
          allowScheduled: true,
        };
      }

      // AVAILABLE - can accept Book Now
      if (status === TherapistAvailabilityStatus.AVAILABLE) {
        return {
          allowed: true,
          allowScheduled: true,
        };
      }

      // Legacy/unmapped status - treat as BUSY for safety
      // This prevents unknown statuses from bypassing enforcement
      if (!Object.values(TherapistAvailabilityStatus).includes(status as TherapistAvailabilityStatus)) {
        console.warn(`⚠️ [AvailabilityEnforcement] Unknown status "${availabilityStatus}" - treating as BUSY`);
        return {
          allowed: false,
          reason: 'UNKNOWN_STATUS_BLOCKED',
          userMessage: SYSTEM_MESSAGES.BUSY_BOOK_NOW,
          allowScheduled: true,
        };
      }
    }

    // Handle SCHEDULED requests
    if (bookingType === BookingType.SCHEDULED) {
      // RESTRICTED still blocked for scheduled
      if ((status as any) === TherapistAvailabilityStatus.RESTRICTED) {
        return {
          allowed: false,
          reason: 'RESTRICTED_SCHEDULED_BLOCKED',
          userMessage: SYSTEM_MESSAGES.RESTRICTED,
          allowScheduled: false,
        };
      }

      // BUSY, CLOSED, AVAILABLE - all can accept scheduled
      return {
        allowed: true,
        allowScheduled: true,
      };
    }

    // Default: Allow (should not reach here)
    return { allowed: true, allowScheduled: true };
  },

  /**
   * Quick check if Book Now is allowed
   */
  canBookNow(availabilityStatus: TherapistAvailabilityStatus | string | undefined): boolean {
    return this.canBook(availabilityStatus, BookingType.BOOK_NOW).allowed;
  },

  /**
   * Quick check if Scheduled booking is allowed
   */
  canSchedule(availabilityStatus: TherapistAvailabilityStatus | string | undefined): boolean {
    return this.canBook(availabilityStatus, BookingType.SCHEDULED).allowed;
  },

  /**
   * Get appropriate user message for blocked booking
   */
  getBlockedMessage(
    availabilityStatus: TherapistAvailabilityStatus | string | undefined,
    bookingType: BookingType
  ): string {
    const result = this.canBook(availabilityStatus, bookingType);
    return result.userMessage || SYSTEM_MESSAGES.INVALID_STATUS;
  },

  /**
   * Map legacy status strings to TherapistAvailabilityStatus
   */
  normalizeStatus(status: string | undefined): TherapistAvailabilityStatus {
    if (!status) return TherapistAvailabilityStatus.AVAILABLE;
    
    const upperStatus = status.toUpperCase().trim();
    
    // Direct matches
    if (upperStatus === 'AVAILABLE' || upperStatus === 'ONLINE' || upperStatus === 'ACTIVE') {
      return TherapistAvailabilityStatus.AVAILABLE;
    }
    if (upperStatus === 'BUSY' || upperStatus === 'IN_SERVICE' || upperStatus === 'OCCUPIED') {
      return TherapistAvailabilityStatus.BUSY;
    }
    if (upperStatus === 'CLOSED' || upperStatus === 'OFFLINE' || upperStatus === 'INACTIVE') {
      return TherapistAvailabilityStatus.CLOSED;
    }
    if (upperStatus === 'RESTRICTED' || upperStatus === 'BLOCKED' || upperStatus === 'SUSPENDED') {
      return TherapistAvailabilityStatus.RESTRICTED;
    }

    // Default to AVAILABLE for unknown statuses (legacy compatibility)
    console.warn(`⚠️ [AvailabilityEnforcement] Unmapped status "${status}" - defaulting to AVAILABLE`);
    return TherapistAvailabilityStatus.AVAILABLE;
  },

  /**
   * Validate booking request at API level
   * Returns true if allowed, throws error if blocked
   */
  validateBookingRequest(
    therapistStatus: TherapistAvailabilityStatus | string | undefined,
    bookingType: BookingType
  ): void {
    const result = this.canBook(therapistStatus, bookingType);
    
    if (!result.allowed) {
      const error = new Error(result.userMessage || 'Booking not allowed');
      (error as any).code = 'AVAILABILITY_BLOCKED';
      (error as any).reason = result.reason;
      (error as any).allowScheduled = result.allowScheduled;
      throw error;
    }
  },
};

// ============================================================================
// RE-EXPORT FOR CONVENIENCE
// ============================================================================

export default availabilityEnforcementService;


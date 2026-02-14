/**
 * BOOKING STATUS CONSTANTS - Appwrite Schema Alignment ⚡
 * 
 * These values MUST match Appwrite collection validation rules
 * for the 'status' field in the bookings collection.
 * 
 * ❌ NEVER use arbitrary status values like 'pending'
 * ✅ ALWAYS use these enum values
 */
export const BOOKING_STATUS = {
  IDLE: 'idle',
  REGISTERING: 'registering', 
  SEARCHING: 'searching',
  PENDING_ACCEPT: 'pending_accept',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

/**
 * Default status for new booking creation
 * Use this when creating bookings that need therapist acceptance
 */
export const DEFAULT_BOOKING_STATUS = BOOKING_STATUS.PENDING_ACCEPT;

/**
 * Status for bookings that are confirmed but therapist is being searched
 * Use this when customer has submitted booking but no therapist assigned yet  
 */
export const SEARCHING_BOOKING_STATUS = BOOKING_STATUS.SEARCHING;

/**
 * Scheduled booking: therapist/place has this many minutes to Accept/Reject (per SCHEDULED_BOOKING_FLOW_SPEC).
 * BOOK_NOW uses 5 minutes elsewhere.
 */
export const SCHEDULED_RESPONSE_MINUTES = 30;

/**
 * Normalize booking status to valid Appwrite enum value
 * Maps legacy/invalid statuses to valid ones
 * 
 * @param status - Raw status string (may be invalid)
 * @returns Valid BookingStatus enum value
 */
export function normalizeBookingStatus(status: string | undefined | null): BookingStatus {
  if (!status) return BOOKING_STATUS.PENDING_ACCEPT;
  
  const normalized = status.toLowerCase().trim();
  
  // Map legacy/invalid statuses to valid ones
  const statusMap: Record<string, BookingStatus> = {
    'pending': BOOKING_STATUS.PENDING_ACCEPT,
    'pending_accept': BOOKING_STATUS.PENDING_ACCEPT,
    'requested': BOOKING_STATUS.PENDING_ACCEPT,
    'idle': BOOKING_STATUS.IDLE,
    'registering': BOOKING_STATUS.REGISTERING,
    'searching': BOOKING_STATUS.SEARCHING,
    'active': BOOKING_STATUS.ACTIVE,
    'confirmed': BOOKING_STATUS.ACTIVE,
    'cancelled': BOOKING_STATUS.CANCELLED,
    'completed': BOOKING_STATUS.COMPLETED,
  };
  
  const validStatus = statusMap[normalized];
  
  if (!validStatus) {
    console.warn(`[BOOKING_STATUS] Invalid status "${status}" normalized to "${BOOKING_STATUS.PENDING_ACCEPT}"`);
    return BOOKING_STATUS.PENDING_ACCEPT;
  }
  
  return validStatus;
}
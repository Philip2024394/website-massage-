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
/**
 * 🔒 BUSINESS LOGIC CONSTANTS - HARD LOCKED
 * ===========================================
 * Last Modified: 2026-01-28
 * 
 * ⚠️ CRITICAL WARNING ⚠️
 * These values define core business rules for the IndaStreetmassage platform.
 * Changes to these constants directly impact revenue, compliance, and user experience.
 * 
 * 🚫 DO NOT MODIFY WITHOUT:
 * 1. Written approval from business stakeholders
 * 2. Full regression testing of booking and payment flows
 * 3. Updating all related documentation
 * 4. Notifying all active therapists and places
 * 
 * MODIFICATION HISTORY:
 * - 2026-01-28: Initial creation with locked values
 */

// =============================================================================
// 🔒 BOOKING CONSTANTS - HARD LOCKED
// =============================================================================

/**
 * ⏱️ BOOKING ACCEPTANCE TIMER
 * Time (in minutes) therapist has to accept/reject instant "Book Now" bookings
 * Used in: TherapistBookings.tsx, BookingRequestCard.tsx
 */
export const BOOKING_ACCEPTANCE_TIMEOUT_MINUTES = 5;

/**
 * 🔔 SCHEDULED BOOKING NOTIFICATION ADVANCE TIME
 * Hours before scheduled booking to send notifications to therapist, place, and user
 * Used in: Notification system, scheduled booking reminders
 */
export const SCHEDULED_BOOKING_NOTIFICATION_HOURS = 5;

// =============================================================================
// 🔒 PAYMENT CONSTANTS - HARD LOCKED
// =============================================================================

/**
 * 💰 SCHEDULED BOOKING DEPOSIT PERCENTAGE
 * Percentage of total booking price paid upfront by user for scheduled bookings
 * This deposit is NON-REFUNDABLE and secures the therapist's time
 * Used in: Scheduled booking flow, payment processing
 */
export const SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE = 30;

/**
 * 🏦 PLATFORM COMMISSION PERCENTAGE (INDONESIA)
 * Commission taken by platform on all completed bookings in Indonesia
 * Applied to: Both therapists and places
 * Used in: Earnings calculations, payment processing
 */
export const PLATFORM_COMMISSION_PERCENTAGE_INDONESIA = 30;

/**
 * 🌍 PLATFORM COMMISSION PERCENTAGE (INTERNATIONAL)
 * Commission for non-Indonesia accounts (reserved for future use)
 * Currently not implemented
 */
export const PLATFORM_COMMISSION_PERCENTAGE_INTERNATIONAL = 30;

// =============================================================================
// 🔒 VERIFICATION CONSTANTS - HARD LOCKED
// =============================================================================

/**
 * 📋 KTP VERIFICATION STATES
 * Three-state system for Indonesian identity card verification
 * Used in: TherapistPaymentInfo.tsx, types.ts, admin verification flow
 */
export const KTP_VERIFICATION_STATES = {
  /** KTP uploaded, pending admin review - Shows orange "Menunggu Verifikasi" badge */
  SUBMITTED: 'submitted',
  
  /** KTP approved by admin - Shows green "Terverifikasi" badge */
  VERIFIED: 'verified',
  
  /** KTP rejected by admin - Hides badge, shows rejection reason */
  REJECTED: 'rejected',
} as const;

/**
 * 🎯 VERIFICATION BADGE TRUST IMPACT
 * Statistical increase in bookings for verified vs non-verified profiles
 * Used in: Marketing copy, help text
 */
export const VERIFICATION_BADGE_BOOKING_INCREASE_PERCENTAGE = 60;

// =============================================================================
// 🔒 BUSINESS RULES - HARD LOCKED
// =============================================================================

/**
 * ⚠️ DEPOSIT REFUND POLICY
 * Scheduled booking deposits are NEVER refundable
 * This protects therapist time and availability
 */
export const SCHEDULED_BOOKING_DEPOSIT_REFUNDABLE = false;

/**
 * 🏦 BANK DETAILS REQUIREMENT
 * Bank details are MANDATORY to activate scheduled booking acceptance
 * Without complete bank details, scheduled bookings cannot be confirmed
 * Used in: TherapistBookings.tsx, simpleChatService.ts backend validation
 */
export const BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS = true;

/**
 * 📱 MINIMUM REQUIRED BANK DETAILS FIELDS
 * All three fields must be filled to activate scheduled bookings
 */
export const REQUIRED_BANK_FIELDS = {
  bankName: true,
  accountName: true,
  accountNumber: true,
} as const;

// =============================================================================
// 🔒 NOTIFICATION CONSTANTS - HARD LOCKED
// =============================================================================

/**
 * 🔊 BOOKING NOTIFICATION SOUND
 * Audio alert played when instant booking request arrives
 * Used in: BookingRequestCard.tsx notification system
 */
export const BOOKING_NOTIFICATION_SOUND_ENABLED = true;

/**
 * ⏰ TIMER DISPLAY FORMAT
 * Show countdown timer for booking acceptance
 * Used in: BookingRequestCard.tsx UI
 */
export const SHOW_BOOKING_ACCEPTANCE_TIMER = true;

// =============================================================================
// 🔒 EARNINGS TRACKING - HARD LOCKED
// =============================================================================

/**
 * 📊 COMMISSION APPLICATION
 * Commission is applied to ALL booking types (instant and scheduled)
 * No exceptions or special rates
 */
export const COMMISSION_APPLIES_TO_ALL_BOOKINGS = true;

/**
 * 💵 EARNINGS CALCULATION
 * Formula: Total Booking Price × (1 - Commission Percentage / 100)
 * Example: Rp 200,000 booking → Rp 140,000 to therapist (30% commission = Rp 60,000)
 */
export const calculateTherapistEarnings = (bookingPrice: number): number => {
  // 🔒 HARD LOCKED CALCULATION - DO NOT MODIFY
  return bookingPrice * (1 - PLATFORM_COMMISSION_PERCENTAGE_INDONESIA / 100);
};

export const calculatePlatformCommission = (bookingPrice: number): number => {
  // 🔒 HARD LOCKED CALCULATION - DO NOT MODIFY
  return bookingPrice * (PLATFORM_COMMISSION_PERCENTAGE_INDONESIA / 100);
};

export const calculateScheduledBookingDeposit = (totalPrice: number): number => {
  // 🔒 HARD LOCKED CALCULATION - DO NOT MODIFY
  return totalPrice * (SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE / 100);
};

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type KTPVerificationState = typeof KTP_VERIFICATION_STATES[keyof typeof KTP_VERIFICATION_STATES];

// =============================================================================
// 📝 USAGE DOCUMENTATION
// =============================================================================

/**
 * HOW TO USE THESE CONSTANTS:
 * 
 * ✅ CORRECT USAGE:
 * import { BOOKING_ACCEPTANCE_TIMEOUT_MINUTES } from '@/constants/businessLogic';
 * 
 * if (timeElapsed > BOOKING_ACCEPTANCE_TIMEOUT_MINUTES * 60) {
 *   expireBooking();
 * }
 * 
 * ❌ INCORRECT USAGE (HARD-CODED VALUES):
 * if (timeElapsed > 5 * 60) { // Don't do this!
 *   expireBooking();
 * }
 * 
 * ✅ UI/COPY IS EDITABLE:
 * You can freely change help text, tooltips, and UI labels.
 * Only the numeric values and logic are locked.
 * 
 * Example:
 * <p>You have {BOOKING_ACCEPTANCE_TIMEOUT_MINUTES} minutes to respond</p>
 * ✅ Editing "minutes to respond" text is fine
 * 🚫 Changing BOOKING_ACCEPTANCE_TIMEOUT_MINUTES requires approval
 */

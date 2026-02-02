/**
 * ============================================================================
 * 📦 BOOKING CORE MODULE - STEP 13 EXPORTS
 * ============================================================================
 * 
 * Clean module exports for the authoritative booking system.
 * 
 * USAGE:
 * import { createBooking } from '@/core/booking';
 * import { BookingContract } from '@/core/booking';
 * 
 * ============================================================================
 */

// Main booking function
export { default as createBooking, getBookingStatus, createTestBookingPayload } from './createBooking';

// Contract validation
export { 
  validateBookingContract, 
  isValidBookingContract,
  type BookingContract,
  type BookingContractRequired,
  type BookingContractOptional,
  type ValidationError,
  type ContractValidationResult
} from './booking.contract';

// Type definitions
export {
  type BookingCreateResult,
  type BookingCreateSuccess,
  type BookingCreateError,
  type BookingErrorType,
  type BookingDocument,
  isBookingSuccess,
  isBookingError,
  createValidationError,
  createAppwriteError,
  createNetworkError,
  createUnknownError,
  createContractViolationError,
  createBookingSuccess
} from './booking.types';

// Re-export for convenience
export type { BookingContract as BookingPayload } from './booking.contract';
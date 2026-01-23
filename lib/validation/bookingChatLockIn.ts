/**
 * ============================================================================
 * 🔒 BOOKING-IN-CHAT CRITICAL VALIDATION SYSTEM
 * ============================================================================
 * 
 * PURPOSE: Prevents regression of booking-in-chat system
 * 
 * ENFORCEMENT RULES:
 * 1. BookingWelcomeBanner is SINGLE SOURCE OF TRUTH for booking banners
 * 2. Chat CANNOT render without valid booking object
 * 3. No inline booking banner rendering allowed
 * 4. Missing booking fields must fail loudly
 * 5. Countdown timer state must persist
 * 
 * ⚠️ WARNING: These rules are BUSINESS-CRITICAL and MUST NOT regress
 * 
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// BOOKING SCHEMA - Required fields validation
// ============================================================================

export const BookingDataSchema = z.object({
  // Core identifiers (REQUIRED)
  id: z.string().min(1, '🚨 CRITICAL: Booking ID is required'),
  bookingId: z.string().optional(),
  
  // Status tracking (REQUIRED)
  status: z.enum([
    'pending',
    'waiting_others',
    'therapist_accepted',
    'user_confirmed',
    'on_the_way',
    'completed',
    'cancelled'
  ], { errorMap: () => ({ message: '🚨 CRITICAL: Invalid booking status' }) }),
  
  // Service details (REQUIRED)
  serviceType: z.string().min(1, '🚨 CRITICAL: Service type is required'),
  duration: z.number().positive('🚨 CRITICAL: Service duration must be positive'),
  
  // Customer info (REQUIRED)
  customerName: z.string().min(1, '🚨 CRITICAL: Customer name is required'),
  
  // Pricing (REQUIRED)
  totalPrice: z.number().positive('🚨 CRITICAL: Total price must be positive'),
  
  // Booking type (REQUIRED)
  bookingType: z.enum(['book_now', 'scheduled'], {
    errorMap: () => ({ message: '🚨 CRITICAL: Invalid booking type' })
  }),
  
  // Optional fields
  locationZone: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  
  // Timestamps
  createdAt: z.string().optional(),
  responseDeadline: z.string().optional(),
});

export type ValidatedBookingData = z.infer<typeof BookingDataSchema>;

// ============================================================================
// COUNTDOWN TIMER SCHEMA - Timer state validation
// ============================================================================

export const CountdownTimerSchema = z.number()
  .int('🚨 CRITICAL: Countdown must be an integer')
  .nonnegative('🚨 CRITICAL: Countdown cannot be negative')
  .nullable();

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates booking data before rendering chat
 * @throws {Error} If booking data is invalid
 */
export function validateBookingData(booking: unknown): ValidatedBookingData {
  try {
    return BookingDataSchema.parse(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(
        `🚨 BOOKING VALIDATION FAILED 🚨\n\n` +
        `Chat cannot render without valid booking data.\n\n` +
        `Validation Errors:\n${errors}\n\n` +
        `This is a CRITICAL ERROR that must be fixed immediately.`
      );
    }
    throw error;
  }
}

/**
 * Validates countdown timer state
 * @throws {Error} If timer state is invalid
 */
export function validateCountdownTimer(countdown: unknown): number | null {
  try {
    return CountdownTimerSchema.parse(countdown);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `🚨 COUNTDOWN TIMER VALIDATION FAILED 🚨\n\n` +
        `Timer state is corrupted: ${error.errors[0].message}\n\n` +
        `This is a CRITICAL ERROR that affects booking UX.`
      );
    }
    throw error;
  }
}

// ============================================================================
// RUNTIME GUARDS
// ============================================================================

/**
 * Guard: Chat cannot render without booking data
 * Use this at the top of PersistentChatWindow render
 */
export function guardChatRequiresBooking(
  isOpen: boolean,
  currentBooking: unknown,
  componentName: string = 'PersistentChatWindow'
): void {
  if (isOpen && !currentBooking) {
    const error = new Error(
      `🚨 CRITICAL VIOLATION: ${componentName} opened without booking data! 🚨\n\n` +
      `RULE VIOLATION: Chat CANNOT render without valid booking object\n\n` +
      `This violates the booking-in-chat lock-in rules and must be fixed immediately.\n\n` +
      `Stack trace follows...`
    );
    
    // Log to console with high visibility
    console.error('═'.repeat(80));
    console.error('🚨 CRITICAL BOOKING-IN-CHAT VIOLATION 🚨');
    console.error('═'.repeat(80));
    console.error(error.message);
    console.error('═'.repeat(80));
    
    throw error;
  }
}

/**
 * Guard: Forbids inline booking banner rendering
 * Use this to detect if code tries to render booking info outside BookingWelcomeBanner
 */
export function guardNoInlineBookingBanner(
  isRenderingBookingInfo: boolean,
  location: string
): void {
  if (isRenderingBookingInfo) {
    const error = new Error(
      `🚨 CRITICAL VIOLATION: Inline booking banner detected at ${location}! 🚨\n\n` +
      `RULE VIOLATION: BookingWelcomeBanner is SINGLE SOURCE OF TRUTH\n\n` +
      `All booking info must be rendered through BookingWelcomeBanner component.\n` +
      `Inline rendering is FORBIDDEN to prevent regression.\n\n` +
      `Remove the inline booking render and use BookingWelcomeBanner instead.`
    );
    
    console.error('═'.repeat(80));
    console.error('🚨 CRITICAL BOOKING BANNER VIOLATION 🚨');
    console.error('═'.repeat(80));
    console.error(error.message);
    console.error('═'.repeat(80));
    
    throw error;
  }
}

// ============================================================================
// DEVELOPMENT MODE CHECKS
// ============================================================================

/**
 * Development mode: Logs warning if booking data is missing optional fields
 */
export function warnMissingOptionalFields(booking: ValidatedBookingData): void {
  if (process.env.NODE_ENV !== 'production') {
    const warnings: string[] = [];
    
    if (!booking.locationZone) {
      warnings.push('⚠️ locationZone is missing - consider adding for better UX');
    }
    
    if (!booking.responseDeadline) {
      warnings.push('⚠️ responseDeadline is missing - countdown timer may not work');
    }
    
    if (booking.bookingType === 'scheduled' && (!booking.scheduledDate || !booking.scheduledTime)) {
      warnings.push('⚠️ scheduledDate/scheduledTime missing for scheduled booking');
    }
    
    if (warnings.length > 0) {
      console.warn('📋 Booking data warnings:');
      warnings.forEach(w => console.warn(w));
    }
  }
}

// ============================================================================
// PERSISTENCE VALIDATION
// ============================================================================

/**
 * Validates that countdown timer persists across re-renders
 * Use in useEffect to ensure timer state doesn't reset
 */
export function validateTimerPersistence(
  previousCountdown: number | null,
  currentCountdown: number | null,
  bookingStatus: string
): void {
  // Timer should decrease, not reset
  if (previousCountdown !== null && currentCountdown !== null) {
    if (currentCountdown > previousCountdown && bookingStatus === 'pending') {
      console.error(
        `🚨 TIMER PERSISTENCE ERROR 🚨\n` +
        `Timer increased from ${previousCountdown}s to ${currentCountdown}s\n` +
        `This indicates timer state is being reset incorrectly.`
      );
    }
  }
}

// ============================================================================
// BUILD-TIME VALIDATION (Type-level checks)
// ============================================================================

/**
 * Type guard: Ensures booking prop is passed to BookingWelcomeBanner
 * This will fail TypeScript compilation if used incorrectly
 */
export type RequireBooking<T extends { currentBooking: unknown }> = T & {
  currentBooking: ValidatedBookingData;
};

/**
 * Type guard: Ensures countdown prop is passed
 */
export type RequireCountdown<T extends { bookingCountdown: unknown }> = T & {
  bookingCountdown: number | null;
};

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export const BookingChatLockIn = {
  // Validation
  validateBookingData,
  validateCountdownTimer,
  
  // Runtime Guards
  guardChatRequiresBooking,
  guardNoInlineBookingBanner,
  
  // Development Helpers
  warnMissingOptionalFields,
  validateTimerPersistence,
  
  // Schemas
  BookingDataSchema,
  CountdownTimerSchema,
};

// ============================================================================
// USAGE DOCUMENTATION
// ============================================================================

/**
 * USAGE IN PersistentChatWindow:
 * 
 * ```typescript
 * import { BookingChatLockIn } from '../lib/validation/bookingChatLockIn';
 * 
 * export function PersistentChatWindow() {
 *   const { chatState } = usePersistentChat();
 *   
 *   // GUARD: Chat requires booking
 *   BookingChatLockIn.guardChatRequiresBooking(
 *     chatState.isOpen,
 *     chatState.currentBooking,
 *     'PersistentChatWindow'
 *   );
 *   
 *   // VALIDATE: Booking data
 *   const validatedBooking = chatState.currentBooking
 *     ? BookingChatLockIn.validateBookingData(chatState.currentBooking)
 *     : null;
 *   
 *   // VALIDATE: Countdown timer
 *   const validatedCountdown = BookingChatLockIn.validateCountdownTimer(
 *     chatState.bookingCountdown
 *   );
 *   
 *   return (
 *     <div>
 *       {validatedBooking && (
 *         <BookingWelcomeBanner
 *           currentBooking={validatedBooking}
 *           bookingCountdown={validatedCountdown}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

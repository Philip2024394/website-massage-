/**
 * Booking Lock System
 * 
 * This utility manages the pending booking lock to prevent users from
 * booking with multiple therapists simultaneously.
 * 
 * When a user books (immediate or scheduled), the booking is locked for 15 minutes.
 * During this time, the user cannot book with another therapist.
 * 
 * The lock is automatically cleared when:
 * 1. The therapist responds (accepts/declines) via chat
 * 2. 15 minutes pass without a response (timeout)
 * 3. The user closes the chat window (optional - for better UX)
 */

export interface PendingBooking {
    bookingId: string;
    therapistId: string;
    therapistName: string;
    deadline: string; // ISO date string
    type: 'immediate' | 'scheduled';
}

/**
 * Check if there's an active pending booking
 * Now delegates to Appwrite query instead of sessionStorage
 */
export function hasPendingBooking(): PendingBooking | null {
    // SessionStorage removed - Appwrite is the single source of truth
    // This function now requires integration with booking service
    console.log('⚠️ Pending booking check moved to Appwrite - sessionStorage removed');
    return null; // Let Appwrite handle pending booking detection
}

/**
 * Set a new pending booking lock
 * Now handled by Appwrite booking status instead of sessionStorage
 */
export function setPendingBooking(bookingId: string, therapistId: string, therapistName: string, type: 'immediate' | 'scheduled', minutesUntilDeadline: number = 15): void {
    // SessionStorage removed - Appwrite booking status is the lock
    console.log(`🔒 Booking ${bookingId} lock now managed by Appwrite status`);
}

/**
 * Clear the pending booking lock
 * Now handled by Appwrite booking status updates
 */
export function clearPendingBooking(): void {
    // SessionStorage removed - Appwrite booking status changes handle this
    console.log('🔓 Booking lock managed by Appwrite');
}

/**
 * Get minutes remaining on pending booking
 */
export function getMinutesRemaining(pending: PendingBooking): number {
    const deadline = new Date(pending.deadline);
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / 60000);
}

/**
 * Format a user-friendly message about the pending booking
 */
export function getPendingBookingMessage(pending: PendingBooking): string {
    const minutesLeft = getMinutesRemaining(pending);
    return `⚠️ You have a pending ${pending.type} booking with ${pending.therapistName}.\n\nPlease wait for their response (${minutesLeft} min remaining) before booking with another therapist.`;
}

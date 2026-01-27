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
 */
export function hasPendingBooking(): PendingBooking | null {
    try {
        const stored = sessionStorage.getItem('pending_booking');
        if (!stored) return null;
        
        const pending: PendingBooking = JSON.parse(stored);
        const deadline = new Date(pending.deadline);
        
        // Check if expired
        if (deadline <= new Date()) {
            sessionStorage.removeItem('pending_booking');
            return null;
        }
        
        return pending;
    } catch {
        return null;
    }
}

/**
 * Set a new pending booking lock
 */
export function setPendingBooking(bookingId: string, therapistId: string, therapistName: string, type: 'immediate' | 'scheduled', minutesUntilDeadline: number = 15): void {
    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + minutesUntilDeadline);
    
    const pending: PendingBooking = {
        bookingId,
        therapistId,
        therapistName,
        deadline: deadline.toISOString(),
        type
    };
    
    sessionStorage.setItem('pending_booking', JSON.stringify(pending));
    console.log(`🔒 Booking locked until ${deadline.toISOString()}`);
}

/**
 * Clear the pending booking lock
 * Call this when:
 * - Therapist accepts/declines the booking
 * - Booking times out (automatic via expiry check)
 * - User cancels the booking
 */
export function clearPendingBooking(): void {
    sessionStorage.removeItem('pending_booking');
    console.log('🔓 Booking lock cleared');
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

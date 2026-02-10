/**
 * 🔒 BOOKING RECOVERY SYSTEM
 * 
 * This utility handles emergency booking recovery when localStorage fallback was used.
 * It should be called on app initialization to attempt to complete any pending bookings.
 */

import { logger } from './logger';

export interface PendingBooking {
  therapistId: string;
  therapistName: string;
  timestamp: number;
  source: string;
  commission: number;
  status: string;
}

/**
 * Check for and attempt to recover any emergency bookings stored in localStorage
 */
export async function recoverEmergencyBookings(): Promise<void> {
  console.log('[BOOKING RECOVERY] 🔍 Checking for emergency bookings...');
  
  try {
    const emergencyActive = localStorage.getItem('emergencyBookingActive');
    const pendingBookingStr = localStorage.getItem('pendingBooking');
    
    if (!emergencyActive || !pendingBookingStr) {
      console.log('[BOOKING RECOVERY] ✅ No emergency bookings found');
      return;
    }
    
    const pendingBooking: PendingBooking = JSON.parse(pendingBookingStr);
    const ageMs = Date.now() - pendingBooking.timestamp;
    const ageMinutes = Math.floor(ageMs / 60000);
    
    console.log('[BOOKING RECOVERY] 🚨 Emergency booking found:', {
      ...pendingBooking,
      ageMinutes
    });
    
    // If booking is older than 30 minutes, consider it stale
    if (ageMinutes > 30) {
      console.log('[BOOKING RECOVERY] ⏰ Emergency booking is stale (>30min), cleaning up...');
      clearEmergencyBooking();
      return;
    }
    
    // Attempt to notify user about the pending booking
    if (confirm(`You have a pending booking for ${pendingBooking.therapistName} from ${ageMinutes} minutes ago.\n\nWould you like us to attempt to open the chat window now?`)) {
      // Here you could dispatch an event or call a recovery function
      console.log('[BOOKING RECOVERY] 🔄 User confirmed recovery, dispatching event...');
      
      // Dispatch custom event that components can listen to
      window.dispatchEvent(new CustomEvent('emergencyBookingRecovery', {
        detail: { pendingBooking }
      }));
      
      // Clear the emergency booking after attempting recovery
      setTimeout(() => {
        clearEmergencyBooking();
      }, 5000);
      
    } else {
      console.log('[BOOKING RECOVERY] ❌ User declined recovery');
      clearEmergencyBooking();
    }
    
  } catch (error) {
    console.error('[BOOKING RECOVERY] ❌ Recovery system failed:', error);
    clearEmergencyBooking();
  }
}

/**
 * Clear emergency booking data from localStorage
 */
export function clearEmergencyBooking(): void {
  localStorage.removeItem('pendingBooking');
  localStorage.removeItem('emergencyBookingActive');
  console.log('[BOOKING RECOVERY] 🧹 Emergency booking data cleared');
}

/**
 * Store a successful booking completion (clears emergency state)
 */
export function markBookingCompleted(therapistId: string): void {
  const pendingBookingStr = localStorage.getItem('pendingBooking');
  
  if (pendingBookingStr) {
    try {
      const pendingBooking: PendingBooking = JSON.parse(pendingBookingStr);
      
      if (pendingBooking.therapistId === therapistId) {
        console.log('[BOOKING RECOVERY] ✅ Booking completed successfully, clearing emergency state');
        clearEmergencyBooking();
      }
    } catch (error) {
      console.error('[BOOKING RECOVERY] Error checking completed booking:', error);
    }
  }
}

/**
 * Get current pending booking info (for debugging)
 */
export function getPendingBookingInfo(): PendingBooking | null {
  try {
    const pendingBookingStr = localStorage.getItem('pendingBooking');
    return pendingBookingStr ? JSON.parse(pendingBookingStr) : null;
  } catch {
    return null;
  }
}
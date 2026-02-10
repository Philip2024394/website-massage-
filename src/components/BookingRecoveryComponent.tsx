/**
 * 🔒 BOOKING RECOVERY COMPONENT
 * 
 * This component handles emergency booking recovery on app initialization.
 * It runs once per session to check for any bookings that were stored in localStorage
 * as a fallback when the normal chat system failed.
 */

import { useEffect } from 'react';
import { recoverEmergencyBookings } from '../utils/bookingRecovery';
import { usePersistentChatIntegration } from '../hooks/usePersistentChatIntegration';
import { therapistService } from '../lib/appwriteService';
import type { Therapist } from '../types';

export function BookingRecoveryComponent() {
  const { openBookingChat } = usePersistentChatIntegration();

  useEffect(() => {
    console.log('[BOOKING RECOVERY COMPONENT] 🚀 Initializing recovery system...');
    
    let isRecovering = false; // Prevent multiple simultaneous recoveries
    
    // Listen for emergency booking recovery events
    const handleEmergencyRecovery = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const pendingBooking = (customEvent.detail as any)?.pendingBooking;
      if (isRecovering) {
        console.log('[BOOKING RECOVERY COMPONENT] ⏳ Recovery already in progress, skipping...');
        return;
      }
      
      isRecovering = true;
      
      try {
        console.log('[BOOKING RECOVERY COMPONENT] 🔄 Attempting to recover booking:', pendingBooking);
        
        // Try to fetch the therapist data and open chat
        try {
          const therapist = await therapistService.getById(pendingBooking.therapistId);
          if (therapist) {
            console.log('[BOOKING RECOVERY COMPONENT] ✅ Therapist data found, opening chat...');
            await openBookingChat(therapist, 'recovery');
            console.log('[BOOKING RECOVERY COMPONENT] 🎉 Recovery successful!');
          } else {
            console.warn('[BOOKING RECOVERY COMPONENT] ⚠️ Therapist not found:', pendingBooking.therapistId);
            alert(`Unable to recover booking for ${pendingBooking.therapistName} - therapist not found.`);
          }
        } catch (therapistError) {
          console.error('[BOOKING RECOVERY COMPONENT] ❌ Failed to fetch therapist:', therapistError);
          
          // Create a minimal therapist object for recovery
          const fallbackTherapist: Partial<Therapist> = {
            $id: pendingBooking.therapistId,
            id: pendingBooking.therapistId,
            name: pendingBooking.therapistName,
            appwriteId: pendingBooking.therapistId
          };
          
          console.log('[BOOKING RECOVERY COMPONENT] 🔄 Using fallback therapist object...');
          await openBookingChat(fallbackTherapist as Therapist, 'recovery-fallback');
        }
        
      } catch (error) {
        console.error('[BOOKING RECOVERY COMPONENT] ❌ Recovery failed:', error);
        alert('Unable to recover your booking. Please try booking again.');
      } finally {
        isRecovering = false;
      }
    };
    
    // Add event listener for recovery events
    window.addEventListener('emergencyBookingRecovery', handleEmergencyRecovery);
    
    // Check for emergency bookings on component mount
    const checkEmergencyBookings = async () => {
      try {
        await recoverEmergencyBookings();
      } catch (error) {
        console.error('[BOOKING RECOVERY COMPONENT] ❌ Initial recovery check failed:', error);
      }
    };
    
    // Run initial check after a short delay to ensure app is fully loaded
    const timeout = setTimeout(checkEmergencyBookings, 2000);
    
    // Cleanup
    return () => {
      window.removeEventListener('emergencyBookingRecovery', handleEmergencyRecovery);
      clearTimeout(timeout);
    };
  }, [openBookingChat]);
  
  // This component renders nothing - it's just for side effects
  return null;
}

export default BookingRecoveryComponent;
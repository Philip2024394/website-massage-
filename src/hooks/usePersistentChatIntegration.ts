/**
 * 🔒 PERSISTENT CHAT INTEGRATION HOOK
 * 
 * This hook bridges TherapistCard buttons with the PersistentChatProvider.
 * 
 * Usage in TherapistCard.tsx:
 * ```tsx
 * import { usePersistentChatIntegration } from '../hooks/usePersistentChatIntegration';
 * 
 * // Inside component:
 * const { openBookingChat, openPriceChat, openScheduleChat, openBookingWithService } = usePersistentChatIntegration();
 * 
 * // On button click:
 * <button onClick={() => openBookingChat(therapist)}>Book Now</button>
 * <button onClick={() => openScheduleChat(therapist)}>Schedule</button>
 * <button onClick={() => openBookingWithService(therapist, { serviceName: 'Full Body', duration: 60, price: 350000 })}>Book Selected</button>
 * ```
 */

import { useCallback } from 'react';
import { usePersistentChat, ChatTherapist, SelectedService } from '../context/PersistentChatProvider';
import type { Therapist } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';

/**
 * Hook to integrate TherapistCard buttons with PersistentChatWindow
 */
export function usePersistentChatIntegration() {
  const { openChat, openChatWithService, chatState, minimizeChat, maximizeChat } = usePersistentChat();
  
  /**
   * Convert Therapist type to ChatTherapist type
   */
  const convertToChatTherapist = useCallback((therapist: Therapist): ChatTherapist => {
    // ✅ FIX: Use therapist NAME as primary identifier instead of complex Appwrite IDs
    // This prevents ID mismatches and makes debugging much easier
    const therapistName = therapist.name;
    if (!therapistName) {
      console.error('❌ ERROR: Therapist missing name', therapist);
      throw new Error('Cannot open chat - therapist has no name');
    }
    
    console.log('🔍 CONVERT: Converting therapist to ChatTherapist:', {
      name: therapistName,
      appwriteId: therapist.$id || therapist.id,
      price60: therapist.price60,
      price90: therapist.price90,
      price120: therapist.price120,
      rawPricing: therapist.pricing,
      source: 'convertToChatTherapist'
    });
    
    // Parse pricing using existing helper - MUST match therapist profile prices exactly
    const pricing = parsePricing(therapist.pricing);
    
    // CRITICAL: If pricing fails to parse, log error - don't use fallback
    // This ensures prices always match therapist profile
    if (!pricing || Object.keys(pricing).length === 0) {
      console.error('⚠️ PRICING ERROR: Could not parse pricing for therapist', therapist.name, therapist.pricing);
      console.error('⚠️ This will cause price mismatch between profile and chat window!');
      // Use fallback only as last resort
      const fallbackPricing = {
        '30': 250000,
        '60': 350000,
        '90': 450000,
        '120': 550000,
      };
      console.warn('⚠️ Using fallback pricing - should fix therapist profile data!');
      const fallbackChatTherapist = {
        id: therapistName, // ✅ Use NAME as ID
        name: therapistName,
        image: (therapist as any).mainImage || (therapist as any).profilePicture,
        status: (therapist as any).availability_status || (therapist as any).availabilityStatus || 'available',
        pricing: fallbackPricing,
        // ✅ CRITICAL: Include separate price fields for fallback too
        price60: therapist.price60 || '350',
        price90: therapist.price90 || '450', 
        price120: therapist.price120 || '550',
        duration: 60,
        appwriteId: therapist.$id || therapist.id,
      };
      
      console.log('⚠️ CONVERT: Using fallback ChatTherapist:', {
        id: fallbackChatTherapist.id,
        name: fallbackChatTherapist.name,
        appwriteId: fallbackChatTherapist.appwriteId
      });
      
      return fallbackChatTherapist;
    }
    
    console.log('✅ Therapist pricing loaded:', therapist.name, pricing);
    
    const chatTherapist = {
      id: therapistName, // ✅ Use NAME as ID for easy debugging
      name: therapistName,
      image: (therapist as any).mainImage || (therapist as any).profilePicture,
      status: (therapist as any).availability_status || (therapist as any).availabilityStatus || 'available',
      pricing, // Use therapist's exact profile prices
      // ✅ CRITICAL: Include separate price fields for chat window pricing
      price60: therapist.price60,
      price90: therapist.price90,
      price120: therapist.price120,
      duration: 60,
      // Keep Appwrite ID for database operations
      appwriteId: therapist.$id || therapist.id,
    };
    
    console.log('✅ CONVERT: ChatTherapist created:', {
      id: chatTherapist.id,
      name: chatTherapist.name,
      appwriteId: chatTherapist.appwriteId,
      price60: chatTherapist.price60,
      price90: chatTherapist.price90,
      price120: chatTherapist.price120,
      pricing: chatTherapist.pricing
    });
    });
    
    return chatTherapist;
  }, []);
  
  /**
   * Open chat for "Book Now" button
   * - Opens chat in booking mode
   * - Starts at duration selection
   * - Validates therapist status before opening
   */
  const openBookingChat = useCallback((therapist: Therapist) => {
    console.log('🔒 [PersistentChatIntegration] Opening booking chat for:', therapist.name);
    
    // Check therapist status - block booking if busy or offline
    const therapistStatus = (therapist.status || therapist.availability || '').toLowerCase();
    
    if (therapistStatus === 'busy') {
      alert('⚠️ Therapist is not active in service. Please check back later for book now service.');
      console.log('❌ [PersistentChatIntegration] Booking blocked - therapist is BUSY');
      return;
    }
    
    if (therapistStatus === 'offline') {
      alert('⚠️ Therapist has no service at this time. Please choose therapist with available status.');
      console.log('❌ [PersistentChatIntegration] Booking blocked - therapist is OFFLINE');
      return;
    }
    
    const chatTherapist = convertToChatTherapist(therapist);
    openChat(chatTherapist, 'book');
  }, [openChat, convertToChatTherapist]);
  
  /**
   * Open chat for "Schedule" button
   * - Opens chat in schedule mode
   * - Starts at duration selection
   * - Validates therapist status before opening
   */
  const openScheduleChat = useCallback((therapist: Therapist) => {
    console.log('🔒 [PersistentChatIntegration] Opening schedule chat for:', therapist.name);
    
    // Check therapist status - block scheduling if busy or offline
    const therapistStatus = (therapist.status || therapist.availability || '').toLowerCase();
    
    if (therapistStatus === 'busy') {
      alert('⚠️ Therapist is not active in service. Please check back later for book now service.');
      console.log('❌ [PersistentChatIntegration] Schedule booking blocked - therapist is BUSY');
      return;
    }
    
    if (therapistStatus === 'offline') {
      alert('⚠️ Therapist has no service at this time. Please choose therapist with available status.');
      console.log('❌ [PersistentChatIntegration] Schedule booking blocked - therapist is OFFLINE');
      return;
    }
    
    const chatTherapist = convertToChatTherapist(therapist);
    openChat(chatTherapist, 'schedule');
  }, [openChat, convertToChatTherapist]);
  
  /**
   * Open chat for "View Prices" / Price slider
   * - Opens chat in price mode
   * - Starts at duration selection with prices visible
   * - Validates therapist status before opening
   */
  const openPriceChat = useCallback((therapist: Therapist) => {
    console.log('🔒 [PersistentChatIntegration] Opening price chat for:', therapist.name);
    
    // Check therapist status - block booking if busy or offline
    const therapistStatus = (therapist.status || therapist.availability || '').toLowerCase();
    
    if (therapistStatus === 'busy') {
      alert('⚠️ Therapist is not active in service. Please check back later for book now service.');
      console.log('❌ [PersistentChatIntegration] Price chat blocked - therapist is BUSY');
      return;
    }
    
    if (therapistStatus === 'offline') {
      alert('⚠️ Therapist has no service at this time. Please choose therapist with available status.');
      console.log('❌ [PersistentChatIntegration] Price chat blocked - therapist is OFFLINE');
      return;
    }
    
    const chatTherapist = convertToChatTherapist(therapist);
    openChat(chatTherapist, 'price');
  }, [openChat, convertToChatTherapist]);
  
  /**
   * Open chat with pre-selected service from Menu Harga
   * - Enhanced to support both immediate and scheduled bookings with deposits
   * - Skips duration selection for immediate bookings
   * - Triggers deposit modal for scheduled bookings
   * - Validates therapist status before opening
   */
  const openBookingWithService = useCallback((
    therapist: Therapist, 
    service: { serviceName: string; duration: number; price: number },
    options?: { bookingType?: 'immediate' | 'scheduled' }
  ) => {
    console.log('🔒 [PersistentChatIntegration] Opening chat with service and options:', {
      therapist: therapist.name,
      service,
      options
    });

    // Check therapist status - block booking if busy or offline
    const therapistStatus = (therapist.status || therapist.availability || '').toLowerCase();
    
    if (therapistStatus === 'busy') {
      alert('⚠️ Therapist is not active in service. Please check back later for book now service.');
      console.log('❌ [PersistentChatIntegration] Service booking blocked - therapist is BUSY');
      return;
    }
    
    if (therapistStatus === 'offline') {
      alert('⚠️ Therapist has no service at this time. Please choose therapist with available status.');
      console.log('❌ [PersistentChatIntegration] Service booking blocked - therapist is OFFLINE');
      return;
    }

    const bookingType = options?.bookingType || 'immediate';
    const chatTherapist = convertToChatTherapist(therapist);

    // For scheduled bookings, mark as scheduled (deposit happens AFTER therapist accepts)
    if (bookingType === 'scheduled') {
      console.log('📅 [PersistentChatIntegration] Opening scheduled booking (deposit after acceptance)');
      openChatWithService(chatTherapist, service, {
        isScheduled: true
      });
    } else {
      // For immediate bookings - no deposit ever
      console.log('🚀 [PersistentChatIntegration] Opening immediate booking (no deposit)');
      openChatWithService(chatTherapist, service);
    }
  }, [openChatWithService, convertToChatTherapist]);
  
  /**
   * Check if chat is currently open for a specific therapist
   */
  const isChatOpenFor = useCallback((therapistId: string | number) => {
    return chatState.isOpen && chatState.therapist?.id === therapistId.toString();
  }, [chatState.isOpen, chatState.therapist]);
  
  /**
   * Toggle chat minimize/maximize
   */
  const toggleMinimize = useCallback(() => {
    if (chatState.isMinimized) {
      maximizeChat();
    } else {
      minimizeChat();
    }
  }, [chatState.isMinimized, minimizeChat, maximizeChat]);
  
  return {
    openBookingChat,
    openScheduleChat,
    openPriceChat,
    openBookingWithService, // From Menu Harga with pre-selected service
    isChatOpenFor,
    toggleMinimize,
    isChatOpen: chatState.isOpen,
    isMinimized: chatState.isMinimized,
    currentTherapist: chatState.therapist,
  };
}

export default usePersistentChatIntegration;

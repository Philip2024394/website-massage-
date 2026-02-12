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
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getSamplePricing, hasActualPricing } from '../utils/samplePriceUtils';

/**
 * Hook to integrate TherapistCard buttons with PersistentChatWindow
 * Uses PersistentChatWindow only - FloatingChatWindow is NOT triggered (avoids duplicate chat UI)
 */
export function usePersistentChatIntegration() {
  const { openChat, openChatWithService, chatState, minimizeChat, maximizeChat } = usePersistentChat();
  
  /**
   * Convert Therapist type to ChatTherapist type
   */
  const convertToChatTherapist = useCallback((therapist: Therapist): ChatTherapist => {
    // 🔒 CRITICAL VALIDATION #1: appwriteId OR $id MUST exist (with fallback to id)
    // Priority: appwriteId > $id > id (last resort)
    const therapistDocumentId = therapist.appwriteId || therapist.$id || therapist.id?.toString();
    
    if (!therapistDocumentId) {
      const errorMsg = 
        'BLOCKED: Therapist missing all ID fields (appwriteId, $id, and id). ' +
        'This is a data integrity issue - therapist must have a valid identifier.';
      console.error('═'.repeat(80));
      console.error('❌ CRITICAL:', errorMsg);
      console.error('Therapist object:', therapist);
      console.error('═'.repeat(80));
      throw new Error(errorMsg);
    }
    
    // Log which ID field was used
    const idSource = therapist.appwriteId ? 'appwriteId' : 
                     therapist.$id ? '$id' : 
                     'id (fallback)';
    console.log('✅ DOCUMENT ID RESOLVED:', therapistDocumentId, 'from', idSource);
    console.log('🔍 ID FIELDS CHECKED:', {
      appwriteId: therapist.appwriteId,
      $id: therapist.$id,
      id: therapist.id,
      selected: therapistDocumentId,
      source: idSource
    });
    
    // Secondary validation: name should exist (but less critical than appwriteId)
    const therapistName = therapist.name;
    if (!therapistName) {
      console.error('❌ ERROR: Therapist missing name', therapist);
      throw new Error('Cannot open chat - therapist has no name');
    }
    
    console.log('🔍 CONVERT: Converting therapist to ChatTherapist:', {
      name: therapistName,
      documentId: therapistDocumentId,
      appwriteId: therapist.appwriteId,
      $id: therapist.$id,
      price60: therapist.price60,
      price90: therapist.price90,
      price120: therapist.price120,
      rawPricing: therapist.pricing,
      source: 'convertToChatTherapist'
    });
    
    // Parse pricing using existing helper - MUST match therapist profile prices exactly
    const parsedPricing = parsePricing(therapist.pricing);
    const hasSeparatePrices = (therapist.price60 && Number(therapist.price60) > 0) ||
      (therapist.price90 && Number(therapist.price90) > 0) ||
      (therapist.price120 && Number(therapist.price120) > 0);

    // Build pricing - use actual if available, else sample (display-only) when no prices set
    let pricing = parsedPricing;
    let price60: string | undefined = therapist.price60 != null ? String(therapist.price60) : undefined;
    let price90: string | undefined = therapist.price90 != null ? String(therapist.price90) : undefined;
    let price120: string | undefined = therapist.price120 != null ? String(therapist.price120) : undefined;

    const pricingEmpty = !pricing || !(pricing["60"] > 0 || pricing["90"] > 0 || pricing["120"] > 0);
    if (pricingEmpty && !hasSeparatePrices && !hasActualPricing(therapist)) {
      const sample = getSamplePricing(therapistDocumentId);
      pricing = {
        "30": Math.round(sample["60"] * 0.6 / 1000),
        "60": Math.round(sample["60"] / 1000),
        "90": Math.round(sample["90"] / 1000),
        "120": Math.round(sample["120"] / 1000),
      };
      price60 = String(Math.round(sample["60"] / 1000));
      price90 = String(Math.round(sample["90"] / 1000));
      price120 = String(Math.round(sample["120"] / 1000));
      console.log('📋 Using display-only sample pricing for chat:', { price60, price90, price120 });
    } else if (pricingEmpty && !hasSeparatePrices) {
      console.error('⚠️ PRICING ERROR: Could not parse pricing for therapist', therapist.name, therapist.pricing);
      const fallbackPricing = { '30': 250, '60': 350, '90': 450, '120': 550 };
      pricing = fallbackPricing;
      price60 = price60 ?? '350';
      price90 = price90 ?? '450';
      price120 = price120 ?? '550';
    }

    if (!pricingEmpty && pricing && !price60 && pricing["60"]) {
      price60 = String(Math.round(pricing["60"]));
      price90 = String(Math.round(pricing["90"]));
      price120 = String(Math.round(pricing["120"]));
    }

    if (!pricing || Object.keys(pricing).length === 0) {
      const imgUrl = (therapist as any).profilePicture || (therapist as any).mainImage || (therapist as any).mainimage || (therapist as any).profileImageUrl || (therapist as any).heroImageUrl || (therapist as any).image || (therapist as any).profileImage || getRandomTherapistImage(therapistDocumentId);
      const fallbackChatTherapist = {
        id: therapistName,
        name: therapistName,
        image: imgUrl,
        mainImage: imgUrl,
        profileImageUrl: imgUrl,
        profilePicture: (therapist as any).profilePicture || imgUrl,
        status: (therapist as any).availability_status || (therapist as any).availabilityStatus || (therapist as any).availability || (therapist as any).status || 'available',
        pricing: { '30': 250, '60': 350, '90': 450, '120': 550 },
        price60: price60 || '350',
        price90: price90 || '450',
        price120: price120 || '550',
        duration: 60,
        appwriteId: therapistDocumentId,
      };
      
      console.log('⚠️ CONVERT: Using fallback ChatTherapist:', {
        id: fallbackChatTherapist.id,
        name: fallbackChatTherapist.name,
        appwriteId: fallbackChatTherapist.appwriteId
      });
      
      return fallbackChatTherapist;
    }
    
    console.log('✅ Therapist pricing loaded:', therapist.name, pricing);
    
    // Align with price modal: profilePicture (avatar) first, then mainImage (banner)
    const imgUrl = (therapist as any).profilePicture || (therapist as any).mainImage || (therapist as any).mainimage || (therapist as any).profileImageUrl || (therapist as any).heroImageUrl || (therapist as any).image || (therapist as any).profileImage || getRandomTherapistImage(therapistDocumentId);
    const chatTherapist = {
      id: therapistName,
      name: therapistName,
      image: imgUrl,
      mainImage: imgUrl,
      profileImageUrl: imgUrl,
      profilePicture: (therapist as any).profilePicture || imgUrl,
      status: (therapist as any).availability_status || (therapist as any).availabilityStatus || (therapist as any).availability || (therapist as any).status || 'available',
      pricing, // Use therapist's exact profile prices (or sample when none set)
      // ✅ CRITICAL: Include separate price fields for chat window pricing
      price60: price60 ?? therapist.price60,
      price90: price90 ?? therapist.price90,
      price120: price120 ?? therapist.price120,
      duration: 60,
      // 🔒 REQUIRED: Document ID (appwriteId or $id)
      appwriteId: therapistDocumentId,
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
    
    return chatTherapist;
  }, []);
  
  /**
   * Open chat for "Book Now" button
   * - Opens chat in booking mode
   * - Starts at duration selection
   * - Validates therapist status before opening
   * @param therapist - Therapist to book
   * @param source - Optional source tracking ('share' for shared links)
   */
  const openBookingChat = useCallback((therapist: Therapist, source: 'share' | 'profile' | 'search' | null = null) => {
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
    openChat(chatTherapist, 'book', source);

    // REMOVED: ChatProvider bridge - was causing duplicate FloatingChatWindow (lock icons, "Complete Booking Form")
    // to appear behind PersistentChatWindow. PersistentChatWindow handles the full booking flow alone.
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

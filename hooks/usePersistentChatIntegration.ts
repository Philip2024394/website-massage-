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
    // Parse pricing using existing helper
    const pricing = parsePricing(therapist.pricing) || {
      '60': 350000,
      '90': 450000,
      '120': 550000,
    };
    
    return {
      id: therapist.id.toString(),
      name: therapist.name,
      image: (therapist as any).mainImage || (therapist as any).profilePicture,
      status: (therapist as any).availability_status || (therapist as any).availabilityStatus || 'available',
      pricing,
      duration: 60, // Default duration
    };
  }, []);
  
  /**
   * Open chat for "Book Now" button
   * - Opens chat in booking mode
   * - Starts at duration selection
   */
  const openBookingChat = useCallback((therapist: Therapist) => {
    console.log('🔒 [PersistentChatIntegration] Opening booking chat for:', therapist.name);
    const chatTherapist = convertToChatTherapist(therapist);
    openChat(chatTherapist, 'book');
  }, [openChat, convertToChatTherapist]);
  
  /**
   * Open chat for "Schedule" button
   * - Opens chat in schedule mode
   * - Starts at duration selection
   */
  const openScheduleChat = useCallback((therapist: Therapist) => {
    console.log('🔒 [PersistentChatIntegration] Opening schedule chat for:', therapist.name);
    const chatTherapist = convertToChatTherapist(therapist);
    openChat(chatTherapist, 'schedule');
  }, [openChat, convertToChatTherapist]);
  
  /**
   * Open chat for "View Prices" / Price slider
   * - Opens chat in price mode
   * - Starts at duration selection with prices visible
   */
  const openPriceChat = useCallback((therapist: Therapist) => {
    console.log('🔒 [PersistentChatIntegration] Opening price chat for:', therapist.name);
    const chatTherapist = convertToChatTherapist(therapist);
    openChat(chatTherapist, 'price');
  }, [openChat, convertToChatTherapist]);
  
  /**
   * Open chat with pre-selected service from Menu Harga
   * - Skips duration selection
   * - Goes directly to confirmation with service details + arrival time
   */
  const openBookingWithService = useCallback((
    therapist: Therapist, 
    service: { serviceName: string; duration: number; price: number }
  ) => {
    console.log('🔒 [PersistentChatIntegration] Opening chat with pre-selected service:', therapist.name, service);
    const chatTherapist = convertToChatTherapist(therapist);
    openChatWithService(chatTherapist, service);
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

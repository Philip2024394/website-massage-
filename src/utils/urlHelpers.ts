/**
 * URL Helper Functions
 * Utilities for generating and parsing URLs for chat and booking routes
 */

/**
 * Generate chat room URL
 * @param chatRoomId - The ID of the chat room
 * @param slug - Optional slug for SEO-friendly URL
 * @returns URL string for the chat room
 */
export function generateChatRoomUrl(chatRoomId: string, slug?: string): string {
  if (slug) {
    return `/chat/room/${chatRoomId}/${slug}`;
  }
  return `/chat/room/${chatRoomId}`;
}

/**
 * Generate booking URL for therapist
 * @param therapistId - The ID of the therapist
 * @param therapistName - Optional name for SEO-friendly URL
 * @returns URL string for booking the therapist
 */
export function generateBookingTherapistUrl(therapistId: string, therapistName?: string): string {
  if (therapistName) {
    const slug = therapistName.toLowerCase().replace(/\s+/g, '-');
    return `/booking/therapist/${therapistId}/${slug}`;
  }
  return `/booking/therapist/${therapistId}`;
}

/**
 * Generate booking URL for place
 * @param placeId - The ID of the place
 * @param placeName - Optional name for SEO-friendly URL
 * @returns URL string for booking the place
 */
export function generateBookingPlaceUrl(placeId: string, placeName?: string): string {
  if (placeName) {
    const slug = placeName.toLowerCase().replace(/\s+/g, '-');
    return `/booking/place/${placeId}/${slug}`;
  }
  return `/booking/place/${placeId}`;
}

/**
 * Generate generic booking URL
 * @param bookingId - The ID of the booking
 * @returns URL string for the booking
 */
export function generateBookingUrl(bookingId: string): string {
  return `/booking/${bookingId}`;
}

/**
 * Get chat inbox URL
 * @returns URL string for chat inbox
 */
export function getChatInboxUrl(): string {
  return '/chat/inbox';
}

/**
 * Parse chat room ID from URL
 * @param pathname - The URL pathname
 * @returns Chat room ID or null if not found
 */
export function parseChatRoomIdFromUrl(pathname: string): string | null {
  const match = pathname.match(/^\/chat\/(?:room\/)?([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Parse booking ID from URL
 * @param pathname - The URL pathname
 * @returns Booking ID or null if not found
 */
export function parseBookingIdFromUrl(pathname: string): string | null {
  const match = pathname.match(/^\/booking\/(?:therapist|place)?\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Parse provider type and ID from booking URL
 * @param pathname - The URL pathname
 * @returns Object with providerType and providerId, or null if not found
 */
export function parseBookingProviderFromUrl(pathname: string): { providerType: 'therapist' | 'place'; providerId: string } | null {
  const therapistMatch = pathname.match(/^\/booking\/therapist\/([^/]+)/);
  if (therapistMatch) {
    return { providerType: 'therapist', providerId: therapistMatch[1] };
  }
  
  const placeMatch = pathname.match(/^\/booking\/place\/([^/]+)/);
  if (placeMatch) {
    return { providerType: 'place', providerId: placeMatch[1] };
  }
  
  return null;
}

/**
 * Navigate to chat room
 * @param chatRoomId - The ID of the chat room
 * @param slug - Optional slug for SEO
 */
export function navigateToChatRoom(chatRoomId: string, slug?: string): void {
  const url = generateChatRoomUrl(chatRoomId, slug);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Navigate to booking flow
 * @param providerId - The ID of the provider (therapist or place)
 * @param providerType - The type of provider
 * @param providerName - Optional name for SEO
 */
export function navigateToBooking(providerId: string, providerType: 'therapist' | 'place', providerName?: string): void {
  const url = providerType === 'therapist' 
    ? generateBookingTherapistUrl(providerId, providerName)
    : generateBookingPlaceUrl(providerId, providerName);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Navigate to chat inbox
 */
export function navigateToChatInbox(): void {
  window.history.pushState({}, '', getChatInboxUrl());
  window.dispatchEvent(new PopStateEvent('popstate'));
}

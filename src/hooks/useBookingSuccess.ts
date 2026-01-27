/**
 * Hook to handle booking success side-effects
 * Isolated to prevent accidental deletion during refactors
 */

export interface BookingSuccessPayload {
  chatRoomId: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  providerImage: string | null;
  therapistId: string;
  therapistName: string;
  customerName: string;
  customerWhatsApp: string;
  userRole: string;
  source: string;
  pricing: { [key: string]: number };
  bookingDate?: string;
  bookingTime?: string;
  serviceDuration?: string;
  serviceType?: string;
}

export function useBookingSuccess() {
  return function onBookingSuccess(payload: BookingSuccessPayload) {
    console.log("🔥🔥🔥 BOOKING SUCCESS HOOK", payload);
    console.log("🔥 Dispatching openChat event with payload:", {
      chatRoomId: payload.chatRoomId,
      bookingId: payload.bookingId,
      providerId: payload.providerId
    });

    // Validate required fields
    if (!payload.chatRoomId) {
      console.error("❌ CRITICAL: chatRoomId is missing from payload!");
      throw new Error("Cannot dispatch openChat without chatRoomId");
    }

    if (!payload.bookingId) {
      console.error("❌ CRITICAL: bookingId is missing from payload!");
      throw new Error("Cannot dispatch openChat without bookingId");
    }

    // Dispatch the openChat event
    window.dispatchEvent(
      new CustomEvent("openChat", {
        detail: payload
      })
    );

    console.log("✅ openChat EVENT DISPATCHED SUCCESSFULLY");
    console.log("🔥 Waiting for App.tsx event listener to catch it...");
  };
}

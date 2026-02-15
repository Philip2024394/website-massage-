/**
 * Temporary storage for booking details when user must sign in or create account
 * before confirming. Restored after auth so the flow continues without data loss.
 */
const KEY = 'indastreet_booking_draft';

export interface BookingDraft {
  /** Order Now vs Scheduled */
  bookingType: 'ORDER_NOW' | 'SCHEDULED';
  /** Payload for createBooking */
  payload: {
    customerName: string;
    customerPhone: string;
    customerWhatsApp: string;
    duration: number;
    serviceType?: string;
    price?: number;
    totalPrice: number;
    locationZone?: string;
    location?: string;
    locationType?: 'home' | 'hotel' | 'villa';
    address?: string;
    hotelVillaName?: string;
    roomNumber?: string;
    coordinates?: { lat: number; lng: number };
    scheduledDate?: string;
    scheduledTime?: string;
    discountCode?: string;
    discountPercentage?: number;
    originalPrice?: number;
  };
  /** For scheduled: selected date/time */
  selectedDate?: string;
  selectedTime?: string;
  /** Therapist/provider info */
  therapistId?: string;
  therapistName?: string;
  /** Timestamp so we can expire old drafts */
  savedAt: string;
}

export function saveBookingDraft(draft: Omit<BookingDraft, 'savedAt'>): void {
  try {
    const withTimestamp = { ...draft, savedAt: new Date().toISOString() };
    sessionStorage.setItem(KEY, JSON.stringify(withTimestamp));
  } catch {
    // ignore
  }
}

export function getBookingDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingDraft;
    // Optional: expire after 30 minutes
    const savedAt = new Date(parsed.savedAt).getTime();
    if (Date.now() - savedAt > 30 * 60 * 1000) {
      clearBookingDraft();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

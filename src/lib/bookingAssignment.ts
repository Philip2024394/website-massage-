// Lightweight booking assignment + broadcast workflow (frontend stub)
// This does NOT guarantee delivery; real implementation should move server-side.

import { therapistService } from './appwriteService';
import type { Therapist } from '../types';

export interface BookingPayload {
  bookingId: string;
  customerName: string;
  customerWhatsApp: string;
  durationMinutes: number;
  price: number;
  service?: string;
  notes?: string;
}

export interface AssignmentResult {
  initialTherapist?: Therapist | null;
  broadcastCount: number;
  message?: string;
}

// Generate WhatsApp message text
function buildWhatsAppMessage(booking: BookingPayload, acceptUrl: string, declineUrl: string) {
  return (
    `🛎️ NEW MASSAGE REQUEST\n` +
    `👤 Client: ${booking.customerName}\n` +
    `⏱️ Duration: ${booking.durationMinutes} min\n` +
    `💰 Price: IDR ${booking.price}\n` +
    (booking.notes ? `📝 Notes: ${booking.notes}\n` : '') +
    `\n✅ Accept: ${acceptUrl}\n❌ Decline: ${declineUrl}\n` +
    `\n🔒 Contact customer through in-app chat system only.\n` +
    `\nRespond within 15 minutes to secure booking.`
  );
}

export async function assignInitialTherapist(booking: BookingPayload): Promise<AssignmentResult> {
  try {
    const all = await therapistService.getAll();
    const available = all.filter(t => (t.status?.toLowerCase?.() === 'available'));
    if (available.length === 0) {
      return { broadcastCount: 0, message: 'No available therapists to assign.' };
    }
    // Simple: pick first
    const chosen = available[0];
    const acceptUrl = `${window.location.origin}/accept-booking/${booking.bookingId}?therapist=${chosen.$id || chosen.id}`;
    const declineUrl = `${window.location.origin}/decline-booking/${booking.bookingId}?therapist=${chosen.$id || chosen.id}`;
    const msg = buildWhatsAppMessage(booking, acceptUrl, declineUrl);
    // Open WhatsApp window for manual send (since auto-sending is not possible client-side)
    const wa = `https://wa.me/${(chosen.whatsappNumber || '').replace(/[^\d]/g,'')}?text=${encodeURIComponent(msg)}`;
    window.open(wa, '_blank');
    return { initialTherapist: chosen, broadcastCount: 1, message: 'Initial therapist notified.' };
  } catch (e: any) {
    return { broadcastCount: 0, message: 'Assignment failed: ' + (e?.message || 'Unknown error') };
  }
}

export async function broadcastDecline(booking: BookingPayload, excludingTherapistId: string): Promise<AssignmentResult> {
  try {
    const all = await therapistService.getAll();
    const available = all.filter(t => (t.status?.toLowerCase?.() === 'available') && (String(t.$id || t.id) !== String(excludingTherapistId)));
    if (available.length === 0) {
      return { broadcastCount: 0, message: 'No other therapists available.' };
    }
    let count = 0;
    available.slice(0,5).forEach(t => {
      const acceptUrl = `${window.location.origin}/accept-booking/${booking.bookingId}?therapist=${t.$id || t.id}`;
      const declineUrl = `${window.location.origin}/decline-booking/${booking.bookingId}?therapist=${t.$id || t.id}`;
      const msg = buildWhatsAppMessage(booking, acceptUrl, declineUrl);
      const wa = `https://wa.me/${(t.whatsappNumber || '').replace(/[^\d]/g,'')}?text=${encodeURIComponent(msg)}`;
      window.open(wa, '_blank');
      count++;
    });
    return { broadcastCount: count, message: `Broadcasted to ${count} therapists.` };
  } catch (e: any) {
    return { broadcastCount: 0, message: 'Broadcast failed: ' + (e?.message || 'Unknown error') };
  }
}

// Accept / Decline handlers (client stub - should be server validated)
export async function handleTherapistDecision(bookingId: string, therapistId: string, accepted: boolean) {
  console.log('Therapist decision', { bookingId, therapistId, accepted });
  // Here you would update booking status in Appwrite and possibly therapist busy state
  // For accepted: mark therapist busy for initial duration (e.g., 30 mins if immediate)
  // For declined: call broadcastDecline with booking payload (needs stored booking context)
}

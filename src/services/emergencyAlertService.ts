/**
 * Emergency alert service for therapist/place safety.
 * - Therapist triggers alert (3 taps) → creates alert in Appwrite, notifies admin.
 * - Emergency button is active: during book now/order now, 1h before scheduled, 3h after session.
 */

import { ID } from 'appwrite';
import { getDatabases } from '../lib/appwrite/config';
import { APPWRITE_CONFIG } from '../lib/appwrite/config';

const COLLECTION = () => (APPWRITE_CONFIG as any).collections?.emergency_alerts || 'emergency_alerts';
const DB_ID = () => (APPWRITE_CONFIG as any).databaseId || '68f76ee1000e64ca8d05';

export const EMERGENCY_WINDOW = {
  /** Hours before scheduled start when button becomes active */
  BEFORE_HOURS: 1,
  /** Hours after session end when button stays active */
  AFTER_HOURS: 3,
};

export interface BookingForEmergency {
  $id?: string;
  providerId?: string;
  therapistId?: string;
  status?: string;
  customerName?: string;
  userName?: string;
  startTime?: string;
  scheduledTime?: string;
  bookingDate?: string;
  duration?: number; // minutes
  createdAt?: string;
  completedAt?: string;
}

/**
 * Returns true if the emergency button should be active based on provider's bookings.
 * Active when: 1h before any scheduled start, during any in-progress session, or 3h after session end.
 * Each "book now" / "order now" (immediate) counts as session; 3h after end keeps it active.
 */
export function isEmergencyWindowActive(bookings: BookingForEmergency[]): boolean {
  if (!bookings || bookings.length === 0) return false;
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;
  const threeHoursMs = 3 * 60 * 60 * 1000;

  for (const b of bookings) {
    const status = (b.status || '').toLowerCase();
    const start = b.scheduledTime || b.startTime || b.bookingDate || b.createdAt;
    const endTime = b.completedAt || (start && b.duration ? new Date(new Date(start).getTime() + b.duration * 60000).toISOString() : null);

    // 1 hour before scheduled start
    if (start) {
      const startMs = new Date(start).getTime();
      if (now >= startMs - oneHourMs && now <= startMs + (b.duration || 60) * 60000) return true;
    }

    // During session: confirmed/active/in_progress
    if (['confirmed', 'active', 'in_progress', 'in-progress', 'completed'].includes(status) && start) {
      const startMs = new Date(start).getTime();
      const durationMs = (b.duration || 60) * 60 * 1000;
      const endMs = startMs + durationMs;
      if (now >= startMs && now <= endMs) return true;
    }

    // 3 hours after session end
    if (endTime) {
      const endMs = new Date(endTime).getTime();
      if (now >= endMs && now <= endMs + threeHoursMs) return true;
    }
    // Immediate booking (no scheduledTime but has createdAt): active for 3h after creation (treat as "session")
    if (!b.scheduledTime && b.createdAt && ['confirmed', 'active', 'pending'].includes(status)) {
      const createdMs = new Date(b.createdAt).getTime();
      if (now <= createdMs + threeHoursMs) return true;
    }
  }
  return false;
}

export interface EmergencyAlertPayload {
  therapistId: string;
  therapistName: string;
  providerType: 'therapist' | 'place';
  lat: number;
  lng: number;
  triggeredAt: string;
  bookingId?: string;
  customerName?: string;
  bookingSummary?: string;
}

/**
 * Create an emergency alert document and notify admin (document is read by admin dashboard).
 */
export async function triggerEmergencyAlert(payload: EmergencyAlertPayload): Promise<{ success: boolean; alertId?: string; error?: string }> {
  try {
    const db = getDatabases() as any;
    const dbId = DB_ID();
    const coll = COLLECTION();
    const doc = {
      therapistId: payload.therapistId,
      therapistName: payload.therapistName,
      providerType: payload.providerType,
      lat: payload.lat,
      lng: payload.lng,
      triggeredAt: payload.triggeredAt,
      bookingId: payload.bookingId || '',
      customerName: payload.customerName || '',
      bookingSummary: payload.bookingSummary || '',
      status: 'pending',
    };
    const created = await db.createDocument(dbId, coll, ID.unique(), doc as any);
    console.log('🚨 [EMERGENCY] Alert created:', created.$id);
    return { success: true, alertId: created.$id };
  } catch (e: any) {
    console.error('❌ [EMERGENCY] Failed to create alert:', e);
    return { success: false, error: e?.message || 'Failed to create emergency alert' };
  }
}

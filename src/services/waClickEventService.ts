/**
 * WhatsApp click event logging for Indonesia admin real-time alerts.
 * Fire-and-forget: never blocks redirect (max ~200ms rule).
 */

import { databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwriteClient';

export type WaClickSource = 'profile_button' | 'slider_booking';

export interface WaClickEventPayload {
  profileId: string;
  therapistName: string;
  city: string;
  country: string;
  source: WaClickSource;
}

/**
 * Logs a WhatsApp button click to Appwrite (wa_click_events).
 * Call this then immediately redirect; do not await.
 */
export function logWaClickEvent(payload: WaClickEventPayload): void {
  const docId = ID.unique();
  const timestamp = Math.floor(Date.now() / 1000);

  databases
    .createDocument(DATABASE_ID, COLLECTIONS.WA_CLICK_EVENTS, docId, {
      profileId: payload.profileId,
      therapistName: payload.therapistName,
      city: payload.city,
      country: payload.country,
      source: payload.source,
      timestamp,
    })
    .catch(() => {
      // Fire-and-forget: avoid unhandled rejection; never block redirect
    });
}

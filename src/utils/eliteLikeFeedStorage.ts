/**
 * Storage for "like" events from massage place profile and therapist profile.
 * When a user likes a place or therapist, we push an event here; the social feed (IndonesiaLandingPage)
 * reads these and shows them as live feed posts.
 */

export const ELITE_LIKE_FEED_STORAGE_KEY = 'elite_like_feed_events';

export interface EliteLikeFeedEventPlace {
  entityType: 'place';
  placeId: string;
  placeName: string;
  placeImageUrl?: string;
  timestamp: number;
  description?: string;
  location?: string;
  starRating?: number;
  reviewCount?: number;
  bookedThisMonth?: number;
}

export interface EliteLikeFeedEventTherapist {
  entityType: 'therapist';
  therapistId: string;
  therapistName: string;
  therapistImageUrl?: string;
  timestamp: number;
  location?: string;
  rating?: number;
  reviewCount?: number;
}

export type EliteLikeFeedEvent = EliteLikeFeedEventPlace | EliteLikeFeedEventTherapist;

/** @deprecated Use EliteLikeFeedEventPlace - kept for type compatibility */
export interface EliteLikeFeedEventLegacy {
  placeId: string;
  placeName: string;
  placeImageUrl?: string;
  timestamp: number;
  description?: string;
  location?: string;
  starRating?: number;
  reviewCount?: number;
  bookedThisMonth?: number;
}

export function getEliteLikeEvents(): EliteLikeFeedEvent[] {
  try {
    const raw = localStorage.getItem(ELITE_LIKE_FEED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (EliteLikeFeedEvent | EliteLikeFeedEventLegacy)[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e) => {
      if ('entityType' in e && e.entityType) return e as EliteLikeFeedEvent;
      const leg = e as EliteLikeFeedEventLegacy;
      return { entityType: 'place' as const, ...leg } as EliteLikeFeedEventPlace;
    });
  } catch {
    return [];
  }
}

export function addEliteLikeEvent(event: Omit<EliteLikeFeedEventPlace, 'timestamp' | 'entityType'>): boolean {
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const events = getEliteLikeEvents();
  const recentForPlace = events.find(
    (e) => e.entityType === 'place' && e.placeId === event.placeId && now - e.timestamp < ONE_HOUR_MS
  );
  if (recentForPlace) return false;
  const withTimestamp: EliteLikeFeedEventPlace = { entityType: 'place', ...event, timestamp: now };
  const rest = events.filter((e) => !(e.entityType === 'place' && e.placeId === event.placeId));
  const next = [...rest, withTimestamp].sort((a, b) => b.timestamp - a.timestamp);
  try {
    localStorage.setItem(ELITE_LIKE_FEED_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return true;
}

export function removeEliteLikeEvent(placeId: string): void {
  const events = getEliteLikeEvents().filter(
    (e) => !(e.entityType === 'place' && e.placeId === placeId)
  );
  try {
    localStorage.setItem(ELITE_LIKE_FEED_STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

export function addTherapistLikeEvent(
  event: Omit<EliteLikeFeedEventTherapist, 'timestamp' | 'entityType'>
): boolean {
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const events = getEliteLikeEvents();
  const recentForTherapist = events.find(
    (e) =>
      e.entityType === 'therapist' &&
      e.therapistId === event.therapistId &&
      now - e.timestamp < ONE_HOUR_MS
  );
  if (recentForTherapist) return false;
  const withTimestamp: EliteLikeFeedEventTherapist = {
    entityType: 'therapist',
    ...event,
    timestamp: now,
  };
  const rest = events.filter(
    (e) => !(e.entityType === 'therapist' && e.therapistId === event.therapistId)
  );
  const next = [...rest, withTimestamp].sort((a, b) => b.timestamp - a.timestamp);
  try {
    localStorage.setItem(ELITE_LIKE_FEED_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return true;
}

export function removeTherapistLikeEvent(therapistId: string): void {
  const events = getEliteLikeEvents().filter(
    (e) => !(e.entityType === 'therapist' && e.therapistId === therapistId)
  );
  try {
    localStorage.setItem(ELITE_LIKE_FEED_STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

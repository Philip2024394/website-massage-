/**
 * Storage for "like" events from massage place profile.
 * When a user likes a place, we push an event here; the social feed (IndonesiaLandingPage)
 * reads these and shows them as live feed posts.
 */

export const ELITE_LIKE_FEED_STORAGE_KEY = 'elite_like_feed_events';

export interface EliteLikeFeedEvent {
  placeId: string;
  placeName: string;
  placeImageUrl?: string;
  timestamp: number;
}

export function getEliteLikeEvents(): EliteLikeFeedEvent[] {
  try {
    const raw = localStorage.getItem(ELITE_LIKE_FEED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EliteLikeFeedEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addEliteLikeEvent(event: Omit<EliteLikeFeedEvent, 'timestamp'>): boolean {
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const events = getEliteLikeEvents();
  const recentForPlace = events.find((e) => e.placeId === event.placeId && now - e.timestamp < ONE_HOUR_MS);
  if (recentForPlace) return false; // Already posted for this place in the last hour
  const withTimestamp: EliteLikeFeedEvent = { ...event, timestamp: now };
  const rest = events.filter((e) => e.placeId !== event.placeId);
  const next = [...rest, withTimestamp].sort((a, b) => b.timestamp - a.timestamp);
  try {
    localStorage.setItem(ELITE_LIKE_FEED_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return true;
}

export function removeEliteLikeEvent(placeId: string): void {
  const events = getEliteLikeEvents().filter((e) => e.placeId !== placeId);
  try {
    localStorage.setItem(ELITE_LIKE_FEED_STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

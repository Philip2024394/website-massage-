/**
 * Proximity / contact-sharing violation rules for IndaStreet.
 * Used by admin tooling and any backend that evaluates proximity between
 * guest and provider (therapist/place) for terms compliance.
 *
 * - Tracking is active only after PROXIMITY_GRACE_HOURS_AFTER_FIRST_BOOKING
 *   have passed since the first completed/online booking between that user and that provider.
 * - Distance tiers: 1 = within 20m, 2 = within 15m, 3 = within 10m (closer = higher tier).
 * - Admin may override or delete violation counts at any time.
 */

/** Hours after the first booking (user + provider) before proximity tracking is active. */
export const PROXIMITY_GRACE_HOURS_AFTER_FIRST_BOOKING = 10;

/** Distance thresholds in meters. Index 0 = tier 1, 1 = tier 2, 2 = tier 3. */
export const PROXIMITY_DISTANCE_METERS = [20, 15, 10] as const;

/** Tier 1 = within 20m, Tier 2 = within 15m, Tier 3 = within 10m. */
export type ProximityTier = 1 | 2 | 3;

export const PROXIMITY_TIERS: Record<ProximityTier, number> = {
  1: 20,
  2: 15,
  3: 10,
};

/**
 * Returns the tier (1, 2, or 3) for a given distance in meters.
 * - distance <= 10m → 3
 * - distance <= 15m → 2
 * - distance <= 20m → 1
 * - distance > 20m → null (no violation)
 */
export function getProximityTier(distanceMeters: number): ProximityTier | null {
  if (distanceMeters <= 10) return 3;
  if (distanceMeters <= 15) return 2;
  if (distanceMeters <= 20) return 1;
  return null;
}

/**
 * Check if proximity tracking is active for this user–provider pair.
 * Must be called with the timestamp of the first completed/confirmed booking
 * between this customer and this provider (from your bookings data).
 */
export function isProximityTrackingActive(firstBookingCompletedAt: string | Date | null): boolean {
  if (!firstBookingCompletedAt) return false;
  const at = typeof firstBookingCompletedAt === 'string' ? new Date(firstBookingCompletedAt) : firstBookingCompletedAt;
  const graceEnd = at.getTime() + PROXIMITY_GRACE_HOURS_AFTER_FIRST_BOOKING * 60 * 60 * 1000;
  return Date.now() >= graceEnd;
}

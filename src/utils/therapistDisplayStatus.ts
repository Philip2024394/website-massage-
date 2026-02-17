/**
 * Therapist display status for massage/facial home service (Indonesia, per location).
 *
 * - real_status: true = online and can receive bookings (from Appwrite).
 * - display_status: "Available" | "Busy" — what users see.
 *
 * Business rule: Therapist and facial home service display as Available all the time until
 * the user does Book now, Order now, or Scheduled booking (then the assigned provider may show Busy).
 * No rotation to Busy; all live profiles show Available.
 */

export type DisplayStatus = 'Available' | 'Busy';

/**
 * Get therapist location key (city / locationId / location) for grouping.
 */
export function getLocationKey(t: Record<string, unknown>): string {
  const raw =
    (t.city as string) ||
    (t.locationId as string) ||
    (t.location_id as string) ||
    (t.location as string) ||
    '';
  return String(raw).toLowerCase().trim() || 'unknown';
}

/**
 * Derive real_status from Appwrite data: true = can receive bookings.
 */
export function getRealStatus(t: Record<string, unknown>): boolean {
  const status = String((t.status ?? t.availability ?? '') || '').toLowerCase();
  const isLive = t.isLive === true || t.isLive === 'true';
  if (status === 'available' || status === 'online') return true;
  if (status === 'offline' || status === '') return false;
  return isLive;
}

/**
 * performance_level from Appwrite: "top" = top-performing, never show Busy; else "normal".
 */
export function getPerformanceLevel(t: Record<string, unknown>): string {
  const level = String((t.performance_level ?? t.performanceLevel ?? '') || '').toLowerCase().trim();
  return level === 'top' ? 'top' : 'normal';
}

/**
 * service_type: "massage" | "facial" for home service.
 */
export function getServiceType(t: Record<string, unknown>): string {
  const s = String((t.service_type ?? t.serviceType ?? '') || 'massage').toLowerCase().trim();
  return s === 'facial' ? 'facial' : 'massage';
}

/**
 * Compute display_status for one therapist.
 * All live therapists show "Available" until Book now / Order now / Scheduled booking (no rotation).
 * - real_status false (offline/not live): show "Busy" (not bookable).
 * - real_status true: always "Available".
 */
export function computeDisplayStatus(
  therapist: Record<string, unknown>,
  _allInSameLocation?: Record<string, unknown>[]
): DisplayStatus {
  const real = getRealStatus(therapist);
  if (!real) return 'Busy';
  return 'Available';
}

/**
 * Apply display_status and real_status to a list of therapists (per location).
 * Call this when building the therapist list for the home page or booking.
 */
export function applyDisplayStatusToTherapists<T extends Record<string, unknown>>(
  list: T[]
): (T & { real_status: boolean; display_status: DisplayStatus; performance_level: string; service_type: string })[] {
  const byLocation = new Map<string, T[]>();
  for (const t of list) {
    const key = getLocationKey(t);
    if (!byLocation.has(key)) byLocation.set(key, []);
    byLocation.get(key)!.push(t);
  }

  return list.map((t) => {
    const locationKey = getLocationKey(t);
    const inLocation = byLocation.get(locationKey) ?? [t];
    const real_status = getRealStatus(t);
    const performance_level = getPerformanceLevel(t);
    const service_type = getServiceType(t);
    const display_status = computeDisplayStatus(t, inLocation);

    return {
      ...t,
      real_status,
      display_status,
      performance_level,
      service_type
    } as T & {
      real_status: boolean;
      display_status: DisplayStatus;
      performance_level: string;
      service_type: string;
    };
  });
}

/**
 * Whether a therapist can be offered a booking: real_status true and display_status Available.
 */
export function canReceiveBooking(t: Record<string, unknown>): boolean {
  const real = 'real_status' in t ? (t.real_status as boolean) : getRealStatus(t);
  const display =
    (t.display_status as DisplayStatus) ??
    computeDisplayStatus(t, [t]);
  return real === true && display === 'Available';
}

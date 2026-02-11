export interface StoredUserLocation {
  cityId: string;
  cityName: string;
  latitude: number | null;
  longitude: number | null;
  locationText: string | null;
  confirmedAt: string;
}

const STORAGE_KEY = 'user_location_context_v1';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadUserLocation(): StoredUserLocation | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUserLocation;
    if (parsed && parsed.cityId && parsed.cityName) {
      return {
        cityId: parsed.cityId,
        cityName: parsed.cityName,
        latitude: typeof parsed.latitude === 'number' ? parsed.latitude : null,
        longitude: typeof parsed.longitude === 'number' ? parsed.longitude : null,
        locationText: typeof parsed.locationText === 'string' ? parsed.locationText : null,
        confirmedAt: parsed.confirmedAt || new Date().toISOString()
      };
    }
  } catch {
    // ignore corrupted data
    return null;
  }
  return null;
}

export function saveUserLocation(location: StoredUserLocation): void {
  if (!isBrowser) return;
  try {
    const payload: StoredUserLocation = {
      cityId: location.cityId,
      cityName: location.cityName,
      latitude: typeof location.latitude === 'number' ? location.latitude : null,
      longitude: typeof location.longitude === 'number' ? location.longitude : null,
      locationText: location.locationText ?? null,
      confirmedAt: location.confirmedAt || new Date().toISOString()
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // swallow storage errors (private mode, quota, etc.)
  }
}

export function clearUserLocation(): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

import { calculateDistance, extractGeopoint } from './geoDistance';
import { convertLocationStringToId } from './locationNormalizationV2';
import type { TherapistData } from '../types';

type Therapist = TherapistData & Record<string, any>;

type NormalizedStatus = 'available' | 'busy' | 'offline' | 'unknown';
type MatchType = 'distance' | 'city' | 'placeholder';

export interface UserLocationContext {
  cityId: string;
  cityName: string;
  latitude?: number | null;
  longitude?: number | null;
  locationText?: string | null;
}

export interface MatchOptions {
  radiusKm?: number;
  minResults?: number;
  maxResults?: number;
}

export interface MatchedTherapist<T = Therapist> extends T {
  _matchType: MatchType;
  _distanceKm: number | null;
  _locationArea: string | null;
  _bookable: boolean;
  _statusNormalized: NormalizedStatus;
  _isPlaceholder?: boolean;
  _reason?: string;
}

export interface MatchOutcome {
  matches: MatchedTherapist[];
  distanceMatches: MatchedTherapist[];
  cityMatches: MatchedTherapist[];
  placeholders: MatchedTherapist[];
  stats: {
    total: number;
    distanceCount: number;
    cityCount: number;
    placeholderCount: number;
  };
}

const DEFAULT_RADIUS_KM = 8;
const DEFAULT_MIN_RESULTS = 5;
const DEFAULT_MAX_RESULTS = 12;
const PLACEHOLDER_COUNT = 5;

const ACTIVE_STRINGS = new Set(['true', '1', 'yes', 'active', 'enabled', 'live']);

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized.length === 0) return fallback;
    if (ACTIVE_STRINGS.has(normalized)) return true;
    if (['false', '0', 'no', 'disabled', 'inactive'].includes(normalized)) return false;
  }
  return fallback;
};

const getTherapistId = (therapist: Therapist): string | null => {
  const raw = therapist.$id || therapist.id || therapist.uuid || therapist.slug || null;
  return raw ? String(raw) : null;
};

const isAccountActive = (therapist: Therapist): boolean => {
  if (therapist == null) return false;
  if ('accountActive' in therapist) {
    return toBoolean((therapist as any).accountActive, true);
  }
  if ('account_active' in therapist) {
    return toBoolean((therapist as any).account_active, true);
  }
  if ('accountStatus' in therapist) {
    return String((therapist as any).accountStatus).toLowerCase() === 'active';
  }
  return true;
};

const normalizeStatus = (therapist: Therapist): NormalizedStatus => {
  const raw =
    therapist.status ??
    therapist.displayStatus ??
    therapist.availability ??
    therapist.availabilityStatus ??
    therapist.display_status ??
    therapist._status ??
    therapist.state ??
    '';

  const value = String(raw).trim().toLowerCase();
  if (['available', 'online', 'ready', 'open'].includes(value)) return 'available';
  if (['busy', 'booked', 'occupied', 'ontrip'].includes(value)) return 'busy';
  if (['offline', 'inactive', 'hidden', 'suspended', 'disabled'].includes(value)) return 'offline';
  return 'unknown';
};

const parseLocationId = (therapist: Therapist): string | null => {
  const raw =
    therapist.locationId ??
    therapist.location_id ??
    therapist.location ??
    therapist.city ??
    therapist._locationArea ??
    null;

  if (!raw) return null;
  return convertLocationStringToId(String(raw));
};

const buildMatchEntry = (
  therapist: Therapist,
  matchType: MatchType,
  locationId: string | null,
  status: NormalizedStatus,
  distanceKm: number | null,
  accountActive: boolean
): MatchedTherapist => {
  const isBookable = accountActive && status === 'available';
  const entry: MatchedTherapist = {
    ...(therapist as Therapist),
    _matchType: matchType,
    _distanceKm: distanceKm,
    _locationArea: locationId,
    _bookable: isBookable,
    _statusNormalized: status
  };

  // Ensure downstream UI has consistent status visibility
  if ((entry as any).displayStatus == null) {
    (entry as any).displayStatus = status;
  }

  if ((entry as any).chatDisabled == null) {
    (entry as any).chatDisabled = !isBookable;
  }

  return entry;
};

const sortDistanceMatches = (matches: MatchedTherapist[]): MatchedTherapist[] =>
  matches.sort((a, b) => {
    const distanceA = a._distanceKm ?? Number.POSITIVE_INFINITY;
    const distanceB = b._distanceKm ?? Number.POSITIVE_INFINITY;
    if (distanceA !== distanceB) return distanceA - distanceB;
    if (a._bookable !== b._bookable) return a._bookable ? -1 : 1;
    const nameA = String((a as any).name || '').toLowerCase();
    const nameB = String((b as any).name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

const sortCityMatches = (matches: MatchedTherapist[]): MatchedTherapist[] =>
  matches.sort((a, b) => {
    if (a._bookable !== b._bookable) return a._bookable ? -1 : 1;
    const nameA = String((a as any).name || '').toLowerCase();
    const nameB = String((b as any).name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

const createPlaceholder = (
  index: number,
  userLocation: UserLocationContext
): MatchedTherapist => {
  const id = `placeholder-${userLocation.cityId}-${index}`;
  const name = `Therapist slot ${index}`;
  const description = `We are onboarding therapists in ${userLocation.cityName}.`;

  const placeholder: MatchedTherapist = {
    id,
    $id: id,
    name,
    city: userLocation.cityName,
    locationId: userLocation.cityId,
    location: userLocation.cityName,
    pricing: { '60': 0, '90': 0, '120': 0 },
    specialties: [],
    availabilityStatus: 'OFFLINE',
    status: 'busy',
    displayStatus: 'busy',
    accountActive: false,
    isVerified: false,
    headline: description,
    description,
    chatDisabled: true,
    _matchType: 'placeholder',
    _distanceKm: null,
    _locationArea: userLocation.cityId,
    _bookable: false,
    _statusNormalized: 'busy',
    _isPlaceholder: true,
    _reason: 'placeholder'
  } as MatchedTherapist;

  return placeholder;
};

const hasCoordinates = (location?: { lat?: number | null; lng?: number | null } | null): boolean =>
  !!location && typeof location.lat === 'number' && typeof location.lng === 'number';

const getUserCoordinates = (user: UserLocationContext): { lat: number; lng: number } | null => {
  if (typeof user.latitude === 'number' && typeof user.longitude === 'number') {
    return { lat: user.latitude, lng: user.longitude };
  }
  return null;
};

export function matchTherapistsForUser(
  therapists: Therapist[] = [],
  userLocation: UserLocationContext | null,
  options: MatchOptions = {}
): MatchOutcome {
  const radiusKm = Math.max(options.radiusKm ?? DEFAULT_RADIUS_KM, 1);
  const minResults = Math.max(options.minResults ?? DEFAULT_MIN_RESULTS, 1);
  const maxResults = Math.max(options.maxResults ?? DEFAULT_MAX_RESULTS, minResults);

  if (!userLocation || !userLocation.cityId) {
    return {
      matches: [],
      distanceMatches: [],
      cityMatches: [],
      placeholders: [],
      stats: {
        total: 0,
        distanceCount: 0,
        cityCount: 0,
        placeholderCount: 0
      }
    };
  }

  const distanceMatches: MatchedTherapist[] = [];
  const cityMatches: MatchedTherapist[] = [];
  const seenTherapists = new Set<string>();

  const userCoords = getUserCoordinates(userLocation);

  therapists.forEach((therapistRaw) => {
    const therapistId = getTherapistId(therapistRaw);
    if (!therapistId) return;
    if (seenTherapists.has(therapistId)) return;

    const locationId = parseLocationId(therapistRaw);
    if (!locationId) return;

    const accountActive = isAccountActive(therapistRaw);
    if (!accountActive) return;

    const status = normalizeStatus(therapistRaw);
    if (status === 'offline') return;

    const geopoint = extractGeopoint(therapistRaw);
    const therapistHasCoords = hasCoordinates(geopoint);

    let distanceKm: number | null = null;
    let isDistanceMatch = false;

    if (userCoords && therapistHasCoords) {
      distanceKm = calculateDistance(userCoords, geopoint as { lat: number; lng: number }) / 1000;
      if (distanceKm <= radiusKm) {
        isDistanceMatch = true;
      }
    }

    const matchType: MatchType = isDistanceMatch ? 'distance' : 'city';
    const matchEntry = buildMatchEntry(
      therapistRaw,
      matchType,
      locationId,
      status,
      distanceKm,
      accountActive
    );

    if (isDistanceMatch) {
      distanceMatches.push(matchEntry);
      seenTherapists.add(therapistId);
      return;
    }

    if (locationId === userLocation.cityId) {
      cityMatches.push(matchEntry);
      seenTherapists.add(therapistId);
    }
  });

  const sortedDistanceMatches = sortDistanceMatches(distanceMatches);
  const sortedCityMatches = sortCityMatches(cityMatches);

  const combined: MatchedTherapist[] = [];
  sortedDistanceMatches.forEach((match) => combined.push(match));

  const remainingSlots = Math.max(maxResults - combined.length, 0);
  if (remainingSlots > 0) {
    sortedCityMatches.slice(0, remainingSlots).forEach((match) => combined.push(match));
  }

  const ensuredMinimum =
    combined.length >= minResults
      ? combined
      : [
          ...combined,
          ...sortedCityMatches.slice(combined.length, minResults).filter(Boolean)
        ].slice(0, maxResults);

  let placeholders: MatchedTherapist[] = [];
  let matches = ensuredMinimum;

  if (matches.length === 0) {
    placeholders = Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) =>
      createPlaceholder(index + 1, userLocation)
    );
    matches = placeholders;
  }

  return {
    matches,
    distanceMatches: sortedDistanceMatches,
    cityMatches: sortedCityMatches,
    placeholders,
    stats: {
      total: matches.length,
      distanceCount: sortedDistanceMatches.length,
      cityCount: sortedCityMatches.length,
      placeholderCount: placeholders.length
    }
  };
}

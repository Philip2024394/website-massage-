import { logger } from './enterpriseLogger';
import type { LocationError } from './locationService';

export type Coordinates = { lat: number; lng: number };

export interface ProximitySample {
    coords: Coordinates;
    accuracy?: number | null;
    timestamp: string;
    distanceToTarget?: number | null;
}

export interface ProximityTrackerOptions {
    role: 'customer' | 'therapist';
    target?: Coordinates; // Destination to measure against (typically the customer's location)
    radiusMeters?: number; // Arrival threshold
    onUpdate?: (sample: ProximitySample) => void;
    onArrived?: (sample: ProximitySample) => void;
    highAccuracy?: boolean;
}

export interface ProximityTracker {
    start: () => void;
    stop: () => void;
    getLastSample: () => ProximitySample | null;
}

const EARTH_RADIUS_METERS = 6371000;

export function metersBetween(a: Coordinates, b: Coordinates): number {
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);

    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);

    const haversine = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return EARTH_RADIUS_METERS * c;
}

export function isWithinRadius(a: Coordinates, b: Coordinates, radiusMeters = 20): boolean {
    return metersBetween(a, b) <= radiusMeters;
}

function toRadians(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Lightweight proximity tracker that uses browser geolocation with a watch + periodic pull.
 * Keeps CPU/battery modest and calls `onArrived` once when inside the threshold.
 */
export function createProximityTracker(options: ProximityTrackerOptions): ProximityTracker {
    let watchId: number | null = null;
    let intervalId: number | null = null;
    let lastSample: ProximitySample | null = null;
    let arrivalEmitted = false;

    const radius = options.radiusMeters ?? 20;
    const geoOptions: PositionOptions = {
        enableHighAccuracy: options.highAccuracy ?? true,
        timeout: 15000,
        maximumAge: 15000
    };

    const handlePosition = (position: GeolocationPosition) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        const accuracy = position.coords.accuracy ?? null;
        const distanceToTarget = options.target ? metersBetween(coords, options.target) : null;

        const sample: ProximitySample = {
            coords,
            accuracy,
            timestamp: new Date().toISOString(),
            distanceToTarget
        };

        lastSample = sample;
        options.onUpdate?.(sample);

        if (arrivalEmitted) return;
        if (distanceToTarget !== null && distanceToTarget <= radius) {
            const accuracyOk = accuracy === null || accuracy <= radius * 4;
            if (accuracyOk) {
                arrivalEmitted = true;
                options.onArrived?.(sample);
            }
        }
    };

    const handleError = (error: GeolocationPositionError | LocationError) => {
        // Non-fatal: consumers can surface errors separately if needed
        logger.warn('📍 Proximity tracker geolocation error:', error);
    };

    const start = () => {
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            logger.warn('📍 Proximity tracker: geolocation unavailable');
            return;
        }

        try {
            watchId = navigator.geolocation.watchPosition(handlePosition, handleError, geoOptions);
        } catch (err) {
            logger.warn('📍 Proximity tracker failed to start watch:', err);
        }

        // Periodic pull to refresh in case watch is throttled by the browser
        intervalId = window.setInterval(() => {
            navigator.geolocation.getCurrentPosition(handlePosition, handleError, geoOptions);
        }, 30000);
    };

    const stop = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    };

    const getLastSample = () => lastSample;

    return {
        start,
        stop,
        getLastSample
    };
}

import type { Therapist } from '../types';
import { AvailabilityStatus } from '../types';
import { devLog } from './devMode';

/**
 * Get auth app URL for development and production
 */
export const getAuthAppUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_AUTH_APP_URL;
  if (envUrl) return envUrl;

  const { origin } = window.location;

  // If running locally and no env override, default auth app port 3001
  if (origin.includes('localhost')) {
    return 'http://localhost:3001';
  }

  // Production fallback: same origin
  return origin;
};

/**
 * Utility function to determine display status
 */
export const getDisplayStatus = (therapist: Therapist): AvailabilityStatus => {
    // Check if therapist has a busyUntil timestamp and is still busy
    if (therapist.busyUntil) {
        const busyUntil = new Date(therapist.busyUntil);
        if (!isNaN(busyUntil.getTime()) && busyUntil > new Date()) {
            return AvailabilityStatus.Busy;
        }
    }
    
    // Legacy: If therapist has an explicit bookedUntil timestamp in the future, show Busy
    try {
        const bookedUntil = (therapist as any).bookedUntil;
        if (bookedUntil) {
            const until = new Date(bookedUntil);
            if (!isNaN(until.getTime()) && until > new Date()) {
                return AvailabilityStatus.Busy;
            }
        }
    } catch {
        // ignore parsing errors
    }

    // Use availability field (has proper default) or status as fallback
    // Default to Available instead of Offline to prevent therapists going offline on refresh
    const currentStatus = (therapist as any).availability || therapist.status || AvailabilityStatus.Available;
    
    // Debug status in development mode (reduced verbosity)
    if (process.env.NODE_ENV === 'development' && therapist.name && therapist.name.toLowerCase().includes('budi')) {
        devLog(`🔍 ${therapist.name} getDisplayStatus: ${currentStatus}`);
    }
    
    return currentStatus;
};

/**
 * Helper function to check if discount is currently active
 */
export const isDiscountActive = (therapist: Therapist): boolean => {
    const hasDiscountData = !!(
        therapist.discountPercentage && 
        therapist.discountPercentage > 0 && 
        therapist.discountEndTime &&
        therapist.isDiscountActive === true // Check the boolean flag
    );
    
    if (!hasDiscountData) return false;
    
    // Check if discount hasn't expired
    const now = new Date();
    const endTime = therapist.discountEndTime ? new Date(therapist.discountEndTime) : null;
    const notExpired = endTime && !isNaN(endTime.getTime()) && endTime > now;
    
    const result = Boolean(hasDiscountData && notExpired);
    
    // Debug logging for phil10 specifically
    if (therapist.name === 'phil10' || (therapist as any).$id === '6912d611003551067831') {
        devLog('🔍 DISCOUNT DEBUG - isDiscountActive check:', {
            therapistId: therapist.$id || therapist.id,
            therapistName: therapist.name,
            discountPercentage: therapist.discountPercentage,
            discountEndTime: therapist.discountEndTime,
            isDiscountActiveFlag: therapist.isDiscountActive,
            hasDiscountData,
            notExpired,
            finalResult: result,
            currentTime: now.toISOString(),
            endTimeObj: endTime ? endTime.toISOString() : null
        });
    }
    
    return result;
};

/**
 * Get translated description based on current language
 */
export const getTranslatedDescription = (therapist: Therapist, language: 'en' | 'id'): string => {
  const fallbackDesc = `Certified massage therapist with ${
    therapist.yearsOfExperience || 5
  }+ years experience. Specialized in therapeutic and relaxation techniques. Available for home, hotel, and villa services. Professional, licensed, and highly rated by clients for exceptional service quality.`;

  if (language === 'id') {
    return therapist.description_id || therapist.description || fallbackDesc;
  } else {
    return therapist.description_en || therapist.description || fallbackDesc;
  }
};

/**
 * Format price with Indonesian locale
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price);
};

/**
 * Get location city from full location string
 */
export const getLocationCity = (location?: string): string => {
  if (!location) return '';
  return String(location).split(',')[0].trim();
};

/**
 * Get joined date display
 */
export const getJoinedDateDisplay = (therapist: Therapist): string => {
  const joinedDateRaw =
    therapist.membershipStartDate || therapist.activeMembershipDate || (therapist as any).$createdAt;

  if (!joinedDateRaw) return '—';

  try {
    const d = new Date(joinedDateRaw);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB');
  } catch {
    return '—';
  }
};

/**
 * Calculate dynamic spacing based on description length
 */
export const getDynamicSpacing = (
  descriptionLength: number,
  longSpacing: string,
  mediumSpacing: string,
  shortSpacing: string
): string => {
  // If description is short (less than 200 chars), use minimum spacing
  if (descriptionLength < 200) return shortSpacing;
  // If description is medium (200-300 chars), use reduced spacing
  if (descriptionLength < 300) return mediumSpacing;
  // If description is long (300+ chars), use standard spacing
  return longSpacing;
};

/**
 * Format countdown timer
 */
export const formatCountdown = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

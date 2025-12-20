import type { Therapist } from '../types';

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

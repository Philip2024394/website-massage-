import type { Therapist } from '../types';
import { AvailabilityStatus } from '../types';
import { devLog } from './devMode';
import { getSampleMenuItems } from './samplePriceUtils';

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
    
    // 🎭 80% OFFLINE → BUSY DISPLAY RULE (THERAPIST_AUTO_OFFLINE_TIMER_DISABLED.md)
    // Show 80% of offline therapists as "Busy" to customers (UI-only, non-persistent)
    // This improves marketplace appearance while respecting therapist's actual offline status
    if (currentStatus === AvailabilityStatus.Offline || String(currentStatus).toLowerCase() === 'offline') {
        // Use therapist ID hash for deterministic 80/20 split (same therapist always shows same status)
        const therapistId = (therapist as any).$id || therapist.id || '';
        const hash = therapistId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const shouldShowAsBusy = (hash % 100) < 80; // 80% will show as busy
        
        if (shouldShowAsBusy) {
            // Show as Busy in UI (actual status remains Offline in database)
            return AvailabilityStatus.Busy;
        }
        // Remaining 20% show actual Offline status
    }
    
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

/**
 * Normalize service/massage name from menu item (name, serviceName, or title).
 */
export const getMenuItemDisplayName = (item: { name?: string; serviceName?: string; title?: string }): string => {
  const raw = (item?.name ?? item?.serviceName ?? item?.title ?? '').toString().trim();
  return raw || 'Traditional Massage';
};

/**
 * Deduplicate menu items by display name so the same massage type is not shown twice
 * on profile or in the price slider. Keeps the cheapest item per name (by 60-min price).
 */
export const getUniqueMenuItemsByName = (menuData: any[]): any[] => {
  if (!menuData?.length) return [];
  const byName = new Map<string, any>();
  for (const item of menuData) {
    const name = getMenuItemDisplayName(item);
    const price60 = parseFloat(item?.price60) ?? 999999;
    const existing = byName.get(name);
    const existingPrice = existing != null ? parseFloat(existing?.price60) ?? 999999 : 999999;
    if (existing == null || price60 < existingPrice) {
      byName.set(name, {
        ...item,
        name,
        serviceName: item?.serviceName ?? item?.name ?? item?.title ?? name
      });
    }
  }
  return Array.from(byName.values());
};

/**
 * Deduplicate massage type strings (e.g. for place cards) so the same type is not shown twice.
 */
export const getUniqueMassageTypes = (types: string[]): string[] => {
  if (!Array.isArray(types) || types.length === 0) return [];
  const seen = new Set<string>();
  return types.filter((t) => {
    const n = String(t ?? '').trim();
    if (!n || seen.has(n)) return false;
    seen.add(n);
    return true;
  });
};

/**
 * Sum of 60+90+120 for a menu item (prices typically in thousands). Used to find lowest-total service.
 */
function totalPrice(item: { price60?: any; price90?: any; price120?: any }): number {
  const p60 = parseFloat(item?.price60) || 0;
  const p90 = parseFloat(item?.price90) || 0;
  const p120 = parseFloat(item?.price120) || 0;
  return p60 + p90 + p120;
}

/** Menu item shape for display (prices in thousands for comparison). */
export interface CombinedMenuItem {
  price60: number;
  price90: number;
  price120: number;
  name?: string;
  serviceName?: string;
  title?: string;
}

/**
 * Build the same combined list as the menu slider: real saved items first, then fill to 5 with
 * default items (Traditional from profile when set, then sample items). When realCount >= 5, no
 * samples. Used so profile/home/shared pick cheapest from this full set.
 */
export function getCombinedMenuForDisplay(
  menuData: any[] | null | undefined,
  therapist: { price60?: string | number; price90?: string | number; price120?: string | number; $id?: string; id?: string }
): CombinedMenuItem[] {
  const therapistId = String(therapist?.$id ?? therapist?.id ?? '');
  const realItems: CombinedMenuItem[] = (menuData || [])
    .filter((item: any) => {
      const p60 = Number(item?.price60);
      const p90 = Number(item?.price90);
      const p120 = Number(item?.price120);
      return p60 > 0 && p90 > 0 && p120 > 0;
    })
    .map((item: any) => ({
      price60: Number(item.price60),
      price90: Number(item.price90),
      price120: Number(item.price120),
      name: item.name ?? item.serviceName ?? item.title,
      serviceName: item.serviceName ?? item.name ?? item.title,
      title: item.title ?? item.name ?? item.serviceName
    }));

  const fillCount = Math.max(0, 5 - realItems.length);
  if (fillCount === 0 || !therapistId) return realItems;

  const hasProfilePrices =
    Number(therapist?.price60) > 0 &&
    Number(therapist?.price90) > 0 &&
    Number(therapist?.price120) > 0;

  const defaultItems: CombinedMenuItem[] = [];
  if (hasProfilePrices) {
    defaultItems.push({
      price60: Math.max(100, Math.round(Number(therapist.price60))),
      price90: Math.max(100, Math.round(Number(therapist.price90))),
      price120: Math.max(100, Math.round(Number(therapist.price120))),
      name: 'Traditional Massage',
      serviceName: 'Traditional Massage',
      title: 'Traditional Massage'
    });
  }
  const samples = getSampleMenuItems(therapistId);
  const sampleCount = hasProfilePrices ? 4 : 5;
  for (let i = 0; i < sampleCount && i < samples.length; i++) {
    const s = samples[i];
    defaultItems.push({
      price60: Math.round(s.price60 / 1000),
      price90: Math.round(s.price90 / 1000),
      price120: Math.round(s.price120 / 1000),
      name: s.name,
      serviceName: s.name,
      title: s.name
    });
  }
  for (let i = 0; i < fillCount && i < defaultItems.length; i++) {
    realItems.push(defaultItems[i]);
  }
  return realItems;
}

/**
 * From menu items with full 60/90/120 pricing, return the one with the lowest total (60+90+120).
 * This is the service whose 3 prices are shown on home and profile cards, with its massage type name.
 * Includes Traditional Massage and any custom menu items.
 */
export function getCheapestServiceByTotalPrice<T extends { price60?: any; price90?: any; price120?: any }>(items: T[]): T | null {
  if (!items?.length) return null;
  return items.reduce((best, current) => {
    const bestSum = totalPrice(best);
    const currentSum = totalPrice(current);
    return currentSum < bestSum ? current : best;
  });
}

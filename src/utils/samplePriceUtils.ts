/**
 * Sample Menu Prices & Display Logic
 * 
 * Display-only sample prices for therapists who have not set their own prices.
 * Used on therapist home cards, profile pages, and booking chat.
 * 
 * Constraints:
 * - Base: 60min 130.000, 90min 155.000, 120min 190.000 IDR
 * - Variation: randomly ±5.000, ±8.000, or ±10.000 IDR per tier
 * - 5 sample menu items per therapist
 * - Deterministic per therapist ID (same therapist = same prices)
 */

const BASE_60 = 130000;
const BASE_90 = 155000;
const BASE_120 = 190000;

// Random variation: ±5.000, ±8.000, or ±10.000 IDR
const VARIATION_OPTIONS = [-10000, -5000, -8000, 10000, 5000, 8000];

export const SAMPLE_MASSAGE_NAMES = [
  'Traditional Massage',
  'Relaxation Massage',
  'Swedish Massage',
  'Aromatherapy Massage',
  'Deep Tissue Massage'
] as const;

/** When sample menu booking is shared/expired, always display this name */
export const SAMPLE_BOOKING_DISPLAY_NAME = 'Traditional Massage';

/** Check if service name is from a sample menu item (excluding Traditional Massage itself) */
export function isSampleMenuServiceName(serviceName: string | undefined): boolean {
  if (!serviceName?.trim()) return false;
  return SAMPLE_MASSAGE_NAMES.some(n => n.toLowerCase() === serviceName!.trim().toLowerCase());
}

export interface SampleMenuItem {
  name: string;
  price60: number;
  price90: number;
  price120: number;
}

export interface SamplePricing {
  "60": number;
  "90": number;
  "120": number;
  serviceName?: string;
}

/**
 * Create deterministic seed from therapist ID (same ID = same results)
 */
function createSeed(therapistId: string): number {
  let hash = 0;
  const str = String(therapistId || '');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Seeded random in range [min, max] - deterministic per seed
 */
function seededRange(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

/**
 * Pick a variation option (0-5 index) using seeded random
 */
function pickVariation(seed: number, index: number): number {
  const idx = seededRange(seed + index, 0, VARIATION_OPTIONS.length - 1);
  return VARIATION_OPTIONS[idx];
}

/**
 * Generate 5 sample menu items for a therapist (display-only).
 * Base: 60min 130k, 90min 155k, 120min 190k IDR with ±5k/8k/10k variation.
 */
export function getSampleMenuItems(therapistId: string): SampleMenuItem[] {
  const seed = createSeed(therapistId);
  const items: SampleMenuItem[] = [];

  for (let i = 0; i < 5; i++) {
    const itemSeed = seed + i * 7919; // Prime for better distribution

    const var60 = pickVariation(itemSeed, 0);
    const var90 = pickVariation(itemSeed + 1, 1);
    const var120 = pickVariation(itemSeed + 2, 2);

    const price60 = Math.max(50000, BASE_60 + var60);
    const price90 = Math.max(50000, BASE_90 + var90);
    const price120 = Math.max(50000, BASE_120 + var120);

    const nameIndex = (seed + i * 31) % SAMPLE_MASSAGE_NAMES.length;
    const name = SAMPLE_MASSAGE_NAMES[nameIndex];

    items.push({ name, price60, price90, price120 });
  }

  return items;
}

/**
 * Get lowest display pricing for a therapist with no prices.
 * Returns the cheapest 60/90/120 across 5 sample items.
 * Use ONLY when therapist has no actual prices set.
 */
export function getSamplePricing(therapistId: string): SamplePricing {
  const items = getSampleMenuItems(therapistId);

  const lowest = items.reduce((acc, item) => {
    if (item.price60 > 0 && item.price60 < acc.price60) {
      return { ...item };
    }
    return acc;
  }, items[0]);

  return {
    "60": lowest.price60,
    "90": lowest.price90,
    "120": lowest.price120,
    serviceName: lowest.name
  };
}

/**
 * Check if therapist has any valid pricing set.
 */
export function hasActualPricing(therapist: {
  price60?: string | number;
  price90?: string | number;
  price120?: string | number;
  pricing?: Record<string, number> | string;
}): boolean {
  const p60 = therapist.price60 != null && therapist.price60 !== '' && Number(therapist.price60) > 0;
  const p90 = therapist.price90 != null && therapist.price90 !== '' && Number(therapist.price90) > 0;
  const p120 = therapist.price120 != null && therapist.price120 !== '' && Number(therapist.price120) > 0;
  if (p60 || p90 || p120) return true;

  const p = therapist.pricing;
  if (typeof p === 'object' && p != null) {
    const k60 = (p as Record<string, number>)["60"];
    const k90 = (p as Record<string, number>)["90"];
    const k120 = (p as Record<string, number>)["120"];
    return (k60 != null && k60 > 0) || (k90 != null && k90 > 0) || (k120 != null && k120 > 0);
  }
  if (typeof p === 'string' && p.trim()) {
    try {
      const parsed = JSON.parse(p) as Record<string, number>;
      const k60 = parsed?.["60"]; const k90 = parsed?.["90"]; const k120 = parsed?.["120"];
      return (k60 != null && k60 > 0) || (k90 != null && k90 > 0) || (k120 != null && k120 > 0);
    } catch { return false; }
  }
  return false;
}

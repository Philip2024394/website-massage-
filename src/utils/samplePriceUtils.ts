/**
 * Sample Menu Prices & Display Logic
 *
 * Display-only sample prices for therapists who have not set their own prices.
 * Used on therapist home cards, profile pages, and booking chat.
 *
 * Base reference: Yogyakarta (cheapest market level).
 * Rule: ±10% random adjustment per therapist and per price container (except dashboard
 * upload profile containers – those show therapist-set 60/90/120).
 *
 * Constraints:
 * - Base: 60min 120,000 | 90min 150,000 | 120min 190,000 IDR
 * - Variation: ±10% per therapist per duration, deterministic from therapist ID
 * - Round to nearest 5,000 IDR
 * - 5 sample menu items with professional names
 */

/** Base reference prices (Yogyakarta – cheapest market level), IDR. */
const BASE_60 = 120000;
const BASE_90 = 150000;
const BASE_120 = 190000;

const ROUND_TO = 5000;

/** Professional sample massage names for auto-generated menu items. */
export const SAMPLE_MASSAGE_NAMES = [
  'Jet Lang Therapeutic Massage',
  'Office Recovery Massage',
  'Sleepers Deep Relax Massage',
  'Balance & Restore Wellness Therapy',
  'Vital Flow Muscle Relief',
] as const;

/** Name of the massage type from the upload profile page (dashboard 60/90/120). Menu = 4 sample types + this one. */
export const UPLOAD_PROFILE_MASSAGE_TYPE_NAME = 'Traditional Massage';

/** When sample menu booking is shared/expired, always display this name */
export const SAMPLE_BOOKING_DISPLAY_NAME = UPLOAD_PROFILE_MASSAGE_TYPE_NAME;

/** Check if service name is from a sample menu item (excluding Traditional Massage itself) */
export function isSampleMenuServiceName(serviceName: string | undefined): boolean {
  if (!serviceName?.trim()) return false;
  return SAMPLE_MASSAGE_NAMES.some((n) => n.toLowerCase() === serviceName!.trim().toLowerCase());
}

export interface SampleMenuItem {
  name: string;
  price60: number;
  price90: number;
  price120: number;
}

export interface SamplePricing {
  '60': number;
  '90': number;
  '120': number;
  serviceName?: string;
}

/**
 * Create deterministic seed from therapist ID (same ID = same results).
 */
function createSeed(therapistId: string): number {
  let hash = 0;
  const str = String(therapistId || '');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Seeded random in [0, 1) – deterministic per seed.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Seeded ±10% variation: returns value in [-0.10, +0.10].
 */
function variationPercent(seed: number): number {
  const r = seededRandom(seed);
  return -0.10 + r * 0.20;
}

/**
 * Round to nearest 5,000 IDR; enforce minimum 50,000.
 */
function roundToNearest5000(price: number): number {
  const rounded = Math.round(price / ROUND_TO) * ROUND_TO;
  return Math.max(50000, rounded);
}

/**
 * Generate 5 sample menu items for a therapist (display-only).
 * Base prices with ±10% random variation per therapist per duration, rounded to 5,000 IDR.
 * Each item gets its own variation so price containers differ within the same therapist.
 */
export function getSampleMenuItems(therapistId: string): SampleMenuItem[] {
  const seed = createSeed(therapistId);
  const items: SampleMenuItem[] = [];

  for (let i = 0; i < 5; i++) {
    const itemSeed = seed + i * 7919;

    const var60 = variationPercent(itemSeed);
    const var90 = variationPercent(itemSeed + 1);
    const var120 = variationPercent(itemSeed + 2);

    const price60 = roundToNearest5000(BASE_60 * (1 + var60));
    const price90 = roundToNearest5000(BASE_90 * (1 + var90));
    const price120 = roundToNearest5000(BASE_120 * (1 + var120));

    const nameIndex = Math.floor(seededRandom(seed + i * 31) * SAMPLE_MASSAGE_NAMES.length) % SAMPLE_MASSAGE_NAMES.length;
    const name = SAMPLE_MASSAGE_NAMES[nameIndex];

    items.push({ name, price60, price90, price120 });
  }

  return items;
}

/**
 * Get lowest display pricing for a therapist with no prices.
 * Returns the minimum 60/90/120 across all sample items (for "From X IDR" on search).
 * Use ONLY when therapist has no actual prices set.
 */
export function getSamplePricing(therapistId: string): SamplePricing {
  const items = getSampleMenuItems(therapistId);

  const lowest = items.reduce((acc, item) => {
    const sum = item.price60 + item.price90 + item.price120;
    const accSum = acc.price60 + acc.price90 + acc.price120;
    return sum < accSum ? item : acc;
  }, items[0]);

  return {
    '60': lowest.price60,
    '90': lowest.price90,
    '120': lowest.price120,
    serviceName: lowest.name,
  };
}

/**
 * Check if therapist has any valid pricing set.
 * Dashboard upload profile containers use these; no sample variation applied.
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
    const k60 = (p as Record<string, number>)['60'];
    const k90 = (p as Record<string, number>)['90'];
    const k120 = (p as Record<string, number>)['120'];
    return (k60 != null && k60 > 0) || (k90 != null && k90 > 0) || (k120 != null && k120 > 0);
  }
  if (typeof p === 'string' && p.trim()) {
    try {
      const parsed = JSON.parse(p) as Record<string, number>;
      const k60 = parsed?.['60'];
      const k90 = parsed?.['90'];
      const k120 = parsed?.['120'];
      return (k60 != null && k60 > 0) || (k90 != null && k90 > 0) || (k120 != null && k120 > 0);
    } catch {
      return false;
    }
  }
  return false;
}

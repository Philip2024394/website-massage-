/**
 * Sample Menu Prices & Display Logic
 * 
 * Display-only sample prices for therapists who have not set their own prices.
 * Used on therapist home cards, profile pages, and booking chat.
 * 
 * Constraints:
 * - 60 min: ≤ 170,000 IDR
 * - 90 min: ≤ 210,000 IDR  
 * - 120 min: ≤ 250,000 IDR
 * - Variation (subtract from max): 0–20k for all (price may be lowered by up to 20,000 IDR)
 * - 5 sample menu items per therapist
 * - Deterministic per therapist ID (same therapist = same prices)
 */

const MAX_60 = 170000;
const MAX_90 = 210000;
const MAX_120 = 250000;

// Price may be lowered by up to 20,000 IDR from max (0–20k variation)
const VARIATION_60 = { min: 0, max: 20000 };
const VARIATION_90 = { min: 0, max: 20000 };
const VARIATION_120 = { min: 0, max: 20000 };

const SAMPLE_MASSAGE_NAMES = [
  'Traditional Massage',
  'Relaxation Massage',
  'Swedish Massage',
  'Aromatherapy Massage',
  'Deep Tissue Massage'
];

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
 * Generate 5 sample menu items for a therapist (display-only).
 * Prices never exceed max limits; variation applied for natural look.
 */
export function getSampleMenuItems(therapistId: string): SampleMenuItem[] {
  const seed = createSeed(therapistId);
  const items: SampleMenuItem[] = [];

  for (let i = 0; i < 5; i++) {
    const itemSeed = seed + i * 7919; // Prime for better distribution

    const sub60 = seededRange(itemSeed, VARIATION_60.min, VARIATION_60.max);
    const sub90 = seededRange(itemSeed + 1, VARIATION_90.min, VARIATION_90.max);
    const sub120 = seededRange(itemSeed + 2, VARIATION_120.min, VARIATION_120.max);

    const price60 = Math.max(0, MAX_60 - sub60);
    const price90 = Math.max(0, MAX_90 - sub90);
    const price120 = Math.max(0, MAX_120 - sub120);

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

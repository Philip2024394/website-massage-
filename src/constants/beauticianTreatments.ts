/**
 * Beautician treatment containers – fixed price per treatment, estimated time for scheduling only.
 * Min 1, max 3 containers per profile. No per-minute pricing.
 * Slider: 4 items (real 1–3 + sample fill), same pattern as therapist menu slider.
 */

import type { BeauticianTreatment } from '../types';

export const BEAUTICIAN_TREATMENT_MIN_CONTAINERS = 1;
export const BEAUTICIAN_TREATMENT_MAX_CONTAINERS = 3;

/** Number of items in the beautician menu slider (real + sample fill). Same idea as therapist 5-item slider. */
export const BEAUTICIAN_SLIDER_SIZE = 4;

/** Sample treatment names for slider when beautician has no/few items (deterministic per therapist ID). */
export const SAMPLE_BEAUTICIAN_TREATMENT_NAMES = [
  'Glow Facial Treatment',
  'Full Nail Care (Manicure + Pedicure)',
  'Bridal Makeup & Styling',
  'Hair Styling & Treatment',
] as const;

/** Default currency: IDR for Indonesia, otherwise EUR. */
export function getDefaultBeauticianCurrency(country?: string): 'IDR' | 'EUR' {
  const c = (country || '').toLowerCase();
  if (c === 'indonesia' || c === 'id') return 'IDR';
  return 'EUR';
}

export const DEFAULT_BEAUTICIAN_TREATMENT = (country?: string): BeauticianTreatment => ({
  treatment_name: '',
  fixed_price: 0,
  estimated_duration_minutes: 60,
  currency: getDefaultBeauticianCurrency(country),
});

/** Parse beauticianTreatments from therapist document (JSON string or array). */
export function parseBeauticianTreatments(raw: unknown): BeauticianTreatment[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is BeauticianTreatment => x != null && typeof x === 'object' && 'treatment_name' in x)
      .map((x) => ({
        treatment_name: String((x as any).treatment_name ?? ''),
        fixed_price: Number((x as any).fixed_price) || 0,
        estimated_duration_minutes: Math.max(1, Math.floor(Number((x as any).estimated_duration_minutes) || 60)),
        currency: (x as any).currency ?? 'IDR',
      }));
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseBeauticianTreatments(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

/** Deterministic seed from therapist ID (same ID = same sample items). */
function createSeed(therapistId: string): number {
  let hash = 0;
  const str = String(therapistId || '');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generate 4 sample beautician treatments for slider (display-only).
 * Deterministic per therapistId. Base prices in IDR with small variation.
 */
export function getSampleBeauticianTreatments(therapistId: string, country?: string): BeauticianTreatment[] {
  const currency = getDefaultBeauticianCurrency(country);
  const seed = createSeed(therapistId);
  const basePrices = [350000, 250000, 650000, 180000]; // IDR
  const baseDurations = [60, 90, 120, 45];
  const items: BeauticianTreatment[] = [];
  for (let i = 0; i < BEAUTICIAN_SLIDER_SIZE; i++) {
    const priceVar = ((seed + i * 7919) % 7) - 3; // -3..3
    const price = Math.max(50000, basePrices[i] + priceVar * 10000);
    items.push({
      treatment_name: SAMPLE_BEAUTICIAN_TREATMENT_NAMES[i],
      fixed_price: currency === 'IDR' ? price : Math.round(price / 15000),
      estimated_duration_minutes: baseDurations[i],
      currency,
    });
  }
  return items;
}

/**
 * Combined list for beautician slider: real treatments (1–3) first, then fill to 4 with sample items.
 * Same pattern as getCombinedMenuForDisplay for therapist (real + Traditional + samples to 5).
 */
export function getCombinedBeauticianTreatmentsForDisplay(
  rawTreatments: unknown,
  therapistId: string,
  country?: string
): BeauticianTreatment[] {
  const real = parseBeauticianTreatments(rawTreatments);
  const fillCount = Math.max(0, BEAUTICIAN_SLIDER_SIZE - real.length);
  if (fillCount === 0) return real.slice(0, BEAUTICIAN_SLIDER_SIZE);
  const samples = getSampleBeauticianTreatments(therapistId, country);
  const result = [...real];
  for (let i = 0; i < fillCount && i < samples.length; i++) {
    result.push(samples[i]);
  }
  return result;
}

/** Return the treatment with the lowest fixed_price (for "lowest price" display on card). */
export function getCheapestBeauticianTreatment(treatments: BeauticianTreatment[]): BeauticianTreatment | null {
  if (!treatments?.length) return null;
  return treatments.reduce((best, t) =>
    (t.fixed_price ?? 0) < (best.fixed_price ?? 0) ? t : best
  );
}

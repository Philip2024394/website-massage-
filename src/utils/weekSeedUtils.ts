/**
 * Deterministic week-based seed for "Top 5 Therapists" weekly rotation.
 * Same week + same location => same seed => same selection that week.
 * Different week or location => different seed => different selection.
 */

/**
 * Get ISO week number (1–53) and year for a date.
 */
export function getISOWeekAndYear(date: Date = new Date()): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Monday = 1, Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  return { year, week };
}

/**
 * Hash a string to a positive integer (for use as RNG seed).
 */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Seeded random generator (Mulberry32). Returns 0–1.
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get a deterministic seed number for the current week and location.
 * Used to shuffle "top" candidates so the displayed 5 change each week.
 */
export function getWeekSeed(location?: string | null): number {
  const { year, week } = getISOWeekAndYear();
  const locationPart = (location || 'all').trim().toLowerCase();
  const seedStr = `${year}-W${week}-${locationPart}`;
  return hashString(seedStr);
}

/**
 * Shuffle array deterministically with seed (Fisher–Yates).
 * Mutates the array and returns it.
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const rng = seededRandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

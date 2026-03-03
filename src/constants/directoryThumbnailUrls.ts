/**
 * High-quality default thumbnail URLs for Massage Types Directory.
 * All images are from Pexels (free for commercial use, no attribution required).
 * No text on images; modern spa/massage style suitable for 2025/2026.
 * Used when entry.imageThumbnail is empty.
 */

const PEXELS = (id: number, w = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Head/scalp massage, relaxation, temple focus */
const HEAD_SCALP: string[] = [
  PEXELS(6188036),  // head massage spa
  PEXELS(3997991),  // spa relaxation
  PEXELS(4085447),  // spa massage
  PEXELS(3865797),  // woman spa
  PEXELS(6629522),  // massage
  PEXELS(5793799),  // spa
  PEXELS(9146383),  // massage spa
  PEXELS(6560304),  // relaxation
  PEXELS(9146378),  // spa
  PEXELS(6187269),  // massage
];

/** Traditional / general massage, back, full body */
const TRADITIONAL: string[] = [
  PEXELS(3997994),  // back massage
  PEXELS(3998005),  // spa
  PEXELS(3997983),  // massage
  PEXELS(3997982),  // spa
  PEXELS(5240677),  // massage
  PEXELS(6560298),  // spa
  PEXELS(3997995),  // relaxation
  PEXELS(3230236),  // massage
  PEXELS(3865491),  // spa
  PEXELS(4599392),  // massage
];

/** Sports / recovery / athletic */
const SPORTS: string[] = [
  PEXELS(6629530),  // sports recovery
  PEXELS(6560302),  // fitness
  PEXELS(3997984),  // wellness
  ...TRADITIONAL.slice(0, 7),
];

/** Therapeutic / deep tissue / clinical */
const THERAPEUTIC: string[] = [
  PEXELS(9335987),  // professional massage
  PEXELS(5793799),
  PEXELS(6188036),
  ...TRADITIONAL.slice(0, 7),
];

/** Wellness / spa / relaxation */
const WELLNESS: string[] = [
  PEXELS(3997991),
  PEXELS(4085447),
  PEXELS(3865797),
  PEXELS(6629522),
  PEXELS(9146383),
  PEXELS(6560304),
  PEXELS(9146378),
  PEXELS(5240677),
  PEXELS(3230236),
  PEXELS(4599392),
];

/** Couples / romantic spa */
const COUPLES: string[] = [
  PEXELS(3998005),
  PEXELS(3997983),
  PEXELS(3865797),
  PEXELS(6560304),
  PEXELS(9146378),
  PEXELS(5240677),
  PEXELS(3865491),
  ...WELLNESS.slice(0, 3),
];

/** Body scrub / exfoliation / spa ritual */
const BODY_SCRUB: string[] = [
  PEXELS(4085447),
  PEXELS(6629522),
  PEXELS(5793799),
  PEXELS(9146383),
  PEXELS(6560304),
  PEXELS(3865491),
  PEXELS(4599392),
  ...WELLNESS.slice(0, 3),
];

/** Prenatal / pregnancy massage (gentle, safe imagery) */
const PRENATAL: string[] = [
  PEXELS(3997991),
  PEXELS(4085447),
  PEXELS(3865797),
  PEXELS(6560304),
  PEXELS(5240677),
  PEXELS(3230236),
  PEXELS(3865491),
  ...WELLNESS.slice(0, 3),
];

export type DirectoryThumbnailCategory =
  | 'traditional'
  | 'sports'
  | 'therapeutic'
  | 'wellness'
  | 'couples'
  | 'body_scrub'
  | 'prenatal'
  | 'head_scalp';

const POOLS: Record<DirectoryThumbnailCategory, string[]> = {
  traditional: TRADITIONAL,
  sports: SPORTS,
  therapeutic: THERAPEUTIC,
  wellness: WELLNESS,
  couples: COUPLES,
  body_scrub: BODY_SCRUB,
  prenatal: PRENATAL,
  head_scalp: HEAD_SCALP,
};

/** Simple string hash for stable index into pool */
function hash(s: string): number {
  let h = 0;
  const str = (s || '').toLowerCase().trim();
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Returns a default thumbnail URL for a directory entry by realName and category.
 * Use when entry.imageThumbnail is empty. Same realName always gets the same image.
 */
export function getDefaultThumbnailForDirectory(
  realName: string,
  category: DirectoryThumbnailCategory
): string {
  const pool = POOLS[category];
  if (!pool?.length) return '';
  const idx = hash(realName) % pool.length;
  return pool[idx];
}

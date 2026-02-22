/**
 * Auto-post system constants. Do not change timing or counts per spec.
 */

/** System author ID for auto-published posts */
export const AUTO_POST_AUTHOR_ID = 'indastreet_seo_system';

/** Default origin country for Indonesia-focused SEO posts */
export const AUTO_POST_ORIGIN_COUNTRY = 'ID';

/** Min/max posts per day. Override with AUTO_POST_MIN_PER_DAY / AUTO_POST_MAX_PER_DAY for safe launch (e.g. 2 for week 1–2). */
function getEnvInt(name: string, defaultVal: number): number {
  if (typeof process === 'undefined' || !process.env) return defaultVal;
  const v = process.env[name];
  if (v === undefined || v === '') return defaultVal;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? defaultVal : Math.max(1, Math.min(10, n));
}

export const POSTS_PER_DAY_MIN = getEnvInt('AUTO_POST_MIN_PER_DAY', 3);
export const POSTS_PER_DAY_MAX = getEnvInt('AUTO_POST_MAX_PER_DAY', 5);

/** Min/max gap between publish times (minutes) */
export const PUBLISH_GAP_MIN_MINUTES = 120;  // 2 hours
export const PUBLISH_GAP_MAX_MINUTES = 240;   // 4 hours

/** Day start hour (00:01 = 0, 1 minute) for scheduling window */
export const SCHEDULE_DAY_START_HOUR = 0;
export const SCHEDULE_DAY_START_MINUTE = 1;
export const SCHEDULE_DAY_END_HOUR = 23;
export const SCHEDULE_DAY_END_MINUTE = 59;

/** Optional service types for topic+city+service combo */
export const SERVICE_TYPES = [
  'deep tissue massage',
  'Swedish massage',
  'aromatherapy',
  'facial treatment',
  'hot stone massage',
  'sports massage',
  'home massage',
  'spa day',
] as const;

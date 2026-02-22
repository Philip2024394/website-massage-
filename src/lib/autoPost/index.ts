/**
 * Auto-post system: scheduler, content generator, publisher, runner.
 * See docs/AUTO-POST-REMAINING-BUILD-SPEC.md and docs/ELITE-AUTO-POST-SYSTEM-SPEC.md.
 */

export { createDailySchedule, storeScheduledJobs } from './scheduler';
export type { ScheduledJobPayload } from './types';
export { generatePostContent, slugify, shortId, getCanonicalUrl } from './contentGenerator';
export { publishPost, ensureSlugUnique } from './publisher';
export type { PublisherDeps, PublishResult } from './publisher';
export { processOneJob, runDueJobs } from './runner';
export type { RunnerDeps, JobRecord } from './runner';
export { buildPublisherDeps, buildRunnerDeps } from './appwriteAdapter';
export type { AppwriteAdapterConfig, DatabasesLike } from './appwriteAdapter';
export { AUTO_POST_AUTHOR_ID, AUTO_POST_ORIGIN_COUNTRY } from './constants';
export type { GeneratedPostContent, PublishPostInput, SeoTopicCategory } from './types';
export { SEO_CATEGORY_VALUES } from './types';

// Global content engine (per-country, localized)
export {
  generateGlobalPostPayload,
  isTopicTooSimilar,
  getNextVarietyCategory,
  pickServiceKeyword,
  globalPayloadToPublishInput,
} from './globalContentGenerator';
export type { GlobalPostPayload } from './globalContentGenerator';

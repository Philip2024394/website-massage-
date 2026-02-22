/**
 * Auto-post Runner. Processes due jobs from AUTO_POST_JOBS: generate content → publish → update job.
 * Spec: AUTO-POST-REMAINING-BUILD-SPEC execution flow. Retry-safe and idempotent per job.
 * Failure guard: publish retries up to 3 times, then log + skip so the queue does not block.
 */

import { generatePostContent } from './contentGenerator';
import { AUTO_POST_AUTHOR_ID, AUTO_POST_ORIGIN_COUNTRY } from './constants';
import { generatePostImage, getFallbackPostImage } from './imageEngine';
import { publishPost } from './publisher';
import type { PublisherDeps } from './publisher';
import type { SeoTopicCategory } from './types';

/** Map country code to display name for image prompt (e.g. ID → Indonesia). */
const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  ID: 'Indonesia',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
};
function getCountryDisplayName(code: string): string {
  return COUNTRY_DISPLAY_NAMES[code] ?? code;
}

const PUBLISH_RETRY_ATTEMPTS = 3;
const PUBLISH_RETRY_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface JobRecord {
  $id: string;
  runAt: string;
  topic: string;
  city: string;
  category: string;
  service?: string;
  status: string;
}

export interface RunnerDeps {
  /** List pending jobs with runAt <= now. Returns job records. */
  listDueJobs: () => Promise<JobRecord[]>;
  /** Update job status and optional resultPostId / errorMessage */
  updateJob: (
    jobId: string,
    update: { status: string; resultPostId?: string; errorMessage?: string }
  ) => Promise<void>;
  /** Publisher dependencies (createDocument, existsBySlug, triggerSitemapUpdate, purgeCacheForUrl) */
  publisherDeps: PublisherDeps;
}

/**
 * Process a single job: mark processing, generate content, publish, update job to done or failed.
 */
export async function processOneJob(job: JobRecord, deps: RunnerDeps): Promise<void> {
  const { updateJob, publisherDeps } = deps;
  let lastErr: unknown;
  await updateJob(job.$id, { status: 'processing' });
  try {
    const content = generatePostContent({
      topic: job.topic,
      city: job.city,
      category: job.category as SeoTopicCategory,
      service: job.service,
    });

    // Image engine at publish time (not daily planner). Cost-safe: on failure use fallback or no image.
    let imageUrl: string | undefined;
    let imageAlt: string | undefined;
    try {
      const image = await generatePostImage(
        {
          topic: job.topic,
          city: job.city,
          service: job.service,
          country: getCountryDisplayName(AUTO_POST_ORIGIN_COUNTRY),
        },
        { publicDir: process.cwd() }
      );
      imageUrl = image.url;
      imageAlt = image.alt;
    } catch (err) {
      console.warn(
        `[auto-post] Image generation failed for job ${job.$id}, using fallback or no image:`,
        err instanceof Error ? err.message : err
      );
      const fallback = getFallbackPostImage(job.service);
      if (fallback) {
        imageUrl = fallback.url;
        imageAlt = fallback.alt;
      }
    }

    for (let attempt = 1; attempt <= PUBLISH_RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await publishPost(
          {
            ...content,
            authorId: AUTO_POST_AUTHOR_ID,
            originCountry: AUTO_POST_ORIGIN_COUNTRY,
            city: job.city,
            topic: job.topic,
            category: job.category,
            service: job.service,
            imageUrl,
            imageAlt,
          },
          publisherDeps
        );
        await updateJob(job.$id, { status: 'done', resultPostId: result.postId });
        return;
      } catch (err) {
        lastErr = err;
        if (attempt < PUBLISH_RETRY_ATTEMPTS) {
          console.warn(
            `[auto-post] Publish attempt ${attempt}/${PUBLISH_RETRY_ATTEMPTS} failed for job ${job.$id}, retrying in ${PUBLISH_RETRY_DELAY_MS}ms:`,
            err instanceof Error ? err.message : err
          );
          await sleep(PUBLISH_RETRY_DELAY_MS);
        }
      }
    }
    const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
    const truncated = message.slice(0, 2000);
    console.error(`[auto-post] Publish failed after ${PUBLISH_RETRY_ATTEMPTS} attempts for job ${job.$id}: ${truncated}`);
    await updateJob(job.$id, { status: 'failed', errorMessage: truncated });
    throw lastErr;
  } catch (err) {
    if (err !== lastErr) {
      const message = err instanceof Error ? err.message : String(err);
      await updateJob(job.$id, { status: 'failed', errorMessage: message.slice(0, 2000) });
    }
    throw err;
  }
}

/**
 * Run all due jobs. Processes in order; one failure does not stop others (fault tolerant).
 */
export async function runDueJobs(deps: RunnerDeps): Promise<{ processed: number; failed: number }> {
  const jobs = await deps.listDueJobs();
  let processed = 0;
  let failed = 0;
  for (const job of jobs) {
    try {
      await processOneJob(job, deps);
      processed += 1;
    } catch {
      failed += 1;
    }
  }
  return { processed, failed };
}

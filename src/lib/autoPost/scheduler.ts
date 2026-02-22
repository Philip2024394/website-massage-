/**
 * Auto-post Scheduler (Daily Planner).
 * Runs once per day at 00:01. Creates 3–5 jobs with runAt, topic, city, category, service.
 * Stores jobs in AUTO_POST_JOBS. Spec: AUTO-POST-REMAINING-BUILD-SPEC.md § COMPONENT 1.
 */

import {
  SEO_CITIES_ALL,
  SEO_TOPICS_BY_CATEGORY,
  type SeoTopicCategory,
} from '../../data/indonesiaSeoDataset';
import {
  POSTS_PER_DAY_MIN,
  POSTS_PER_DAY_MAX,
  PUBLISH_GAP_MIN_MINUTES,
  PUBLISH_GAP_MAX_MINUTES,
  SCHEDULE_DAY_START_HOUR,
  SCHEDULE_DAY_START_MINUTE,
  SCHEDULE_DAY_END_HOUR,
  SERVICE_TYPES,
} from './constants';
import type { ScheduledJobPayload } from './types';
import { SEO_CATEGORY_VALUES } from './types';

/** Pseudo-random but deterministic per day for "vary schedule daily" */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function randomInt(min: number, max: number, seedRef: { v: number }): number {
  seedRef.v += 1;
  return min + Math.floor(seededRandom(seedRef.v + min + max) * (max - min + 1));
}

function pick<T>(arr: readonly T[], seedRef: { v: number }): T {
  return arr[randomInt(0, arr.length - 1, seedRef)];
}

/**
 * Generate today's schedule: 3–5 run times spaced 2–4 hours apart (no fixed times).
 */
function generateRunTimes(count: number, date: Date): number[] {
  const seedRef = { v: date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate() };
  const start = new Date(date);
  start.setHours(SCHEDULE_DAY_START_HOUR, SCHEDULE_DAY_START_MINUTE, 0, 0);
  const end = new Date(date);
  end.setHours(SCHEDULE_DAY_END_HOUR, SCHEDULE_DAY_END_MINUTE, 59, 999);
  const slots: number[] = [];
  let t = start.getTime();
  for (let i = 0; i < count; i++) {
    const gapMinutes =
      PUBLISH_GAP_MIN_MINUTES +
      Math.floor(seededRandom(seedRef.v + i * 7) * (PUBLISH_GAP_MAX_MINUTES - PUBLISH_GAP_MIN_MINUTES + 1));
    if (i > 0) t += gapMinutes * 60 * 1000;
    else {
      const maxStart = end.getTime() - (count - 1) * PUBLISH_GAP_MIN_MINUTES * 60 * 1000;
      const startRange = maxStart - start.getTime();
      t = start.getTime() + Math.floor(seededRandom(seedRef.v + 11) * Math.max(0, startRange));
    }
    if (t <= end.getTime()) slots.push(t);
  }
  slots.sort((a, b) => a - b);
  return slots;
}

/**
 * Create scheduled job payloads for the day. No consecutive category repetition.
 */
export function createDailySchedule(date: Date): ScheduledJobPayload[] {
  const seedRef = {
    v: date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate(),
  };
  const count =
    POSTS_PER_DAY_MIN +
    Math.floor(seededRandom(seedRef.v) * (POSTS_PER_DAY_MAX - POSTS_PER_DAY_MIN + 1));
  const runTimes = generateRunTimes(count, date);
  const jobs: ScheduledJobPayload[] = [];
  let previousCategory: SeoTopicCategory | null = null;

  for (let i = 0; i < runTimes.length; i++) {
    const categories = previousCategory
      ? (SEO_CATEGORY_VALUES.filter((c) => c !== previousCategory) as SeoTopicCategory[])
      : [...SEO_CATEGORY_VALUES];
    const category = pick(categories, seedRef);
    previousCategory = category;

    const topics = SEO_TOPICS_BY_CATEGORY[category];
    const topic = pick(topics, seedRef);
    const city = pick(SEO_CITIES_ALL, seedRef);
    const useService = seededRandom(seedRef.v + i * 13) > 0.5;
    const service = useService ? pick(SERVICE_TYPES as unknown as string[], seedRef) : undefined;

    jobs.push({
      runAt: runTimes[i],
      topic,
      city,
      category,
      service,
    });
  }

  return jobs;
}

export interface AppwriteDatabasesLike {
  createDocument: (
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ) => Promise<{ $id: string }>;
}

/**
 * Store scheduled jobs in the queue (AUTO_POST_JOBS). Idempotent per day: pass existingRunAtKeys
 * to skip creating duplicates for the same runAt (e.g. when re-running scheduler same day).
 */
export async function storeScheduledJobs(
  createDocument: (data: {
    runAt: string; // ISO datetime for Appwrite
    topic: string;
    city: string;
    category: string;
    service?: string;
    status: string;
  }) => Promise<{ $id: string }>,
  date: Date,
  existingRunAtKeys?: Set<string>
): Promise<{ created: number; jobs: ScheduledJobPayload[] }> {
  const jobs = createDailySchedule(date);
  let created = 0;
  for (const job of jobs) {
    const runAtIso = new Date(job.runAt).toISOString();
    if (existingRunAtKeys?.has(runAtIso)) continue;
    await createDocument({
      runAt: runAtIso,
      topic: job.topic,
      city: job.city,
      category: job.category,
      ...(job.service && { service: job.service }),
      status: 'pending',
    });
    created += 1;
  }
  return { created, jobs };
}

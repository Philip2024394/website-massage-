#!/usr/bin/env node
/**
 * Auto-post daily scheduler. Run once per day at 00:01 (cron: 1 0 * * *).
 * Creates 3–5 scheduled jobs for today and stores them in AUTO_POST_JOBS.
 * Requires: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID
 */

import { Client, Databases, Query, ID } from 'node-appwrite';
import { storeScheduledJobs } from '../src/lib/autoPost/scheduler';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const JOBS_COLLECTION_ID = 'auto_post_jobs';

if (!APPWRITE_API_KEY) {
  console.error('APPWRITE_API_KEY is required');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);
const databases = new Databases(client);

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Optional: skip if jobs already created for today (idempotent)
  const startOfDay = new Date(today).toISOString();
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayIso = endOfDay.toISOString();
  const existing = await databases.listDocuments(DATABASE_ID, JOBS_COLLECTION_ID, [
    Query.greaterThanEqual('runAt', startOfDay),
    Query.lessThanEqual('runAt', endOfDayIso),
    Query.limit(20),
  ]);
  const existingRunAtKeys = new Set(
    (existing.documents || []).map((d: { runAt?: string }) => d.runAt)
  );

  const createDocument = async (data: {
    runAt: string;
    topic: string;
    city: string;
    category: string;
    service?: string;
    status: string;
  }) => {
    const doc = await databases.createDocument(
      DATABASE_ID,
      JOBS_COLLECTION_ID,
      ID.unique(),
      {
        runAt: data.runAt,
        topic: data.topic,
        city: data.city,
        category: data.category,
        ...(data.service && { service: data.service }),
        status: data.status,
      }
    );
    return { $id: doc.$id };
  };

  const { created, jobs } = await storeScheduledJobs(
    createDocument as any,
    today,
    existingRunAtKeys
  );

  console.log(`Auto-post daily: created ${created} jobs for ${today.toISOString().split('T')[0]}. Total slots: ${jobs.length}`);
  jobs.forEach((j, i) => {
    console.log(`  ${i + 1}. ${new Date(j.runAt).toISOString()} — ${j.topic} (${j.city})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Auto-post runner. Run every 15 min (cron: */15 * * * *).
 * Processes due jobs from AUTO_POST_JOBS: generate content → publish → update job.
 * Requires: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID
 */

import { Client, Databases } from 'node-appwrite';
import { runDueJobs } from '../src/lib/autoPost/runner';
import { buildPublisherDeps, buildRunnerDeps } from '../src/lib/autoPost/appwriteAdapter';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const SEO_POSTS_COLLECTION_ID = 'seo_posts';
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

const config = {
  databaseId: DATABASE_ID,
  seoPostsCollectionId: SEO_POSTS_COLLECTION_ID,
  jobsCollectionId: JOBS_COLLECTION_ID,
  sitemapCommand: 'node scripts/generate-sitemap-posts.mjs',
};

async function main() {
  const publisherDeps = buildPublisherDeps(databases as any, config);
  const runnerDeps = buildRunnerDeps(databases as any, config, publisherDeps);
  const { processed, failed } = await runDueJobs(runnerDeps);
  if (processed > 0 || failed > 0) {
    console.log(`Auto-post runner: processed=${processed}, failed=${failed}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

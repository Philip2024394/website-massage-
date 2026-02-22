#!/usr/bin/env node
/**
 * Create Appwrite collections for the auto-post system: seo_posts and auto_post_jobs.
 * Run once: APPWRITE_API_KEY=your_key tsx scripts/setup-auto-post-collections.ts
 * See docs/AUTO-POST-REMAINING-BUILD-SPEC.md and src/config/appwriteSchema.ts (SEO_POSTS, AUTO_POST_JOBS).
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const APPWRITE_CONFIG = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664',
  databaseId: process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05',
  apiKey: process.env.APPWRITE_API_KEY,
};

async function main() {
  if (!APPWRITE_CONFIG.apiKey) {
    console.error('APPWRITE_API_KEY is required');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey);
  const databases = new Databases(client);

  // 1. SEO_POSTS
  try {
    await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'seo_posts',
      'SEO Posts',
      [Permission.read(Role.any())]
    );
    console.log('Created collection seo_posts');
  } catch (e: any) {
    if (e?.message?.includes('already exists')) console.log('seo_posts already exists');
    else throw e;
  }

  const seoAttrs = [
    ['title', 500],
    ['slug', 255],
    ['description', 500],
    ['body', 100000],
    ['hashtags', 1000],
    ['imagePrompt', 1000],
    ['imageUrl', 2000],
    ['imageAlt', 500],
    ['authorId', 100],
    ['originCountry', 10],
    ['city', 255],
    ['topic', 500],
    ['category', 100],
    ['service', 255],
  ] as const;
  for (const [name, size] of seoAttrs) {
    try {
      await databases.createStringAttribute(
        APPWRITE_CONFIG.databaseId,
        'seo_posts',
        name,
        size,
        ['title', 'slug', 'description', 'body', 'authorId', 'originCountry'].includes(name)
      );
      console.log('  seo_posts.' + name);
    } catch (e: any) {
      if (!e?.message?.includes('already exists')) throw e;
    }
  }
  try {
    await databases.createBooleanAttribute(APPWRITE_CONFIG.databaseId, 'seo_posts', 'published', true);
    console.log('  seo_posts.published');
  } catch (e: any) {
    if (!e?.message?.includes('already exists')) throw e;
  }

  // 2. AUTO_POST_JOBS
  try {
    await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'auto_post_jobs',
      'Auto Post Jobs',
      [Permission.read(Role.any()), Permission.create(Role.any()), Permission.update(Role.any())]
    );
    console.log('Created collection auto_post_jobs');
  } catch (e: any) {
    if (e?.message?.includes('already exists')) console.log('auto_post_jobs already exists');
    else throw e;
  }

  const jobAttrs = [
    ['topic', 500],
    ['city', 255],
    ['category', 100],
    ['service', 255],
    ['status', 50],
    ['resultPostId', 100],
    ['errorMessage', 2000],
  ] as const;
  for (const [name, size] of jobAttrs) {
    try {
      await databases.createStringAttribute(
        APPWRITE_CONFIG.databaseId,
        'auto_post_jobs',
        name,
        size,
        ['topic', 'city', 'category', 'status'].includes(name)
      );
      console.log('  auto_post_jobs.' + name);
    } catch (e: any) {
      if (!e?.message?.includes('already exists')) throw e;
    }
  }
  try {
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'auto_post_jobs', 'runAt', true);
    console.log('  auto_post_jobs.runAt');
  } catch (e: any) {
    if (!e?.message?.includes('already exists')) throw e;
  }

  console.log('\nDone. Run auto-post:daily once per day and auto-post:runner every 15 min.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Appwrite adapter for auto-post system. Builds PublisherDeps and RunnerDeps from
 * Appwrite Databases instance (e.g. from node-appwrite in cron scripts).
 * Use in Node scripts only; requires API key for write access.
 */

import type { PublisherDeps } from './publisher';
import type { RunnerDeps } from './runner';
import type { JobRecord } from './runner';

export interface AppwriteAdapterConfig {
  databaseId: string;
  seoPostsCollectionId: string;
  jobsCollectionId: string;
  /** Run sitemap script, e.g. 'node scripts/generate-sitemap-posts.mjs' */
  sitemapCommand?: string;
}

/** Databases-like interface (node-appwrite or appwrite) */
export interface DatabasesLike {
  createDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<{ $id: string }>;
  listDocuments(
    databaseId: string,
    collectionId: string,
    queries?: string[]
  ): Promise<{ documents: Record<string, unknown>[] }>;
  updateDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}

/** Build PublisherDeps from Appwrite Databases and config. */
export function buildPublisherDeps(
  databases: DatabasesLike,
  config: AppwriteAdapterConfig
): PublisherDeps {
  const { databaseId, seoPostsCollectionId, sitemapCommand } = config;

  return {
    createDocument: async (data) => {
      const { ID } = await import('node-appwrite');
      const doc = await databases.createDocument(
        databaseId,
        seoPostsCollectionId,
        ID.unique(),
        {
          title: data.title,
          slug: data.slug,
          description: data.description,
          body: data.body,
          hashtags: data.hashtags ?? '',
          imagePrompt: data.imagePrompt ?? '',
          imageUrl: data.imageUrl ?? '',
          imageAlt: data.imageAlt ?? '',
          authorId: data.authorId,
          originCountry: data.originCountry,
          published: data.published,
          city: data.city ?? '',
          topic: data.topic ?? '',
          category: data.category ?? '',
          service: data.service ?? '',
        }
      );
      return { $id: doc.$id as string };
    },
    existsBySlug: async (slug) => {
      const { Query } = await import('node-appwrite');
      const res = await databases.listDocuments(databaseId, seoPostsCollectionId, [
        Query.equal('slug', slug),
        Query.limit(1),
      ]);
      return (res.documents?.length ?? 0) > 0;
    },
    triggerSitemapUpdate: async () => {
      if (!sitemapCommand || typeof process === 'undefined') return;
      const { execSync } = await import('child_process');
      try {
        execSync(sitemapCommand, { stdio: 'inherit', cwd: process.cwd() });
      } catch {
        // Non-fatal; sitemap can be regenerated later
      }
    },
    purgeCacheForUrl: async () => {
      // No-op; wire to Netlify purge or CDN API when available
    },
  };
}

/** Build RunnerDeps from Appwrite Databases and config. */
export function buildRunnerDeps(
  databases: DatabasesLike,
  config: AppwriteAdapterConfig,
  publisherDeps: PublisherDeps
): RunnerDeps {
  const { databaseId, jobsCollectionId } = config;

  return {
    listDueJobs: async () => {
      const { Query } = await import('node-appwrite');
      const now = new Date().toISOString();
      const res = await databases.listDocuments(databaseId, jobsCollectionId, [
        Query.equal('status', 'pending'),
        Query.lessThanEqual('runAt', now),
        Query.limit(20),
      ]);
      return (res.documents || []) as JobRecord[];
    },
    updateJob: async (jobId, update) => {
      await databases.updateDocument(databaseId, jobsCollectionId, jobId, {
        status: update.status,
        ...(update.resultPostId && { resultPostId: update.resultPostId }),
        ...(update.errorMessage && { errorMessage: update.errorMessage }),
      });
    },
    publisherDeps,
  };
}

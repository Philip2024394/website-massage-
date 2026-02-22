/**
 * Auto-post Publisher. Spec: AUTO-POST-REMAINING-BUILD-SPEC § COMPONENT 3.
 * publishPost(postData): ensure slug unique, insert post, mark published, canonical URL,
 * trigger sitemap update, purge CDN cache, return published post ID.
 * Idempotent: same slug + same content can be skipped or overwritten by caller (runner).
 */

import { shortId } from './contentGenerator';
import { getCanonicalUrl } from './contentGenerator';
import { AUTO_POST_AUTHOR_ID, AUTO_POST_ORIGIN_COUNTRY } from './constants';
import type { PublishPostInput } from './types';

export interface PublishResult {
  postId: string;
  slug: string;
  canonicalUrl: string;
  slugWasAdjusted: boolean;
}

export interface PublisherDeps {
  /** Create a document in SEO_POSTS. Returns document $id. */
  createDocument: (data: {
    title: string;
    slug: string;
    description: string;
    body: string;
    hashtags?: string;
    imagePrompt?: string;
    imageUrl?: string;
    imageAlt?: string;
    authorId: string;
    originCountry: string;
    published: boolean;
    city?: string;
    topic?: string;
    category?: string;
    service?: string;
  }) => Promise<{ $id: string }>;
  /** Check if a slug already exists. Returns true if exists. */
  existsBySlug: (slug: string) => Promise<boolean>;
  /** Trigger sitemap regeneration (e.g. run script or call API). */
  triggerSitemapUpdate: () => Promise<void>;
  /** Purge CDN cache for URL (e.g. Netlify purge or no-op). */
  purgeCacheForUrl: (url: string) => Promise<void>;
}

/**
 * Ensure slug is unique. If exists, append short suffix and return new slug.
 */
export async function ensureSlugUnique(
  baseSlug: string,
  existsBySlug: (slug: string) => Promise<boolean>
): Promise<{ slug: string; adjusted: boolean }> {
  let slug = baseSlug;
  let adjusted = false;
  while (await existsBySlug(slug)) {
    slug = `${baseSlug}-${shortId()}`;
    adjusted = true;
  }
  return { slug, adjusted };
}

/**
 * Publish a post: unique slug, insert, trigger sitemap, purge cache. Returns post ID and canonical URL.
 */
export async function publishPost(
  postData: PublishPostInput,
  deps: PublisherDeps
): Promise<PublishResult> {
  const { createDocument, existsBySlug, triggerSitemapUpdate, purgeCacheForUrl } = deps;

  const { slug: initialSlug, adjusted: slugWasAdjusted } = await ensureSlugUnique(
    postData.slug,
    existsBySlug
  );
  const slug = initialSlug;
  const canonicalUrl = getCanonicalUrl(slug);

  const doc = await createDocument({
    title: postData.title,
    slug,
    description: postData.description,
    body: postData.body,
    hashtags: Array.isArray(postData.hashtags) ? postData.hashtags.join(' ') : postData.hashtags ?? '',
    imagePrompt: postData.imagePrompt ?? '',
    imageUrl: postData.imageUrl ?? undefined,
    imageAlt: postData.imageAlt ?? undefined,
    authorId: postData.authorId ?? AUTO_POST_AUTHOR_ID,
    originCountry: postData.originCountry ?? AUTO_POST_ORIGIN_COUNTRY,
    published: true,
    city: postData.city ?? undefined,
    topic: postData.topic ?? undefined,
    category: postData.category ?? undefined,
    service: postData.service ?? undefined,
  });

  await triggerSitemapUpdate();
  await purgeCacheForUrl(canonicalUrl);

  return {
    postId: doc.$id,
    slug,
    canonicalUrl,
    slugWasAdjusted,
  };
}

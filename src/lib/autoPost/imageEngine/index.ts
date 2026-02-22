/**
 * Image engine orchestrator: prompt → generate → SEO → store.
 * Drop-in for auto-post pipeline: scheduler → generator → image engine → publisher → live post.
 * Run at publish time (runner), not during daily planner.
 */

import { buildImagePrompt, type BuildImagePromptInput } from './imagePromptBuilder';
import { generateImage } from './generateImage';
import { buildImageSeo, type ImageSeo } from './imageSeo';
import { storeImage, type StoreImageOptions } from './imageStorage';

export type { BuildImagePromptInput, ImageSeo };
export { buildImagePrompt, buildImageSeo, generateImage, storeImage };

export interface GeneratePostImageInput {
  topic: string;
  city: string;
  service?: string;
  country: string;
}

export interface GeneratePostImageResult {
  url: string;
  alt: string;
}

export interface GeneratePostImageOptions extends StoreImageOptions {
  /** Skip storage and return remote URL only (e.g. when using CDN upload) */
  skipStorage?: boolean;
  generateImageOptions?: { apiUrl?: string; apiKey?: string; size?: string };
}

/**
 * Cost-safe fallback: return a stock/placeholder image when generation fails or API is unavailable.
 * Set FALLBACK_POST_IMAGE_URL in env (e.g. to a CDN or /cdn/placeholder-wellness.jpg).
 * Optional FALLBACK_POST_IMAGE_ALT for alt text.
 */
export function getFallbackPostImage(service?: string): GeneratePostImageResult | null {
  const url = typeof process !== 'undefined' && process.env?.FALLBACK_POST_IMAGE_URL;
  if (!url) return null;
  const alt =
    (typeof process !== 'undefined' && process.env?.FALLBACK_POST_IMAGE_ALT) ||
    (service ? `${service} – wellness` : 'Wellness and massage');
  return { url, alt };
}

/**
 * Generate a unique, SEO-friendly image for a post: build prompt → call provider → store → return path + alt.
 * If generation or storage fails, throws so caller can fallback (e.g. getFallbackPostImage or no image).
 */
export async function generatePostImage(
  input: GeneratePostImageInput,
  options: GeneratePostImageOptions = {}
): Promise<GeneratePostImageResult> {
  const prompt = buildImagePrompt(input);
  const imageUrl = await generateImage(prompt, options.generateImageOptions ?? {});

  const seo = buildImageSeo({
    topic: input.topic,
    city: input.city,
    service: input.service,
  });

  if (options.skipStorage) {
    return { url: imageUrl, alt: seo.alt };
  }

  const path = await storeImage(imageUrl, seo.filename, {
    publicDir: options.publicDir,
    subDir: options.subDir,
  });

  return {
    url: path,
    alt: seo.alt,
  };
}

/**
 * Auto-post system types. Aligned with AUTO-POST-REMAINING-BUILD-SPEC and ELITE-AUTO-POST-SYSTEM-SPEC.
 */

export interface ScheduledJobPayload {
  runAt: number; // timestamp ms
  topic: string;
  city: string;
  category: string;
  service?: string;
}

export interface GeneratedPostContent {
  title: string;
  slug: string;
  description: string;
  body: string;
  hashtags: string[];
  imagePrompt: string;
}

export interface PublishPostInput extends GeneratedPostContent {
  authorId: string;
  originCountry: string;
  city?: string;
  topic?: string;
  category?: string;
  service?: string;
  /** URL path or full URL for post image (from image engine). */
  imageUrl?: string;
  /** Alt text for post image (SEO + accessibility). */
  imageAlt?: string;
}

export type SeoTopicCategory =
  | 'massage'
  | 'beautyFacial'
  | 'spa'
  | 'homeService'
  | 'authority'
  | 'engagement'
  | 'conversion'
  | 'trending';

export const SEO_CATEGORY_VALUES: SeoTopicCategory[] = [
  'massage',
  'beautyFacial',
  'spa',
  'homeService',
  'authority',
  'engagement',
  'conversion',
  'trending',
];

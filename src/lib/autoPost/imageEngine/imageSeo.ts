/**
 * SEO metadata for post images: filename and alt text for indexing and accessibility.
 */

export interface BuildImageSeoInput {
  topic: string;
  city: string;
  service?: string;
}

export interface ImageSeo {
  filename: string;
  alt: string;
}

/**
 * Build SEO-friendly filename (URL-safe) and alt text for the post image.
 */
export function buildImageSeo(input: BuildImageSeoInput): ImageSeo {
  const { topic, city, service } = input;
  const parts = [service || topic, topic, city].filter(Boolean);
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 120);

  const filename = `${slug || 'wellness-post'}.jpg`;
  const alt = service
    ? `${service} in ${city} – ${topic}`
    : `${topic} in ${city}`;

  return { filename, alt };
}

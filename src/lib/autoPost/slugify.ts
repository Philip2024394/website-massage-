/**
 * SEO-friendly slug from title + optional suffix for uniqueness.
 */

export function slugify(text: string, suffix?: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!base) return 'post';
  return suffix ? `${base}-${suffix}` : base;
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

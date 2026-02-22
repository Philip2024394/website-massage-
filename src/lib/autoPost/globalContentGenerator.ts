/**
 * Global Social Content Engine — generates per-country post payload (JSON).
 * See docs/GLOBAL-SOCIAL-CONTENT-ENGINE-SPEC.md.
 * Output: country, language, city, topic, title, caption, hashtags, seoKeywords, slug.
 */

import {
  COUNTRY_CONTENT_CONFIGS,
  CITIES_BY_COUNTRY,
  VARIETY_CATEGORIES,
  SERVICE_KEYWORDS,
  type VarietyCategory,
  type ServiceKeyword,
} from '../../data/globalContentEngineConfig';
import { SEO_CITIES_ALL } from '../../data/indonesiaSeoDataset';
import { slugify, shortId } from './contentGenerator';

export interface GlobalPostPayload {
  country: string;
  language: string;
  city: string;
  topic: string;
  title: string;
  caption: string;
  hashtags: string[];
  seoKeywords: string[];
  slug: string;
}

/** Get cities for country (Indonesia uses indonesiaSeoDataset). */
function getCitiesForCountry(country: string): string[] {
  if (country === 'Indonesia') return [...SEO_CITIES_ALL];
  return CITIES_BY_COUNTRY[country] ?? [];
}

/** Pick random item from array (seed for determinism). */
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(Math.abs(Math.sin(seed) * 1e6)) % arr.length];
}

/** Clamp string length (word count for caption). */
function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/** Title 50–70 chars; must include city + topic. */
function buildTitle(
  topic: string,
  city: string,
  language: string,
  serviceKeyword: ServiceKeyword,
  seed: number
): string {
  if (language === 'Bahasa Indonesia') {
    const templates = [
      `Manfaat ${topic} di ${city}`,
      `${topic} di ${city}: Tips dan Rekomendasi`,
      `Panduan ${topic} untuk Warga ${city}`,
    ];
    let t = pick(templates, seed);
    if (t.length < 50) t = t + ` | Layanan ${serviceKeyword} Terpercaya`;
    if (t.length > 70) t = t.slice(0, 67) + '...';
    return t.slice(0, 70);
  }
  const templates = [
    `${topic} in ${city}: Benefits and Tips`,
    `Best ${topic} and ${serviceKeyword} in ${city}`,
    `${topic} Guide for ${city} Residents`,
  ];
  let t = pick(templates, seed);
  if (t.length > 70) t = t.slice(0, 67) + '...';
  return t.slice(0, 70);
}

/** Caption 120–220 words, human tone, city + service keyword, value (tip/benefit). */
function buildCaption(
  topic: string,
  city: string,
  country: string,
  language: string,
  serviceKeyword: ServiceKeyword,
  category: VarietyCategory,
  seed: number
): string {
  const sentences: string[] = [];
  if (language === 'Bahasa Indonesia') {
    sentences.push(
      `${topic} di ${city} semakin populer bagi yang ingin menjaga kesehatan dan relaksasi.`
    );
    sentences.push(
      `Banyak klien merasakan perbaikan sirkulasi, postur, dan kualitas tidur setelah sesi rutin.`
    );
    sentences.push(
      `Pilih penyedia layanan ${serviceKeyword} yang bersertifikasi dan komunikasikan kebutuhan Anda.`
    );
    sentences.push(
      `Di ${city} tersedia pilihan dari spa hingga layanan ke rumah. IndaStreet menghubungkan Anda dengan terapis dan spa terverifikasi di ${city}.`
    );
  } else {
    sentences.push(
      `${topic} in ${city} is a popular choice for anyone looking to improve relaxation and well-being.`
    );
    sentences.push(
      `Regular sessions can help with circulation, posture, and stress when you choose a qualified ${serviceKeyword} provider.`
    );
    sentences.push(
      `In ${city} you can find everything from spa visits to home services. Book through a trusted platform and read reviews before you decide.`
    );
    sentences.push(
      `IndaStreet connects you with verified ${serviceKeyword} professionals in ${city}.`
    );
  }
  let caption = sentences.join(' ');
  const w = wordCount(caption);
  if (w < 120) {
    const extra =
      language === 'Bahasa Indonesia'
        ? ` Cari rekomendasi ${serviceKeyword} terbaik di ${city} dan bandingkan ulasan sebelum booking.`
        : ` Compare options and read reviews to find the best ${serviceKeyword} in ${city}.`;
    caption = caption + extra;
  }
  if (wordCount(caption) > 220) caption = caption.trim().split(/\s+/).slice(0, 220).join(' ');
  return caption;
}

/** 5–10 localized hashtags; city + service. */
function buildHashtags(
  city: string,
  serviceKeyword: ServiceKeyword,
  topic: string,
  country: string,
  seed: number
): string[] {
  const cityNorm = city.replace(/\s+/g, '');
  const base = [
    `#${serviceKeyword.replace(/\s+/g, '')}${cityNorm}`,
    `#${cityNorm}`,
    '#IndaStreet',
    '#Wellness',
  ];
  const topicTag = '#' + topic.replace(/\s+/g, '').slice(0, 20);
  const extra = country === 'Indonesia' ? ['#pijat', '#spaIndonesia'] : ['#massage', '#spa'];
  const combined = [...new Set([...base, topicTag, ...extra])];
  return combined.slice(0, 5 + (seed % 6));
}

/** SEO keywords: city + service, long-tail. */
function buildSeoKeywords(
  city: string,
  serviceKeyword: ServiceKeyword,
  topic: string,
  language: string
): string[] {
  const cityService = `${serviceKeyword} ${city}`.toLowerCase();
  const topicCity = `${topic} ${city}`.toLowerCase();
  const list = [cityService, topicCity];
  if (language === 'Bahasa Indonesia') {
    list.push(`pijat ${city}`.toLowerCase(), `spa ${city}`.toLowerCase());
  } else {
    list.push(`best ${serviceKeyword} ${city}`.toLowerCase());
  }
  return [...new Set(list)].slice(0, 5);
}

/** Slug: topic + city, URL-safe. */
function buildSlug(topic: string, city: string): string {
  return slugify(`${topic} ${city}`) + '-' + shortId().slice(0, 6);
}

/**
 * Check if this topic/city combo is too similar to recent topics (uniqueness filter).
 * Caller should pass last 100 post topics (or topic+city strings) for that country.
 * Returns true if similarity would exceed 40% (same topic or same topic+city).
 */
export function isTopicTooSimilar(
  topic: string,
  city: string,
  recentTopicCityPairs: Array<{ topic: string; city: string }>
): boolean {
  const norm = (t: string, c: string) => `${t.toLowerCase()}|${c.toLowerCase()}`;
  const current = norm(topic, city);
  for (const p of recentTopicCityPairs) {
    const other = norm(p.topic, p.city);
    if (current === other) return true;
    const topicOverlap =
      topic.toLowerCase().split(/\s+/).filter((w) => p.topic.toLowerCase().includes(w)).length /
      Math.max(topic.split(/\s+/).length, 1);
    if (topicOverlap > 0.4) return true;
  }
  return false;
}

/**
 * Generate one global post payload for the given country.
 * Uses variety category and service keyword; picks city from country dataset.
 * If recentTopicCityPairs provided, caller can retry with different topic when isTopicTooSimilar.
 */
export function generateGlobalPostPayload(params: {
  country: string;
  topic: string;
  category: VarietyCategory;
  serviceKeyword: ServiceKeyword;
  city?: string;
  seed?: number;
}): GlobalPostPayload {
  const {
    country,
    topic,
    category,
    serviceKeyword,
    city: cityOverride,
    seed = Date.now(),
  } = params;

  const config = COUNTRY_CONTENT_CONFIGS[country];
  const language = config?.primaryLanguage ?? 'English';
  const cities = getCitiesForCountry(country);
  const city = cityOverride ?? (cities.length ? pick(cities, seed) : 'Unknown');

  const title = buildTitle(topic, city, language, serviceKeyword, seed);
  const caption = buildCaption(
    topic,
    city,
    country,
    language,
    serviceKeyword,
    category,
    seed + 1
  );
  const hashtags = buildHashtags(city, serviceKeyword, topic, country, seed + 2);
  const seoKeywords = buildSeoKeywords(city, serviceKeyword, topic, language);
  const slug = buildSlug(topic, city);

  return {
    country: config?.country ?? country,
    language,
    city,
    topic,
    title,
    caption,
    hashtags,
    seoKeywords,
    slug,
  };
}

/**
 * Get next variety category (no repeat). Pass previous category; returns next.
 */
export function getNextVarietyCategory(previous: VarietyCategory | null): VarietyCategory {
  const idx = previous
    ? (VARIETY_CATEGORIES.indexOf(previous) + 1 + Math.floor(Math.random() * (VARIETY_CATEGORIES.length - 1))) %
      VARIETY_CATEGORIES.length
    : Math.floor(Math.random() * VARIETY_CATEGORIES.length);
  return VARIETY_CATEGORIES[idx];
}

/** Pick random service keyword. */
export function pickServiceKeyword(seed: number): ServiceKeyword {
  return pick([...SERVICE_KEYWORDS], seed);
}

/**
 * Map GlobalPostPayload to publisher input (title, slug, description, body, hashtags, etc.).
 * Use when publishing global-engine posts into SEO_POSTS / feed.
 */
export function globalPayloadToPublishInput(
  payload: GlobalPostPayload,
  options: { authorId: string; originCountry: string }
): {
  title: string;
  slug: string;
  description: string;
  body: string;
  hashtags: string[];
  imagePrompt: string;
  authorId: string;
  originCountry: string;
  city?: string;
  topic?: string;
  category?: string;
  service?: string;
} {
  return {
    title: payload.title,
    slug: payload.slug,
    description: payload.caption.slice(0, 160),
    body: payload.caption,
    hashtags: payload.hashtags,
    imagePrompt: `Professional ${payload.topic} in ${payload.city}, wellness setting, natural lighting`,
    authorId: options.authorId,
    originCountry: options.originCountry,
    city: payload.city,
    topic: payload.topic,
    service: payload.seoKeywords[0] ?? undefined,
  };
}

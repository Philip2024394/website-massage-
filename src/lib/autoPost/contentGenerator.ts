/**
 * Auto-post Content Generator. Spec: AUTO-POST-REMAINING-BUILD-SPEC § COMPONENT 2.
 * generatePostContent({ topic, city, category, service }) → title, slug, description, body, hashtags, imagePrompt.
 * Uses SEO_TOPICS_BY_CATEGORY and SEO_CITIES_ALL. Body 600–900 words, description 140–160 chars, no keyword stuffing.
 */

import type { GeneratedPostContent } from './types';
import type { SeoTopicCategory } from './types';

const BASE_URL = 'https://www.indastreetmassage.com';

/** Slugify for URL-safe unique slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Short id for uniqueness (collision-resistant suffix) */
export function shortId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return (t + r).slice(-10);
}

/** Build title: topic + city. Must contain both. */
function buildTitle(topic: string, city: string): string {
  const trimmed = topic.trim();
  if (trimmed.endsWith('?')) return `${trimmed} Experts in ${city} Answer`;
  return `${trimmed} in ${city}`;
}

/** Meta description 140–160 chars, from topic + city + benefit snippet */
function buildDescription(topic: string, city: string, service?: string): string {
  const parts = [
    `Discover ${topic.toLowerCase()} in ${city}.`,
    service ? `Professional ${service} and wellness tips.` : 'Expert tips and trusted local providers.',
    'IndaStreet.',
  ];
  let d = parts.join(' ');
  if (d.length > 160) d = d.slice(0, 157) + '...';
  if (d.length < 140) d = d + ' Find verified therapists and spas near you.';
  return d.slice(0, 160);
}

/** Hashtags: city + service/keyword based */
function buildHashtags(city: string, topic: string, service?: string): string[] {
  const cityTag = `#Massage${city.replace(/\s+/g, '')}`;
  const base = [cityTag, '#IndaStreet', '#WellnessIndonesia'];
  const fromTopic = topic
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .map((w) => '#' + w.replace(/[^a-z0-9]/gi, ''));
  const fromService = service ? ['#' + service.replace(/\s+/g, '')] : [];
  return [...new Set([...base, ...fromTopic, ...fromService])].slice(0, 8);
}

/** Image prompt for AI/stock: real-looking, no text overlay, warm lighting */
function buildImagePrompt(topic: string, city: string, service?: string): string {
  const subject = service || topic.split(' ').slice(0, 3).join(' ');
  return `Professional ${subject} in a calm wellness setting, ${city}, natural lighting, real people, no text overlay, warm tones`;
}

/** Paragraph pool for body variation (helpful, local, CTA). Word count target 600–900. */
const INTRO_TEMPLATES = [
  (t: string, c: string) =>
    `${t} is one of the most sought-after wellness topics for people in ${c}. Whether you are looking to relieve tension, improve circulation, or simply unwind, understanding the benefits and best practices can help you get the most from your sessions. In this guide we look at what you should know before booking, what to expect during a session, and how to choose a provider you can trust.`,
  (t: string, c: string) =>
    `Residents and visitors in ${c} often ask about ${t.toLowerCase()}. Getting clear, reliable information helps you choose the right type of session and the right provider for your needs. Here we outline the main benefits, who can benefit most, and how to find qualified professionals in your area.`,
];

const BODY_TEMPLATES = [
  (t: string, c: string) =>
    `Many people in ${c} find that regular sessions improve posture, reduce stress, and support overall well-being. It is important to choose a qualified provider and to communicate your goals and any areas of concern before your appointment. A good therapist or spa will ask about your health history and preferences so they can tailor the session. Results are often best when you stay consistent and combine treatments with healthy habits like stretching and hydration.`,
  (t: string, c: string) =>
    `Quality matters when it comes to wellness services. In ${c}, look for trained professionals who follow hygiene standards and use appropriate techniques. A good session should leave you feeling better, not sore or uncomfortable. If something does not feel right during the treatment, say so; a professional will adjust pressure or approach. Many clients report better sleep, less muscle tension, and improved mood after regular sessions.`,
  (t: string, c: string) =>
    `Whether you prefer a spa visit or a therapist who comes to you, ${c} has options to suit different schedules and preferences. Booking through a trusted platform can help you compare providers and read reviews before you decide. Home services are popular for convenience and privacy, while spas offer a full experience with facilities and multiple treatments. Both can deliver excellent results when you choose a licensed or certified provider.`,
  (t: string, c: string) =>
    `Safety and hygiene should always come first. In ${c} and elsewhere, reputable therapists use clean linens, wash their hands, and work in a clean environment. If you have health conditions or are pregnant, mention this when booking so the provider can confirm the treatment is suitable. Most wellness treatments are safe for the general population when done by trained staff and with clear communication.`,
  (t: string, c: string) =>
    `The benefits of regular wellness treatments extend beyond the session itself. Clients in ${c} often notice improved circulation, reduced headaches, and better flexibility over time. Combining different approaches—for example, relaxation one week and deeper work the next—can address both stress and specific muscle tension. Setting a regular schedule, such as every two weeks, helps many people maintain the results they want.`,
  (t: string, c: string) =>
    `Choosing the right provider in ${c} can feel overwhelming with so many options. Start by reading reviews and checking that the therapist or spa is transparent about techniques and pricing. A short consultation or trial session can help you decide if the fit is right. Trust your instincts: you should feel comfortable and heard. Many of the best long-term client-provider relationships start with a single, well-chosen first visit.`,
];

const LOCAL_TEMPLATES = [
  (c: string) =>
    `Across ${c}, demand for wellness and self-care has grown. More people are making time for regular treatments as part of a healthy routine. Local providers have responded with a range of options from quick express sessions to longer, more intensive treatments. Whether you are a first-timer or a regular, there is likely a service and a provider that fits your schedule and goals.`,
  (c: string) =>
    `If you are in ${c} and considering your first session or looking to try a new type of treatment, take time to research and choose a provider that fits your needs. Read reviews, check credentials where possible, and book at a time when you can relax without rushing. Many clients find that a trial session helps them understand what to expect and whether they want to make it a regular part of their routine.`,
];

const CTA_TEMPLATES = [
  (c: string) =>
    `Looking for trusted therapists and spas in ${c}? Explore local providers on IndaStreet and book with confidence. We connect you with verified professionals so you can focus on your wellness.`,
  (c: string) =>
    `Find verified wellness providers in ${c} and book your next session easily. IndaStreet connects you with professionals who meet high standards of quality and safety. Browse options, compare reviews, and book at a time that works for you.`,
];

function pickTemplate<T>(arr: T[], seed: number): T {
  return arr[Math.floor(Math.abs(Math.sin(seed) * 1e6)) % arr.length];
}

/** Generate body 600–900 words: hook, helpful content, local relevance, CTA. */
function buildBody(topic: string, city: string, seed: number): string {
  const intro = pickTemplate(INTRO_TEMPLATES, seed)(topic, city);
  const p2 = pickTemplate(BODY_TEMPLATES, seed + 1)(topic, city);
  const p3 = pickTemplate(BODY_TEMPLATES, seed + 2)(topic, city);
  const p4 = pickTemplate(BODY_TEMPLATES, seed + 5)(topic, city);
  const p5 = pickTemplate(BODY_TEMPLATES, seed + 6)(topic, city);
  const p6 = pickTemplate(BODY_TEMPLATES, seed + 7)(topic, city);
  const local = pickTemplate(LOCAL_TEMPLATES, seed + 3)(city);
  const cta = pickTemplate(CTA_TEMPLATES, seed + 4)(city);
  const paragraphs = [intro, p2, p3, p4, p5, p6, local, cta];
  return paragraphs.join('\n\n');
}

/**
 * Generate full post content. No DB access here; duplicate title check is in Publisher.
 */
export function generatePostContent(params: {
  topic: string;
  city: string;
  category: SeoTopicCategory;
  service?: string;
  slugSuffix?: string; // optional unique suffix if publisher detected duplicate
}): GeneratedPostContent {
  const { topic, city, category, service, slugSuffix } = params;
  const title = buildTitle(topic, city);
  const baseSlug = slugify(`${topic} ${city}`) + (slugSuffix ? `-${slugSuffix}` : `-${shortId()}`);
  const slug = baseSlug;
  const description = buildDescription(topic, city, service);
  const seed = (topic + city + (service || '')).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const body = buildBody(topic, city, seed);
  const hashtags = buildHashtags(city, topic, service);
  const imagePrompt = buildImagePrompt(topic, city, service);

  return {
    title,
    slug,
    description,
    body,
    hashtags,
    imagePrompt,
  };
}

/** Build canonical URL for a slug */
export function getCanonicalUrl(slug: string): string {
  return `${BASE_URL}/post/${slug}`;
}

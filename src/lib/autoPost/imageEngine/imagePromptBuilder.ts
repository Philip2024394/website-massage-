/**
 * Builds localized, varied image prompts for the auto-post image engine.
 * Adds randomness (lighting, angle, environment) to avoid duplicate-looking images.
 */

const LIGHTING_STYLES = [
  'soft lighting',
  'studio lighting',
  'natural daylight',
  'spa ambience',
] as const;

const CAMERA_ANGLES = [
  'slightly elevated angle',
  'eye-level composition',
  'wide shot showing environment',
] as const;

const ENVIRONMENT_TYPES = [
  'clean modern spa interior',
  'calm wellness room',
  'minimalist treatment space',
] as const;

const COMPOSITION_STYLES = [
  'professional product-style composition',
  'lifestyle shot with natural feel',
  'editorial style',
] as const;

/** Deterministic pick from array based on seed string */
function pickStyle<T>(arr: readonly T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const idx = Math.abs(h) % arr.length;
  return arr[idx];
}

export interface BuildImagePromptInput {
  topic: string;
  city: string;
  service?: string;
  country: string;
}

/**
 * Build a localized image prompt with variation (lighting, angle, environment)
 * so generated images look unique and avoid duplicate flags.
 */
export function buildImagePrompt(input: BuildImagePromptInput): string {
  const { topic, city, service, country } = input;
  const subject = service || topic.split(' ').slice(0, 3).join(' ');
  const seed = [topic, city, country, subject || ''].join('|');
  const lighting = pickStyle(LIGHTING_STYLES, seed + '1');
  const angle = pickStyle(CAMERA_ANGLES, seed + '2');
  const env = pickStyle(ENVIRONMENT_TYPES, seed + '3');
  const style = pickStyle(COMPOSITION_STYLES, seed + '4');

  return `Professional realistic photo of ${subject} treatment in ${city}, ${country}. ${env}, ${lighting}, ${angle}, ${style}. Wellness atmosphere, high quality, photographic realism, no text, no watermark. Topic: ${topic}`;
}

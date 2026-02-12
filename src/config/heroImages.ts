/**
 * Hero Images Configuration - Universal Set for All Indonesia
 * Updated: January 10, 2026
 * 
 * ✅ SINGLE UNIVERSAL SET - Used for ALL locations in Indonesia
 * ✅ Used for: Therapists AND Massage Places
 * ✅ Locations: All cities (Yogyakarta, Bandung, Jakarta, Bali, etc.)
 */

// Universal hero images - 18 professional massage images for all profiles
const UNIVERSAL_HERO_IMAGES = [
  'https://ik.imagekit.io/7grri5v7d/123456789101112131415161718.png',
  'https://ik.imagekit.io/7grri5v7d/1234567891011121314151617.png',
  'https://ik.imagekit.io/7grri5v7d/12345678910111213141516.png',
  'https://ik.imagekit.io/7grri5v7d/123456789101112131415.png',
  'https://ik.imagekit.io/7grri5v7d/1234567891011121314.png',
  'https://ik.imagekit.io/7grri5v7d/12345678910111213.png',
  'https://ik.imagekit.io/7grri5v7d/123456789101112.png',
  'https://ik.imagekit.io/7grri5v7d/1234567891011.png',
  'https://ik.imagekit.io/7grri5v7d/12345678910.png',
  'https://ik.imagekit.io/7grri5v7d/123456789.png',
  'https://ik.imagekit.io/7grri5v7d/12345678.png',
  'https://ik.imagekit.io/7grri5v7d/1234567.png',
  'https://ik.imagekit.io/7grri5v7d/123456.png',
  'https://ik.imagekit.io/7grri5v7d/12345.png',
  'https://ik.imagekit.io/7grri5v7d/1234.png',
  'https://ik.imagekit.io/7grri5v7d/123.png',
  'https://ik.imagekit.io/7grri5v7d/12.png',
  'https://ik.imagekit.io/7grri5v7d/1.png',
];

export const HERO_IMAGES = {
  // All locations use the same universal images
  yogyakarta: UNIVERSAL_HERO_IMAGES,
  bali: UNIVERSAL_HERO_IMAGES,
  bandung: UNIVERSAL_HERO_IMAGES,
  jakarta: UNIVERSAL_HERO_IMAGES,
  surabaya: UNIVERSAL_HERO_IMAGES,
  default: UNIVERSAL_HERO_IMAGES
};

/**
 * Welcome messages with Indonesian SEO keywords
 * Note: {city} will be replaced with actual location
 */
export const HERO_WELCOME_TEXT = {
  id: {
    title: '{city} Therapist',
    subtitle: 'Terapis Pijat Profesional | Layanan Panggilan Ke Rumah | Tersedia di {city}',
    keywords: 'Pijat Panggilan, Terapis Profesional, Massage {city}, Spa di Rumah'
  },
  en: {
    title: '{city} Therapist',
    subtitle: 'Professional Massage Therapist | Home Service Available | {city}',
    keywords: 'Home Massage, Professional Therapist, Massage {city}, Spa at Home'
  }
};

/**
 * WhatsApp/Social Media Preview Configuration
 * 
 * Customize how your shared links appear in WhatsApp, Facebook, etc.
 * Upload images to ImageKit and update URLs below
 */

export const PREVIEW_IMAGES = {
  // City-specific preview images (1200x630px recommended)
  cities: {
    'ubud': 'https://ik.imagekit.io/7grri5v7d/ubud-massage-preview.jpg',
    'canggu': 'https://ik.imagekit.io/7grri5v7d/canggu-massage-preview.jpg',
    'seminyak': 'https://ik.imagekit.io/7grri5v7d/seminyak-massage-preview.jpg',
    'sanur': 'https://ik.imagekit.io/7grri5v7d/sanur-massage-preview.jpg',
    'denpasar': 'https://ik.imagekit.io/7grri5v7d/denpasar-massage-preview.jpg',
    'kuta': 'https://ik.imagekit.io/7grri5v7d/kuta-massage-preview.jpg',
    'nusa dua': 'https://ik.imagekit.io/7grri5v7d/nusa-dua-massage-preview.jpg',
    'jimbaran': 'https://ik.imagekit.io/7grri5v7d/jimbaran-massage-preview.jpg',
    'yogyakarta': 'https://ik.imagekit.io/7grri5v7d/yogarkatya.png',
  },

  // Default fallback image
  default: 'https://ik.imagekit.io/7grri5v7d/indastreet-massage-preview.jpg',

  // Special therapist images (optional - use therapist ID as key)
  therapists: {
    // Example: '692467a3001f6f05aaa1': 'https://ik.imagekit.io/7grri5v7d/budi-special-preview.jpg',
  }
};

/**
 * How to customize:
 * 
 * 1. UPLOAD IMAGES TO IMAGEKIT:
 *    - Go to ImageKit dashboard
 *    - Upload 1200x630px images for best quality
 *    - Copy the image URLs
 * 
 * 2. UPDATE URLs ABOVE:
 *    - Add your city names (lowercase)
 *    - Paste the ImageKit URLs
 * 
 * 3. COMMIT AND PUSH:
 *    - The changes will appear in WhatsApp previews immediately
 * 
 * RECOMMENDED IMAGE SIZES:
 * - WhatsApp: 1200x630px (16:9 ratio)
 * - Include your logo and city name in the image
 * - Use high contrast text for readability
 */
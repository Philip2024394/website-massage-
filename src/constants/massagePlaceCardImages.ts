/**
 * Pool of images for massage place listing cards on the home page.
 * Each member gets a random (but stable per place) image from this pool so all members
 * have equal chance of being opened. Replace these URLs with your 20 uploaded images.
 * Profile page always uses the place's own mainImage for hero.
 */

export const MASSAGE_PLACE_CARD_IMAGE_POOL: string[] = [
  'https://ik.imagekit.io/7grri5v7d/ma%201.png',
  'https://ik.imagekit.io/7grri5v7d/ma%202.png',
  'https://ik.imagekit.io/7grri5v7d/ma%203.png',
  'https://ik.imagekit.io/7grri5v7d/ma%204.png',
  'https://ik.imagekit.io/7grri5v7d/ma%201.png',
  'https://ik.imagekit.io/7grri5v7d/ma%202.png',
  'https://ik.imagekit.io/7grri5v7d/ma%203.png',
  'https://ik.imagekit.io/7grri5v7d/ma%204.png',
  'https://ik.imagekit.io/7grri5v7d/ma%201.png',
  'https://ik.imagekit.io/7grri5v7d/ma%202.png',
  'https://ik.imagekit.io/7grri5v7d/ma%203.png',
  'https://ik.imagekit.io/7grri5v7d/ma%204.png',
  'https://ik.imagekit.io/7grri5v7d/ma%201.png',
  'https://ik.imagekit.io/7grri5v7d/ma%202.png',
  'https://ik.imagekit.io/7grri5v7d/ma%203.png',
  'https://ik.imagekit.io/7grri5v7d/ma%204.png',
  'https://ik.imagekit.io/7grri5v7d/ma%201.png',
  'https://ik.imagekit.io/7grri5v7d/ma%202.png',
  'https://ik.imagekit.io/7grri5v7d/ma%203.png',
  'https://ik.imagekit.io/7grri5v7d/ma%204.png',
];

/** Pick a stable card image for a place from the pool (by placeId hash). */
export function getMassagePlaceCardImage(placeId: string): string {
  if (!placeId || MASSAGE_PLACE_CARD_IMAGE_POOL.length === 0) {
    return MASSAGE_PLACE_CARD_IMAGE_POOL[0] || 'https://ik.imagekit.io/7grri5v7d/ma%201.png';
  }
  let hash = 0;
  for (let i = 0; i < placeId.length; i++) {
    hash = (hash << 5) - hash + placeId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MASSAGE_PLACE_CARD_IMAGE_POOL.length;
  return MASSAGE_PLACE_CARD_IMAGE_POOL[index];
}

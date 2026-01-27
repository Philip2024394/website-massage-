// Therapist image utilities stub
const defaultImages = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150/0000FF',
  'https://via.placeholder.com/150/FF0000'
];

export function getRandomTherapistImage(): string {
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

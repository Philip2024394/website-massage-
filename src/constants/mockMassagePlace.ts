/**
 * Mock massage place (spa) for City Places tab when Appwrite collection is empty or for demo.
 * Same shape as Place (id, name, mainImage, price60/90/120, etc.).
 */
export const MOCK_MASSAGE_PLACE_ID = 'mock-massage-place-1';

const MASSAGE_IMG = 'https://ik.imagekit.io/7grri5v7d/massage%20room%202.png';

export const MOCK_MASSAGE_PLACE = {
  $id: MOCK_MASSAGE_PLACE_ID,
  id: MOCK_MASSAGE_PLACE_ID,
  type: 'place' as const,
  name: 'Serenity Massage Spa',
  description: 'Traditional and wellness massage in a calm setting. Experienced therapists for relaxation and recovery.',
  mainImage: MASSAGE_IMG,
  profilePicture: MASSAGE_IMG,
  location: 'Seminyak, Bali',
  address: 'Seminyak, Bali',
  city: 'Bali',
  whatsappNumber: '6281234567890',
  rating: 4.8,
  reviewCount: 56,
  status: 'Open',
  availability: 'Available',
  isLive: true,
  price60: 250,
  price90: 350,
  price120: 450,
  pricing: { 60: 250000, 90: 350000, 120: 450000 },
  operatingHours: '10:00 - 22:00',
  services: 'Traditional, Deep Tissue, Aromatherapy, Hot Stone',
  coordinates: '-8.6705,115.2126',
  lat: -8.6705,
  lng: 115.2126,
  isVerified: true,
  galleryImages: [
    { imageUrl: MASSAGE_IMG, header: 'Spa Space', description: 'Relaxing environment for massage.' },
    { imageUrl: MASSAGE_IMG, header: 'Treatment Room', description: 'Private room for your session.' },
  ],
};

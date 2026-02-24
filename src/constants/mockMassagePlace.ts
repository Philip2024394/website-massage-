/**
 * Mock massage place (spa) for City Places tab when Appwrite collection is empty or for demo.
 * Same shape as Place (id, name, mainImage, price60/90/120, etc.).
 * Main image from placeMainImages.ts; profile image from placeProfileImages.ts (no confusion).
 * ELITE plan + Visit Us fields so profile page shows the "Visit Us" container for demo.
 */
import { PLACE_MAIN_IMAGES } from './placeMainImages';
import { PLACE_PROFILE_IMAGES } from './placeProfileImages';

export const MOCK_MASSAGE_PLACE_ID = 'mock-massage-place-1';

export const MOCK_MASSAGE_PLACE = {
  $id: MOCK_MASSAGE_PLACE_ID,
  id: MOCK_MASSAGE_PLACE_ID,
  type: 'place' as const,
  name: 'Serenity Massage Spa',
  description: 'Traditional and wellness massage in a calm setting. Experienced therapists for relaxation and recovery.',
  mainImage: PLACE_MAIN_IMAGES.massage,
  profilePicture: PLACE_PROFILE_IMAGES.massage,
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
  coordinates: { lat: -8.6705, lng: 115.2126 },
  lat: -8.6705,
  lng: 115.2126,
  isVerified: true,
  galleryImages: [
    { imageUrl: PLACE_MAIN_IMAGES.massage, header: 'Spa Space', description: 'Relaxing environment for massage.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/ma%201.png', header: 'Gallery', description: 'Massage space.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/ma%202.png', header: 'Gallery', description: 'Massage space.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/ma%203.png', header: 'Gallery', description: 'Massage space.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/ma%204.png', header: 'Gallery', description: 'Massage space.' },
  ],
  // ELITE plan – enables "Visit Us" container on profile page
  membershipPlan: 'elite' as const,
  plan: 'elite' as const,
  // Visit Us – full address
  streetAddress: 'Jalan Kayu Aya No. 22',
  area: 'Seminyak',
  province: 'Bali',
  postalCode: '80361',
  // Hours (Indonesia timezone)
  openingTime: '10:00',
  closingTime: '22:00',
  // Optional: custom location image (storefront/entrance); using Google Maps style background
  visitUsImageUrl: 'https://ik.imagekit.io/7grri5v7d/map%20google.png',
  // Optional: parking and contact for Call Spa
  parkingAvailability: 'Parking available at the back.',
  contactNumber: '6281234567890',
};

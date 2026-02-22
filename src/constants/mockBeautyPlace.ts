/**
 * Mock beauty place (salon) for home card and profile when no beauty places from backend.
 * Same shape as Place (id, name, mainImage, price60/90/120, etc.).
 * Main image from placeMainImages.ts; profile image from placeProfileImages.ts (no confusion).
 */
import { PLACE_MAIN_IMAGES } from './placeMainImages';
import { PLACE_PROFILE_IMAGES } from './placeProfileImages';

export const MOCK_BEAUTY_PLACE_ID = 'mock-beauty-salon-1';

const BEAUTY_MAIN = PLACE_MAIN_IMAGES.beauty;

export const MOCK_BEAUTY_PLACE = {
  $id: MOCK_BEAUTY_PLACE_ID,
  id: MOCK_BEAUTY_PLACE_ID,
  type: 'beauty' as const,
  name: 'Luxe Beauty Salon',
  description: 'Nails, hair, and makeup in a modern salon. Professional stylists and nail artists.',
  mainImage: BEAUTY_MAIN,
  profilePicture: PLACE_PROFILE_IMAGES.beauty,
  location: 'Seminyak, Bali',
  address: 'Seminyak, Bali',
  city: 'Bali',
  whatsappNumber: '6281234567890',
  rating: 4.8,
  reviewCount: 38,
  status: 'Available',
  availability: 'Available',
  isLive: true,
  price60: 120,
  price90: 200,
  price120: 280,
  pricing: { 60: 120000, 90: 200000, 120: 280000 },
  operatingHours: '10:00 - 20:00',
  facialTypes: ['Nail Polish', 'Eyebrows', 'Hair Color', 'Blow Dry', 'Makeup'],
  beautyServices: ['Nail Polish', 'Eyebrows', 'Hair Color', 'Blow Dry', 'Makeup'],
  amenities: ['Consultation', 'Nail Art', 'Hair Styling'],
  galleryImages: [
    { imageUrl: BEAUTY_MAIN, header: 'Salon Space', description: 'Modern setup for nails, hair and makeup.' },
    { imageUrl: BEAUTY_MAIN, header: 'Nail Station', description: 'Clean nail station with premium products.' },
    { imageUrl: BEAUTY_MAIN, header: 'Hair Station', description: 'Professional hair styling and colour.' },
  ],
  coordinates: '-8.6705,115.2126',
  lat: -8.6705,
  lng: 115.2126,
  isVerified: true,
};

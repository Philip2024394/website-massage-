/**
 * Mock facial clinic for home card and profile when Appwrite collection is empty or fails.
 * Same shape as Place / mapped facial place (id, name, mainImage, price60/90/120, etc.).
 */
export const MOCK_FACIAL_PLACE_ID = 'mock-facial-clinic-1';

export const MOCK_FACIAL_PLACE = {
  $id: MOCK_FACIAL_PLACE_ID,
  id: MOCK_FACIAL_PLACE_ID,
  type: 'facial' as const,
  name: 'Glow Skin Clinic',
  description: 'Premium facial and skin care in a relaxing environment. Expert treatments for all skin types.',
  mainImage: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
  profilePicture: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
  location: 'Seminyak, Bali',
  address: 'Seminyak, Bali',
  city: 'Bali',
  whatsappNumber: '6281234567890',
  rating: 4.9,
  reviewCount: 42,
  status: 'Available',
  availability: 'Available',
  isLive: true,
  price60: 350,
  price90: 500,
  price120: 650,
  pricing: { 60: 350000, 90: 500000, 120: 650000 },
  operatingHours: '09:00 - 21:00',
  facialTypes: ['Deep Cleansing', 'Hydrating', 'Anti-Aging', 'Acne Treatment', 'Brightening'],
  amenities: ['Consultation', 'Skin Analysis', 'Aftercare'],
  galleryImages: [
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Our Space', description: 'A welcoming environment for premium facial and skin treatments.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Treatment Room', description: 'Clean, professional setup for your comfort and safety.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Reception', description: 'Comfortable waiting area with refreshments.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Skincare Products', description: 'Premium products used in our treatments.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Relaxation Zone', description: 'Post-treatment rest and hydration area.' },
  ],
  licenseCertImages: [
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Skincare Specialist Certificate', description: 'Certified in advanced facial treatments and skin analysis. Valid through 2026.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Health & Hygiene License', description: 'Clinic meets local health and safety standards for beauty services.' },
  ],
  coordinates: '-8.6705,115.2126',
  lat: -8.6705,
  lng: 115.2126,
  isVerified: true,
};

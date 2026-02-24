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
  // Estimated distance for demo (in km) – used when user location not available
  estimatedDistance: 2.4,

  // ELITE Premium Features
  // Ambiance/mood tags
  ambianceTags: ['Relaxing', 'Modern', 'Traditional Balinese'],
  // Couple's treatment available
  couplesTreatmentAvailable: true,
  // Gift card available
  giftCardAvailable: true,
  // What's included in treatments
  whatsIncluded: [
    'Complimentary welcome drink',
    'Hot towel service',
    'Shower facilities',
    'Locker & storage',
    'Aromatherapy oils',
    'Post-massage tea',
  ],
  // Languages spoken by staff
  languagesSpoken: ['English', 'Indonesian', 'Mandarin'],
  // Safety and comfort features
  safetyFeatures: [
    'Female therapists available',
    'Private treatment rooms',
    'Licensed & registered',
    'Hygiene certified',
    'CCTV in public areas',
  ],
  // Featured therapists
  therapists: [
    {
      id: '1',
      name: 'Sari Dewi',
      photo: 'https://ik.imagekit.io/7grri5v7d/therapist1.png',
      specialty: 'Traditional Balinese',
      yearsExperience: 8,
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Putu Ayu',
      photo: 'https://ik.imagekit.io/7grri5v7d/therapist2.png',
      specialty: 'Deep Tissue & Sports',
      yearsExperience: 5,
      rating: 4.8,
    },
    {
      id: '3',
      name: 'Wayan Sinta',
      photo: 'https://ik.imagekit.io/7grri5v7d/therapist3.png',
      specialty: 'Aromatherapy & Relaxation',
      yearsExperience: 6,
      rating: 4.9,
    },
  ],
  // Customer testimonials
  testimonials: [
    {
      id: '1',
      customerName: 'Sarah M.',
      rating: 5,
      text: 'Best massage experience in Bali! The therapists are incredibly skilled and the ambiance is perfect.',
      date: '2 weeks ago',
      treatment: '90 min Traditional',
    },
    {
      id: '2',
      customerName: 'John D.',
      rating: 5,
      text: 'Professional service from start to finish. Will definitely come back!',
      date: '1 month ago',
      treatment: '120 min Deep Tissue',
    },
    {
      id: '3',
      customerName: 'Amanda L.',
      rating: 4,
      text: 'Great value for money. Clean facilities and friendly staff.',
      date: '3 weeks ago',
      treatment: '60 min Aromatherapy',
    },
    {
      id: '4',
      customerName: 'Michael R.',
      rating: 5,
      text: 'The couple massage was amazing! Highly recommend for a romantic treat.',
      date: '1 week ago',
      treatment: "Couple's Traditional",
    },
  ],
  // Urgency indicators (for demo)
  viewingNow: 4,
  lastBookedMinutesAgo: 12,
};

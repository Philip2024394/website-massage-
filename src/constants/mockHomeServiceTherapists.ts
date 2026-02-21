/**
 * Mock home service therapists for Facial and Beauty tabs when Appwrite has no/few profiles.
 * Same shape as Therapist so TherapistHomeCard and profile flow work.
 */

export const MOCK_FACIAL_THERAPIST_ID = 'mock-facial-therapist-1';
export const MOCK_BEAUTY_THERAPIST_ID = 'mock-beauty-therapist-1';

const sharedMockFields = {
  appwriteId: '',
  email: 'mock@example.com',
  description: 'Professional home service provider. Book via WhatsApp.',
  status: 'Available' as const,
  availability: 'Available' as const,
  pricing: '{"60":250000,"90":350000,"120":450000}',
  price60: '250',
  price90: '350',
  price120: '450',
  distance: 0,
  isLive: true,
  coordinates: '{"lat":-7.7956,"lng":110.3695}',
  activeMembershipDate: new Date().toISOString().split('T')[0],
  analytics: '{}',
  locationId: 'yogyakarta',
  country: 'Indonesia',
};

export const MOCK_FACIAL_THERAPIST = {
  $id: MOCK_FACIAL_THERAPIST_ID,
  id: MOCK_FACIAL_THERAPIST_ID,
  ...sharedMockFields,
  appwriteId: MOCK_FACIAL_THERAPIST_ID,
  name: 'Dewi Facial',
  profilePicture: 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png?updatedAt=1764966155682',
  mainImage: 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png?updatedAt=1764966155682',
  location: 'Yogyakarta',
  whatsappNumber: '6281234567890',
  rating: 4.8,
  reviewCount: 24,
  servicesOffered: ['facial'],
  massageTypes: '["Deep Cleansing","Hydrating","Anti-Aging"]',
  isVerified: true,
};

/** Mock beautician treatments – 3 treatments for home card. Yogyakarta/Jogja market; prices include +30% for admin commission. */
const MOCK_BEAUTICIAN_TREATMENTS = JSON.stringify([
  { treatment_name: 'Basic Facial', fixed_price: 195000, estimated_duration_minutes: 60, currency: 'IDR' },
  { treatment_name: 'Acne Deep Cleansing Facial', fixed_price: 260000, estimated_duration_minutes: 75, currency: 'IDR' },
  { treatment_name: 'Whitening & Brightening Facial', fixed_price: 325000, estimated_duration_minutes: 60, currency: 'IDR' },
]);

/** Profile/main image for mock beautician (hair styles). */
const MOCK_BEAUTY_IMAGE = 'https://ik.imagekit.io/7grri5v7d/hait%20styles%20browns.png';

export const MOCK_BEAUTY_THERAPIST = {
  $id: MOCK_BEAUTY_THERAPIST_ID,
  id: MOCK_BEAUTY_THERAPIST_ID,
  ...sharedMockFields,
  appwriteId: MOCK_BEAUTY_THERAPIST_ID,
  name: 'Sari Beauty',
  profilePicture: MOCK_BEAUTY_IMAGE,
  mainImage: MOCK_BEAUTY_IMAGE,
  location: 'Yogyakarta',
  whatsappNumber: '6281234567890',
  rating: 4.7,
  reviewCount: 18,
  servicesOffered: ['beautician'],
  massageTypes: '["Manicure","Pedicure","Hair Styling","Makeup"]',
  isVerified: true,
  beauticianTreatments: MOCK_BEAUTICIAN_TREATMENTS,
};

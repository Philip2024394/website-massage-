/**
 * Mock facial clinic for home page when Appwrite collection is empty.
 * Same shape as Place so FacialPlaceHomeCard and FacialPlaceProfilePageNew work.
 */
import type { Place } from '../types';

export const MOCK_FACIAL_PLACE: Place = {
    id: 'mock-facial-clinic-1',
    $id: 'mock-facial-clinic-1',
    name: 'Glow Skin Clinic',
    email: '',
    description: 'Premium facial and skin care in a relaxing environment. We offer anti-aging, hydrating, and deep cleansing facials with 60, 90, and 120 minute options.',
    mainImage: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
    thumbnailImages: [],
    pricing: JSON.stringify({ '60': 350000, '90': 500000, '120': 650000 }),
    whatsappNumber: '6281234567890',
    distance: 0,
    rating: 4.9,
    reviewCount: 42,
    massageTypes: '[]',
    isLive: true,
    location: 'Jl. Raya Seminyak No. 88, Bali',
    coordinates: JSON.stringify([115.1668, -8.6912]),
    openingTime: '09:00',
    closingTime: '21:00',
    activeMembershipDate: '',
    profilePicture: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
    price60: '350',
    price90: '500',
    price120: '650',
    city: 'Bali',
    status: 'Open',
    isVerified: true,
    galleryImages: [
        { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', caption: 'Our Space' },
        { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', caption: 'Treatment Room' },
    ],
} as Place & {
    facialTypes?: string[];
    address?: string;
    operatingHours?: string;
    amenities?: string[];
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
};

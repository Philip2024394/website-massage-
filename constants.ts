import type { Therapist, Place } from './types';
import { AvailabilityStatus } from './types';

export const MOCK_THERAPISTS: Therapist[] = [
    {
        id: 1,
        name: 'Budi Santoso',
        profilePicture: 'https://picsum.photos/seed/budi/200/200',
        description: 'Specializes in deep tissue and relaxation massage. 5 years of experience.',
        status: AvailabilityStatus.Available,
        pricing: { 60: 100, 90: 140, 120: 180 },
        whatsappNumber: '6281234567890',
        distance: 2.5,
        rating: 4.8,
        reviewCount: 82,
        massageTypes: ['Deep Tissue', 'Relaxation', 'Swedish'],
        isLive: true,
        location: 'Jl. Jenderal Sudirman No.Kav. 52-53, Jakarta Selatan',
    },
    {
        id: 2,
        name: 'Citra Lestari',
        profilePicture: 'https://picsum.photos/seed/citra/200/200',
        description: 'Certified in aromatherapy and hot stone massage. Focus on holistic wellness.',
        status: AvailabilityStatus.Busy,
        pricing: { 60: 110, 90: 150, 120: 190 },
        whatsappNumber: '6281234567891',
        distance: 4.1,
        rating: 4.9,
        reviewCount: 112,
        massageTypes: ['Aromatherapy', 'Hot Stone'],
        isLive: true,
        location: 'Jl. Gajah Mada No.7, Kota Bandung',
    },
    {
        id: 3,
        name: 'Agus Wijaya',
        profilePicture: 'https://picsum.photos/seed/agus/200/200',
        description: 'Expert in sports massage and injury recovery. Works with professional athletes.',
        status: AvailabilityStatus.Offline,
        pricing: { 60: 95, 90: 135, 120: 175 },
        whatsappNumber: '6281234567892',
        distance: 8.9,
        rating: 4.7,
        reviewCount: 65,
        massageTypes: ['Sports Massage', 'Injury Recovery'],
        isLive: true,
        location: 'Jl. Mayjend. Sungkono No.89, Surabaya',
    },
    {
        id: 4,
        name: 'Dewi Anggraini',
        profilePicture: 'https://picsum.photos/seed/dewi/200/200',
        description: 'Gentle touch, specializing in Swedish and prenatal massage techniques.',
        status: AvailabilityStatus.Available,
        pricing: { 60: 120, 90: 160, 120: 200 },
        whatsappNumber: '6281234567893',
        distance: 1.2,
        rating: 4.9,
        reviewCount: 98,
        massageTypes: ['Swedish', 'Prenatal'],
        isLive: true,
        location: 'Jl. Teuku Umar No.1, Denpasar',
    },
];

export const MOCK_PLACES: Place[] = [
    {
        id: 1,
        name: 'Serene Spa & Wellness',
        description: 'Experience tranquility and rejuvenation at Serene Spa. Our professional therapists offer a range of treatments designed to relax your body and mind. Enjoy our peaceful ambiance and top-notch facilities.',
        mainImage: 'https://picsum.photos/seed/serene_main/800/600',
        thumbnailImages: [
            'https://picsum.photos/seed/serene_thumb1/200/200',
            'https://picsum.photos/seed/serene_thumb2/200/200',
            'https://picsum.photos/seed/serene_thumb3/200/200'
        ],
        pricing: { 60: 150, 90: 220, 120: 280 },
        whatsappNumber: '6287654321098',
        distance: 5.1,
        rating: 4.9,
        reviewCount: 156,
        isLive: true,
        location: 'Jl. Sunset Road No.81, Kuta, Bali',
    },
    {
        id: 2,
        name: 'Urban Oasis Massage',
        description: 'Escape the hustle and bustle of the city at Urban Oasis. We specialize in deep tissue and sports massages to relieve stress and muscle tension. Your urban sanctuary awaits.',
        mainImage: 'https://picsum.photos/seed/urban_main/800/600',
        thumbnailImages: [
            'https://picsum.photos/seed/urban_thumb1/200/200',
            'https://picsum.photos/seed/urban_thumb2/200/200',
            'https://picsum.photos/seed/urban_thumb3/200/200'
        ],
        pricing: { 60: 160, 90: 230, 120: 290 },
        whatsappNumber: '6287654321097',
        distance: 7.3,
        rating: 4.8,
        reviewCount: 204,
        isLive: true,
        location: 'Pacific Place Mall, Jl. Jenderal Sudirman, Jakarta',
    },
];

export const ADMIN_SIGNIN_CODE = 'admin1';

export const ADMIN_ACTIVATION_CODE = 'activate123';
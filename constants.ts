
import type { Therapist, Place } from './types';
import { AvailabilityStatus } from './types';

export const MASSAGE_TYPES_CATEGORIZED = [
    {
        category: 'Western Massages',
        types: ['Swedish Massage', 'Deep Tissue Massage', 'Sports Massage', 'Hot Stone Massage', 'Aromatherapy Massage']
    },
    {
        category: 'Eastern & Indonesian Massages',
        types: ['Balinese Massage', 'Javanese Massage', 'Thai Massage', 'Shiatsu Massage', 'Reflexology', 'Acupressure', 'Lomi Lomi Massage']
    },
    {
        category: 'Traditional Indonesian Techniques',
        types: ['Kerokan (Coin Rub)', 'Jamu Massage']
    },
    {
        category: 'Specialty Massages',
        types: ['Prenatal Massage', 'Lymphatic Massage', 'Indian Head Massage']
    }
];


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
        massageTypes: ['Deep Tissue Massage', 'Swedish Massage', 'Javanese Massage'],
        isLive: true,
        location: 'Jl. Teuku Nyak Arief No. 1, Banda Aceh',
        activeMembershipDate: '2025-06-30',
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
        massageTypes: ['Aromatherapy Massage', 'Hot Stone Massage', 'Balinese Massage'],
        isLive: true,
        location: 'Jl. Gajah Mada No.7, Bandung',
        activeMembershipDate: '2025-08-15',
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
        massageTypes: ['Sports Massage', 'Reflexology'],
        isLive: true,
        location: 'Jl. Mayjend. Sungkono No.89, Surabaya',
        activeMembershipDate: '2024-12-01',
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
        massageTypes: ['Swedish Massage', 'Prenatal Massage', 'Lomi Lomi Massage'],
        isLive: false,
        location: 'Jl. Teuku Umar No.1, Denpasar',
        activeMembershipDate: '2025-03-22',
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
        massageTypes: ['Balinese Massage', 'Hot Stone Massage', 'Aromatherapy Massage', 'Reflexology', 'Jamu Massage'],
        isLive: true,
        location: 'Jl. Sunset Road No.81, Denpasar, Bali',
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
        massageTypes: ['Deep Tissue Massage', 'Sports Massage', 'Swedish Massage', 'Thai Massage'],
        isLive: true,
        location: 'Pacific Place Mall, Jl. Jenderal Sudirman, Jakarta',
    },
];

export const ADMIN_SIGNIN_CODE = 'admin1';

export const ADMIN_ACTIVATION_CODE = 'activate123';
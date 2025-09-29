

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

export const PLACE_SERVICES = [
    'Facials', 'Body Scrubs', 'Body Wraps', 'Hair Salon', 'Beautician', 
    'Acupressure', 'Reflexology', 'Aromatherapy', 'Yoga & Pilates', 
    'Cupping Therapy', 'Physical Therapy', 'Sauna', 'Jacuzzi', 'Steam Room'
];


export const MOCK_THERAPISTS: Therapist[] = [
    {
        id: 1,
        name: 'Budi Santoso',
        email: 'budi@massage.com',
        password: 'password123',
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
        coordinates: { lat: 5.5563, lng: 95.3211 },
        activeMembershipDate: '2025-06-30',
    },
    {
        id: 2,
        name: 'Citra Lestari',
        email: 'citra@massage.com',
        password: 'password123',
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
        coordinates: { lat: -6.9147, lng: 107.6098 },
        activeMembershipDate: '2025-08-15',
    },
    {
        id: 3,
        name: 'Agus Wijaya',
        email: 'agus@massage.com',
        password: 'password123',
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
        coordinates: { lat: -7.2759, lng: 112.7538 },
        activeMembershipDate: '2024-12-01',
    },
    {
        id: 4,
        name: 'Dewi Anggraini',
        email: 'dewi@massage.com',
        password: 'password123',
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
        coordinates: { lat: -8.6705, lng: 115.2126 },
        activeMembershipDate: '2025-03-22',
    },
];

export const MOCK_PLACES: Place[] = [
    {
        id: 1,
        name: 'Serene Spa & Wellness',
        email: 'serene@spa.com',
        password: 'password123',
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
        massageTypes: ['Balinese Massage', 'Hot Stone Massage', 'Facials', 'Sauna'],
        isLive: true,
        location: 'Jl. Sunset Road No.81, Denpasar, Bali',
        coordinates: { lat: -8.6924, lng: 115.1764 },
        openingTime: '09:00',
        closingTime: '22:00',
    },
    {
        id: 2,
        name: 'Urban Oasis Massage',
        email: 'urban@spa.com',
        password: 'password123',
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
        massageTypes: ['Deep Tissue Massage', 'Sports Massage', 'Yoga & Pilates', 'Jacuzzi'],
        isLive: true,
        location: 'Pacific Place Mall, Jl. Jenderal Sudirman, Jakarta',
        coordinates: { lat: -6.2249, lng: 106.8021 },
        openingTime: '10:00',
        closingTime: '21:00',
    },
];

export const ADMIN_SIGNIN_CODE = 'admin1';

export const ADMIN_ACTIVATION_CODE = 'activate123';
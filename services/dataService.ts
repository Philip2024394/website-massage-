import { APP_CONFIG } from '../config';
import { Therapist, Place, User, Agent, HotelVillaServiceStatus } from '../types';
import { AvailabilityStatus } from '../types';
import { stringifyPricing, stringifyMassageTypes, stringifyCoordinates, stringifyAnalytics } from '../utils/appwriteHelpers';
import { therapistService, placesService as placeService, agentService } from '../lib/appwriteService';

// Main image URLs from ImageKit for therapists
const THERAPIST_MAIN_IMAGES = [
    'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720',
    'https://ik.imagekit.io/7grri5v7d/massage%20room.png?updatedAt=1760975249566',
    'https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264',
    'https://ik.imagekit.io/7grri5v7d/massage%20agents.png?updatedAt=1760968250776',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2016.png?updatedAt=1760187700624',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2013.png?updatedAt=1760187547313',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2012.png?updatedAt=1760187511503',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2011.png?updatedAt=1760187471233',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2010.png?updatedAt=1760187307232',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%207.png?updatedAt=1760187181168',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%205.png?updatedAt=1760187081702',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%204.png?updatedAt=1760187040909',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%203.png?updatedAt=1760186998015',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261',
];

// Helper function to get a random main image
const getRandomMainImage = (index: number): string => {
    return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
};

// Mock data
const generateMockTherapists = (): Therapist[] => [
    {
        id: 1,
        name: 'Maya Wellness',
        email: 'maya@example.com',
        profilePicture: 'https://via.placeholder.com/150/FFB366/FFFFFF?text=Maya',
        mainImage: getRandomMainImage(0),
        description: 'Experienced traditional Indonesian massage therapist specializing in relaxation and deep tissue massage.',
        status: AvailabilityStatus.Available,
        pricing: stringifyPricing({ "60": 150000, "90": 200000, "120": 250000 }),
        whatsappNumber: '6281234567890',
        distance: 2.5,
        rating: 4.8,
        reviewCount: 127,
        massageTypes: stringifyMassageTypes(['Traditional Indonesian', 'Deep Tissue', 'Relaxation']),
        isLive: true,
        location: 'Kemang, Jakarta Selatan',
        coordinates: stringifyCoordinates({ lat: -6.2615, lng: 106.8106 }),
        activeMembershipDate: new Date().toISOString().split('T')[0],
        analytics: stringifyAnalytics({ 
          impressions: 1250, 
          views: 0,
          profileViews: 567, 
          whatsapp_clicks: 0,
          whatsappClicks: 89,
          phone_clicks: 0,
          directions_clicks: 0,
          bookings: 0 
        }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 25,
        villaDiscount: 30,
    },
    {
        id: 2,
        name: 'Budi Massage Therapy',
        email: 'budi@example.com',
        profilePicture: 'https://via.placeholder.com/150/66B2FF/FFFFFF?text=Budi',
        mainImage: getRandomMainImage(1),
        description: 'Professional sports massage therapist with 8 years experience. Perfect for athletes and recovery.',
        status: AvailabilityStatus.Available,
        pricing: stringifyPricing({ "60": 180000, "90": 240000, "120": 300000 }),
        whatsappNumber: '6281234567891',
        distance: 3.2,
        rating: 4.6,
        reviewCount: 93,
        massageTypes: stringifyMassageTypes(['Sports Massage', 'Recovery', 'Deep Tissue']),
        isLive: true,
        location: 'Senopati, Jakarta Selatan',
        coordinates: stringifyCoordinates({ lat: -6.2297, lng: 106.8253 }),
        activeMembershipDate: new Date().toISOString().split('T')[0],
        analytics: stringifyAnalytics({ 
          impressions: 980, 
          views: 0,
          profileViews: 432, 
          whatsapp_clicks: 0,
          whatsappClicks: 67,
          phone_clicks: 0,
          directions_clicks: 0,
          bookings: 0 
        }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.NotOptedIn,
    },
    {
        id: 3,
        name: 'Sari Holistic Care',
        email: 'sari@example.com',
        profilePicture: 'https://via.placeholder.com/150/FF66B2/FFFFFF?text=Sari',
        mainImage: getRandomMainImage(2),
        description: 'Certified aromatherapy and holistic wellness specialist. Bringing peace and balance to your life.',
        status: AvailabilityStatus.Available,
        pricing: stringifyPricing({ "60": 160000, "90": 220000, "120": 280000 }),
        whatsappNumber: '6281234567892',
        distance: 1.8,
        rating: 4.9,
        reviewCount: 156,
        massageTypes: stringifyMassageTypes(['Aromatherapy', 'Holistic', 'Relaxation', 'Hot Stone']),
        isLive: true,
        location: 'Menteng, Jakarta Pusat',
        coordinates: stringifyCoordinates({ lat: -6.2088, lng: 106.8456 }),
        activeMembershipDate: new Date().toISOString().split('T')[0],
        analytics: stringifyAnalytics({ 
          impressions: 1450, 
          views: 0,
          profileViews: 678, 
          whatsapp_clicks: 0,
          whatsappClicks: 102,
          phone_clicks: 0,
          directions_clicks: 0,
          bookings: 0 
        }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 20,
        villaDiscount: 22,
    }
];

const generateMockPlaces = (): Place[] => [
    {
        id: 1,
        name: 'Indostreet Spa & Wellness',
        email: 'indostreetspa@example.com',
        description: 'Premium spa experience in the heart of Jakarta. Traditional Indonesian treatments with modern luxury.',
        mainImage: 'https://via.placeholder.com/400x250/F97316/FFFFFF?text=Indostreet+Spa',
        thumbnailImages: [
            'https://via.placeholder.com/150/F97316/FFFFFF?text=Room+1',
            'https://via.placeholder.com/150/F97316/FFFFFF?text=Room+2',
            'https://via.placeholder.com/150/F97316/FFFFFF?text=Room+3'
        ],
        pricing: stringifyPricing({ "60": 250000, "90": 350000, "120": 450000 }),
        whatsappNumber: '6281234567893',
        distance: 2.1,
        rating: 4.7,
        reviewCount: 234,
        massageTypes: stringifyMassageTypes(['Balinese', 'Swedish', 'Hot Stone', 'Couple Massage']),
        isLive: true,
        location: 'SCBD, Jakarta Selatan',
        coordinates: stringifyCoordinates({ lat: -6.2263, lng: 106.8008 }),
        openingTime: '09:00',
        closingTime: '22:00',
        activeMembershipDate: new Date().toISOString().split('T')[0],
        analytics: stringifyAnalytics({ 
          impressions: 2100, 
          views: 0,
          profileViews: 987, 
          whatsapp_clicks: 0,
          whatsappClicks: 156,
          phone_clicks: 0,
          directions_clicks: 0,
          bookings: 0 
        }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 35,
        villaDiscount: 40,
    },
    {
        id: 2,
        name: 'Zen Garden Massage',
        email: 'zengarden@example.com',
        description: 'Tranquil oasis offering authentic Asian massage techniques in a peaceful garden setting.',
        mainImage: 'https://via.placeholder.com/400x250/16A34A/FFFFFF?text=Zen+Garden',
        thumbnailImages: [
            'https://via.placeholder.com/150/16A34A/FFFFFF?text=Garden+1',
            'https://via.placeholder.com/150/16A34A/FFFFFF?text=Garden+2'
        ],
        pricing: stringifyPricing({ "60": 200000, "90": 280000, "120": 360000 }),
        whatsappNumber: '6281234567894',
        distance: 4.3,
        rating: 4.5,
        reviewCount: 178,
        massageTypes: stringifyMassageTypes(['Thai', 'Shiatsu', 'Reflexology', 'Traditional Chinese']),
        isLive: true,
        location: 'Pondok Indah, Jakarta Selatan',
        coordinates: stringifyCoordinates({ lat: -6.2608, lng: 106.7794 }),
        openingTime: '08:00',
        closingTime: '21:00',
        activeMembershipDate: new Date().toISOString().split('T')[0],
        analytics: stringifyAnalytics({ 
          impressions: 1678, 
          views: 0,
          profileViews: 743, 
          whatsapp_clicks: 0,
          whatsappClicks: 112,
          phone_clicks: 0,
          directions_clicks: 0,
          bookings: 0 
        }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 25,
        villaDiscount: 28,
    },
    {
        id: 3,
        name: 'Sample Massage Spa',
        email: 'sample@example.com',
        description: 'Featured sample massage spa showcasing our platform services. Always available in all Indonesian cities.',
        mainImage: 'https://via.placeholder.com/400x250/8B5CF6/FFFFFF?text=Sample+Massage+Spa',
        thumbnailImages: [
            'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Sample+1',
            'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Sample+2',
            'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Sample+3'
        ],
        pricing: stringifyPricing({ "60": 220000, "90": 300000, "120": 380000 }),
        whatsappNumber: '6281234567895',
        distance: 1.5,
        rating: 4.9,
        reviewCount: 456,
        massageTypes: stringifyMassageTypes(['Traditional Indonesian', 'Swedish', 'Deep Tissue', 'Aromatherapy']),
        isLive: true,
        location: 'Featured Sample Location, Jakarta',
        coordinates: stringifyCoordinates({ lat: -6.2088, lng: 106.8456 }),
        openingTime: '08:00',
        closingTime: '23:00',
        activeMembershipDate: new Date().toISOString().split('T')[0],
        analytics: stringifyAnalytics({ 
          impressions: 5000, 
          views: 0,
          profileViews: 2500, 
          whatsapp_clicks: 0,
          whatsappClicks: 500,
          phone_clicks: 0,
          directions_clicks: 0,
          bookings: 0 
        }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 40,
        villaDiscount: 45,
    }
];

// Data service that can switch between mock and Appwrite
export const dataService = {
    // Therapists
    async getTherapists(): Promise<Therapist[]> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            return generateMockTherapists();
        } else {
            try {
                return await therapistService.getAll() || [];
            } catch (error) {
                console.error('Error in dataService.getTherapists:', error);
                return [];
            }
        }
    },

    async getTherapistById(id: string): Promise<Therapist | null> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            const therapists = generateMockTherapists();
            return therapists.find(t => t.id.toString() === id) || null;
        } else {
            return therapistService.getById(id) || null;
        }
    },

    async createTherapist(therapist: Omit<Therapist, 'id'>): Promise<Therapist> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            const newTherapist = { ...therapist, id: Date.now() };
            // In mock mode, we can't persist data, so just return the created therapist
            return newTherapist;
        } else {
            return therapistService.create(therapist);
        }
    },

    async updateTherapist(id: string, updates: Partial<Therapist>): Promise<Therapist> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            const therapists = generateMockTherapists();
            const existing = therapists.find(t => t.id.toString() === id);
            if (!existing) throw new Error('Therapist not found');
            return { ...existing, ...updates };
        } else {
            return therapistService.update(id, updates);
        }
    },

    // Places
    async getPlaces(): Promise<Place[]> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            return generateMockPlaces();
        } else {
            return placeService.getAll() || [];
        }
    },

    async getPlaceById(id: string): Promise<Place | null> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            const places = generateMockPlaces();
            return places.find(p => p.id.toString() === id) || null;
        } else {
            return placeService.getById(id) || null;
        }
    },

    async createPlace(place: Omit<Place, 'id'>): Promise<Place> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            const newPlace = { ...place, id: Date.now() };
            return newPlace;
        } else {
            return placeService.update(place.$id || '', place);
        }
    },

    async updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            const places = generateMockPlaces();
            const existing = places.find(p => p.id.toString() === id);
            if (!existing) throw new Error('Place not found');
            return { ...existing, ...updates };
        } else {
            return placeService.update(id, updates);
        }
    },

    // Users (basic implementation)
    async getUsers(): Promise<User[]> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            return [
                { id: '1', name: 'John Doe', email: 'john@example.com', isActivated: true },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', isActivated: false }
            ];
        } else {
            // Would need to implement user listing in Appwrite
            return [];
        }
    },

    // Agents (basic implementation)
    async getAgents(): Promise<Agent[]> {
        if (APP_CONFIG.DATA_SOURCE === 'mock') {
            return [
                { 
                    id: '1', 
                    agentId: 'AGT001',
                    name: 'Agent Smith', 
                    email: 'agent@example.com', 
                    contactNumber: '+1234567890',
                    agentCode: 'AGT001',
                    hasAcceptedTerms: true,
                    isActive: true
                }
            ];
        } else {
            return agentService.getAll() || [];
        }
    },

    // Configuration
    getDataSource(): 'mock' | 'appwrite' {
        return APP_CONFIG.DATA_SOURCE;
    },

    isUsingMockData(): boolean {
        return APP_CONFIG.DATA_SOURCE === 'mock';
    }
};
export enum AvailabilityStatus {
    Available = 'Available',
    Busy = 'Busy',
    Offline = 'Offline'
}

export interface Pricing {
    60: number;
    90: number;
    120: number;
}

export interface Therapist {
    id: number;
    name: string;
    profilePicture: string;
    description: string;
    status: AvailabilityStatus;
    pricing: Pricing;
    whatsappNumber: string;
    distance: number;
    rating: number;
    reviewCount: number;
    massageTypes: string[];
    isLive: boolean;
    location: string;
    activeMembershipDate: string;
}

export interface Place {
    id: number;
    name: string;
    description: string;
    mainImage: string;
    thumbnailImages: string[];
    pricing: Pricing;
    whatsappNumber: string;
    distance: number;
    rating: number;
    reviewCount: number;
    massageTypes: string[];
    isLive: boolean;
    location: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    isActivated: boolean;
}
// 🗄️ LOCAL DATABASE SCHEMA DEFINITIONS
// This defines the structure for our custom database system

export interface DatabaseTherapist {
    id: string;
    name: string;
    email: string;
    whatsappNumber: string;
    profilePicture: string;
    mainImage?: string;
    description: string;
    specialization: string;
    yearsOfExperience: number;
    isLicensed: boolean;
    massageTypes: string[];
    languages: string[];
    pricing: {
        "60": number;
        "90": number;
        "120": number;
    };
    hotelPricing?: {
        "60": number;
        "90": number;
        "120": number;
    };
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    status: 'available' | 'busy' | 'offline';
    availability: string;
    hourlyRate: number;
    rating: number;
    reviewCount: number;
    isLive: boolean;
    hotelId?: string;
    hotelDiscount: number;
    analytics: {
        impressions: number;
        views: number;
        profileViews: number;
        whatsappClicks: number;
        phoneClicks: number;
        directionsClicks: number;
        bookings: number;
    };
    // System fields
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    isActive: boolean;
}

export interface DatabasePlace {
    id: string;
    name: string;
    email: string;
    whatsappNumber: string;
    profilePicture: string;
    mainImage?: string;
    description: string;
    category: 'spa' | 'massage_center' | 'wellness_center' | 'salon';
    services: string[];
    pricing: {
        "60": number;
        "90": number;
        "120": number;
    };
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    operatingHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    amenities: string[];
    rating: number;
    reviewCount: number;
    isLive: boolean;
    analytics: {
        impressions: number;
        views: number;
        profileViews: number;
        whatsappClicks: number;
        phoneClicks: number;
        directionsClicks: number;
        bookings: number;
    };
    // System fields
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    isActive: boolean;
}

export interface DatabaseUser {
    id: string;
    email: string;
    userType: 'therapist' | 'place' | 'customer' | 'admin';
    password: string; // Will be hashed
    profile: DatabaseTherapist | DatabasePlace | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}

export interface DatabaseBooking {
    id: string;
    customerId: string;
    providerId: string; // therapist or place ID
    providerType: 'therapist' | 'place';
    serviceType: string;
    duration: number; // in minutes
    price: number;
    customerLocation: string;
    customerCoordinates: {
        lat: number;
        lng: number;
    };
    scheduledDate: string;
    scheduledTime: string;
    status: 'pending' | 'confirmed' | 'on_the_way' | 'completed' | 'cancelled' | 'timed_out';
    notes?: string;
    // System fields
    createdAt: string;
    updatedAt: string;
}

export interface Database {
    therapists: DatabaseTherapist[];
    places: DatabasePlace[];
    users: DatabaseUser[];
    bookings: DatabaseBooking[];
    // Metadata
    version: string;
    lastBackup: string;
    lastUpdated: string;
}

// Default empty database structure
export const createEmptyDatabase = (): Database => ({
    therapists: [],
    places: [],
    users: [],
    bookings: [],
    version: '1.0.0',
    lastBackup: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
});

// Validation schemas
export const validateTherapist = (therapist: Partial<DatabaseTherapist>): string[] => {
    const errors: string[] = [];
    
    if (!therapist.name || therapist.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!therapist.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(therapist.email)) {
        errors.push('Valid email address is required');
    }
    
    if (!therapist.whatsappNumber || therapist.whatsappNumber.trim().length < 10) {
        errors.push('Valid WhatsApp number is required');
    }
    
    if (!therapist.location || therapist.location.trim().length < 3) {
        errors.push('Location must be at least 3 characters long');
    }
    
    if (!therapist.specialization || therapist.specialization.trim().length < 2) {
        errors.push('Specialization is required');
    }
    
    if (!therapist.pricing || 
        typeof therapist.pricing !== 'object' ||
        !therapist.pricing['60'] || 
        !therapist.pricing['90'] || 
        !therapist.pricing['120']) {
        errors.push('Valid pricing for 60, 90, and 120 minutes is required');
    }
    
    return errors;
};

export const validatePlace = (place: Partial<DatabasePlace>): string[] => {
    const errors: string[] = [];
    
    if (!place.name || place.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!place.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(place.email)) {
        errors.push('Valid email address is required');
    }
    
    if (!place.whatsappNumber || place.whatsappNumber.trim().length < 10) {
        errors.push('Valid WhatsApp number is required');
    }
    
    if (!place.location || place.location.trim().length < 3) {
        errors.push('Location must be at least 3 characters long');
    }
    
    if (!place.category) {
        errors.push('Business category is required');
    }
    
    if (!place.pricing || 
        typeof place.pricing !== 'object' ||
        !place.pricing['60'] || 
        !place.pricing['90'] || 
        !place.pricing['120']) {
        errors.push('Valid pricing for 60, 90, and 120 minutes is required');
    }
    
    return errors;
};
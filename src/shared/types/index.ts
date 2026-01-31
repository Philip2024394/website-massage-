// Shared types across all applications
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: 'active' | 'inactive' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}

export type UserRole = 'admin' | 'agent' | 'client' | 'therapist' | 'place' | 'hotel' | 'villa';

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Booking related types
export interface Booking extends BaseEntity {
    clientId: string;
    providerId: string;
    providerType: 'therapist' | 'place';
    serviceId: string;
    date: Date;
    time: string;
    duration: number;
    status: BookingStatus;
    totalAmount: number;
    location: BookingLocation;
    notes?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface BookingLocation {
    type: 'client-location' | 'provider-location' | 'hotel' | 'villa';
    address: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

// Service related types
export interface Service extends BaseEntity {
    name: string;
    description: string;
    duration: number;
    price: number;
    category: ServiceCategory;
    isActive: boolean;
}

export type ServiceCategory = 'relaxation' | 'therapeutic' | 'sports' | 'beauty' | 'wellness';

// Provider related types
export interface Therapist extends BaseEntity {
    userId: string;
    name: string;
    email: string;
    phone: string;
    specializations: string[];
    experience: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isAvailable: boolean;
    location: Location;
    coordinates?: { lat: number; lng: number } | string; // GPS coordinates for location matching
    city?: string; // Selected city/tourist destination
    services: Service[];
    hotelVillaDiscount?: HotelVillaDiscount;
    blockedDates?: string[]; // Array of ISO date strings when therapist is not available
}

export interface Place extends BaseEntity {
    userId: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    address: string;
    location: Location;
    coordinates?: { lat: number; lng: number } | string; // GPS coordinates for location matching
    city?: string; // Selected city/tourist destination
    amenities: string[];
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    services: Service[];
    operatingHours: OperatingHours;
    hotelVillaDiscount?: HotelVillaDiscount;
}

export interface Location {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
        isOpen: boolean;
    };
}

// Hotel/Villa related types
export interface HotelVillaDiscount {
    hotelDiscount: number;
    villaDiscount: number;
    isOptedIn: boolean;
    lastUpdated: Date;
}

export enum HotelVillaServiceStatus {
    NOT_OPTED_IN = 'not_opted_in',
    OPTED_IN = 'opted_in',
    SUSPENDED = 'suspended'
}

export interface HotelVillaMenu extends BaseEntity {
    hotelId?: string;
    villaId?: string;
    brandName: string;
    brandLogo?: string;
    brandColors: {
        primary: string;
        secondary: string;
    };
    services: HotelVillaMenuService[];
    qrCodeUrl?: string;
    isActive: boolean;
}

export interface HotelVillaMenuService {
    serviceId: string;
    serviceName: string;
    description: string;
    duration: number;
    originalPrice: number;
    discountedPrice: number;
    providerId: string;
    providerName: string;
    providerType: 'therapist' | 'place';
    isAvailable: boolean;
}

// Agent related types
export interface Agent extends BaseEntity {
    userId: string;
    name: string;
    email: string;
    phone: string;
    agentCode: string;
    commission: number;
    isActive: boolean;
    totalEarnings: number;
    referrals: AgentReferral[];
}

export interface AgentReferral extends BaseEntity {
    agentId: string;
    referredUserId: string;
    referredUserType: 'therapist' | 'place';
    status: 'pending' | 'active' | 'inactive';
    commission: number;
    totalBookings: number;
    totalEarnings: number;
}

// Notification types
export interface Notification extends BaseEntity {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    data?: any;
}

export type NotificationType = 'booking' | 'payment' | 'system' | 'promotion' | 'review';

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
    userType: UserRole;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    userType: UserRole;
    agentCode?: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}
export enum AvailabilityStatus {
    Available = 'Available',
    Busy = 'Busy',
    Offline = 'Offline'
}

export enum BookingStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Cancelled = 'Cancelled',
    Completed = 'Completed'
}

export enum NotificationType {
    NewBooking = 'new_booking',
    BookingConfirmed = 'booking_confirmed',
    BookingCancelled = 'booking_cancelled',
    MembershipReminder = 'membership_reminder',
    BookingReminder = 'booking_reminder',
}

export interface Pricing {
    60: number;
    90: number;
    120: number;
}

export interface Analytics {
    impressions: number;
    profileViews: number;
    whatsappClicks: number;
}

export interface Therapist {
    id: number;
    name: string;
    email: string;
    password?: string;
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
    coordinates: { lat: number; lng: number; };
    activeMembershipDate: string;
    analytics: Analytics;
    agentId?: number;
}

export interface Place {
    id: number;
    name: string;
    email: string;
    password?: string;
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
    coordinates: { lat: number; lng: number; };
    openingTime: string;
    closingTime: string;
    activeMembershipDate: string;
    analytics: Analytics;
    agentId?: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    isActivated: boolean;
}

export interface Agent {
    id: number;
    name: string;
    email: string;
    agentCode: string;
    lastLogin?: string;
    hasAcceptedTerms: boolean;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    idCardImage?: string;
    contactNumber?: string;
    homeAddress?: string;
    tier?: 'Standard' | 'Toptier';
}

export interface UserLocation {
    address: string;
    lat: number;
    lng: number;
}

export interface SupabaseConfig {
    url: string;
    key: string;
}

export interface Booking {
    id: number;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    userId: string; // From the User interface
    userName: string;
    service: '60' | '90' | '120';
    startTime: string; // ISO string
    status: BookingStatus;
}

export interface Notification {
    id: number;
    providerId: number;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string; // ISO string
    bookingId?: number;
}

export interface AdminMessage {
    id: number;
    agentId: number;
    message: string;
    createdAt: string; // ISO string
    isRead: boolean;
}
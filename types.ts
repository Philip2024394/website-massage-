export enum AvailabilityStatus {
    Available = 'Available',
    Busy = 'Busy',
    Offline = 'Offline'
}

export enum BookingStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    OnTheWay = 'OnTheWay',
    Cancelled = 'Cancelled',
    Completed = 'Completed',
    TimedOut = 'TimedOut',
    Reassigned = 'Reassigned'
}

export enum ProviderResponseStatus {
    AwaitingResponse = 'AwaitingResponse',
    Confirmed = 'Confirmed',
    OnTheWay = 'OnTheWay',
    Declined = 'Declined',
    TimedOut = 'TimedOut'
}

export enum NotificationType {
    NewBooking = 'new_booking',
    BookingConfirmed = 'booking_confirmed',
    BookingCancelled = 'booking_cancelled',
    MembershipReminder = 'membership_reminder',
    BookingReminder = 'booking_reminder',
}

export enum ReviewStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export enum HotelVillaServiceStatus {
    NotOptedIn = 'not_opted_in',
    OptedIn = 'opted_in',
    Active = 'active'
}

export interface HotelVillaDiscount {
    id: number;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    hotelDiscount: number; // minimum 20%
    villaDiscount: number; // minimum 20%
    status: HotelVillaServiceStatus;
    createdAt: string;
    updatedAt: string;
}

export interface HotelVillaMenu {
    id: number;
    ownerId: number;
    ownerType: 'hotel' | 'villa';
    brandName: string;
    brandLogo?: string;
    customMessage?: string;
    qrCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface HotelVillaAnalytics {
    totalQRScans: number;
    uniqueGuestViews: number;
    providerViews: number;
    bookingsMade: number;
    topProvider?: string;
    peakHours: string[];
    monthlyScans: number;
    weeklyScans: number;
}

export interface GuestFeedback {
    id: number;
    hotelVillaId: number;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    guestRoomNumber?: string;
    rating: number;
    comment?: string;
    serviceDate: string;
    createdAt: string;
}

export enum CommissionPaymentStatus {
    Pending = 'pending', // Service completed, awaiting payment proof
    AwaitingVerification = 'awaiting_verification', // Provider uploaded payment proof
    Verified = 'verified', // Hotel/Villa confirmed payment received
    Rejected = 'rejected', // Hotel/Villa rejected payment proof
    Cancelled = 'cancelled' // Booking was cancelled
}

export enum CommissionPaymentMethod {
    BankTransfer = 'bank_transfer',
    Cash = 'cash',
    MobilePayment = 'mobile_payment', // e-wallet, etc.
    Other = 'other'
}

export interface CommissionRecord {
    id: number;
    hotelVillaId: number;
    bookingId: number;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    serviceAmount: number;
    commissionRate: number;
    commissionAmount: number;
    status: CommissionPaymentStatus;
    paymentMethod?: CommissionPaymentMethod;
    paymentProofImage?: string; // URL to uploaded screenshot
    paymentProofUploadedAt?: string;
    verifiedBy?: number; // Hotel/Villa user ID who verified
    verifiedAt?: string;
    rejectionReason?: string;
    bookingDate: string;
    paidDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GuestCheckIn {
    id: number;
    hotelVillaId: number;
    roomNumber: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    allowRoomCharges: boolean;
}

export interface Hotel {
    id: number | string;
    name: string;
    email: string;
    password?: string;
    brandLogo?: string;
    bannerImage?: string;
    address: string;
    phone: string;
    description?: string;
    customWelcomeMessage?: string;
    languages?: string[]; // ['en', 'id', 'zh', 'ja']
    commissionRate?: number; // percentage
    analytics?: HotelVillaAnalytics;
    conciergeEnabled?: boolean;
    roomBillingEnabled?: boolean;
    
    // Bank details for commission payments
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankSwiftCode?: string;
    mobilePaymentNumber?: string; // For e-wallets
    mobilePaymentType?: string; // 'GoPay', 'OVO', 'Dana', etc.
    preferredPaymentMethod?: 'bank_transfer' | 'cash' | 'mobile_payment';
    paymentInstructions?: string; // Custom instructions for providers
    
    createdAt?: string;
}

export interface Villa {
    id: number | string;
    name: string;
    email: string;
    password?: string;
    brandLogo?: string;
    bannerImage?: string;
    address: string;
    phone: string;
    description?: string;
    customWelcomeMessage?: string;
    languages?: string[]; // ['en', 'id', 'zh', 'ja']
    commissionRate?: number; // percentage
    analytics?: HotelVillaAnalytics;
    conciergeEnabled?: boolean;
    roomBillingEnabled?: boolean;
    
    // Bank details for commission payments
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankSwiftCode?: string;
    mobilePaymentNumber?: string; // For e-wallets
    mobilePaymentType?: string; // 'GoPay', 'OVO', 'Dana', etc.
    preferredPaymentMethod?: 'bank_transfer' | 'cash' | 'mobile_payment';
    paymentInstructions?: string; // Custom instructions for providers
    
    createdAt?: string;
}

export interface Review {
    id: number;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    rating: number;
    whatsapp: string;
    status: ReviewStatus;
    createdAt: string; // ISO string
}

export interface Pricing {
    "60": number;
    "90": number;
    "120": number;
}

// Appwrite-compatible string versions
export type PricingString = string; // JSON string of Pricing object
export type AnalyticsString = string; // JSON string of Analytics object
export type CoordinatesString = string; // JSON string of {lat: number, lng: number}
export type MassageTypesString = string; // JSON string of string array

export interface Analytics {
    impressions: number;
    profileViews: number;
    whatsappClicks: number;
}

export interface Therapist {
    id: number | string; // Support both for Appwrite compatibility ($id is string)
    name: string;
    email: string;
    password?: string;
    profilePicture: string;
    mainImage?: string; // Main banner image URL
    description: string;
    status: AvailabilityStatus;
    pricing: PricingString; // JSON string for Appwrite
    whatsappNumber: string;
    distance: number;
    rating: number;
    reviewCount: number;
    massageTypes: MassageTypesString; // JSON string for Appwrite
    isLive: boolean;
    location: string;
    coordinates: CoordinatesString; // JSON string for Appwrite
    activeMembershipDate: string;
    membershipStartDate?: string; // Date when therapist first became active
    
    // Verification badge fields
    isVerified?: boolean;
    verifiedAt?: string;
    verificationBadge?: 'verified' | null;
    verificationRevokedAt?: string;
    verificationRevokedReason?: string;
    
    // Dynamic pricing support
    hasPackages?: boolean;
    discountPercentage?: number; // Overall discount for promotions
    membershipExpiryDate?: string; // Date when current membership expires
    lastMembershipUpdateDate?: string; // Date of last membership renewal
    totalActiveMembershipMonths?: number; // Total months of active membership
    badgeEligible?: boolean; // Whether badge is currently active (considers grace period)
    yearsOfExperience?: number; // Years of professional massage experience
    analytics: AnalyticsString; // JSON string for Appwrite
    agentId?: number;
    hotelVillaServiceStatus?: HotelVillaServiceStatus;
    hotelDiscount?: number; // minimum 20%
    villaDiscount?: number; // minimum 20%
    serviceRadius?: number; // minimum 7km - how far they will travel for hotel/villa services
    languages?: string[]; // Languages spoken: ['en', 'id', 'zh', 'ja', 'ko', 'ru', 'fr', 'de', 'es']
}

export interface Place {
    id: number | string; // Support both for Appwrite compatibility ($id is string)
    name: string;
    email: string;
    password?: string;
    description: string;
    mainImage: string;
    thumbnailImages: string[];
    pricing: PricingString; // JSON string for Appwrite
    whatsappNumber: string;
    distance: number;
    rating: number;
    reviewCount: number;
    massageTypes: MassageTypesString; // JSON string for Appwrite
    isLive: boolean;
    location: string;
    coordinates: CoordinatesString; // JSON string for Appwrite
    openingTime: string;
    closingTime: string;
    activeMembershipDate: string;
    analytics: AnalyticsString; // JSON string for Appwrite
    agentId?: number;
    hotelVillaServiceStatus?: HotelVillaServiceStatus;
    hotelDiscount?: number; // minimum 20%
    villaDiscount?: number; // minimum 20%
    
    // Verification badge fields
    isVerified?: boolean;
    verifiedAt?: string;
    verificationBadge?: 'verified' | null;
    verificationRevokedAt?: string;
    verificationRevokedReason?: string;
    
    // Dynamic pricing support
    hasPackages?: boolean;
    discountPercentage?: number; // Overall discount for promotions
    serviceRadius?: number; // minimum 7km - how far they will travel for hotel/villa services
    languages?: string[]; // Languages spoken: ['en', 'id', 'zh', 'ja', 'ko', 'ru', 'fr', 'de', 'es']
}

export interface User {
    id: string;
    name: string;
    email: string;
    isActivated: boolean;
}

export interface Agent {
    id: number;
    $id?: string; // Appwrite document ID
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
    
    // Hotel/Villa guest booking fields
    guestName?: string;
    roomNumber?: string;
    hotelVillaId?: number;
    hotelVillaName?: string;
    guestLanguage?: string; // 'en', 'id', 'zh', 'ja', 'ko', 'ru', 'fr', 'de'
    chargeToRoom?: boolean;
    
    // Provider response tracking
    providerResponseStatus?: ProviderResponseStatus;
    providerResponseTime?: string; // ISO string when provider confirmed/declined
    confirmationDeadline?: string; // ISO string - 25 minutes from booking creation
    
    // Fallback system
    isReassigned?: boolean;
    originalProviderId?: number;
    fallbackProviderIds?: number[]; // List of providers who were offered this booking
    
    // Timestamps
    createdAt?: string;
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
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

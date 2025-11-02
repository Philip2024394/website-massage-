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
    views: number;
    profileViews: number;
    whatsapp_clicks: number;
    whatsappClicks: number;
    phone_clicks: number;
    directions_clicks: number;
    bookings: number;
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
    hotelVillaPricing?: PricingString; // Special pricing for hotel/villa live menu (JSON string for Appwrite)
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
    hotelVillaPricing?: PricingString; // Special pricing for hotel/villa live menu (JSON string for Appwrite)
    
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
    
    // Gallery images with captions (up to 6 images)
    galleryImages?: Array<{ imageUrl: string; caption: string }>;
    profilePicture?: string; // Logo/profile image
    additionalServices?: string[]; // Selected additional services/amenities
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

// ============================================
// LOYALTY SYSTEM TYPES
// ============================================

export enum LoyaltyWalletStatus {
    Active = 'active',
    Inactive = 'inactive',
    Dormant = 'dormant'
}

export enum CoinTransactionType {
    Earned = 'earned',
    Redeemed = 'redeemed',
    Decayed = 'decayed',
    Bonus = 'bonus',
    Expired = 'expired',
    StreakBonus = 'streak_bonus',
    BirthdayBonus = 'birthday_bonus'
}

export interface LoyaltyTier {
    visits: number;
    discount: number;
    coinsRequired: number;
}

export interface ProviderLoyaltySettings {
    $id?: string;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    providerCoinId: string; // e.g., "T001-COINS" or "P042-COINS"
    
    // Tier configuration
    tier1: LoyaltyTier; // Default: 3 visits, 5% discount, 15 coins
    tier2: LoyaltyTier; // Default: 5 visits, 10% discount, 25 coins
    tier3: LoyaltyTier; // Default: 10 visits, 15% discount, 50 coins
    tier4: LoyaltyTier; // Default: 20 visits, 20% discount, 100 coins
    
    // Earning configuration
    coinsPerVisit: number; // Default: 5
    
    // Decay configuration
    enableDecay: boolean;
    decayGracePeriod: number; // Days before decay starts (default: 14)
    
    // Bonuses
    streakBonus: boolean; // Award bonus coins for consecutive bookings
    birthdayBonus: number; // Bonus coins on customer birthday
    
    // Status
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoyaltyWallet {
    $id?: string;
    userId: string; // Appwrite user ID
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    providerCoinId: string; // e.g., "T001-COINS"
    
    // Coin balances
    totalCoins: number; // Current balance
    coinsEarned: number; // Lifetime earned
    coinsRedeemed: number; // Lifetime redeemed
    
    // Visit tracking
    totalVisits: number;
    lastVisitDate?: string;
    firstVisitDate?: string;
    
    // Decay tracking
    lastDecayDate?: string;
    decayRate: number; // Coins decayed per period
    
    // Current tier and discount
    currentTier: number; // 0-4 (0 = no tier)
    currentDiscount: number; // Percentage discount earned
    
    // Status
    status: LoyaltyWalletStatus;
    streak: number; // Consecutive bookings
    
    createdAt?: string;
    updatedAt?: string;
}

export interface CoinTransaction {
    $id?: string;
    userId: string;
    walletId: string;
    providerId: number;
    providerType: 'therapist' | 'place';
    
    // Transaction details
    type: CoinTransactionType;
    amount: number; // Positive for earned, negative for redeemed/decayed
    
    // Related entities
    bookingId?: number;
    reason: string; // Description of transaction
    
    // Balance tracking
    balanceBefore: number;
    balanceAfter: number;
    
    createdAt?: string;
}

export interface LoyaltyEarnedEvent {
    userId: string;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    providerCoinId: string;
    coinsEarned: number;
    totalCoins: number;
    totalVisits: number;
    tierUnlocked?: number;
    discountUnlocked?: number;
    streakCount?: number;
}

// ==========================================
// 💬 CHAT SYSTEM TYPES
// ==========================================

export enum ChatRoomStatus {
    Pending = 'pending',       // Waiting for therapist response
    Active = 'active',         // Therapist replied, conversation ongoing
    Accepted = 'accepted',     // Booking accepted by therapist
    Declined = 'declined',     // Booking declined by therapist
    Expired = 'expired',       // 25 minutes passed, no response
    Completed = 'completed',   // Service completed
    Cancelled = 'cancelled'    // Booking cancelled
}

export enum MessageSenderType {
    Customer = 'customer',
    Therapist = 'therapist',
    Place = 'place',
    System = 'system'
}

export interface ChatRoom {
    $id?: string;
    bookingId: number;
    
    // Participants
    customerId: string;        // Appwrite user ID
    customerName: string;
    customerLanguage: 'en' | 'id';
    customerPhoto?: string;    // Profile photo URL
    
    therapistId?: number;      // Provider ID (therapist or place)
    therapistName?: string;
    therapistLanguage: 'en' | 'id';
    therapistType: 'therapist' | 'place';
    therapistPhoto?: string;   // Profile photo URL
    
    // Status & Timing
    status: ChatRoomStatus;
    expiresAt: string;         // ISO timestamp (booking time + 25 minutes)
    respondedAt?: string;      // When therapist first replied
    
    // Metadata
    lastMessageAt?: string;
    lastMessagePreview?: string;
    unreadCount: number;       // For therapist side
    
    createdAt?: string;
    updatedAt?: string;
}

export interface ChatMessage {
    $id?: string;
    roomId: string;            // Chat room ID
    
    // Sender info
    senderId: string;          // User ID or provider ID
    senderType: MessageSenderType;
    senderName: string;
    
    // Message content
    originalText: string;      // Original message in sender's language
    originalLanguage: 'en' | 'id';
    translatedText?: string;   // Auto-translated to recipient's language
    translatedLanguage?: 'en' | 'id';
    
    // Translation toggle
    showOriginal?: boolean;    // Client-side only (not stored)
    
    // Status
    isRead: boolean;
    readAt?: string;
    
    // Metadata
    createdAt?: string;
}

export interface ChatNotification {
    roomId: string;
    bookingId: number;
    recipientId: string;
    recipientType: 'customer' | 'therapist' | 'place';
    message: string;
    soundFile?: string;        // Optional sound file to play
}

export interface AgentVisit {
    id?: number;
    $id?: string; // Appwrite document ID
    agentId: string | number;
    agentName: string;
    agentCode: string;
    providerName: string;
    providerType: 'therapist' | 'place';
    whatsappNumber: string;
    visitDate: string; // ISO string
    location: {
        lat: number;
        lng: number;
        address: string;
        timestamp: string; // When location was captured
    };
    meetingNotes: string;
    callbackDate?: string; // ISO string for follow-up
    membershipAgreed: 'none' | '1month' | '3month' | '6month' | '1year';
    status: 'pending' | 'completed' | 'followup_required';
    createdAt: string;
    updatedAt?: string;
}

export interface ShopItem {
    id?: number;
    $id?: string; // Appwrite document ID
    name: string;
    description: string;
    coinPrice: number; // Coin value required to redeem
    imageUrl: string;
    category: 'electronics' | 'fashion' | 'wellness' | 'home' | 'gift_cards' | 'other';
    stockQuantity: number;
    isActive: boolean; // Admin can enable/disable items
    estimatedDelivery: string; // e.g., "6-10 days"
    disclaimer: string; // "Design may vary from image shown"
    createdAt?: string;
    updatedAt?: string;
}

export interface ShopCoinTransaction {
    id?: number;
    $id?: string; // Appwrite document ID
    userId: string; // Appwrite user ID
    userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    userName: string;
    transactionType: 'earn' | 'spend' | 'bonus' | 'refund';
    amount: number; // Positive for earn, negative for spend
    description: string;
    relatedId?: string; // Booking ID, order ID, etc.
    balanceBefore: number;
    balanceAfter: number;
    createdAt?: string;
}

export interface ShopOrder {
    id?: number;
    $id?: string; // Appwrite document ID
    orderNumber: string; // Unique order number
    userId: string;
    userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    userName: string;
    userEmail?: string;
    userPhone?: string;
    
    // Delivery address (stored as JSON string in Appwrite)
    shippingAddress: string;
    
    // Order items (stored as JSON string array in Appwrite)
    items: string; // JSON array string
    
    totalCoins: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    
    // Tracking
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedDelivery: string;
    
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserCoins {
    $id?: string;
    userId: string;
    userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    userName: string;
    totalCoins: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
    updatedAt?: string;
}
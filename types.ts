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
    $id?: string; // Appwrite document ID (added for update operations)
    name: string;
    email: string;
    password?: string;
    profilePicture: string;
    profileImage?: string; // Profile image (alias for profilePicture)
    mainImage?: string; // Main banner image URL
    description: string;
    status: AvailabilityStatus;
    availability?: AvailabilityStatus; // Primary status field in Appwrite (has proper default)
    pricing: PricingString; // JSON string for Appwrite (legacy format)
    // New separate pricing fields for cleaner data management
    price60?: string; // 60-minute massage price (stored as "250" for 250k)
    price90?: string; // 90-minute massage price (stored as "350" for 350k) 
    price120?: string; // 120-minute massage price (stored as "450" for 450k)
    whatsappNumber: string;
    distance: number;
    rating: number;
    reviewCount: number;
    massageTypes: MassageTypesString; // JSON string for Appwrite
    isLive: boolean;
    location: string;
    coordinates: CoordinatesString; // JSON string for Appwrite
    latitude?: string; // Individual latitude field for easier access
    longitude?: string; // Individual longitude field for easier access
    phoneNumber?: string; // Contact phone number
    activeMembershipDate: string;
    membershipStartDate?: string; // Date when therapist first became active
    
    // Multi-language support for auto-translation
    description_en?: string; // English description
    description_id?: string; // Indonesian description
    location_en?: string; // English location
    location_id?: string; // Indonesian location
    massageTypes_en?: MassageTypesString; // English massage types
    massageTypes_id?: MassageTypesString; // Indonesian massage types
    name_en?: string; // English name (for international therapists)
    name_id?: string; // Indonesian name
    
    // Verification badge fields
    isVerified?: boolean;
    verifiedAt?: string;
    verificationBadge?: 'verified' | null;
    verificationRevokedAt?: string;
    verificationRevokedReason?: string;
    verifiedBadge?: boolean; // Small badge shown before name on profile cards
    
    // Dynamic pricing support
    hasPackages?: boolean;
    discountPercentage?: number; // Overall discount for promotions
    discountEndTime?: string | Date; // When the discount expires (ISO timestamp)
    discountDuration?: number; // Duration in hours for the discount period
    isDiscountActive?: boolean; // Whether discount is currently active
    membershipExpiryDate?: string; // Date when current membership expires
    lastMembershipUpdateDate?: string; // Date of last membership renewal
    totalActiveMembershipMonths?: number; // Total months of active membership
    badgeEligible?: boolean; // Whether badge is currently active (considers grace period)
    yearsOfExperience?: number; // Years of professional massage experience
    age?: number; // Therapist's age
    analytics: AnalyticsString; // JSON string for Appwrite
    agentId?: number;
    hotelVillaServiceStatus?: HotelVillaServiceStatus;
    hotelDiscount?: number; // minimum 20%
    villaDiscount?: number; // minimum 20%
    serviceRadius?: number; // minimum 7km - how far they will travel for hotel/villa services
    languages?: string[]; // Languages spoken: ['en', 'id', 'zh', 'ja', 'ko', 'ru', 'fr', 'de', 'es']
    hotelVillaPricing?: PricingString; // Special pricing for hotel/villa live menu (JSON string for Appwrite)
    
    // Client Preferences - who the therapist accepts for massage services
    clientPreferences?: 'Males Only' | 'Females Only' | 'Males And Females' | 'Babies Only' | 'All Ages And Genders'; // Default: 'Males And Females'
    
    // Busy timer functionality
    busyUntil?: string; // ISO timestamp when therapist becomes available again
    busyDuration?: number; // Duration in minutes for the busy period
    
    // Bank details for direct P2P payment (platform doesn't process payments)
    bankName?: string; // Bank name (e.g., Bank Central Asia, Bank Mandiri)
    accountName?: string; // Account holder name
    accountNumber?: string; // Bank account number
    
    // KTP (Indonesian ID Card) Verification
    ktpPhotoUrl?: string; // URL to uploaded KTP ID card photo
    ktpPhotoFileId?: string; // Appwrite Storage file ID for KTP photo
    ktpVerified?: boolean; // Admin verification status
    ktpVerifiedAt?: string; // Date when KTP was verified by admin
    ktpVerifiedBy?: string; // Admin ID who verified the KTP
    
    // Premium membership upgrade fields
    isPremium?: boolean; // Whether therapist has premium membership
    membershipTier?: 'free' | 'premium' | 'trial'; // Membership tier level
    premiumPaymentProof?: string; // URL to uploaded payment proof image
    premiumPaymentStatus?: 'pending' | 'approved' | 'rejected'; // Payment verification status
    premiumPaymentSubmittedAt?: string; // When payment proof was submitted
    premiumPaymentVerifiedAt?: string; // When admin verified the payment
    premiumPaymentVerifiedBy?: string; // Admin ID who verified the payment
    premiumPaymentRejectionReason?: string; // Reason if payment was rejected
    
    // Custom service menu (premium feature)
    customMenu?: string; // JSON string of custom services array
    
    // Account status for commission payment enforcement
    accountStatus?: 'active' | 'frozen' | 'suspended'; // Account status
    accountFrozenAt?: string; // When account was frozen
    accountFrozenReason?: string; // Reason for freeze (e.g., "Unpaid commission")
    pendingCommissionPayments?: string; // JSON string of pending commission booking IDs
    
    // Schedule and availability management
    operationalHours?: string; // JSON string of daily hours { monday: { start: '09:00', end: '17:00', enabled: true }, ... }
    workingDays?: string; // JSON string of working days array ['monday', 'tuesday', ...]
    manualBookings?: string; // JSON string of manual bookings (non-system bookings)
    
    // Service Area Model - City → Service Area filtering
    // APPWRITE SCHEMA COMPATIBLE - Matches 'locations' collection
    city?: string; // One of 15 Indonesian cities OR "custom" for custom locations (REQUIRED in Appwrite)
    serviceAreas?: string; // JSON string of area IDs ["jakarta-kemang", "jakarta-senopati"] (REQUIRED in Appwrite, size 200)
    maxTravelDistance?: string; // Optional maximum travel distance in km (size 200)
    country?: string; // Country name (e.g., "Indonesia", "Malaysia") (size 255)
    region?: string; // Province/region (enum in Appwrite)
    
    // Custom Location Support (Hybrid Approach)
    customCity?: string; // Custom city name if city="custom" (size 255)
    customArea?: string; // Custom area/neighborhood name (size 255)
    isCustomLocation?: boolean; // Flag to indicate custom location
    
    // Hotel / Villa Safe Pass compliance
    hotelVillaSafePassStatus?: 'pending' | 'approved' | 'active' | 'rejected'; // Safe Pass approval status
    hotelVillaLetters?: string; // JSON string of uploaded letter file URLs
    safePassIssuedAt?: string; // Date when Safe Pass was issued
    safePassExpiry?: string; // Safe Pass expiration date (2 years from issue)
    safePassPaymentId?: string; // Payment transaction ID for Safe Pass fee
    safePassCardUrl?: string; // URL to issued Safe Pass card image
    safePassRejectionReason?: string; // Admin rejection reason if status = 'rejected'
    safePassSubmittedAt?: string; // Date when therapist submitted application
    safePassApprovedAt?: string; // Date when admin approved the letters
    safePassApprovedBy?: string; // Admin ID who approved the Safe Pass
}

// Commission payment record
export interface CommissionPayment {
    id?: string;
    $id?: string;
    bookingId: string;
    therapistId: string;
    bookingAmount: number;
    commissionRate: number; // 0.30 for 30%
    commissionAmount: number;
    proofUrl?: string;
    status: 'pending' | 'submitted' | 'verified' | 'rejected';
    submittedAt?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    rejectionReason?: string;
    bookingTime: string;
    paymentDeadline: string; // 3 hours after booking time
    remindersSent?: number; // Count of reminders sent
    lastReminderAt?: string;
    createdAt?: string;
}

export interface Place {
    id: number | string; // Support both for Appwrite compatibility ($id is string)
    $id?: string; // Appwrite document ID
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
    city?: string; // Selected city/tourist destination
    openingTime: string;
    closingTime: string;
    activeMembershipDate: string;
    price60?: string; // Price for 60 minute service
    price90?: string; // Price for 90 minute service
    price120?: string; // Price for 120 minute service
    status?: string; // Place status
    membershipStartDate?: string; // Membership start date
    averageRating?: number; // Calculated average rating
    staticRating?: number; // Static/default rating
    analytics?: AnalyticsString; // JSON string for Appwrite
    hotelVillaServiceStatus?: HotelVillaServiceStatus;
    hotelDiscount?: number; // minimum 20%
    villaDiscount?: number; // minimum 20%
    hotelVillaPricing?: PricingString; // Special pricing for hotel/villa live menu (JSON string for Appwrite)
    hotelId?: string; // Optional linkage to hotel record (added to satisfy dashboard payload)
    
    // Verification badge fields
    isVerified?: boolean;
    verifiedAt?: string;
    verificationBadge?: 'verified' | null;
    verificationRevokedAt?: string;
    verificationRevokedReason?: string;
    
    // Dynamic pricing support
    hasPackages?: boolean;
    discountPercentage?: number; // Overall discount for promotions`n    discountEndTime?: string; // Discount end time    serviceRadius?: number; // minimum 7km - how far they will travel for hotel/villa services
    languages?: string[]; // Languages spoken: ['en', 'id', 'zh', 'ja', 'ko', 'ru', 'fr', 'de', 'es']
    
    // Gallery images with captions (up to 6 images)
    galleryImages?: Array<{ imageUrl: string; caption: string }>;
    profilePicture?: string; // Logo/profile image
  profileImage?: string; // Profile image (alias for profilePicture)
  additionalServices?: string[]; // Selected additional services/amenities
    
    // Contact and business information
    contactNumber?: string; // Contact phone number
    ownerWhatsApp?: string; // Owner's WhatsApp for review contact
    yearsEstablished?: number; // Years in business (1-50)
    
    // Discount system fields
    discountDuration?: number; // Duration in hours for discount period
    discountEndTime?: string; // ISO string for when discount ends
    isDiscountActive?: boolean; // Whether discount is currently active
    
    // Bank details for P2P payment
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    
    // KTP (Indonesian ID Card) Verification
    ktpPhotoUrl?: string;       // URL to uploaded KTP photo
    ktpPhotoFileId?: string;    // Appwrite Storage file ID
    ktpVerified?: boolean;      // Admin verification status
    ktpVerifiedAt?: string;     // Verification timestamp
    ktpVerifiedBy?: string;     // Admin ID who verified
    
    // Membership tier for verified badge
    membershipTier?: 'free' | 'premium';
}

export interface User {
    id: string;
    name: string;
    email: string;
    whatsappNumber?: string; // WhatsApp number with country prefix (e.g., +62812345678)
    isActivated: boolean;
    userType?: string;
    role?: string;
    therapistId?: string;
}

export interface Agent {
    // Document identifiers
    $id?: string; // Appwrite document ID
    agentId: string; // Required: Agent identifier
    
    // Required fields
    name: string; // Required: Agent name
    email: string; // Required: Email address
    contactNumber: string; // Required: Contact number
    agentCode: string; // Required: Unique agent code
    hasAcceptedTerms: boolean; // Required: Terms acceptance
    isActive: boolean; // Required: Account status
    
    // Optional fields
    assignedDate?: string; // Assignment date
    region?: string; // Region assignment
    successRate?: number; // Success rate (0-1)
    tier?: 'Standard' | 'Toptier'; // Agent tier
    lastLogin?: string; // Last login timestamp
    isLive?: boolean; // Live status
    activeTherapists?: number; // Active therapist count
    password?: string; // Password (managed by Auth)
    whatsappNumber?: string; // WhatsApp number
    commissionRate?: number; // Commission rate (max 23)
    createdAt?: string; // Creation timestamp
    totalEarnings?: number; // Total earnings
    clients?: string; // Client list JSON
    idCardImage?: string; // ID card image URL
    profileImage?: string; // Agent profile photo URL
    age?: number; // Agent age
    religion?: string; // Agent religion
    
    // Bank details
    bankName?: string; // Bank name
    bankAccountNumber?: string; // Bank account number
    bankAccountName?: string; // Bank account holder name
    homeAddress?: string; // Home address
    
    // Additional identifier
    id?: string; // Alternative ID field

    // Compliance agreements (optional)
    agreedTaxResponsibility?: boolean;
    agreedUniformRequirement?: boolean;
    agreedTransportation?: boolean;
    agreedNoCriminalRecord?: boolean;
    agreedIdPresentation?: boolean;
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
    // 🚫 DO NOT MODIFY - Identity fields are safety-critical
    customerName: string; // REQUIRED - Canonical booking identity field - NEVER OPTIONAL
    userName?: string;    // OPTIONAL - Compatibility field only
    service: '60' | '90' | '120';
    startTime: string; // ISO string
    status: BookingStatus;
    totalPrice?: number; // Total price in Rupiah
    price?: number; // Price alias for totalPrice

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
    responseDeadline?: string; // ISO string - unified 10 minute SLA (server authoritative)
    
    // Fallback system
    isReassigned?: boolean;
    originalProviderId?: number;
    fallbackProviderIds?: number[]; // List of providers who were offered this booking
    
    // Timestamps
    createdAt?: string;
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    
    // Payment and confirmation (all payments are manual bank transfers to therapist)
    paymentType?: 'bank_transfer' | 'manual'; // Customer transfers directly to therapist's account
    paymentProofUrl?: string; // Upload proof of bank transfer
    paymentStatus?: 'pending' | 'verified' | 'rejected'; // Therapist verifies payment
    customerPhoneNumber?: string; // Customer contact for notifications
    therapistAccepted?: boolean; // Whether therapist accepted the booking
    therapistAcceptedAt?: string; // When therapist accepted
    notificationSent?: boolean; // Whether 3-hour notification was sent
    notificationSentAt?: string; // When notification was sent
    
    // Booking terms
    depositNonRefundable?: boolean; // Always true - deposits cannot be refunded
    reschedulingAllowed?: boolean; // True for scheduled bookings with therapist agreement
    depositRequired?: boolean; // True for scheduled bookings
    depositAmount?: number; // Amount of deposit paid
    depositPercentage?: number; // Percentage of total price (default 50%)
    depositStatus?: 'pending' | 'verified' | 'rejected';
    dateChangeAllowed?: boolean; // True for scheduled bookings with advance notice
    flexibleScheduling?: boolean; // True - can book outside calendar window
}

export interface Notification {
    id: number;
    providerId: number;
    message: string;
    title?: string;
    body?: string;
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
    
    // Required fields from Appwrite schema
    customerId: string;                  // Size: 255, required
    customerName: string;               // Size: 255, required  
    customerLanguage: string;           // Size: 10, required ('en' | 'id')
    customerPhoto?: string;             // Size: 500, nullable
    
    therapistId?: string;               // Size: 255, nullable - changed to string to match schema
    therapistName: string;              // Size: 255, required
    therapistLanguage: string;          // Size: 10, required ('en' | 'id')
    therapistType: string;              // Size: 50, required ('therapist' | 'place' | 'facial')
    therapistPhoto?: string;            // Size: 500, nullable
    
    status: string;                     // Size: 50, required (ChatRoomStatus values)
    expiresAt: string;                  // Required datetime - ISO timestamp
    
    // Optional datetime fields
    acceptedAt?: string;                // Nullable datetime - when booking accepted
    declinedAt?: string;                // Nullable datetime - when booking declined
    lastMessageAt?: string;             // Nullable datetime - last message timestamp
    
    // Other fields
    unreadCount: number;                // Required integer - for therapist notifications
    lastMessagePreview?: string;        // Size: 200, nullable - preview of last message
    bookingId?: string;                 // Size: 100, nullable - related booking reference
    
    // Appwrite system fields (auto-generated)
    $createdAt?: string;                // Auto datetime
    $updatedAt?: string;                // Auto datetime
    createdAt?: string;                 // Manual datetime, required
    updatedAt?: string;                 // Manual datetime, required
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
    text?: string;             // Text alias for originalText
    type?: string;             // Message type (system, user, etc.)
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
    recipientType: 'admin' | 'therapist' | 'place' | 'hotel' | 'villa' | 'user' | 'agent';  // ✅ Match Appwrite schema
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







// Monthly aggregated agent performance metrics
export interface MonthlyAgentMetrics {
    $id?: string; // Appwrite document ID
    agentId: string;
    agentCode: string;
    month: string; // Format YYYY-MM
    newSignUpsCount: number;
    recurringSignUpsCount: number;
    targetMet: boolean;
    streakCount: number;
    commissionRateApplied: number; // 20 or 23
    calculatedAt: string; // ISO timestamp of snapshot generation
}

// ==========================================
// 🪙 LOYALTY & COINS SYSTEM TYPES
// ==========================================

export enum LoyaltyWalletStatus {
    Active = 'active',
    Inactive = 'inactive',
    Suspended = 'suspended',
    Dormant = 'dormant'
}

export enum CoinTransactionType {
    Earned = 'earned',
    Redeemed = 'redeemed',
    Expired = 'expired',
    Decayed = 'decayed',
    BirthdayBonus = 'birthday_bonus',
    ReferralBonus = 'referral_bonus'
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
    providerCoinId: string; // Unique coin identifier (e.g., "T001-COINS")
    tier1: LoyaltyTier;
    tier2: LoyaltyTier;
    tier3: LoyaltyTier;
    tier4: LoyaltyTier;
    coinsPerVisit: number;
    enableDecay: boolean;
    decayGracePeriod: number; // Days before decay starts
    streakBonus: boolean;
    birthdayBonus: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoyaltyWallet {
    $id?: string;
    userId: string;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    providerCoinId: string;
    totalCoins: number;
    coinsEarned: number;
    coinsRedeemed: number;
    totalVisits: number;
    firstVisitDate: string;
    lastVisitDate?: string;
    decayRate: number;
    currentTier: number;
    currentDiscount: number;
    status: LoyaltyWalletStatus;
    streak: number; // Consecutive visits within 7 days
    createdAt: string;
    updatedAt: string;
}

export interface CoinTransaction {
    $id?: string;
    userId: string;
    walletId: string;
    providerId: number;
    providerType: 'therapist' | 'place';
    type: CoinTransactionType;
    amount: number;
    reason: string;
    balanceBefore: number;
    balanceAfter: number;
    bookingId?: number;
    createdAt: string;
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
    tierUnlocked?: boolean;
    discountUnlocked?: boolean;
    streakCount?: number;
}

export interface UserCoins {
    totalCoins: number;
    activeWallets: number;
    topProvider?: string;
    topProviderCoins?: number;
}



// ============================================================================
// ENHANCED TYPES FOR NEW FEATURES
// ============================================================================
// Import these in components that need messaging, packages, or pricing features

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderType: 'user' | 'therapist' | 'place';
    senderName: string;
    receiverId: string;
    receiverType: 'user' | 'therapist' | 'place';
    receiverName: string;
    content: string;
    bookingId?: string;
    isRead: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        type: 'user' | 'therapist' | 'place';
        name: string;
    }>;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

export interface Package {
    id: string;
    name: string;
    description: string;
    providerId: number;
    providerType: 'therapist' | 'place';
    services: Array<{ type: '60' | '90' | '120'; quantity: number }>;
    discountPercentage: number;
    validUntil?: string;
    isActive: boolean;
    createdAt: string;
}

export interface PricingBreakdown {
    basePrice: number;
    discounts: Array<{ type: string; amount: number; reason: string }>;
    surcharges: Array<{ type: string; amount: number; reason: string }>;
    finalPrice: number;
    commission: number;
    providerEarnings: number;
}

export interface VerificationStatus {
    isEligible: boolean;
    reason: string;
    accountAge: number; // in days
    completedBookings: number;
    averageRating: number;
}

// Membership and Commission Configuration
// This file contains membership tiers and commission rate settings

export enum MembershipTier {
    FREE = 'free',
    BASIC_3M = 'basic_3m',
    PREMIUM_6M = 'premium_6m', 
    ELITE_1Y = 'elite_1y'
}

export interface MembershipPlan {
    tier: MembershipTier;
    name: string;
    duration: number; // months
    price: number; // in Rupiah
    features: string[];
    commissionRange: {
        min: number;
        max: number;
    };
    canCustomizeBrand: boolean;
    priorityListing: boolean;
    featuredPlacement: boolean;
    premiumSupport: boolean;
}

export const MEMBERSHIP_PLANS: Record<MembershipTier, MembershipPlan> = {
    [MembershipTier.FREE]: {
        tier: MembershipTier.FREE,
        name: 'Free Access',
        duration: 0,
        price: 0,
        features: ['Basic platform access', 'Standard listing'],
        commissionRange: { min: 20, max: 20 },
        canCustomizeBrand: false,
        priorityListing: false,
        featuredPlacement: false,
        premiumSupport: false
    },
    [MembershipTier.BASIC_3M]: {
        tier: MembershipTier.BASIC_3M,
        name: '3 Months',
        duration: 3,
        price: 500000,
        features: [
            'Full platform access',
            'Priority listing',
            'QR menu builder',
            'Analytics dashboard',
            'Brand profile customization'
        ],
        commissionRange: { min: 20, max: 22 },
        canCustomizeBrand: true,
        priorityListing: true,
        featuredPlacement: false,
        premiumSupport: false
    },
    [MembershipTier.PREMIUM_6M]: {
        tier: MembershipTier.PREMIUM_6M,
        name: '6 Months',
        duration: 6,
        price: 900000,
        features: [
            'Full platform access',
            'Priority listing',
            'QR menu builder',
            'Analytics dashboard',
            'Featured placement',
            'Brand profile customization'
        ],
        commissionRange: { min: 20, max: 24 },
        canCustomizeBrand: true,
        priorityListing: true,
        featuredPlacement: true,
        premiumSupport: false
    },
    [MembershipTier.ELITE_1Y]: {
        tier: MembershipTier.ELITE_1Y,
        name: '1 Year',
        duration: 12,
        price: 1600000,
        features: [
            'Full platform access',
            'Priority listing',
            'QR menu builder',
            'Analytics dashboard',
            'Featured placement',
            'Premium support',
            'Brand profile customization'
        ],
        commissionRange: { min: 20, max: 25 },
        canCustomizeBrand: true,
        priorityListing: true,
        featuredPlacement: true,
        premiumSupport: true
    }
};

export interface HotelVillaMembership {
    id: string;
    propertyId: string;
    propertyType: 'hotel' | 'villa';
    membershipTier: MembershipTier;
    commissionRate: number; // 20-25%
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    autoRenew: boolean;
    customBrandConfig?: {
        bannerImage?: string;
        logoImage?: string;
        propertyName?: string;
        address?: string;
        contactNumber?: string;
        welcomeMessage?: string;
    };
}

// Helper function to calculate pricing with commission
export const calculateGuestPrice = (
    therapistPrice: number, 
    commissionRate: number = 20
): number => {
    // Guest pays: therapist price + commission
    // Example: Rp 300,000 + 20% = Rp 360,000
    return Math.round(therapistPrice * (1 + commissionRate / 100));
};

// Helper function to calculate hotel/villa earnings
export const calculateCommissionEarnings = (
    therapistPrice: number,
    commissionRate: number = 20
): number => {
    // Hotel/villa earns: therapist price * commission rate
    // Example: Rp 300,000 * 20% = Rp 60,000
    return Math.round(therapistPrice * (commissionRate / 100));
};

// Helper function to get membership plan by tier
export const getMembershipPlan = (tier: MembershipTier): MembershipPlan => {
    return MEMBERSHIP_PLANS[tier];
};

// Helper function to check if user can customize brand
export const canCustomizeBrand = (membershipTier: MembershipTier): boolean => {
    return MEMBERSHIP_PLANS[membershipTier].canCustomizeBrand;
};

// Helper function to get available commission range
export const getCommissionRange = (membershipTier: MembershipTier): { min: number; max: number } => {
    return MEMBERSHIP_PLANS[membershipTier].commissionRange;
};
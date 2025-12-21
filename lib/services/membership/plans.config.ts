/**
 * Membership Plans Configuration
 * Defines pricing and features for Pro/Plus tiers
 */

export type PlanType = 'pro' | 'plus';

export interface MembershipPlan {
  id: PlanType;
  name: string;
  monthlyFee: number;
  commissionRate: number;
  features: string[];
  description: string;
}

export const MEMBERSHIP_PLANS: Record<PlanType, MembershipPlan> = {
  pro: {
    id: 'pro',
    name: 'Pro Therapist',
    monthlyFee: 50000, // IDR 50k
    commissionRate: 0, // 0% commission
    features: [
      'Zero commission on all bookings',
      'Premium search placement',
      'Real-time analytics',
      'Customer review management',
      'Professional verification badge'
    ],
    description: 'Perfect for established therapists who want to keep 100% of their earnings'
  },
  plus: {
    id: 'plus', 
    name: 'Plus Therapist',
    monthlyFee: 0, // Free monthly
    commissionRate: 15, // 15% commission
    features: [
      'No monthly fees',
      '15% commission on bookings',
      'Basic analytics',
      'Customer messaging',
      'Standard listing'
    ],
    description: 'Great for new therapists getting started'
  }
};

export const PAYMENT_CONFIG = {
  DEADLINE_HOURS: 5,
  METHODS: {
    BCA: {
      accountNumber: '1234567890',
      accountName: 'IndaStreet Platform',
      instructions: 'Transfer exact amount and upload proof within 5 hours'
    },
    MANDIRI: {
      accountNumber: '0987654321', 
      accountName: 'IndaStreet Platform',
      instructions: 'Transfer exact amount and upload proof within 5 hours'
    }
  }
};
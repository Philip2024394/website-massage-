/**
 * Membership Registration Types
 * TypeScript interfaces for the signup flow
 */

export type PortalType = 'massage_therapist' | 'massage_place' | 'facial_place' | 'hotel';
export type SignupStatus = 'plan_selected' | 'terms_accepted' | 'portal_selected' | 'account_created' | 'profile_uploaded' | 'awaiting_payment' | 'payment_pending' | 'active' | 'deactivated';

export interface MembershipSignup {
  $id: string;
  // Step 1: Plan
  planType: 'pro' | 'plus';
  planSelectedAt: string;
  
  // Step 2: Terms
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  
  // Step 3: Portal
  portalType: PortalType;
  portalSelectedAt?: string;
  
  // Step 4: Account
  email: string;
  passwordHash?: string; // Not stored in plain text
  accountCreatedAt?: string;
  
  // Step 5: Profile
  profileData?: TherapistProfileData | PlaceProfileData;
  profileUploadedAt?: string;
  
  // Step 6: Payment
  paymentDeadline?: string;
  paymentProofUrl?: string;
  paymentSubmittedAt?: string;
  
  // Status
  status: SignupStatus;
  currentStep: number;
  completedAt?: string;
  
  // Tracking
  createdAt: string;
  updatedAt: string;
  sessionId: string;
}

export interface TherapistProfileData {
  name: string;
  phone: string;
  location: string;
  profileImageUrl?: string;
  services: string[];
  pricing: {
    duration60: number;
    duration90: number;
    duration120: number;
  };
  experience: string;
  specialties: string[];
  availability: string;
}

export interface PlaceProfileData {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  businessType: 'massage_spa' | 'facial_clinic' | 'hotel' | 'wellness_center';
  services: string[];
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  capacity: number;
  amenities: string[];
  profileImageUrl?: string;
  businessLicense?: string;
}

export interface PaymentSubmission {
  $id: string;
  signupId: string;
  planType: 'pro' | 'plus';
  amount: number;
  paymentMethod: 'BCA' | 'MANDIRI';
  proofImageUrl: string;
  submittedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}
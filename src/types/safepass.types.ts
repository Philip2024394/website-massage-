/**
 * SafePass Types
 * Type definitions for SafePass application and management system
 */

export type SafePassStatus = 'pending' | 'approved' | 'active' | 'rejected';

export type SafePassEntityType = 'therapist' | 'place';

export interface SafePassApplication {
    $id?: string;
    entityType: SafePassEntityType; // 'therapist' or 'place'
    entityId: string; // Therapist ID or Place ID
    entityName: string; // Name for display
    
    // Status
    hotelVillaSafePassStatus: SafePassStatus;
    hasSafePassVerification: boolean;
    
    // Submission
    hotelVillaLetters?: string; // JSON string of uploaded letter URLs
    safePassSubmittedAt: string; // ISO datetime
    safePassPaymentId?: string; // Payment reference
    
    // Approval
    safePassApprovedAt?: string; // ISO datetime
    safePassApprovedBy?: string; // Admin ID
    safePassRejectionReason?: string; // Rejection reason
    
    // Issuance
    safePassIssuedAt: string; // ISO datetime
    safePassExpiry: string; // ISO datetime (2 years from issue)
    safePassCardUrl?: string; // URL to SafePass card image
    
    // Timestamps
    $createdAt?: string;
    $updatedAt?: string;
}

export interface SafePassSubmissionData {
    entityType: SafePassEntityType;
    entityId: string;
    entityName: string;
    hotelVillaLetters?: string[]; // Array of letter URLs
    safePassPaymentId?: string;
}

export interface SafePassApprovalData {
    applicationId: string;
    approved: boolean;
    adminId: string;
    rejectionReason?: string;
}

export interface SafePassActivationData {
    applicationId: string;
    safePassCardUrl?: string;
}

export interface SafePassLetterUpload {
    file: File;
    type: 'company_letter' | 'police_clearance' | 'health_certificate' | 'other';
}

export interface SafePassStats {
    total: number;
    pending: number;
    approved: number;
    active: number;
    rejected: number;
}

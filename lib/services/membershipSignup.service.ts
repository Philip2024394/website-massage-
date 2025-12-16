/**
 * Membership Signup Flow Service
 * 
 * Complete industry-standard flow for therapist, massage place, and facial place registration:
 * 1. Plan Selection (Pro/Plus)
 * 2. Terms Agreement (checkbox acceptance)
 * 3. Portal Selection (therapist/massage/facial)
 * 4. Account Creation (email/password)
 * 5. Profile Upload (photos, services, pricing)
 * 6. Go Live Submission
 * 7. Payment Proof Upload (5-hour deadline)
 * 8. Admin Verification
 * 
 * All data stored securely in Appwrite
 */

import { databases, storage, account, ID, Query } from './_shared';

// Configuration
export const SIGNUP_CONFIG = {
    PAYMENT_DEADLINE_HOURS: 5, // 5 hours to upload payment proof
    STORAGE_BUCKET_ID: 'payment_proofs',
    PROFILE_IMAGES_BUCKET: 'profile_images',
    DATABASE_ID: '6839add3002fe394c382',
    COLLECTIONS: {
        MEMBERSHIP_SIGNUPS: 'membership_signups',
        THERAPISTS: 'therapists',
        PLACES: 'places', 
        FACIAL_PLACES: 'facial_places',
        PAYMENT_SUBMISSIONS: 'payment_submissions',
        MEMBERSHIP_AGREEMENTS: 'membership_agreements',
        ADMIN_NOTIFICATIONS: 'notifications'
    }
};

export type PlanType = 'pro' | 'plus';
export type PortalType = 'therapist' | 'massage_place' | 'facial_place';
export type SignupStatus = 'plan_selected' | 'terms_accepted' | 'portal_selected' | 'account_created' | 'profile_uploaded' | 'awaiting_payment' | 'payment_pending' | 'active' | 'deactivated';

export interface MembershipSignup {
    $id: string;
    // Step 1: Plan
    planType: PlanType;
    planSelectedAt: string;
    
    // Step 2: Terms
    termsAccepted: boolean;
    termsAcceptedAt: string;
    termsVersion: string;
    ipAddress: string;
    userAgent: string;
    
    // Step 3: Portal
    portalType: PortalType;
    portalSelectedAt: string;
    
    // Step 4: Account
    userId: string;
    email: string;
    memberId: string; // therapist/place document ID
    accountCreatedAt: string;
    
    // Step 5: Profile
    profileCompleted: boolean;
    profileCompletedAt?: string;
    
    // Step 6: Go Live
    goLiveSubmittedAt?: string;
    isLive: boolean;
    
    // Step 7: Payment
    paymentDeadline?: string;
    paymentProofUrl?: string;
    paymentProofUploadedAt?: string;
    paymentMethod?: string;
    paymentAmount: number;
    
    // Status
    status: SignupStatus;
    deactivatedAt?: string;
    deactivationReason?: string;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface PaymentSubmission {
    $id: string;
    signupId: string;
    memberId: string;
    memberType: PortalType;
    planType: PlanType;
    amount: number;
    proofFileUrl: string;
    bankName: string;
    accountName: string;
    paymentMethod: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    deadline: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
}

class MembershipSignupService {
    
    /**
     * Step 1: Initialize signup with plan selection
     */
    async initializeSignup(planType: PlanType, ipAddress: string, userAgent: string): Promise<MembershipSignup> {
        try {
            const signup = await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                ID.unique(),
                {
                    planType,
                    planSelectedAt: new Date().toISOString(),
                    termsAccepted: false,
                    termsVersion: '1.0',
                    ipAddress,
                    userAgent,
                    isLive: false,
                    paymentAmount: planType === 'plus' ? 250000 : 0, // Plus: 250k, Pro: 0 (commission-based)
                    status: 'plan_selected',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Signup initialized:', signup.$id);
            return signup as unknown as MembershipSignup;
        } catch (error) {
            console.error('Error initializing signup:', error);
            throw error;
        }
    }

    /**
     * Step 2: Accept terms and conditions
     */
    async acceptTerms(signupId: string): Promise<MembershipSignup> {
        try {
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    termsAccepted: true,
                    termsAcceptedAt: new Date().toISOString(),
                    status: 'terms_accepted',
                    updatedAt: new Date().toISOString()
                }
            );

            // Create membership agreement record
            await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_AGREEMENTS,
                ID.unique(),
                {
                    signupId,
                    version: '1.0',
                    acceptedAt: new Date().toISOString(),
                    termsAcknowledged: [
                        'commission_structure',
                        'payment_deadline_5_hours',
                        'account_deactivation_policy',
                        'platform_exclusivity',
                        'verified_badge_policy'
                    ],
                    isActive: true
                }
            );

            console.log('✅ Terms accepted for signup:', signupId);
            return updated as unknown as MembershipSignup;
        } catch (error) {
            console.error('Error accepting terms:', error);
            throw error;
        }
    }

    /**
     * Step 3: Select portal type
     */
    async selectPortal(signupId: string, portalType: PortalType): Promise<MembershipSignup> {
        try {
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    portalType,
                    portalSelectedAt: new Date().toISOString(),
                    status: 'portal_selected',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Portal selected:', portalType);
            return updated as unknown as MembershipSignup;
        } catch (error) {
            console.error('Error selecting portal:', error);
            throw error;
        }
    }

    /**
     * Step 4: Create account and member document
     */
    async createAccount(
        signupId: string,
        email: string,
        password: string,
        name: string
    ): Promise<{ signup: MembershipSignup; memberId: string }> {
        try {
            // Get signup details
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            ) as unknown as MembershipSignup;

            // Create Appwrite user account
            const user = await account.create(ID.unique(), email, password, name);

            // Create member document based on portal type
            const collectionId = this.getCollectionId(signup.portalType);
            
            const memberData = {
                userId: user.$id,
                email,
                name,
                signupId,
                planType: signup.planType,
                membershipPlan: signup.planType,
                isLive: false,
                isVerified: false,
                status: 'pending_profile',
                paymentStatus: 'pending',
                profileComplete: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const member = await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                ID.unique(),
                memberData
            );

            // Update signup with account info
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    userId: user.$id,
                    email,
                    memberId: member.$id,
                    accountCreatedAt: new Date().toISOString(),
                    status: 'account_created',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Account created:', user.$id, 'Member:', member.$id);
            return { 
                signup: updated as unknown as MembershipSignup, 
                memberId: member.$id 
            };
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    }

    /**
     * Step 5: Mark profile as completed
     */
    async completeProfile(signupId: string, memberId: string): Promise<MembershipSignup> {
        try {
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            ) as unknown as MembershipSignup;

            // Update member document
            const collectionId = this.getCollectionId(signup.portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                memberId,
                {
                    profileComplete: true,
                    profileCompletedAt: new Date().toISOString(),
                    status: 'pending_go_live',
                    updatedAt: new Date().toISOString()
                }
            );

            // Update signup
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    profileCompleted: true,
                    profileCompletedAt: new Date().toISOString(),
                    status: 'profile_uploaded',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Profile completed for:', memberId);
            return updated as unknown as MembershipSignup;
        } catch (error) {
            console.error('Error completing profile:', error);
            throw error;
        }
    }

    /**
     * Step 6: Submit Go Live - Starts 5-hour payment deadline
     */
    async submitGoLive(signupId: string): Promise<MembershipSignup> {
        try {
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            ) as unknown as MembershipSignup;

            // Calculate 5-hour deadline
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + SIGNUP_CONFIG.PAYMENT_DEADLINE_HOURS);

            // Update member to live (but with pending payment status)
            const collectionId = this.getCollectionId(signup.portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                signup.memberId,
                {
                    isLive: true,
                    goLiveSubmittedAt: new Date().toISOString(),
                    paymentDeadline: deadline.toISOString(),
                    status: 'awaiting_payment',
                    updatedAt: new Date().toISOString()
                }
            );

            // Update signup
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    goLiveSubmittedAt: new Date().toISOString(),
                    isLive: true,
                    paymentDeadline: deadline.toISOString(),
                    status: 'awaiting_payment',
                    updatedAt: new Date().toISOString()
                }
            );

            // Notify admin
            await this.notifyAdmin('new_go_live', signup.memberId, signup.portalType);

            // Schedule deadline check
            this.scheduleDeadlineCheck(signupId, deadline);

            console.log('✅ Go Live submitted, deadline:', deadline.toISOString());
            return updated as unknown as MembershipSignup;
        } catch (error) {
            console.error('Error submitting go live:', error);
            throw error;
        }
    }

    /**
     * Step 7: Upload payment proof
     */
    async uploadPaymentProof(
        signupId: string,
        proofFile: File,
        bankName: string,
        accountName: string,
        paymentMethod: string
    ): Promise<PaymentSubmission> {
        try {
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            ) as unknown as MembershipSignup;

            // Check if deadline has passed
            if (signup.paymentDeadline && new Date(signup.paymentDeadline) < new Date()) {
                throw new Error('Payment deadline has passed. Account has been deactivated.');
            }

            // Upload proof file
            const uploadedFile = await storage.createFile(
                SIGNUP_CONFIG.STORAGE_BUCKET_ID,
                ID.unique(),
                proofFile
            );

            const proofUrl = `https://cloud.appwrite.io/v1/storage/buckets/${SIGNUP_CONFIG.STORAGE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${SIGNUP_CONFIG.DATABASE_ID}`;

            // Create payment submission record
            const submission = await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                ID.unique(),
                {
                    signupId,
                    memberId: signup.memberId,
                    memberType: signup.portalType,
                    planType: signup.planType,
                    amount: signup.paymentAmount,
                    proofFileUrl: proofUrl,
                    bankName,
                    accountName,
                    paymentMethod,
                    status: 'pending',
                    deadline: signup.paymentDeadline,
                    submittedAt: new Date().toISOString()
                }
            );

            // Update signup
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    paymentProofUrl: proofUrl,
                    paymentProofUploadedAt: new Date().toISOString(),
                    paymentMethod,
                    status: 'payment_pending',
                    updatedAt: new Date().toISOString()
                }
            );

            // Update member status
            const collectionId = this.getCollectionId(signup.portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                signup.memberId,
                {
                    paymentStatus: 'pending_verification',
                    paymentProofUrl: proofUrl,
                    paymentProofUploadedAt: new Date().toISOString(),
                    status: 'payment_pending',
                    updatedAt: new Date().toISOString()
                }
            );

            // Notify admin for verification
            await this.notifyAdmin('payment_proof_uploaded', signup.memberId, signup.portalType);

            console.log('✅ Payment proof uploaded:', submission.$id);
            return submission as unknown as PaymentSubmission;
        } catch (error) {
            console.error('Error uploading payment proof:', error);
            throw error;
        }
    }

    /**
     * Admin: Approve payment
     */
    async approvePayment(submissionId: string, adminId: string): Promise<void> {
        try {
            const submission = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId
            ) as unknown as PaymentSubmission;

            // Update submission
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId,
                {
                    status: 'approved',
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: adminId
                }
            );

            // Get signup
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                submission.signupId
            ) as unknown as MembershipSignup;

            // Update signup status
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                submission.signupId,
                {
                    status: 'active',
                    updatedAt: new Date().toISOString()
                }
            );

            // Update member to fully active
            const collectionId = this.getCollectionId(signup.portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                signup.memberId,
                {
                    isVerified: true,
                    verifiedAt: new Date().toISOString(),
                    paymentStatus: 'paid',
                    status: 'active',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Payment approved:', submissionId);
        } catch (error) {
            console.error('Error approving payment:', error);
            throw error;
        }
    }

    /**
     * Admin: Reject payment
     */
    async rejectPayment(submissionId: string, adminId: string, reason: string): Promise<void> {
        try {
            // Update submission
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId,
                {
                    status: 'rejected',
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: adminId,
                    rejectionReason: reason
                }
            );

            console.log('❌ Payment rejected:', submissionId);
        } catch (error) {
            console.error('Error rejecting payment:', error);
            throw error;
        }
    }

    /**
     * Check and deactivate accounts past payment deadline
     */
    async checkPaymentDeadlines(): Promise<void> {
        try {
            const now = new Date().toISOString();

            // Find signups past deadline without payment proof
            const overdueSignups = await databases.listDocuments(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                [
                    Query.equal('status', 'awaiting_payment'),
                    Query.lessThan('paymentDeadline', now)
                ]
            );

            for (const signup of overdueSignups.documents) {
                await this.deactivateAccount(signup.$id, 'Payment deadline exceeded (5 hours)');
            }

            console.log(`⏰ Checked deadlines, deactivated ${overdueSignups.documents.length} accounts`);
        } catch (error) {
            console.error('Error checking payment deadlines:', error);
        }
    }

    /**
     * Deactivate account
     */
    async deactivateAccount(signupId: string, reason: string): Promise<void> {
        try {
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            ) as unknown as MembershipSignup;

            // Update signup
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    status: 'deactivated',
                    deactivatedAt: new Date().toISOString(),
                    deactivationReason: reason,
                    isLive: false,
                    updatedAt: new Date().toISOString()
                }
            );

            // Update member
            if (signup.memberId && signup.portalType) {
                const collectionId = this.getCollectionId(signup.portalType);
                await databases.updateDocument(
                    SIGNUP_CONFIG.DATABASE_ID,
                    collectionId,
                    signup.memberId,
                    {
                        isLive: false,
                        status: 'deactivated',
                        deactivatedAt: new Date().toISOString(),
                        deactivationReason: reason,
                        updatedAt: new Date().toISOString()
                    }
                );
            }

            // Notify admin
            await this.notifyAdmin('account_deactivated', signup.memberId, signup.portalType);

            console.log('🔒 Account deactivated:', signupId, reason);
        } catch (error) {
            console.error('Error deactivating account:', error);
            throw error;
        }
    }

    /**
     * Get signup by ID
     */
    async getSignup(signupId: string): Promise<MembershipSignup> {
        try {
            const signup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            return signup as unknown as MembershipSignup;
        } catch (error) {
            console.error('Error getting signup:', error);
            throw error;
        }
    }

    /**
     * Get remaining time until payment deadline
     */
    getRemainingTime(deadline: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diff = deadlineDate.getTime() - now.getTime();

        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { hours, minutes, seconds, expired: false };
    }

    /**
     * Get pending payment submissions for admin
     */
    async getPendingPayments(): Promise<PaymentSubmission[]> {
        try {
            const response = await databases.listDocuments(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                [Query.equal('status', 'pending')]
            );
            return response.documents as unknown as PaymentSubmission[];
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            return [];
        }
    }

    // Helper methods
    
    private getCollectionId(portalType: PortalType): string {
        switch (portalType) {
            case 'therapist':
                return SIGNUP_CONFIG.COLLECTIONS.THERAPISTS;
            case 'massage_place':
                return SIGNUP_CONFIG.COLLECTIONS.PLACES;
            case 'facial_place':
                return SIGNUP_CONFIG.COLLECTIONS.FACIAL_PLACES;
            default:
                throw new Error(`Invalid portal type: ${portalType}`);
        }
    }

    private async notifyAdmin(type: string, memberId: string, memberType: PortalType): Promise<void> {
        try {
            await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.ADMIN_NOTIFICATIONS,
                ID.unique(),
                {
                    type,
                    memberId,
                    memberType,
                    title: this.getNotificationTitle(type),
                    message: this.getNotificationMessage(type, memberType),
                    read: false,
                    createdAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error notifying admin:', error);
        }
    }

    private getNotificationTitle(type: string): string {
        const titles: Record<string, string> = {
            'new_go_live': '🚀 New Go Live Request',
            'payment_proof_uploaded': '💳 Payment Proof Uploaded',
            'account_deactivated': '🔒 Account Deactivated'
        };
        return titles[type] || 'Notification';
    }

    private getNotificationMessage(type: string, memberType: PortalType): string {
        const typeLabel = memberType.replace('_', ' ');
        const messages: Record<string, string> = {
            'new_go_live': `A new ${typeLabel} has submitted their profile for review.`,
            'payment_proof_uploaded': `A ${typeLabel} has uploaded payment proof for verification.`,
            'account_deactivated': `A ${typeLabel} account has been deactivated due to payment deadline.`
        };
        return messages[type] || '';
    }

    private scheduleDeadlineCheck(signupId: string, deadline: Date): void {
        const now = new Date();
        const timeUntilDeadline = deadline.getTime() - now.getTime();

        if (timeUntilDeadline > 0) {
            setTimeout(async () => {
                try {
                    const signup = await this.getSignup(signupId);
                    if (signup.status === 'awaiting_payment') {
                        await this.deactivateAccount(signupId, 'Payment deadline exceeded (5 hours)');
                    }
                } catch (error) {
                    console.error('Deadline check error:', error);
                }
            }, timeUntilDeadline);
        }
    }
}

export const membershipSignupService = new MembershipSignupService();

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

import { APP_CONFIG } from '../../config';
import { APPWRITE_CONFIG } from '../appwrite.config';

import { databases, storage, account, ID, Query } from './_shared';

// Configuration
export const SIGNUP_CONFIG = {
    PAYMENT_DEADLINE_HOURS: 5, // 5 hours to upload payment proof
    STORAGE_BUCKET_ID: 'payment_proofs',
    PROFILE_IMAGES_BUCKET: 'profile_images',
    DATABASE_ID: APP_CONFIG.APPWRITE.DATABASE_ID,
    COLLECTIONS: {
        MEMBERSHIP_SIGNUPS: 'messages', // Use messages collection for signup tracking
        THERAPISTS: APPWRITE_CONFIG.collections.therapists,
        PLACES: APPWRITE_CONFIG.collections.places, 
        FACIAL_PLACES: APPWRITE_CONFIG.collections.facial_places,
        PAYMENT_SUBMISSIONS: 'messages', // Store payment submissions as messages
        MEMBERSHIP_AGREEMENTS: 'messages', // Store agreements as messages
        ADMIN_NOTIFICATIONS: 'messages'
    }
};

export type PlanType = 'pro' | 'plus';
export type PortalType = 'massage_therapist' | 'massage_place' | 'facial_place' | 'hotel';
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
            const messageId = ID.unique();
            const signup = await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                messageId,
                {
                    messageId: messageId,
                    conversationId: 'membership_signup',
                    senderId: 'system',
                    senderName: 'Membership System',
                    senderRole: 'system',
                    senderType: 'system',
                    recipientId: 'admin',
                    receiverId: 'admin',
                    receiverName: 'Admin',
                    receiverRole: 'admin',
                    message: `Membership signup initialized - ${planType} plan`,
                    content: JSON.stringify({
                        type: 'membership_signup',
                        planType,
                        planSelectedAt: new Date().toISOString(),
                        termsAccepted: false,
                        termsVersion: '1.0',
                        ipAddress,
                        userAgent,
                        isLive: false,
                        paymentAmount: planType === 'plus' ? 250000 : 0,
                        status: 'plan_selected'
                    }),
                    messageType: 'membership_data',
                    sentAt: new Date().toISOString()
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
            // First get the current document to retrieve existing content
            const currentDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            
            // Parse existing content and update it
            const existingContent = JSON.parse(currentDoc.content);
            const updatedContent = {
                ...existingContent,
                termsAccepted: true,
                termsAcceptedAt: new Date().toISOString(),
                status: 'terms_accepted'
            };

            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(updatedContent),
                    message: `Terms accepted for ${existingContent.planType} plan`
                }
            );

            // Create membership agreement record
            const agreementId = ID.unique();
            await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_AGREEMENTS,
                agreementId,
                {
                    messageId: agreementId,
                    conversationId: 'membership_agreement',
                    senderId: 'system',
                    senderName: 'Membership System',
                    senderRole: 'system',
                    senderType: 'system',
                    recipientId: 'admin',
                    receiverId: 'admin',
                    receiverName: 'Admin',
                    receiverRole: 'admin',
                    message: `Terms agreement for signup ${signupId}`,
                    content: JSON.stringify({
                        type: 'membership_agreement',
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
                    }),
                    messageType: 'membership_agreement',
                    sentAt: new Date().toISOString()
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
            // Get existing document to update content
            const existing = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            
            const existingContent = JSON.parse(existing.content || '{}');
            const updatedContent = {
                ...existingContent,
                portalType,
                portalSelectedAt: new Date().toISOString(),
                status: 'portal_selected',
                updatedAt: new Date().toISOString()
            };
            
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(updatedContent),
                    message: `Portal selected: ${portalType}`
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
            const signupDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );

            // Parse content to get portalType
            const signupContent = JSON.parse(signupDoc.content || '{}');
            const portalType = signupContent.portalType;

            if (!portalType) {
                throw new Error(`Invalid portal type: ${portalType}`);
            }

            // Create Appwrite user account
            const user = await account.create(ID.unique(), email, password, name);

            // Create member document based on portal type
            const collectionId = this.getCollectionId(portalType);
            
            // Base member data
            const baseMemberData = {
                email,
                name,
                planType: signupContent.planType,
                membershipPlan: signupContent.planType,
                isLive: false,
                isVerified: false,
                status: 'pending_profile',
                paymentStatus: 'pending',
                profileComplete: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add portal-specific required fields
            const memberData = this.addPortalSpecificFields(baseMemberData, portalType, user.$id);

            // Create member record as message document
            const memberId = ID.unique();
            const member = await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                memberId,
                {
                    messageId: memberId,
                    conversationId: 'member_profile',
                    senderId: user.$id,
                    senderName: name,
                    senderRole: 'member',
                    senderType: portalType,
                    recipientId: 'admin',
                    receiverId: 'admin',
                    receiverName: 'Admin',
                    receiverRole: 'admin',
                    message: `Member profile created for ${portalType}: ${email}`,
                    content: JSON.stringify({
                        type: 'member_profile',
                        portalType: portalType,
                        memberData: memberData
                    }),
                    messageType: 'member_data',
                    sentAt: new Date().toISOString()
                }
            );

            // Update signup with account info
            const existingSignup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            
            const existingContent = JSON.parse(existingSignup.content || '{}');
            const updatedContent = {
                ...existingContent,
                userId: user.$id,
                email,
                memberId: member.$id,
                accountCreatedAt: new Date().toISOString(),
                status: 'account_created',
                updatedAt: new Date().toISOString()
            };
            
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(updatedContent),
                    message: `Account created for ${email}`
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
            const signupDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );

            // Parse content to get portalType
            const signupContent = JSON.parse(signupDoc.content || '{}');
            const portalType = signupContent.portalType;

            // Update member document
            const collectionId = this.getCollectionId(portalType);
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
            const existingSignup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            
            const existingContent = JSON.parse(existingSignup.content || '{}');
            const updatedContent = {
                ...existingContent,
                profileCompleted: true,
                profileCompletedAt: new Date().toISOString(),
                status: 'profile_uploaded',
                updatedAt: new Date().toISOString()
            };
            
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(updatedContent),
                    message: 'Profile completed and uploaded'
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
            const signupDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );

            // Parse content to get signup data
            const signupContent = JSON.parse(signupDoc.content || '{}');
            const portalType = signupContent.portalType;
            const memberId = signupContent.memberId;

            // Calculate 5-hour deadline
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + SIGNUP_CONFIG.PAYMENT_DEADLINE_HOURS);

            // Update member to live (but with pending payment status)
            const collectionId = this.getCollectionId(portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                memberId,
                {
                    isLive: true,
                    goLiveSubmittedAt: new Date().toISOString(),
                    paymentDeadline: deadline.toISOString(),
                    status: 'awaiting_payment',
                    updatedAt: new Date().toISOString()
                }
            );

            // Update signup
            const existingSignup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            
            const existingContent = JSON.parse(existingSignup.content || '{}');
            const updatedContent = {
                ...existingContent,
                goLiveSubmittedAt: new Date().toISOString(),
                isLive: true,
                paymentDeadline: deadline.toISOString(),
                status: 'awaiting_payment',
                updatedAt: new Date().toISOString()
            };
            
            const updated = await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(updatedContent),
                    message: `Go live submitted with payment deadline: ${deadline.toISOString()}`
                }
            );

            // Notify admin
            await this.notifyAdmin('new_go_live', memberId, portalType);

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
            const signupDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );

            // Parse content to get signup data
            const signupContent = JSON.parse(signupDoc.content || '{}');
            const portalType = signupContent.portalType;
            const memberId = signupContent.memberId;
            const planType = signupContent.planType;
            const paymentDeadline = signupContent.paymentDeadline;
            const paymentAmount = signupContent.paymentAmount;

            // Check if deadline has passed
            if (paymentDeadline && new Date(paymentDeadline) < new Date()) {
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
            const submissionId = ID.unique();
            const submission = await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId,
                {
                    messageId: submissionId,
                    conversationId: 'payment_submission',
                    senderId: memberId || 'unknown',
                    senderName: `Member ${memberId}`,
                    senderRole: 'member',
                    senderType: 'member',
                    recipientId: 'admin',
                    receiverId: 'admin',
                    receiverName: 'Admin',
                    receiverRole: 'admin',
                    message: `Payment proof submitted for ${planType} plan`,
                    content: JSON.stringify({
                        type: 'payment_submission',
                        signupId,
                        memberId: memberId,
                        memberType: portalType,
                        planType: planType,
                        amount: paymentAmount,
                        proofFileUrl: proofUrl,
                        bankName,
                        accountName,
                        paymentMethod,
                        status: 'pending',
                        deadline: paymentDeadline,
                        submittedAt: new Date().toISOString()
                    }),
                    messageType: 'payment_proof',
                    sentAt: new Date().toISOString()
                }
            );

            // Update signup
            const existingSignup = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );
            
            const existingContent = JSON.parse(existingSignup.content || '{}');
            const updatedContent = {
                ...existingContent,
                paymentProofUrl: proofUrl,
                paymentProofUploadedAt: new Date().toISOString(),
                paymentMethod,
                status: 'payment_pending',
                updatedAt: new Date().toISOString()
            };
            
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(updatedContent),
                    message: `Payment proof uploaded - ${paymentMethod}`
                }
            );

            // Update member status
            const collectionId = this.getCollectionId(portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                memberId,
                {
                    paymentStatus: 'pending_verification',
                    paymentProofUrl: proofUrl,
                    paymentProofUploadedAt: new Date().toISOString(),
                    status: 'payment_pending',
                    updatedAt: new Date().toISOString()
                }
            );

            // Notify admin for verification
            await this.notifyAdmin('payment_proof_uploaded', memberId, portalType);

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
            const existingSubmission = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId
            );
            
            const submissionContent = JSON.parse(existingSubmission.content || '{}');
            submissionContent.status = 'approved';
            submissionContent.reviewedAt = new Date().toISOString();
            submissionContent.reviewedBy = adminId;
            
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId,
                {
                    content: JSON.stringify(submissionContent),
                    message: 'Payment approved by admin'
                }
            );

            // Get signup ID from submission content
            const signupId = submissionContent.signupId;
            
            // Get signup
            const signupDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );

            // Parse signup content
            const signupContent = JSON.parse(signupDoc.content || '{}');
            const portalType = signupContent.portalType;
            const memberId = signupContent.memberId;

            // Update signup status
            signupContent.status = 'active';
            signupContent.updatedAt = new Date().toISOString();
            
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(signupContent),
                    message: 'Membership activated - payment approved'
                }
            );

            // Update member to fully active
            const collectionId = this.getCollectionId(portalType);
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                collectionId,
                memberId,
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
            const existingSubmission = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId
            );
            
            const submissionContent = JSON.parse(existingSubmission.content || '{}');
            submissionContent.status = 'rejected';
            submissionContent.reviewedAt = new Date().toISOString();
            submissionContent.reviewedBy = adminId;
            submissionContent.rejectionReason = reason;
            
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.PAYMENT_SUBMISSIONS,
                submissionId,
                {
                    content: JSON.stringify(submissionContent),
                    message: `Payment rejected: ${reason}`
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
            const signupDoc = await databases.getDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId
            );

            // Parse content to get signup data
            const signupContent = JSON.parse(signupDoc.content || '{}');
            const portalType = signupContent.portalType;
            const memberId = signupContent.memberId;

            // Update signup
            signupContent.status = 'deactivated';
            signupContent.deactivatedAt = new Date().toISOString();
            signupContent.deactivationReason = reason;
            signupContent.isLive = false;
            signupContent.updatedAt = new Date().toISOString();
            
            await databases.updateDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS,
                signupId,
                {
                    content: JSON.stringify(signupContent),
                    message: `Account deactivated: ${reason}`
                }
            );

            // Update member
            if (memberId && portalType) {
                const collectionId = this.getCollectionId(portalType);
                await databases.updateDocument(
                    SIGNUP_CONFIG.DATABASE_ID,
                    collectionId,
                    memberId,
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
            await this.notifyAdmin('account_deactivated', memberId, portalType);

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
        // All membership data is stored in the messages collection during signup process
        // Business profiles are created later in actual business collections after approval
        return SIGNUP_CONFIG.COLLECTIONS.MEMBERSHIP_SIGNUPS; // This is 'messages' collection
    }

    private async notifyAdmin(type: string, memberId: string, memberType: PortalType): Promise<void> {
        try {
            const notificationId = ID.unique();
            await databases.createDocument(
                SIGNUP_CONFIG.DATABASE_ID,
                SIGNUP_CONFIG.COLLECTIONS.ADMIN_NOTIFICATIONS,
                notificationId,
                {
                    messageId: notificationId,
                    conversationId: 'admin_notification',
                    senderId: 'system',
                    senderName: 'Membership System',
                    senderRole: 'system',
                    senderType: 'system',
                    recipientId: 'admin',
                    receiverId: 'admin',
                    receiverName: 'Admin',
                    receiverRole: 'admin',
                    message: this.getNotificationTitle(type),
                    content: JSON.stringify({
                        type: 'admin_notification',
                        notificationType: type,
                        memberId,
                        memberType,
                        title: this.getNotificationTitle(type),
                        description: this.getNotificationMessage(type, memberType),
                        read: false,
                        createdAt: new Date().toISOString()
                    }),
                    messageType: 'admin_notification',
                    sentAt: new Date().toISOString()
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

    /**
     * Add portal-specific required fields to member data
     */
    private addPortalSpecificFields(baseMemberData: any, portalType: PortalType, userId: string): any {
        switch (portalType) {
            case 'massage_therapist':
                return {
                    ...baseMemberData,
                    // Required fields for therapists collection
                    specialization: 'General Massage', // Default value, can be updated in profile
                    yearsOfExperience: 0,
                    isLicensed: false,
                    location: 'Not specified',
                    hourlyRate: 100000, // Default minimum rate
                    id: userId, // Some collections expect 'id' field
                    therapistId: userId,
                    hotelId: '',
                    whatsappNumber: '',
                    phoneNumber: '',
                    city: '',
                    coordinates: [0, 0],
                    countryCode: '',
                    country: '',
                    profilePicture: '',
                    mainImage: '',
                    description: '',
                    massageTypes: [],
                    languages: [],
                    pricing: { hourly: 100000 },
                    price60: 100000,
                    price90: 150000,
                    price120: 200000,
                    bookingsEnabled: true
                };
            case 'massage_place':
                return {
                    ...baseMemberData,
                    // Required fields for places collection
                    hotelId: '',
                    whatsappNumber: '',
                    address: '',
                    businessHours: '',
                    services: [],
                    mainImage: '',
                    gallery: [],
                    coordinates: [0, 0],
                    city: '',
                    rating: 0,
                    reviewCount: 0,
                    bookingsEnabled: true
                };
            case 'facial_place':
                return {
                    ...baseMemberData,
                    // Required fields for facial_places collection
                    hotelId: '',
                    facialPlaceId: userId,
                    collectionName: 'facial_places',
                    category: 'Facial Spa',
                    address: '',
                    websiteurl: '',
                    facialservices: JSON.stringify([]),
                    facialtypes: JSON.stringify([]),
                    prices: JSON.stringify({}),
                    facialtimes: JSON.stringify([]),
                    statusonline: 'offline',
                    discounted: false,
                    starrate: '0',
                    distancekm: '0',
                    popularityScore: 0,
                    averageSessionDuration: 60,
                    equipmentList: JSON.stringify([]),
                    lastUpdate: new Date().toISOString(),
                    coordinates: [0, 0],
                    city: '',
                    country: '',
                    bookingsEnabled: true
                };
            case 'hotel':
                return {
                    ...baseMemberData,
                    // Required fields for hotels collection
                    hotelId: userId,
                    address: '',
                    amenities: [],
                    roomTypes: [],
                    coordinates: [0, 0],
                    city: '',
                    rating: 0,
                    priceRange: { min: 0, max: 0 },
                    bookingsEnabled: true
                };
            default:
                return baseMemberData;
        }
    }
}

export const membershipSignupService = new MembershipSignupService();

/**
 * Membership and subscription management
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

// Import services with proper fallbacks
let leadGenerationService: any;
try {
    ({ leadGenerationService } = require('../config'));
} catch {
    leadGenerationService = { markLeadsPaid: () => console.warn('leadGenerationService not available') };
}

export const membershipService = {
    // Pricing constants (Indonesia - IDR)
    COUNTRY: 'ID', // Indonesia
    CURRENCY: 'IDR',
    PRICING: {
        TRIAL: 0,
        MONTH_2: 100000,
        MONTH_3: 135000,
        MONTH_4: 175000,
        MONTH_5: 200000,
        MONTH_6_PLUS: 200000, // Stays at 200k for all months after Month 5
        PREMIUM_UPGRADE: 275000,
        LEAD_COST_PERCENTAGE: 0.25, // 25% of booking price per accepted lead
        LATE_FEE: 25000,
        REACTIVATION_FEE: 275000
    },
    
    // Grace period settings
    GRACE_PERIOD_DAYS: 5, // Days 1-5: no penalty
    LATE_FEE_AFTER_DAY: 5, // After day 5: late fee applies
    SUSPENSION_AFTER_DAY: 10, // After day 10: switch to lead-based model

    /**
     * Get pricing for current membership month (Indonesia - IDR)
     * Month 1: Free
     * Month 2: 100k
     * Month 3: 135k
     * Month 4: 175k
     * Month 5+: 200k (consistent rate for all subsequent months)
     */
    getPricingForMonth: (month: number): number => {
        if (month === 1) return membershipService.PRICING.TRIAL;
        if (month === 2) return membershipService.PRICING.MONTH_2;
        if (month === 3) return membershipService.PRICING.MONTH_3;
        if (month === 4) return membershipService.PRICING.MONTH_4;
        // Month 5 and all subsequent months: 200,000 IDR
        return membershipService.PRICING.MONTH_6_PLUS;
    },

    /**
     * Check if member is verified (has badge)
     */
    isVerified: (member: any): boolean => {
        return member.isVerified && 
               member.subscriptionStatus !== 'suspended' &&
               member.subscriptionStatus !== 'deactivated' &&
               (member.outstandingDues || 0) === 0;
    },

    /**
     * Calculate outstanding dues for member
     */
    calculateOutstandingDues: async (memberId: string, memberType: string) => {
        try {
            // Get membership payments owed
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            const member = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId
            );

            let totalDues = 0;

            // Add unpaid subscription fees
            if (member.subscriptionStatus === 'active' && member.outstandingDues) {
                totalDues += member.outstandingDues;
            }

            // Add unpaid lead charges
            const unpaidLeads = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.leadGenerations,
                [
                    Query.equal('memberId', memberId),
                    Query.equal('status', 'accepted'),
                    Query.equal('paymentStatus', 'unpaid')
                ]
            );

            unpaidLeads.documents.forEach((lead: any) => {
                totalDues += lead.leadCost;
            });

            return totalDues;
        } catch (error) {
            console.error('Error calculating outstanding dues:', error);
            throw error;
        }
    },

    /**
     * Accept membership agreement
     */
    acceptAgreement: async (memberId: string, memberType: string, agreementData: any) => {
        try {
            // Create agreement record
            const agreement = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipAgreements,
                ID.unique(),
                {
                    memberId,
                    memberType,
                    agreementVersion: '1.0',
                    acceptedDate: new Date().toISOString(),
                    ipAddress: agreementData.ipAddress,
                    userAgent: agreementData.userAgent,
                    termsAcknowledged: [
                        'five_month_commitment',
                        'payment_schedule',
                        'deactivation_policy',
                        'upgrade_pricing',
                        'verified_badge_policy'
                    ],
                    pricingTierAcknowledged: {
                        month1: 0,
                        month2: 100000,
                        month3: 135000,
                        month4: 175000,
                        month5Plus: 200000,
                        premiumUpgrade: 275000
                    },
                    isActive: true
                }
            );

            // Update member document
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId,
                {
                    agreementAccepted: true,
                    agreementAcceptedDate: new Date().toISOString(),
                    agreementVersion: '1.0',
                    subscriptionStatus: 'trial',
                    membershipMonth: 1,
                    commitmentEndDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString() // 5 months
                }
            );

            return agreement;
        } catch (error) {
            console.error('Error accepting agreement:', error);
            throw error;
        }
    },

    /**
     * Request upgrade from lead-based to premium
     */
    requestPremiumUpgrade: async (memberId: string, memberType: string) => {
        try {
            // Check if member is eligible
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                 memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                 APPWRITE_CONFIG.collections.facial_places;            const member = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId
            );

            if (member.paymentModel !== 'lead_based') {
                throw new Error('Only lead-based members can upgrade to premium');
            }

            // Calculate outstanding dues
            const outstandingDues = await membershipService.calculateOutstandingDues(memberId, memberType);
            const totalUpgradeCost = membershipService.PRICING.PREMIUM_UPGRADE + outstandingDues;

            // Create upgrade request
            const upgrade = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                ID.unique(),
                {
                    memberId,
                    memberType,
                    upgradeDate: new Date().toISOString(),
                    previousModel: 'lead_based',
                    newModel: 'premium',
                    upgradeFee: membershipService.PRICING.PREMIUM_UPGRADE,
                    outstandingDuesCleared: outstandingDues,
                    totalPaidAtUpgrade: totalUpgradeCost,
                    paymentStatus: 'pending',
                    verifiedBadgeGranted: false
                }
            );

            return {
                upgrade,
                totalCost: totalUpgradeCost,
                outstandingDues,
                upgradeFee: membershipService.PRICING.PREMIUM_UPGRADE
            };
        } catch (error) {
            console.error('Error requesting premium upgrade:', error);
            throw error;
        }
    },

    /**
     * Complete premium upgrade after payment
     */
    completePremiumUpgrade: async (upgradeId: string) => {
        try {
            const upgrade = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                upgradeId
            );

            // Update upgrade record
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                upgradeId,
                {
                    paymentStatus: 'paid',
                    paymentDate: new Date().toISOString(),
                    verifiedBadgeGranted: true,
                    verifiedBadgeDate: new Date().toISOString()
                }
            );

            // Update member record
            const collectionId = upgrade.memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                upgrade.memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                upgrade.memberId,
                {
                    subscriptionStatus: 'premium',
                    paymentModel: 'premium',
                    previousPaymentModel: 'lead_based',
                    upgradedToPremium: true,
                    premiumUpgradeDate: new Date().toISOString(),
                    isVerified: true,
                    verifiedSince: new Date().toISOString(),
                    outstandingDues: 0
                }
            );

            // Mark all outstanding leads as paid
            await leadGenerationService.markLeadsPaid(upgrade.memberId, new Date().toISOString().substring(0,7), upgrade.amount || 0);

            return upgrade;
        } catch (error) {
            console.error('Error completing premium upgrade:', error);
            throw error;
        }
    },

    /**
     * Request account deactivation
     */
    requestDeactivation: async (memberId: string, memberType: string, reason: string) => {
        try {
            // Check outstanding dues
            const outstandingDues = await membershipService.calculateOutstandingDues(memberId, memberType);

            if (outstandingDues > 0) {
                throw new Error(`Cannot deactivate account with outstanding dues: Rp ${outstandingDues.toLocaleString()}`);
            }

            // Create deactivation request
            const request = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                ID.unique(),
                {
                    memberId,
                    memberType,
                    requestDate: new Date().toISOString(),
                    reason,
                    status: 'pending',
                    outstandingDuesAtRequest: outstandingDues,
                    noticeProvidedDate: new Date().toISOString(),
                    effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    canReactivateAfter: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 90 days after
                    reactivationFeeRequired: membershipService.PRICING.REACTIVATION_FEE,
                    reactivationRequiresApproval: true
                }
            );

            // Update member record
            const collectionId = memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                memberId,
                {
                    deactivationRequested: true,
                    deactivationRequestDate: new Date().toISOString()
                }
            );

            return request;
        } catch (error) {
            console.error('Error requesting deactivation:', error);
            throw error;
        }
    },

    /**
     * Approve deactivation request
     */
    approveDeactivation: async (requestId: string, adminId: string, notes: string) => {
        try {
            const request = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                requestId
            );

            // Update request
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                requestId,
                {
                    status: 'approved',
                    reviewedBy: adminId,
                    reviewedDate: new Date().toISOString(),
                    reviewNotes: notes,
                    clearanceCertificateIssued: true
                }
            );

            // Update member record
            const collectionId = request.memberType === 'therapist' ? APPWRITE_CONFIG.collections.therapists :
                                request.memberType === 'massage_place' ? APPWRITE_CONFIG.collections.places :
                                APPWRITE_CONFIG.collections.facial_places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                request.memberId,
                {
                    subscriptionStatus: 'deactivated',
                    deactivationEffectiveDate: request.effectiveDate,
                    isVerified: false,
                    verifiedSince: null
                }
            );

            return request;
        } catch (error) {
            console.error('Error approving deactivation:', error);
            throw error;
        }
    },

    /**
     * Get membership stats for admin dashboard
     */
    getMembershipStats: async () => {
        try {
            const stats = {
                totalMembers: 0,
                trialMembers: 0,
                activeMembers: 0,
                premiumMembers: 0,
                leadBasedMembers: 0,
                suspendedMembers: 0,
                deactivatedMembers: 0,
                verifiedMembers: 0,
                totalRevenue: 0,
                pendingUpgrades: 0,
                pendingDeactivations: 0
            };

            // Get counts from all collections
            const collections = [
                APPWRITE_CONFIG.collections.therapists,
                APPWRITE_CONFIG.collections.places,
                APPWRITE_CONFIG.collections.facial_places
            ];

            for (const collectionId of collections) {
                const members = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    collectionId
                );

                members.documents.forEach((member: any) => {
                    stats.totalMembers++;
                    if (member.subscriptionStatus === 'trial') stats.trialMembers++;
                    if (member.subscriptionStatus === 'active') stats.activeMembers++;
                    if (member.subscriptionStatus === 'premium') stats.premiumMembers++;
                    if (member.subscriptionStatus === 'lead_based') stats.leadBasedMembers++;
                    if (member.subscriptionStatus === 'suspended') stats.suspendedMembers++;
                    if (member.subscriptionStatus === 'deactivated') stats.deactivatedMembers++;
                    if (member.isVerified) stats.verifiedMembers++;
                    stats.totalRevenue += member.totalPaidToDate || 0;
                });
            }

            // Get pending upgrades
            const upgrades = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.membershipUpgrades,
                [Query.equal('paymentStatus', 'pending')]
            );
            stats.pendingUpgrades = upgrades.total;

            // Get pending deactivations
            const deactivations = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.deactivationRequests,
                [Query.equal('status', 'pending')]
            );
            stats.pendingDeactivations = deactivations.total;

            return stats;
        } catch (error) {
            console.error('Error getting membership stats:', error);
            throw error;
        }
    }
};

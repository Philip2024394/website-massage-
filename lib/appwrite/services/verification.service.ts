/**
 * Verification Service
 * Handles identity and business verification
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const verificationService = {
    async create(verification: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.verifications,
                ID.unique(),
                verification
            );
            return response;
        } catch (error) {
            console.error('Error creating verification:', error);
            throw error;
        }
    },

    async getByUserId(userId: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.verifications,
                [Query.equal('userId', userId)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching verification:', error);
            return null;
        }
    },

    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.verifications,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating verification:', error);
            throw error;
        }
    },

    async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<any> {
        return this.update(id, { status });
    },

    async checkEligibility(userId: string, userType: 'therapist' | 'place'): Promise<{ eligible: boolean; reason?: string }> {
        try {
            // Check if user already has verification
            const existing = await this.getByUserId(userId);
            if (existing && existing.status === 'approved') {
                return { eligible: false, reason: 'Already verified' };
            }
            if (existing && existing.status === 'pending') {
                return { eligible: false, reason: 'Verification pending' };
            }
            return { eligible: true };
        } catch (error) {
            console.error('Error checking eligibility:', error);
            return { eligible: false, reason: 'Error checking eligibility' };
        }
    },

    async applyForVerification(userId: string, userType: 'therapist' | 'place', data: any): Promise<any> {
        try {
            const verification = {
                userId,
                userType,
                status: 'pending',
                appliedAt: new Date().toISOString(),
                ...data
            };
            return await this.create(verification);
        } catch (error) {
            console.error('Error applying for verification:', error);
            throw error;
        }
    },

    async revokeVerification(userId: string, reason?: string): Promise<any> {
        try {
            const verification = await this.getByUserId(userId);
            if (!verification) {
                throw new Error('No verification found');
            }
            return await this.update(verification.$id, { 
                status: 'revoked',
                revokedAt: new Date().toISOString(),
                revocationReason: reason || 'revoked'
            });
        } catch (error) {
            console.error('Error revoking verification:', error);
            throw error;
        }
    }
};

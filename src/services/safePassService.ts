/**
 * SafePass Service
 * Manages SafePass applications, approvals, and activations
 */

import { Client, Databases, Storage, ID, Query } from 'appwrite';
import type { 
    SafePassApplication, 
    SafePassSubmissionData, 
    SafePassApprovalData,
    SafePassActivationData,
    SafePassStats 
} from '../types/safepass.types';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68f23b11000d25eb3664');

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
const SAFEPASS_COLLECTION_ID = 'safepass'; // New collection
const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'default';

class SafePassService {
    /**
     * Submit SafePass application
     */
    async submitApplication(data: SafePassSubmissionData): Promise<SafePassApplication> {
        try {
            const now = new Date().toISOString();
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 YEAR validity

            const applicationData = {
                entityType: data.entityType,
                entityId: data.entityId,
                entityName: data.entityName,
                hotelVillaSafePassStatus: 'pending',
                hasSafePassVerification: false,
                hotelVillaLetters: data.hotelVillaLetters ? JSON.stringify(data.hotelVillaLetters) : null,
                safePassSubmittedAt: now,
                safePassPaymentId: data.safePassPaymentId || null,
                safePassIssuedAt: now, // Set initially, will be updated on activation
                safePassExpiry: expiryDate.toISOString(),
                safePassApprovedAt: null,
                safePassApprovedBy: null,
                safePassRejectionReason: null,
                safePassCardUrl: null,
            };

            const response = await databases.createDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                ID.unique(),
                applicationData
            );

            return response as SafePassApplication;
        } catch (error) {
            console.error('Error submitting SafePass application:', error);
            throw error;
        }
    }

    /**
     * Upload SafePass letter/document
     */
    async uploadLetter(file: File): Promise<string> {
        try {
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file
            );

            const fileUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
            
            return fileUrl;
        } catch (error) {
            console.error('Error uploading SafePass letter:', error);
            throw error;
        }
    }

    /**
     * Get SafePass application by ID
     */
    async getApplication(applicationId: string): Promise<SafePassApplication | null> {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                applicationId
            );

            return response as SafePassApplication;
        } catch (error) {
            console.error('Error fetching SafePass application:', error);
            return null;
        }
    }

    /**
     * Get SafePass application by entity (therapist or place)
     */
    async getApplicationByEntity(entityType: string, entityId: string): Promise<SafePassApplication | null> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                [
                    Query.equal('entityType', entityType),
                    Query.equal('entityId', entityId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1)
                ]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as SafePassApplication;
            }

            return null;
        } catch (error) {
            console.error('Error fetching SafePass application by entity:', error);
            return null;
        }
    }

    /**
     * List all SafePass applications (admin view)
     */
    async listApplications(status?: string, limit: number = 100): Promise<SafePassApplication[]> {
        try {
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ];

            if (status) {
                queries.push(Query.equal('hotelVillaSafePassStatus', status));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                queries
            );

            return response.documents as SafePassApplication[];
        } catch (error) {
            console.error('Error listing SafePass applications:', error);
            return [];
        }
    }

    /**
     * Approve SafePass application (admin action)
     */
    async approveApplication(data: SafePassApprovalData): Promise<SafePassApplication> {
        try {
            const now = new Date().toISOString();

            if (!data.approved) {
                // Rejection
                const response = await databases.updateDocument(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    data.applicationId,
                    {
                        hotelVillaSafePassStatus: 'rejected',
                        safePassRejectionReason: data.rejectionReason || 'Application rejected by admin',
                    }
                );

                return response as SafePassApplication;
            }

            // Approval
            const response = await databases.updateDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                data.applicationId,
                {
                    hotelVillaSafePassStatus: 'approved',
                    safePassApprovedAt: now,
                    safePassApprovedBy: data.adminId,
                    safePassRejectionReason: null,
                }
            );

            return response as SafePassApplication;
        } catch (error) {
            console.error('Error approving SafePass application:', error);
            throw error;
        }
    }

    /**
     * Activate SafePass (admin action - final step)
     */
    async activateApplication(data: SafePassActivationData): Promise<SafePassApplication> {
        try {
            const now = new Date().toISOString();
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 2);

            const response = await databases.updateDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                data.applicationId,
                {
                    hotelVillaSafePassStatus: 'active',
                    hasSafePassVerification: true,
                    safePassIssuedAt: now,
                    safePassExpiry: expiryDate.toISOString(),
                    safePassCardUrl: data.safePassCardUrl || null,
                }
            );

            return response as SafePassApplication;
        } catch (error) {
            console.error('Error activating SafePass:', error);
            throw error;
        }
    }

    /**
     * Revoke SafePass (admin action)
     */
    async revokeApplication(applicationId: string, reason: string): Promise<SafePassApplication> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                applicationId,
                {
                    hotelVillaSafePassStatus: 'rejected',
                    hasSafePassVerification: false,
                    safePassRejectionReason: reason,
                }
            );

            return response as SafePassApplication;
        } catch (error) {
            console.error('Error revoking SafePass:', error);
            throw error;
        }
    }

    /**
     * Get SafePass statistics (admin dashboard)
     */
    async getStats(): Promise<SafePassStats> {
        try {
            const allApplications = await this.listApplications(undefined, 1000);

            const stats: SafePassStats = {
                total: allApplications.length,
                pending: allApplications.filter(app => app.hotelVillaSafePassStatus === 'pending').length,
                approved: allApplications.filter(app => app.hotelVillaSafePassStatus === 'approved').length,
                active: allApplications.filter(app => app.hotelVillaSafePassStatus === 'active').length,
                rejected: allApplications.filter(app => app.hotelVillaSafePassStatus === 'rejected').length,
            };

            return stats;
        } catch (error) {
            console.error('Error fetching SafePass stats:', error);
            return {
                total: 0,
                pending: 0,
                approved: 0,
                active: 0,
                rejected: 0,
            };
        }
    }

    /**
     * Update application status
     */
    async updateStatus(applicationId: string, status: string): Promise<SafePassApplication> {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                applicationId,
                {
                    hotelVillaSafePassStatus: status,
                }
            );

            return response as SafePassApplication;
        } catch (error) {
            console.error('Error updating SafePass status:', error);
            throw error;
        }
    }

    /**
     * Delete SafePass application
     */
    async deleteApplication(applicationId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                applicationId
            );

            return true;
        } catch (error) {
            console.error('Error deleting SafePass application:', error);
            return false;
        }
    }
}

export const safePassService = new SafePassService();
export default safePassService;

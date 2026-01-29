/**
 * Therapist Dashboard Data Service
 * Handles KTP verification, bank details, payment proofs and other dashboard data
 * Uses the therapist_dashboard_ collection
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

const COLLECTION_ID = APPWRITE_CONFIG.collections.therapistDashboard;
const KTP_BUCKET_ID = '697b3ca50023d08ec335'; // KTP storage bucket

export interface TherapistDashboardData {
  $id?: string;
  therapistId: string;
  
  // Bank Details
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  bankBranch?: string;
  swiftCode?: string;
  
  // KTP Verification
  ktpPhotoFileId?: string;
  ktpPhotoUrl?: string;
  ktpNumber?: string;
  ktpSubmitted?: boolean;
  ktpVerified?: boolean;
  ktpRejected?: boolean;
  ktpVerifiedAt?: string;
  ktpVerifiedBy?: string;
  ktpRejectionReason?: string;
  
  // Payment Proof
  paymentProofFileId?: string;
  paymentProofUrl?: string;
  paymentProofType?: string;
  paymentAmount?: string;
  paymentDate?: string;
  paymentVerified?: boolean;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  
  // Selfie Verification
  selfieFileId?: string;
  selfieUrl?: string;
  selfieVerified?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export const therapistDashboardService = {
  /**
   * Get dashboard data for a therapist
   */
  async get(therapistId: string): Promise<TherapistDashboardData | null> {
    try {
      console.log('📊 [DASHBOARD] Fetching dashboard data for therapist:', therapistId);
      
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTION_ID,
        [Query.equal('therapistId', therapistId), Query.limit(1)]
      );
      
      if (response.documents.length > 0) {
        console.log('✅ [DASHBOARD] Found dashboard data');
        return response.documents[0] as unknown as TherapistDashboardData;
      }
      
      console.log('ℹ️ [DASHBOARD] No dashboard data found, will create on first save');
      return null;
    } catch (error) {
      console.error('❌ [DASHBOARD] Error fetching dashboard data:', error);
      throw error;
    }
  },
  
  /**
   * Create or update dashboard data for a therapist
   */
  async upsert(therapistId: string, data: Partial<TherapistDashboardData>): Promise<TherapistDashboardData> {
    try {
      console.log('💾 [DASHBOARD] Saving dashboard data for therapist:', therapistId);
      
      // Check if document exists
      const existing = await this.get(therapistId);
      
      const timestamp = new Date().toISOString();
      const saveData = {
        ...data,
        therapistId,
        updatedAt: timestamp,
      };
      
      if (existing && existing.$id) {
        // Update existing document
        console.log('📝 [DASHBOARD] Updating existing document:', existing.$id);
        
        // Remove $id from save data
        const { $id, ...updateData } = saveData as any;
        
        const response = await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          COLLECTION_ID,
          existing.$id,
          updateData
        );
        
        console.log('✅ [DASHBOARD] Updated successfully');
        return response as unknown as TherapistDashboardData;
      } else {
        // Create new document
        console.log('📝 [DASHBOARD] Creating new document');
        
        const response = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          COLLECTION_ID,
          ID.unique(),
          {
            ...saveData,
            createdAt: timestamp,
          }
        );
        
        console.log('✅ [DASHBOARD] Created successfully:', (response as any).$id);
        return response as unknown as TherapistDashboardData;
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Error saving dashboard data:', error);
      throw error;
    }
  },
  
  /**
   * Upload KTP ID card photo
   */
  async uploadKtpPhoto(therapistId: string, file: File): Promise<{ fileId: string; url: string }> {
    try {
      console.log('📤 [DASHBOARD] Uploading KTP photo for therapist:', therapistId);
      
      // Validate file
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum 15MB allowed.');
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG and PNG are allowed.');
      }
      
      // Upload file with auto-generated ID (Appwrite requires lowercase alphanumeric)
      const uploadedFile = await storage.createFile(
        KTP_BUCKET_ID,
        ID.unique(),
        file
      );
      
      // Get view URL
      const fileUrl = storage.getFileView(KTP_BUCKET_ID, (uploadedFile as any).$id);
      
      console.log('✅ [DASHBOARD] KTP photo uploaded:', (uploadedFile as any).$id);
      
      return {
        fileId: (uploadedFile as any).$id,
        url: String(fileUrl),
      };
    } catch (error) {
      console.error('❌ [DASHBOARD] Error uploading KTP photo:', error);
      throw error;
    }
  },
  
  /**
   * Save bank details and KTP information
   */
  async saveBankAndKtp(
    therapistId: string,
    data: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      ktpPhotoFileId?: string;
      ktpPhotoUrl?: string;
    }
  ): Promise<TherapistDashboardData> {
    console.log('💳 [DASHBOARD] Saving bank details and KTP for therapist:', therapistId);
    
    return this.upsert(therapistId, {
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      ktpPhotoFileId: data.ktpPhotoFileId,
      ktpPhotoUrl: data.ktpPhotoUrl,
      ktpSubmitted: true, // Mark as submitted for admin review
      ktpVerified: false,
      ktpRejected: false,
    });
  },
  
  /**
   * Admin: Verify KTP
   */
  async verifyKtp(therapistId: string, adminId: string): Promise<TherapistDashboardData> {
    console.log('✅ [DASHBOARD] Admin verifying KTP for therapist:', therapistId);
    
    return this.upsert(therapistId, {
      ktpVerified: true,
      ktpRejected: false,
      ktpVerifiedAt: new Date().toISOString(),
      ktpVerifiedBy: adminId,
    });
  },
  
  /**
   * Admin: Reject KTP
   */
  async rejectKtp(therapistId: string, adminId: string, reason: string): Promise<TherapistDashboardData> {
    console.log('❌ [DASHBOARD] Admin rejecting KTP for therapist:', therapistId);
    
    return this.upsert(therapistId, {
      ktpVerified: false,
      ktpRejected: true,
      ktpVerifiedAt: new Date().toISOString(),
      ktpVerifiedBy: adminId,
      ktpRejectionReason: reason,
    });
  },
};

export default therapistDashboardService;

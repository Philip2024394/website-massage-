import { ID, databases, storage } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface PaymentProofSubmission {
  therapistId: string;
  therapistEmail: string;
  therapistName: string;
  proofFileUrl: string;
  proofFileId: string;
  notes?: string;
  paymentType: 'membership_upgrade' | 'commission_payment' | 'premium_feature';
  amount: number;
  currency?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface FileUploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

class PaymentProofService {
  private readonly collectionId = 'payment_confirmations';
  private readonly bucketId = 'payment_proofs';

  /**
   * Upload payment proof file to Appwrite Storage
   */
  async uploadFile(file: File, folder: string = 'payment-proofs'): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${folder}_${timestamp}_${randomString}.${fileExtension}`;

      console.log('📤 Uploading file to storage...');
      const uploadedFile = await storage.createFile(
        this.bucketId,
        ID.unique(),
        file
      );

      // Get file URL
      const fileUrl = storage.getFileView(this.bucketId, uploadedFile.$id);

      console.log('✅ File uploaded successfully:', uploadedFile.$id);

      return {
        id: uploadedFile.$id,
        url: fileUrl.toString(),
        name: file.name,
        size: file.size,
        mimeType: file.type
      };

    } catch (error: any) {
      console.error('❌ File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Submit payment proof for admin review
   */
  async submitPaymentProof(data: PaymentProofSubmission): Promise<any> {
    try {
      console.log('📝 Creating payment confirmation record...');

      const paymentRecord = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        ID.unique(),
        {
          // Core identification
          transactionId: ID.unique(),
          therapistId: data.therapistId,
          therapistEmail: data.therapistEmail,
          therapistName: data.therapistName,
          
          // Payment details
          paymentType: data.paymentType,
          amount: data.amount,
          currency: data.currency || 'IDR',
          
          // File information
          proofFileUrl: data.proofFileUrl,
          proofFileId: data.proofFileId,
          
          // Additional information
          notes: data.notes || '',
          
          // Status and timestamps
          status: data.status,
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt || null,
          reviewedBy: data.reviewedBy || null,
          rejectionReason: data.rejectionReason || null,
          
          // Expiry (7 days from submission)
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          
          // System fields
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ Payment confirmation created:', paymentRecord.$id);

      // Send notification to admin
      await this.notifyAdmin(paymentRecord);

      return paymentRecord;

    } catch (error: any) {
      console.error('❌ Failed to submit payment proof:', error);
      throw new Error(`Payment submission failed: ${error.message}`);
    }
  }

  /**
   * Get payment proof status for a therapist
   */
  async getPaymentStatus(therapistId: string): Promise<any[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        [
          `therapistId="${therapistId}"`,
          'ORDER BY submittedAt DESC'
        ]
      );

      return response.documents;

    } catch (error: any) {
      console.error('❌ Failed to get payment status:', error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Update payment proof status (for admin use)
   */
  async updatePaymentStatus(
    paymentId: string, 
    status: 'approved' | 'rejected',
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<any> {
    try {
      const updatedRecord = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        paymentId,
        {
          status: status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewedBy,
          rejectionReason: rejectionReason || null,
          updatedAt: new Date().toISOString()
        }
      );

      console.log(`✅ Payment status updated to ${status}:`, updatedRecord.$id);
      return updatedRecord;

    } catch (error: any) {
      console.error('❌ Failed to update payment status:', error);
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }

  /**
   * Delete payment proof file from storage
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(this.bucketId, fileId);
      console.log('🗑️ File deleted from storage:', fileId);
    } catch (error: any) {
      console.error('❌ Failed to delete file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum allowed: ${maxSize / (1024 * 1024)}MB`);
    }

    if (file.size < 1024) { // Less than 1KB
      throw new Error('File size too small. Please use a valid image file.');
    }
  }

  /**
   * Notify admin about new payment proof submission
   */
  private async notifyAdmin(paymentRecord: any): Promise<void> {
    try {
      // Create admin notification record
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'admin_notifications',
        ID.unique(),
        {
          type: 'payment_proof_submitted',
          title: `New Payment Proof - ${paymentRecord.therapistName}`,
          message: `${paymentRecord.therapistName} has submitted a payment proof for ${paymentRecord.paymentType} (${paymentRecord.currency} ${paymentRecord.amount.toLocaleString()}).`,
          data: {
            paymentRecordId: paymentRecord.$id,
            therapistId: paymentRecord.therapistId,
            amount: paymentRecord.amount,
            paymentType: paymentRecord.paymentType
          },
          priority: 'high',
          status: 'unread',
          createdAt: new Date().toISOString()
        }
      );

      console.log('📧 Admin notification sent for payment proof submission');

    } catch (error: any) {
      console.error('⚠️ Failed to send admin notification:', error);
      // Don't throw error here as the main submission was successful
    }
  }

  /**
   * Get all pending payment proofs (for admin dashboard)
   */
  async getPendingPaymentProofs(): Promise<any[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        [
          'status="pending"',
          'ORDER BY submittedAt DESC'
        ]
      );

      return response.documents;

    } catch (error: any) {
      console.error('❌ Failed to get pending payment proofs:', error);
      throw new Error(`Failed to get pending payment proofs: ${error.message}`);
    }
  }

  /**
   * Get payment statistics (for admin dashboard)
   */
  async getPaymentStatistics(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
  }> {
    try {
      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        databases.listDocuments(APPWRITE_CONFIG.databaseId, this.collectionId, ['status="pending"']),
        databases.listDocuments(APPWRITE_CONFIG.databaseId, this.collectionId, ['status="approved"']),
        databases.listDocuments(APPWRITE_CONFIG.databaseId, this.collectionId, ['status="rejected"'])
      ]);

      const totalAmount = [...pendingResponse.documents, ...approvedResponse.documents]
        .reduce((sum, doc) => sum + (doc.amount || 0), 0);

      return {
        pending: pendingResponse.total,
        approved: approvedResponse.total,
        rejected: rejectedResponse.total,
        totalAmount: totalAmount
      };

    } catch (error: any) {
      console.error('❌ Failed to get payment statistics:', error);
      throw new Error(`Failed to get payment statistics: ${error.message}`);
    }
  }
}

export const paymentProofService = new PaymentProofService();
export default paymentProofService;
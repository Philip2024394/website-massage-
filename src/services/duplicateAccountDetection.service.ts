/**
 * 🚨 DUPLICATE ACCOUNT DETECTION SERVICE
 * 
 * Fraud prevention system that detects duplicate accounts based on:
 * - Bank account details (bank name + account number)
 * - WhatsApp number
 * - KTP number
 * 
 * When duplicates are detected:
 * 1. Newest account is automatically deactivated
 * 2. Admin is notified with details
 * 3. Both accounts are flagged for review
 */

import { Query } from 'appwrite';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite/config';

interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateField: 'bank' | 'whatsapp' | 'ktp' | null;
  duplicateAccount: any | null;
  shouldDeactivate: boolean;
}

interface AccountData {
  $id: string;
  $createdAt: string;
  name: string;
  accountType: 'therapist' | 'place';
  bankName?: string;
  accountNumber?: string;
  whatsappNumber?: string;
  ktpNumber?: string;
  isActive?: boolean;
}

export const duplicateAccountDetectionService = {
  /**
   * Check if account has duplicate critical information
   */
  async checkForDuplicates(
    accountData: AccountData,
    accountType: 'therapist' | 'place'
  ): Promise<DuplicateCheckResult> {
    try {
      console.log('🔍 [DUPLICATE CHECK] Checking account:', accountData.name, 'Type:', accountType);

      const collectionId = accountType === 'therapist' 
        ? APPWRITE_CONFIG.collections.therapists 
        : APPWRITE_CONFIG.collections.places;

      // Check for duplicate bank details
      if (accountData.bankName && accountData.accountNumber) {
        const bankDuplicate = await this.checkBankDuplicate(
          accountData,
          collectionId
        );
        if (bankDuplicate.hasDuplicate) {
          return bankDuplicate;
        }
      }

      // Check for duplicate WhatsApp number
      if (accountData.whatsappNumber) {
        const whatsappDuplicate = await this.checkWhatsAppDuplicate(
          accountData,
          collectionId
        );
        if (whatsappDuplicate.hasDuplicate) {
          return whatsappDuplicate;
        }
      }

      // Check for duplicate KTP number
      if (accountData.ktpNumber) {
        const ktpDuplicate = await this.checkKTPDuplicate(
          accountData,
          collectionId
        );
        if (ktpDuplicate.hasDuplicate) {
          return ktpDuplicate;
        }
      }

      console.log('✅ [DUPLICATE CHECK] No duplicates found for:', accountData.name);
      return {
        hasDuplicate: false,
        duplicateField: null,
        duplicateAccount: null,
        shouldDeactivate: false
      };

    } catch (error) {
      console.error('❌ [DUPLICATE CHECK] Error checking for duplicates:', error);
      throw error;
    }
  },

  /**
   * Check for duplicate bank account details
   */
  async checkBankDuplicate(
    accountData: AccountData,
    collectionId: string
  ): Promise<DuplicateCheckResult> {
    try {
      const queries = [
        Query.equal('bankName', accountData.bankName!),
        Query.equal('accountNumber', accountData.accountNumber!),
        Query.notEqual('$id', accountData.$id) // Exclude current account
      ];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        queries
      );

      if (response.documents.length > 0) {
        const duplicateAccount = response.documents[0];
        const isCurrentNewer = new Date(accountData.$createdAt) > new Date(duplicateAccount.$createdAt);

        console.warn('⚠️ [DUPLICATE BANK] Found duplicate bank details:', {
          current: accountData.name,
          duplicate: duplicateAccount.name,
          bankName: accountData.bankName,
          accountNumber: accountData.accountNumber,
          shouldDeactivateCurrent: isCurrentNewer
        });

        return {
          hasDuplicate: true,
          duplicateField: 'bank',
          duplicateAccount,
          shouldDeactivate: isCurrentNewer
        };
      }

      return {
        hasDuplicate: false,
        duplicateField: null,
        duplicateAccount: null,
        shouldDeactivate: false
      };

    } catch (error) {
      console.error('❌ Error checking bank duplicate:', error);
      throw error;
    }
  },

  /**
   * Check for duplicate WhatsApp number
   */
  async checkWhatsAppDuplicate(
    accountData: AccountData,
    collectionId: string
  ): Promise<DuplicateCheckResult> {
    try {
      // Normalize WhatsApp number (remove spaces, dashes, etc.)
      const normalizedNumber = accountData.whatsappNumber!.replace(/[\s\-\(\)]/g, '');

      const queries = [
        Query.search('whatsappNumber', normalizedNumber),
        Query.notEqual('$id', accountData.$id)
      ];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        queries
      );

      if (response.documents.length > 0) {
        const duplicateAccount = response.documents[0];
        const isCurrentNewer = new Date(accountData.$createdAt) > new Date(duplicateAccount.$createdAt);

        console.warn('⚠️ [DUPLICATE WHATSAPP] Found duplicate WhatsApp number:', {
          current: accountData.name,
          duplicate: duplicateAccount.name,
          whatsappNumber: accountData.whatsappNumber,
          shouldDeactivateCurrent: isCurrentNewer
        });

        return {
          hasDuplicate: true,
          duplicateField: 'whatsapp',
          duplicateAccount,
          shouldDeactivate: isCurrentNewer
        };
      }

      return {
        hasDuplicate: false,
        duplicateField: null,
        duplicateAccount: null,
        shouldDeactivate: false
      };

    } catch (error) {
      console.error('❌ Error checking WhatsApp duplicate:', error);
      throw error;
    }
  },

  /**
   * Check for duplicate KTP number
   */
  async checkKTPDuplicate(
    accountData: AccountData,
    collectionId: string
  ): Promise<DuplicateCheckResult> {
    try {
      const queries = [
        Query.equal('ktpNumber', accountData.ktpNumber!),
        Query.notEqual('$id', accountData.$id)
      ];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        queries
      );

      if (response.documents.length > 0) {
        const duplicateAccount = response.documents[0];
        const isCurrentNewer = new Date(accountData.$createdAt) > new Date(duplicateAccount.$createdAt);

        console.warn('⚠️ [DUPLICATE KTP] Found duplicate KTP number:', {
          current: accountData.name,
          duplicate: duplicateAccount.name,
          ktpNumber: accountData.ktpNumber,
          shouldDeactivateCurrent: isCurrentNewer
        });

        return {
          hasDuplicate: true,
          duplicateField: 'ktp',
          duplicateAccount,
          shouldDeactivate: isCurrentNewer
        };
      }

      return {
        hasDuplicate: false,
        duplicateField: null,
        duplicateAccount: null,
        shouldDeactivate: false
      };

    } catch (error) {
      console.error('❌ Error checking KTP duplicate:', error);
      throw error;
    }
  },

  /**
   * Deactivate account and notify admin
   */
  async deactivateAccount(
    accountId: string,
    accountType: 'therapist' | 'place',
    reason: string,
    duplicateAccountId: string
  ): Promise<void> {
    try {
      console.log('🚫 [DEACTIVATE] Deactivating account:', accountId, 'Reason:', reason);

      const collectionId = accountType === 'therapist' 
        ? APPWRITE_CONFIG.collections.therapists 
        : APPWRITE_CONFIG.collections.places;

      // Deactivate the account
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        accountId,
        {
          isActive: false,
          status: 'offline',
          deactivationReason: reason,
          deactivatedAt: new Date().toISOString(),
          flaggedForReview: true,
          duplicateAccountId: duplicateAccountId
        }
      );

      // Flag the original account for review too
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        duplicateAccountId,
        {
          flaggedForReview: true,
          hasDuplicateAccount: true,
          duplicateAccountId: accountId
        }
      );

      console.log('✅ [DEACTIVATE] Account deactivated successfully');

    } catch (error) {
      console.error('❌ Error deactivating account:', error);
      throw error;
    }
  },

  /**
   * Send notification to admin about duplicate account
   */
  async notifyAdmin(
    accountData: AccountData,
    duplicateResult: DuplicateCheckResult
  ): Promise<void> {
    try {
      console.log('📧 [ADMIN NOTIFY] Sending duplicate account alert to admin');

      const fieldLabels = {
        bank: 'Bank Account Details',
        whatsapp: 'WhatsApp Number',
        ktp: 'KTP Number'
      };

      const message = `
🚨 DUPLICATE ACCOUNT DETECTED

⚠️ Duplicate Field: ${fieldLabels[duplicateResult.duplicateField!]}

📋 NEWER ACCOUNT (Deactivated):
- Name: ${accountData.name}
- Type: ${accountData.accountType}
- ID: ${accountData.$id}
- Created: ${new Date(accountData.$createdAt).toLocaleString()}

📋 ORIGINAL ACCOUNT (Flagged for Review):
- Name: ${duplicateResult.duplicateAccount.name}
- Type: ${accountData.accountType}
- ID: ${duplicateResult.duplicateAccount.$id}
- Created: ${new Date(duplicateResult.duplicateAccount.$createdAt).toLocaleString()}

🔍 DUPLICATE DETAILS:
${duplicateResult.duplicateField === 'bank' 
  ? `- Bank: ${accountData.bankName}\n- Account: ${accountData.accountNumber}` 
  : ''}
${duplicateResult.duplicateField === 'whatsapp' 
  ? `- WhatsApp: ${accountData.whatsappNumber}` 
  : ''}
${duplicateResult.duplicateField === 'ktp' 
  ? `- KTP: ${accountData.ktpNumber}` 
  : ''}

⚡ ACTION TAKEN:
- Newer account automatically deactivated
- Both accounts flagged for manual review
- Please investigate and take appropriate action

🔗 Review Accounts:
- Admin Dashboard → ${accountData.accountType === 'therapist' ? 'Therapists' : 'Places'}
- Search for flagged accounts
      `.trim();

      // Send notification via Appwrite (create admin notification document)
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications, // Use existing notifications collection
        'unique()',
        {
          type: 'duplicate_account_detected',
          severity: 'high',
          title: '🚨 Duplicate Account Detected',
          message: message,
          accountId: accountData.$id,
          accountType: accountData.accountType,
          duplicateAccountId: duplicateResult.duplicateAccount.$id,
          duplicateField: duplicateResult.duplicateField,
          createdAt: new Date().toISOString(),
          isRead: false,
          targetRole: 'admin' // Admin-only notification
        }
      );

      console.log('✅ [ADMIN NOTIFY] Admin notification sent successfully');

    } catch (error) {
      console.error('❌ Error notifying admin:', error);
      // Don't throw - notification failure shouldn't stop the deactivation
    }
  },

  /**
   * Handle duplicate detection workflow
   */
  async handleDuplicateDetection(
    accountData: AccountData,
    accountType: 'therapist' | 'place'
  ): Promise<void> {
    try {
      // Check for duplicates
      const duplicateResult = await this.checkForDuplicates(accountData, accountType);

      if (duplicateResult.hasDuplicate && duplicateResult.shouldDeactivate) {
        const fieldLabels = {
          bank: 'duplicate bank account details',
          whatsapp: 'duplicate WhatsApp number',
          ktp: 'duplicate KTP number'
        };

        const reason = `Account deactivated automatically due to ${fieldLabels[duplicateResult.duplicateField!]} (matches account ${duplicateResult.duplicateAccount.$id})`;

        // Deactivate the newer account
        await this.deactivateAccount(
          accountData.$id,
          accountType,
          reason,
          duplicateResult.duplicateAccount.$id
        );

        // Notify admin
        await this.notifyAdmin(accountData, duplicateResult);

        console.log('🚫 [DUPLICATE HANDLED] Account deactivated and admin notified');
      }

    } catch (error) {
      console.error('❌ Error handling duplicate detection:', error);
      throw error;
    }
  }
};

export default duplicateAccountDetectionService;

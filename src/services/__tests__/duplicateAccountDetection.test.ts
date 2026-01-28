/**
 * Unit Tests for Duplicate Account Detection Service
 * Testing fraud prevention and account security
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { duplicateAccountDetectionService } from '../duplicateAccountDetection.service';

// Mock Appwrite
vi.mock('../../lib/appwrite', () => ({
  databases: {
    listDocuments: vi.fn(),
    updateDocument: vi.fn()
  }
}));

vi.mock('../../lib/appwrite.config', () => ({
  APPWRITE_CONFIG: {
    databaseId: 'test-db',
    collections: {
      therapists: 'therapists',
      places: 'places',
      notifications: 'notifications'
    }
  }
}));

describe('DuplicateAccountDetectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bank Account Duplicate Detection', () => {
    it('should detect duplicate bank accounts', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock finding duplicate
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [{
          $id: 'existing-therapist-123',
          $createdAt: '2025-01-01T00:00:00.000Z',
          name: 'Existing Therapist',
          bankName: 'BCA',
          accountNumber: '1234567890'
        }]
      });

      const result = await duplicateAccountDetectionService.checkBankDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          bankName: 'BCA',
          accountNumber: '1234567890'
        },
        'therapists'
      );

      expect(result.hasDuplicate).toBe(true);
      expect(result.duplicateAccount.$id).toBe('existing-therapist-123');
    });

    it('should not flag different bank accounts as duplicates', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock no duplicates found
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: []
      });

      const result = await duplicateAccountDetectionService.checkBankDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          bankName: 'BCA',
          accountNumber: '9999999999'
        },
        'therapists'
      );

      expect(result.hasDuplicate).toBe(false);
      expect(result.duplicateAccount).toBeNull();
    });
  });

  describe('WhatsApp Duplicate Detection', () => {
    it('should detect duplicate WhatsApp numbers with different formatting', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      // Mock finding duplicate with different format
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [{
          $id: 'existing-therapist-123',
          $createdAt: '2025-01-01T00:00:00.000Z',
          name: 'Existing Therapist',
          whatsappNumber: '+62 812-3456-7890'
        }]
      });

      const result = await duplicateAccountDetectionService.checkWhatsAppDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          whatsappNumber: '6281234567890' // Same number, different format
        },
        'therapists'
      );

      expect(result.hasDuplicate).toBe(true);
    });
  });

  describe('KTP Duplicate Detection', () => {
    it('should detect duplicate KTP numbers', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [{
          $id: 'existing-therapist-123',
          $createdAt: '2025-01-01T00:00:00.000Z',
          name: 'Existing Therapist',
          ktpNumber: '1234567890123456'
        }]
      });

      const result = await duplicateAccountDetectionService.checkKTPDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          ktpNumber: '1234567890123456'
        },
        'therapists'
      );

      expect(result.hasDuplicate).toBe(true);
    });
  });

  describe('Account Deactivation', () => {
    it('should deactivate duplicate account with proper metadata', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      (databases.updateDocument as any).mockResolvedValue({
        $id: 'new-therapist-456',
        isActive: false
      });

      await duplicateAccountDetectionService.deactivateAccount(
        'new-therapist-456',
        'therapist',
        'Duplicate bank account detected',
        'existing-therapist-123'
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'therapists',
        'new-therapist-456',
        expect.objectContaining({
          isActive: false,
          deactivationReason: 'Duplicate bank account detected',
          duplicateAccountId: 'existing-therapist-123'
        })
      );
    });
  });

  describe('Admin Notifications', () => {
    it('should create high-priority notification for admin', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      (databases.createDocument as any).mockResolvedValueOnce({
        $id: 'notification-123',
        type: 'duplicate_account_detected'
      });

      const accountData = {
        $id: 'new-therapist-456',
        $createdAt: '2025-01-02T00:00:00.000Z',
        name: 'Jane Smith',
        accountType: 'therapist' as const,
        bankName: 'BCA',
        accountNumber: '1234567890'
      };

      const duplicateResult = {
        hasDuplicate: true,
        duplicateField: 'bank' as const,
        duplicateAccount: {
          $id: 'existing-therapist-123',
          $createdAt: '2025-01-01T00:00:00.000Z',
          name: 'John Doe',
          bankName: 'BCA',
          accountNumber: '1234567890'
        },
        shouldDeactivate: true
      };

      await duplicateAccountDetectionService.notifyAdmin(
        accountData,
        duplicateResult
      );

      expect(databases.createDocument).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty/null values gracefully', async () => {
      const result1 = await duplicateAccountDetectionService.checkBankDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          bankName: '',
          accountNumber: ''
        },
        'therapists'
      );
      expect(result1.hasDuplicate).toBe(false);

      const result2 = await duplicateAccountDetectionService.checkWhatsAppDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          whatsappNumber: ''
        },
        'therapists'
      );
      expect(result2.hasDuplicate).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const { databases } = await import('../../lib/appwrite');
      
      (databases.listDocuments as any).mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(duplicateAccountDetectionService.checkBankDuplicate(
        {
          $id: 'new-therapist-456',
          $createdAt: '2025-01-02T00:00:00.000Z',
          name: 'New Therapist',
          accountType: 'therapist',
          bankName: 'BCA',
          accountNumber: '1234567890'
        },
        'therapists'
      )).rejects.toThrow('Database connection failed');
    });
  });
});
